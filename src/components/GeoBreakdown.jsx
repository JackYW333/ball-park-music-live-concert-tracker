import { Link } from 'react-router-dom'
import RankedList from './RankedList.jsx'

export default function GeoBreakdown({ countries, cities }) {
  const maxC = countries[0]?.count || 1
  const maxCi = cities[0]?.count || 1

  return (
    <div className="two-col">
      <div className="card">
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Countries</span>
          <Link to="/countries" style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--accent)' }}>See all</Link>
        </div>
        <RankedList
          items={countries.slice(0, 15).map(c => ({
            key: c.code || c.name,
            to: `/country/${c.code}`,
            label: c.name,
            extra: <span className="country-code">{c.code}</span>,
            count: c.count,
          }))}
          max={maxC}
        />
      </div>
      <div className="card">
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Cities</span>
          <Link to="/cities" style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--accent)' }}>See all</Link>
        </div>
        <RankedList
          items={cities.slice(0, 15).map(c => ({
            key: `${c.city}-${c.country}`,
            to: `/city/${encodeURIComponent(c.city)}/${c.countryCode}`,
            label: c.city,
            extra: <span className="ranked-list__meta" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{c.country}</span>,
            count: c.count,
          }))}
          max={maxCi}
        />
      </div>
    </div>
  )
}
