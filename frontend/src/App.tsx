import React from 'react';
import './App.css';
import { Router } from '@reach/router';
import { Accounting } from './components/accounting';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from '@mui/material';
import { themeOptions } from './Theme';
import { Bestlist } from './components/bestlist';
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
      <ThemeProvider theme={themeOptions}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Accounting path="/abrechnung" />
            <Bestlist path="/bestlist" />
          </Router>
        </QueryClientProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
