import React from 'react';
import styles from './fadeOutLayer.module.css';

export function FadeOutLayer() {
  return (
    <>
      <div className={styles['fade-out-layer-top']} />
      <div className={styles['fade-out-layer-bottom']} />
    </>
  );
}
