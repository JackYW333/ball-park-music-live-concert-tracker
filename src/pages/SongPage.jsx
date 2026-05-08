import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb.jsx'
import StatCard from '../components/StatCard.jsx'
import AlbumBadge from '../components/AlbumBadge.jsx'
import { getAlbum, formatDate, computeSongGaps, countShowsWithSetlist } from '../utils/stats.js'
import songNotes from '../../config/song-notes.json'

function getPosition(show, songName) {
  const liveSongs = show.songs.filter(s => !s.tape)
  const idx = liveSongs.findIndex(s => s.name === songName)
  if (idx === -1) return null
  if (idx === 0) return 'Opener'
  if (idx === liveSongs.length - 1) return 'Closer'
  const song = liveSongs[idx]
  if (song.encore > 0) return song.encore > 1 ? `Encore ${song.encore}` : 'Encore'
  return null
}

export default function SongPage({ data, attendance }) {
  const { songName } = useParams()
  const decoded = decodeURIComponent(songName)
  const { loading, error, setlists, debutMap } = data
  const { attended } = attendance

  const album = getAlbum(decoded)

  const shows = useMemo(
    () => setlists
      .filter(s => s.songs.some(song => !song.tape && song.name === decoded))
      .sort((a, b) => a.date.localeCompare(b.date)),
    [setlists, decoded]
  )

  const gaps = useMemo(() => computeSongGaps(setlists, decoded), [setlists, decoded])
  const [expandedNotes, setExpandedNotes] = useState(new Set())

  if (loading) return <div className="loading">Loading…</div>
  if (error) return <div className="loading">Error: {error}</div>
  if (!shows.length) return (
    <div className="page-container">
      <Breadcrumb items={[{ label: 'Overview', to: '/' }, { label: 'All Songs', to: '/songs' }, { label: decoded }]} />
      <div className="page-heading" style={{ opacity: 0.6 }}>
        <h1>{decoded}</h1>
        <div style={{ marginTop: '0.5rem' }}><AlbumBadge album={album} /></div>
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', marginTop: '1rem' }}>
        This song has never been played live.
      </p>
    </div>
  )

  const first = shows[0]
  const last = shows[shows.length - 1]
  const showsWithSetlist = countShowsWithSetlist(setlists)

  // Use the earlier of album release date and live debut as the denominator start
  const debutDate = debutMap[decoded] || null
  const releaseDate = album?.releaseDate || null
  const effectiveStart = [debutDate, releaseDate].filter(Boolean).sort()[0] || null
  const pctAll = showsWithSetlist ? Math.round((shows.length / showsWithSetlist) * 100) : 0
  const pctBase = effectiveStart
    ? setlists.filter(s => s.date >= effectiveStart && s.songs.some(song => !song.tape)).length
    : showsWithSetlist
  const pct = pctBase ? Math.round((shows.length / pctBase) * 100) : 0
  const pctLabel = effectiveStart === releaseDate
    ? 'Of Shows Since Release'
    : 'Of Shows Since Debut'
  const toggleNote = id => setExpandedNotes(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })
  const note = songNotes[decoded]?.note

  return (
    <div className="page-container">
      <Breadcrumb items={[{ label: 'Overview', to: '/' }, { label: 'All Songs', to: '/songs' }, { label: decoded }]} />

      <div className="page-heading">
        <h1>{decoded}</h1>
        <div style={{ marginTop: '0.5rem' }}><AlbumBadge album={album} /></div>
      </div>

      {note && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderLeft: '3px solid var(--accent)', borderRadius: '6px',
          padding: '0.75rem 1rem', marginBottom: '1.5rem',
          fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6,
        }}>
          {note}
        </div>
      )}

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))' }}>
        <StatCard value={shows.length} label="Times Played" />
        <StatCard value={`${pctAll}%`} label="Of All Shows" />
        {effectiveStart && <StatCard value={`${pct}%`} label={pctLabel} />}
        <StatCard value={formatDate(first.date)} label="First Played" />
        <StatCard value={formatDate(last.date)} label="Last Played" />
        {gaps && <StatCard value={`${gaps.showsSinceLast} shows / ${gaps.daysSinceLast} days`} label="Since Last Played" />}
        {gaps?.longestGap > 0 && (
          <StatCard
            value={`${gaps.longestGap} days`}
            label={`Longest Break (${gaps.longestGapFrom?.slice(0,4)}–${gaps.longestGapTo?.slice(0,4)})`}
          />
        )}
        <div className="stat-card stat-card--seen">
          <div className="stat-card__value" style={{ color: 'var(--green)' }}>
            {shows.filter(s => attended.has(s.id)).length}
          </div>
          <div className="stat-card__label">Times Seen Live</div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">All Performances</div>
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
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {shows.map((show, i) => {
                const pos = getPosition(show, decoded)
                const isDebut = debutMap[decoded] === show.date
                const songEntry = show.songs.find(s => !s.tape && s.name === decoded)
                const info = songEntry?.info || null
                const wasAttended = attended.has(show.id)
                return (
                  <tr key={show.id} className={wasAttended ? 'attended-row' : ''}>
                    <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{i + 1}</td>
                    <td style={{ whiteSpace: 'nowrap' }}><Link to={`/concert/${show.id}`}>{formatDate(show.date)}</Link></td>
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
                    <td
                      style={{
                        maxWidth: expandedNotes.has(show.id) ? 'none' : 200,
                        overflow: 'hidden',
                        textOverflow: expandedNotes.has(show.id) ? 'unset' : 'ellipsis',
                        whiteSpace: expandedNotes.has(show.id) ? 'normal' : 'nowrap',
                        fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic',
                        cursor: info ? 'pointer' : 'default',
                        userSelect: 'none',
                      }}
                      onClick={() => info && toggleNote(show.id)}
                      title={info && !expandedNotes.has(show.id) ? 'Click to expand' : undefined}
                    >
                      {info || '—'}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                        {isDebut && <span className="tag tag--debut">debut</span>}
                        {pos && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pos}</span>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
