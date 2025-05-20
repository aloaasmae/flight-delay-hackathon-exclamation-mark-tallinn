import './App.css'

const dummyAirports = [
  { code: 'TLL', name: 'Tallinn Airport', country: 'Estonia', passengers: 3_000_000 },
  { code: 'HEL', name: 'Helsinki Airport', country: 'Finland', passengers: 21_000_000 },
  { code: 'RIX', name: 'Riga Airport', country: 'Latvia', passengers: 7_000_000 },
  { code: 'ARN', name: 'Stockholm Arlanda', country: 'Sweden', passengers: 25_000_000 },
]

function App() {
  return (
    <div className="kartulilennuk-root">
      <h1 className="kartulilennuk-title">kartulilennuk</h1>
      <div className="kartulilennuk-card">
        <img
          src="https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=600&q=80"
          alt="Tartu City"
          className="kartulilennuk-plane"
        />
        <table className="kartulilennuk-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Country</th>
              <th>Passengers</th>
            </tr>
          </thead>
          <tbody>
            {dummyAirports.map((airport) => (
              <tr key={airport.code}>
                <td>{airport.code}</td>
                <td>{airport.name}</td>
                <td>{airport.country}</td>
                <td>{airport.passengers.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App
