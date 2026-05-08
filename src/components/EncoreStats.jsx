import { Link } from 'react-router-dom'
import AlbumBadge from './AlbumBadge.jsx'

export default function EncoreStats({ stats }) {
  const { showsWithEncore, encorePct, topEncoreSongs } = stats
  const max = topEncoreSongs[0]?.count || 1

  return (
    <div className="two-col">
      <div className="card">
        <div className="card-title">Encore Overview</div>
        <div style={{ padding: '0.5rem 0' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text)' }}>{encorePct}%</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.25rem' }}>
            Of shows with an encore
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            {showsWithEncore.toLocaleString()} shows featured at least one encore
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-title">Most Common Encore Songs</div>
        <ol className="ranked-list">
          {topEncoreSongs.slice(0, 10).map((s, i) => (
            <li key={s.name}>
              <span className="ranked-list__rank">{i + 1}</span>
              <Link to={`/song/${encodeURIComponent(s.name)}`} className="ranked-list__name" style={{ color: 'var(--text)' }}>{s.name}</Link>
              <AlbumBadge album={s.album} />
              <div className="ranked-list__bar-wrap">
                <div className="ranked-list__bar" style={{ width: `${Math.round((s.count / max) * 100)}%` }} />
              </div>
              <span className="ranked-list__meta">{s.count}×</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
