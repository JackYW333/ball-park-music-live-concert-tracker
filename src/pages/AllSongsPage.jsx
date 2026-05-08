import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AlbumBadge from '../components/AlbumBadge.jsx'
import { computeSongStats, sortKey } from '../utils/stats.js'
import albumData from '../../config/albums.json'
import Breadcrumb from '../components/Breadcrumb.jsx'
import SearchInput from '../components/SearchInput.jsx'

// Build lookup: song name (lowercase) → { albumIndex, trackIndex, album }
const songPositionMap = {}
albumData.forEach((album, albumIndex) => {
  album.songs.forEach((songName, trackIndex) => {
    songPositionMap[songName.toLowerCase()] = { albumIndex, trackIndex, album }
  })
})

function getSongPosition(name) {
  return songPositionMap[name.toLowerCase()] ?? { albumIndex: Infinity, trackIndex: Infinity, album: null }
}

export default function AllSongsPage({ data }) {
  const { loading, error, setlists } = data
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('plays')

  const songs = useMemo(() => computeSongStats(setlists), [setlists])

  const unplayed = useMemo(() => {
    const played = new Set(songs.map(s => s.name.toLowerCase()))
    const result = []
    albumData.forEach(album => {
      album.songs.forEach(songName => {
        if (!played.has(songName.toLowerCase()))
          result.push({ name: songName, count: 0, dates: [], album, neverPlayed: true })
      })
    })
    return result
  }, [songs])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? songs.filter(s => s.name.toLowerCase().includes(q)) : songs
  }, [songs, search])

  const filteredUnplayed = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? unplayed.filter(s => s.name.toLowerCase().includes(q)) : unplayed
  }, [unplayed, search])

  const sorted = useMemo(() => {
    const all = [...filtered, ...filteredUnplayed]
    if (sortBy === 'plays') return all
    if (sortBy === 'name') return all.sort((a, b) => sortKey(a.name).localeCompare(sortKey(b.name)))
    if (sortBy === 'album') {
      return all.sort((a, b) => {
        const pa = getSongPosition(a.name)
        const pb = getSongPosition(b.name)
        if (pa.albumIndex !== pb.albumIndex) return pa.albumIndex - pb.albumIndex
        return pa.trackIndex - pb.trackIndex
      })
    }
    return all
  }, [filtered, filteredUnplayed, sortBy])

  // When sorting by release, group into sections per album
  const releaseGroups = useMemo(() => {
    if (sortBy !== 'album') return null
    const groups = []
    let currentAlbumIndex = null
    let currentGroup = null
    sorted.forEach(song => {
      const { albumIndex, album } = getSongPosition(song.name)
      if (albumIndex !== currentAlbumIndex) {
        currentAlbumIndex = albumIndex
        currentGroup = { album: album ?? null, songs: [] }
        groups.push(currentGroup)
      }
      currentGroup.songs.push(song)
    })
    return groups
  }, [sorted, sortBy])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return <div className="loading">Error: {error}</div>

  const max = songs[0]?.count || 1

  return (
    <div className="page-container">
      <Breadcrumb items={[{ label: 'Overview', to: '/' }, { label: 'All Songs' }]} />

      <div className="page-heading">
        <h1>All Songs</h1>
        <p className="sub">
          {songs.length} unique songs played live
          <span style={{ margin: '0 0.5rem', color: 'var(--border)' }}>·</span>
          <Link to="/debuts" style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>Song Debuts →</Link>
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search songs…" />
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[['plays', 'Most Played'], ['name', 'A–Z'], ['album', 'By Release']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setSortBy(val)}
              style={{
                background: sortBy === val ? 'var(--accent)' : 'var(--bg-card)',
                color: sortBy === val ? '#fff' : 'var(--text-muted)',
                border: '1px solid var(--border)', borderRadius: '5px',
                padding: '0.3rem 0.65rem', cursor: 'pointer', fontSize: '0.8rem',
              }}
            >{label}</button>
          ))}
        </div>
      </div>

      {releaseGroups ? (
        // Grouped by release
        releaseGroups.map((group, gi) => (
          <div key={gi} className="section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
              {group.album
                ? <Link to={`/album/${group.album.id}`} style={{ textDecoration: 'none' }}><AlbumBadge album={group.album} /></Link>
                : <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Unknown release</span>}
              {group.album?.year && <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{group.album.year}</span>}
            </div>
            <div className="card">
              <ol className="ranked-list">
                {group.songs.map((s, i) => (
                  <li key={s.name} style={{ opacity: s.neverPlayed ? 0.4 : 1 }}>
                    <span className="ranked-list__rank">{s.neverPlayed ? '—' : i + 1}</span>
                    <Link to={`/song/${encodeURIComponent(s.name)}`} className="ranked-list__name" style={{ color: 'var(--text)' }}>{s.name}</Link>
                    {!s.neverPlayed && (
                      <div className="ranked-list__bar-wrap">
                        <div className="ranked-list__bar" style={{ width: `${Math.round((s.count / max) * 100)}%` }} />
                      </div>
                    )}
                    <span className="ranked-list__meta">{s.neverPlayed ? 'never played' : `${s.count}×`}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ))
      ) : (
        // Flat list
        <div className="card">
          <ol className="ranked-list">
            {sorted.map((s, i) => (
              <li key={s.name} style={{ opacity: s.neverPlayed ? 0.4 : 1 }}>
                <span className="ranked-list__rank">{s.neverPlayed ? '—' : i + 1}</span>
                <Link to={`/song/${encodeURIComponent(s.name)}`} className="ranked-list__name" style={{ color: 'var(--text)' }}>{s.name}</Link>
                <AlbumBadge album={s.album} />
                {!s.neverPlayed && (
                  <div className="ranked-list__bar-wrap">
                    <div className="ranked-list__bar" style={{ width: `${Math.round((s.count / max) * 100)}%` }} />
                  </div>
                )}
                <span className="ranked-list__meta">{s.neverPlayed ? 'never played' : `${s.count}×`}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
