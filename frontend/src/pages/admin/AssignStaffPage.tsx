import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Chip, CircularProgress,
  Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, alpha, useTheme,
} from '@mui/material';
import {
  CheckCircle as MatchIcon, Warning as WarnIcon,
  PersonAdd as AssignIcon, PersonRemove as UnassignIcon,
} from '@mui/icons-material';
import { eventInstancesApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

interface AvailableStaff {
  id: number;
  name: string;
  email: string;
  maxHoursPerWeek: number;
  currentWeekHours: number;
  warningMessages: string[];
  perfectMatch: boolean;
  onHoliday: boolean;
}

interface EventDetail {
  id: number;
  eventTypeName: string;
  locationName: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  status: string;
  durationMinutes: number;
  assignedStaff: { id: number; name: string; email: string }[];
  effectiveMinStaff: number;
  effectiveMaxStaff: number;
  effectiveMaxParticipants: number;
  effectiveMinAge: number;
  effectiveMaxAge: number;
}

export default function AssignStaffPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [availableStaff, setAvailableStaff] = useState<AvailableStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<number | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();
  const { user, isAdmin } = useAuth();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [eventRes, staffRes] = await Promise.all([
        eventInstancesApi.get(Number(id)),
        eventInstancesApi.getAvailableStaff(Number(id)),
      ]);
      setEvent(eventRes.data);
      setAvailableStaff(staffRes.data);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAssign = async (staffId: number) => {
    try {
      setAssigning(staffId);
      await eventInstancesApi.assignStaff(Number(id), staffId);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to assign staff');
    } finally {
      setAssigning(null);
    }
  };

  const handleUnassign = async (staffId: number) => {
    try {
      setAssigning(staffId);
      await eventInstancesApi.unassignStaff(Number(id), staffId);
      await loadData();
    } catch {
      setError('Failed to unassign staff');
    } finally {
      setAssigning(null);
    }
  };

  const isAssigned = (staffId: number) =>
    event?.assignedStaff?.some((s) => s.id === staffId);

  const handlePublish = async () => {
    try {
      setPublishing(true);
      await eventInstancesApi.publish(Number(id));
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to publish event');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  if (!event) {
    return <Alert severity="error">Event not found</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Assign Staff
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Event details card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Event</Typography>
              <Typography variant="h6" fontWeight={600}>{event.eventTypeName}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Date</Typography>
              <Typography fontWeight={500}>
                {format(new Date(event.eventDate), 'EEEE, d MMMM yyyy')}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Time</Typography>
              <Typography fontWeight={500}>{event.startTime?.slice(0, 5)} – {event.endTime?.slice(0, 5)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Location</Typography>
              <Typography fontWeight={500}>{event.locationName}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Assigned</Typography>
              <Typography fontWeight={500} color={event.assignedStaff?.length >= event.effectiveMaxStaff ? 'error.main' : 'inherit'}>
                {event.assignedStaff?.length || 0} / {event.effectiveMaxStaff} (Min: {event.effectiveMinStaff})
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Max Participants</Typography>
              <Typography fontWeight={500}>{event.effectiveMaxParticipants}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Age Range</Typography>
              <Typography fontWeight={500}>{event.effectiveMinAge} - {event.effectiveMaxAge} yrs</Typography>
            </Box>
          </Box>
          
          {event.status === 'DRAFT' && (
            <Tooltip title={(event.assignedStaff?.length || 0) < event.effectiveMinStaff ? 'Minimum staff not met' : ''}>
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={(event.assignedStaff?.length || 0) < event.effectiveMinStaff || publishing}
                  onClick={handlePublish}
                >
                  {publishing ? <CircularProgress size={24} color="inherit" /> : 'Publish Event'}
                </Button>
              </Box>
            </Tooltip>
          )}
        </Box>
        </CardContent>
      </Card>

      {/* Assigned staff */}
      {event.assignedStaff?.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Currently Assigned
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {event.assignedStaff.map((s) => {
                const canManage = isAdmin || s.email === user?.email;
                return (
                  <Chip
                    key={s.id}
                    label={s.name}
                    onDelete={canManage ? () => handleUnassign(s.id) : undefined}
                    deleteIcon={canManage ? <UnassignIcon /> : undefined}
                    sx={{
                      bgcolor: alpha(theme.palette.success.main, 0.15),
                      color: theme.palette.success.main,
                      fontWeight: 600,
                      '& .MuiChip-deleteIcon': { color: theme.palette.error.main },
                    }}
                  />
                );
              })}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Available staff table */}
      <Card>
        <CardContent sx={{ pb: 0 }}>
          <Typography variant="h6" fontWeight={600}>
            Available Staff
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Perfect matches appear first. Hover over warnings for details.
          </Typography>
        </CardContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Weekly Hours</TableCell>
                <TableCell>Warnings</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(isAdmin ? availableStaff : availableStaff.filter((s) => s.email === user?.email)).map((staff) => {
                const assigned = isAssigned(staff.id);
                return (
                  <TableRow
                    key={staff.id}
                    sx={{
                      opacity: staff.perfectMatch || assigned ? 1 : 0.6,
                      bgcolor: assigned
                        ? alpha(theme.palette.success.main, 0.05)
                        : staff.perfectMatch
                          ? 'transparent'
                          : alpha(theme.palette.warning.main, 0.03),
                    }}
                  >
                    <TableCell>
                      {staff.onHoliday ? (
                        <WarnIcon sx={{ color: 'error.main' }} fontSize="small" />
                      ) : staff.perfectMatch ? (
                        <MatchIcon sx={{ color: 'success.main' }} fontSize="small" />
                      ) : (
                        <WarnIcon sx={{ color: 'warning.main' }} fontSize="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600} color={staff.onHoliday ? 'error.main' : 'inherit'}>
                        {staff.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{staff.email}</TableCell>
                    <TableCell>
                      {staff.currentWeekHours?.toFixed(1)} / {staff.maxHoursPerWeek}h
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {staff.onHoliday && (
                          <Chip
                            label="On holiday"
                            size="small"
                            sx={{
                              fontSize: '0.65rem',
                              height: 22,
                              bgcolor: alpha(theme.palette.error.main, 0.15),
                              color: theme.palette.error.main,
                              fontWeight: 700,
                            }}
                          />
                        )}
                        {staff.warningMessages?.filter(w => w !== 'On holiday').map((w, i) => (
                          <Tooltip key={i} title={w} arrow>
                            <Chip
                              label={w}
                              size="small"
                              sx={{
                                fontSize: '0.65rem',
                                height: 22,
                                bgcolor: alpha(theme.palette.warning.main, 0.15),
                                color: theme.palette.warning.main,
                              }}
                            />
                          </Tooltip>
                        ))}
                        {!staff.onHoliday && staff.perfectMatch && (
                          <Chip
                            label="Perfect match"
                            size="small"
                            sx={{
                              fontSize: '0.65rem',
                              height: 22,
                              bgcolor: alpha(theme.palette.success.main, 0.15),
                              color: theme.palette.success.main,
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {assigned ? (
                        <Button
                          size="small"
                          color="error"
                          startIcon={<UnassignIcon />}
                          onClick={() => handleUnassign(staff.id)}
                          disabled={assigning === staff.id}
                        >
                          {assigning === staff.id ? <CircularProgress size={16} /> : 'Remove'}
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<AssignIcon />}
                          onClick={() => handleAssign(staff.id)}
                          disabled={assigning === staff.id || staff.onHoliday}
                        >
                          {assigning === staff.id ? <CircularProgress size={16} /> : 'Assign'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {availableStaff.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No staff members found</Typography>
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
