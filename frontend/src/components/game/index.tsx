import React, { useEffect, useState } from 'react';
import { Link } from '@reach/router';
import { WinningUser } from './WinningUser';
import load from 'load-script';
import {
  Difficulty,
  useCreateGameAchievement,
} from '../../contexts/newsContext';
let isLoaded = false;
export const Game = () => {
  const [showWinningModal, setShowWinningModal] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const { mutate: createGameAchievement } = useCreateGameAchievement();
  useEffect(() => {
    if (!isLoaded) {
      load('./game.js', () => {
        // @ts-ignore
        window.onReady?.(function onReady() {
          console.log('Game on;pad');
          game.onload();
        });
      });
      isLoaded = true;
    }

    // @ts-ignore
    window.onGameWon = (difficulty) => {
      setDifficulty(difficulty);
      setShowWinningModal(true);
    };
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
          console.log(difficulty, user);
          createGameAchievement(
            { userId: user.SK, difficulty: difficulty },
            {
              onSuccess: () => {
                setShowWinningModal(false);
              },
            }
          );
          // await navigate('/');
        }}
      ></WinningUser>
      <div id="screen" />
    </div>
  );
};
