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
import { useEffect, useState, useRef, useMemo } from "react";
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
  onHoverAttempt: (delayChance?: number) => void;
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
          onHoverAttempt(data.delayChance);
        })
        .catch(() => {
          setError("Error");
          setLoading(false);
        });
    } else {
      onHoverAttempt(result?.delayChance);
    }
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

// --- Plane SVGs ---
const planeSvgs = [
  // Classic plane
  (
    <svg width="120" height="64" viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Fuselage */}
      <rect x="16" y="28" width="64" height="8" rx="4" fill="#8b4513"/>
      {/* Nose */}
      <ellipse cx="88" cy="32" rx="12" ry="6" fill="#8b4513"/>
      {/* Tail fin */}
      <polygon points="16,28 8,16 16,36" fill="#8b4513"/>
      {/* Left wing */}
      <polygon points="40,28 20,10 44,36" fill="#a0522d"/>
      {/* Right wing */}
      <polygon points="40,36 20,54 44,28" fill="#a0522d"/>
      {/* Window/cockpit */}
      <ellipse cx="92" cy="32" rx="4" ry="2.4" fill="#fff5e1"/>
    </svg>
  ),
  // Jet plane
  (
    <svg width="120" height="64" viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main body */}
      <rect x="20" y="28" width="60" height="8" rx="4" fill="#a0522d"/>
      {/* Nose cone */}
      <ellipse cx="84" cy="32" rx="10" ry="5" fill="#8b4513"/>
      {/* Tail fin */}
      <polygon points="20,28 12,20 20,36" fill="#8b4513"/>
      {/* Top fin */}
      <polygon points="28,28 32,12 36,28" fill="#8b4513"/>
      {/* Left wing */}
      <polygon points="44,28 28,8 48,36" fill="#deb887"/>
      {/* Right wing */}
      <polygon points="44,36 28,56 48,28" fill="#deb887"/>
      {/* Cockpit */}
      <ellipse cx="88" cy="32" rx="3" ry="1.8" fill="#fff5e1"/>
    </svg>
  ),
  // Propeller plane
  (
    <svg width="120" height="64" viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Fuselage */}
      <rect x="24" y="30" width="56" height="4" rx="2" fill="#8b4513"/>
      {/* Nose */}
      <ellipse cx="84" cy="32" rx="8" ry="4" fill="#a0522d"/>
      {/* Propeller */}
      <rect x="90" y="30" width="14" height="2" rx="1" fill="#deb887"/>
      <rect x="96" y="26" width="2" height="12" rx="1" fill="#deb887"/>
      {/* Tail fin */}
      <polygon points="24,30 18,24 24,34" fill="#8b4513"/>
      {/* Wing */}
      <polygon points="44,30 32,12 48,34" fill="#deb887"/>
      <polygon points="44,34 32,52 48,30" fill="#deb887"/>
      {/* Cockpit */}
      <ellipse cx="80" cy="32" rx="2.5" ry="1.2" fill="#fff5e1"/>
    </svg>
  ),
  // Modern airliner
  (
    <svg width="120" height="64" viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <rect x="18" y="29" width="70" height="6" rx="3" fill="#deb887"/>
      {/* Nose */}
      <ellipse cx="92" cy="32" rx="10" ry="5" fill="#8b4513"/>
      {/* Tail fin */}
      <polygon points="18,29 10,18 18,35" fill="#8b4513"/>
      {/* Top fin */}
      <polygon points="26,29 30,10 34,29" fill="#a0522d"/>
      {/* Left wing */}
      <polygon points="50,29 36,6 54,35" fill="#8b4513"/>
      {/* Right wing */}
      <polygon points="50,35 36,58 54,29" fill="#8b4513"/>
      {/* Cockpit */}
      <ellipse cx="96" cy="32" rx="3" ry="1.5" fill="#fff5e1"/>
    </svg>
  ),
  // Cartoon plane
  (
    <svg width="120" height="64" viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <ellipse cx="60" cy="32" rx="32" ry="12" fill="#a0522d"/>
      {/* Nose */}
      <ellipse cx="92" cy="32" rx="10" ry="8" fill="#deb887"/>
      {/* Tail fin */}
      <polygon points="28,32 16,20 28,44" fill="#8b4513"/>
      {/* Wing */}
      <ellipse cx="60" cy="44" rx="18" ry="4" fill="#fff5e1"/>
      {/* Cockpit */}
      <ellipse cx="80" cy="30" rx="5" ry="3" fill="#fff5e1"/>
    </svg>
  ),
];

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

  // Plane animation state
  const [planes, setPlanes] = useState<{
    id: number;
    duration: number;
    top: number;
    airportName: string;
    dayName: string;
    planeType: number;
    exploding?: boolean;
  }[]>([]);
  const planeIdRef = useRef(0);

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

  // Plane animation logic
  const triggerPlane = (delayChance?: number, airportName?: string, dayName?: string) => {
    // Default to 0.2 if not provided
    const chance = typeof delayChance === "number" ? delayChance : 0.2;
    // Increased variability: 0.2 (fastest) to 0.25 (slowest) maps to 1.0s - 7.0s
    const minChance = 0.2, maxChance = 0.25;
    const minDuration = 1.0, maxDuration = 7.0;
    const ratio = Math.max(0, Math.min((chance - minChance) / (maxChance - minChance), 1));
    const duration = minDuration + (maxDuration - minDuration) * ratio;

    const id = ++planeIdRef.current;
    // Random top between 10% and 40%
    const top = Math.random() * 30 + 10;
    // Choose a random plane SVG index
    const planeType = Math.floor(Math.random() * planeSvgs.length);
    setPlanes((prev) => [
      ...prev,
      {
        id,
        duration,
        top,
        airportName: airportName || "",
        dayName: dayName || "",
        planeType,
        exploding: false,
      }
    ]);
    setTimeout(() => {
      setPlanes((prev) => prev.filter((plane) => plane.id !== id));
    }, duration * 1000);
  };

  // Add hovers when a plane is destroyed
  const handlePlaneDestroyed = () => {
    setHoverViews((v) => v + 3); // Add 3 hovers per destroyed plane
  };

  // Handle plane click for explosion
  const handlePlaneClick = (planeId: number) => {
    setPlanes((prev) =>
      prev.map((p) =>
        p.id === planeId ? { ...p, exploding: true } : p
      )
    );
    setTimeout(() => {
      setPlanes((prev) => prev.filter((p) => p.id !== planeId));
      handlePlaneDestroyed();
    }, 700); // match explosion animation duration
  };

  // Memoize filtered and paged airports for performance
  const filteredAirports = useMemo(
    () =>
      airports.filter((a) =>
        a.name.toLowerCase().includes(filter.toLowerCase())
      ),
    [airports, filter]
  );
  const totalPages = useMemo(
    () => Math.ceil(filteredAirports.length / AIRPORTS_PER_PAGE),
    [filteredAirports.length]
  );
  const pagedAirports = useMemo(
    () =>
      filteredAirports.slice(
        (page - 1) * AIRPORTS_PER_PAGE,
        page * AIRPORTS_PER_PAGE
      ),
    [filteredAirports, page]
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
    setHoverViews((v) => v + 15);
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
      {/* Sticky hover counter */}
      <div className="hover-counter-sticky">
        <span role="img" aria-label="eye">👁️</span>{" "}
        <b>{hoverViews}</b> hover{hoverViews === 1 ? "" : "s"} left
      </div>
      {/* Clouds as background elements */}
      <div className="cloud c1" style={{ zIndex: 0 }} />
      <div className="cloud c2" style={{ zIndex: 0 }} />
      <div className="cloud c3" style={{ zIndex: 0 }} />
      <div className="cloud c4" style={{ zIndex: 0 }} />
      <div className="cloud c5" style={{ zIndex: 0 }} />
      <div className="cloud c6" style={{ zIndex: 0 }} />
      <div className="cloud c7" style={{ zIndex: 0 }} />
      <div className="cloud c8" style={{ zIndex: 0 }} />
      <div className="cloud c9" style={{ zIndex: 0 }} />
      <div className="cloud c10" style={{ zIndex: 0 }} />
      {/* Animated planes */}
      {planes.map((plane) => (
        <div
          className="plane-fly-animation"
          key={plane.id}
          style={{
            animationDuration: `${plane.duration}s`,
            top: `${plane.top}%`,
            zIndex: 1200,
            position: "fixed",
            left: "-80px",
            pointerEvents: "none",
          }}
        >
          <div
            className={
              (plane.duration > 4 ? "plane-wiggle " : "") +
              (plane.exploding ? "plane-exploding" : "")
            }
            style={{
              cursor: plane.exploding ? "default" : "pointer",
              pointerEvents: plane.exploding ? "none" : "auto",
              position: "relative",
              display: "inline-block",
            }}
            onClick={
              plane.exploding
                ? undefined
                : (e) => {
                    e.stopPropagation();
                    handlePlaneClick(plane.id);
                  }
            }
          >
            {planeSvgs[plane.planeType]}
            {plane.exploding && (
              <svg className="explosion-svg" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="22" fill="gold" opacity="0.8"/>
                <circle cx="40" cy="40" r="14" fill="orange" opacity="0.7"/>
                <circle cx="40" cy="40" r="7" fill="red" opacity="0.6"/>
                <polygon points="40,10 44,32 70,20 48,40 70,60 44,48 40,70 36,48 10,60 32,40 10,20 36,32"
                  fill="yellow" opacity="0.5"/>
              </svg>
            )}
          </div>
          {!plane.exploding && (
            <div
              style={{
                marginTop: 12,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                fontWeight: 600,
                color: "#8b4513",
                background: "#fff5e1",
                borderRadius: 6,
                padding: "4px 14px",
                fontSize: 18,
                boxShadow: "0 1px 4px rgba(139,69,19,0.07)",
                minWidth: 110,
              }}
            >
              <span>{plane.dayName}</span>
              <span>{plane.airportName}</span>
            </div>
          )}
        </div>
      ))}
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
                                  onHoverAttempt={(delayChance?: number) => {
                                    handleHoverAttempt();
                                    triggerPlane(
                                      delayChance,
                                      airport.name,
                                      day
                                    );
                                  }}
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
