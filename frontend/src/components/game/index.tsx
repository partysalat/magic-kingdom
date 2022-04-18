import React, { useEffect } from 'react';
import { Link } from '@reach/router';

export const Game = () => {
  useEffect(() => {
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
      <div id="screen" />
    </div>
  );
};
