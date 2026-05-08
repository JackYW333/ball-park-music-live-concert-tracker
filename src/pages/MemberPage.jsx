import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb.jsx'
import StatCard from '../components/StatCard.jsx'
import { computeSongStats, countUniqueSongs, computeShowsPerYear, formatDate } from '../utils/stats.js'
import ShowsPerYear from '../components/ShowsPerYear.jsx'
import SongTable from '../components/SongTable.jsx'
import membersConfig from '../../config/members.json'

function isInPeriod(date, periods) {
  return periods.some(p => date >= p.from && date <= (p.to || '9999-12-31'))
}

function formatPeriods(periods) {
  return periods.map(p => {
    const from = p.from.slice(0, 7)
    const to = p.to ? p.to.slice(0, 7) : 'present'
    return `${from} – ${to}`
  }).join(', ')
}

export default function MemberPage({ data, attendance }) {
  const { memberId } = useParams()
  const { loading, error, setlists } = data
  const { attended } = attendance

  const member = membersConfig.members.find(m => m.id === memberId)

  const shows = useMemo(
    () => setlists
      .filter(s => isInPeriod(s.date, member?.periods || []))
      .sort((a, b) => a.date.localeCompare(b.date)),
    [setlists, member]
  )

  const showsWithSetlist = useMemo(
    () => shows.filter(s => s.songs.some(song => !song.tape)),
    [shows]
  )

  const stats = useMemo(() => {
    if (!showsWithSetlist.length) return null
    return {
      songs: computeSongStats(showsWithSetlist),
      uniqueSongs: countUniqueSongs(showsWithSetlist),
      perYear: computeShowsPerYear(shows),
    }
  }, [shows, showsWithSetlist])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return <div className="loading">Error: {error}</div>
  if (!member) return <div className="page-container"><div className="empty">Member not found.</div></div>

  const first = shows[0]
  const last = shows[shows.length - 1]

  return (
    <div className="page-container">
      <Breadcrumb items={[{ label: 'Overview', to: '/' }, { label: 'Members', to: '/members' }, { label: member.name }]} />

      <div className="page-heading">
        <h1>{member.name}</h1>
        <p className="sub">{member.role} · {formatPeriods(member.periods)}</p>
      </div>

      <div className="stat-grid">
        <StatCard value={shows.length.toLocaleString()} label="Shows" />
        <StatCard value={showsWithSetlist.length.toLocaleString()} label="With Known Setlist" />
        <StatCard value={stats?.uniqueSongs ?? '—'} label="Unique Songs Played" />
        {first && <StatCard value={formatDate(first.date)} label="First Show" to={`/concert/${first.id}`} />}
        {last && first?.id !== last?.id && <StatCard value={formatDate(last.date)} label="Last Show" to={`/concert/${last.id}`} />}
      </div>

      {stats && (
        <>
          <div className="section">
            <ShowsPerYear data={stats.perYear} />
          </div>

          <div className="section">
            <SongTable songs={stats.songs} totalShows={showsWithSetlist.length} />
          </div>
        </>
      )}

      <div className="section">
        <div className="section-title">All Shows</div>
        <div className="table-scroll">
          <table className="shows-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Venue</th>
                <th>City</th>
                <th>Country</th>
                <th>Tour</th>
                <th>Songs</th>
              </tr>
            </thead>
            <tbody>
              {[...shows].reverse().map((show, i) => (
                <tr key={show.id} className={attended.has(show.id) ? 'attended-row' : ''}>
                  <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{i + 1}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <Link to={`/concert/${show.id}`} style={show.songs.length === 0 ? { color: 'var(--text-muted)' } : undefined}>
                      {formatDate(show.date)}
                    </Link>
                  </td>
                  <td>
                    <Link to={`/concert/${show.id}`} style={show.songs.length === 0 ? { color: 'var(--text-muted)' } : undefined}>
                      {show.venue}
                    </Link>
                  </td>
                  <td><Link to={`/city/${encodeURIComponent(show.city)}/${show.countryCode}`} style={{ color: 'var(--text)' }}>{show.city}</Link></td>
                  <td><Link to={`/country/${show.countryCode}`}><span className="country-code">{show.countryCode}</span></Link></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {show.tour ? <Link to={`/tour/${encodeURIComponent(show.tour)}`}>{show.tour}</Link> : '—'}
                  </td>
                  <td style={{ color: show.songs.length > 0 ? 'var(--text)' : 'var(--text-dim)' }}>
                    {show.songs.length > 0 ? show.songs.filter(s => !s.tape).length : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
