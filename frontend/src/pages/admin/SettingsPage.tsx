import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert, Chip, alpha, useTheme,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { tagsApi } from '../../services/api';

export default function SettingsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '' });
  const theme = useTheme();

  const loadData = useCallback(async () => {
    try { setLoading(true); const res = await tagsApi.list(); setTags(res.data); }
    catch { setError('Failed to load tags'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleOpen = (tag?: any) => {
    if (tag) { setEditing(tag); setForm({ name: tag.name }); }
    else { setEditing(null); setForm({ name: '' }); }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing) { await tagsApi.update(editing.id, form); }
      else { await tagsApi.create(form); }
      setDialogOpen(false); loadData();
    } catch { setError('Failed to save'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this tag?')) return;
    try { await tagsApi.delete(id); loadData(); }
    catch { setError('Failed to delete'); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>Settings</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage qualification tags used to match staff to events.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>Tags / Qualifications</Typography>
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => handleOpen()}>
            Add Tag
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {tags.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.name}
              onDelete={(e) => { e.stopPropagation(); handleDelete(tag.id); }}
              onClick={() => handleOpen(tag)}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.15),
                color: 'primary.light',
                fontWeight: 500,
                cursor: 'pointer',
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.25) },
              }}
            />
          ))}
          {tags.length === 0 && (
            <Typography color="text.secondary">No tags yet. Add one to get started.</Typography>
          )}
        </Box>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? 'Edit Tag' : 'New Tag'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <TextField label="Tag Name" value={form.name} onChange={(e) => setForm({ name: e.target.value })} fullWidth autoFocus />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
