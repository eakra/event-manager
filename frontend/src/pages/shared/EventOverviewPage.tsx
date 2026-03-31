import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Button, Chip, Divider,
  CircularProgress, Alert, alpha, useTheme, Avatar, Stack
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  ArrowBack as BackIcon,
  Map as MapIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Label as LabelIcon,
} from '@mui/icons-material';
import { eventInstancesApi, participantPortalApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function EventOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { isAdmin, isParticipant } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) fetchEvent(parseInt(id));
  }, [id]);

  const fetchEvent = async (eventId: number) => {
    try {
      setLoading(true);
      const res = await eventInstancesApi.get(eventId);
      setEvent(res.data);
    } catch (err) {
      setError('Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      if (!id) return;
      setActionLoading(true);
      await participantPortalApi.register(parseInt(id));
      await fetchEvent(parseInt(id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to register');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnregister = async () => {
    try {
      if (!id) return;
      setActionLoading(true);
      await participantPortalApi.unregister(parseInt(id));
      await fetchEvent(parseInt(id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to unregister');
    } finally {
      setActionLoading(false);
    }
  };

  const getMapsUrl = () => {
    if (!event) return '';
    const address = `${event.addressLine1 || ''} ${event.city || ''} ${event.zipCode || ''}`.trim();
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || event.locationName)}`;
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!event) return <Alert severity="warning">Event not found</Alert>;

  const statusColors: any = {
    DRAFT: { bg: alpha(theme.palette.warning.main, 0.1), text: theme.palette.warning.main },
    PUBLISHED: { bg: alpha(theme.palette.success.main, 0.1), text: theme.palette.success.main },
    CANCELLED: { bg: alpha(theme.palette.error.main, 0.1), text: theme.palette.error.main },
    COMPLETED: { bg: alpha(theme.palette.info.main, 0.1), text: theme.palette.info.main },
  };

  const currentStatus = statusColors[event.status] || { bg: 'grey.100', text: 'grey.700' };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<BackIcon />} 
          onClick={() => navigate(-1)}
          sx={{ borderRadius: 2 }}
        >
          Back
        </Button>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
            {event.eventTypeName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
            <Chip 
              label={event.status} 
              size="small"
              sx={{ 
                bgcolor: currentStatus.bg, 
                color: currentStatus.text, 
                fontWeight: 700,
                borderRadius: 1,
                fontSize: '0.7rem'
              }} 
            />
            <Typography variant="body2" color="text.secondary">
              Event ID: #{event.id}
            </Typography>
          </Box>
        </Box>
        {isAdmin && (
          <Button 
            variant="contained" 
            onClick={() => navigate(`/admin/events/${event.id}/assign`)}
            sx={{ borderRadius: 2 }}
          >
            Manage Staff
          </Button>
        )}
        {isParticipant && event.status === 'PUBLISHED' && (
          <Box>
            {event.isRegistered ? (
              <Button 
                variant="outlined" 
                onClick={handleUnregister} 
                disabled={actionLoading}
                sx={{ 
                    borderRadius: 2, 
                    fontWeight: 700,
                    color: 'text.secondary',
                    borderColor: 'divider',
                    '&:hover': {
                        borderColor: 'text.primary',
                        color: 'text.primary',
                        bgcolor: 'action.hover'
                    }
                }}
              >
                {actionLoading ? <CircularProgress size={20} /> : 'Unregister from Event'}
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary" 
                disabled={event.participantCount >= event.effectiveMaxParticipants || actionLoading}
                onClick={handleRegister} 
                sx={{ borderRadius: 2, fontWeight: 800, px: 4 }}
              >
                {actionLoading ? <CircularProgress size={20} color="inherit" /> : (event.participantCount >= event.effectiveMaxParticipants ? 'Event Full' : 'Sign Up for Event')}
              </Button>
            )}
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* main logistics */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Logistics & Timing</Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', width: 40, height: 40 }}>
                      <CalendarIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Date</Typography>
                      <Typography variant="body2" fontWeight={700}>{new Date(event.eventDate).toLocaleDateString()}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box>
                      <Typography variant="caption" color="text.secondary">Shift Starts</Typography>
                      <Typography variant="body2" fontWeight={700}>{event.shiftStartTime?.slice(0, 5)}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.15), color: 'primary.main', width: 40, height: 40 }}>
                      <TimeIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Event Runs</Typography>
                      <Typography variant="body2" fontWeight={700} color="primary.main">
                        {event.eventStartTime?.slice(0, 5)} – {event.eventEndTime?.slice(0, 5)}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', width: 40, height: 40 }}>
                      <TimeIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Durations</Typography>
                      <Typography variant="body2" fontWeight={700}>
                        Shift: {event.shiftDurationMinutes}m / Event: {event.eventDurationMinutes}m
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', width: 40, height: 40 }}>
                      <PeopleIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Capacity</Typography>
                      <Typography variant="body2" fontWeight={700}>{event.participantCount} / {event.effectiveMaxParticipants}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {isAdmin && event.requiredTags?.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <LabelIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="h6" fontWeight={700}>Required Skills</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {event.requiredTags.map((tag: string) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                        borderRadius: 1,
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Assigned Staff ({event.assignedStaff?.length})</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Requirements: {event.effectiveMinStaff} - {event.effectiveMaxStaff} staff members.
              </Typography>
              
              <Stack spacing={1}>
                {event.assignedStaff?.length > 0 ? (
                  event.assignedStaff.map((staff: any) => (
                    <Box 
                      key={staff.id} 
                      sx={{ 
                        p: 1.5, 
                        borderRadius: 2, 
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                      }}
                    >
                      <Avatar sx={{ bgcolor: theme.palette.primary.dark, width: 32, height: 32, fontSize: '0.8rem' }}>
                        {staff.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>{staff.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{staff.email}</Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography color="text.secondary" fontStyle="italic">No staff assigned yet.</Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Location sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card 
            sx={{ 
              height: '100%', 
              background: `linear-gradient(180deg, ${alpha(theme.palette.primary.dark, 0.05)}, transparent)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}
          >
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <LocationIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>Location Details</Typography>
              </Box>

              <Typography variant="subtitle1" fontWeight={800} color="primary" gutterBottom>
                {event.locationName}
              </Typography>
              
              <Typography variant="body2" paragraph>
                {event.addressLine1}<br />
                {event.addressLine2 && <>{event.addressLine2}<br /></>}
                {event.city}, {event.zipCode}
              </Typography>

              <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ textTransform: 'uppercase', mb: 1 }}>
                  On-site Contact
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" fontWeight={600}>{event.contactName || 'Venue Manager'}</Typography>
                  </Box>
                  {event.contactPhone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">{event.contactPhone}</Typography>
                    </Box>
                  )}
                  {event.contactEmail && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" noWrap>{event.contactEmail}</Typography>
                    </Box>
                  )}
                </Stack>
              </Box>

              <Box sx={{ flex: 1 }} />
              
              <Button 
                variant="contained" 
                fullWidth 
                startIcon={<MapIcon />}
                onClick={() => window.open(getMapsUrl(), '_blank')}
                sx={{ 
                  mt: 4, 
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`
                }}
              >
                Get Directions
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
