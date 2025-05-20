import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

type LoginProps = {
  onLogin: (username: string, password: string) => Promise<boolean>;
};

export default function LoginPage({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const success = await onLogin(username, password);
    if (!success) {
      setError('Invalid username or password');
    }
    setSubmitting(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'linear-gradient(135deg, #f7e7ce 0%, #fff5e1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f7e7ce 0%, #fff5e1 100%)'
      }}
    >
      <Card
        sx={{
          minWidth: 370,
          p: 3,
          borderRadius: 4,
          boxShadow: '0 8px 30px rgba(139, 69, 19, 0.15)',
          background: 'linear-gradient(135deg, #fff5e1 0%, #f7e7ce 100%)'
        }}
      >
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <LockOutlinedIcon sx={{ fontSize: 48, color: '#8b4513', mb: 1 }} />
            <Typography variant="h5" gutterBottom align="center" sx={{ color: '#8b4513', fontWeight: 700 }}>
              Welcome to <span style={{ color: '#a0522d' }}>Cloudy With a Chance of Delays</span>
            </Typography>
            <Typography variant="body2" align="center" sx={{ color: '#a0522d', mb: 1 }}>
              Please log in to continue
            </Typography>
          </Box>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              label="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              fullWidth
              margin="normal"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon sx={{ color: '#8b4513' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                background: '#fff',
                borderRadius: 2,
                mb: 2
              }}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: '#8b4513' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((show) => !show)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                background: '#fff',
                borderRadius: 2,
                mb: 2
              }}
            />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                mt: 2,
                background: '#8b4513',
                fontWeight: 700,
                fontSize: '1.1rem',
                letterSpacing: 1,
                borderRadius: 2,
                '&:hover': {
                  background: '#a0522d'
                }
              }}
              disabled={submitting}
            >
              {submitting ? 'Logging in...' : 'Login'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
