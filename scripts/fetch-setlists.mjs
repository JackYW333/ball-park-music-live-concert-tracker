/**
 * Fetches Ball Park Music setlists from setlist.fm and writes to public/data/setlists.json.
 *
 * Usage:
 *   SETLISTFM_API_KEY=your_key node scripts/fetch-setlists.mjs           # full sweep
 *   SETLISTFM_API_KEY=your_key node scripts/fetch-setlists.mjs --recent  # recent pages only (merge)
 *
 * Get a free API key at: https://api.setlist.fm/docs/1.0/index.html
 *
 * Ball Park Music's MusicBrainz ID: cd43cafe-ff56-491e-99bb-31770bdd78a6
 * Verify at: https://www.setlist.fm/setlists/ball-park-music-3bd66823.html
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import https from 'https'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = join(__dirname, '..', 'public', 'data', 'setlists.json')
const MANUAL_ASSIGNMENTS_PATH = join(__dirname, '..', 'config', 'manual-tour-assignments.json')
const TOUR_DATE_RULES_PATH = join(__dirname, '..', 'config', 'tour-date-rules.json')
const TOUR_REVIEW_PATH = join(__dirname, '..', 'config', 'tour-review-needed.json')
const INFER_WINDOW_DAYS = 30

const API_KEY = process.env.SETLISTFM_API_KEY
const ARTIST_MBID = process.env.BALL_PARK_MUSIC_MBID || 'cd43cafe-ff56-491e-99bb-31770bdd78a6'
const BASE_URL = 'https://api.setlist.fm/rest/1.0'
const RECENT_PAGES = 3 // ~60 shows, covers roughly the last year

const RECENT_MODE = process.argv.includes('--recent')

// Custom HTTPS agent — works on systems where Node's bundled CA store
// doesn't include the issuer for api.setlist.fm.
const agent = new https.Agent({ rejectUnauthorized: false })

if (!API_KEY) {
  console.error('Error: SETLISTFM_API_KEY environment variable is not set.')
  console.error('Get a free key at https://api.setlist.fm/docs/1.0/index.html')
  process.exit(1)
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { agent, headers: { 'x-api-key': API_KEY, 'Accept': 'application/json' } }, res => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, json: () => JSON.parse(data) }))
    }).on('error', reject)
  })
}

async function fetchPage(page) {
  const url = `${BASE_URL}/artist/${ARTIST_MBID}/setlists?p=${page}`
  const res = await httpsGet(url)

  if (res.status === 429) {
    const retryAfter = Number(res.headers['retry-after'] || '10')
    console.log(`Rate limited. Waiting ${retryAfter}s…`)
    await sleep(retryAfter * 1000)
    return fetchPage(page)
  }

  if (res.status !== 200) {
    throw new Error(`API error: ${res.status} (page ${page})`)
  }

  return res.json()
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function parseSongs(sets) {
  const songs = []
  const setList = sets?.set || []
  setList.forEach(set => {
    const encoreNum = set.encore || 0
    ;(set.song || []).forEach(song => {
      if (!song.name?.trim()) return
      songs.push({
        name: song.name.trim(),
        tape: Boolean(song.tape),
        encore: encoreNum,
        cover: song.cover ? { name: song.cover.name } : null,
        info: song.info?.trim() || null,
      })
    })
  })
  return songs
}

function parseShow(setlist) {
  const [d, m, y] = setlist.eventDate.split('-')
  const date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  const venue = setlist.venue || {}
  const city = venue.city || {}
  const country = city.country || {}
  return {
    id: setlist.id,
    date,
    venue: venue.name || '',
    city: city.name || '',
    state: city.state || '',
    country: country.name || '',
    countryCode: country.code || '',
    lat: city.coords?.lat || null,
    lng: city.coords?.long || null,
    tour: setlist.tour?.name || null,
    setlistFmUrl: setlist.url || null,
    songs: parseSongs(setlist.sets),
  }
}

function loadExisting() {
  try {
    return JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'))
  } catch {
    return { setlists: [] }
  }
}

function save(setlists) {
  const withSetlist = setlists.filter(s => s.songs.length > 0).length
  const output = {
    lastUpdated: new Date().toISOString(),
    total: setlists.length,
    totalWithSetlist: withSetlist,
    setlists,
  }
  mkdirSync(join(__dirname, '..', 'public', 'data'), { recursive: true })
  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2))
  console.log(`✓ ${setlists.length} shows total (${withSetlist} with setlist, ${setlists.length - withSetlist} without)`)
}

async function fullSweep() {
  console.log('Mode: full sweep')
  const first = await fetchPage(1)
  const total = first.total || 0
  const perPage = first.itemsPerPage || 20
  const totalPages = Math.ceil(total / perPage)
  console.log(`Found ${total} shows across ${totalPages} pages`)

  let all = first.setlist || []
  for (let page = 2; page <= totalPages; page++) {
    console.log(`Fetching page ${page}/${totalPages}…`)
    await sleep(500)
    const data = await fetchPage(page)
    all = all.concat(data.setlist || [])
  }

  const parsed = all.map(parseShow).sort((a, b) => b.date.localeCompare(a.date))
  const processed = inferTours(parsed)
  save(processed)
}

async function recentMerge() {
  console.log(`Mode: recent (${RECENT_PAGES} pages) + merge`)
  const existing = loadExisting()
  const byId = new Map(existing.setlists.map(s => [s.id, s]))

  const first = await fetchPage(1)
  let fetched = first.setlist || []

  for (let page = 2; page <= RECENT_PAGES; page++) {
    console.log(`Fetching page ${page}/${RECENT_PAGES}…`)
    await sleep(500)
    const data = await fetchPage(page)
    fetched = fetched.concat(data.setlist || [])
  }

  let added = 0, updated = 0
  fetched.map(parseShow).forEach(show => {
    const prev = byId.get(show.id)
    if (!prev) {
      byId.set(show.id, show)
      added++
    } else if (show.songs.length > prev.songs.length) {
      // Setlist has been filled in or expanded since last fetch
      byId.set(show.id, show)
      updated++
    }
  })

  if (added === 0 && updated === 0) {
    console.log('No changes detected.')
    // Still write to update lastUpdated timestamp
  } else {
    console.log(`${added} new show(s), ${updated} updated setlist(s)`)
  }

  const merged = inferTours(Array.from(byId.values()).sort((a, b) => b.date.localeCompare(a.date)))
  save(merged)
}

function absDaysBetween(dateA, dateB) {
  return Math.abs(Math.round((new Date(dateA) - new Date(dateB)) / 86400000))
}

function loadDateRules() {
  try {
    return JSON.parse(readFileSync(TOUR_DATE_RULES_PATH, 'utf8'))
  } catch {
    return []
  }
}

function loadManualAssignments() {
  try {
    const list = JSON.parse(readFileSync(MANUAL_ASSIGNMENTS_PATH, 'utf8'))
    return new Map(list.map(a => [a.id, a.tour]))
  } catch {
    return new Map()
  }
}

function inferTours(shows) {
  const manualAssignments = loadManualAssignments()
  const dateRules = loadDateRules()

  // Build date span + all show dates for each named tour
  const tourRanges = {}
  shows.forEach(show => {
    if (!show.tour) return
    if (!tourRanges[show.tour]) tourRanges[show.tour] = { from: show.date, to: show.date, dates: [] }
    const r = tourRanges[show.tour]
    if (show.date < r.from) r.from = show.date
    if (show.date > r.to) r.to = show.date
    r.dates.push(show.date)
  })

  const needsReview = []
  let autoAssigned = 0
  let manualApplied = 0
  let ruleApplied = 0

  const processed = shows.map(show => {
    // Manual assignments always win
    if (manualAssignments.has(show.id)) {
      const tour = manualAssignments.get(show.id)
      if (tour && !show.tour) manualApplied++
      return { ...show, tour: tour ?? show.tour }
    }

    if (show.tour) return show

    // Apply date-range rules
    const rule = dateRules.find(r =>
      show.date >= r.from && show.date <= r.to &&
      (!r.country || show.country === r.country)
    )
    if (rule) {
      ruleApplied++
      return { ...show, tour: rule.tour }
    }

    // Find tours whose date span contains this show's date
    const candidates = Object.entries(tourRanges)
      .filter(([, r]) => show.date >= r.from && show.date <= r.to)
      .map(([tourName, r]) => ({
        tourName,
        nearest: r.dates.reduce((min, d) => Math.min(min, absDaysBetween(show.date, d)), Infinity),
      }))

    if (candidates.length === 0) return show  // Genuinely standalone

    const withinWindow = candidates
      .filter(c => c.nearest <= INFER_WINDOW_DAYS)
      .sort((a, b) => a.nearest - b.nearest)

    if (withinWindow.length === 0) {
      needsReview.push({
        id: show.id,
        date: show.date,
        venue: show.venue,
        city: show.city,
        country: show.country,
        candidateTours: candidates
          .sort((a, b) => a.nearest - b.nearest)
          .map(c => ({ tour: c.tourName, nearestShowDays: c.nearest })),
        tour: null,
      })
      return show
    }

    autoAssigned++
    return { ...show, tour: withinWindow[0].tourName }
  })

  if (needsReview.length > 0) {
    writeFileSync(TOUR_REVIEW_PATH, JSON.stringify(needsReview, null, 2))
    console.log(`⚠  ${needsReview.length} show(s) need manual tour assignment → config/tour-review-needed.json`)
    console.log(`   Fill in "tour" values and add entries to config/manual-tour-assignments.json, then re-run.`)
  } else {
    console.log('✓ No shows need manual tour review.')
  }
  console.log(`✓ Tour inference: ${autoAssigned} auto-assigned, ${ruleApplied} from date rules, ${manualApplied} from manual-tour-assignments.json`)

  return processed
}

async function main() {
  console.log('Fetching Ball Park Music setlists from setlist.fm…')
  if (RECENT_MODE) {
    await recentMerge()
  } else {
    await fullSweep()
  }
}

main().catch(err => {
  console.error('Fatal error:', err.message)
  process.exit(1)
})
