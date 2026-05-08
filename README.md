# Bloc Party — Live Stats

Interactive statistics for Bloc Party's live performances, powered by [setlist.fm](https://www.setlist.fm).

## Features

- **Overview** — all-time stats: show count, countries, cities, unique songs, most played songs, shows per year, album coverage, geographic breakdown, common openers/closers
- **Tours** — filter every stat by individual tour
- **Concert detail** — full setlist with debut detection and album labels
- **Members** — show counts per band member based on configurable membership periods

## Setup

### 1. Get a setlist.fm API key

Register for a free key at <https://api.setlist.fm/docs/1.0/index.html>.

### 2. Fetch initial data

```bash
npm install
SETLISTFM_API_KEY=your_key npm run fetch-data
```

This writes `public/data/setlists.json` with all historical shows.

### 3. Run locally

```bash
npm run dev
```

### 4. Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Secrets and variables → Actions** and add:
   - `SETLISTFM_API_KEY` — your setlist.fm API key
3. Go to **Settings → Pages** and set Source to **GitHub Actions**
4. Push to `main` — the Deploy workflow will build and publish automatically
5. The Fetch Data workflow runs daily at 06:00 UTC and auto-commits new show data

## Customisation

### Band members — `config/members.json`

Each member has an array of `periods` with `from` and `to` ISO dates (`null` for to = still active). Add multiple periods for members who left and returned.

```json
{
  "id": "kele",
  "name": "Kele Okereke",
  "role": "Vocals, Guitar",
  "periods": [
    { "from": "2003-01-01", "to": null }
  ]
}
```

### Albums & songs — `config/albums.json`

The song → album lookup table. Add or correct entries if setlist.fm song names differ from the names in the config (casing matters, but the lookup is case-insensitive).

### Bloc Party's MusicBrainz ID

The default MBID in `scripts/fetch-setlists.mjs` is `f3cd8c1a-c0e4-4f4c-9e36-76b1c6a58c86`.  
Verify it at <https://musicbrainz.org/artist/f3cd8c1a-c0e4-4f4c-9e36-76b1c6a58c86>.  
If wrong, update it or set the `BLOC_PARTY_MBID` environment variable.

## Tech stack

- React 18 + Vite
- React Router (HashRouter — no server config needed for GitHub Pages)
- Recharts for charts
- Plain CSS with custom properties
- Node.js ESM script for data fetching
- GitHub Actions for scheduled data refresh + GitHub Pages deployment
