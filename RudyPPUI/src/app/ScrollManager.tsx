import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * A new page starts at the top, or at its #section when the link names one (e.g. /dashboard#journal).
 * The router doesn't do this itself in declarative mode. Lives here, not in a layout, because the
 * home page has its own frame.
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}
