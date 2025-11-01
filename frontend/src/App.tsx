import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Accounting } from './components/accounting';
import {QueryCache, QueryClient, QueryClientProvider} from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material';
import { accountingTheme, mainTheme, mirrorTheme } from './Theme';
import { Bestlist } from './components/bestlist';
import { MirrorLayout } from './layouts/MirrorLayout';
// import { Game } from './game';
import { NewsfeedNoInfiniteScroll } from './components/newsfeed/FeedNoInfiniteScroll';
import { MainLayout } from './layouts/MainLayout';
import { GameLayout } from './layouts/GameLayout';
import { WebSocketProvider } from './contexts/newsContext';
import {toast} from "react-toastify";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.errorMessage) {
        toast.error(`${query.meta.errorMessage} : ${error.message}`)
      }
    },
  }),
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
        <BrowserRouter>
          <Routes>
            <Route
              path="/abrechnung"
              element={
                <ThemeProvider theme={accountingTheme}>
                  <Accounting />
                </ThemeProvider>
              }
            />
            <Route
              path="/"
              element={
                <ThemeProvider theme={mainTheme}>
                  <MainLayout />
                </ThemeProvider>
              }
            />
            <Route
              path="/game"
              element={
                <ThemeProvider theme={mainTheme}>
                  <GameLayout />
                </ThemeProvider>
              }
            />
            <Route
              path="/snippets/bestlist"
              element={
                <ThemeProvider theme={mirrorTheme}>
                  <MirrorLayout
                    top={false}
                    component={
                      <WebSocketProvider>
                        <Bestlist withAutoScroll={true} withStickyHeader={true} />
                      </WebSocketProvider>
                    }
                  />
                </ThemeProvider>
              }
            />
            <Route
              path="/snippets/newsfeed"
              element={
                <ThemeProvider theme={mirrorTheme}>
                  <MirrorLayout
                    top={false}
                    component={
                      <WebSocketProvider>
                        <NewsfeedNoInfiniteScroll />
                      </WebSocketProvider>
                    }
                  />
                </ThemeProvider>
              }
            />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </div>
  );
}

export default App;
