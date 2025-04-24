
import { supabase } from "@/integrations/supabase/client";

interface TinyMCEEditor {
  ui: {
    registry: {
      addButton: (name: string, config: any) => void;
    };
  };
  windowManager: {
    open: (config: any) => void;
  };
  insertContent: (content: string) => void;
  on: (event: string, callback: (e: any) => void) => void;
}

interface GalleryWithImages {
  id: string;
  title: string;
  gallery_images: {
    id: string;
    url: string;
    caption: string | null;
  }[];
}

export const galleryPlugin = {
  name: 'gallery',
  init: (editor: TinyMCEEditor) => {
    editor.ui.registry.addButton('gallery', {
      icon: 'gallery',
      tooltip: 'Insert Gallery',
      onAction: async () => {
        // Fetch available galleries
        const { data: galleries, error } = await supabase
          .from('article_galleries')
          .select('id, title, gallery_images(id, url, caption)')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching galleries:', error);
          editor.windowManager.open({
            title: 'Error',
            body: {
              type: 'panel',
              items: [{
                type: 'htmlpanel',
                html: '<p>Could not load galleries. Please try again.</p>'
              }]
            },
            buttons: [{ type: 'cancel', text: 'Close' }]
          });
          return;
        }

        editor.windowManager.open({
          title: 'Insert Gallery',
          body: {
            type: 'panel',
            items: [
              {
                type: 'selectbox',
                name: 'galleryId',
                label: 'Select Gallery',
                items: galleries.map((gallery: GalleryWithImages) => ({
                  text: `${gallery.title} (${gallery.gallery_images?.length || 0} images)`,
                  value: gallery.id
                }))
              }
            ]
          },
          buttons: [
            {
              type: 'cancel',
              text: 'Close'
            },
            {
              type: 'submit',
              text: 'Insert',
              primary: true
            }
          ],
          onSubmit: (api: any) => {
            const data = api.getData();
            editor.insertContent(`[gallery id="${data.galleryId}"]`);
            api.close();
          }
        });
      }
    });

    editor.on('BeforeSetContent', (e: any) => {
      e.content = e.content.replace(/\[gallery id="([^"]+)"\]/g, 
        '<div class="gallery-placeholder" data-gallery-id="$1">[Gallery: $1]</div>'
      );
    });

    editor.on('GetContent', (e: any) => {
      e.content = e.content.replace(
        /<div class="gallery-placeholder" data-gallery-id="([^"]+)">[^\]]+\]<\/div>/g,
        '[gallery id="$1"]'
      );
    });
  }
};
