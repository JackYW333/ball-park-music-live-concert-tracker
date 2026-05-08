import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb.jsx'
import SetlistView from '../components/SetlistView.jsx'
import { getDebutsForShow, formatDate } from '../utils/stats.js'

export default function ConcertPage({ data, attendance }) {
  const { id } = useParams()
  const { loading, error, setlists, debutMap } = data
  const { attended, toggleAttendance } = attendance

  const sorted = useMemo(
    () => [...setlists].sort((a, b) => a.date.localeCompare(b.date)),
    [setlists]
  )

  const showIndex = useMemo(() => sorted.findIndex(s => s.id === id), [sorted, id])
  const show = sorted[showIndex] ?? null
  const prev = showIndex > 0 ? sorted[showIndex - 1] : null
  const next = showIndex < sorted.length - 1 ? sorted[showIndex + 1] : null

  const debutNames = useMemo(() => {
    if (!show) return []
    return getDebutsForShow(show, debutMap)
  }, [show, debutMap])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return <div className="loading">Error: {error}</div>
  if (!show) return <div className="page-container"><div className="empty">Concert not found.</div></div>

  const liveSongs = show.songs.filter(s => !s.tape)

  return (
    <div className="page-container">
      <Breadcrumb items={show.tour
        ? [{ label: 'Tours', to: '/tours' }, { label: show.tour, to: `/tour/${encodeURIComponent(show.tour)}` }, { label: formatDate(show.date) }]
        : [{ label: 'Overview', to: '/' }, { label: formatDate(show.date) }]
      } />

      <div className="page-heading" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>{show.venue}</h1>
          <p className="sub">
            {show.city}{show.state ? `, ${show.state}` : ''}, {show.country} · {formatDate(show.date)}
          </p>
          {show.tour && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              <Link to={`/tour/${encodeURIComponent(show.tour)}`}>{show.tour}</Link>
            </p>
          )}
        </div>
        <button
          className={`attend-btn${attended.has(show.id) ? ' attend-btn--active' : ''}`}
          onClick={() => toggleAttendance(show.id)}
        >
          {attended.has(show.id) ? '✓ Attended' : '+ Mark as Attended'}
        </button>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-card__value">{liveSongs.length}</div>
          <div className="stat-card__label">Songs played</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{debutNames.length}</div>
          <div className="stat-card__label">Debuts</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{show.songs.filter(s => s.encore > 0 && !s.tape).length}</div>
          <div className="stat-card__label">Encore songs</div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Setlist</div>
        <div className="card">
          <SetlistView songs={show.songs} debutNames={debutNames} />
        </div>
      </div>

      {show.setlistFmUrl && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '1rem' }}>
          <a href={show.setlistFmUrl} target="_blank" rel="noopener noreferrer">View on setlist.fm ↗</a>
        </p>
      )}

      <nav className="show-nav">
        <div className="show-nav__side">
          {prev && (
            <Link to={`/concert/${prev.id}`} className="show-nav__btn">
              <span className="show-nav__arrow">←</span>
              <span className="show-nav__info">
                <span className="show-nav__label">Previous</span>
                <span className="show-nav__detail">{formatDate(prev.date)}</span>
                <span className="show-nav__detail">{prev.venue}, {prev.city}</span>
              </span>
            </Link>
          )}
        </div>
        <div className="show-nav__side show-nav__side--right">
          {next && (
            <Link to={`/concert/${next.id}`} className="show-nav__btn show-nav__btn--right">
              <span className="show-nav__info">
                <span className="show-nav__label">Next</span>
                <span className="show-nav__detail">{formatDate(next.date)}</span>
                <span className="show-nav__detail">{next.venue}, {next.city}</span>
              </span>
              <span className="show-nav__arrow">→</span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  )
}
