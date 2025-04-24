
import { useEffect } from 'react';

export function GalleryInitializer() {
  useEffect(() => {
    // Function to initialize galleries by inserting gallery components into placeholders
    const initializeGalleries = () => {
      const galleryWrappers = document.querySelectorAll('.gallery-wrapper');
      const galleryComponents = document.querySelectorAll('.gallery-component');
      
      galleryWrappers.forEach(wrapper => {
        const galleryId = wrapper.getAttribute('data-gallery-id');
        const placeholder = wrapper.querySelector('.gallery-placeholder');
        
        if (galleryId && placeholder) {
          const component = document.querySelector(`.gallery-component[data-id="${galleryId}"]`);
          
          if (component && placeholder) {
            placeholder.innerHTML = component.innerHTML;
          }
        }
      });
    };

    // Run initialization after DOM is loaded
    setTimeout(initializeGalleries, 100);
    
    // Also run again after a delay to catch any async rendering
    setTimeout(initializeGalleries, 500);
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  return null;
}
