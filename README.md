# GodsPeoples — Frontend

The web frontend for the **GodsPeoples** project. It consumes the backend
(`be-god-peoples`) APIs to upload and browse images.

## Stack

- **React** + **Vite** (JavaScript)
- **React Router** — routing
- **TanStack Query** — server-state caching & data fetching
- **Axios** — HTTP client (`src/lib/api.js`)
- **Tailwind CSS** — styling

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
```

### Configuration

Copy `.env.example` to `.env` and set the API base URL:

```
VITE_API_BASE_URL=/api/v1
```

In development the relative `/api` path is proxied to the backend
(`http://localhost:4000`) by Vite (`vite.config.js`), avoiding CORS. For a
deployed build, set `VITE_API_BASE_URL` to the full API origin.

## Scripts

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `npm run dev`     | Start the Vite dev server    |
| `npm run build`   | Production build to `dist/`  |
| `npm run preview` | Preview the production build |
| `npm run lint`    | Run ESLint                   |

## Project structure

```
src/
├── App.jsx                 # Route definitions
├── main.jsx                # Providers: QueryClient + Router
├── components/             # Layout, FileUpload, ImageCard
├── pages/                  # Home, People (gallery), Upload, NotFound
├── features/               # Data hooks (images, upload)
└── lib/                    # api (axios) + queryClient
```

A running log of changes is kept in `fe_claude_session.md`.
