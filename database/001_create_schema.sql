CREATE SCHEMA ltp;

CREATE TABLE ltp.Users (
    Id                  UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Email               NVARCHAR(255) NOT NULL,
    DisplayName         NVARCHAR(100) NOT NULL,
    GoogleId            NVARCHAR(255) NULL,
    ProfilePictureUrl   NVARCHAR(1000) NULL,
    Roles               NVARCHAR(500) NOT NULL DEFAULT '[]',
    IsActive            BIT NOT NULL DEFAULT 1,
    LastLoginAt         DATETIME2 NULL,
    CreatedAt           DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt           DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_LTP_Users_Email UNIQUE (Email),
    CONSTRAINT UQ_LTP_Users_GoogleId UNIQUE (GoogleId)
);

CREATE TABLE ltp.RefreshTokens (
    Id          UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId      UNIQUEIDENTIFIER NOT NULL REFERENCES ltp.Users(Id) ON DELETE CASCADE,
    Token       NVARCHAR(500) NOT NULL UNIQUE,
    ExpiresAt   DATETIME2 NOT NULL,
    CreatedAt   DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    RevokedAt   DATETIME2 NULL
);

CREATE TABLE ltp.GuideVersions (
    Id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Slug            NVARCHAR(100) NOT NULL,
    VersionNumber   INT NOT NULL,
    Content         NVARCHAR(MAX) NOT NULL,
    FrontmatterJson NVARCHAR(MAX) NOT NULL,
    EditedByUserId  UNIQUEIDENTIFIER NOT NULL REFERENCES ltp.Users(Id),
    EditedAt        DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    EditSummary     NVARCHAR(500) NULL,
    ParentVersionId UNIQUEIDENTIFIER NULL REFERENCES ltp.GuideVersions(Id),
    IsPublished     BIT NOT NULL DEFAULT 0,
    IsCurrent       BIT NOT NULL DEFAULT 0,
    CONSTRAINT UQ_LTP_GuideVersions_Slug_Version UNIQUE (Slug, VersionNumber)
);

CREATE INDEX IX_LTP_GuideVersions_Slug_Current
    ON ltp.GuideVersions(Slug) WHERE IsCurrent = 1;
