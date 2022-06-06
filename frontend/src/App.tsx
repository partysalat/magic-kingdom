import React from 'react';
import './App.css';
import { Router } from '@reach/router';
import { Accounting } from './components/accounting';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from '@mui/material';
import { accountingTheme, mainTheme, mirrorTheme } from './Theme';
import { Bestlist } from './components/bestlist';
import { MirrorLayout } from './layouts/MirrorLayout';
// import { Game } from './game';
import { NewsfeedNoInfiniteScroll } from './components/newsfeed/FeedNoInfiniteScroll';
import { MainLayout } from './layouts/MainLayout';
import { GameLayout } from './layouts/GameLayout';
import { WebSocketProvider } from './contexts/newsContext';

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
        <ThemeProvider theme={mainTheme}>
          <Router>
            <MainLayout path="/" />
            <GameLayout path="/game" />
          </Router>
        </ThemeProvider>
        <ThemeProvider theme={mirrorTheme}>
          <Router>
            <MirrorLayout
              path="/snippets/bestlist"
              top={false}
              component={
                <WebSocketProvider>
                  <Bestlist withAutoScroll={true} withStickyHeader={true} />
                </WebSocketProvider>
              }
            />
            <MirrorLayout
              path="/snippets/newsfeed"
              top={false}
              component={
                <WebSocketProvider>
                  <NewsfeedNoInfiniteScroll />
                </WebSocketProvider>
              }
            />
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
