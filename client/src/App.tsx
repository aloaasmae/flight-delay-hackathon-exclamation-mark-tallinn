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

type Airport = { id: number; name: string }

type PredictResult = {
  delayChance: number
  confidence: number
}

function PredictCell({ dayIndex, airportId }: { dayIndex: number; airportId: number }) {
  const [hovered, setHovered] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleMouseEnter = () => {
    if (result || loading) {
      setHovered(true)
      return
    }
    setHovered(true)
    setLoading(true)
    setError(null)
    fetch('http://0.0.0.0:3000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
      body: JSON.stringify({
        dayOfWeekId: dayIndex + 1,
        airportId
      })
    })
      .then(async res => {
        if (!res.ok) throw new Error('Failed to fetch prediction')
        return res.json()
      })
      .then(data => {
        setResult(data)
        setLoading(false)
      })
      .catch(err => {
        setError('Error')
        setLoading(false)
      })
  }

  const handleMouseLeave = () => {
    setHovered(false)
  }

  return (
    <td>
      {!hovered ? (
        <button
          style={{ width: '100%', cursor: 'pointer' }}
          onMouseEnter={handleMouseEnter}
        >
          hover
        </button>
      ) : loading ? (
        <span>Loading...</span>
      ) : error ? (
        <span style={{ color: 'red' }}>{error}</span>
      ) : result ? (
        <span>
          Delay chance: {(result.delayChance * 100).toFixed(1)}%
        </span>
      ) : (
        <span>...</span>
      )}
      {/* Reset cell on mouse leave */}
      <div
        style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}
        onMouseLeave={handleMouseLeave}
      />
    </td>
  )
}

function App() {
  const [airports, setAirports] = useState<Airport[]>([])
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
        <div
          style={{
            background: '#e0e7ef',
            color: '#222',
            borderRadius: 8,
            padding: '1em',
            marginBottom: '1.5em',
            maxWidth: 500,
            textAlign: 'left'
          }}
        >
          <strong>How to use:</strong> Below is a table where each row is a day of the week and each column is an airport. Hover over a button in the table to see the predicted chance of flight delay for that day and airport.
        </div>
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
              {daysOfWeek.map((day, dayIdx) => (
                <tr key={day}>
                  <td>{day}</td>
                  {airports.map((airport) => (
                    <PredictCell key={airport.id} dayIndex={dayIdx} airportId={airport.id} />
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

