-- ============================================================================
-- Migration 002: Section-based guide storage for mobile-first rendering
-- ============================================================================
-- Replaces the monolithic MDX blob in GuideVersions with a structured,
-- section-level content model. Each section stores markdown (not MDX/JSX)
-- plus optional structured data in a JSON column for things markdown can't
-- express (quiz questions, table data, flow diagrams, SVG illustrations).
--
-- Design principles:
--   1. Markdown is the content. Non-technical editors write markdown.
--   2. DisplayData is a flexible JSON bag — no component types in the schema.
--      The rendering layer decides how to present based on content + hints.
--   3. Minimal tables: Guides + GuideSections + GlossaryEntries. That's it.
--   4. Section-level versioning for granular diffs and per-section editing.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Guide metadata (replaces YAML frontmatter stored in GuideVersions)
-- ---------------------------------------------------------------------------
CREATE TABLE ltp.Guides (
    Id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Slug            NVARCHAR(100)  NOT NULL,
    Title           NVARCHAR(200)  NOT NULL,
    Subtitle        NVARCHAR(500)  NULL,
    Designer        NVARCHAR(200)  NOT NULL,
    Artist          NVARCHAR(200)  NULL,
    Publisher       NVARCHAR(200)  NOT NULL,
    PublisherUrl    NVARCHAR(1000) NULL,
    Year            INT            NOT NULL,
    Players         NVARCHAR(50)   NOT NULL,
    Time            NVARCHAR(50)   NOT NULL,
    Age             NVARCHAR(20)   NOT NULL,
    BggUrl          NVARCHAR(1000) NULL,
    HeroGradient    NVARCHAR(200)  NULL,
    HeroImage       NVARCHAR(500)  NULL,
    CustomCss       NVARCHAR(MAX)  NULL,       -- game-specific CSS overrides
    IsDraft         BIT            NOT NULL DEFAULT 0,
    CreatedAt       DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2      NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT UQ_LTP_Guides_Slug UNIQUE (Slug)
);

-- ---------------------------------------------------------------------------
-- 2. Guide sections — ordered content chunks within a guide
-- ---------------------------------------------------------------------------
-- Each section has:
--   - Markdown content for the main teaching material
--   - Markdown notes for sidebar/supplemental content (tips, warnings, strategy)
--   - A JSON DisplayData column for anything markdown can't express
--   - Version tracking at the section level
--
-- The DisplayData JSON is intentionally unstructured. Examples:
--   NULL or {}                        → plain content card
--   {"callout": "danger"}             → red-bordered rule callout
--   {"callout": "info"}               → gold-bordered rule callout
--   {"flow": ["Step A", "Step B"]}    → rendered as a flow diagram
--   {"table": {"headers":[...], "rows":[...]}}  → rendered as a styled table
--   {"quiz": [{"question":"...", "options":[...], ...}]}  → interactive quiz
--   {"svg": "<svg>...</svg>"}         → inline SVG diagram
--   {"summary": [{"num":1, "text":"..."}]}  → numbered summary panel
--   {"strip": [{"num":1, "label":"..."}]}   → phase/turn strip
--
-- The rendering layer reads DisplayData and decides what component to use.
-- Adding a new visual treatment = new rendering code, not a new migration.
-- ---------------------------------------------------------------------------
CREATE TABLE ltp.GuideSections (
    Id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    GuideId         UNIQUEIDENTIFIER NOT NULL REFERENCES ltp.Guides(Id) ON DELETE CASCADE,
    SortOrder       INT            NOT NULL,
    Title           NVARCHAR(300)  NULL,
    Content         NVARCHAR(MAX)  NOT NULL,       -- Markdown (main column)
    Notes           NVARCHAR(MAX)  NULL,            -- Markdown (sidebar/tips — expandable on mobile)
    DisplayData     NVARCHAR(MAX)  NULL,            -- JSON bag for structured elements
    VersionNumber   INT            NOT NULL DEFAULT 1,
    EditedByUserId  UNIQUEIDENTIFIER NULL REFERENCES ltp.Users(Id),
    EditedAt        DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
    EditSummary     NVARCHAR(500)  NULL,
    IsActive        BIT            NOT NULL DEFAULT 1,
    CreatedAt       DATETIME2      NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT UQ_LTP_GuideSections_Order UNIQUE (GuideId, SortOrder)
);

CREATE INDEX IX_LTP_GuideSections_GuideId
    ON ltp.GuideSections(GuideId) WHERE IsActive = 1;

-- ---------------------------------------------------------------------------
-- 3. Glossary entries — standalone searchable terms linked to sections
-- ---------------------------------------------------------------------------
-- Separate table because glossary needs:
--   - Independent full-text search
--   - Navigation links to specific sections
--   - Grouping and ordering independent of section order
-- ---------------------------------------------------------------------------
CREATE TABLE ltp.GlossaryEntries (
    Id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    GuideId         UNIQUEIDENTIFIER NOT NULL REFERENCES ltp.Guides(Id) ON DELETE CASCADE,
    SectionId       UNIQUEIDENTIFIER NULL REFERENCES ltp.GuideSections(Id),
    Term            NVARCHAR(100)  NOT NULL,
    Definition      NVARCHAR(1000) NOT NULL,
    SearchTerms     NVARCHAR(500)  NULL,           -- alternative keywords for search
    GroupName       NVARCHAR(100)  NULL,           -- "Gameplay", "Scoring", etc.
    SortOrder       INT            NOT NULL DEFAULT 0,

    CONSTRAINT UQ_LTP_Glossary_GuideTerm UNIQUE (GuideId, Term)
);

CREATE INDEX IX_LTP_GlossaryEntries_GuideId
    ON ltp.GlossaryEntries(GuideId);
