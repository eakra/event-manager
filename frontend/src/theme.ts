import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0b8e36',
      light: '#45bd62',
      dark: '#066633',
    },
    secondary: {
      main: '#27b0e7',
      light: '#70d1ff',
      dark: '#0081b4',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    success: {
      main: '#0b8e36',
    },
    warning: {
      main: '#ffab40',
    },
    error: {
      main: '#e6007e',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(11, 142, 54, 0.05) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(39, 176, 231, 0.04) 0%, transparent 50%)',
          backgroundAttachment: 'fixed',
          backgroundColor: '#F8FAFC',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
        },
        contained: {
          boxShadow: '0 4px 14px 0 rgba(11, 142, 54, 0.2)',
          '&:hover': {
            boxShadow: '0 6px 20px 0 rgba(11, 142, 54, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #E2E8F0',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700,
            backgroundColor: '#F1F5F9',
            color: '#1E293B',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
        },
      },
    },
  },
});

export default theme;
