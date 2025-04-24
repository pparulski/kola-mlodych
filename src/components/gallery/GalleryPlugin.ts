
export const galleryPlugin = {
  name: 'gallery',
  init: (editor: any) => {
    editor.ui.registry.addButton('gallery', {
      icon: 'gallery',
      tooltip: 'Insert Gallery',
      onAction: () => {
        editor.windowManager.open({
          title: 'Insert Gallery',
          body: {
            type: 'panel',
            items: [
              {
                type: 'input',
                name: 'galleryId',
                label: 'Gallery ID'
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
