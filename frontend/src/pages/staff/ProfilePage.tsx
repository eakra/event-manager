import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, CircularProgress, Alert, Button,
  alpha, useTheme, Snackbar, TextField, IconButton, Tooltip,
  Autocomplete, Chip,
} from '@mui/material';
import { Save as SaveIcon, Delete as DeleteIcon, Add as AddIcon, WorkspacePremium as QualificationIcon } from '@mui/icons-material';
import { staffApi, tagsApi } from '../../services/api';

const DAYS = [
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
  { label: 'Sunday', value: 7 },
];

type TimeSlot = { startTime: string; endTime: string };
type Holiday = { id: number; startDate: string; endDate: string };

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingHours, setSavingHours] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState('');
  const [maxHours, setMaxHours] = useState(40);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [savingTags, setSavingTags] = useState(false);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [newHolStart, setNewHolStart] = useState('');
  const [newHolEnd, setNewHolEnd] = useState('');
  const [savingHoliday, setSavingHoliday] = useState(false);
  const [availability, setAvailability] = useState<Record<number, TimeSlot[]>>({
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []
  });
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
      setLoadingTags(true);
      const [res, tagsRes] = await Promise.all([
        staffApi.get(userId),
        tagsApi.list()
      ]);
      setProfile(res.data);
      setAllTags(tagsRes.data);
      setMaxHours(res.data.maxHoursPerWeek || 40);

      // Build block map from availability data
      const newAvail: Record<number, TimeSlot[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
      if (res.data.availability) {
        for (const av of res.data.availability) {
          newAvail[av.dayOfWeek].push({
            startTime: av.startTime.length >= 5 ? av.startTime.slice(0, 5) : av.startTime,
            endTime: av.endTime.length >= 5 ? av.endTime.slice(0, 5) : av.endTime,
          });
        }
      }
      setAvailability(newAvail);

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
      setLoadingTags(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const addSlot = (dayIdx: number) => {
    setAvailability(prev => ({
      ...prev,
      [dayIdx]: [...prev[dayIdx], { startTime: '09:00', endTime: '17:00' }]
    }));
  };

  const removeSlot = (dayIdx: number, slotIdx: number) => {
    setAvailability(prev => ({
      ...prev,
      [dayIdx]: prev[dayIdx].filter((_, i) => i !== slotIdx)
    }));
  };

  const updateSlot = (dayIdx: number, slotIdx: number, field: 'startTime' | 'endTime', val: string) => {
    setAvailability(prev => {
      const slots = [...prev[dayIdx]];
      slots[slotIdx] = { ...slots[slotIdx], [field]: val };
      return { ...prev, [dayIdx]: slots };
    });
  };

  const handleSave = async () => {
    const userId = getUserId();
    if (!userId) return;

    // Convert map back to availability slots
    const slots: AvailabilitySlot[] = [];
    Object.entries(availability).forEach(([dayStr, daySlots]) => {
      daySlots.forEach(slot => {
        slots.push({
          dayOfWeek: parseInt(dayStr),
          startTime: slot.startTime.length === 5 ? `${slot.startTime}:00` : slot.startTime,
          endTime: slot.endTime.length === 5 ? `${slot.endTime}:00` : slot.endTime,
        });
      });
    });

    try {
      setSaving(true);
      await staffApi.updateAvailability(userId, slots);
      setSnackbar('Availability saved');
    } catch { setError('Failed to save availability'); }
    finally { setSaving(false); }
  };

  const handleSaveMaxHours = async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      setSavingHours(true);
      await staffApi.updateMaxHours(userId, maxHours);
      setSnackbar('Max hours saved');
    } catch {
      setError('Failed to save max hours');
    } finally {
      setSavingHours(false);
    }
  };

  const handleAddHoliday = async () => {
    const userId = getUserId();
    if (!userId || !newHolStart || !newHolEnd) return;
    try {
      setSavingHoliday(true);
      const res = await staffApi.addHoliday(userId, { startDate: newHolStart, endDate: newHolEnd });
      setHolidays(prev => [...prev, res.data]);
      setNewHolStart('');
      setNewHolEnd('');
      setSnackbar('Time Off added successfully');
    } catch {
      setError('Failed to add Time Off');
    } finally {
      setSavingHoliday(false);
    }
  };

  const handleUpdateTags = async (newTags: any[]) => {
    const userId = getUserId();
    if (!userId) return;
    try {
      setSavingTags(true);
      const tagIds = newTags.map(t => t.id);
      await staffApi.updateTags(userId, tagIds);
      setProfile((prev: any) => ({ ...prev, tags: newTags }));
      setSnackbar('Qualifications updated');
    } catch {
      setError('Failed to update qualifications');
    } finally {
      setSavingTags(false);
    }
  };

  const handleRemoveHoliday = async (holidayId: number) => {
    const userId = getUserId();
    if (!userId) return;
    try {
      await staffApi.removeHoliday(userId, holidayId);
      setHolidays(prev => prev.filter(h => h.id !== holidayId));
      setSnackbar('Time Off removed');
    } catch {
      setError('Failed to remove Time Off');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h4" fontWeight={700}>My Profile</Typography>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          Save Availability
        </Button>
      </Box>

      {profile && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {profile.name} · {profile.email} · Max {profile.maxHoursPerWeek}h/week
        </Typography>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight={600}>Max Weekly Hours</Typography>
              <Typography variant="body2" color="text.secondary">Specify the maximum number of hours you are willing to be scheduled.</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                label="Hours/week"
                type="number"
                size="small"
                value={maxHours}
                onChange={(e) => setMaxHours(parseInt(e.target.value) || 0)}
                inputProps={{ min: 0, max: 100 }}
                sx={{ width: 120 }}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={handleSaveMaxHours}
                disabled={savingHours}
              >
                {savingHours ? <CircularProgress size={16} /> : 'Save Hours'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <QualificationIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>My Qualifications</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Self-assign your certifications and skills to qualify for specific events.
          </Typography>
          
          <Autocomplete
            multiple
            options={allTags}
            getOptionLabel={(option) => option.name}
            value={profile?.tags || []}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_, newValue) => handleUpdateTags(newValue)}
            loading={loadingTags}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip
                  label={option.name}
                  {...getTagProps({ index })}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: 1, fontWeight: 600 }}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search and select qualifications..."
                placeholder="e.g. First Aid, DBS"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {savingTags || loadingTags ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </CardContent>
      </Card>

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
                  <Box key={h.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <Typography fontWeight={500}>{h.startDate}</Typography>
                    <Typography color="text.secondary">to</Typography>
                    <Typography fontWeight={500}>{h.endDate}</Typography>
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

      <Card>
        <CardContent sx={{ pb: '16px !important' }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Weekly Availability
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add specific time ranges you are available to work for each day.
          </Typography>

          <Box sx={{ borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            {DAYS.map((day) => (
              <Box key={day.value} sx={{ display: 'flex', alignItems: 'flex-start', py: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Box sx={{ width: 120, pt: 1 }}>
                  <Typography fontWeight={600}>{day.label}</Typography>
                </Box>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {availability[day.value]?.length === 0 ? (
                    <Typography color="text.secondary" sx={{ pt: 1, fontSize: '0.9rem' }}>Unavailable</Typography>
                  ) : (
                    availability[day.value]?.map((slot, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField 
                          type="time" 
                          size="small" 
                          value={slot.startTime} 
                          onChange={(e) => updateSlot(day.value, idx, 'startTime', e.target.value)} 
                          sx={{ '& input': { p: 1 } }}
                        />
                        <Typography color="text.secondary">-</Typography>
                        <TextField 
                          type="time" 
                          size="small" 
                          value={slot.endTime} 
                          onChange={(e) => updateSlot(day.value, idx, 'endTime', e.target.value)} 
                          sx={{ '& input': { p: 1 } }}
                        />
                        <IconButton size="small" onClick={() => removeSlot(day.value, idx)} color="error" sx={{ ml: 1 }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))
                  )}
                </Box>
                <Box>
                  <Tooltip title="Add Time Slot">
                    <IconButton size="small" onClick={() => addSlot(day.value)} sx={{ color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
}
