import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Pagination,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import "./App.css";
import LoginPage from "./LoginPage";
import PaywallDialog from "./PaywallDialog";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type Airport = { id: number; name: string };

type PredictResult = {
  delayChance: number;
  confidence: number;
};

// 20% (0.20) = green, 22.5% (0.225) = yellow, 25% (0.25) = red
function getDelayChanceColor(chance: number) {
  const min = 0.2;
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

function PredictCell({
  dayIndex,
  airportId,
  canHover,
  onHoverAttempt,
}: {
  dayIndex: number;
  airportId: number;
  canHover: boolean;
  onHoverAttempt: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMouseEnter = () => {
    if (!canHover) {
      onHoverAttempt();
      return;
    }
    setHovered(true);
    if (!result && !loading) {
      setLoading(true);
      setError(null);
      fetch("http://0.0.0.0:3000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        body: JSON.stringify({
          dayOfWeekId: dayIndex + 1,
          airportId,
        }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to fetch prediction");
          return res.json();
        })
        .then((data) => {
          setResult(data);
          setLoading(false);
        })
        .catch(() => {
          setError("Error");
          setLoading(false);
        });
    }
    onHoverAttempt();
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  return (
    <TableCell
      align="center"
      sx={{ position: "relative", minWidth: 120 }}
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
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height={40}
        >
          <CircularProgress size={20} />
        </Box>
      ) : error ? (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      ) : result ? (
        <Box
          className="delay-chance-cell"
          sx={{
            background: getDelayChanceColor(result.delayChance),
            borderRadius: 1,
            px: 1,
            py: 0.5,
            display: "inline-block",
          }}
        >
          <Typography
            variant="body2"
            color="primary"
            sx={{ color: "#222", fontWeight: 700 }}
          >
            Delay chance: {(result.delayChance * 100).toFixed(1)}%
          </Typography>
        </Box>
      ) : (
        <span>...</span>
      )}
    </TableCell>
  );
}

function SkeletonTable({ columns = 5, rows = 7 }: { columns?: number; rows?: number }) {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>
              <Skeleton width={60} />
            </TableCell>
            {Array.from({ length: columns }).map((_, idx) => (
              <TableCell key={idx} align="center" sx={{ fontWeight: "bold" }}>
                <Skeleton width={100} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <TableRow key={rowIdx}>
              <TableCell>
                <Skeleton width={80} />
              </TableCell>
              {Array.from({ length: columns }).map((_, colIdx) => (
                <TableCell key={colIdx} align="center">
                  <Skeleton variant="rectangular" width={80} height={32} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const AIRPORTS_PER_PAGE = 5;

function App() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  // Paywall state
  const [hoverViews, setHoverViews] = useState(1); // 1 free view
  const [paywallOpen, setPaywallOpen] = useState(false);

  // Dummy login logic for demonstration
  const handleLogin = async () => {
    setLoggedIn(true);
    return true;
  };

  useEffect(() => {
    if (!loggedIn) return;
    fetch("http://localhost:3000/airports", { mode: "cors" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch airports");
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch {
          throw new Error("Received invalid data from server");
        }
      })
      .then((data) => {
        setAirports(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [loggedIn]);

  // Set a funny pun as the page title
  useEffect(() => {
    document.title = "Cloudy With a Chance of Delays";
  }, []);

  // Filter airports by name (case-insensitive)
  const filteredAirports = airports.filter((a) =>
    a.name.toLowerCase().includes(filter.toLowerCase())
  );
  const totalPages = Math.ceil(filteredAirports.length / AIRPORTS_PER_PAGE);
  const pagedAirports = filteredAirports.slice(
    (page - 1) * AIRPORTS_PER_PAGE,
    page * AIRPORTS_PER_PAGE
  );

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    setPage(1);
  };

  // Paywall logic
  const canHover = hoverViews > 0;
  const handleHoverAttempt = () => {
    if (hoverViews > 0) {
      setHoverViews((v) => v - 1);
    } else {
      setPaywallOpen(true);
    }
  };
  const handleBuyMore = () => {
    setHoverViews((v) => v + 5);
    setPaywallOpen(false);
  };

  if (!loggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div
      className="kartulilennuk-root"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        background: "#f5f7fa",
        paddingTop: "32px",
        paddingBottom: "32px",
      }}
    >
      {/* Clouds as background elements */}
      <div className="cloud left" style={{ zIndex: 0 }} />
      <div className="cloud left2" style={{ zIndex: 0 }} />
      <div className="cloud left3" style={{ zIndex: 0 }} />
      <div className="cloud right" style={{ zIndex: 0 }} />
      <div className="cloud right2" style={{ zIndex: 0 }} />
      <div className="cloud right3" style={{ zIndex: 0 }} />
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Typography className="kartulilennuk-title" variant="h3" gutterBottom>
          Cloudy With a Chance of Delays
        </Typography>
        <Card
          className="kartulilennuk-card"
          sx={{ maxWidth: 900, mx: "auto", p: 3 }}
        >
          <Box
            component="img"
            src="https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=600&q=80"
            alt="Tartu City"
            className="kartulilennuk-plane"
            sx={{
              width: 320,
              borderRadius: 2,
              mb: 3,
              boxShadow: 2,
            }}
          />
          <CardContent sx={{ width: "100%", pb: 0 }}>
            <Box
              sx={{
                background: "#e0e7ef",
                color: "#222",
                borderRadius: 2,
                p: 2,
                mb: 3,
                maxWidth: 600,
                textAlign: "left",
                mx: "auto",
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                How to use:
              </Typography>
              <Typography variant="body2">
                Below is a table where each row is a day of the week and each
                column is an airport. Hover over a button in the table to see the
                predicted chance of flight delay for that day and airport. Use the
                pagination below the table to see more airports.
              </Typography>
            </Box>
            <Box mb={2} display="flex" justifyContent="center">
              <TextField
                label="Filter airports"
                variant="outlined"
                size="small"
                value={filter}
                onChange={handleFilterChange}
                sx={{ minWidth: 250 }}
                InputProps={{
                  endAdornment: filter && (
                    <Button
                      onClick={() => setFilter("")}
                      size="small"
                      sx={{ minWidth: 0, padding: 0 }}
                    >
                      Clear
                    </Button>
                  ),
                }}
              />
            </Box>
             {loading && (
            <Box>
              <SkeletonTable columns={AIRPORTS_PER_PAGE} rows={daysOfWeek.length} />
            </Box>
          )}
            {error && <Typography color="error">Error: {error}</Typography>}
            {!loading && !error && (
              <>
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                  <Table className="kartulilennuk-table">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>Day</TableCell>
                        {pagedAirports.map((airport) => (
                          <TableCell
                            key={airport.id}
                            align="center"
                            sx={{ fontWeight: "bold" }}
                          >
                            {airport.name}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {daysOfWeek.map((day, dayIdx) => (
                        <TableRow key={day}>
                          <TableCell>{day}</TableCell>
                          {pagedAirports.map((airport) => (
                              <PredictCell
                                  key={airport.id + "-" + dayIdx}
                                  dayIndex={dayIdx}
                                  airportId={airport.id}
                                  canHover={canHover}
                                  onHoverAttempt={handleHoverAttempt}
                              />
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    shape="rounded"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              </>
            )}
              <PaywallDialog
                  open={paywallOpen}
                  onClose={() => setPaywallOpen(false)}
                  onBuyMore={handleBuyMore}
              />
          </CardContent>
        </Card>
      </Box>
    </div>
  );
}

export default App;
