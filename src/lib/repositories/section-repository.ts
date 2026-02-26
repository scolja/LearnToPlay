import { getPool, sql } from '../db';
import type {
  GuideMeta, GuideSection, DbGlossaryEntry,
  GuideSectionWithDraft, SectionHistoryEntry, GuideMetaEditable,
} from '../types';

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

// ---------------------------------------------------------------------------
// Guide metadata for editing (includes draft guides)
// ---------------------------------------------------------------------------

export async function getGuideForEditing(slug: string): Promise<GuideMetaEditable | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('slug', sql.NVarChar, slug)
    .query(`
      SELECT g.Id as id, g.Slug as slug, g.Title as title, g.Subtitle as subtitle,
             g.Designer as designer, g.Artist as artist, g.Publisher as publisher,
             g.PublisherUrl as publisherUrl, g.Year as year, g.Players as players,
             g.Time as time, g.Age as age, g.BggUrl as bggUrl,
             g.HeroGradient as heroGradient, g.HeroImage as heroImage,
             g.CustomCss as customCss, g.IsDraft as isDraft,
             g.CreatedAt as createdAt,
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
      WHERE g.Slug = @slug
    `);
  if (!result.recordset[0]) return null;
  const row = result.recordset[0];
  return {
    ...row,
    isDraft: !!row.isDraft,
  };
}

export async function updateGuideMetadata(params: {
  guideId: string;
  title?: string;
  subtitle?: string | null;
  designer?: string;
  artist?: string | null;
  publisher?: string;
  publisherUrl?: string | null;
  year?: number;
  players?: string;
  time?: string;
  age?: string;
  bggUrl?: string | null;
  heroGradient?: string | null;
  heroImage?: string | null;
  customCss?: string | null;
  isDraft?: boolean;
  updatedByUserId: string;
}): Promise<void> {
  const pool = await getPool();
  const setClauses: string[] = [];
  const request = pool.request()
    .input('id', sql.UniqueIdentifier, params.guideId)
    .input('updatedByUserId', sql.UniqueIdentifier, params.updatedByUserId);

  if (params.title !== undefined) {
    setClauses.push('Title = @title');
    request.input('title', sql.NVarChar, params.title);
  }
  if (params.subtitle !== undefined) {
    setClauses.push('Subtitle = @subtitle');
    request.input('subtitle', sql.NVarChar, params.subtitle);
  }
  if (params.designer !== undefined) {
    setClauses.push('Designer = @designer');
    request.input('designer', sql.NVarChar, params.designer);
  }
  if (params.artist !== undefined) {
    setClauses.push('Artist = @artist');
    request.input('artist', sql.NVarChar, params.artist);
  }
  if (params.publisher !== undefined) {
    setClauses.push('Publisher = @publisher');
    request.input('publisher', sql.NVarChar, params.publisher);
  }
  if (params.publisherUrl !== undefined) {
    setClauses.push('PublisherUrl = @publisherUrl');
    request.input('publisherUrl', sql.NVarChar, params.publisherUrl);
  }
  if (params.year !== undefined) {
    setClauses.push('Year = @year');
    request.input('year', sql.Int, params.year);
  }
  if (params.players !== undefined) {
    setClauses.push('Players = @players');
    request.input('players', sql.NVarChar, params.players);
  }
  if (params.time !== undefined) {
    setClauses.push('Time = @time');
    request.input('time', sql.NVarChar, params.time);
  }
  if (params.age !== undefined) {
    setClauses.push('Age = @age');
    request.input('age', sql.NVarChar, params.age);
  }
  if (params.bggUrl !== undefined) {
    setClauses.push('BggUrl = @bggUrl');
    request.input('bggUrl', sql.NVarChar, params.bggUrl);
  }
  if (params.heroGradient !== undefined) {
    setClauses.push('HeroGradient = @heroGradient');
    request.input('heroGradient', sql.NVarChar, params.heroGradient);
  }
  if (params.heroImage !== undefined) {
    setClauses.push('HeroImage = @heroImage');
    request.input('heroImage', sql.NVarChar, params.heroImage);
  }
  if (params.customCss !== undefined) {
    setClauses.push('CustomCss = @customCss');
    request.input('customCss', sql.NVarChar, params.customCss);
  }
  if (params.isDraft !== undefined) {
    setClauses.push('IsDraft = @isDraft');
    request.input('isDraft', sql.Bit, params.isDraft ? 1 : 0);
  }

  if (setClauses.length === 0) return;

  setClauses.push('UpdatedAt = GETUTCDATE()');
  setClauses.push('UpdatedByUserId = @updatedByUserId');

  await request.query(`
    UPDATE ltp.Guides
    SET ${setClauses.join(', ')}
    WHERE Id = @id
  `);
}

