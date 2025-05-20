import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [airports, setAirports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('http://0.0.0.0:3000/airports', { mode: 'cors' })
      .then(async res => {
        console.log(res)
        if (!res.ok) throw new Error('Failed to fetch airports')
        const text = await res.text()
        console.log(text)
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
                <th>ID</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {airports.map((airport: { id: number; name: string }) => (
                <tr key={airport.id}>
                  <td>{airport.id}</td>
                  <td>{airport.name}</td>
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
