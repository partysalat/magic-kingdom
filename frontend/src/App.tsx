import React from 'react';
import './App.css';
import { Router } from '@reach/router';
import { Accounting } from './components/accounting';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from '@mui/material';
import { accountingTheme, mirrorTheme } from './Theme';
import { Bestlist } from './components/bestlist';
import { FadeOutLayer } from './components/fadeOutLayer';
import { MirrorLayout } from './layouts/MirrorLayout';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

function App() {
  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={accountingTheme}>
          <Router>
            <Accounting path="/abrechnung" />
          </Router>
        </ThemeProvider>
        <ThemeProvider theme={mirrorTheme}>
          <Router>
            <MirrorLayout path="/snippets/bestlist" />
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
