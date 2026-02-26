-- ============================================================================
-- BoardGameTeacher — Complete ltp schema (current state)
-- Generated: 2026-02-26
-- ============================================================================
-- This file reflects the ACTUAL database schema as deployed. Use it as the
-- single source of truth when building new features or writing queries.
--
-- Migration history:
--   001_create_schema.sql        — Users, RefreshTokens, GuideVersions (now legacy)
--   002_create_section_schema.sql — Guides, GuideSections, GlossaryEntries
--   (manual)                      — GuideVersions renamed to GuideVersions_MDX_Legacy
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Schema
-- ---------------------------------------------------------------------------
-- CREATE SCHEMA ltp;
-- GO

-- ---------------------------------------------------------------------------
-- 1. Users — authentication & identity
-- ---------------------------------------------------------------------------
CREATE TABLE ltp.Users (
    Id                  UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    Email               NVARCHAR(255)    NOT NULL,
    DisplayName         NVARCHAR(100)    NOT NULL,
    GoogleId            NVARCHAR(255)    NULL,
    ProfilePictureUrl   NVARCHAR(1000)   NULL,
    Roles               NVARCHAR(500)    NOT NULL DEFAULT '[]',
    IsActive            BIT              NOT NULL DEFAULT 1,
    LastLoginAt         DATETIME2        NULL,
    CreatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT UQ_LTP_Users_Email    UNIQUE (Email),
    CONSTRAINT UQ_LTP_Users_GoogleId UNIQUE (GoogleId)
);

-- ---------------------------------------------------------------------------
-- 2. RefreshTokens — JWT refresh token store
-- ---------------------------------------------------------------------------
CREATE TABLE ltp.RefreshTokens (
    Id          UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    UserId      UNIQUEIDENTIFIER NOT NULL REFERENCES ltp.Users(Id) ON DELETE CASCADE,
    Token       NVARCHAR(500)    NOT NULL UNIQUE,
    ExpiresAt   DATETIME2        NOT NULL,
    CreatedAt   DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    RevokedAt   DATETIME2        NULL
);

-- ---------------------------------------------------------------------------
-- 3. GuideVersions_MDX_Legacy — monolithic MDX guide versions (legacy)
-- ---------------------------------------------------------------------------
-- Originally named ltp.GuideVersions (see 001_create_schema.sql).
-- Renamed after migration to the section-based model. Retained for
-- historical version data; new guides use Guides + GuideSections.
-- ---------------------------------------------------------------------------
CREATE TABLE ltp.GuideVersions_MDX_Legacy (
    Id              UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    Slug            NVARCHAR(100)    NOT NULL,
    VersionNumber   INT              NOT NULL,
    Content         NVARCHAR(MAX)    NOT NULL,
    FrontmatterJson NVARCHAR(MAX)    NOT NULL,
    EditedByUserId  UNIQUEIDENTIFIER NOT NULL REFERENCES ltp.Users(Id),
    EditedAt        DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    EditSummary     NVARCHAR(500)    NULL,
    ParentVersionId UNIQUEIDENTIFIER NULL REFERENCES ltp.GuideVersions_MDX_Legacy(Id),
    IsPublished     BIT              NOT NULL DEFAULT 0,
    IsCurrent       BIT              NOT NULL DEFAULT 0,

    CONSTRAINT UQ_LTP_GuideVersions_Slug_Version UNIQUE (Slug, VersionNumber)
);

CREATE INDEX IX_LTP_GuideVersions_Slug_Current
    ON ltp.GuideVersions_MDX_Legacy(Slug) WHERE IsCurrent = 1;

-- ---------------------------------------------------------------------------
-- 4. Guides — game guide metadata (replaces YAML frontmatter)
-- ---------------------------------------------------------------------------
CREATE TABLE ltp.Guides (
    Id              UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    Slug            NVARCHAR(100)    NOT NULL,
    Title           NVARCHAR(200)    NOT NULL,
    Subtitle        NVARCHAR(500)    NULL,
    Designer        NVARCHAR(200)    NOT NULL,
    Artist          NVARCHAR(200)    NULL,
    Publisher       NVARCHAR(200)    NOT NULL,
    PublisherUrl    NVARCHAR(1000)   NULL,
    Year            INT              NOT NULL,
    Players         NVARCHAR(50)     NOT NULL,
    Time            NVARCHAR(50)     NOT NULL,
    Age             NVARCHAR(20)     NOT NULL,
    BggUrl          NVARCHAR(1000)   NULL,
    HeroGradient    NVARCHAR(200)    NULL,
    HeroImage       NVARCHAR(500)    NULL,
    CustomCss       NVARCHAR(MAX)    NULL,
    IsDraft         BIT              NOT NULL DEFAULT 0,
    CreatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT UQ_LTP_Guides_Slug UNIQUE (Slug)
);

-- ---------------------------------------------------------------------------
-- 5. GuideSections — ordered content chunks within a guide
-- ---------------------------------------------------------------------------
-- Each section stores:
--   Content     — Markdown for the main teaching column
--   Notes       — Markdown for sidebar/tips (expandable on mobile)
--   DisplayData — JSON bag for structured elements the renderer interprets:
--                 {"callout":"danger"}, {"flow":[...]}, {"table":{...}},
--                 {"quiz":[...]}, {"svg":"<svg>..."}, {"summary":[...]},
--                 {"strip":[...]}
-- ---------------------------------------------------------------------------
CREATE TABLE ltp.GuideSections (
    Id              UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    GuideId         UNIQUEIDENTIFIER NOT NULL REFERENCES ltp.Guides(Id) ON DELETE CASCADE,
    SortOrder       INT              NOT NULL,
    Title           NVARCHAR(300)    NULL,
    Content         NVARCHAR(MAX)    NOT NULL,
    Notes           NVARCHAR(MAX)    NULL,
    DisplayData     NVARCHAR(MAX)    NULL,
    VersionNumber   INT              NOT NULL DEFAULT 1,
    EditedByUserId  UNIQUEIDENTIFIER NULL REFERENCES ltp.Users(Id),
    EditedAt        DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    EditSummary     NVARCHAR(500)    NULL,
    IsActive        BIT              NOT NULL DEFAULT 1,
    CreatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT UQ_LTP_GuideSections_Order UNIQUE (GuideId, SortOrder)
);

CREATE INDEX IX_LTP_GuideSections_GuideId
    ON ltp.GuideSections(GuideId) WHERE IsActive = 1;

-- ---------------------------------------------------------------------------
-- 6. GlossaryEntries — searchable terms linked to guides and sections
-- ---------------------------------------------------------------------------
CREATE TABLE ltp.GlossaryEntries (
    Id              UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    GuideId         UNIQUEIDENTIFIER NOT NULL REFERENCES ltp.Guides(Id) ON DELETE CASCADE,
    SectionId       UNIQUEIDENTIFIER NULL REFERENCES ltp.GuideSections(Id),
    Term            NVARCHAR(100)    NOT NULL,
    Definition      NVARCHAR(1000)   NOT NULL,
    SearchTerms     NVARCHAR(500)    NULL,
    GroupName       NVARCHAR(100)    NULL,
    SortOrder       INT              NOT NULL DEFAULT 0,

    CONSTRAINT UQ_LTP_Glossary_GuideTerm UNIQUE (GuideId, Term)
);

CREATE INDEX IX_LTP_GlossaryEntries_GuideId
    ON ltp.GlossaryEntries(GuideId);
