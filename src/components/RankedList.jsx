import { Link } from 'react-router-dom'

// items: Array<{ key, to, label, extra?, count?, meta?, dimmed?, barColor? }>
// max: number used to normalise bar widths
export default function RankedList({ items, max = 1, barColor }) {
  return (
    <ol className="ranked-list">
      {items.map((item, i) => (
        <li key={item.key} style={item.dimmed ? { opacity: 0.4 } : undefined}>
          <span className="ranked-list__rank">{item.dimmed ? '—' : i + 1}</span>
          <Link to={item.to} className="ranked-list__name" style={{ color: 'var(--text)' }}>{item.label}</Link>
          {item.extra}
          {item.count != null && (
            <div className="ranked-list__bar-wrap">
              <div
                className="ranked-list__bar"
                style={{ width: `${Math.round((item.count / max) * 100)}%`, ...(item.barColor || barColor ? { background: item.barColor ?? barColor } : {}) }}
              />
            </div>
          )}
          <span className="ranked-list__meta">{item.meta ?? item.count}</span>
        </li>
      ))}
    </ol>
  )
}
