
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

// Pages
import LoginPage from './pages/LoginPage';
import EventsPage from './pages/admin/EventsPage';
import NewEventPage from './pages/admin/NewEventPage';
import AssignStaffPage from './pages/admin/AssignStaffPage';
import EventTypesPage from './pages/admin/EventTypesPage';
import StaffPage from './pages/admin/StaffPage';
import LocationsPage from './pages/admin/LocationsPage';
import SettingsPage from './pages/admin/SettingsPage';
import SchedulePage from './pages/staff/SchedulePage';
import ProfilePage from './pages/staff/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import ParticipantsPage from './pages/admin/ParticipantsPage';
import ParticipantEventsPage from './pages/participant/ParticipantEventsPage';

import EventOverviewPage from './pages/shared/EventOverviewPage';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Shared Event Overview (Accessible to Admin & Staff) */}
            <Route element={<ProtectedRoute requiredRole={['ADMIN', 'STAFF']} />}>
              <Route element={<AppLayout />}>
                <Route path="/events/:id" element={<EventOverviewPage />} />
              </Route>
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
              <Route element={<AppLayout />}>
                <Route path="/admin/events" element={<EventsPage />} />
                <Route path="/admin/events/new" element={<NewEventPage />} />
                <Route path="/admin/events/:id/assign" element={<AssignStaffPage />} />
                <Route path="/admin/event-types" element={<EventTypesPage />} />
                <Route path="/admin/staff" element={<StaffPage />} />
                <Route path="/admin/participants" element={<ParticipantsPage />} />
                <Route path="/admin/locations" element={<LocationsPage />} />
                <Route path="/admin/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Staff routes */}
            <Route element={<ProtectedRoute requiredRole="STAFF" />}>
              <Route element={<AppLayout />}>
                <Route path="/staff/events" element={<EventsPage />} />
                <Route path="/staff/events/:id/assign" element={<AssignStaffPage />} />
                <Route path="/staff/schedule" element={<SchedulePage />} />
                <Route path="/staff/profile" element={<ProfilePage />} />
                <Route path="/staff/participants" element={<ParticipantsPage />} />
                <Route path="/staff/locations" element={<LocationsPage />} />
                <Route path="/staff/event-types" element={<EventTypesPage />} />
              </Route>
            </Route>

            {/* Participant routes */}
            <Route element={<ProtectedRoute requiredRole="PARTICIPANT" />}>
              <Route element={<AppLayout />}>
                <Route path="/participant/events" element={<ParticipantEventsPage />} />

              </Route>
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
