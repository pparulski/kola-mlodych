
import { useState, useEffect } from 'react';

export function useScrollAway(threshold = 10) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine if we should show or hide based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > threshold) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up or at the top
        setIsVisible(true);
      }
      
      // Update the last scroll position
      setLastScrollY(currentScrollY);
    };

    // Add event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, threshold]);

  return isVisible;
}
