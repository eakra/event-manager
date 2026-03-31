import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  AppBar, Box, CssBaseline, Drawer, IconButton, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography,
  Avatar, Divider, Tooltip, Chip, useTheme, alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  EventNote as EventIcon,
  Category as EventTypeIcon,
  People as StaffIcon,
  LocationOn as LocationIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const DRAWER_WIDTH = 260;

const adminMenuItems = [
  { text: 'Events', icon: <EventIcon />, path: '/admin/events' },
  { text: 'Event Types', icon: <EventTypeIcon />, path: '/admin/event-types' },
  { text: 'Staff', icon: <StaffIcon />, path: '/admin/staff' },
  { text: 'Participants', icon: <PersonIcon />, path: '/admin/participants' },
  { text: 'Locations', icon: <LocationIcon />, path: '/admin/locations' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
];

const staffMenuItems = [
  { text: 'Events Calendar', icon: <EventIcon />, path: '/staff/events' },
  { text: 'Event Types', icon: <EventTypeIcon />, path: '/staff/event-types' },
  { text: 'My Schedule', icon: <CalendarIcon />, path: '/staff/schedule' },
  { text: 'My Profile', icon: <PersonIcon />, path: '/staff/profile' },
  { text: 'Participants', icon: <PersonIcon />, path: '/staff/participants' },
  { text: 'Locations', icon: <LocationIcon />, path: '/staff/locations' },
];

const participantMenuItems = [
  { text: 'Events', icon: <EventIcon />, path: '/participant/events' },
  { text: 'My Profile', icon: <PersonIcon />, path: '/participant/profile' },
];

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, isAdmin, isStaff, isParticipant } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  let menuItems: any[] = [];
  if (isAdmin) menuItems = adminMenuItems;
  else if (isStaff) menuItems = staffMenuItems;
  else if (isParticipant) menuItems = participantMenuItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          component="img"
          src="/oyci_logo_new.png"
          alt="OYCI Logo"
          sx={{
            width: 40,
            height: 40,
            objectFit: 'contain',
          }}
        />
        <Box>
          <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
            Event Staffing
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Management System
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(0,0,0,0.06)' }} />

      <List sx={{ flex: 1, px: 1.5, py: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.15) : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive
                      ? alpha(theme.palette.primary.main, 0.2)
                      : alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                    fontSize: '0.9rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(0,0,0,0.06)' }} />

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: theme.palette.primary.dark,
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.name}
            </Typography>
            <Chip
              label={user?.role}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 700,
                bgcolor: isAdmin
                  ? alpha(theme.palette.secondary.main, 0.15)
                  : alpha(theme.palette.success.main, 0.15),
                color: isAdmin ? theme.palette.secondary.main : theme.palette.success.main,
              }}
            />
          </Box>
          <Tooltip title="Sign out">
            <IconButton onClick={handleLogout} size="small" sx={{ color: 'text.secondary' }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          display: { md: 'none' },
          bgcolor: alpha(theme.palette.background.default, 0.8),
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={700} sx={{ ml: 1 }}>
            Event Staffing
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            bgcolor: 'background.paper',
            borderRight: '1px solid rgba(0,0,0,0.08)',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            bgcolor: 'background.paper',
            borderRight: '1px solid rgba(255,255,255,0.06)',
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          pt: { xs: 10, md: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
