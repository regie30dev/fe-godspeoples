# FE Claude Session Log

A running record of all adds, edits, and changes made to the **GodsPeoples** frontend codebase during Claude Code sessions. Newest entries at the bottom of each session.

---

## Session: 2026-06-22

### Scaffold — initial project setup
- Scaffolded a React app with **Vite** (JavaScript template) into the project root.
- Installed runtime deps: `react-router-dom`, `@tanstack/react-query`, `axios`.
- Installed dev deps: `tailwindcss`, `@tailwindcss/vite` (Tailwind CSS v4).
- **`vite.config.js`** — added the Tailwind Vite plugin and a `@` → `src/` path alias.
- **`src/index.css`** — replaced boilerplate with `@import 'tailwindcss';` plus minimal full-height rules.
- **`src/main.jsx`** — wrapped the app in `QueryClientProvider` and `BrowserRouter`.
- **`src/lib/queryClient.js`** (new) — shared `QueryClient` (30s stale time, 1 retry, no refetch on focus).
- **`src/lib/api.js`** (new) — Axios instance reading `VITE_API_BASE_URL`, with request interceptor (bearer token from `localStorage`) and response interceptor (error normalization).
- **`src/features/people/usePeople.js`** (new) — example TanStack Query hook (`GET /people`).
- **`src/components/Layout.jsx`** (new) — shared shell with header nav + `<Outlet/>`.
- **`src/pages/Home.jsx`**, **`People.jsx`**, **`NotFound.jsx`** (new) — initial pages.
- **`src/App.jsx`** — replaced boilerplate with route definitions (Home / People / 404) under `Layout`.
- Removed Vite boilerplate assets (`App.css`, logos, `public/icons.svg`, etc.).
- **`index.html`** — title set to `GodsPeoples`.
- **`.env`** + **`.env.example`** (new) — `VITE_API_BASE_URL` config.
- **`.gitignore`** — added env-file rules (ignore `.env*`, keep `.env.example`).
- Verified: `npm run build` and `npm run lint` pass.

### Top bar styling
- **`Layout.jsx`** — gave the header a **blue** background (`bg-blue-600`); adjusted inner colors for readability: logo "Gods" white + "Peoples" `blue-200`; active nav link = white bg / blue text; inactive nav link = `blue-50` text with lighter-blue hover.

### Logo positioning
- **`Layout.jsx`** — removed the centered `max-w-5xl` container on the header row so "GodsPeoples" sits flush-left full-width; kept responsive gutters (`px-4` → `sm:px-6`).

### Home page content
- **`Home.jsx`** — removed the four feature cards (React Router / TanStack Query / Axios / Tailwind CSS).
- **`Home.jsx`** — center-aligned the section (`text-center`, paragraph `mx-auto`).
- **`Home.jsx`** — justified the intro paragraph (`text-justify`).
- **`Home.jsx`** — added a new paragraph: "Enter and be 'humbled' by God".
- **`Home.jsx`** — styled that paragraph **bold**, larger (`text-3xl`), color **gold** (`text-[gold]`).
- **`Home.jsx`** — set the "Welcome to GodsPeoples" heading font size to `36px`, then changed to `52px`.

### ENTER button
- **`Home.jsx`** — added an **ENTER** button below the gold label, separated by `mt-10` (~10 spaces of gap).
- **`Home.jsx`** — wired the button to navigate to `/upload` via `useNavigate`.
- **`Home.jsx`** — added `cursor-pointer` so it shows the hand cursor on hover.

### File upload feature
- **`src/features/upload/useUploadFiles.js`** (new) — TanStack Query `useMutation` posting `multipart/form-data` to `/upload` with Axios upload-progress tracking.
- **`src/components/FileUpload.jsx`** (new) — accessible drag-and-drop + click-to-browse uploader: type allowlist (PNG/JPG/GIF/WEBP/PDF), per-file size cap, de-duplicated file list with remove, progress bar, success/error states, keyboard + ARIA support.
- **`src/pages/Upload.jsx`** (new) — page wrapping `FileUpload`.
- **`App.jsx`** — added the `/upload` route.
- Verified: lint + build pass.

### File upload refinements
- **`FileUpload.jsx`** — raised per-file size limit from 10 MB to **100 MB**.
- **`FileUpload.jsx`** — added a waiting **spinner** ("Waiting for file selection…") shown in the dropzone after "Click to browse" is clicked; clears on file selection or when the dialog closes (window refocus).
- **`FileUpload.jsx`** — added per-file **Name** (required) and **Description** (optional) fields after a file is chosen. Name defaults to the file's base name; blank/missing Name blocks upload with an inline "Name is required" error that clears on valid input.
- **`useUploadFiles.js`** — now sends a parallel `metadata` JSON field (`{ name, description }` per file) in the FormData.
- Verified: lint + build pass.

### Documentation
- **`fe_claude_session.md`** (new) — this changelog; will be updated as work continues.

### File upload layout tweak
- **`FileUpload.jsx`** — stacked the Name/Description fields vertically (Description now sits below Name instead of side-by-side) and changed **Description** from a single-line input to a 3-row, vertically-resizable `<textarea>`.

### File upload thumbnail preview
- **`FileUpload.jsx`** — added a square (48×48) inset preview to the left of each file's name, shifting the filename/size to the right. Image files render a cropped `object-cover` thumbnail via object URLs (`useMemo`, revoked on cleanup to avoid leaks); non-image files show a generic document icon placeholder.

### File upload scrollable list
- **`FileUpload.jsx`** — capped the selected-files list height (`max-h-96`) with `overflow-y-auto`, so a vertical scrollbar appears when the attached files no longer fit; the dropzone and action buttons stay fixed.

### File upload auto-scroll
- **`FileUpload.jsx`** — the list now auto-scrolls (`scroll-smooth`) to the newest entry when files are added, using a list ref + previous-count ref to scroll only on additions (not removals).
