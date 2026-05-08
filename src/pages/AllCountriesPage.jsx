import { useMemo } from 'react'
import { computeCountryStats } from '../utils/stats.js'
import Breadcrumb from '../components/Breadcrumb.jsx'
import RankedList from '../components/RankedList.jsx'
import WorldMap from '../components/WorldMap.jsx'

export default function AllCountriesPage({ data }) {
  const { loading, error, setlists } = data
  const countries = useMemo(() => computeCountryStats(setlists), [setlists])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return <div className="loading">Error: {error}</div>

  const max = countries[0]?.count || 1

  return (
    <div className="page-container">
      <Breadcrumb items={[{ label: 'Overview', to: '/' }, { label: 'All Countries' }]} />
      <div className="page-heading">
        <h1>All Countries</h1>
        <p className="sub">{countries.length} countries visited</p>
      </div>
      <div className="section">
        <WorldMap countries={countries} />
      </div>
      <div className="card">
        <RankedList
          items={countries.map(c => ({
            key: c.code,
            to: `/country/${c.code}`,
            label: c.name,
            extra: <span className="country-code">{c.code}</span>,
            count: c.count,
          }))}
          max={max}
        />
      </div>
    </div>
  )
}
