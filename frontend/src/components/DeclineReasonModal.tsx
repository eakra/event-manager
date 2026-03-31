import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box
} from '@mui/material';
import axios from 'axios';

interface DeclineReasonModalProps {
  open: boolean;
  onClose: () => void;
  notificationId: number;
  onDeclineSuccess: () => void;
}

export default function DeclineReasonModal({ open, onClose, notificationId, onDeclineSuccess }: DeclineReasonModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for declining.');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`/api/notifications/${notificationId}/decline`, { reason });
      onDeclineSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to decline assignment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Decline Assignment</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a reason for declining this event assignment. This will unassign you from the event and notify the administrators.
          </Typography>
          <TextField
            autoFocus
            label="Reason for Declining"
            multiline
            rows={4}
            fullWidth
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError('');
            }}
            error={!!error}
            helperText={error}
            disabled={loading}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="error"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Confirm Decline'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
