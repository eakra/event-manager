import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { participantPortalApi } from '../../services/api';

export default function ParticipantProfilePage() {
  const [profile, setProfile] = useState({ name: '', email: '', dateOfBirth: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await participantPortalApi.getProfile();
      setProfile({
        name: data.name || '',
        email: data.email || '',
        dateOfBirth: data.dateOfBirth || '',
      });
    } catch (err: any) {
      setError('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await participantPortalApi.updateProfile(profile);
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.violations && data.violations.length > 0) {
        setError(data.violations[0].message);
      } else {
        setError(data?.error || 'Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        My Profile
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View and amend your personal records.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Full Name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              fullWidth
              required
              sx={{ mb: 3 }}
            />
            <TextField
              label="Email Address"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              fullWidth
              required
              sx={{ mb: 3 }}
            />
            <TextField
              label="Date of Birth"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={profile.dateOfBirth}
              onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
              fullWidth
              sx={{ mb: 4 }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={saving}
              sx={{ minWidth: 150 }}
            >
              {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
