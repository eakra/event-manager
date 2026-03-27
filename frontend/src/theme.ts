import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7C4DFF',
      light: '#B47CFF',
      dark: '#5A1DCC',
    },
    secondary: {
      main: '#00E5FF',
      light: '#6EFFFF',
      dark: '#00B2CC',
    },
    background: {
      default: '#0A0E1A',
      paper: '#111827',
    },
    success: {
      main: '#00E676',
    },
    warning: {
      main: '#FFAB40',
    },
    error: {
      main: '#FF5252',
    },
    text: {
      primary: '#E8EAED',
      secondary: '#9AA0A6',
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
          backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(124, 77, 255, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(0, 229, 255, 0.06) 0%, transparent 50%)',
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.06)',
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
          boxShadow: '0 4px 14px 0 rgba(124, 77, 255, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 20px 0 rgba(124, 77, 255, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(17, 24, 39, 0.8)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700,
            backgroundColor: 'rgba(124, 77, 255, 0.1)',
            color: '#B47CFF',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
        },
      },
    },
  },
});

export default theme;
