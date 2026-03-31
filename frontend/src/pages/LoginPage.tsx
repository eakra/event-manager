import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, CircularProgress, useTheme, alpha, InputAdornment, IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') navigate('/admin/events', { replace: true });
      else if (user.role === 'STAFF') navigate('/staff/schedule', { replace: true });
      else if (user.role === 'PARTICIPANT') navigate('/participant/events', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(ellipse at 30% 30%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
                     radial-gradient(ellipse at 70% 70%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 50%),
                     linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)`,
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 420,
          width: '100%',
          p: 1,
          borderRadius: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.05)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              component="img"
              src="/oyci_logo_new.png"
              alt="OYCI Logo"
              sx={{
                width: 72,
                height: 72,
                mx: 'auto',
                mb: 2,
                objectFit: 'contain',
                filter: 'drop-shadow(0 8px 16px rgba(11, 142, 54, 0.2))',
              }}
            />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to the Event Staffing System
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              id="email-input"
              label="Email Address"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              autoComplete="email"
              autoFocus
            />
            <TextField
              id="password-input"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              id="login-button"
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Box component={RouterLink} to="/register" sx={{ fontWeight: 600, color: 'primary.main', textDecoration: 'none' }}>
                Join Us
              </Box>
            </Typography>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 3 }}
          >
            Demo: admin@booking-app.local / admin123
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
