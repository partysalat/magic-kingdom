import React, { useEffect, useState } from 'react';
import { Link } from '@reach/router';
import { WinningUser } from './WinningUser';

export const Game = () => {
  const [showWinningModal, setShowWinningModal] = useState(false);
  const [difficulty, setDifficulty] = useState('');
  useEffect(() => {
    // @ts-ignore
    window.onGameWon = (difficulty) => {
      setDifficulty(difficulty);
      setShowWinningModal(true);
    };
    // @ts-ignore
    window.onReady?.(function onReady() {
      game.onload();
    });
    return () => {
      // window.game.remove();
    };
    //
  }, []);
  return (
    <div>
      <Link
        to="/"
        style={{ color: 'white', position: 'absolute', top: 0, left: 0 }}
      >
        Zurück
      </Link>
      <WinningUser
        open={showWinningModal}
        onNext={async (user) => {
          setShowWinningModal(false);
          console.log(difficulty, user);
          // await navigate('/');
        }}
      ></WinningUser>
      <div id="screen" />
    </div>
  );
};