// ---------------------------------------------------------------------------
// Sections with draft info (for editors)
// ---------------------------------------------------------------------------

export async function getSectionsWithDrafts(slug: string): Promise<GuideSectionWithDraft[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('slug', sql.NVarChar, slug)
    .query(`
      SELECT gs.Id as id, gs.GuideId as guideId, gs.SortOrder as sortOrder,
             gs.Title as title, gs.Content as content, gs.Notes as notes,
             gs.DisplayData as displayData, gs.VersionNumber as versionNumber,
             gs.DraftTitle as draftTitle, gs.DraftContent as draftContent,
             gs.DraftNotes as draftNotes, gs.DraftDisplayData as draftDisplayData,
             gs.DraftEditedAt as draftEditedAt
      FROM ltp.GuideSections gs
      JOIN ltp.Guides g ON gs.GuideId = g.Id
      WHERE g.Slug = @slug AND gs.IsActive = 1
      ORDER BY gs.SortOrder
    `);
  return result.recordset.map(row => ({
    ...row,
    displayData: row.displayData ? JSON.parse(row.displayData) : null,
    draftDisplayData: row.draftDisplayData ? JSON.parse(row.draftDisplayData) : null,
    draftEditedAt: row.draftEditedAt?.toISOString() ?? null,
    hasDraft: row.draftContent !== null,
  }));
}

// ---------------------------------------------------------------------------
// Draft operations
// ---------------------------------------------------------------------------

export async function saveDraft(params: {
  sectionId: string;
  title?: string | null;
  content: string;
  notes?: string | null;
  displayData?: Record<string, unknown> | null;
  editedByUserId: string;
}): Promise<void> {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.UniqueIdentifier, params.sectionId)
    .input('draftTitle', sql.NVarChar, params.title ?? null)
    .input('draftContent', sql.NVarChar, params.content)
    .input('draftNotes', sql.NVarChar, params.notes ?? null)
    .input('draftDisplayData', sql.NVarChar,
      params.displayData ? JSON.stringify(params.displayData) : null)
    .input('userId', sql.UniqueIdentifier, params.editedByUserId)
    .query(`
      UPDATE ltp.GuideSections
      SET DraftTitle = @draftTitle,
          DraftContent = @draftContent,
          DraftNotes = @draftNotes,
          DraftDisplayData = @draftDisplayData,
          DraftEditedAt = GETUTCDATE(),
          DraftEditedByUserId = @userId
      WHERE Id = @id
    `);
}

export async function discardDraft(sectionId: string): Promise<void> {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.UniqueIdentifier, sectionId)
    .query(`
      UPDATE ltp.GuideSections
      SET DraftTitle = NULL,
          DraftContent = NULL,
          DraftNotes = NULL,
          DraftDisplayData = NULL,
          DraftEditedAt = NULL,
          DraftEditedByUserId = NULL
      WHERE Id = @id
    `);
}

// ---------------------------------------------------------------------------
// Publish (archive current → promote draft/new content → clear draft)
// ---------------------------------------------------------------------------

