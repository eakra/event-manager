import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { differenceInYears, parseISO } from 'date-fns';
import { participantsApi } from '../../services/api';

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await participantsApi.list();
      setParticipants(res.data);
    } catch {
      setError('Failed to load participants');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Participants</Typography>
        <Typography variant="body1" color="text.secondary">
          Individuals registered on the platform capable of signing up for events.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Date of Birth</TableCell>
                <TableCell>Age</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {participants.map((p) => {
                const age = p.dateOfBirth ? differenceInYears(new Date(), parseISO(p.dateOfBirth)) : 'Unknown';
                return (
                  <TableRow key={p.id} hover>
                    <TableCell><Typography fontWeight={600}>{p.name}</Typography></TableCell>
                    <TableCell>{p.email}</TableCell>
                    <TableCell>{p.dateOfBirth ? p.dateOfBirth : 'N/A'}</TableCell>
                    <TableCell>{age}</TableCell>
                  </TableRow>
                );
              })}
              {participants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No participants registered yet.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
