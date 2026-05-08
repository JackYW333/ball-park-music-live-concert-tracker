import { useState } from 'react'
import { Link } from 'react-router-dom'
import AlbumBadge from './AlbumBadge.jsx'

export default function SongTable({ songs, limit = 20, totalShows = 0 }) {
  const [expanded, setExpanded] = useState(false)
  const max = songs[0]?.count || 1
  const visible = expanded ? songs : songs.slice(0, limit)

  return (
    <div className="card">
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Most Played Songs</span>
        <Link to="/songs" style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--accent)' }}>See all</Link>
      </div>
      <ol className="ranked-list">
        {visible.map((s, i) => (
          <li key={s.name}>
            <span className="ranked-list__rank">{i + 1}</span>
            <Link to={`/song/${encodeURIComponent(s.name)}`} className="ranked-list__name" style={{ color: 'var(--text)' }}>
              {s.name}
            </Link>
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
      {songs.length > limit && (
        <button
          onClick={() => setExpanded(e => !e)}
          style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          {expanded ? 'Show less' : `Show all ${songs.length} songs`}
        </button>
      )}
    </div>
  )
}
