// src/themes/lightTheme.js
import { createTheme } from '@mui/material';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    custom: {
      titleIcon: '#2dd4bf',
      bright: '#9333ea',
      light: '#f3e8ff',
      dark: '#d7cde0',
      editor: '#fffffe',
    },
    primary: {
      main: '#7f56da',
      contrastText: '#ffffff',
    },
    background: {
      default: '#faf5ff',
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#4b5563',
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
            backgroundColor: '#d1d5db',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

export default lightTheme;