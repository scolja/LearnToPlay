/**
 * Convert the Vantage MDX guide from GuideVersions into the new
 * section-based schema (Guides + GuideSections + GlossaryEntries).
 *
 * This script:
 *   1. Reads the current Vantage guide from ltp.GuideVersions
 *   2. Parses frontmatter JSON into ltp.Guides row
 *   3. Splits the MDX content into StepRow blocks
 *   4. For each block, extracts:
 *      - Title (from StepRow props)
 *      - Main content (markdown between StepRow tags, minus sidebar/components)
 *      - Notes (from SideCard blocks → converted to markdown)
 *      - DisplayData JSON (for structured elements: quizzes, tables, flows, SVGs)
 *   5. Inserts everything into the new tables
 *   6. Migrates glossary entries from frontmatter JSON
 */

const sql = require('mssql');
const config = {
  server: 'scolarodb.database.windows.net',
  database: 'BGOTY',
  user: 'bgotyadmin',
  password: 'BoardGameOfTheYear2024!',
  options: { encrypt: true, trustServerCertificate: false },
};

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

/**
 * Split MDX content into StepRow blocks.
 * Returns array of { title, step, fullWidth, sidebarRaw, bodyRaw }
 */
function splitIntoStepRows(content) {
  const sections = [];
  // Match <StepRow ...> to </StepRow>
  const stepRowRegex = /<StepRow\s([^>]*(?:sidebar=\{<>[\s\S]*?<\/>\})?\s*)>([\s\S]*?)<\/StepRow>/g;

  // Simpler approach: split by </StepRow> and parse each chunk
  const chunks = content.split('</StepRow>').filter(c => c.includes('<StepRow'));

  for (const chunk of chunks) {
    const stepRowStart = chunk.indexOf('<StepRow');
    const raw = chunk.substring(stepRowStart);

    // Extract props from the opening tag
    const titleMatch = raw.match(/title="([^"]+)"/);
    const stepMatch = raw.match(/step=\{(\d+)\}/);
    const fullWidth = raw.includes('fullWidth');

    // Extract sidebar content (between sidebar={<> and <>})
    let sidebarRaw = '';
    const sidebarMatch = raw.match(/sidebar=\{<>([\s\S]*?)<\/>\}/);
    if (sidebarMatch) {
      sidebarRaw = sidebarMatch[1].trim();
    }

    // Extract body content (after the closing > of StepRow opening tag)
    let bodyRaw = '';
    // Find where the opening tag ends
    if (sidebarMatch) {
      // Body starts after the sidebar={<>...</>}>
      const sidebarEnd = raw.indexOf(sidebarMatch[0]) + sidebarMatch[0].length;
      // Find the closing > after sidebar
      const closingBracket = raw.indexOf('>', sidebarEnd);
      bodyRaw = raw.substring(closingBracket + 1).trim();
    } else {
      // No sidebar — find first > after <StepRow
      const tagEnd = raw.indexOf('>');
      bodyRaw = raw.substring(tagEnd + 1).trim();
    }

    sections.push({
      title: titleMatch ? titleMatch[1] : null,
      step: stepMatch ? parseInt(stepMatch[1]) : null,
      fullWidth,
      sidebarRaw,
      bodyRaw,
    });
  }

  return sections;
}

/**
 * Convert SideCard JSX blocks to markdown notes.
 * Each SideCard becomes a labeled section in markdown.
 */
