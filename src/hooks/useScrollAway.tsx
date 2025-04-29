
import { useState, useEffect } from 'react';

export function useScrollAway(threshold = 10) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Only change visibility state if we've scrolled past the threshold
      if (Math.abs(currentScrollY - lastScrollY) > 5) {
        if (currentScrollY > lastScrollY && currentScrollY > threshold) {
          // Scrolling down - hide the header
          setIsVisible(false);
        } else if (currentScrollY < lastScrollY) {
          // Scrolling up - show the header
          setIsVisible(true);
        }
      }
      
      // Always show header when at the top of the page
      if (currentScrollY <= threshold) {
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
