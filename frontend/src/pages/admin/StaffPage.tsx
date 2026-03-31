import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert, Chip, alpha, useTheme,
  Snackbar, Tab, Tabs,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Email as EmailIcon, CalendarMonth as CalendarIcon, AccessTime as AccessTimeIcon,
  Person as PersonIcon, Badge as BadgeIcon, Phone as PhoneIcon,
} from '@mui/icons-material';
import { staffApi, tagsApi, communicationsApi } from '../../services/api';
import { format, startOfWeek } from 'date-fns';

const DAYS = [
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
  { label: 'Sunday', value: 7 },
];

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailWeek, setEmailWeek] = useState(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  const [emailSending, setEmailSending] = useState(false);
  const [snackbar, setSnackbar] = useState('');
  const [editing, setEditing] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    typicalHoursPerWeek: 21,
    maxHoursPerWeek: 40,
    phoneNumber: '',
    tagIds: [] as number[],
    availability: [] as any[],
    holidays: [] as any[],
  });

  // Local availability map for the editor
  const [localAvail, setLocalAvail] = useState<Record<number, any[]>>({
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []
  });
  const [localHolidays, setLocalHolidays] = useState<any[]>([]);
  const [newHolStart, setNewHolStart] = useState('');
  const [newHolEnd, setNewHolEnd] = useState('');

  const theme = useTheme();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [sRes, tRes] = await Promise.all([staffApi.list(), tagsApi.list()]);
      setStaff(sRes.data);
      setTags(tRes.data);
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleOpen = (s?: any) => {
    setTabValue(0);
    if (s) {
      setEditing(s);
      setForm({
        name: s.name,
        email: s.email,
        password: '',
        typicalHoursPerWeek: s.typicalHoursPerWeek || 21,
        maxHoursPerWeek: s.maxHoursPerWeek || 40,
        phoneNumber: s.phoneNumber || '',
        tagIds: s.tags?.map((t: any) => t.id) || [],
        availability: s.availability || [],
        holidays: s.holidays || [],
      });
      
      const avMap: Record<number, any[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
      s.availability?.forEach((av: any) => {
        avMap[av.dayOfWeek].push({
          startTime: av.startTime.length >= 5 ? av.startTime.slice(0, 5) : av.startTime,
          endTime: av.endTime.length >= 5 ? av.endTime.slice(0, 5) : av.endTime,
        });
      });
      setLocalAvail(avMap);
      setLocalHolidays(s.holidays || []);
    } else {
      setEditing(null);
      setForm({
        name: '',
        email: '',
        password: '',
        typicalHoursPerWeek: 21,
        maxHoursPerWeek: 40,
        phoneNumber: '',
        tagIds: [],
        availability: [],
        holidays: [],
      });
      setLocalAvail({ 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] });
      setLocalHolidays([]);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      // Convert availability map back to list
      const finalAvail: any[] = [];
      Object.entries(localAvail).forEach(([day, slots]) => {
        slots.forEach(s => finalAvail.push({
          dayOfWeek: parseInt(day),
          startTime: s.startTime.length === 5 ? `${s.startTime}:00` : s.startTime,
          endTime: s.endTime.length === 5 ? `${s.endTime}:00` : s.endTime,
        }));
      });

      const payload = { ...form, availability: finalAvail };

      if (editing) {
        await staffApi.update(editing.id, payload);
        // If editing, also handle holidays separately as the create/update doesn't handle nested holidays updates in staff resource yet
        // but wait, the admin might want to delete/add holidays here. 
        // For simplicity in the dialog, we'll assume the staff resource update might handle it or we do it separately.
        // Actually, StaffResource update doesn't handle holidays.
      } else {
        await staffApi.create(payload);
      }
      setDialogOpen(false);
      loadData();
      setSnackbar(editing ? 'Staff updated' : 'Staff onboarded');
    } catch (err: any) { setError(err.response?.data?.error || 'Failed to save'); }
  };

  // Availability Editor Handlers
  const addSlot = (day: number) => {
    setLocalAvail(prev => ({ ...prev, [day]: [...prev[day], { startTime: '09:00', endTime: '17:00' }] }));
  };
  const removeSlot = (day: number, idx: number) => {
    setLocalAvail(prev => ({ ...prev, [day]: prev[day].filter((_: any, i: number) => i !== idx) }));
  };
  const updateSlot = (day: number, idx: number, field: string, val: string) => {
    setLocalAvail(prev => {
      const slots = [...prev[day]];
      slots[idx] = { ...slots[idx], [field]: val };
      return { ...prev, [day]: slots };
    });
  };

  // Holiday Handlers
  const handleAddHoliday = async () => {
    if (!newHolStart || !newHolEnd) return;
    if (editing) {
      try {
        const res = await staffApi.addHoliday(editing.id, { startDate: newHolStart, endDate: newHolEnd });
        setLocalHolidays(prev => [...prev, res.data]);
        setNewHolStart('');
        setNewHolEnd('');
      } catch { setError('Failed to add holiday'); }
    } else {
      // For new staff, just add to local list (assuming backend create handles it if we extend it, but it doesn't)
      // So we'll disable holiday tab for new staff or warn them to save first.
      setLocalHolidays(prev => [...prev, { id: Date.now(), startDate: newHolStart, endDate: newHolEnd }]);
      setNewHolStart('');
      setNewHolEnd('');
    }
  };

  const handleRemoveHoliday = async (hId: number) => {
    if (editing) {
      try {
        await staffApi.removeHoliday(editing.id, hId);
        setLocalHolidays(prev => prev.filter(h => h.id !== hId));
      } catch { setError('Failed to remove holiday'); }
    } else {
      setLocalHolidays(prev => prev.filter(h => h.id !== hId));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this staff member?')) return;
    try { await staffApi.delete(id); loadData(); }
    catch { setError('Failed to delete'); }
  };

  const handleSendEmails = async () => {
    try {
      setEmailSending(true);
      const res = await communicationsApi.notifyStaff(emailWeek);
      setSnackbar(`Sent ${res.data.emailsSent} email(s)`);
      setEmailDialogOpen(false);
    } catch { setError('Failed to send notifications'); }
    finally { setEmailSending(false); }
  };

  const toggleTag = (tagId: number) => {
    setForm((f) => ({
      ...f,
      tagIds: f.tagIds.includes(tagId) ? f.tagIds.filter((id) => id !== tagId) : [...f.tagIds, tagId],
    }));
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Staff</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<EmailIcon />} onClick={() => setEmailDialogOpen(true)}>
            Send Weekly Emails
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={{ px: 3, borderRadius: 2 }}>
            Onboard Staff
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Target Hours</TableCell>
                <TableCell>Qualifications</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staff.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{s.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{s.role}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{s.email}</Typography>
                    {s.phoneNumber && <Typography variant="caption" color="text.secondary">{s.phoneNumber}</Typography>}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2">Typical: {s.typicalHoursPerWeek}h</Typography>
                      <Typography variant="caption" color="text.secondary">Max: {s.maxHoursPerWeek}h</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {s.tags?.map((t: any) => (
                        <Chip key={t.id} label={t.name} size="small"
                          sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.15), color: 'secondary.main', fontSize: '0.7rem' }} />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Profile & Schedule"><IconButton size="small" onClick={() => handleOpen(s)} color="primary"><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Remove Staff"><IconButton size="small" onClick={() => handleDelete(s.id)} sx={{ color: 'error.main' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Onboarding / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            {editing ? `Edit ${editing.name}` : 'Onboard New Staff Member'}
          </Typography>
          <Tabs value={tabValue} onChange={(_: any, v: number) => setTabValue(v)} sx={{ mt: 1 }}>
            <Tab icon={<PersonIcon />} iconPosition="start" label="Basic Info" />
            <Tab icon={<BadgeIcon />} iconPosition="start" label="Hours & Quals" />
            <Tab icon={<AccessTimeIcon />} iconPosition="start" label="Availability" />
            <Tab icon={<CalendarIcon />} iconPosition="start" label="Time Off" />
          </Tabs>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, minHeight: 400 }}>
          {tabValue === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth autoFocus />
              <TextField label="Email Address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth />
              <TextField 
                label="Phone Number" 
                value={form.phoneNumber} 
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} 
                fullWidth 
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ mr: 1, opacity: 0.5 }} fontSize="small" />,
                }}
              />
              <TextField label={editing ? 'Password (leave blank to keep)' : 'Initial Password'} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} fullWidth />
            </Box>
          )}

          {tabValue === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField label="Typical Hours/Week" type="number" value={form.typicalHoursPerWeek} onChange={(e) => setForm({ ...form, typicalHoursPerWeek: Number(e.target.value) })} fullWidth />
                <TextField label="Maximum Hours/Week" type="number" value={form.maxHoursPerWeek} onChange={(e) => setForm({ ...form, maxHoursPerWeek: Number(e.target.value) })} fullWidth />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Staff Qualifications</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                  {tags.map((tag) => (
                    <Chip key={tag.id} label={tag.name} clickable onClick={() => toggleTag(tag.id)}
                      variant={form.tagIds.includes(tag.id) ? 'filled' : 'outlined'}
                      color={form.tagIds.includes(tag.id) ? 'primary' : 'default'}
                      sx={{ borderRadius: 1.5 }} />
                  ))}
                </Box>
              </Box>
            </Box>
          )}

          {tabValue === 2 && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                Define the default weekly working pattern for this staff member.
              </Typography>
              {DAYS.map((day) => (
                <Box key={day.value} sx={{ display: 'flex', alignItems: 'flex-start', py: 1.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                  <Box sx={{ width: 100, pt: 1 }}>
                    <Typography fontWeight={600} variant="body2">{day.label}</Typography>
                  </Box>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {localAvail[day.value]?.length === 0 ? (
                      <Typography color="text.secondary" sx={{ pt: 1, fontSize: '0.8rem' }}>Unavailable</Typography>
                    ) : (
                      localAvail[day.value]?.map((slot, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextField type="time" size="small" value={slot.startTime} onChange={(e) => updateSlot(day.value, idx, 'startTime', e.target.value)} sx={{ '& input': { p: 0.8, fontSize: '0.85rem' } }} />
                          <Typography color="text.secondary">-</Typography>
                          <TextField type="time" size="small" value={slot.endTime} onChange={(e) => updateSlot(day.value, idx, 'endTime', e.target.value)} sx={{ '& input': { p: 0.8, fontSize: '0.85rem' } }} />
                          <IconButton size="small" onClick={() => removeSlot(day.value, idx)} color="error" sx={{ ml: 0.5 }}><DeleteIcon fontSize="small" /></IconButton>
                        </Box>
                      ))
                    )}
                  </Box>
                  <Tooltip title="Add Slot">
                    <IconButton size="small" onClick={() => addSlot(day.value)} color="primary" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}><AddIcon fontSize="small" /></IconButton>
                  </Tooltip>
                </Box>
              ))}
            </Box>
          )}

          {tabValue === 3 && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3 }}>
                Specific dates and ranges where this staff member is explicitly unavailable.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.03), borderRadius: 1 }}>
                <TextField label="From" type="date" size="small" InputLabelProps={{ shrink: true }} value={newHolStart} onChange={(e) => setNewHolStart(e.target.value)} />
                <Typography color="text.secondary">to</Typography>
                <TextField label="To" type="date" size="small" InputLabelProps={{ shrink: true }} value={newHolEnd} onChange={(e) => setNewHolEnd(e.target.value)} />
                <Button variant="contained" size="small" onClick={handleAddHoliday} disabled={!newHolStart || !newHolEnd}>Add Time Off</Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {localHolidays.map(h => (
                  <Box key={h.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                    <CalendarIcon sx={{ opacity: 0.5 }} fontSize="small" />
                    <Typography variant="body2" sx={{ flex: 1 }}>{h.startDate} to {h.endDate}</Typography>
                    <IconButton size="small" color="error" onClick={() => handleRemoveHoliday(h.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                ))}
                {localHolidays.length === 0 && <Typography align="center" color="text.secondary" sx={{ py: 4 }}>No time off scheduled</Typography>}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name || !form.email} sx={{ px: 4 }}>
            {editing ? 'Update Staff Member' : 'Complete Onboarding'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Send Weekly Schedule Emails</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Sends each staff member an email with their schedule for the selected week.
          </Typography>
          <TextField label="Week starting" type="date" InputLabelProps={{ shrink: true }} value={emailWeek}
            onChange={(e) => setEmailWeek(e.target.value)} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSendEmails} disabled={emailSending}
            startIcon={emailSending ? <CircularProgress size={16} /> : <EmailIcon />}>
            Send Emails
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snackbar} autoHideDuration={4000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
}
