# EVzone My Accounts Portal (Vite + React + TypeScript + MUI + Tailwind + Lucide)

This repo is a **plug-and-play** UI shell for the EVzone **My Accounts** platform.

## Quick start

```bash
npm install
npm run dev
```

Open: http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Notes

- All pages are mapped in `src/router/AppRouter.tsx`.
- This project uses **Tailwind** (utility classes) together with **MUI** (`sx` system).
- Lucide icons are installed and used on the pages that import `lucide-react`.
- The included pages are based on your attached canvases (auth + app + legal + status + errors).

## Environment

If you later connect real APIs, put environment variables in `.env`:

```bash
VITE_API_BASE_URL=https://api.example.com
VITE_OIDC_ISSUER=https://id.evzone.com
```