export async function publishSection(params: {
  sectionId: string;
  title?: string | null;
  content: string;
  notes?: string | null;
  displayData?: Record<string, unknown> | null;
  editedByUserId: string;
  editSummary?: string;
}): Promise<GuideSection> {
  const pool = await getPool();
  const transaction = pool.transaction();
  await transaction.begin();

  try {
    // 1. Read current published state
    const current = await transaction.request()
      .input('id', sql.UniqueIdentifier, params.sectionId)
      .query(`
        SELECT Id, GuideId, SortOrder, Title, Content, Notes,
               DisplayData, VersionNumber, EditedByUserId, EditedAt, EditSummary
        FROM ltp.GuideSections
        WHERE Id = @id
      `);
    const row = current.recordset[0];
    if (!row) throw new Error(`Section ${params.sectionId} not found`);

    // 2. Archive current published content into history
    await transaction.request()
      .input('sectionId', sql.UniqueIdentifier, row.Id)
      .input('guideId', sql.UniqueIdentifier, row.GuideId)
      .input('versionNumber', sql.Int, row.VersionNumber)
      .input('title', sql.NVarChar, row.Title)
      .input('content', sql.NVarChar, row.Content)
      .input('notes', sql.NVarChar, row.Notes)
      .input('displayData', sql.NVarChar, row.DisplayData)
      .input('editedByUserId', sql.UniqueIdentifier, row.EditedByUserId)
      .input('editedAt', sql.DateTime2, row.EditedAt)
      .input('editSummary', sql.NVarChar, row.EditSummary)
      .query(`
        INSERT INTO ltp.GuideSectionHistory
          (SectionId, GuideId, VersionNumber, Title, Content, Notes,
           DisplayData, EditedByUserId, EditedAt, EditSummary)
        VALUES
          (@sectionId, @guideId, @versionNumber, @title, @content, @notes,
           @displayData, @editedByUserId, @editedAt, @editSummary)
      `);

    // 3. Update published content + clear draft columns
    const updated = await transaction.request()
      .input('id', sql.UniqueIdentifier, params.sectionId)
      .input('newTitle', sql.NVarChar, params.title ?? null)
      .input('newContent', sql.NVarChar, params.content)
      .input('newNotes', sql.NVarChar, params.notes ?? null)
      .input('newDisplayData', sql.NVarChar,
        params.displayData ? JSON.stringify(params.displayData) : null)
      .input('userId', sql.UniqueIdentifier, params.editedByUserId)
      .input('summary', sql.NVarChar, params.editSummary ?? null)
      .query(`
        UPDATE ltp.GuideSections
        SET Title = @newTitle,
            Content = @newContent,
            Notes = @newNotes,
            DisplayData = @newDisplayData,
            VersionNumber = VersionNumber + 1,
            EditedByUserId = @userId,
            EditSummary = @summary,
            EditedAt = GETUTCDATE(),
            DraftTitle = NULL,
            DraftContent = NULL,
            DraftNotes = NULL,
            DraftDisplayData = NULL,
            DraftEditedAt = NULL,
            DraftEditedByUserId = NULL
        OUTPUT INSERTED.Id as id, INSERTED.GuideId as guideId,
               INSERTED.SortOrder as sortOrder, INSERTED.Title as title,
               INSERTED.Content as content, INSERTED.Notes as notes,
               INSERTED.DisplayData as displayData,
               INSERTED.VersionNumber as versionNumber
        WHERE Id = @id
      `);

    await transaction.commit();
    const r = updated.recordset[0];
    return {
      ...r,
      displayData: r.displayData ? JSON.parse(r.displayData) : null,
    };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Section history
// ---------------------------------------------------------------------------

export async function getSectionHistory(sectionId: string): Promise<SectionHistoryEntry[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('sectionId', sql.UniqueIdentifier, sectionId)
    .query(`
      SELECT h.Id as id, h.SectionId as sectionId, h.GuideId as guideId,
             h.VersionNumber as versionNumber, h.Title as title,
             h.Content as content, h.Notes as notes,
             h.DisplayData as displayData, h.EditedByUserId as editedByUserId,
             h.EditedAt as editedAt, h.EditSummary as editSummary,
             u.DisplayName as editorName, u.ProfilePictureUrl as editorPicture
      FROM ltp.GuideSectionHistory h
      LEFT JOIN ltp.Users u ON h.EditedByUserId = u.Id
      WHERE h.SectionId = @sectionId
      ORDER BY h.VersionNumber DESC
    `);
  return result.recordset.map(row => ({
    ...row,
    editedAt: row.editedAt?.toISOString() ?? '',
    displayData: row.displayData ? JSON.parse(row.displayData) : null,
  }));
}

export async function getSectionHistoryEntry(historyId: string): Promise<SectionHistoryEntry | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, historyId)
    .query(`
      SELECT h.Id as id, h.SectionId as sectionId, h.GuideId as guideId,
             h.VersionNumber as versionNumber, h.Title as title,
             h.Content as content, h.Notes as notes,
             h.DisplayData as displayData, h.EditedByUserId as editedByUserId,
             h.EditedAt as editedAt, h.EditSummary as editSummary,
             u.DisplayName as editorName, u.ProfilePictureUrl as editorPicture
      FROM ltp.GuideSectionHistory h
      LEFT JOIN ltp.Users u ON h.EditedByUserId = u.Id
      WHERE h.Id = @id
    `);
  if (!result.recordset[0]) return null;
  const row = result.recordset[0];
  return {
    ...row,
    editedAt: row.editedAt?.toISOString() ?? '',
    displayData: row.displayData ? JSON.parse(row.displayData) : null,
  };
}

