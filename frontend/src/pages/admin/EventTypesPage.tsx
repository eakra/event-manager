import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert, Chip, alpha, useTheme,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { eventTypesApi, tagsApi } from '../../services/api';

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ 
    name: '', description: '', shiftDurationMinutes: 60, eventDurationMinutes: 60, requiredTagIds: [] as number[],
    minStaff: 1, maxStaff: 2, maxParticipants: 20, minAge: 10, maxAge: 18
  });
  const theme = useTheme();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [etRes, tagRes] = await Promise.all([eventTypesApi.list(), tagsApi.list()]);
      setEventTypes(etRes.data);
      setTags(tagRes.data);
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleOpen = (et?: any) => {
    if (et) {
      setEditing(et);
      setForm({
        name: et.name,
        description: et.description || '',
        shiftDurationMinutes: et.shiftDurationMinutes || 60,
        eventDurationMinutes: et.eventDurationMinutes,
        requiredTagIds: et.requiredTags?.map((t: any) => t.id) || [],
        minStaff: et.minStaff || 1,
        maxStaff: et.maxStaff || 2,
        maxParticipants: et.maxParticipants || 20,
        minAge: et.minAge || 10,
        maxAge: et.maxAge || 18,
      });
    } else {
      setEditing(null);
      setForm({ name: '', description: '', shiftDurationMinutes: 60, eventDurationMinutes: 60, requiredTagIds: [], minStaff: 1, maxStaff: 2, maxParticipants: 20, minAge: 10, maxAge: 18 });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await eventTypesApi.update(editing.id, form);
      } else {
        await eventTypesApi.create(form);
      }
      setDialogOpen(false);
      loadData();
    } catch { setError('Failed to save'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this event type?')) return;
    try { await eventTypesApi.delete(id); loadData(); }
    catch { setError('Failed to delete'); }
  };

  const toggleTag = (tagId: number) => {
    setForm((f) => ({
      ...f,
      requiredTagIds: f.requiredTagIds.includes(tagId)
        ? f.requiredTagIds.filter((id) => id !== tagId)
        : [...f.requiredTagIds, tagId],
    }));
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Event Types</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Event Type
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Shift Duration</TableCell>
                <TableCell>Event Duration</TableCell>
                <TableCell>Staff (Min/Max)</TableCell>
                <TableCell>Participants (Max)</TableCell>
                <TableCell>Age Range</TableCell>
                <TableCell>Required Qualifications</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eventTypes.map((et) => (
                <TableRow key={et.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{et.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {et.description}
                    </Typography>
                  </TableCell>
                  <TableCell>{et.shiftDurationMinutes} min</TableCell>
                  <TableCell>{et.eventDurationMinutes} min</TableCell>
                  <TableCell>{et.minStaff} - {et.maxStaff}</TableCell>
                  <TableCell>{et.maxParticipants}</TableCell>
                  <TableCell>{et.minAge} - {et.maxAge}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {et.requiredTags?.map((t: any) => (
                        <Chip key={t.id} label={t.name} size="small"
                          sx={{ bgcolor: alpha(theme.palette.primary.main, 0.15), color: 'primary.light', fontSize: '0.7rem' }} />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpen(et)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(et.id)} sx={{ color: 'error.main' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Event Type' : 'New Event Type'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth />
          <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={2} />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Shift Duration (min)" type="number" value={form.shiftDurationMinutes} onChange={(e) => setForm({ ...form, shiftDurationMinutes: Number(e.target.value) })} fullWidth />
            <TextField label="Event Duration (min)" type="number" value={form.eventDurationMinutes} onChange={(e) => setForm({ ...form, eventDurationMinutes: Number(e.target.value) })} fullWidth />
          </Box>
          <TextField label="Max Participants" type="number" value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: Number(e.target.value) })} fullWidth />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Min Staff" type="number" value={form.minStaff} onChange={(e) => setForm({ ...form, minStaff: Number(e.target.value) })} fullWidth />
            <TextField label="Max Staff" type="number" value={form.maxStaff} onChange={(e) => setForm({ ...form, maxStaff: Number(e.target.value) })} fullWidth />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Min Age" type="number" value={form.minAge} onChange={(e) => setForm({ ...form, minAge: Number(e.target.value) })} fullWidth />
            <TextField label="Max Age" type="number" value={form.maxAge} onChange={(e) => setForm({ ...form, maxAge: Number(e.target.value) })} fullWidth />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Required Qualifications</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {tags.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  clickable
                  onClick={() => toggleTag(tag.id)}
                  sx={{
                    bgcolor: form.requiredTagIds.includes(tag.id) ? alpha(theme.palette.primary.main, 0.3) : undefined,
                    borderColor: form.requiredTagIds.includes(tag.id) ? 'primary.main' : undefined,
                  }}
                  variant={form.requiredTagIds.includes(tag.id) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
