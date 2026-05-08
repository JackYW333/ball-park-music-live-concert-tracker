import { Fragment } from 'react'
import { Link } from 'react-router-dom'

export default function Breadcrumb({ items, style }) {
  return (
    <div className="breadcrumb" style={style}>
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="breadcrumb__sep">›</span>}
          {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
        </Fragment>
      ))}
    </div>
  )
}
