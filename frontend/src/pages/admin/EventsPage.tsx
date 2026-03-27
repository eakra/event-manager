import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, ToggleButton, ToggleButtonGroup, Card,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Tooltip, CircularProgress, Alert, alpha, useTheme, Stack
} from '@mui/material';
import {
  Add as AddIcon, ViewList as ListIcon, CalendarMonth as CalendarIcon,
  Assignment as AssignIcon, Delete as DeleteIcon, Visibility as ViewIcon,
  ChevronLeft as LeftIcon, ChevronRight as RightIcon, Today as TodayIcon,
} from '@mui/icons-material';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { eventInstancesApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { 'en-US': enUS },
});

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#9AA0A6',
  PUBLISHED: '#7C4DFF',
  STAFFED: '#00E676',
  COMPLETED: '#00E5FF',
  CANCELLED: '#FF5252',
};

interface EventInstanceData {
  id: number;
  eventTypeName: string;
  locationName: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  status: string;
  durationMinutes: number;
  assignedStaff: { id: number; name: string }[];
}

// Custom Toolbar Component
const CustomToolbar = (toolbar: any) => {
  const theme = useTheme();
  const goToBack = () => { toolbar.onNavigate('PREV'); };
  const goToNext = () => { toolbar.onNavigate('NEXT'); };
  const goToCurrent = () => { toolbar.onNavigate('TODAY'); };

  const viewNames = [
    { name: 'month', label: 'Month' },
    { name: 'week', label: 'Week' },
    { name: 'day', label: 'Day' },
    { name: 'agenda', label: 'Agenda' },
  ];

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 2,
      mb: 3,
      p: 1.5,
      borderRadius: 3,
      bgcolor: alpha(theme.palette.background.paper, 0.4),
      backdropFilter: 'blur(8px)',
      border: `1px solid ${alpha(theme.palette.common.white, 0.05)}`,
    }}>
      <Stack direction="row" spacing={1}>
        <Tooltip title="Previous">
          <IconButton size="small" onClick={goToBack} sx={{ bgcolor: 'action.hover' }}><LeftIcon /></IconButton>
        </Tooltip>
        <Button
          size="small"
          variant="outlined"
          startIcon={<TodayIcon />}
          onClick={goToCurrent}
          sx={{ borderRadius: 2, fontWeight: 700, px: 2 }}
        >
          Today
        </Button>
        <Tooltip title="Next">
          <IconButton size="small" onClick={goToNext} sx={{ bgcolor: 'action.hover' }}><RightIcon /></IconButton>
        </Tooltip>
      </Stack>

      <Typography variant="h6" fontWeight={800} sx={{ color: 'text.primary', letterSpacing: '-0.01em' }}>
        {toolbar.label}
      </Typography>

      <ToggleButtonGroup
        value={toolbar.view}
        exclusive
        onChange={(_, v) => v && toolbar.onView(v)}
        size="small"
        sx={{
          '& .MuiToggleButton-root': {
            px: 2,
            py: 0.5,
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: 1.5,
          }
        }}
      >
        {viewNames.map((v) => (
          <ToggleButton key={v.name} value={v.name}>
            {v.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

// Custom Event Component
const CustomEvent = ({ event }: any) => {



  return (
    <Tooltip title={`${event.title} - ${event.resource.locationName}`}>
      <Box sx={{
        p: 0.5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Typography variant="caption" sx={{
          fontWeight: 800,
          fontSize: '0.65rem',
          lineHeight: 1.1,
          color: '#fff',
          textShadow: '0 1px 2px rgba(0,0,0,0.4)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {event.title}
        </Typography>
        <Typography variant="caption" sx={{
          fontSize: '0.6rem',
          opacity: 0.8,
          color: '#fff',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {event.resource.locationName}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default function EventsPage() {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [calendarView, setCalendarView] = useState<any>(Views.MONTH);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [events, setEvents] = useState<EventInstanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const { isAdmin } = useAuth();

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await eventInstancesApi.list();
      setEvents(res.data);
    } catch (err: any) {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const calendarEvents = events.map((e) => ({
    id: e.id,
    title: e.eventTypeName,
    start: new Date(`${e.eventDate}T${e.startTime}`),
    end: new Date(`${e.eventDate}T${e.endTime}`),
    resource: e,
  }));

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this event instance?')) return;
    try {
      await eventInstancesApi.delete(id);
      loadEvents();
    } catch {
      setError('Failed to delete event');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
            Events
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your scheduled events and staff allocations.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, v) => v && setView(v)}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.background.paper, 0.5),
              borderRadius: 2,
              p: 0.5,
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: '6px !important',
                px: 2,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                }
              }
            }}
          >
            <ToggleButton value="list" id="view-list"><ListIcon sx={{ fontSize: 20 }} /></ToggleButton>
            <ToggleButton value="calendar" id="view-calendar"><CalendarIcon sx={{ fontSize: 20 }} /></ToggleButton>
          </ToggleButtonGroup>
          {isAdmin && (
            <Button
              id="new-event-btn"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/events/new')}
              sx={{ borderRadius: 2, fontWeight: 700, px: 3, boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}` }}
            >
              New Event
            </Button>
          )}
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      {view === 'list' ? (
        <Card sx={{ borderRadius: 3, overflow: 'hidden', border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Event Type</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Staff</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((eventInstance) => (
                  <TableRow
                    key={eventInstance.id}
                    hover
                    onClick={() => navigate(`/events/${eventInstance.id}`)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight={700} color="primary" sx={{ fontSize: '0.95rem' }}>{eventInstance.eventTypeName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{format(new Date(eventInstance.eventDate), 'EEE, d MMM yyyy')}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{eventInstance.startTime?.slice(0, 5)} – {eventInstance.endTime?.slice(0, 5)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{eventInstance.locationName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={eventInstance.status}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.65rem',
                          bgcolor: alpha(STATUS_COLORS[eventInstance.status] || '#888', 0.1),
                          color: STATUS_COLORS[eventInstance.status] || '#888',
                          border: `1px solid ${alpha(STATUS_COLORS[eventInstance.status] || '#888', 0.2)}`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        {eventInstance.assignedStaff?.length || 0} assigned
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="View Overview">
                          <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); navigate(`/events/${eventInstance.id}`); }}
                            sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.1) } }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {isAdmin && (
                          <Tooltip title="Assign staff">
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); navigate(`/admin/events/${eventInstance.id}/assign`); }}
                              sx={{ color: 'text.secondary', '&:hover': { color: 'success.main', bgcolor: alpha(theme.palette.success.main, 0.1) } }}
                            >
                              <AssignIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {isAdmin && (
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); handleDelete(eventInstance.id); }}
                              sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.1) } }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {events.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Typography color="text.secondary" variant="body1">No events found in this view.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ) : (
        <Card sx={{
          p: 1.5,
          borderRadius: 4,
          boxShadow: theme.shadows[10],
          bgcolor: alpha(theme.palette.background.paper, 0.6),
          backdropFilter: 'blur(12px)',
          border: `1px solid ${alpha(theme.palette.common.white, 0.05)}`,
        }}>
          <Box sx={{
            height: 750,
            '& .rbc-calendar': {
              color: theme.palette.text.primary,
              fontFamily: theme.typography.fontFamily,
            },
            '& .rbc-header': {
              py: 1.5,
              fontWeight: 800,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: theme.palette.text.secondary,
              borderBottom: `2px solid ${alpha(theme.palette.divider, 0.1)}`,
            },
            '& .rbc-month-view': {
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              overflow: 'hidden',
              bgcolor: alpha(theme.palette.background.default, 0.3),
            },
            '& .rbc-month-row': {
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
            },
            '& .rbc-day-bg': {
              transition: 'background-color 0.2s',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.03),
              }
            },
            '& .rbc-today': {
              bgcolor: alpha(theme.palette.primary.main, 0.05),
            },
            '& .rbc-off-range-bg': {
              bgcolor: alpha(theme.palette.common.black, 0.1),
              opacity: 0.5,
            },
            '& .rbc-event': {
              padding: 0,
              border: 'none',
              borderRadius: 1.5,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
              }
            },
            '& .rbc-show-more': {
              fontWeight: 700,
              fontSize: '0.7rem',
              color: theme.palette.primary.main,
            },
            // Week/Day view: soften the grid lines
            '& .rbc-time-view': {
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              borderRadius: 3,
              overflow: 'hidden',
            },
            '& .rbc-timeslot-group': {
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.04)}`,
              minHeight: 60,
            },
            '& .rbc-time-slot': {
              borderTop: 'none',
            },
            '& .rbc-time-content': {
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            },
            '& .rbc-time-content > * + * > *': {
              borderLeft: `1px solid ${alpha(theme.palette.divider, 0.04)}`,
            },
            '& .rbc-time-gutter .rbc-label': {
              fontSize: '0.7rem',
              fontWeight: 500,
              color: theme.palette.text.secondary,
              opacity: 0.6,
            },
            '& .rbc-day-slot .rbc-time-slot': {
              borderTop: 'none',
            },
            '& .rbc-time-header-content': {
              borderLeft: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
            },
            '& .rbc-allday-cell': {
              display: 'none',
            },
          }}>
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              view={calendarView}
              onView={(v) => setCalendarView(v)}
              date={calendarDate}
              onNavigate={(d) => setCalendarDate(d)}
              onSelectEvent={(event: any) => navigate(`/events/${event.id}`)}
              style={{ height: '100%' }}
              components={{
                toolbar: CustomToolbar,
                event: CustomEvent,
              }}
              eventPropGetter={(event: any) => ({
                style: {
                  backgroundColor: STATUS_COLORS[event.resource.status] || theme.palette.primary.main,
                  borderLeft: `4px solid ${alpha('#fff', 0.4)}`,
                },
              })}
            />
          </Box>
        </Card>
      )}
    </Box>
  );
}
