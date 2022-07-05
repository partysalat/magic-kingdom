import React, { useEffect, useState } from 'react';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import './style.css';
const duration = 500;

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
  'lambda.jpeg',
  'meme-what-she-said.jpg',
  'MFMI36W.jpeg',
  'one_ale.jpeg',
];

export const MedievalMeme = () => {
  const [meme, setMeme] = useState(MEMES[0]);
  useEffect(() => {
    const interval = setInterval(() => {
      setMeme(MEMES[Math.floor(Math.random() * MEMES.length)]);
    }, 15000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  // return <div style={{ width: '100%', height: "100%" }} src={`images/memes/${meme}`} />;

  return (
    <SwitchTransition>
      <CSSTransition key={meme} timeout={duration} classNames="fade">
        <div
          style={{
            height: '100%',
            backgroundImage: `url(images/memes/${meme})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />
      </CSSTransition>
    </SwitchTransition>
  );
};
