import { Link } from 'react-router-dom'

export default function StatCard({ value, label, to }) {
  const inner = (
    <>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
    </>
  )

  if (to) {
    return (
      <Link to={to} className="stat-card" style={{ display: 'block', textDecoration: 'none', cursor: 'pointer', transition: 'border-color 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        {inner}
      </Link>
    )
  }

  return <div className="stat-card">{inner}</div>
}
