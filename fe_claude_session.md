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

### Wire upload to real images API
- **`.env`** / **`.env.example`** — `VITE_API_BASE_URL` set to `http://localhost:4000/api/v1`.
- **`useUploadFiles.js`** — reworked to POST one request **per file** to `/images` as `multipart/form-data` with fields `image` (file, required), `name` (required), and `description` (optional, omitted when blank). Aggregates upload progress across all files into a single 0–100 value.

### Vite dev proxy (CORS-free dev)
- **`vite.config.js`** — added a `server.proxy` rule forwarding `/api` → `http://localhost:4000` (`changeOrigin: true`), so dev requests are same-origin and avoid CORS.
- **`.env`** / **`.env.example`** — changed `VITE_API_BASE_URL` to the relative `/api/v1` so calls route through the proxy in dev; documented setting a full API origin for deployed builds.

### Upload button cursor
- **`FileUpload.jsx`** — added `cursor-pointer` to the Upload button (hand cursor on hover); disabled state still shows `cursor-not-allowed`.

### People page — Netflix-style image gallery
- **`src/features/images/useImages.js`** (new) — `useInfiniteQuery` hook fetching `GET /images?page=&limit=` (response `{data,total,page,limit}`); computes next page from `page * limit < total`. Page size 24.
- **`src/components/ImageCard.jsx`** (new) — poster card (2:3 aspect): lazy-loaded image with fade-in, skeleton shimmer while loading, broken-image fallback icon, bottom gradient caption showing the name always and the description revealed on hover; hover scale/zoom effect. Resolves the picture URL from common field names (`url`/`imageUrl`/`src`/`path`).
- **`src/pages/People.jsx`** — rewritten from the placeholder JSON dump into a responsive grid gallery (2→6 columns) with **infinite scroll** via `IntersectionObserver` (400px rootMargin), skeleton loaders for initial + next-page loads, and empty/error states.
- Removed unused **`src/features/people/usePeople.js`** (and its dir) — superseded by the images gallery.

### Fix: images not rendering on People page
- Inspected the live API: the picture is a base64 data URI in the **`image`** field (not `url`/`src`), and pagination is nested under a **`pagination`** object (`{ total, page, limit, totalPages, hasNextPage }`), not top-level.
- **`ImageCard.jsx`** — `resolveUrl` now reads `image` first (then the URL fallbacks), so the base64 data URI renders.
- **`useImages.js`** — `getNextPageParam` now reads `lastPage.pagination` (prefers `hasNextPage`, falls back to page/total math), fixing infinite scroll.

### Perf: stop loading full-res base64 in the gallery
Backend was inlining each picture as a base64 data URI in the list (one image was ~7.6 MB → ~10 MB base64 per record). Switched to lightweight metadata + a cacheable raw-image URL. (Backend changes tracked in `be-god-peoples/be_claude_session.md`.)
- **`useImages.js`** — added `imageRawUrl(id)` = `${VITE_API_BASE_URL}/images/:id/raw`; `fetchImages` now maps each list item to include a `url` pointing at that endpoint (the list no longer returns base64).
- **`ImageCard.jsx`** — unchanged logic; `resolveUrl` already falls back to `url`, so cards now load from the `/raw` endpoint with `loading="lazy"` genuinely deferring off-screen downloads.

### Housekeeping / cleanup (DRY, KISS, YAGNI)
- **DRY** — the API base URL was duplicated in `lib/api.js` and `features/images/useImages.js`. Now exported once as `API_BASE_URL` from `lib/api.js` and imported in `useImages.js`.
- **YAGNI** — `ImageCard.jsx` `resolveUrl` had a speculative 6-field fallback chain; trimmed to `image.url ?? image.image` (the two shapes that actually occur) and inlined.
- **Dead code** — `FileUpload.jsx` `validateFile` guarded with `ACCEPTED_TYPES.length && …` (always true for a non-empty const); removed the redundant check.
- **DRY** — `People.jsx` duplicated the skeleton-grid JSX (initial + next-page loads); extracted a `SkeletonGrid` component and lifted `gridClass` to module scope.
- **Consistency** — `NotFound.jsx` "Back home" button used `indigo`; switched to the app's `blue` primary.
- **Docs** — replaced the default Vite boilerplate `README.md` with a real project README.
- Reviewed for memory leaks: IntersectionObserver (People), window focus listener (FileUpload), and object-URL previews (FileUpload) are all correctly torn down/revoked — no changes needed. Lint + build pass.

### Robustness: per-file partial-upload handling
Previously a multi-file upload aborted the whole batch on the first failure, leaving already-uploaded files on the server with only a generic error shown.
- **`useUploadFiles.js`** — now takes `items: [{ file, key, name, description }]` and attempts each file independently (try/catch per request; a failure no longer aborts the rest). Returns `{ succeeded: [{key,data}], failed: [{key,message}] }`. Progress still advances per file (bytes counted in `finally`).
- **`FileUpload.jsx`** — on completion: uploaded files are removed from the list (with their metadata), failed files stay put with an inline "Upload failed: …" message for retry. Added `uploadErrors` state (keyed by fileKey) and a `forgetKey` helper to drop a key from all per-file maps (meta/nameErrors/uploadErrors). Status banner now summarizes the batch (e.g. "Uploaded 3 images. 1 failed — see the errors above and retry."); clicking Upload again retries only the remaining failed files.

### Image card cursor
- **`ImageCard.jsx`** — added `cursor-pointer` so hovering over a gallery image on the People page shows the hand cursor.

### Lightbox — open image in larger view
- **`useImages.js`** — exported a shared `imageSrc(img)` helper (reused by card + lightbox; DRY).
- **`ImageCard.jsx`** — now accepts an `onClick`, is keyboard-accessible (`role="button"`, tabIndex, Enter/Space, focus ring), and uses `imageSrc`.
- **`src/components/Lightbox.jsx`** (new) — accessible full-size modal (`role="dialog"`, `aria-modal`): dark blurred backdrop, close via backdrop click / X button / Escape, body-scroll lock while open, image shown `object-contain` up to 80vh with name + description caption.
- **`People.jsx`** — tracks a `selected` image; clicking a card opens the `Lightbox`, closing clears it.

### Navigation loading spinner
- **`src/components/Spinner.jsx`** (new) — reusable animated spinner (size/color via `className`).
- **`App.jsx`** — pages (`Home`/`People`/`Upload`/`NotFound`) converted to `React.lazy` (code-split into separate chunks; main bundle ~330KB→~251KB).
- **`Layout.jsx`** — wrapped `<Outlet/>` in `<Suspense>` with a centered Spinner fallback (`role="status"`), so selecting Home/People shows a spinner in the content area while the page chunk loads; the nav bar stays visible. (Chunks are cached after first load, so the spinner shows on first visit; People then continues with its own data skeletons.)
