import { useMemo } from 'react'
import { computeCityStats } from '../utils/stats.js'
import Breadcrumb from '../components/Breadcrumb.jsx'
import RankedList from '../components/RankedList.jsx'

export default function AllCitiesPage({ data }) {
  const { loading, error, setlists } = data
  const cities = useMemo(() => computeCityStats(setlists), [setlists])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return <div className="loading">Error: {error}</div>

  const max = cities[0]?.count || 1

  return (
    <div className="page-container">
      <Breadcrumb items={[{ label: 'Overview', to: '/' }, { label: 'All Cities' }]} />
      <div className="page-heading">
        <h1>All Cities</h1>
        <p className="sub">{cities.length} cities visited</p>
      </div>
      <div className="card">
        <RankedList
          items={cities.map(c => ({
            key: `${c.city}-${c.country}`,
            to: `/city/${encodeURIComponent(c.city)}/${c.countryCode}`,
            label: c.city,
            extra: <span className="ranked-list__meta" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{c.country}</span>,
            count: c.count,
          }))}
          max={max}
        />
      </div>
    </div>
  )
}
