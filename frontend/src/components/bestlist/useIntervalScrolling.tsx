import React, { useEffect } from 'react';

export function useIntervalScrolling(props: {
  delta: number;
  ms: number;
  enabled: boolean;
}) {
  useEffect(() => {
    if (!props.enabled) {
      return;
    }
    let sign = 1;
    scrollBy(sign * props.delta, props.ms);
    const interval = setInterval(() => {
      if (document.body.offsetHeight <= window.scrollY + window.outerHeight) {
        sign = -1;
      } else if (window.scrollY === 0) {
        sign = 1;
      }
      scrollBy(sign * props.delta, props.ms);
      // window.scrollBy({ top: sign * props.delta, behavior: 'smooth' });
    }, props.ms);
    return () => {
      clearInterval(interval);
    };
  }, []);
}
const scrollBy = (delta: number, duration = 600) => {
  const startTime = performance.now();

  const step = () => {
    const progress = (performance.now() - startTime) / duration;
    // const amount = easeOutCubic(progress);
    // window.scrollBy({ top: amount * delta });
    window.scrollBy({ top: delta });
    if (progress < 0.99) {
      window.requestAnimationFrame(step);
    }
  };

  step();
};
