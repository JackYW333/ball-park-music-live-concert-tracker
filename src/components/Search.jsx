import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import albumData from '../../config/albums.json'

export default function Search({ setlists }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const navigate = useNavigate()

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q || q.length < 2) return []

    const songs = new Map()
    const shows = []
    const venues = new Map()
    const cities = new Map()
    const countries = new Map()

    // Albums / releases
    const albums = albumData
      .filter(a => a.name.toLowerCase().includes(q))
      .map(a => ({ type: 'album', label: a.name, sub: a.year ? String(a.year) : 'Release', id: a.id }))

    setlists.forEach(show => {
      // Shows
      const showText = `${show.venue} ${show.city} ${show.date}`.toLowerCase()
      if (showText.includes(q)) {
        shows.push({ type: 'show', label: `${show.venue}`, sub: `${show.city} · ${show.date}`, id: show.id })
      }
      // Venues
      if (show.venue.toLowerCase().includes(q)) {
        const key = `${show.venue}||${show.city}`
        if (!venues.has(key)) venues.set(key, { type: 'venue', label: show.venue, sub: `${show.city}, ${show.country}`, venue: show.venue, city: show.city, countryCode: show.countryCode })
      }
      // Cities
      if (show.city.toLowerCase().includes(q)) {
        const key = `${show.city}||${show.countryCode}`
        if (!cities.has(key)) cities.set(key, { type: 'city', label: show.city, sub: show.country, city: show.city, countryCode: show.countryCode })
      }
      // Countries
      if (show.country.toLowerCase().includes(q)) {
        if (!countries.has(show.countryCode)) countries.set(show.countryCode, { type: 'country', label: show.country, sub: show.countryCode, code: show.countryCode })
      }
      // Songs
      show.songs.forEach(song => {
        if (song.tape) return
        if (song.name.toLowerCase().includes(q) && !songs.has(song.name)) {
          songs.set(song.name, { type: 'song', label: song.name, sub: 'Song', name: song.name })
        }
      })
    })

    // Never-played songs from albumData not already found in setlists
    albumData.forEach(album => {
      album.songs.forEach(songName => {
        if (songName.toLowerCase().includes(q) && !songs.has(songName)) {
          songs.set(songName, { type: 'song', label: songName, sub: 'Never played', name: songName })
        }
      })
    })

    return [
      ...albums.slice(0, 3),
      ...Array.from(songs.values()).slice(0, 4),
      ...Array.from(venues.values()).slice(0, 2),
      ...Array.from(cities.values()).slice(0, 2),
      ...Array.from(countries.values()).slice(0, 2),
      ...shows.slice(0, 3),
    ].slice(0, 10)
  }, [query, setlists])

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    function onClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function go(result) {
    setQuery('')
    setOpen(false)
    if (result.type === 'song') navigate(`/song/${encodeURIComponent(result.name)}`)
    else if (result.type === 'show') navigate(`/concert/${result.id}`)
    else if (result.type === 'venue') navigate(`/venue/${encodeURIComponent(result.venue)}/${encodeURIComponent(result.city)}/${result.countryCode}`)
    else if (result.type === 'city') navigate(`/city/${encodeURIComponent(result.city)}/${result.countryCode}`)
    else if (result.type === 'country') navigate(`/country/${result.code}`)
    else if (result.type === 'album') navigate(`/album/${result.id}`)
  }

  const typeIcon = { song: '🎵', show: '📅', venue: '📍', city: '🌍', country: '🌍', album: '💿' }
  const typeLabel = { song: 'Song', show: 'Show', venue: 'Venue', city: 'City', country: 'Country', album: 'Release' }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: '7px', padding: '0.3rem 0.6rem', gap: '0.4rem', width: 220 }}>
        <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>⌕</span>
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Search…"
          style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '0.85rem', width: '100%' }}
        />
        {!query && <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>⌘K</span>}
      </div>

      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '8px', minWidth: 280, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 200, overflow: 'hidden',
        }}>
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => go(r)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                width: '100%', padding: '0.6rem 0.9rem',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none',
                textAlign: 'left',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span style={{ fontSize: '0.8rem', width: 18, textAlign: 'center', flexShrink: 0 }}>{typeIcon[r.type]}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.sub}</div>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', flexShrink: 0 }}>{typeLabel[r.type]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
