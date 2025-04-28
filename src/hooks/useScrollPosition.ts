
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
    let lastDirection: 'up' | 'down' | 'none' = 'none';

    const updateScrollPosition = () => {
      const currentScrollY = window.scrollY;
      
      // Almost no threshold for immediate direction detection
      const direction: 'up' | 'down' | 'none' = 
        currentScrollY > lastScrollY ? 'down' : 
        currentScrollY < lastScrollY ? 'up' : 
        lastDirection;
      
      // Set isScrollingDown based on both direction and a minimum movement to prevent flickering
      const isScrollingDown = direction === 'down';

      // Store the current direction for next comparison
      lastDirection = direction;

      setScrollPosition({
        scrollY: currentScrollY,
        direction,
        isScrollingDown
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
