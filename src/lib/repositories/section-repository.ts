import { getPool, sql } from '../db';
import type { GuideMeta, GuideSection, DbGlossaryEntry } from '../types';

// ---------------------------------------------------------------------------
// Guide metadata
// ---------------------------------------------------------------------------

export async function getGuideBySlug(slug: string): Promise<GuideMeta | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('slug', sql.NVarChar, slug)
    .query<GuideMeta>(`
      SELECT g.Id as id, g.Slug as slug, g.Title as title, g.Subtitle as subtitle,
             g.Designer as designer, g.Artist as artist, g.Publisher as publisher,
             g.PublisherUrl as publisherUrl, g.Year as year, g.Players as players,
             g.Time as time, g.Age as age, g.BggUrl as bggUrl,
             g.HeroGradient as heroGradient, g.HeroImage as heroImage,
             g.CustomCss as customCss, g.CreatedAt as createdAt,
             ISNULL(s.sectionCount, 0) as sectionCount,
             ISNULL(CEILING(s.totalChars / 5.0 / 325.0), 0) as readMinutes
      FROM ltp.Guides g
      LEFT JOIN (
        SELECT GuideId,
               COUNT(*) as sectionCount,
               SUM(LEN(Content) + LEN(ISNULL(Notes, ''))) as totalChars
        FROM ltp.GuideSections
        WHERE IsActive = 1
        GROUP BY GuideId
      ) s ON g.Id = s.GuideId
      WHERE g.Slug = @slug AND g.IsDraft = 0
    `);
  return result.recordset[0] ?? null;
}

export async function getAllGuides(): Promise<GuideMeta[]> {
  const pool = await getPool();
  const result = await pool.request()
    .query<GuideMeta>(`
      SELECT g.Id as id, g.Slug as slug, g.Title as title, g.Subtitle as subtitle,
             g.Designer as designer, g.Artist as artist, g.Publisher as publisher,
             g.PublisherUrl as publisherUrl, g.Year as year, g.Players as players,
             g.Time as time, g.Age as age, g.BggUrl as bggUrl,
             g.HeroGradient as heroGradient, g.HeroImage as heroImage,
             g.CustomCss as customCss, g.CreatedAt as createdAt,
             ISNULL(s.sectionCount, 0) as sectionCount,
             ISNULL(CEILING(s.totalChars / 5.0 / 325.0), 0) as readMinutes
      FROM ltp.Guides g
      LEFT JOIN (
        SELECT GuideId,
               COUNT(*) as sectionCount,
               SUM(LEN(Content) + LEN(ISNULL(Notes, ''))) as totalChars
        FROM ltp.GuideSections
        WHERE IsActive = 1
        GROUP BY GuideId
      ) s ON g.Id = s.GuideId
      WHERE g.IsDraft = 0
      ORDER BY g.CreatedAt DESC, g.Title
    `);
  return result.recordset;
}

// ---------------------------------------------------------------------------
// Guide sections
// ---------------------------------------------------------------------------

export async function getSectionsByGuideSlug(slug: string): Promise<GuideSection[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('slug', sql.NVarChar, slug)
    .query<{
      id: string; guideId: string; sortOrder: number; title: string | null;
      content: string; notes: string | null; displayData: string | null;
      versionNumber: number;
    }>(`
      SELECT gs.Id as id, gs.GuideId as guideId, gs.SortOrder as sortOrder,
             gs.Title as title, gs.Content as content, gs.Notes as notes,
             gs.DisplayData as displayData, gs.VersionNumber as versionNumber
      FROM ltp.GuideSections gs
      JOIN ltp.Guides g ON gs.GuideId = g.Id
      WHERE g.Slug = @slug AND gs.IsActive = 1
      ORDER BY gs.SortOrder
    `);
  return result.recordset.map(row => ({
    ...row,
    displayData: row.displayData ? JSON.parse(row.displayData) : null,
  }));
}

export async function getSectionById(sectionId: string): Promise<GuideSection | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, sectionId)
    .query<{
      id: string; guideId: string; sortOrder: number; title: string | null;
      content: string; notes: string | null; displayData: string | null;
      versionNumber: number;
    }>(`
      SELECT Id as id, GuideId as guideId, SortOrder as sortOrder,
             Title as title, Content as content, Notes as notes,
             DisplayData as displayData, VersionNumber as versionNumber
      FROM ltp.GuideSections
      WHERE Id = @id
    `);
  if (!result.recordset[0]) return null;
  const row = result.recordset[0];
  return {
    ...row,
    displayData: row.displayData ? JSON.parse(row.displayData) : null,
  };
}

export async function updateSection(params: {
  sectionId: string;
  title?: string | null;
  content: string;
  notes?: string | null;
  displayData?: Record<string, unknown> | null;
  editedByUserId: string;
  editSummary?: string;
}): Promise<GuideSection> {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, params.sectionId)
    .input('title', sql.NVarChar, params.title ?? null)
    .input('content', sql.NVarChar, params.content)
    .input('notes', sql.NVarChar, params.notes ?? null)
    .input('displayData', sql.NVarChar, params.displayData ? JSON.stringify(params.displayData) : null)
    .input('editedByUserId', sql.UniqueIdentifier, params.editedByUserId)
    .input('editSummary', sql.NVarChar, params.editSummary ?? null)
    .query<{
      id: string; guideId: string; sortOrder: number; title: string | null;
      content: string; notes: string | null; displayData: string | null;
      versionNumber: number;
    }>(`
      UPDATE ltp.GuideSections
      SET Title = @title,
          Content = @content,
          Notes = @notes,
          DisplayData = @displayData,
          VersionNumber = VersionNumber + 1,
          EditedByUserId = @editedByUserId,
          EditSummary = @editSummary,
          EditedAt = GETUTCDATE()
      OUTPUT INSERTED.Id as id, INSERTED.GuideId as guideId,
             INSERTED.SortOrder as sortOrder, INSERTED.Title as title,
             INSERTED.Content as content, INSERTED.Notes as notes,
             INSERTED.DisplayData as displayData,
             INSERTED.VersionNumber as versionNumber
      WHERE Id = @id
    `);
  const row = result.recordset[0];
  return {
    ...row,
    displayData: row.displayData ? JSON.parse(row.displayData) : null,
  };
}

// ---------------------------------------------------------------------------
// Glossary
// ---------------------------------------------------------------------------

export async function getGlossaryByGuideSlug(slug: string): Promise<DbGlossaryEntry[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('slug', sql.NVarChar, slug)
    .query<DbGlossaryEntry>(`
      SELECT ge.Id as id, ge.GuideId as guideId, ge.SectionId as sectionId,
             ge.Term as term, ge.Definition as definition,
             ge.SearchTerms as searchTerms, ge.GroupName as groupName,
             ge.SortOrder as sortOrder
      FROM ltp.GlossaryEntries ge
      JOIN ltp.Guides g ON ge.GuideId = g.Id
      WHERE g.Slug = @slug
      ORDER BY ge.SortOrder
    `);
  return result.recordset;
}
