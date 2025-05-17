// src/hooks/useScrollDirection.ts
import React, { useState, useEffect, useRef } from 'react';

// --- Global flag for pausing (consider React Context for larger apps) ---
// Ensure this part is at the top level of the module, outside the hook function
let isScrollDirectionGloballyPaused = false;

export const pauseGlobalScrollDirection = () => {
  isScrollDirectionGloballyPaused = true;
  // console.log("Scroll direction PAUSED");
};

export const resumeGlobalScrollDirection = () => {
  isScrollDirectionGloballyPaused = false;
  // console.log("Scroll direction RESUMED");
};
// --- End global flag ---

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    // Initialize lastScrollYRef.current correctly on mount and when the pause state might change
    // though it's mainly set within updateScrollDirection.
    lastScrollYRef.current = window.pageYOffset;

    const scrollThreshold = 10; 

    const updateScrollDirection = () => {
      // If globally paused, still update lastScrollYRef to prevent jumps when resumed, but don't set direction
      if (isScrollDirectionGloballyPaused) {
        lastScrollYRef.current = window.pageYOffset > 0 ? window.pageYOffset : 0;
        return;
      }

      const scrollY = window.pageYOffset;
      const currentDirection = scrollY > lastScrollYRef.current ? "down" : "up";
      
      if (currentDirection !== scrollDirection &&
          Math.abs(scrollY - lastScrollYRef.current) > scrollThreshold) {
        setScrollDirection(currentDirection);
      }
      lastScrollYRef.current = scrollY > 0 ? scrollY : 0;
    };

    window.addEventListener("scroll", updateScrollDirection, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateScrollDirection);
    };
  }, [scrollDirection]); // scrollDirection is the dependency that triggers re-evaluation of canScroll etc.

  return scrollDirection;
}