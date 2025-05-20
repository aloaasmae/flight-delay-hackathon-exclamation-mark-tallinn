import { useEffect, useState } from 'react'
import './App.css'

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]

function App() {
  const [airports, setAirports] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('http://0.0.0.0:3000/airports', { mode: 'cors' })
      .then(async res => {
        if (!res.ok) throw new Error('Failed to fetch airports')
        const text = await res.text()
        try {
          return JSON.parse(text)
        } catch {
          throw new Error('Received invalid data from server')
        }
      })
      .then(data => {
        setAirports(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div className="kartulilennuk-root">
      <h1 className="kartulilennuk-title">kartulilennuk</h1>
      <div className="kartulilennuk-card">
        <img
          src="https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=600&q=80"
          alt="Tartu City"
          className="kartulilennuk-plane"
        />
        {loading && <div>Loading airports...</div>}
        {error && <div style={{ color: 'red' }}>Error: {error}</div>}
        {!loading && !error && (
          <table className="kartulilennuk-table">
            <thead>
              <tr>
                <th>Day</th>
                {airports.map((airport) => (
                  <th key={airport.id}>{airport.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {daysOfWeek.map((day) => (
                <tr key={day}>
                  <td>{day}</td>
                  {airports.map((airport) => (
                    <td key={airport.id}></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default App
