import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Card, CardContent,
  Alert, Link, alpha, useTheme
} from '@mui/material';
import { authApi } from '../services/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', dateOfBirth: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await authApi.register(form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.violations && data.violations.length > 0) {
        setError(data.violations[0].message);
      } else {
        setError(data?.error || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `radial-gradient(ellipse at 30% 30%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
                   radial-gradient(ellipse at 70% 70%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 50%),
                   linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)`,
    }}>
      <Card sx={{ 
        maxWidth: 400, 
        width: '100%', 
        mx: 2, 
        p: 2, 
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.05)',
      }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              component="img"
              src="/oyci_logo_new.png"
              alt="OYCI Logo"
              sx={{
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 2,
                objectFit: 'contain',
              }}
            />
            <Typography variant="h4" fontWeight={800} sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Join Us
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Register for an account to sign up for events
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>Account created! Redirecting to login...</Alert>}

          <form onSubmit={handleRegister}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Email Address"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Date of Birth"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                required
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || success}
                sx={{ mt: 1, py: 1.5, fontWeight: 600 }}
              >
                {loading ? 'Creating...' : 'Register'}
              </Button>
            </Box>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" sx={{ fontWeight: 600, color: 'primary.main', textDecoration: 'none' }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
