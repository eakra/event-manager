import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, CircularProgress, Alert, Button,
  alpha, useTheme, Snackbar, TextField, IconButton, Chip,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { staffApi } from '../../services/api';

type Holiday = { id: number; startDate: string; endDate: string; status: string };

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState('');
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [newHolStart, setNewHolStart] = useState('');
  const [newHolEnd, setNewHolEnd] = useState('');
  const [savingHoliday, setSavingHoliday] = useState(false);
  const theme = useTheme();

  const getUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
  };

  const loadProfile = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      setLoading(true);
      const res = await staffApi.get(userId);
      setProfile(res.data);

      // Holidays
      try {
        const holRes = await staffApi.getHolidays(userId);
        setHolidays(holRes.data);
      } catch {
        console.error('Failed to load holidays');
      }
    } catch { setError('Failed to load profile'); }
    finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleAddHoliday = async () => {
    const userId = getUserId();
    if (!userId || !newHolStart || !newHolEnd) return;
    try {
      setSavingHoliday(true);
      const res = await staffApi.addHoliday(userId, { startDate: newHolStart, endDate: newHolEnd });
      setHolidays(prev => [...prev, res.data]);
      setNewHolStart('');
      setNewHolEnd('');
      setSnackbar('Time Off / Holiday request submitted');
    } catch {
      setError('Failed to request holiday');
    } finally {
      setSavingHoliday(false);
    }
  };

  const handleRemoveHoliday = async (holidayId: number) => {
    const userId = getUserId();
    if (!userId) return;
    try {
      await staffApi.removeHoliday(userId, holidayId);
      setHolidays(prev => prev.filter(h => h.id !== holidayId));
      setSnackbar('Holiday request removed');
    } catch {
      setError('Failed to remove holiday request');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h4" fontWeight={700}>My Profile</Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {profile.name} · {profile.email}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={600}>Time Off / Holidays</Typography>
              <Typography variant="body2" color="text.secondary">Specify date ranges when you will be explicitly unavailable.</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField 
                label="Start Date" 
                type="date" 
                size="small" 
                InputLabelProps={{ shrink: true }}
                value={newHolStart}
                onChange={(e) => setNewHolStart(e.target.value)}
              />
              <Typography color="text.secondary">to</Typography>
              <TextField 
                label="End Date" 
                type="date" 
                size="small" 
                InputLabelProps={{ shrink: true }}
                value={newHolEnd}
                onChange={(e) => setNewHolEnd(e.target.value)}
              />
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handleAddHoliday}
                disabled={savingHoliday || !newHolStart || !newHolEnd}
              >
                {savingHoliday ? <CircularProgress size={16} /> : 'Add Time Off'}
              </Button>
            </Box>
            {holidays.length > 0 && (
              <Box sx={{ mt: 1 }}>
                {holidays.map(h => (
                  <Box key={h.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography fontWeight={600}>{h.startDate}</Typography>
                      <Typography color="text.secondary">to</Typography>
                      <Typography fontWeight={600}>{h.endDate}</Typography>
                    </Box>
                    <Chip 
                      label={h.status || 'PENDING'} 
                      size="small" 
                      color={h.status === 'APPROVED' ? 'success' : h.status === 'REJECTED' ? 'error' : 'warning'}
                      variant="outlined"
                      sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                    />
                    <IconButton size="small" color="error" onClick={() => handleRemoveHoliday(h.id)} sx={{ ml: 1 }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>


      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
}
