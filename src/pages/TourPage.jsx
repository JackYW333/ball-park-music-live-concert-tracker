import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb.jsx'
import StatCard from '../components/StatCard.jsx'
import SongTable from '../components/SongTable.jsx'
import AlbumCoverage from '../components/AlbumCoverage.jsx'
import GeoBreakdown from '../components/GeoBreakdown.jsx'
import OpenerCloser from '../components/OpenerCloser.jsx'
import {
  computeSongStats,
  computeCountryStats,
  computeCityStats,
  computeAlbumCoverage,
  computeOpeners,
  computeClosers,
  countUniqueSongs,
  countShowsWithSetlist,
  formatDate,
} from '../utils/stats.js'

export default function TourPage({ data, attendance }) {
  const { tourName } = useParams()
  const decoded = decodeURIComponent(tourName)
  const { loading, error, setlists } = data
  const { attended } = attendance

  const tourShows = useMemo(
    () => setlists.filter(s => (s.tour || 'Unknown / Standalone') === decoded),
    [setlists, decoded]
  )

  const stats = useMemo(() => {
    if (!tourShows.length) return null
    return {
      songs: computeSongStats(tourShows),
      countries: computeCountryStats(tourShows),
      cities: computeCityStats(tourShows),
      albums: computeAlbumCoverage(tourShows),
      openers: computeOpeners(tourShows),
      closers: computeClosers(tourShows),
      uniqueSongs: countUniqueSongs(tourShows),
      showsWithSetlist: countShowsWithSetlist(tourShows),
    }
  }, [tourShows])

  const sorted = useMemo(() => [...tourShows].sort((a, b) => a.date.localeCompare(b.date)), [tourShows])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return <div className="loading">Error: {error}</div>
  if (!stats) return <div className="page-container"><div className="empty">Tour not found.</div></div>

  const dateRange = sorted.length
    ? `${formatDate(sorted[0].date)} – ${formatDate(sorted[sorted.length - 1].date)}`
    : ''

  return (
    <div className="page-container">
      <Breadcrumb items={[{ label: 'Overview', to: '/' }, { label: 'Tours', to: '/tours' }, { label: decoded }]} />

      <div className="page-heading">
        <h1>{decoded}</h1>
        <p className="sub">{tourShows.length} shows · {dateRange}</p>
      </div>

      <div className="stat-grid">
        <StatCard value={tourShows.length} label="Shows" />
        <StatCard value={stats.countries.length} label="Countries" />
        <StatCard value={stats.cities.length} label="Cities" />
        <StatCard value={stats.uniqueSongs} label="Unique Songs" />
      </div>

      <div className="section two-col">
        <SongTable songs={stats.songs} limit={15} totalShows={stats.showsWithSetlist} />
        <AlbumCoverage data={stats.albums} />
      </div>

      <div className="section">
        <GeoBreakdown countries={stats.countries} cities={stats.cities} />
      </div>

      <div className="section">
        <OpenerCloser openers={stats.openers} closers={stats.closers} totalShows={stats.showsWithSetlist} />
      </div>

      <div className="section">
        <div className="section-title">All Shows on This Tour</div>
        <div className="table-scroll">
          <table className="shows-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Venue</th>
                <th>City</th>
                <th>Country</th>
                <th>Songs</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((show, i) => (
                <tr key={show.id} className={attended.has(show.id) ? 'attended-row' : ''}>
                  <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{i + 1}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <Link to={`/concert/${show.id}`}>{formatDate(show.date)}</Link>
                  </td>
                  <td><Link to={`/concert/${show.id}`}>{show.venue}</Link></td>
                  <td><Link to={`/city/${encodeURIComponent(show.city)}/${show.countryCode}`} style={{ color: 'var(--text)' }}>{show.city}</Link></td>
                  <td>
                    <Link to={`/country/${show.countryCode}`}><span className="country-code">{show.countryCode}</span></Link>
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
