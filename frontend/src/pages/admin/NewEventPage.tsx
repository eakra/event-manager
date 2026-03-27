import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Stepper, Step, StepLabel,
  Button, TextField, MenuItem, Alert, CircularProgress,
} from '@mui/material';
import { ArrowBack, ArrowForward, Check } from '@mui/icons-material';
import { eventTypesApi, locationsApi, eventInstancesApi } from '../../services/api';

const steps = ['Select Event Type', 'Choose Location', 'Set Date & Time', 'Review & Create'];

export default function NewEventPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    eventTypeId: '',
    locationId: '',
    eventDate: '',
    startTime: '',
    status: 'DRAFT',
    minStaff: '',
    maxStaff: '',
    maxParticipants: '',
    minAge: '',
    maxAge: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([eventTypesApi.list(), locationsApi.list()])
      .then(([etRes, locRes]) => {
        setEventTypes(etRes.data);
        setLocations(locRes.data);
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const selectedType = eventTypes.find((t) => t.id === Number(form.eventTypeId));
  const selectedLocation = locations.find((l) => l.id === Number(form.locationId));

  const handleCreate = async () => {
    try {
      setLoading(true);
      await eventInstancesApi.create({
        eventTypeId: Number(form.eventTypeId),
        locationId: Number(form.locationId),
        eventDate: form.eventDate,
        startTime: form.startTime,
        status: form.status,
        minStaff: form.minStaff ? Number(form.minStaff) : null,
        maxStaff: form.maxStaff ? Number(form.maxStaff) : null,
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : null,
        minAge: form.minAge ? Number(form.minAge) : null,
        maxAge: form.maxAge ? Number(form.maxAge) : null,
      });
      navigate('/admin/events');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0: return !!form.eventTypeId;
      case 1: return !!form.locationId;
      case 2: return !!form.eventDate && !!form.startTime;
      default: return true;
    }
  };

  if (loading && eventTypes.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Create New Event
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <CardContent>
          {activeStep === 0 && (
            <TextField
              id="event-type-select"
              select
              label="Event Type"
              fullWidth
              value={form.eventTypeId}
              onChange={(e) => setForm({ ...form, eventTypeId: e.target.value })}
            >
              {eventTypes.map((et) => (
                <MenuItem key={et.id} value={et.id}>
                  {et.name} ({et.durationMinutes} min)
                </MenuItem>
              ))}
            </TextField>
          )}

          {activeStep === 1 && (
            <TextField
              id="location-select"
              select
              label="Location"
              fullWidth
              value={form.locationId}
              onChange={(e) => setForm({ ...form, locationId: e.target.value })}
            >
              {locations.map((loc) => (
                <MenuItem key={loc.id} value={loc.id}>
                  {loc.name} — {loc.city}
                </MenuItem>
              ))}
            </TextField>
          )}

          {activeStep === 2 && (
            <Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  id="event-date-input"
                  label="Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={form.eventDate}
                  onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                  sx={{ flex: 1, minWidth: 200 }}
                />
                <TextField
                  id="event-time-input"
                  label="Start Time"
                  type="time"
                  InputLabelProps={{ shrink: true }}
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  sx={{ flex: 1, minWidth: 200 }}
                />
              </Box>
            
            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3, mb: 2 }}>
              Rule Overrides (Optional)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Leave blank to use the standard defaults defined by the {selectedType?.name || 'Event Type'}.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
              <TextField label="Min Staff" type="number" value={form.minStaff} onChange={(e) => setForm({ ...form, minStaff: e.target.value })} sx={{ flex: 1 }} />
              <TextField label="Max Staff" type="number" value={form.maxStaff} onChange={(e) => setForm({ ...form, maxStaff: e.target.value })} sx={{ flex: 1 }} />
              <TextField label="Max Participants" type="number" value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })} sx={{ flex: 1 }} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField label="Min Age" type="number" value={form.minAge} onChange={(e) => setForm({ ...form, minAge: e.target.value })} sx={{ flex: 1 }} />
              <TextField label="Max Age" type="number" value={form.maxAge} onChange={(e) => setForm({ ...form, maxAge: e.target.value })} sx={{ flex: 1 }} />
            </Box>
          </Box>
        )}

          {activeStep === 3 && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>Review</Typography>
              <Box sx={{
                display: 'grid', gridTemplateColumns: '150px 1fr', gap: 1,
                '& > :nth-of-type(odd)': { color: 'text.secondary', fontWeight: 500 },
              }}>
                <Typography>Type:</Typography>
                <Typography>{selectedType?.name}</Typography>
                <Typography>Duration:</Typography>
                <Typography>{selectedType?.durationMinutes} minutes</Typography>
                <Typography>Location:</Typography>
                <Typography>{selectedLocation?.name}</Typography>
                <Typography>Date:</Typography>
                <Typography>{form.eventDate}</Typography>
                <Typography>Start Time:</Typography>
                <Typography>{form.startTime}</Typography>
                <Typography>Overrides:</Typography>
                <Typography>
                  {form.minStaff || form.maxStaff || form.maxParticipants || form.minAge || form.maxAge 
                    ? 'Custom Rules Applied' : 'Using Defaults'}
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={() => setActiveStep((s) => s - 1)}
            startIcon={<ArrowBack />}
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              id="create-event-btn"
              variant="contained"
              onClick={handleCreate}
              startIcon={loading ? <CircularProgress size={18} /> : <Check />}
              disabled={loading}
            >
              Create Event
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => setActiveStep((s) => s + 1)}
              endIcon={<ArrowForward />}
              disabled={!canProceed()}
            >
              Next
            </Button>
          )}
        </Box>
      </Card>
    </Box>
  );
}
