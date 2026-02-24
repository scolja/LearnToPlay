# Edit Mode Implementation Plan

## Overview

Add authenticated editing to BoardGameTeacher: Google OAuth sign-in, a split-pane MDX editor at `/games/[slug]/edit/`, versioned content storage in SQL Server, and version history with diff/rollback. This requires switching from static export to Next.js hybrid rendering (SSG + SSR + API routes).

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Editor UX | Full-document CodeMirror + split live preview | MDX has complex cross-section dependencies (StepRow sidebar props contain nested JSX). Section-level editing would be fragile. Clicking a section in the preview jumps the editor cursor to that section. |
| Versioning | Full-content per version (Wikipedia-style) | Guides are ~10-30KB each. Full snapshots are simple, rollback is trivial, and diffing is done at display time. |
| Content source of truth | DB after initial import | MDX files serve as one-time seeds. After import, all reads come from DB. Keeps things simple. |
| Auth access | Approved editors only | Users table has a Roles JSON column. Admin grants "editor" role. Prevents random sign-ins from editing. |
| Deployment mode | `output: 'standalone'` | Self-contained deployment with only needed node_modules. Standard for Azure Web Apps running Next.js. |
| Database schema | `ltp` schema in BGOTY database | As discussed — `ltp` (Learn to Play) |
| CSS | Split globals.css into organized per-component files | Same classes, just better file organization. Editor styles added separately. |

## New Dependencies

| Package | Purpose |
|---------|---------|
| `mssql` | SQL Server client (uses tedious internally) |
| `jose` | JWT sign/verify — lightweight, no native deps |
| `google-auth-library` | Google OAuth token validation |
| `@react-oauth/google` | Google sign-in button component |
| `codemirror` + `@codemirror/lang-markdown` + `@codemirror/lang-html` + `@codemirror/theme-one-dark` | Code editor for MDX editing |
| `diff` | Text diffing for version comparison |

---

## Phase 1: Infrastructure

### 1A. Switch to hybrid rendering

**`next.config.ts`** — Change `output: 'export'` to `output: 'standalone'`
- Keep `trailingSlash: true`, `images: { unoptimized: true }`
- Standalone output produces `.next/standalone/` with its own `server.js` and minimal `node_modules`

**`azure-pipelines.yml`** — Complete rewrite of build/deploy:
```yaml
# Build stage:
- npm ci
- npm run build
- cp -r public .next/standalone/public
- cp -r .next/static .next/standalone/.next/static
- cp -r content .next/standalone/content
- Archive .next/standalone/ as the deployment zip

# Deploy stage:
- Deploy zip to Azure Web App (startup command: node server.js)
```

**Delete `server.js`** — The standalone build generates its own `server.js`

**`package.json`** — Change `"start"` script to `"start": "node .next/standalone/server.js"` (for local testing; Azure uses the startup command)

**`public/sw.js`** — Exclude `/api/` and `/edit` paths from caching:
```js
// In fetch handler, skip caching for API routes and edit pages
if (url.pathname.startsWith('/api/') || url.pathname.includes('/edit')) {
  return fetch(event.request);
}
```

### 1B. Database schema

Create `database/` directory with migration SQL files.

**`database/001_create_schema.sql`**:

