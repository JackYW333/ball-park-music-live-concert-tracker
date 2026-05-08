import { useMemo, useState } from 'react'
import { computeVenueStats } from '../utils/stats.js'
import Breadcrumb from '../components/Breadcrumb.jsx'
import RankedList from '../components/RankedList.jsx'
import SearchInput from '../components/SearchInput.jsx'

export default function AllVenuesPage({ data }) {
  const { loading, error, setlists } = data
  const [search, setSearch] = useState('')
  const venues = useMemo(() => computeVenueStats(setlists), [setlists])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? venues.filter(v =>
      v.venue.toLowerCase().includes(q) || v.city.toLowerCase().includes(q)
    ) : venues
  }, [venues, search])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return <div className="loading">Error: {error}</div>

  const max = venues[0]?.count || 1

  return (
    <div className="page-container">
      <Breadcrumb items={[{ label: 'Overview', to: '/' }, { label: 'All Venues' }]} />
      <div className="page-heading">
        <h1>All Venues</h1>
        <p className="sub">{venues.length} venues visited</p>
      </div>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search venues or cities…"
        maxWidth={300}
      />
      <div className="card" style={{ marginTop: '1rem' }}>
        <RankedList
          items={filtered.map(v => ({
            key: `${v.venue}-${v.city}`,
            to: `/venue/${encodeURIComponent(v.venue)}/${encodeURIComponent(v.city)}/${v.countryCode}`,
            label: v.venue,
            extra: <span className="ranked-list__meta" style={{ fontSize: '0.75rem' }}>{v.city}</span>,
            count: v.count,
          }))}
          max={max}
        />
      </div>
    </div>
  )
}
