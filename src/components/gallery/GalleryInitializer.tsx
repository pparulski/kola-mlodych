
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GalleryView } from './GalleryView';

export function GalleryInitializer() {
  useEffect(() => {
    // Function to initialize galleries by properly rendering React components in placeholders
    const initializeGalleries = () => {
      // Find all gallery wrapper elements
      const galleryWrappers = document.querySelectorAll('.gallery-wrapper');
      
      galleryWrappers.forEach(wrapper => {
        const galleryId = wrapper.getAttribute('data-gallery-id');
        const placeholder = wrapper.querySelector('.gallery-placeholder');
        const galleryComponent = document.querySelector(`.gallery-component[data-id="${galleryId}"]`);
        
        if (galleryId && placeholder && galleryComponent) {
          // Create a temporary container to extract gallery images data
          const tempContainer = document.createElement('div');
          tempContainer.innerHTML = galleryComponent.innerHTML;
          
          try {
            // Extract gallery images data from the component
            const dataElement = tempContainer.querySelector('.gallery-data');
            if (dataElement) {
              const imagesData = JSON.parse(dataElement.getAttribute('data-images') || '[]');
              
              // Create a React root in the placeholder and render the Gallery component
              const root = createRoot(placeholder as HTMLElement);
              root.render(<GalleryView images={imagesData} />);
            }
          } catch (error) {
            console.error('Error initializing gallery:', error);
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
