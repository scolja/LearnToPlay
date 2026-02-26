-- ============================================================================
-- Migration 004: OAuthAccounts + UserGuideProgress
-- ============================================================================
-- Adds:
--   ltp.OAuthAccounts       — Multi-provider OAuth support (Google, Apple, etc.)
--   ltp.UserGuideProgress   — Server-side guide progress tracking
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 8. OAuthAccounts — linked OAuth provider identities per user
-- ---------------------------------------------------------------------------
CREATE TABLE ltp.OAuthAccounts (
    Id                UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    UserId            UNIQUEIDENTIFIER NOT NULL REFERENCES ltp.Users(Id) ON DELETE CASCADE,
    Provider          NVARCHAR(50)     NOT NULL,
    ProviderUserId    NVARCHAR(255)    NOT NULL,
    Email             NVARCHAR(255)    NULL,
    DisplayName       NVARCHAR(100)    NULL,
    ProfilePictureUrl NVARCHAR(1000)   NULL,
    CreatedAt         DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt         DATETIME2        NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT UQ_LTP_OAuthAccounts_Provider_UserId UNIQUE (Provider, ProviderUserId)
);

CREATE INDEX IX_LTP_OAuthAccounts_UserId
    ON ltp.OAuthAccounts(UserId);

-- ---------------------------------------------------------------------------
-- 9. UserGuideProgress — per-user reading progress for each guide
-- ---------------------------------------------------------------------------
CREATE TABLE ltp.UserGuideProgress (
    Id                   UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    UserId               UNIQUEIDENTIFIER NOT NULL REFERENCES ltp.Users(Id) ON DELETE CASCADE,
    GuideId              UNIQUEIDENTIFIER NOT NULL REFERENCES ltp.Guides(Id) ON DELETE CASCADE,
    CurrentSectionIndex  INT              NOT NULL DEFAULT 0,
    TotalSections        INT              NOT NULL DEFAULT 0,
    StartedAt            DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    LastAccessedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CompletedAt          DATETIME2        NULL,

    CONSTRAINT UQ_LTP_UserGuideProgress_User_Guide UNIQUE (UserId, GuideId)
);

CREATE INDEX IX_LTP_UserGuideProgress_UserId
    ON ltp.UserGuideProgress(UserId);
