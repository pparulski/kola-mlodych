
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GalleryView } from './GalleryView';

export function GalleryInitializer() {
  useEffect(() => {
    // Function to initialize galleries by properly rendering React components in placeholders
    const initializeGalleries = () => {
      // Find all gallery wrapper elements
      const galleryWrappers = document.querySelectorAll('.gallery-wrapper');
      
      if (galleryWrappers.length === 0) {
        console.log("No gallery wrappers found");
        return;
      }
      
      console.log(`Found ${galleryWrappers.length} gallery wrappers`);
      
      galleryWrappers.forEach(wrapper => {
        const galleryId = wrapper.getAttribute('data-gallery-id');
        const placeholder = wrapper.querySelector('.gallery-placeholder');
        const galleryComponent = document.querySelector(`.gallery-component[data-id="${galleryId}"]`);
        
        if (galleryId && placeholder && galleryComponent) {
          console.log(`Initializing gallery ${galleryId}`);
          
          // Check if this placeholder already has a React component
          if ((placeholder as any)._reactRootContainer) {
            console.log(`Gallery ${galleryId} already initialized`);
            return;
          }
          
          try {
            // Extract gallery images data from the component
            const dataElement = galleryComponent.querySelector('.gallery-data');
            if (dataElement) {
              const imagesData = JSON.parse(dataElement.getAttribute('data-images') || '[]');
              
              // Create a React root in the placeholder and render the Gallery component
              const root = createRoot(placeholder as HTMLElement);
              root.render(<GalleryView images={imagesData} />);
              console.log(`Successfully rendered gallery ${galleryId}`);
            } else {
              console.error(`Gallery data element not found for gallery ${galleryId}`);
            }
          } catch (error) {
            console.error('Error initializing gallery:', error);
          }
        } else {
          console.error(`Missing required elements for gallery ${galleryId}`);
          if (!galleryId) console.error('Missing gallery ID');
          if (!placeholder) console.error('Missing placeholder');
          if (!galleryComponent) console.error('Missing gallery component');
        }
      });
    };

    // Run initialization after DOM is loaded
    setTimeout(initializeGalleries, 100);
    
    // Also run again after a delay to catch any async rendering
    setTimeout(initializeGalleries, 500);
    
    // Run one more time after a longer delay for slow connections
    setTimeout(initializeGalleries, 1500);
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  return null;
}
