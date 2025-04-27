
import { useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { GalleryView } from './GalleryView';

export function GalleryInitializer() {
  // Store roots to unmount them on cleanup
  const rootsRef = useRef<Map<Element, Root>>(new Map());

  useEffect(() => {
    const initializeGallery = (placeholder: Element) => {
      // Prevent double initialization if somehow called again for the same element
      if (rootsRef.current.has(placeholder) || (placeholder as any)._reactRootContainer) {
          // console.log('Gallery placeholder already initialized, skipping.');
          return;
      }

      const wrapper = placeholder.closest('.gallery-wrapper');
      if (!wrapper) {
          console.error('Could not find parent .gallery-wrapper for placeholder', placeholder);
          return;
      }

      const galleryId = wrapper.getAttribute('data-gallery-id');
      // Find data component relative to the wrapper
      const galleryComponent = document.querySelector(`.gallery-component[data-id="${galleryId}"]`);

      if (!galleryId || !galleryComponent) {
          console.error(`Missing data for gallery initialization. ID: ${galleryId}`, placeholder);
          return;
      }

      console.log(`Initializing gallery ${galleryId}`);

      try {
        const dataElement = galleryComponent.querySelector('.gallery-data');
        if (dataElement) {
          const imagesData = JSON.parse(dataElement.getAttribute('data-images') || '[]');
          const root = createRoot(placeholder as HTMLElement);
          // Store the root
          rootsRef.current.set(placeholder, root);
          root.render(<GalleryView images={imagesData} />);
          console.log(`Successfully rendered gallery ${galleryId}`);
        } else {
          console.error(`Gallery data element not found for gallery ${galleryId}`);
        }
      } catch (error) {
        console.error(`Error initializing gallery ${galleryId}:`, error);
      }
    };

    // Find initially present galleries
    document.querySelectorAll('.gallery-placeholder').forEach(initializeGallery);

    // Observe the document body (or a closer common ancestor) for added nodes
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            // Check if the added node itself is a placeholder
            if (node instanceof Element && node.matches('.gallery-placeholder')) {
              initializeGallery(node);
            }
            // Check if the added node *contains* placeholders (e.g., loading a chunk of HTML)
            else if (node instanceof Element) {
              node.querySelectorAll('.gallery-placeholder').forEach(initializeGallery);
            }
          });
          // Optional: Handle removedNodes if you need to unmount/cleanup roots
          // mutation.removedNodes.forEach(node => { ... });
        }
      }
    });

    // Start observing the document body for additions/removals in the subtree
    observer.observe(document.body, { childList: true, subtree: true });

    // Scroll fix (keep this if needed, maybe adjust timing slightly)
    const ensureGalleryVisibleFromTop = () => {
        const path = window.location.pathname;
        if (path.startsWith('/news/') && window.scrollY > 0) { // Only scroll if not already at top
             // Check if any gallery wrappers exist before scrolling
             if(document.querySelector('.gallery-wrapper')) {
                console.log("Scrolling to top for news article gallery view");
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Use smooth scrolling
             }
        }
    };
     // Run scroll check once after initial setup
     setTimeout(ensureGalleryVisibleFromTop, 300);


    // Cleanup function: disconnect observer and unmount roots
    return () => {
      console.log("Scheduling cleanup for GalleryInitializer...");
      observer.disconnect(); // Disconnect observer immediately

      // Create a copy of the roots map before the timeout
      const rootsToUnmount = new Map(rootsRef.current);
      rootsRef.current.clear(); // Clear the ref immediately

      // Schedule the unmounting slightly later
      setTimeout(() => {
          console.log(`Executing deferred unmount for ${rootsToUnmount.size} gallery roots.`);
          rootsToUnmount.forEach((root, element) => {
              try {
                  console.log("Unmounting gallery root for element:", element);
                  root.unmount();
              } catch (unmountError) {
                  console.error("Error during deferred root unmount:", unmountError, "for element:", element);
              }
          });
          console.log("Deferred unmount complete.");
      }, 0); // setTimeout with 0ms delay pushes execution to the next event loop tick
    };
  }, []);

  return null;
}