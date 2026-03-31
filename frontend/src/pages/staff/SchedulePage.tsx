import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, CircularProgress, Alert, Chip,
  alpha, useTheme, Button
} from '@mui/material';
import { EventNote, AccessTime, LocationOn } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { staffApi } from '../../services/api';
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';

export default function SchedulePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const theme = useTheme();

  const loadSchedule = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId;
      const res = await staffApi.getSchedule(userId);
      setSchedule(res.data);
    } catch { setError('Failed to load schedule'); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { loadSchedule(); }, [loadSchedule]);

  const handlePublish = async (id: number) => {
    try {
      setPublishingId(id);
      const { eventInstancesApi } = await import('../../services/api');
      await eventInstancesApi.publish(id);
      await loadSchedule();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to publish event');
    } finally {
      setPublishingId(null);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  const getDayLabel = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return format(d, 'EEEE');
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>My Schedule</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Your upcoming event assignments
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {schedule.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <EventNote sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography color="text.secondary">No upcoming events assigned</Typography>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {schedule.map((event) => {
            const past = isPast(parseISO(event.eventDate));
            return (
              <Card
                key={event.id}
                onClick={() => navigate(`/events/${event.id}`)}
                sx={{
                  opacity: past ? 0.6 : 1,
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: past ? 'none' : 'translateY(-2px)',
                    boxShadow: past ? undefined : `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
                  },
                }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Typography variant="caption" color="primary.light" fontWeight={700} lineHeight={1}>
                      {format(parseISO(event.eventDate), 'MMM')}
                    </Typography>
                    <Typography variant="h5" color="primary.light" fontWeight={800} lineHeight={1}>
                      {format(parseISO(event.eventDate), 'd')}
                    </Typography>
                  </Box>

                      <Box sx={{ flex: 1, minWidth: 200, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="h6" fontWeight={600} sx={{ lineHeight: 1.2 }}>{event.eventTypeName}</Typography>
                            {event.status === 'DRAFT' && <Chip label="Draft" size="small" variant="outlined" color="warning" sx={{ height: 20, fontSize: '0.65rem' }} />}
                            <Chip label={getDayLabel(event.eventDate)} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: isToday(parseISO(event.eventDate)) ? alpha(theme.palette.success.main, 0.15) : alpha(theme.palette.primary.main, 0.1), color: isToday(parseISO(event.eventDate)) ? theme.palette.success.main : theme.palette.primary.light }} />
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, color: 'text.secondary' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AccessTime sx={{ fontSize: 14 }} />
                                <Typography variant="caption">
                                  Shift: {event.shiftStartTime?.slice(0, 5)} – {event.shiftEndTime?.slice(0, 5)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.light' }}>
                                <AccessTime sx={{ fontSize: 14 }} />
                                <Typography variant="caption" fontWeight={700}>
                                  Event: {event.eventStartTime?.slice(0, 5)} – {event.eventEndTime?.slice(0, 5)}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', mt: 0.2 }}>
                              <LocationOn sx={{ fontSize: 16 }} />
                              <Typography variant="body2">{event.locationName}</Typography>
                            </Box>
                          </Box>
                        </Box>

                        {event.status === 'DRAFT' && (
                          <Box sx={{ ml: 'auto', pl: 2 }} onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={!event.assignedStaff || event.assignedStaff.length < event.effectiveMinStaff || publishingId === event.id}
                              onClick={() => handlePublish(event.id)}
                            >
                              {publishingId === event.id ? <CircularProgress size={16} /> : 'Publish'}
                            </Button>
                          </Box>
                        )}
                      </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
