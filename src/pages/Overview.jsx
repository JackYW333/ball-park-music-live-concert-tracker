import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard.jsx'
import SongTable from '../components/SongTable.jsx'
import ShowsPerYear from '../components/ShowsPerYear.jsx'
import AlbumCoverage from '../components/AlbumCoverage.jsx'
import GeoBreakdown from '../components/GeoBreakdown.jsx'
import OpenerCloser from '../components/OpenerCloser.jsx'
import SetLengthChart from '../components/SetLengthChart.jsx'
import EncoreStats from '../components/EncoreStats.jsx'
import {
  computeSongStats,
  computeShowsPerYear,
  computeCountryStats,
  computeCityStats,
  computeVenueStats,
  computeOpeners,
  computeClosers,
  computeSetLengthByYear,
  computeEncoreStats,
  countUniqueSongs,
  countShowsWithSetlist,
  formatDate,
} from '../utils/stats.js'

export default function Overview({ data }) {
  const { loading, error, setlists, lastUpdated, totalWithSetlist, albumCoverage } = data

  const stats = useMemo(() => {
    if (!setlists.length) return null
    return {
      songs: computeSongStats(setlists),
      perYear: computeShowsPerYear(setlists),
      countries: computeCountryStats(setlists),
      cities: computeCityStats(setlists),
      venues: computeVenueStats(setlists),
      albums: albumCoverage,
      openers: computeOpeners(setlists),
      closers: computeClosers(setlists),
      uniqueSongs: countUniqueSongs(setlists),
      showsWithSetlist: countShowsWithSetlist(setlists),
      setLength: computeSetLengthByYear(setlists),
      encores: computeEncoreStats(setlists),
    }
  }, [setlists])

  if (loading) return <div className="loading">Loading setlist data…</div>
  if (error) return <div className="loading">Error: {error}</div>
  if (!setlists.length) return (
    <div className="page-container">
      <div className="empty">
        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No data yet</p>
        <p style={{ fontSize: '0.875rem' }}>Run <code>npm run fetch-data</code> to populate setlist data from setlist.fm.</p>
      </div>
    </div>
  )

  return (
    <div className="page-container">
      <div className="page-heading">
        <h1>All Shows</h1>
        {lastUpdated && (
          <p className="last-updated">Last updated: {new Date(lastUpdated).toLocaleString()}</p>
        )}
      </div>

      <div className="stat-grid">
        <StatCard
          value={setlists.length.toLocaleString()}
          label={totalWithSetlist != null && totalWithSetlist < setlists.length
            ? `Total Shows (${totalWithSetlist.toLocaleString()} with setlist)`
            : 'Total Shows'}
          to="/shows"
        />
        <StatCard value={stats.countries.length} label="Countries" to="/countries" />
        <StatCard value={stats.cities.length} label="Cities" to="/cities" />
        <StatCard value={stats.venues.length} label="Venues" to="/venues" />
        <StatCard value={stats.uniqueSongs.toLocaleString()} label="Unique Songs" to="/songs" />
        <StatCard value={stats.songs[0]?.name ?? '—'} label="Most Played Song" to={stats.songs[0] ? `/song/${encodeURIComponent(stats.songs[0].name)}` : null} />
      </div>

      <div className="section">
        <ShowsPerYear data={stats.perYear} />
      </div>

      <div className="section two-col">
        <SongTable songs={stats.songs} totalShows={stats.showsWithSetlist} />
        <AlbumCoverage data={stats.albums} />
      </div>

      <div className="section">
        <GeoBreakdown countries={stats.countries} cities={stats.cities} />
      </div>

      <div className="section">
        <OpenerCloser openers={stats.openers} closers={stats.closers} totalShows={stats.showsWithSetlist} />
      </div>

      <div className="section">
        <VenueCard venues={stats.venues} />
      </div>

      <div className="section two-col">
        <SetLengthChart data={stats.setLength} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <OnThisDay setlists={setlists} />
        </div>
      </div>

      <div className="section">
        <EncoreStats stats={stats.encores} />
      </div>
    </div>
  )
}

function VenueCard({ venues }) {
  const max = venues[0]?.count || 1
  return (
    <div className="card">
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Most Visited Venues</span>
        <Link to="/venues" style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--accent)' }}>See all</Link>
      </div>
      <ol className="ranked-list">
        {venues.slice(0, 15).map((v, i) => (
          <li key={`${v.venue}-${v.city}`}>
            <span className="ranked-list__rank">{i + 1}</span>
            <Link to={`/venue/${encodeURIComponent(v.venue)}/${encodeURIComponent(v.city)}/${v.countryCode}`} className="ranked-list__name" style={{ color: 'var(--text)' }}>{v.venue}</Link>
            <span className="ranked-list__meta">{v.city}</span>
            <div className="ranked-list__bar-wrap">
              <div className="ranked-list__bar" style={{ width: `${Math.round((v.count / max) * 100)}%` }} />
            </div>
            <span className="ranked-list__meta">{v.count}×</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function OnThisDay({ setlists }) {
  const today = new Date()
  const mmdd = String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0')

  const shows = setlists
    .filter(s => s.date.slice(5) === mmdd)
    .sort((a, b) => b.date.localeCompare(a.date))

  const label = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })

  return (
    <div className="card">
      <div className="card-title">On This Day — {label}</div>
      {shows.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '0.5rem 0' }}>No shows on this date.</p>
      ) : (
        <ul className="ranked-list">
          {shows.map(show => (
            <li key={show.id} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.15rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', width: '100%' }}>
                <span style={{ fontWeight: 600, color: 'var(--accent)', fontSize: '0.85rem', minWidth: 36 }}>{show.date.slice(0, 4)}</span>
                <Link to={`/concert/${show.id}`} style={{ color: 'var(--text)', flex: 1, fontSize: '0.875rem' }}>{show.venue}</Link>
              </div>
              <div style={{ paddingLeft: 44, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <Link to={`/city/${encodeURIComponent(show.city)}/${show.countryCode}`} style={{ color: 'var(--text-muted)' }}>{show.city}</Link>
                , <Link to={`/country/${show.countryCode}`} style={{ color: 'var(--text-muted)' }}>{show.country}</Link>
                {show.tour ? <> · <Link to={`/tour/${encodeURIComponent(show.tour)}`} style={{ color: 'var(--text-muted)' }}>{show.tour}</Link></> : ''}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
