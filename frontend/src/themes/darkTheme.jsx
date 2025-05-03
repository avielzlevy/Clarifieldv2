import { createTheme } from '@mui/material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    custom: {
      titleIcon: '#2dd4bf',
      bright: '#9333ea',
      light: '#3f3f46',
      dark: '#d7cde0',
      editor: '#1e1e1e',
    },
    primary: {
      main: '#7f56da',
      contrastText: '#ffffff',
    },
    background: {
      default: '#191919',
      paper: '#2c2c2c',
    },
    text: {
      primary: '#f3f4f6',
      secondary: '#9ca3af',
    },
  },
  typography: {
    fontFamily: [
      'ui-sans-serif',
      'system-ui',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
      '"Noto Color Emoji"',
      '"Android Emoji"',
      '"EmojiSymbols"',
    ].join(','),
    fontSize: 16,
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        color: 'inherit',
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#7f56da',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#6f44c9',
          },
          '&:disabled': {
            backgroundColor: '#4b5563',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export default darkTheme;
