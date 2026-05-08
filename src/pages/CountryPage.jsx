import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb.jsx'
import StatCard from '../components/StatCard.jsx'
import { computeCityStats, computeVenueStats, countUniqueSongs, formatDate } from '../utils/stats.js'

export default function CountryPage({ data, attendance }) {
  const { countryCode } = useParams()
  const { loading, error, setlists } = data
  const { attended } = attendance

  const shows = useMemo(
    () => setlists.filter(s => s.countryCode === countryCode).sort((a, b) => a.date.localeCompare(b.date)),
    [setlists, countryCode]
  )

  const countryName = shows[0]?.country || countryCode

  const stats = useMemo(() => shows.length ? {
    cities: computeCityStats(shows),
    venues: computeVenueStats(shows),
    uniqueSongs: countUniqueSongs(shows),
  } : null, [shows])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return <div className="loading">Error: {error}</div>
  if (!shows.length) return <div className="page-container"><div className="empty">No shows found for {countryCode}.</div></div>

  const maxCities = stats.cities[0]?.count || 1
  const maxVenues = stats.venues[0]?.count || 1

  return (
    <div className="page-container">
      <Breadcrumb items={[{ label: 'Overview', to: '/' }, { label: 'All Countries', to: '/countries' }, { label: countryName }]} />

      <div className="page-heading">
        <h1>{countryName}</h1>
      </div>

      <div className="stat-grid">
        <StatCard value={shows.length} label="Shows" />
        <StatCard value={stats.cities.length} label="Cities" />
        <StatCard value={stats.venues.length} label="Venues" />
        <StatCard value={stats.uniqueSongs} label="Unique Songs" />
      </div>

      <div className="section two-col">
        <div className="card">
          <div className="card-title">Cities</div>
          <ol className="ranked-list">
            {stats.cities.map((c, i) => (
              <li key={c.city}>
                <span className="ranked-list__rank">{i + 1}</span>
                <Link to={`/city/${encodeURIComponent(c.city)}/${countryCode}`} className="ranked-list__name" style={{ color: 'var(--text)' }}>{c.city}</Link>
                <div className="ranked-list__bar-wrap">
                  <div className="ranked-list__bar" style={{ width: `${Math.round((c.count / maxCities) * 100)}%` }} />
                </div>
                <span className="ranked-list__meta">{c.count}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="card">
          <div className="card-title">Venues</div>
          <ol className="ranked-list">
            {stats.venues.map((v, i) => (
              <li key={`${v.venue}-${v.city}`}>
                <span className="ranked-list__rank">{i + 1}</span>
                <Link to={`/venue/${encodeURIComponent(v.venue)}/${encodeURIComponent(v.city)}/${countryCode}`} className="ranked-list__name" style={{ color: 'var(--text)' }}>{v.venue}</Link>
                <span className="ranked-list__meta" style={{ fontSize: '0.75rem' }}>{v.city}</span>
                <div className="ranked-list__bar-wrap">
                  <div className="ranked-list__bar" style={{ width: `${Math.round((v.count / maxVenues) * 100)}%` }} />
                </div>
                <span className="ranked-list__meta">{v.count}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="section">
        <div className="section-title">All Shows</div>
        <div className="table-scroll">
          <table className="shows-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Venue</th>
                <th>City</th>
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
                  <td><Link to={`/city/${encodeURIComponent(show.city)}/${show.countryCode}`} style={{ color: 'var(--text)' }}>{show.city}</Link></td>
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