export async function revertSectionToVersion(params: {
  sectionId: string;
  historyId: string;
  userId: string;
}): Promise<void> {
  const pool = await getPool();
  // Copy history entry content into draft columns
  await pool.request()
    .input('sectionId', sql.UniqueIdentifier, params.sectionId)
    .input('historyId', sql.UniqueIdentifier, params.historyId)
    .input('userId', sql.UniqueIdentifier, params.userId)
    .query(`
      UPDATE gs
      SET gs.DraftTitle = h.Title,
          gs.DraftContent = h.Content,
          gs.DraftNotes = h.Notes,
          gs.DraftDisplayData = h.DisplayData,
          gs.DraftEditedAt = GETUTCDATE(),
          gs.DraftEditedByUserId = @userId
      FROM ltp.GuideSections gs
      JOIN ltp.GuideSectionHistory h ON h.Id = @historyId
      WHERE gs.Id = @sectionId
    `);
}

// ---------------------------------------------------------------------------
// Section CRUD
// ---------------------------------------------------------------------------

export async function createSection(params: {
  guideId: string;
  title?: string | null;
  content?: string;
  editedByUserId: string;
}): Promise<GuideSection> {
  const pool = await getPool();
  // Get next sort order
  const maxResult = await pool.request()
    .input('guideId', sql.UniqueIdentifier, params.guideId)
    .query(`
      SELECT ISNULL(MAX(SortOrder), 0) + 1 as nextOrder
      FROM ltp.GuideSections
      WHERE GuideId = @guideId AND IsActive = 1
    `);
  const nextOrder = maxResult.recordset[0].nextOrder;

  const result = await pool.request()
    .input('guideId', sql.UniqueIdentifier, params.guideId)
    .input('sortOrder', sql.Int, nextOrder)
    .input('title', sql.NVarChar, params.title ?? null)
    .input('content', sql.NVarChar, params.content ?? '')
    .input('userId', sql.UniqueIdentifier, params.editedByUserId)
    .query(`
      INSERT INTO ltp.GuideSections
        (GuideId, SortOrder, Title, Content, EditedByUserId, EditedAt)
      OUTPUT INSERTED.Id as id, INSERTED.GuideId as guideId,
             INSERTED.SortOrder as sortOrder, INSERTED.Title as title,
             INSERTED.Content as content, INSERTED.Notes as notes,
             INSERTED.DisplayData as displayData,
             INSERTED.VersionNumber as versionNumber
      VALUES (@guideId, @sortOrder, @title, @content, @userId, GETUTCDATE())
    `);
  const row = result.recordset[0];
  return {
    ...row,
    displayData: row.displayData ? JSON.parse(row.displayData) : null,
  };
}

export async function deleteSection(sectionId: string): Promise<void> {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.UniqueIdentifier, sectionId)
    .query(`
      UPDATE ltp.GuideSections
      SET IsActive = 0
      WHERE Id = @id
    `);
}

