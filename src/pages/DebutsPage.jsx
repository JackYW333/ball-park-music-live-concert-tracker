import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb.jsx'
import AlbumBadge from '../components/AlbumBadge.jsx'
import { getAlbum, formatDate, luminance } from '../utils/stats.js'
import albumData from '../../config/albums.json'

export default function DebutsPage({ data, attendance }) {
  const { loading, error, setlists, debutMap } = data
  const { attended } = attendance
  const [filterAlbum, setFilterAlbum] = useState('all')

  const debuts = useMemo(() => {
    if (!setlists.length) return []

    return Object.entries(debutMap)
      .map(([songName, date]) => {
        const show = setlists.find(s => s.date === date && s.songs.some(song => !song.tape && song.name === songName))
        return {
          songName,
          date,
          show,
          album: getAlbum(songName),
        }
      })
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [setlists])

  const filtered = useMemo(() => {
    if (filterAlbum === 'all') return debuts
    if (filterAlbum === 'unknown') return debuts.filter(d => !d.album)
    return debuts.filter(d => d.album?.id === filterAlbum)
  }, [debuts, filterAlbum])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return <div className="loading">Error: {error}</div>

  return (
    <div className="page-container">
      <Breadcrumb items={[{ label: 'Overview', to: '/' }, { label: 'All Songs', to: '/songs' }, { label: 'Song Debuts' }]} />
      <div className="page-heading">
        <h1>Song Debuts</h1>
        <p className="sub">{debuts.length} songs debuted live</p>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Filter by release:</span>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterAlbum('all')}
            style={{
              background: filterAlbum === 'all' ? 'var(--accent)' : 'var(--bg-card)',
              color: filterAlbum === 'all' ? '#fff' : 'var(--text-muted)',
              border: '1px solid var(--border)',
              borderRadius: '5px', padding: '0.25rem 0.6rem',
              cursor: 'pointer', fontSize: '0.8rem',
            }}
          >All</button>
          {albumData.map(a => (
            <button
              key={a.id}
              onClick={() => setFilterAlbum(a.id)}
              style={{
                background: filterAlbum === a.id ? a.color : 'var(--bg-card)',
                color: filterAlbum === a.id ? (luminance(a.color) > 0.45 ? '#111' : '#fff') : 'var(--text-muted)',
                border: `1px solid ${filterAlbum === a.id ? a.color : 'var(--border)'}`,
                borderRadius: '5px', padding: '0.25rem 0.6rem',
                cursor: 'pointer', fontSize: '0.8rem',
              }}
            >{a.name}</button>
          ))}
          <button
            onClick={() => setFilterAlbum('unknown')}
            style={{
              background: filterAlbum === 'unknown' ? 'var(--text-dim)' : 'var(--bg-card)',
              color: filterAlbum === 'unknown' ? '#fff' : 'var(--text-muted)',
              border: '1px solid var(--border)',
              borderRadius: '5px', padding: '0.25rem 0.6rem',
              cursor: 'pointer', fontSize: '0.8rem',
            }}
          >Unknown</button>
        </div>
      </div>

      <div className="table-scroll">
        <table className="shows-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Song</th>
              <th>Release</th>
              <th>Debut Date</th>
              <th>Venue</th>
              <th>City</th>
              <th>Tour</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => (
              <tr key={d.songName} className={d.show && attended.has(d.show.id) ? 'attended-row' : ''}>
                <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{i + 1}</td>
                <td><Link to={`/song/${encodeURIComponent(d.songName)}`}>{d.songName}</Link></td>
                <td><AlbumBadge album={d.album} /></td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {d.show ? <Link to={`/concert/${d.show.id}`}>{formatDate(d.date)}</Link> : formatDate(d.date)}
                </td>
                <td>{d.show ? <Link to={`/concert/${d.show.id}`}>{d.show.venue}</Link> : '—'}</td>
                <td>
                  {d.show
                    ? <Link to={`/city/${encodeURIComponent(d.show.city)}/${d.show.countryCode}`} style={{ color: 'var(--text)' }}>{d.show.city}</Link>
                    : '—'}
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {d.show?.tour
                    ? <Link to={`/tour/${encodeURIComponent(d.show.tour)}`}>{d.show.tour}</Link>
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

