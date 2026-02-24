/**
 * Import all MDX guide files into the database as version 1.
 *
 * Usage:
 *   npx tsx scripts/import-guides.ts
 *
 * Loads .env.local automatically for DB credentials.
 */

import fs from 'fs';
import path from 'path';

// Load .env.local (Next.js doesn't do this for standalone scripts)
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}
import matter from 'gray-matter';
import sql from 'mssql';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'games');

async function main() {
  const config: sql.config = {
    server: process.env.DB_SERVER || '',
    database: process.env.DB_DATABASE || '',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    options: {
      encrypt: true,
      trustServerCertificate: false,
    },
  };

  if (!config.server || !config.database || !config.user || !config.password) {
    console.error('Missing required environment variables: DB_SERVER, DB_DATABASE, DB_USER, DB_PASSWORD');
    process.exit(1);
  }

  const pool = await new sql.ConnectionPool(config).connect();
  console.log('Connected to database');

  // Ensure a "System" user exists for the import
  let systemUserResult = await pool.request()
    .query<{ Id: string }>(`SELECT Id FROM ltp.Users WHERE Email = 'system@learntoplay.local'`);

  let systemUserId: string;
  if (systemUserResult.recordset.length === 0) {
    const insertResult = await pool.request()
      .query<{ Id: string }>(`
        INSERT INTO ltp.Users (Email, DisplayName, Roles)
        OUTPUT INSERTED.Id
        VALUES ('system@learntoplay.local', 'System', '["admin"]')
      `);
    systemUserId = insertResult.recordset[0].Id;
    console.log('Created System user:', systemUserId);
  } else {
    systemUserId = systemUserResult.recordset[0].Id;
    console.log('Using existing System user:', systemUserId);
  }

  // Read all MDX files
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.mdx'));
  console.log(`Found ${files.length} MDX files`);

  for (const filename of files) {
    const slug = filename.replace(/\.mdx$/, '');
    const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), 'utf-8');
    const { data, content } = matter(raw);

    // Check if already imported
    const existing = await pool.request()
      .input('slug', sql.NVarChar, slug)
      .query<{ Id: string }>(`SELECT Id FROM ltp.GuideVersions WHERE Slug = @slug`);

    if (existing.recordset.length > 0) {
      console.log(`  Skipping ${slug} (already has ${existing.recordset.length} version(s))`);
      continue;
    }

    await pool.request()
      .input('slug', sql.NVarChar, slug)
      .input('content', sql.NVarChar, content)
      .input('frontmatterJson', sql.NVarChar, JSON.stringify(data))
      .input('editedByUserId', sql.UniqueIdentifier, systemUserId)
      .input('editSummary', sql.NVarChar, 'Initial import from MDX file')
      .query(`
        INSERT INTO ltp.GuideVersions
          (Slug, VersionNumber, Content, FrontmatterJson, EditedByUserId, EditSummary, IsPublished, IsCurrent)
        VALUES (@slug, 1, @content, @frontmatterJson, @editedByUserId, @editSummary, 1, 1)
      `);

    console.log(`  Imported ${slug}`);
  }

  await pool.close();
  console.log('Done');
}

main().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
