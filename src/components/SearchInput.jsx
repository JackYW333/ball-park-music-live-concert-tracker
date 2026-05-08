export default function SearchInput({ value, onChange, placeholder, maxWidth = 300 }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '7px', padding: '0.5rem 0.75rem',
        color: 'var(--text)', fontSize: '0.875rem', width: '100%',
        maxWidth, outline: 'none',
      }}
    />
  )
}