```sql
CREATE SCHEMA ltp;

-- Users: editor accounts
CREATE TABLE ltp.Users (
    Id                  UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Email               NVARCHAR(255) NOT NULL UNIQUE,
    DisplayName         NVARCHAR(100) NOT NULL,
    GoogleId            NVARCHAR(255) NULL UNIQUE,
    ProfilePictureUrl   NVARCHAR(1000) NULL,
    Roles               NVARCHAR(500) NOT NULL DEFAULT '[]',  -- JSON: ["editor","admin"]
    IsActive            BIT NOT NULL DEFAULT 1,
    LastLoginAt         DATETIME2 NULL,
    CreatedAt           DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt           DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Refresh tokens for JWT auth
CREATE TABLE ltp.RefreshTokens (
    Id          UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId      UNIQUEIDENTIFIER NOT NULL REFERENCES ltp.Users(Id) ON DELETE CASCADE,
    Token       NVARCHAR(500) NOT NULL UNIQUE,
    ExpiresAt   DATETIME2 NOT NULL,
    CreatedAt   DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    RevokedAt   DATETIME2 NULL
);

-- Versioned guide content (full MDX body per version)
CREATE TABLE ltp.GuideVersions (
    Id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Slug            NVARCHAR(100) NOT NULL,
    VersionNumber   INT NOT NULL,
    Content         NVARCHAR(MAX) NOT NULL,         -- Full MDX body (no frontmatter)
    FrontmatterJson NVARCHAR(MAX) NOT NULL,         -- Frontmatter as JSON
    EditedByUserId  UNIQUEIDENTIFIER NOT NULL REFERENCES ltp.Users(Id),
    EditedAt        DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    EditSummary     NVARCHAR(500) NULL,
    ParentVersionId UNIQUEIDENTIFIER NULL REFERENCES ltp.GuideVersions(Id),
    IsPublished     BIT NOT NULL DEFAULT 0,
    IsCurrent       BIT NOT NULL DEFAULT 0,         -- One per slug: the active published version
    CONSTRAINT UQ_Slug_Version UNIQUE (Slug, VersionNumber)
);

CREATE INDEX IX_GuideVersions_Slug_Current ON ltp.GuideVersions(Slug) WHERE IsCurrent = 1;
```

### 1C. Database access layer