export async function reorderSections(
  guideId: string,
  orderedSectionIds: string[]
): Promise<void> {
  const pool = await getPool();
  const transaction = pool.transaction();
  await transaction.begin();

  try {
    // Temporarily remove the unique constraint by setting negative sort orders
    // then set the final values
    for (let i = 0; i < orderedSectionIds.length; i++) {
      await transaction.request()
        .input('id', sql.UniqueIdentifier, orderedSectionIds[i])
        .input('guideId', sql.UniqueIdentifier, guideId)
        .input('sortOrder', sql.Int, -(i + 1))
        .query(`
          UPDATE ltp.GuideSections
          SET SortOrder = @sortOrder
          WHERE Id = @id AND GuideId = @guideId
        `);
    }
    // Now set the positive values
    for (let i = 0; i < orderedSectionIds.length; i++) {
      await transaction.request()
        .input('id', sql.UniqueIdentifier, orderedSectionIds[i])
        .input('guideId', sql.UniqueIdentifier, guideId)
        .input('sortOrder', sql.Int, i + 1)
        .query(`
          UPDATE ltp.GuideSections
          SET SortOrder = @sortOrder
          WHERE Id = @id AND GuideId = @guideId
        `);
    }

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Glossary CRUD
// ---------------------------------------------------------------------------

export async function createGlossaryEntry(params: {
  guideId: string;
  sectionId?: string | null;
  term: string;
  definition: string;
  searchTerms?: string | null;
  groupName?: string | null;
  sortOrder?: number;
}): Promise<DbGlossaryEntry> {
  const pool = await getPool();
  const result = await pool.request()
    .input('guideId', sql.UniqueIdentifier, params.guideId)
    .input('sectionId', sql.UniqueIdentifier, params.sectionId ?? null)
    .input('term', sql.NVarChar, params.term)
    .input('definition', sql.NVarChar, params.definition)
    .input('searchTerms', sql.NVarChar, params.searchTerms ?? null)
    .input('groupName', sql.NVarChar, params.groupName ?? null)
    .input('sortOrder', sql.Int, params.sortOrder ?? 0)
    .query<DbGlossaryEntry>(`
      INSERT INTO ltp.GlossaryEntries
        (GuideId, SectionId, Term, Definition, SearchTerms, GroupName, SortOrder)
      OUTPUT INSERTED.Id as id, INSERTED.GuideId as guideId,
             INSERTED.SectionId as sectionId, INSERTED.Term as term,
             INSERTED.Definition as definition, INSERTED.SearchTerms as searchTerms,
             INSERTED.GroupName as groupName, INSERTED.SortOrder as sortOrder
      VALUES (@guideId, @sectionId, @term, @definition, @searchTerms, @groupName, @sortOrder)
    `);
  return result.recordset[0];
}

export async function updateGlossaryEntry(params: {
  id: string;
  sectionId?: string | null;
  term?: string;
  definition?: string;
  searchTerms?: string | null;
  groupName?: string | null;
  sortOrder?: number;
}): Promise<void> {
  const pool = await getPool();
  const setClauses: string[] = [];
  const request = pool.request()
    .input('id', sql.UniqueIdentifier, params.id);

  if (params.sectionId !== undefined) {
    setClauses.push('SectionId = @sectionId');
    request.input('sectionId', sql.UniqueIdentifier, params.sectionId);
  }
  if (params.term !== undefined) {
    setClauses.push('Term = @term');
    request.input('term', sql.NVarChar, params.term);
  }
  if (params.definition !== undefined) {
    setClauses.push('Definition = @definition');
    request.input('definition', sql.NVarChar, params.definition);
  }
  if (params.searchTerms !== undefined) {
    setClauses.push('SearchTerms = @searchTerms');
    request.input('searchTerms', sql.NVarChar, params.searchTerms);
  }
  if (params.groupName !== undefined) {
    setClauses.push('GroupName = @groupName');
    request.input('groupName', sql.NVarChar, params.groupName);
  }
  if (params.sortOrder !== undefined) {
    setClauses.push('SortOrder = @sortOrder');
    request.input('sortOrder', sql.Int, params.sortOrder);
  }

  if (setClauses.length === 0) return;

  await request.query(`
    UPDATE ltp.GlossaryEntries
    SET ${setClauses.join(', ')}
    WHERE Id = @id
  `);
}

export async function deleteGlossaryEntry(id: string): Promise<void> {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.UniqueIdentifier, id)
    .query('DELETE FROM ltp.GlossaryEntries WHERE Id = @id');
}
