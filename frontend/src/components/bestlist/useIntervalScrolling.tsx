import React, { useEffect } from 'react';

export function useIntervalScrolling(props: { delta: number; ms: number }) {
  useEffect(() => {
    let sign = 1;
    const interval = setInterval(() => {
      console.log(
        window.scrollY + window.outerHeight,
        document.body.offsetHeight
      );
      if (document.body.offsetHeight <= window.scrollY + window.outerHeight) {
        sign = -1;
      } else if (window.scrollY === 0) {
        sign = 1;
      }
      window.scrollBy({ top: sign * props.delta, behavior: 'smooth' });
    }, props.ms);
    return () => {
      clearInterval(interval);
    };
  }, []);
}
