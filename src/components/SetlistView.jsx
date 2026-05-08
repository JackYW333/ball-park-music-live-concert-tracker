import { Link } from 'react-router-dom'
import AlbumBadge from './AlbumBadge.jsx'
import { getAlbum } from '../utils/stats.js'

export default function SetlistView({ songs, debutNames = [] }) {
  if (!songs?.length) return <p style={{ color: 'var(--text-muted)' }}>No setlist data available.</p>

  // Group songs into sets (main set = encore 0, encore 1 = first encore, etc.)
  const sets = []
  let currentEncoreNum = 0
  songs.forEach(song => {
    const encNum = song.encore || 0
    if (encNum !== currentEncoreNum) {
      currentEncoreNum = encNum
    }
    if (!sets[encNum]) sets[encNum] = []
    sets[encNum].push(song)
  })

  let posCounter = 0

  return (
    <ul className="setlist">
      {sets.map((setSongs, encNum) => {
        if (!setSongs) return null
        return (
          <div key={encNum}>
            {encNum > 0 && (
              <div className="setlist__set-label">Encore {encNum > 1 ? encNum : ''}</div>
            )}
            {setSongs.map(song => {
              const album = getAlbum(song.name)
              const isDebut = debutNames.includes(song.name)
              if (!song.tape) posCounter++
              return (
                <li key={`${song.name}-${posCounter}`} className="setlist__song">
                  <span className="setlist__pos">{song.tape ? '—' : posCounter}</span>
                  {song.tape
                    ? <span className="setlist__name">{song.name}</span>
                    : <Link to={`/song/${encodeURIComponent(song.name)}`} className="setlist__name" style={{ color: 'var(--text)' }}>{song.name}</Link>
                  }
                  {song.tape && <span className="tag tag--tape">tape</span>}
                  {isDebut && <span className="tag tag--debut">debut</span>}
                  <AlbumBadge album={album} />
                </li>
              )
            })}
          </div>
        )
      })}
    </ul>
  )
}
