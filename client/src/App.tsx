import { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Paper,
  Tooltip
} from '@mui/material'
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

// 20% (0.20) = green, 22.5% (0.225) = yellow, 25% (0.25) = red
function getDelayChanceColor(chance: number) {
  const min = 0.20;
  const mid = 0.225;
  const max = 0.25;
  const clamped = Math.max(min, Math.min(chance, max));

  if (clamped <= mid) {
    // green to yellow
    const ratio = (clamped - min) / (mid - min); // 0 = green, 1 = yellow
    const r = Math.round(0x4c + (0xff - 0x4c) * ratio);
    const g = Math.round(0xaf + (0xeb - 0xaf) * ratio);
    const b = Math.round(0x50 + (0x3b - 0x50) * ratio);
    return `rgb(${r},${g},${b})`;
  } else {
    // yellow to red
    const ratio = (clamped - mid) / (max - mid); // 0 = yellow, 1 = red
    const r = Math.round(0xff + (0xf4 - 0xff) * ratio);
    const g = Math.round(0xeb + (0x43 - 0xeb) * ratio);
    const b = Math.round(0x3b + (0x36 - 0x3b) * ratio);
    return `rgb(${r},${g},${b})`;
  }
}

function PredictCell({ dayIndex, airportId }: { dayIndex: number; airportId: number }) {
  const [hovered, setHovered] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Use onMouseEnter/onMouseLeave directly on the TableCell for reliable hover
  const handleMouseEnter = () => {
    setHovered(true)
    if (!result && !loading) {
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
        .catch(() => {
          setError('Error')
          setLoading(false)
        })
    }
  }

  const handleMouseLeave = () => {
    setHovered(false)
  }

  return (
    <TableCell
      align="center"
      sx={{ position: 'relative', minWidth: 120 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {!hovered ? (
        <Tooltip title="Hover to see delay prediction" arrow>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            sx={{ minWidth: 80 }}
          >
            hover
          </Button>
        </Tooltip>
      ) : loading ? (
        <Box display="flex" alignItems="center" justifyContent="center" height={40}>
          <CircularProgress size={20} />
        </Box>
      ) : error ? (
        <Typography color="error" variant="body2">{error}</Typography>
      ) : result ? (
        <Box
          className="delay-chance-cell"
          sx={{
            background: getDelayChanceColor(result.delayChance),
            borderRadius: 1,
            px: 1,
            py: 0.5,
            display: 'inline-block',
          }}
        >
          <Typography variant="body2" color="primary" sx={{ color: '#222', fontWeight: 700 }}>
            Delay chance: {(result.delayChance * 100).toFixed(1)}%
          </Typography>
        </Box>
      ) : (
        <span>...</span>
      )}
    </TableCell>
  )
}

function App() {
  const [airports, setAirports] = useState<Airport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('http://localhost:3000/airports', { mode: 'cors' })
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

  // Set a funny pun as the page title
  useEffect(() => {
    document.title = "Cloudy With a Chance of Delays";
  }, []);

  return (
    <Box className="kartulilennuk-root" sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', py: 4 }}>
      <Typography className="kartulilennuk-title" variant="h3" gutterBottom>
          Cloudy With a Chance of Delays
      </Typography>
      <Card className="kartulilennuk-card" sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
        <Box
          component="img"
          src="https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=600&q=80"
          alt="Tartu City"
          className="kartulilennuk-plane"
          sx={{
            width: 320,
            borderRadius: 2,
            mb: 3,
            boxShadow: 2
          }}
        />
        <CardContent sx={{ width: '100%', pb: 0 }}>
          <Box
            sx={{
              background: '#e0e7ef',
              color: '#222',
              borderRadius: 2,
              p: 2,
              mb: 3,
              maxWidth: 600,
              textAlign: 'left',
              mx: 'auto'
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              How to use:
            </Typography>
            <Typography variant="body2">
              Below is a table where each row is a day of the week and each column is an airport.
              Hover over a button in the table to see the predicted chance of flight delay for that day and airport.
            </Typography>
          </Box>
          {loading && <Typography>Loading airports...</Typography>}
          {error && <Typography color="error">Error: {error}</Typography>}
          {!loading && !error && (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table className="kartulilennuk-table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Day</TableCell>
                    {airports.map((airport) => (
                      <TableCell key={airport.id} align="center" sx={{ fontWeight: 'bold' }}>
                        {airport.name}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {daysOfWeek.map((day, dayIdx) => (
                    <TableRow key={day}>
                      <TableCell>{day}</TableCell>
                      {airports.map((airport) => (
                        <PredictCell key={airport.id} dayIndex={dayIdx} airportId={airport.id} />
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default App
