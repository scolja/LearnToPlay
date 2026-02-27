import { marked } from 'marked';
import type { ContentBlock, NoteCard, GuideSection, RenderedSection, SequenceSortItem, ErrorStatement, ScenarioChoice, MatchPair } from './types';

// ---------------------------------------------------------------------------
// Pre-process custom syntax before feeding to marked
// ---------------------------------------------------------------------------

export function preprocessTokens(markdown: string): string {
  let result = markdown;

  // Special: [?]{.die} → <span class="die die-challenge">?</span>
  result = result.replace(
    /\[\?\]\{\.die\}/g,
    '<span class="die die-challenge">?</span>'
  );

  // Special: [boost]{.boost} → <span class="boost"></span>
  result = result.replace(
    /\[boost\]\{\.boost\}/g,
    '<span class="boost"></span>'
  );

  // Generic: [text]{.class-variant} → <span class="parent class-variant">text</span>
  // If class contains a hyphen and the prefix is 2–3 chars, auto-add parent class
  // e.g. [Move]{.sk-move} → <span class="sk sk-move">Move</span>
  //      [KILL]{.act-kill} → <span class="act act-kill">KILL</span>
  //      [☠]{.corpse}     → <span class="corpse">☠</span>
  //      [WYDELL]{.wydell-badge} → <span class="wydell-badge">WYDELL</span>
  result = result.replace(
    /\[([^\]]*)\]\{\.([\w-]+)\}/g,
    (_, text, cls) => {
      const hyphenIdx = cls.indexOf('-');
      if (hyphenIdx > 0) {
        const prefix = cls.substring(0, hyphenIdx);
        if (prefix.length >= 2 && prefix.length <= 3) {
          return `<span class="${prefix} ${cls}">${text}</span>`;
        }
      }
      return `<span class="${cls}">${text}</span>`;
    }
  );

  return result;
}

// ---------------------------------------------------------------------------
// Parse markdown content into content blocks
// ---------------------------------------------------------------------------

