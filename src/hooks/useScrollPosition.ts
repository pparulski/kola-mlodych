
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
    let lastDirection = 'none';

    const updateScrollPosition = () => {
      const currentScrollY = window.scrollY;
      // Detect direction with a small threshold to avoid micro-movements triggering direction change
      let direction = currentScrollY > lastScrollY + 2 ? 'down' : 
                     currentScrollY < lastScrollY - 2 ? 'up' : lastDirection;

      // Store the current direction for next comparison
      lastDirection = direction;

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
        window.requestAnimationFrame(() => {
          updateScrollPosition();
        });
        ticking = true;
      }
    };

    // Initial position
    updateScrollPosition();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return scrollPosition;
}
