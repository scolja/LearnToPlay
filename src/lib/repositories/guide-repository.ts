import { getPool, sql } from '../db';

export interface DbGuideVersion {
  Id: string;
  Slug: string;
  VersionNumber: number;
  Content: string;
  FrontmatterJson: string;
  EditedByUserId: string;
  EditedAt: Date;
  EditSummary: string | null;
  ParentVersionId: string | null;
  IsPublished: boolean;
  IsCurrent: boolean;
}

export interface GuideVersionSummary {
  Id: string;
  VersionNumber: number;
  EditedAt: Date;
  EditSummary: string | null;
  IsPublished: boolean;
  IsCurrent: boolean;
  EditorName: string;
  EditorPicture: string | null;
}

export async function getCurrentVersion(slug: string): Promise<DbGuideVersion | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('slug', sql.NVarChar, slug)
    .query<DbGuideVersion>(`
      SELECT * FROM ltp.GuideVersions_MDX_Legacy
      WHERE Slug = @slug AND IsCurrent = 1
    `);
  return result.recordset[0] ?? null;
}

export async function getVersionById(id: string): Promise<DbGuideVersion | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, id)
    .query<DbGuideVersion>('SELECT * FROM ltp.GuideVersions_MDX_Legacy WHERE Id = @id');
  return result.recordset[0] ?? null;
}

export async function listVersions(slug: string): Promise<GuideVersionSummary[]> {
  const pool = await getPool();
  const result = await pool.request()
    .input('slug', sql.NVarChar, slug)
    .query<GuideVersionSummary>(`
      SELECT
        gv.Id, gv.VersionNumber, gv.EditedAt, gv.EditSummary,
        gv.IsPublished, gv.IsCurrent,
        u.DisplayName AS EditorName,
        u.ProfilePictureUrl AS EditorPicture
      FROM ltp.GuideVersions_MDX_Legacy gv
      JOIN ltp.Users u ON u.Id = gv.EditedByUserId
      WHERE gv.Slug = @slug
      ORDER BY gv.VersionNumber DESC
    `);
  return result.recordset;
}

export async function getNextVersionNumber(slug: string): Promise<number> {
  const pool = await getPool();
  const result = await pool.request()
    .input('slug', sql.NVarChar, slug)
    .query<{ maxVer: number | null }>(`
      SELECT MAX(VersionNumber) AS maxVer FROM ltp.GuideVersions_MDX_Legacy WHERE Slug = @slug
    `);
  return (result.recordset[0]?.maxVer ?? 0) + 1;
}

export async function saveVersion(params: {
  slug: string;
  content: string;
  frontmatterJson: string;
  editedByUserId: string;
  editSummary?: string;
  parentVersionId?: string;
  publish: boolean;
}): Promise<DbGuideVersion> {
  const pool = await getPool();
  const versionNumber = await getNextVersionNumber(params.slug);

  const transaction = pool.transaction();
  await transaction.begin();

  try {
    if (params.publish) {
      // Unset previous current version
      await transaction.request()
        .input('slug', sql.NVarChar, params.slug)
        .query(`
          UPDATE ltp.GuideVersions_MDX_Legacy
          SET IsCurrent = 0
          WHERE Slug = @slug AND IsCurrent = 1
        `);
    }

    const result = await transaction.request()
      .input('slug', sql.NVarChar, params.slug)
      .input('versionNumber', sql.Int, versionNumber)
      .input('content', sql.NVarChar, params.content)
      .input('frontmatterJson', sql.NVarChar, params.frontmatterJson)
      .input('editedByUserId', sql.UniqueIdentifier, params.editedByUserId)
      .input('editSummary', sql.NVarChar, params.editSummary ?? null)
      .input('parentVersionId', sql.UniqueIdentifier, params.parentVersionId ?? null)
      .input('isPublished', sql.Bit, params.publish)
      .input('isCurrent', sql.Bit, params.publish)
      .query<DbGuideVersion>(`
        INSERT INTO ltp.GuideVersions_MDX_Legacy
          (Slug, VersionNumber, Content, FrontmatterJson, EditedByUserId, EditSummary, ParentVersionId, IsPublished, IsCurrent)
        OUTPUT INSERTED.*
        VALUES (@slug, @versionNumber, @content, @frontmatterJson, @editedByUserId, @editSummary, @parentVersionId, @isPublished, @isCurrent)
      `);

    await transaction.commit();
    return result.recordset[0];
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

export async function getAllDbSlugs(): Promise<string[]> {
  const pool = await getPool();
  const result = await pool.request()
    .query<{ Slug: string }>('SELECT DISTINCT Slug FROM ltp.GuideVersions_MDX_Legacy');
  return result.recordset.map(r => r.Slug);
}

export async function getAllCurrentGuides(): Promise<DbGuideVersion[]> {
  const pool = await getPool();
  const result = await pool.request()
    .query<DbGuideVersion>('SELECT * FROM ltp.GuideVersions_MDX_Legacy WHERE IsCurrent = 1');
  return result.recordset;
}

export async function revertToVersion(slug: string, versionId: string, userId: string): Promise<DbGuideVersion> {
  const target = await getVersionById(versionId);
  if (!target || target.Slug !== slug) {
    throw new Error('Version not found or slug mismatch');
  }

  return saveVersion({
    slug,
    content: target.Content,
    frontmatterJson: target.FrontmatterJson,
    editedByUserId: userId,
    editSummary: `Reverted to version ${target.VersionNumber}`,
    parentVersionId: versionId,
    publish: true,
  });
}
