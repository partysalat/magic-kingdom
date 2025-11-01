import React from 'react';
import { Game } from '../components/game';
import { MedievalMeme } from '../components/medievalMemes';
import { Grid } from '@mui/material';
import { Bestlist } from '../components/bestlist';
import { Newsfeed } from '../components/newsfeed';

export const GameLayout: React.FC = () => {
  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: 'black',
      }}
    >
      <Game />
    </div>
  );
};
