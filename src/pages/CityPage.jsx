import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb.jsx'
import StatCard from '../components/StatCard.jsx'
import { computeVenueStats, countUniqueSongs, formatDate } from '../utils/stats.js'

export default function CityPage({ data, attendance }) {
  const { cityName, countryCode } = useParams()
  const decoded = decodeURIComponent(cityName)
  const { loading, error, setlists } = data
  const { attended } = attendance

  const shows = useMemo(
    () => setlists
      .filter(s => s.city === decoded && s.countryCode === countryCode)
      .sort((a, b) => a.date.localeCompare(b.date)),
    [setlists, decoded, countryCode]
  )

  const countryName = shows[0]?.country || countryCode

  const stats = useMemo(() => shows.length ? {
    venues: computeVenueStats(shows),
    uniqueSongs: countUniqueSongs(shows),
  } : null, [shows])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return <div className="loading">Error: {error}</div>
  if (!shows.length) return <div className="page-container"><div className="empty">No shows found for {decoded}.</div></div>

  const maxVenues = stats.venues[0]?.count || 1

  return (
    <div className="page-container">
      <Breadcrumb items={[{ label: 'Overview', to: '/' }, { label: countryName, to: `/country/${countryCode}` }, { label: decoded }]} />

      <div className="page-heading">
        <h1>{decoded}</h1>
        <p className="sub">{countryName}</p>
      </div>

      <div className="stat-grid">
        <StatCard value={shows.length} label="Shows" />
        <StatCard value={stats.venues.length} label="Venues" />
        <StatCard value={stats.uniqueSongs} label="Unique Songs" />
      </div>

      {stats.venues.length > 1 && (
        <div className="section">
          <div className="card">
            <div className="card-title">Venues</div>
            <ol className="ranked-list">
              {stats.venues.map((v, i) => (
                <li key={v.venue}>
                  <span className="ranked-list__rank">{i + 1}</span>
                  <Link to={`/venue/${encodeURIComponent(v.venue)}/${encodeURIComponent(decoded)}/${countryCode}`} className="ranked-list__name" style={{ color: 'var(--text)' }}>{v.venue}</Link>
                  <div className="ranked-list__bar-wrap">
                    <div className="ranked-list__bar" style={{ width: `${Math.round((v.count / maxVenues) * 100)}%` }} />
                  </div>
                  <span className="ranked-list__meta">{v.count}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      <div className="section">
        <div className="section-title">All Shows</div>
        <div className="table-scroll">
          <table className="shows-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Tour</th>
                <th>Songs</th>
              </tr>
            </thead>
            <tbody>
              {shows.map((show, i) => (
                <tr key={show.id} className={attended.has(show.id) ? 'attended-row' : ''}>
                  <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{i + 1}</td>
                  <td style={{ whiteSpace: 'nowrap' }}><Link to={`/concert/${show.id}`}>{formatDate(show.date)}</Link></td>
                  <td><Link to={`/concert/${show.id}`}>{show.venue}</Link></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {show.tour ? <Link to={`/tour/${encodeURIComponent(show.tour)}`}>{show.tour}</Link> : '—'}
                  </td>
                  <td>{show.songs.filter(s => !s.tape).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
