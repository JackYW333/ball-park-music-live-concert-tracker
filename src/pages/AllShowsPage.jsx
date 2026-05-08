import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '../utils/stats.js'
import Breadcrumb from '../components/Breadcrumb.jsx'

export default function AllShowsPage({ data, attendance }) {
  const { loading, error, setlists } = data
  const { attended } = attendance
  const [search, setSearch] = useState('')

  const sorted = useMemo(
    () => [...setlists].sort((a, b) => b.date.localeCompare(a.date)),
    [setlists]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return sorted
    return sorted.filter(s =>
      s.venue.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.country.toLowerCase().includes(q) ||
      (s.tour || '').toLowerCase().includes(q) ||
      s.date.includes(q)
    )
  }, [sorted, search])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return <div className="loading">Error: {error}</div>

  return (
    <div className="page-container">
      <Breadcrumb items={[{ label: 'Overview', to: '/' }, { label: 'All Shows' }]} />

      <div className="page-heading">
        <h1>All Shows</h1>
        <p className="sub">{setlists.length.toLocaleString()} shows</p>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter by venue, city, country or tour…"
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '7px', padding: '0.5rem 0.75rem',
            color: 'var(--text)', fontSize: '0.875rem', width: '100%', maxWidth: 400,
            outline: 'none',
          }}
        />
      </div>

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
            {filtered.map((show, i) => (
              <tr key={show.id} className={attended.has(show.id) ? 'attended-row' : ''}>
                <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{i + 1}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <Link to={`/concert/${show.id}`} style={show.songs.length === 0 ? { color: 'var(--text-muted)' } : undefined}>
                    {formatDate(show.date)}
                  </Link>
                </td>
                <td>
                  <Link to={`/concert/${show.id}`} style={show.songs.length === 0 ? { color: 'var(--text-muted)' } : undefined}>
                    {show.venue}
                  </Link>
                </td>
                <td>
                  <Link to={`/city/${encodeURIComponent(show.city)}/${show.countryCode}`} style={{ color: 'var(--text)' }}>{show.city}</Link>
                </td>
                <td>
                  <Link to={`/country/${show.countryCode}`}><span className="country-code">{show.countryCode}</span></Link>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {show.tour ? <Link to={`/tour/${encodeURIComponent(show.tour)}`}>{show.tour}</Link> : '—'}
                </td>
                <td style={{ color: show.songs.length > 0 ? 'var(--text)' : 'var(--text-dim)' }}>
                  {show.songs.length > 0 ? show.songs.filter(s => !s.tape).length : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
