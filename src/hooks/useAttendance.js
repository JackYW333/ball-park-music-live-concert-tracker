import { useState, useCallback } from 'react'

const STORAGE_KEY = 'ball-park-music-attendance'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    const ids = Array.isArray(parsed) ? parsed : (parsed.shows || [])
    return new Set(ids.filter(id => typeof id === 'string'))
  } catch {
    return new Set()
  }
}

function persistToStorage(set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
}

export function useAttendance() {
  const [attended, setAttended] = useState(loadFromStorage)

  const toggleAttendance = useCallback(id => {
    setAttended(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      persistToStorage(next)
      return next
    })
  }, [])

  const exportAttendance = useCallback(() => {
    const payload = { version: 1, exportedAt: new Date().toISOString(), shows: [...attended] }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ball-park-music-attendance.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [attended])

  const importAttendance = useCallback(file => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target.result)
        const ids = Array.isArray(parsed) ? parsed : (parsed.shows || [])
        if (!Array.isArray(ids)) throw new Error()
        const next = new Set(ids.filter(id => typeof id === 'string'))
        persistToStorage(next)
        setAttended(next)
      } catch {
        alert('Could not read attendance file. Make sure it was exported from this app.')
      }
    }
    reader.readAsText(file)
  }, [])

  return { attended, toggleAttendance, exportAttendance, importAttendance }
}
