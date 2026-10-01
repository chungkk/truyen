# truyen

Next.js app (deployed on Vercel) for reading crawled stories.

## How data flows

- `output/<slug>/metadata.json` + `chapter_XXX.txt` – raw crawler output, committed to git.
- `src/data/stories.json` – story metadata bundled into the app. Generated from `output/` by `npm run build-data`; commit it after re-crawling.
- Chapter content is fetched at request time from GitHub raw
  (`https://raw.githubusercontent.com/chungkk/truyen/main/output/...`), so **the repo must be public** for chapters to load.

## Commands

```bash
npm install
npm run build-data   # regenerate src/data/stories.json from output/
npm run dev
npm run build
npm run lint
```

## Deploy

Vercel builds with `npm run build`. `output/`, `mobile/` and `mobile_src/` are excluded via `.vercelignore`.
