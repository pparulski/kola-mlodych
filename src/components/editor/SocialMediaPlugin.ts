
import type { Editor as HugeRTEEditor } from 'hugerte';

export const socialMediaPlugin = {
  name: 'socialmedia',
  init: (editor: HugeRTEEditor) => {
    console.log('Initializing Social Media Plugin');
    
    // Add social media button to toolbar
    editor.ui.registry.addButton('socialmedia', {
      icon: 'embed',
      tooltip: 'Embed Social Media Post',
      onAction: () => {
        editor.windowManager.open({
          title: 'Embed Social Media Post',
          body: {
            type: 'panel',
            items: [
              {
                type: 'selectbox',
                name: 'platform',
                label: 'Platform',
                items: [
                  { text: 'Twitter/X', value: 'twitter' },
                  { text: 'Facebook', value: 'facebook' },
                  { text: 'Instagram', value: 'instagram' },
                  { text: 'LinkedIn', value: 'linkedin' },
                  { text: 'YouTube', value: 'youtube' },
                  { text: 'TikTok', value: 'tiktok' }
                ]
              },
              {
                type: 'input',
                name: 'url',
                label: 'Post URL',
                placeholder: 'https://...'
              }
            ]
          },
          buttons: [
            {
              type: 'cancel',
              text: 'Cancel'
            },
            {
              type: 'submit',
              text: 'Embed',
              primary: true
            }
          ],
          onSubmit: (api: any) => {
            const data = api.getData();
            if (data.url && data.platform) {
              console.log('Inserting social embed:', data.platform, data.url);
              // Insert social media embed shortcode
              const embedCode = `[social-embed platform="${data.platform}" url="${data.url}"]`;
              editor.insertContent(embedCode);
            }
            api.close();
          }
        });
      }
    });

    // Convert shortcodes to placeholders in editor
    editor.on('BeforeSetContent', (e: any) => {
      console.log('BeforeSetContent - Original:', e.content.substring(0, 200));
      e.content = e.content.replace(
        /\[social-embed platform="([^"]+)" url="([^"]+)"\]/g,
        '<div class="social-embed-placeholder" data-platform="$1" data-url="$2" contenteditable="false" style="border: 2px dashed #ccc; padding: 20px; margin: 10px 0; text-align: center; background: #f9f9f9; border-radius: 8px;">📱 $1 Post<br><small>$2</small></div>'
      );
      console.log('BeforeSetContent - After conversion:', e.content.substring(0, 200));
    });

    // Convert placeholders back to shortcodes when saving - FIXED REGEX
    editor.on('GetContent', (e: any) => {
      console.log('GetContent - Before conversion:', e.content.substring(0, 200));
      // Updated regex to properly match the actual HTML structure
      e.content = e.content.replace(
        /<div[^>]*class="social-embed-placeholder"[^>]*data-platform="([^"]+)"[^>]*data-url="([^"]+)"[^>]*>[\s\S]*?<\/div>/g,
        '[social-embed platform="$1" url="$2"]'
      );
      console.log('GetContent - After conversion:', e.content.substring(0, 200));
    });
  }
};