function parseSidebarToMarkdown(sidebarRaw) {
  if (!sidebarRaw) return null;

  const cards = [];
  const cardRegex = /<SideCard\s+label="([^"]+)"\s+color="([^"]+)">([\s\S]*?)<\/SideCard>/g;
  let match;

  while ((match = cardRegex.exec(sidebarRaw)) !== null) {
    const label = match[1];
    const color = match[2];
    let content = match[3].trim();

    // Convert HTML tags to markdown
    content = htmlToMarkdown(content);

    cards.push({ label, color, content });
  }

  if (cards.length === 0) return null;

  // Format as markdown with metadata hints
  return cards.map(c => `**[${c.color}] ${c.label}**\n\n${c.content}`).join('\n\n---\n\n');
}

/**
 * Convert simple HTML to markdown.
 */
function htmlToMarkdown(html) {
  return html
    .replace(/<p>/g, '')
    .replace(/<\/p>/g, '\n\n')
    .replace(/<strong>/g, '**')
    .replace(/<\/strong>/g, '**')
    .replace(/<em>/g, '*')
    .replace(/<\/em>/g, '*')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extract structured display data from the body content.
 * Returns { cleanedMarkdown, displayData }
 */
function extractDisplayData(bodyRaw) {
  let markdown = bodyRaw;
  const displayData = {};

  // --- Extract RuleBox blocks → callouts in DisplayData ---
  const ruleBoxes = [];
  markdown = markdown.replace(/<RuleBox(\s+danger)?>([\s\S]*?)<\/RuleBox>/g, (_, danger, content) => {
    const idx = ruleBoxes.length;
    ruleBoxes.push({
      style: danger ? 'danger' : 'info',
      content: content.trim(),
    });
    // Leave a placeholder in the markdown
    return `\n\n:::callout${danger ? '-danger' : ''}\n${content.trim()}\n:::\n\n`;
  });
  if (ruleBoxes.length > 0) {
    displayData.callouts = ruleBoxes;
  }

  // --- Extract GameTable → table in DisplayData ---
  const tableMatch = markdown.match(/<GameTable\s+([\s\S]*?)\/>/);
  if (tableMatch) {
    try {
      const propsStr = tableMatch[1];
      const headersMatch = propsStr.match(/headers=\{(\[[\s\S]*?\])}/);
      const rowsMatch = propsStr.match(/rows=\{(\[[\s\S]*?\])}/);
      if (headersMatch && rowsMatch) {
        displayData.table = {
          headers: JSON.parse(headersMatch[1]),
          rows: JSON.parse(rowsMatch[1]),
        };
      }
    } catch (e) {
      // If parsing fails, leave as-is
    }
    markdown = markdown.replace(/<GameTable[\s\S]*?\/>/, '\n\n:::table\n:::\n\n');
  }

  // --- Extract KnowledgeCheck → quiz in DisplayData ---
  const quizMatch = markdown.match(/<KnowledgeCheck\s+questions=\{([\s\S]*?)\}\s*\/>/);
  if (quizMatch) {
    try {
      // The quiz JSON uses JS object syntax, need to handle it
      const quizStr = quizMatch[1];
      // Use eval-like approach via Function (safe here — we control the input)
      const questions = new Function('return ' + quizStr)();
      displayData.quiz = questions;
    } catch (e) {
      // Fallback: store raw
      displayData.quizRaw = quizMatch[1];
    }
    markdown = markdown.replace(/<KnowledgeCheck[\s\S]*?\/>/, '\n\n:::quiz\n:::\n\n');
  }

  // --- Extract RawHTML blocks ---
  const svgs = [];
  const htmlBlocks = [];
  markdown = markdown.replace(/<RawHTML\s+html=\{`([\s\S]*?)`\}\s*\/>/g, (_, html) => {
    if (html.includes('<svg')) {
      svgs.push(html.trim());
      return `\n\n:::diagram\n:::\n\n`;
    } else if (html.includes('class="flow"') || html.includes('class=\\"flow\\"')) {
      // Flow diagram
      const flowLabels = [];
      const fbRegex = /class="fb[^"]*"[^>]*>([^<]+)</g;
      let fm;
      while ((fm = fbRegex.exec(html)) !== null) {
        flowLabels.push(fm[1].trim());
      }
      if (flowLabels.length > 0) {
        if (!displayData.flows) displayData.flows = [];
        displayData.flows.push(flowLabels);
        return `\n\n:::flow\n${flowLabels.join(' → ')}\n:::\n\n`;
      }
      htmlBlocks.push(html.trim());
      return `\n\n:::html-block\n:::\n\n`;
    } else if (html.includes('class="grid-vis"')) {
      htmlBlocks.push(html.trim());
      return `\n\n:::grid-visual\n:::\n\n`;
    } else if (html.includes('class="turn-strip"')) {
      // Turn strip
      const stripItems = [];
      const tsRegex = /<div class="ts"><span class="ts-num">(\d+)<\/span>([^<]+)<\/div>/g;
      let tsm;
      while ((tsm = tsRegex.exec(html)) !== null) {
        stripItems.push({ num: parseInt(tsm[1]), label: tsm[2].trim() });
      }
      if (stripItems.length > 0) {
        displayData.strip = stripItems;
        return `\n\n:::strip\n:::\n\n`;
      }
      htmlBlocks.push(html.trim());
      return `\n\n:::html-block\n:::\n\n`;
    } else {
      // Generic styled HTML block (summaries, setup-at-a-glance, etc.)
      htmlBlocks.push(html.trim());
      return `\n\n:::styled-block\n:::\n\n`;
    }
  });

  if (svgs.length > 0) displayData.diagrams = svgs;
  if (htmlBlocks.length > 0) displayData.htmlBlocks = htmlBlocks;

  // --- Extract Footnotes → sources in DisplayData ---
  const footnotesMatch = markdown.match(/<Footnotes\s+entries=\{([\s\S]*?)\}\s*\/>/);
  if (footnotesMatch) {
    try {
      const entries = new Function('return ' + footnotesMatch[1])();
      displayData.footnotes = entries;
    } catch (e) {
      displayData.footnotesRaw = footnotesMatch[1];
    }
    markdown = markdown.replace(/<Footnotes[\s\S]*?\/>/, '');
  }

  // --- Extract DiceRoller → interactive element hint ---
  if (markdown.includes('<DiceRoller')) {
    displayData.interactive = displayData.interactive || [];
    displayData.interactive.push('dice-roller');
    markdown = markdown.replace(/<DiceRoller\s*\/>/, '\n\n:::dice-roller\n:::\n\n');
  }

  // --- Clean up inline JSX spans → markdown-friendly tokens ---
  // Convert <span className="sk sk-move">Move</span> → [Move]{.sk-move}
  markdown = markdown.replace(/<span\s+className="sk\s+sk-(\w+)">(\w+)<\/span>/g, '[$2]{.sk-$1}');

  // Convert tracker spans
  markdown = markdown.replace(/<span\s+className="tr\s+tr-(\w+)">(.*?)<\/span>/g, '[$2]{.tr-$1}');

  // Convert boost spans
  markdown = markdown.replace(/<span\s+className="boost"><\/span>/g, '[boost]{.boost}');

  // Convert die spans
  markdown = markdown.replace(/<span\s+className="die die-challenge">\?<\/span>/g, '[?]{.die}');

  // Clean up sup tags (keep as-is — markdown renderers handle them)
  // markdown already has <sup> tags which is fine

  // Clean up JSX style expressions
  markdown = markdown.replace(/<p\s+style=\{\{[^}]*\}\}>([\s\S]*?)<\/p>/g, '\n\n$1\n\n');

  // Clean whitespace
  markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

  return {
    cleanedMarkdown: markdown,
    displayData: Object.keys(displayData).length > 0 ? displayData : null,
  };
}

