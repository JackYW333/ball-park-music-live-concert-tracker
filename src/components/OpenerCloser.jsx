import { Link } from 'react-router-dom'
import AlbumBadge from './AlbumBadge.jsx'

export default function OpenerCloser({ openers, closers, totalShows = 0 }) {
  return (
    <div className="two-col">
      <RankCard title="Most Common Openers" data={openers} totalShows={totalShows} />
      <RankCard title="Most Common Closers" data={closers} totalShows={totalShows} />
    </div>
  )
}

function RankCard({ title, data, totalShows }) {
  const max = data[0]?.count || 1
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <ol className="ranked-list">
        {data.slice(0, 10).map((s, i) => (
          <li key={s.name}>
            <span className="ranked-list__rank">{i + 1}</span>
            <Link to={`/song/${encodeURIComponent(s.name)}`} className="ranked-list__name" style={{ color: 'var(--text)' }}>{s.name}</Link>
            <AlbumBadge album={s.album} />
            <div className="ranked-list__bar-wrap">
              <div className="ranked-list__bar" style={{ width: `${Math.round((s.count / max) * 100)}%` }} />
            </div>
            <span className="ranked-list__meta">
              {s.count}×{totalShows > 0 ? ` (${Math.round((s.count / totalShows) * 100)}%)` : ''}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
