import { createTheme, ThemeOptions } from '@mui/material';

export const accountingTheme: ThemeOptions = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
});
export const mirrorTheme: ThemeOptions = createTheme({
  palette: {
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
