import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { saveScroll, restoreScroll } from '../utils/scroll.js';

/**
 * Place inside <Router> (e.g. wrapping <Routes>). Saves the scroll position
 * for the outgoing location and restores it when returning (back/forward).
 * Fresh navigations still start at the top.
 */
export default function ScrollManager() {
  const location = useLocation();
  const lastKey = useRef(null);

  useEffect(() => {
    const key = location.pathname + location.search;

    // Save the previous page's scroll before leaving it.
    if (lastKey.current && lastKey.current !== key) {
      if (window.scrollY > 0) saveScroll(lastKey.current, window.scrollY);
    }

    // Restore (or go to top) for the current page.
    restoreScroll(key, 0);

    lastKey.current = key;
  }, [location.pathname, location.search]);

  return null;
}
