
import { useState, useEffect } from 'react';

interface ScrollPosition {
  scrollY: number;
  direction: 'up' | 'down' | 'none';
  isScrollingDown: boolean;
}

export function useScrollPosition(): ScrollPosition {
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
    scrollY: 0,
    direction: 'none',
    isScrollingDown: false
  });

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollPosition = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY ? 'down' : 
                         currentScrollY < lastScrollY ? 'up' : 'none';

      setScrollPosition({
        scrollY: currentScrollY,
        direction,
        isScrollingDown: direction === 'down'
      });
      
      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        // Use requestAnimationFrame to throttle event handling
        window.requestAnimationFrame(() => {
          updateScrollPosition();
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return scrollPosition;
}