// ---------------------------------------------------------------------------
// Main conversion
// ---------------------------------------------------------------------------
async function main() {
  const pool = await sql.connect(config);

  // 1. Read current Vantage guide
  console.log('Reading Vantage guide from GuideVersions...');
  const guideResult = await pool.request()
    .input('slug', sql.NVarChar, 'vantage')
    .query('SELECT Content, FrontmatterJson FROM ltp.GuideVersions WHERE Slug = @slug AND IsCurrent = 1');

  const { Content: mdxContent, FrontmatterJson: fmJson } = guideResult.recordset[0];
  const frontmatter = JSON.parse(fmJson);

  console.log(`Content length: ${mdxContent.length} chars`);
  console.log(`Glossary entries: ${frontmatter.glossary?.length || 0}`);

  // 2. Insert into ltp.Guides
  console.log('\nInserting guide metadata...');
  const guideInsert = await pool.request()
    .input('slug', sql.NVarChar, frontmatter.slug)
    .input('title', sql.NVarChar, frontmatter.title)
    .input('subtitle', sql.NVarChar, frontmatter.subtitle || null)
    .input('designer', sql.NVarChar, frontmatter.designer)
    .input('artist', sql.NVarChar, frontmatter.artist || null)
    .input('publisher', sql.NVarChar, frontmatter.publisher)
    .input('publisherUrl', sql.NVarChar, frontmatter.publisherUrl || null)
    .input('year', sql.Int, frontmatter.year)
    .input('players', sql.NVarChar, frontmatter.players)
    .input('time', sql.NVarChar, frontmatter.time)
    .input('age', sql.NVarChar, frontmatter.age)
    .input('bggUrl', sql.NVarChar, frontmatter.bggUrl || null)
    .input('heroGradient', sql.NVarChar, frontmatter.heroGradient || null)
    .input('heroImage', sql.NVarChar, frontmatter.heroImage || null)
    .query(`
      INSERT INTO ltp.Guides (Slug, Title, Subtitle, Designer, Artist, Publisher, PublisherUrl, Year, Players, Time, Age, BggUrl, HeroGradient, HeroImage)
      OUTPUT INSERTED.Id
      VALUES (@slug, @title, @subtitle, @designer, @artist, @publisher, @publisherUrl, @year, @players, @time, @age, @bggUrl, @heroGradient, @heroImage)
    `);

  const guideId = guideInsert.recordset[0].Id;
  console.log(`Guide created: ${guideId}`);

  // 3. Split content into sections
  console.log('\nParsing StepRow sections...');
  const sections = splitIntoStepRows(mdxContent);
  console.log(`Found ${sections.length} sections`);

  // 4. Process and insert each section
  const sectionIds = {}; // step number → section ID (for glossary linking)

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const sortOrder = (i + 1) * 10; // Leave gaps for future insertions

    // Parse sidebar to markdown notes
    const notes = parseSidebarToMarkdown(section.sidebarRaw);

    // Extract structured data from body
    const { cleanedMarkdown, displayData } = extractDisplayData(section.bodyRaw);

    const sectionInsert = await pool.request()
      .input('guideId', sql.UniqueIdentifier, guideId)
      .input('sortOrder', sql.Int, sortOrder)
      .input('title', sql.NVarChar, section.title)
      .input('content', sql.NVarChar, cleanedMarkdown)
      .input('notes', sql.NVarChar, notes)
      .input('displayData', sql.NVarChar, displayData ? JSON.stringify(displayData) : null)
      .query(`
        INSERT INTO ltp.GuideSections (GuideId, SortOrder, Title, Content, Notes, DisplayData)
        OUTPUT INSERTED.Id
        VALUES (@guideId, @sortOrder, @title, @content, @notes, @displayData)
      `);

    const sectionId = sectionInsert.recordset[0].Id;
    if (section.step) {
      sectionIds[section.step] = sectionId;
    }

    const notesPreview = notes ? notes.substring(0, 50) + '...' : '(none)';
    const ddKeys = displayData ? Object.keys(displayData).join(', ') : '(none)';
    console.log(`  [${sortOrder}] ${section.step ? 'Step ' + section.step + ': ' : ''}${section.title || '(untitled)'}`);
    console.log(`       Content: ${cleanedMarkdown.length} chars | Notes: ${notesPreview} | DisplayData: ${ddKeys}`);
  }

  // 5. Migrate glossary entries
  if (frontmatter.glossary && frontmatter.glossary.length > 0) {
    console.log(`\nMigrating ${frontmatter.glossary.length} glossary entries...`);

    for (let i = 0; i < frontmatter.glossary.length; i++) {
      const entry = frontmatter.glossary[i];

      // Link to section by step number
      const stepMatch = entry.step?.match(/Step\s+(\d+)/i);
      const linkedSectionId = stepMatch ? sectionIds[parseInt(stepMatch[1])] || null : null;

      await pool.request()
        .input('guideId', sql.UniqueIdentifier, guideId)
        .input('sectionId', sql.UniqueIdentifier, linkedSectionId)
        .input('term', sql.NVarChar, entry.term)
        .input('definition', sql.NVarChar, entry.definition)
        .input('searchTerms', sql.NVarChar, entry.searchTerms || null)
        .input('groupName', sql.NVarChar, entry.group || null)
        .input('sortOrder', sql.Int, i)
        .query(`
          INSERT INTO ltp.GlossaryEntries (GuideId, SectionId, Term, Definition, SearchTerms, GroupName, SortOrder)
          VALUES (@guideId, @sectionId, @term, @definition, @searchTerms, @groupName, @sortOrder)
        `);
    }
    console.log(`  Migrated ${frontmatter.glossary.length} glossary entries`);
  }

  // 6. Verify
  console.log('\n=== VERIFICATION ===');
  const sectionCount = await pool.request()
    .input('guideId', sql.UniqueIdentifier, guideId)
    .query('SELECT COUNT(*) as cnt FROM ltp.GuideSections WHERE GuideId = @guideId');
  console.log(`Sections: ${sectionCount.recordset[0].cnt}`);

  const glossaryCount = await pool.request()
    .input('guideId', sql.UniqueIdentifier, guideId)
    .query('SELECT COUNT(*) as cnt FROM ltp.GlossaryEntries WHERE GuideId = @guideId');
  console.log(`Glossary entries: ${glossaryCount.recordset[0].cnt}`);

  // Show a sample section
  const sample = await pool.request()
    .input('guideId', sql.UniqueIdentifier, guideId)
    .query('SELECT TOP 1 Title, LEFT(Content, 200) as ContentPreview, LEFT(Notes, 200) as NotesPreview, LEFT(DisplayData, 200) as DDPreview FROM ltp.GuideSections WHERE GuideId = @guideId ORDER BY SortOrder');
  console.log('\nSample section (first):');
  console.log(JSON.stringify(sample.recordset[0], null, 2));

  await pool.close();
  console.log('\nDone!');
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
