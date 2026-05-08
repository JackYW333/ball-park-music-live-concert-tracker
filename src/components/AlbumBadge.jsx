import { Link } from 'react-router-dom'
import { luminance } from '../utils/stats.js'

export default function AlbumBadge({ album }) {
  if (!album) return null
  const textColor = luminance(album.color) > 0.45 ? '#111' : '#fff'
  return (
    <Link
      to={`/album/${album.id}`}
      className="album-badge"
      style={{ background: album.color, color: textColor, border: `1px solid ${album.color}` }}
      title={album.year ? `${album.name} (${album.year})` : album.name}
    >
      {album.name.replace('A Weekend in the City', 'AWITC')}
    </Link>
  )
}