New files:
- **`src/lib/db.ts`** — Connection pool singleton using `mssql` package. Config from env vars (`DB_SERVER`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD`).
- **`src/lib/repositories/user-repository.ts`** — `getByGoogleId`, `getByEmail`, `create`, `update`, `updateLastLogin`
- **`src/lib/repositories/token-repository.ts`** — `save`, `getByToken`, `revoke`
- **`src/lib/repositories/guide-repository.ts`** — `getCurrentVersion(slug)`, `getVersion(id)`, `getVersionHistory(slug)`, `createVersion(...)`, `setCurrentVersion(slug, versionId)`, `getAllCurrentSlugs()`

### 1D. Auth backend (API routes)

New files:
- **`src/lib/auth.ts`** — JWT utilities using `jose`: `createAccessToken(user)`, `verifyAccessToken(token)`, `generateRefreshToken()`, `setAuthCookies(response, ...)`, `clearAuthCookies(response)`
- **`src/lib/google-auth.ts`** — `verifyGoogleToken(credential)` using `google-auth-library`
- **`src/app/api/auth/google/route.ts`** — POST: validate Google credential, find/create user, generate tokens, set HttpOnly cookies, return user info
- **`src/app/api/auth/refresh/route.ts`** — POST: read refresh cookie, validate, rotate tokens, return user
- **`src/app/api/auth/logout/route.ts`** — POST: revoke refresh token, clear cookies
- **`src/app/api/auth/me/route.ts`** — GET: validate access token cookie, return current user

### 1E. Environment variables

**`.env.local`** (not committed):
```
DB_SERVER=scolarodb.database.windows.net
DB_DATABASE=BGOTY
DB_USER=...
DB_PASSWORD=...
GOOGLE_CLIENT_ID=...
JWT_SECRET=<random 64-char string>
JWT_ISSUER=learntoplay
JWT_AUDIENCE=learntoplay
```

Same values set as Application Settings in Azure Web App.

---

## Phase 2: Auth UI

### 2A. Auth context & client

- **`src/lib/auth-context.tsx`** — `AuthProvider` + `useAuth()` hook. Manages user state, periodic token refresh (25 min), visibility-change refresh, localStorage session flag (same pattern as VirtualFleaMarket).
- **`src/lib/api-client.ts`** — Fetch wrapper with `credentials: 'include'`, 401 auto-retry with deduplicated refresh.

### 2B. Layout changes

**`src/app/layout.tsx`** — Wrap children in `<GoogleOAuthProvider>` and `<AuthProvider>`.

### 2C. Login page

**`src/app/login/page.tsx`** — Google sign-in button, redirect to `returnUrl` query param after auth.

### 2D. Auth UI on guide pages

**`src/components/Hero.tsx`** — Add an "Edit Guide" button (link to `/games/{slug}/edit/`) visible only when user is authenticated and has editor role.

### 2E. Middleware

**`src/middleware.ts`** — Check for `accessToken` cookie on `/games/*/edit` routes. If missing, redirect to `/login?returnUrl=...`. Also protect write methods on `/api/guides/*`.

---

## Phase 3: Edit Mode

### 3A. Content pipeline change

**`src/lib/content.ts`** — Add `async getGameContent(slug)` that checks DB first (via `guide-repository.getCurrentVersion`), falls back to filesystem MDX. The existing sync `getGameBySlug` stays for `generateStaticParams`.

**`src/app/games/[slug]/page.tsx`** — Switch from sync filesystem read to `getGameContent()`. Add ISR with `revalidate = 3600` (1 hour fallback). On-demand revalidation via `revalidatePath()` when new versions are published.

### 3B. Edit page

**`src/app/games/[slug]/edit/page.tsx`** — SSR page (requires auth). Loads current version from DB (or filesystem for unedited guides). Renders the `<EditPage>` client component.

### 3C. Editor components

- **`src/components/editor/EditPage.tsx`** — Main client component. Split layout: CodeMirror editor on left, live preview on right. Toolbar with Save Draft / Publish / Back buttons. Edit summary input for versioning.
- **`src/components/editor/CodeEditor.tsx`** — CodeMirror 6 wrapper with markdown + HTML syntax highlighting, dark theme matching L2P aesthetic.
- **`src/components/editor/LivePreview.tsx`** — Renders MDX content using the same `mdxComponents` map. Uses a debounced POST to `/api/preview` for server-side MDX compilation (keeps client bundle small by not shipping the MDX compiler to the browser).
- **`src/components/editor/FrontmatterEditor.tsx`** — Structured form for editing frontmatter fields (title, subtitle, players, time, age, designer, glossary array, etc.) instead of raw YAML.
- **`src/components/editor/EditToolbar.tsx`** — Save/publish/back buttons, edit summary input.

### 3D. Preview API

**`src/app/api/preview/route.ts`** — POST: accepts `{ content }`, compiles MDX server-side via `next-mdx-remote/serialize`, returns serialized result for the client to hydrate. Debounced on client side (~500ms).

### 3E. Guide CRUD API

- **`src/app/api/guides/[slug]/route.ts`**
  - GET: return current version content + frontmatter + metadata
  - PUT: save new version `{ content, frontmatter, editSummary, publish }`. If `publish=true`, set as current and call `revalidatePath('/games/[slug]')`.

### 3F. Initial import script

**`scripts/import-guides.ts`** — Reads all MDX files from `content/games/`, creates version 1 entries in `ltp.GuideVersions` (IsPublished=1, IsCurrent=1) with a system user. Run once during migration.

---

## Phase 4: Version History

### 4A. History page

**`src/app/games/[slug]/history/page.tsx`** — Lists all versions for a guide: version number, date, author, edit summary, status. Links to view specific versions and diff between versions.

### 4B. Version view

**`src/app/games/[slug]/history/[versionId]/page.tsx`** — Renders a specific historical version in read-only mode using the same guide rendering pipeline.

### 4C. Diff view

**`src/app/games/[slug]/history/diff/page.tsx`** — Query params `?from=versionId&to=versionId`. Uses the `diff` npm package to compute and display additions/deletions with color coding.

**`src/components/editor/DiffView.tsx`** — Client component rendering unified or side-by-side diff.

### 4D. Rollback

**`src/app/api/guides/[slug]/revert/route.ts`** — POST `{ targetVersionId, editSummary }`. Creates a NEW version with the content from the target version (history is never mutated, same as Wikipedia). Sets as current, revalidates.

### 4E. Version history API

**`src/app/api/guides/[slug]/versions/route.ts`** — GET: returns version list with metadata (no content bodies, for the history page listing).

---

## Phase 5: CSS Refactoring

Split `src/app/globals.css` (1007 lines) into organized files:

```
src/styles/
  variables.css           # CSS custom properties (:root)
  reset.css               # Reset & base element styles
  typography.css          # Font families, sizes, headings
  layout.css              # .page-wrap, .row, .main, .side
  hero.css                # Hero section
  homepage.css            # Game grid, cards
  footer.css              # Footer
  components/
    side-card.css
    rule-box.css
    flow-diagram.css
    eval-strip.css
    knowledge-check.css
    summary-panel.css
    game-table.css
    footnotes.css
    quick-reference.css
    photo.css
    diagrams.css
  responsive.css          # All @media queries
  editor.css              # NEW: edit mode styles (.edit-page, .edit-split, .cm-editor overrides)
```

**`src/app/globals.css`** becomes a barrel of `@import` statements. Zero visual change — same classes, just better organized. The editor preview pane wraps content in `.page-wrap` so all guide styles apply identically.

---

## File Summary

### New files (~25)
```
database/001_create_schema.sql
scripts/import-guides.ts
src/lib/db.ts
src/lib/auth.ts
src/lib/google-auth.ts
src/lib/auth-context.tsx
src/lib/api-client.ts
src/lib/repositories/user-repository.ts
src/lib/repositories/token-repository.ts
src/lib/repositories/guide-repository.ts
src/app/api/auth/google/route.ts
src/app/api/auth/refresh/route.ts
src/app/api/auth/logout/route.ts
src/app/api/auth/me/route.ts
src/app/api/preview/route.ts
src/app/api/guides/[slug]/route.ts
src/app/api/guides/[slug]/versions/route.ts
src/app/api/guides/[slug]/revert/route.ts
src/app/login/page.tsx
src/app/games/[slug]/edit/page.tsx
src/app/games/[slug]/history/page.tsx
src/app/games/[slug]/history/[versionId]/page.tsx
src/app/games/[slug]/history/diff/page.tsx
src/components/editor/EditPage.tsx
src/components/editor/CodeEditor.tsx
src/components/editor/LivePreview.tsx
src/components/editor/FrontmatterEditor.tsx
src/components/editor/EditToolbar.tsx
src/components/editor/DiffView.tsx
src/middleware.ts
src/styles/*.css (split from globals.css)
```

### Modified files (~6)
```
next.config.ts              # output: 'standalone'
azure-pipelines.yml         # standalone deployment
package.json                # new dependencies
src/app/layout.tsx          # auth providers
src/app/globals.css         # becomes @import barrel
src/lib/content.ts          # DB-first content loading
src/app/games/[slug]/page.tsx  # ISR + DB content
src/components/Hero.tsx     # Edit button for editors
public/sw.js                # exclude API/edit from cache
```

### Deleted files
```
server.js                   # replaced by standalone server.js
```

---

## Implementation Order

1. **Phase 1A** — Hybrid rendering switch + pipeline update
2. **Phase 5** — CSS refactoring (easier to do before adding editor styles)
3. **Phase 1B-C** — Database schema + access layer
4. **Phase 1D-E** — Auth API routes + env vars
5. **Phase 2** — Auth UI (login, context, Hero edit button)
6. **Phase 3A** — Content pipeline (DB-first reads, ISR)
7. **Phase 3B-E** — Edit page, editor components, preview, save/publish
8. **Phase 3F** — Import existing MDX files to DB
9. **Phase 4** — Version history, diff, rollback
