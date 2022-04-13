import React, { useEffect } from 'react';

export const Game = () => {
  useEffect(() => {
    // @ts-ignore
    window.onReady?.(function onReady() {
      game.onload();
    });
    window.game?.onload();
  }, []);
  return <div id="screen" />;
};
