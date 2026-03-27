import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert, Chip, alpha, useTheme,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { staffApi, tagsApi, communicationsApi } from '../../services/api';
import { format, startOfWeek } from 'date-fns';

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
  const [form, setForm] = useState({ name: '', email: '', password: '', maxHoursPerWeek: 40, tagIds: [] as number[] });
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
    if (s) {
      setEditing(s);
      setForm({ name: s.name, email: s.email, password: '', maxHoursPerWeek: s.maxHoursPerWeek, tagIds: s.tags?.map((t: any) => t.id) || [] });
    } else {
      setEditing(null);
      setForm({ name: '', email: '', password: '', maxHoursPerWeek: 40, tagIds: [] });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await staffApi.update(editing.id, form);
      } else {
        await staffApi.create(form);
      }
      setDialogOpen(false);
      loadData();
    } catch (err: any) { setError(err.response?.data?.error || 'Failed to save'); }
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
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
            Add Staff
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
                <TableCell>Email</TableCell>
                <TableCell>Max Hours/Week</TableCell>
                <TableCell>Qualifications</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staff.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell><Typography fontWeight={600}>{s.name}</Typography></TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.maxHoursPerWeek}h</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {s.tags?.map((t: any) => (
                        <Chip key={t.id} label={t.name} size="small"
                          sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.15), color: 'secondary.main', fontSize: '0.7rem' }} />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpen(s)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(s.id)} sx={{ color: 'error.main' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Staff Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Staff' : 'New Staff Member'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth />
          <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth />
          <TextField label={editing ? 'Password (leave blank to keep)' : 'Password'} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} fullWidth />
          <TextField label="Max Hours/Week" type="number" value={form.maxHoursPerWeek} onChange={(e) => setForm({ ...form, maxHoursPerWeek: Number(e.target.value) })} fullWidth />
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Qualifications</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {tags.map((tag) => (
                <Chip key={tag.id} label={tag.name} clickable onClick={() => toggleTag(tag.id)}
                  variant={form.tagIds.includes(tag.id) ? 'filled' : 'outlined'}
                  sx={{ bgcolor: form.tagIds.includes(tag.id) ? alpha(theme.palette.primary.main, 0.3) : undefined }} />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name || !form.email}>Save</Button>
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
