import React from 'react';
import { Link, RouteComponentProps } from '@reach/router';
import { MedievalMeme } from '../components/medievalMemes';
import { Grid } from '@mui/material';
import { Bestlist } from '../components/bestlist';
import { Newsfeed } from '../components/newsfeed';
import { WebSocketProvider } from '../contexts/newsContext';

type Props = { component?: React.ReactElement };
export const MainLayout: React.FC<Props & RouteComponentProps> = ({
  component,
}) => {
  return (
    <WebSocketProvider>
      <Grid
        container
        spacing={1}
        style={{
          width: '100%',
          minHeight: '100vh',
          // background: 'url("/images/background/background.jpg")',
          background: 'black',
        }}
      >
        <Grid item xs={6}>
          <Bestlist withAutoScroll={false} />
        </Grid>
        <Grid item xs={6}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <a href="/game">
                <img
                  className="animate__animated animate__pulse"
                  src="images/turm_verteidigung_logo.png"
                  style={{ width: '100%', animationIterationCount: 'infinite' }}
                />
              </a>
            </Grid>
            <Grid item xs={6}>
              <MedievalMeme />
            </Grid>
            <Grid item xs={12}>
              <Newsfeed animation="animate__animated animate__fadeInUp" />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </WebSocketProvider>
  );
};
