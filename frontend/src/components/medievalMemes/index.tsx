import React, { useEffect, useState } from 'react';

const MEMES = [
  'badass-over-here-bayeux.jpeg',
  'bitch_please.jpeg',
  'datass.jpeg',
  'einfach-mal-fresse-halten.jpeg',
  'facebook_essen_fotografieren.jpeg',
  'fuck-the-police.jpeg',
  'halt_stop_frauentausch.jpeg',
  'hammertime.jpeg',
  'HatersGonnaHate.jpeg',
  'I-Got-99-Problems-But-a-Bitch-Aint-One.jpeg',
  'LikeaBoss.png',
  'not-sure-if-trolling-bayeux.jpeg',
  'Picsoritdidnthappen.jpeg',
  'seemerollin.jpeg',
  'shut_up_take_money.jpeg',
  'totally_worth_it.jpeg',
  'true-story-bayeux.jpeg',
  'Trustme.jpeg',
  'yolo.jpeg',
  'you-only-had-one-job.jpeg',
];

export const MedievalMeme = () => {
  const [meme, setMeme] = useState(MEMES[0]);
  useEffect(() => {
    const interval = setInterval(() => {
      setMeme(MEMES[Math.floor(Math.random() * MEMES.length)]);
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  return <img style={{ width: '100%' }} src={`images/memes/${meme}`} />;
};
