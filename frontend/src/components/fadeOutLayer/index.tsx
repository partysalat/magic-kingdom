import React from 'react';
import styles from './fadeOutLayer.module.css';

type Props = {
  top: boolean;
  bottom: boolean;
};
export function FadeOutLayer({ top, bottom }: Props) {
  return (
    <>
      {top && <div className={styles['fade-out-layer-top']} />}
      {bottom && <div className={styles['fade-out-layer-bottom']} />}
    </>
  );
}
