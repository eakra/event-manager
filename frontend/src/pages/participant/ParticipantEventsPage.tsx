import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, CircularProgress, Alert, Chip,
  Button, LinearProgress, Divider, Collapse, Stack, Avatar, alpha, useTheme
} from '@mui/material';
import {
  Event as EventIcon, LocationOn as LocationIcon, AccessTime as TimeIcon,
  Person as PersonIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon,
  CalendarMonth as CalendarIcon, People as PeopleIcon, Map as MapIcon,
  Phone as PhoneIcon, Email as EmailIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { participantPortalApi } from '../../services/api';

export default function ParticipantEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const theme = useTheme();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await participantPortalApi.getEvents();
      setEvents(data);
    } catch (err: any) {
      setError('Failed to load upcoming events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (id: number) => {
    try {
      setActionLoading(id);
      await participantPortalApi.register(id);
      await fetchEvents();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to register');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnregister = async (id: number) => {
    try {
      setActionLoading(id);
      await participantPortalApi.unregister(id);
      await fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to unregister');
    } finally {
      setActionLoading(null);
    }
  };

  const getMapsUrl = (event: any) => {
    const parts = [event.locationName, event.addressLine1, event.addressLine2, event.city, event.zipCode].filter(Boolean);
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(', '))}`;
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Upcoming Events
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover and view events tailored for you.
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      {events.length === 0 && !error && (
        <Alert severity="info" sx={{ mb: 3 }}>No upcoming events currently published.</Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 3 }}>
        {events.map((event) => {
          const isFull = event.participantCount >= event.effectiveMaxParticipants;
          const progress = (event.participantCount / event.effectiveMaxParticipants) * 100;
          const isExpanded = expandedId === event.id;

          return (
            <Card key={event.id} sx={{ height: 'fit-content', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'visible' }}>
              {event.isRegistered && (
                <Chip
                  label="REGISTERED"
                  color="success"
                  size="small"
                  sx={{ position: 'absolute', top: -12, right: 16, fontWeight: 800, border: '2px solid #fff' }}
                />
              )}
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ lineHeight: 1.2, mb: 2 }}>
                  {event.eventTypeName}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, color: 'text.secondary' }}>
                  <EventIcon sx={{ fontSize: 18, mr: 1, color: 'primary.main', opacity: 0.8 }} />
                  <Typography variant="body2" fontWeight={500}>
                    {format(parseISO(event.eventDate), 'EEEE, d MMM yyyy')}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, color: 'text.secondary' }}>
                  <TimeIcon sx={{ fontSize: 18, mr: 1, color: 'primary.main', opacity: 0.8 }} />
                  <Typography variant="body2" fontWeight={500}>
                    {event.eventStartTime?.slice(0, 5)} - {event.eventEndTime?.slice(0, 5)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, color: 'text.secondary' }}>
                  <LocationIcon sx={{ fontSize: 18, mr: 1, color: 'primary.main', opacity: 0.8 }} />
                  <Typography variant="body2" fontWeight={500}>
                    {[event.locationName, event.city].filter(Boolean).join(', ')}
                  </Typography>
                </Box>

                <Box sx={{ mt: 'auto' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" fontWeight={700} color="text.secondary">
                        {event.participantCount} / {event.effectiveMaxParticipants}
                      </Typography>
                    </Box>
                    <Typography variant="caption" fontWeight={700} color={isFull ? 'error.main' : 'text.secondary'}>
                      {isFull ? 'FULL' : `${event.effectiveMaxParticipants - event.participantCount} LEFT`}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', mb: 3 }}
                    color={isFull ? 'error' : 'primary'}
                  />

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {event.effectiveMinAge != null && (
                      <Chip size="small" variant="outlined" label={`Ages ${event.effectiveMinAge}-${event.effectiveMaxAge}`} sx={{ fontSize: '0.65rem', height: 20 }} />
                    )}
                    <Chip size="small" label="PUBLISHED" sx={{ fontSize: '0.65rem', height: 20, bgcolor: 'primary.main', color: '#fff', fontWeight: 700 }} />
                  </Box>

                  <Divider sx={{ mb: 2, opacity: 0.6 }} />

                  {/* Unfurl / Details Toggle */}
                  <Button
                    variant="text"
                    fullWidth
                    size="small"
                    onClick={() => setExpandedId(isExpanded ? null : event.id)}
                    endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{
                      mb: 2,
                      color: 'text.secondary',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      textTransform: 'none',
                      '&:hover': { color: 'primary.main', bgcolor: 'transparent' }
                    }}
                  >
                    {isExpanded ? 'Hide Details' : 'View Details'}
                  </Button>

                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ mb: 3 }}>
                      {/* Logistics Grid */}
                      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1.5 }}>
                        Logistics
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', width: 32, height: 32 }}>
                            <CalendarIcon sx={{ fontSize: 16 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>Date</Typography>
                            <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>{format(parseISO(event.eventDate), 'd MMM yyyy')}</Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main', width: 32, height: 32 }}>
                            <TimeIcon sx={{ fontSize: 16 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>Time</Typography>
                            <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>{event.eventStartTime?.slice(0, 5)} – {event.eventEndTime?.slice(0, 5)}</Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', width: 32, height: 32 }}>
                            <TimeIcon sx={{ fontSize: 16 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>Duration</Typography>
                            <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>{event.eventDurationMinutes} mins</Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', width: 32, height: 32 }}>
                            <PeopleIcon sx={{ fontSize: 16 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>Capacity</Typography>
                            <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>{event.participantCount} / {event.effectiveMaxParticipants}</Typography>
                          </Box>
                        </Stack>
                      </Box>

                      {/* Location Details */}
                      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1.5 }}>
                        Location
                      </Typography>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.03), border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`, mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight={800} color="primary.main" gutterBottom>
                          {event.locationName}
                        </Typography>
                        {(event.addressLine1 || event.city || event.zipCode) && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {[event.addressLine1, event.addressLine2].filter(Boolean).join(', ')}
                          </Typography>
                        )}
                        {(event.city || event.zipCode) && (
                          <Typography variant="body2" color="text.secondary">
                            {[event.city, event.zipCode].filter(Boolean).join(' ')}
                          </Typography>
                        )}

                        {(event.contactName || event.contactPhone || event.contactEmail) && (
                          <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.3)}` }}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>
                              On-site Contact
                            </Typography>
                            <Stack spacing={0.5}>
                              {event.contactName && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="caption" fontWeight={600}>{event.contactName}</Typography>
                                </Box>
                              )}
                              {event.contactPhone && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="caption">{event.contactPhone}</Typography>
                                </Box>
                              )}
                              {event.contactEmail && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="caption" noWrap>{event.contactEmail}</Typography>
                                </Box>
                              )}
                            </Stack>
                          </Box>
                        )}
                      </Box>

                      <Button
                        variant="outlined"
                        fullWidth
                        size="small"
                        startIcon={<MapIcon />}
                        onClick={() => window.open(getMapsUrl(event), '_blank')}
                        sx={{
                          borderRadius: 2,
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          textTransform: 'none',
                          mb: 1,
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                          '&:hover': { borderColor: 'primary.main' }
                        }}
                      >
                        Get Directions
                      </Button>

                      <Divider sx={{ my: 2, opacity: 0.4 }} />
                    </Box>
                  </Collapse>

                  {/* Action Buttons */}
                  {event.isRegistered ? (
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => handleUnregister(event.id)}
                      disabled={actionLoading === event.id}
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
                      {actionLoading === event.id ? <CircularProgress size={20} /> : 'UNREGISTER'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={isFull || actionLoading === event.id}
                      onClick={() => handleRegister(event.id)}
                      sx={{ borderRadius: 2, fontWeight: 800, boxShadow: 'none', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } }}
                    >
                      {actionLoading === event.id ? <CircularProgress size={20} color="inherit" /> : (isFull ? 'FULL' : 'SIGN UP')}
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
