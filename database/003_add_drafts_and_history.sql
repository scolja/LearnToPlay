-- ============================================================================
-- 003_add_drafts_and_history.sql
-- Adds draft columns to GuideSections and creates GuideSectionHistory table
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Draft columns on GuideSections
-- ---------------------------------------------------------------------------
-- When DraftContent IS NOT NULL, the section has unpublished changes.
-- "Save Draft" populates these; "Publish" promotes them to the main columns
-- and clears the draft; "Discard Draft" nulls them out.
-- ---------------------------------------------------------------------------
ALTER TABLE ltp.GuideSections ADD DraftTitle            NVARCHAR(300)         NULL;
ALTER TABLE ltp.GuideSections ADD DraftContent          NVARCHAR(MAX)         NULL;
ALTER TABLE ltp.GuideSections ADD DraftNotes            NVARCHAR(MAX)         NULL;
ALTER TABLE ltp.GuideSections ADD DraftDisplayData      NVARCHAR(MAX)         NULL;
ALTER TABLE ltp.GuideSections ADD DraftEditedAt         DATETIME2             NULL;
ALTER TABLE ltp.GuideSections ADD DraftEditedByUserId   UNIQUEIDENTIFIER      NULL;
GO

ALTER TABLE ltp.GuideSections ADD CONSTRAINT FK_GuideSections_DraftEditor
    FOREIGN KEY (DraftEditedByUserId) REFERENCES ltp.Users(Id);
GO

-- ---------------------------------------------------------------------------
-- 2. GuideSectionHistory — archives previous versions on publish
-- ---------------------------------------------------------------------------
CREATE TABLE ltp.GuideSectionHistory (
    Id              UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    SectionId       UNIQUEIDENTIFIER NOT NULL REFERENCES ltp.GuideSections(Id) ON DELETE CASCADE,
    GuideId         UNIQUEIDENTIFIER NOT NULL REFERENCES ltp.Guides(Id),
    VersionNumber   INT              NOT NULL,
    Title           NVARCHAR(300)    NULL,
    Content         NVARCHAR(MAX)    NOT NULL,
    Notes           NVARCHAR(MAX)    NULL,
    DisplayData     NVARCHAR(MAX)    NULL,
    EditedByUserId  UNIQUEIDENTIFIER NULL REFERENCES ltp.Users(Id),
    EditedAt        DATETIME2        NOT NULL,
    EditSummary     NVARCHAR(500)    NULL,
    CreatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_LTP_SectionHistory_SectionId
    ON ltp.GuideSectionHistory(SectionId, VersionNumber DESC);

CREATE INDEX IX_LTP_SectionHistory_GuideId
    ON ltp.GuideSectionHistory(GuideId);
GO

-- ---------------------------------------------------------------------------
-- 3. Audit columns on Guides
-- ---------------------------------------------------------------------------
ALTER TABLE ltp.Guides ADD CreatedByUserId UNIQUEIDENTIFIER NULL;
ALTER TABLE ltp.Guides ADD UpdatedByUserId UNIQUEIDENTIFIER NULL;
GO

ALTER TABLE ltp.Guides ADD CONSTRAINT FK_Guides_CreatedBy
    FOREIGN KEY (CreatedByUserId) REFERENCES ltp.Users(Id);

ALTER TABLE ltp.Guides ADD CONSTRAINT FK_Guides_UpdatedBy
    FOREIGN KEY (UpdatedByUserId) REFERENCES ltp.Users(Id);
GO
