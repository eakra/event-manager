import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { locationsApi } from '../../services/api';
import AddressLookup from '../../components/AddressLookup';
import { Divider } from '@mui/material';

const emptyForm = { name: '', addressLine1: '', addressLine2: '', city: '', zipCode: '', contactName: '', contactPhone: '', contactEmail: '', defaultCapacity: 30 };

export default function LocationsPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const loadData = useCallback(async () => {
    try { setLoading(true); const res = await locationsApi.list(); setLocations(res.data); }
    catch { setError('Failed to load locations'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleOpen = (loc?: any) => {
    if (loc) { setEditing(loc); setForm({ ...loc }); }
    else { setEditing(null); setForm(emptyForm); }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing) { await locationsApi.update(editing.id, form); }
      else { await locationsApi.create(form); }
      setDialogOpen(false); loadData();
    } catch { setError('Failed to save'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this location?')) return;
    try { await locationsApi.delete(id); loadData(); }
    catch { setError('Failed to delete. It may be in use by events.'); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Locations</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>Add Location</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {locations.map((loc) => (
                <TableRow key={loc.id} hover>
                  <TableCell><Typography fontWeight={600}>{loc.name}</Typography></TableCell>
                  <TableCell>
                    {loc.addressLine1}
                    {loc.addressLine2 && <Typography variant="caption" display="block" color="text.secondary">{loc.addressLine2}</Typography>}
                  </TableCell>
                  <TableCell>{loc.city}</TableCell>
                  <TableCell>{loc.contactName}</TableCell>
                  <TableCell>{loc.defaultCapacity}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpen(loc)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(loc.id)} sx={{ color: 'error.main' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Location' : 'New Location'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <AddressLookup onAddressSelect={(addr) => setForm({ ...form, ...addr, name: form.name || addr.addressLine1 })} />
          <Divider sx={{ my: 1 }}>OR ENTER MANUALLY</Divider>
          <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth />
          <TextField label="Address Line 1" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} fullWidth />
          <TextField label="Address Line 2" value={form.addressLine2} onChange={(e) => setForm({ ...form, addressLine2: e.target.value })} fullWidth />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} sx={{ flex: 1 }} />
            <TextField label="Post code" value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} sx={{ flex: 1 }} />
          </Box>
          <TextField label="Contact Name" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} fullWidth />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Contact Phone" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} sx={{ flex: 1 }} />
            <TextField label="Contact Email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} sx={{ flex: 1 }} />
          </Box>
          <TextField label="Default Capacity" type="number" value={form.defaultCapacity} onChange={(e) => setForm({ ...form, defaultCapacity: Number(e.target.value) })} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
