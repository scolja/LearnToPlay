import { getPool, sql } from '../db';

export interface DbUserGuideProgress {
  Id: string;
  UserId: string;
  GuideId: string;
  CurrentSectionIndex: number;
  TotalSections: number;
  StartedAt: Date;
  LastAccessedAt: Date;
  CompletedAt: Date | null;
}

export interface ProgressRecord {
  guideId: string;
  slug: string;
  currentSectionIndex: number;
  totalSections: number;
  startedAt: string;
  lastAccessedAt: string;
  completedAt: string | null;
}

export async function getProgressByUserAndGuide(
  userId: string,
  guideId: string
): Promise<DbUserGuideProgress | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .input('guideId', sql.UniqueIdentifier, guideId)
    .query<DbUserGuideProgress>(`
      SELECT Id, UserId, GuideId, CurrentSectionIndex, TotalSections,
             StartedAt, LastAccessedAt, CompletedAt
      FROM ltp.UserGuideProgress
      WHERE UserId = @userId AND GuideId = @guideId
    `);
  return result.recordset[0] ?? null;
}

export async function getProgressByUserAndSlug(
  userId: string,
  slug: string
): Promise<DbUserGuideProgress | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .input('slug', sql.NVarChar, slug)
    .query<DbUserGuideProgress>(`
      SELECT p.Id, p.UserId, p.GuideId, p.CurrentSectionIndex, p.TotalSections,
             p.StartedAt, p.LastAccessedAt, p.CompletedAt
      FROM ltp.UserGuideProgress p
      JOIN ltp.Guides g ON p.GuideId = g.Id
      WHERE p.UserId = @userId AND g.Slug = @slug
    `);
  return result.recordset[0] ?? null;
}

export async function getAllProgressByUser(userId: string): Promise<ProgressRecord[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .query<ProgressRecord>(`
      SELECT p.GuideId as guideId, g.Slug as slug,
             p.CurrentSectionIndex as currentSectionIndex,
             p.TotalSections as totalSections,
             p.StartedAt as startedAt,
             p.LastAccessedAt as lastAccessedAt,
             p.CompletedAt as completedAt
      FROM ltp.UserGuideProgress p
      JOIN ltp.Guides g ON p.GuideId = g.Id
      WHERE p.UserId = @userId
    `);
  return result.recordset;
}

export async function upsertProgress(params: {
  userId: string;
  guideId: string;
  currentSectionIndex: number;
  totalSections: number;
}): Promise<DbUserGuideProgress> {
  const pool = await getPool();

  const existing = await getProgressByUserAndGuide(params.userId, params.guideId);

  // "Furthest ahead wins" — take the max of existing and incoming
  const newIndex = existing
    ? Math.max(existing.CurrentSectionIndex, params.currentSectionIndex)
    : params.currentSectionIndex;

  // If incoming totalSections is 0 (login sync — unknown), keep existing value
  const totalSections = params.totalSections > 0
    ? params.totalSections
    : (existing?.TotalSections ?? 0);

  // Mark completed when index reaches last section
  const isCompleted = totalSections > 0 && newIndex >= totalSections - 1;

  if (existing) {
    // UPDATE existing row, then SELECT it back
    await pool.request()
      .input('userId', sql.UniqueIdentifier, params.userId)
      .input('guideId', sql.UniqueIdentifier, params.guideId)
      .input('currentSectionIndex', sql.Int, newIndex)
      .input('totalSections', sql.Int, totalSections)
      .input('isCompleted', sql.Bit, isCompleted ? 1 : 0)
      .query(`
        UPDATE ltp.UserGuideProgress
        SET CurrentSectionIndex = @currentSectionIndex,
            TotalSections = @totalSections,
            LastAccessedAt = GETUTCDATE(),
            CompletedAt = CASE WHEN @isCompleted = 1 AND CompletedAt IS NULL
                               THEN GETUTCDATE()
                               ELSE CompletedAt END
        WHERE UserId = @userId AND GuideId = @guideId
      `);

    // Re-fetch the updated row
    const updated = await getProgressByUserAndGuide(params.userId, params.guideId);
    return updated!;
  } else {
    // INSERT new row
    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, params.userId)
      .input('guideId', sql.UniqueIdentifier, params.guideId)
      .input('currentSectionIndex', sql.Int, newIndex)
      .input('totalSections', sql.Int, totalSections)
      .input('isCompleted', sql.Bit, isCompleted ? 1 : 0)
      .query<DbUserGuideProgress>(`
        INSERT INTO ltp.UserGuideProgress
          (UserId, GuideId, CurrentSectionIndex, TotalSections,
           StartedAt, LastAccessedAt, CompletedAt)
        OUTPUT INSERTED.Id, INSERTED.UserId, INSERTED.GuideId,
               INSERTED.CurrentSectionIndex, INSERTED.TotalSections,
               INSERTED.StartedAt, INSERTED.LastAccessedAt, INSERTED.CompletedAt
        VALUES (@userId, @guideId, @currentSectionIndex, @totalSections,
                GETUTCDATE(), GETUTCDATE(),
                CASE WHEN @isCompleted = 1 THEN GETUTCDATE() ELSE NULL END)
      `);
    return result.recordset[0];
  }
}
