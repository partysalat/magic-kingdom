import { createTheme, ThemeOptions } from '@mui/material';

export const accountingTheme: ThemeOptions = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    text: {
      primary: '#fff',
      secondary: 'rgb(170, 170, 170)',
    },
  },
});
export const mainTheme: ThemeOptions = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      paper: 'rgba(36,36,36,0.5)',
    },
    text: {
      primary: '#fff',
      secondary: 'rgb(170, 170, 170)',
    },
  },

  typography: {
    allVariants: {
      color: '#ffffff',
    },
    subtitle2: {
      color: 'rgb(170, 170, 170)',
    },
    fontFamily: ['Roboto Condensed', 'sans-serif'].join(','),
  },
});
export const mirrorTheme: ThemeOptions = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      paper: 'rgba(36,36,36,0.5)',
    },
    text: {
      primary: '#fff',
      secondary: 'rgb(170, 170, 170)',
    },
  },

  typography: {
    allVariants: {
      color: '#ffffff',
    },
    subtitle2: {
      color: 'rgb(170, 170, 170)',
    },
    fontFamily: ['Roboto Condensed', 'sans-serif'].join(','),
  },
});
