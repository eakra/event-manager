import React, { useState, useEffect } from 'react';
import {
  Badge, IconButton, Menu, MenuItem, Typography, Box,
  Divider, Button, List, ListItem, Tooltip,
  CircularProgress, alpha, useTheme
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Event as EventIcon,
  HolidayVillage as HolidayIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Cancel as DeclineIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import DeclineReasonModal from './DeclineReasonModal';

interface Notification {
  id: number;
  type: 'ASSIGNMENT_REQUEST' | 'HOLIDAY_REQUEST' | 'ASSIGNMENT_DECLINED';
  relatedId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [declineId, setDeclineId] = useState<number | null>(null);
  const { isAdmin } = useAuth();
  const theme = useTheme();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAsRead = async (id: number) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleApprove = async (notification: Notification) => {
    try {
      await axios.post(`/api/notifications/${notification.id}/approve`);
      fetchNotifications();
    } catch (error) {
      console.error('Error approving:', error);
    }
  };

  const handleDeclineClick = (notification: Notification) => {
    if (notification.type === 'ASSIGNMENT_REQUEST') {
      setDeclineId(notification.id);
    } else {
      handleDeclineHoliday(notification.id);
    }
  };

  const handleDeclineHoliday = async (id: number) => {
    try {
      await axios.post(`/api/notifications/${id}/decline`, {});
      fetchNotifications();
    } catch (error) {
      console.error('Error declining holiday:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ASSIGNMENT_REQUEST': return <EventIcon color="primary" />;
      case 'HOLIDAY_REQUEST': return <HolidayIcon color="secondary" />;
      case 'ASSIGNMENT_DECLINED': return <ErrorIcon color="error" />;
      default: return <NotificationsIcon />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton color="inherit" onClick={handleOpen}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 500,
            mt: 1.5,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>Notifications</Typography>
          {loading && <CircularProgress size={20} />}
        </Box>
        <Divider />
        <List sx={{ p: 0 }}>
          {notifications.length === 0 ? (
            <MenuItem disabled sx={{ py: 3, justifyContent: 'center' }}>
              <Typography color="text.secondary">No notifications</Typography>
            </MenuItem>
          ) : (
            notifications.map((n) => (
              <ListItem
                key={n.id}
                sx={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  bgcolor: n.isRead ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                  py: 2
                }}
              >
                <Box sx={{ display: 'flex', gap: 1.5, width: '100%', mb: 1 }}>
                  <Box sx={{ mt: 0.5 }}>{getIcon(n.type)}</Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={n.isRead ? 400 : 600}>
                      {n.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(n.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>

                {!n.isRead && (
                  <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'flex-end', mt: 1 }}>
                    {n.type === 'ASSIGNMENT_REQUEST' && (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<SuccessIcon />}
                          onClick={() => handleApprove(n)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeclineIcon />}
                          onClick={() => handleDeclineClick(n)}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                    {n.type === 'HOLIDAY_REQUEST' && isAdmin && (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<SuccessIcon />}
                          onClick={() => handleApprove(n)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeclineIcon />}
                          onClick={() => handleDeclineClick(n)}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                    {(n.type === 'ASSIGNMENT_DECLINED' || (n.type === 'HOLIDAY_REQUEST' && !isAdmin)) && (
                      <Button size="small" onClick={() => markAsRead(n.id)}>
                        Mark as read
                      </Button>
                    )}
                  </Box>
                )}
              </ListItem>
            ))
          )}
        </List>
      </Menu>

      {declineId && (
        <DeclineReasonModal
          open={!!declineId}
          onClose={() => setDeclineId(null)}
          notificationId={declineId}
          onDeclineSuccess={() => {
            setDeclineId(null);
            fetchNotifications();
          }}
        />
      )}
    </>
  );
}