function parseContentBlocks(
  markdown: string,
  displayData: Record<string, unknown> | null
): ContentBlock[] {
  const blocks: ContentBlock[] = [];

  // Split on directive markers: :::type\n...\n:::
  // The \n? before closing ::: handles empty-body directives like :::quiz\n:::
  const parts = markdown.split(/(:::[\w-]+\n[\s\S]*?\n?:::)/);

  let diagramIdx = 0;
  let flowIdx = 0;
  let styledHtmlIdx = 0;
  let gridVisualIdx = 0;

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Check if this is a directive
    const directiveMatch = trimmed.match(/^:::([\w-]+)\n?([\s\S]*?):::$/);
    if (directiveMatch) {
      const directiveType = directiveMatch[1];

      switch (directiveType) {
        case 'callout':
        case 'callout-danger': {
          const content = directiveMatch[2].trim();
          const html = marked.parse(preprocessTokens(content)) as string;
          blocks.push({
            type: 'callout',
            html,
            style: directiveType === 'callout-danger' ? 'danger' : 'info',
          });
          break;
        }
        case 'table': {
          const table = displayData?.table as { headers: string[]; rows: string[][] } | undefined;
          if (table) {
            blocks.push({ type: 'table', headers: table.headers, rows: table.rows });
          }
          break;
        }
        case 'quiz': {
          if (displayData?.quiz) {
            blocks.push({
              type: 'quiz',
              questions: displayData.quiz as { question: string; options: { text: string; correct: boolean }[]; correctFeedback: string; incorrectFeedback: string }[],
            });
          }
          break;
        }
        case 'flow': {
          const flows = displayData?.flows as string[][] | undefined;
          if (flows && flows[flowIdx]) {
            blocks.push({ type: 'flow', items: flows[flowIdx] });
            flowIdx++;
          } else {
            // Fallback: parse from the directive content
            const content = directiveMatch[2].trim();
            if (content) {
              blocks.push({ type: 'flow', items: content.split(' → ') });
            }
          }
          break;
        }
        case 'diagram': {
          const diagrams = displayData?.diagrams as string[] | undefined;
          if (diagrams && diagrams[diagramIdx]) {
            blocks.push({ type: 'diagram', svg: diagrams[diagramIdx] });
            diagramIdx++;
          }
          break;
        }
        case 'strip': {
          const strip = displayData?.strip as { num: number; label: string }[] | undefined;
          if (strip) {
            blocks.push({ type: 'strip', items: strip });
          }
          break;
        }
        case 'dice-roller': {
          blocks.push({ type: 'dice-roller' });
          break;
        }
        case 'grid-visual': {
          const gridBlocks = displayData?.gridVisuals as string[] | undefined;
          if (gridBlocks && gridBlocks[gridVisualIdx]) {
            blocks.push({ type: 'grid-visual', html: gridBlocks[gridVisualIdx] });
            gridVisualIdx++;
          }
          break;
        }
        case 'styled-block':
        case 'html-block': {
          const styledBlocks = displayData?.htmlBlocks as string[] | undefined;
          if (styledBlocks && styledBlocks[styledHtmlIdx]) {
            blocks.push({ type: 'styled-html', html: styledBlocks[styledHtmlIdx] });
            styledHtmlIdx++;
          }
          break;
        }
        case 'sequence-sort': {
          const data = displayData?.sequenceSort as { title?: string; description?: string; items: SequenceSortItem[]; explanation?: string } | undefined;
          if (data?.items) {
            blocks.push({ type: 'sequence-sort', title: data.title, description: data.description, items: data.items, explanation: data.explanation });
          }
          break;
        }
        case 'spot-the-error': {
          const data = displayData?.spotTheError as { title?: string; scenario: string; statements: ErrorStatement[] } | undefined;
          if (data?.statements) {
            blocks.push({ type: 'spot-the-error', title: data.title, scenario: data.scenario, statements: data.statements });
          }
          break;
        }
        case 'scenario-challenge': {
          const data = displayData?.scenarioChallenge as { title?: string; scenario: string; choices: ScenarioChoice[] } | undefined;
          if (data?.choices) {
            blocks.push({ type: 'scenario-challenge', title: data.title, scenario: data.scenario, choices: data.choices });
          }
          break;
        }
        case 'match-up': {
          const data = displayData?.matchUp as { title?: string; description?: string; pairs: MatchPair[]; explanation?: string } | undefined;
          if (data?.pairs) {
            blocks.push({ type: 'match-up', title: data.title, description: data.description, pairs: data.pairs, explanation: data.explanation });
          }
          break;
        }
        default:
          // Unknown directive — render as plain markdown
          blocks.push({
            type: 'html',
            html: marked.parse(preprocessTokens(trimmed)) as string,
          });
      }
    } else {
      // Regular markdown content
      const processed = preprocessTokens(trimmed);
      const html = marked.parse(processed) as string;
      if (html.trim()) {
        blocks.push({ type: 'html', html });
      }
    }
  }

  return blocks;
}

// ---------------------------------------------------------------------------
// Parse sidebar notes into NoteCards
// ---------------------------------------------------------------------------

function parseNotes(notesMarkdown: string | null): NoteCard[] {
  if (!notesMarkdown) return [];

  const cards: NoteCard[] = [];
  const sections = notesMarkdown.split(/\n---\n/);

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    // Parse header: **[color] Label**
    const headerMatch = trimmed.match(/^\*\*\[(\w+)\]\s+(.+?)\*\*/);
    if (headerMatch) {
      const color = headerMatch[1];
      const label = headerMatch[2];
      const body = trimmed.substring(headerMatch[0].length).trim();
      const html = marked.parse(preprocessTokens(body)) as string;
      cards.push({ label, color, html });
    } else {
      // No header — treat as unlabeled note
      const html = marked.parse(preprocessTokens(trimmed)) as string;
      cards.push({ label: 'Note', color: 'gold', html });
    }
  }

  return cards;
}

// ---------------------------------------------------------------------------
// Public API: render a full section
// ---------------------------------------------------------------------------

export function renderSection(section: GuideSection): RenderedSection {
  return {
    id: section.id,
    sortOrder: section.sortOrder,
    title: section.title,
    blocks: parseContentBlocks(section.content, section.displayData),
    notes: parseNotes(section.notes),
  };
}

export function renderAllSections(sections: GuideSection[]): RenderedSection[] {
  return sections.map(renderSection);
}
