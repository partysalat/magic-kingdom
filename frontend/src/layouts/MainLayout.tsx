import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { Game } from '../components/game';
import { MedievalMeme } from '../components/medievalMemes';
import { Grid } from '@mui/material';
import { Bestlist } from '../components/bestlist';
import { Newsfeed } from '../components/newsfeed';

type Props = { component?: React.ReactElement };
export const MainLayout: React.FC<Props & RouteComponentProps> = ({
  component,
}) => {
  return (
    <Grid
      container
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
        <Grid item xs={12}>
          <Game />
        </Grid>
        <Grid item xs={12}>
          <Newsfeed animation="animate__animated animate__fadeInUp" />
        </Grid>
        <Grid item xs={6}>
          <MedievalMeme />
        </Grid>
      </Grid>
    </Grid>
  );
};
