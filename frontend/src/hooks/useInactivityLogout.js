import { useEffect, useRef } from 'react';

const useInactivityLogout = (logoutCallback, inactivityTime = 600000) => { // default 10 minutes
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(logoutCallback, inactivityTime);
  };

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];

    const resetAndTrack = () => {
      resetTimer();
    };

    events.forEach(event => window.addEventListener(event, resetAndTrack));

    resetTimer(); // Start the timer when the component mounts

    return () => {
      events.forEach(event => window.removeEventListener(event, resetAndTrack));
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [logoutCallback, inactivityTime]);
};

export default useInactivityLogout;