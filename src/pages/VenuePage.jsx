import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb.jsx'
import StatCard from '../components/StatCard.jsx'
import { countUniqueSongs, computeSongStats, formatDate, findLongestGap } from '../utils/stats.js'

export default function VenuePage({ data, attendance }) {
  const { venueName, cityName, countryCode } = useParams()
  const decodedVenue = decodeURIComponent(venueName)
  const decodedCity = decodeURIComponent(cityName)
  const { loading, error, setlists } = data
  const { attended } = attendance

  const shows = useMemo(
    () => setlists
      .filter(s => s.venue === decodedVenue && s.city === decodedCity && s.countryCode === countryCode)
      .sort((a, b) => a.date.localeCompare(b.date)),
    [setlists, decodedVenue, decodedCity, countryCode]
  )

  const countryName = shows[0]?.country || countryCode

  const stats = useMemo(() => {
    if (!shows.length) return null
    const { longestGap, longestGapFrom, longestGapTo } = findLongestGap(shows.map(s => s.date))
    return {
      uniqueSongs: countUniqueSongs(shows),
      topSongs: computeSongStats(shows).slice(0, 10),
      longestGap, longestGapFrom, longestGapTo,
    }
  }, [shows])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return <div className="loading">Error: {error}</div>
  if (!shows.length) return <div className="page-container"><div className="empty">No shows found for {decodedVenue}.</div></div>

  const max = stats.topSongs[0]?.count || 1

  return (
    <div className="page-container">
      <Breadcrumb items={[
        { label: 'Overview', to: '/' },
        { label: countryName, to: `/country/${countryCode}` },
        { label: decodedCity, to: `/city/${encodeURIComponent(decodedCity)}/${countryCode}` },
        { label: decodedVenue },
      ]} />

      <div className="page-heading">
        <h1>{decodedVenue}</h1>
        <p className="sub">
          <Link to={`/city/${encodeURIComponent(decodedCity)}/${countryCode}`} style={{ color: 'var(--text-muted)' }}>{decodedCity}</Link>
          , <Link to={`/country/${countryCode}`} style={{ color: 'var(--text-muted)' }}>{countryName}</Link>
        </p>
      </div>

      <div className="stat-grid">
        <StatCard value={shows.length} label="Shows" />
        <StatCard value={stats.uniqueSongs} label="Unique Songs" />
        <StatCard value={formatDate(shows[0].date)} label="First Show" />
        <StatCard value={formatDate(shows[shows.length - 1].date)} label="Last Show" />
        {shows.length >= 3 && stats.longestGap > 0 && (
          <StatCard
            value={`${stats.longestGap} days`}
            label={`Longest Break (${stats.longestGapFrom.slice(0, 4)}–${stats.longestGapTo.slice(0, 4)})`}
          />
        )}
      </div>

      <div className="section two-col">
        <div className="card">
          <div className="card-title">Most Played Here</div>
          <ol className="ranked-list">
            {stats.topSongs.map((s, i) => (
              <li key={s.name}>
                <span className="ranked-list__rank">{i + 1}</span>
                <Link to={`/song/${encodeURIComponent(s.name)}`} className="ranked-list__name" style={{ color: 'var(--text)' }}>{s.name}</Link>
                <div className="ranked-list__bar-wrap">
                  <div className="ranked-list__bar" style={{ width: `${Math.round((s.count / max) * 100)}%` }} />
                </div>
                <span className="ranked-list__meta">{s.count}×</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="section">
          <div className="section-title">All Shows</div>
          <div className="table-scroll">
            <table className="shows-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Tour</th>
                  <th>Songs</th>
                </tr>
              </thead>
              <tbody>
                {shows.map((show, i) => (
                  <tr key={show.id} className={attended.has(show.id) ? 'attended-row' : ''}>
                    <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{i + 1}</td>
                    <td style={{ whiteSpace: 'nowrap' }}><Link to={`/concert/${show.id}`}>{formatDate(show.date)}</Link></td>
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
    </div>
  )
}
