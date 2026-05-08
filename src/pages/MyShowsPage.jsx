import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb.jsx'
import AlbumBadge from '../components/AlbumBadge.jsx'
import { formatDate, getAlbum } from '../utils/stats.js'

export default function MyShowsPage({ data, attendance }) {
  const { loading, error, setlists } = data
  const { attended, exportAttendance, importAttendance } = attendance
  const fileInputRef = useRef(null)

  const myShows = useMemo(
    () => setlists.filter(s => attended.has(s.id)).sort((a, b) => b.date.localeCompare(a.date)),
    [setlists, attended]
  )

  const stats = useMemo(() => {
    const countries = new Set(myShows.map(s => s.countryCode))
    const cities = new Set(myShows.map(s => `${s.city}||${s.countryCode}`))
    const songCounts = {}
    myShows.forEach(s => s.songs.forEach(song => {
      if (!song.tape) songCounts[song.name] = (songCounts[song.name] || 0) + 1
    }))
    const rankedSongs = Object.entries(songCounts)
      .map(([name, count]) => ({ name, count, album: getAlbum(name) }))
      .sort((a, b) => b.count - a.count)
    return { countries: countries.size, cities: cities.size, songs: rankedSongs.length, rankedSongs }
  }, [myShows])

  const [songsExpanded, setSongsExpanded] = useState(false)
  const SONG_LIMIT = 20

  if (loading) return <div className="loading">Loading…</div>
  if (error) return <div className="loading">Error: {error}</div>

  return (
    <div className="page-container">
      <Breadcrumb items={[{ label: 'Overview', to: '/' }, { label: 'My Shows' }]} />

      <div className="page-heading" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>My Shows</h1>
          <p className="sub">Track the shows you've attended</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button className="attend-action-btn" onClick={exportAttendance} disabled={attended.size === 0}>
            Export
          </button>
          <label className="attend-action-btn" style={{ cursor: 'pointer' }}>
            Import
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={e => {
                if (e.target.files[0]) importAttendance(e.target.files[0])
                e.target.value = ''
              }}
            />
          </label>
        </div>
      </div>

      {attended.size === 0 ? (
        <div className="empty">
          No shows marked yet. Open a concert page and click <strong>Mark as Attended</strong> to get started.
        </div>
      ) : (
        <>
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
            <div className="stat-card">
              <div className="stat-card__value">{myShows.length}</div>
              <div className="stat-card__label">Shows Attended</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{stats.countries}</div>
              <div className="stat-card__label">Countries</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{stats.cities}</div>
              <div className="stat-card__label">Cities</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{stats.songs}</div>
              <div className="stat-card__label">Unique Songs Heard</div>
            </div>
          </div>

          <div className="section">
            <div className="section-title">Songs I've Heard Live</div>
            <div className="card">
              <ol className="ranked-list">
                {(songsExpanded ? stats.rankedSongs : stats.rankedSongs.slice(0, SONG_LIMIT)).map((s, i) => (
                  <li key={s.name}>
                    <span className="ranked-list__rank">{i + 1}</span>
                    <Link to={`/song/${encodeURIComponent(s.name)}`} className="ranked-list__name" style={{ color: 'var(--text)' }}>
                      {s.name}
                    </Link>
                    <AlbumBadge album={s.album} />
                    <div className="ranked-list__bar-wrap">
                      <div className="ranked-list__bar" style={{ width: `${Math.round((s.count / stats.rankedSongs[0].count) * 100)}%` }} />
                    </div>
                    <span className="ranked-list__meta">{s.count}×</span>
                  </li>
                ))}
              </ol>
              {stats.rankedSongs.length > SONG_LIMIT && (
                <button
                  onClick={() => setSongsExpanded(e => !e)}
                  style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  {songsExpanded ? 'Show less' : `Show all ${stats.rankedSongs.length} songs`}
                </button>
              )}
            </div>
          </div>

          <div className="section">
            <div className="section-title">Shows I've Attended</div>
            <div className="table-scroll">
              <table className="shows-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Venue</th>
                    <th>City</th>
                    <th>Country</th>
                    <th>Tour</th>
                    <th>Songs</th>
                  </tr>
                </thead>
                <tbody>
                  {myShows.map((show, i) => (
                    <tr key={show.id}>
                      <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{i + 1}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <Link to={`/concert/${show.id}`}>{formatDate(show.date)}</Link>
                      </td>
                      <td><Link to={`/concert/${show.id}`}>{show.venue}</Link></td>
                      <td>
                        <Link to={`/city/${encodeURIComponent(show.city)}/${show.countryCode}`} style={{ color: 'var(--text)' }}>
                          {show.city}
                        </Link>
                      </td>
                      <td>
                        <Link to={`/country/${show.countryCode}`}>
                          <span className="country-code">{show.countryCode}</span>
                        </Link>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {show.tour ? <Link to={`/tour/${encodeURIComponent(show.tour)}`}>{show.tour}</Link> : '—'}
                      </td>
                      <td>{show.songs.filter(s => !s.tape).length || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
