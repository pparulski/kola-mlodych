
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
          if (!galleryId) console.error('Missing gallery ID');
          if (!placeholder) console.error('Missing placeholder');
          if (!galleryComponent) console.error('Missing gallery component');
        }
      });
    };

    // Run initialization at different intervals to handle various rendering scenarios
    setTimeout(initializeGalleries, 100); // Initial run
    setTimeout(initializeGalleries, 500); // Short delay for async rendering
    setTimeout(initializeGalleries, 1500); // Longer delay for slow connections
    
    // Also run initialization when images load, which might change layout
    const handleImageLoad = () => {
      setTimeout(initializeGalleries, 50);
    };
    
    window.addEventListener('load', handleImageLoad);
    
    // Fix for gallery position when viewing full article
    const ensureGalleryVisibleFromTop = () => {
      const galleryWrappers = document.querySelectorAll('.gallery-wrapper');
      if (galleryWrappers.length > 0) {
        // Make sure we're on a page that needs scrolling to top
        const path = window.location.pathname;
        if (path.startsWith('/news/')) {
          window.scrollTo(0, 0);
        }
      }
    };
    
    // Run this after galleries are initialized
    setTimeout(ensureGalleryVisibleFromTop, 200);
    setTimeout(ensureGalleryVisibleFromTop, 1000);
    
    return () => {
      window.removeEventListener('load', handleImageLoad);
    };
  }, []);

  return null;
}
