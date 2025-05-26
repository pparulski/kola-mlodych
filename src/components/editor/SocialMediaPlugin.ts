
import type { Editor as HugeRTEEditor } from 'hugerte';

interface SocialMediaEmbedConfig {
  type: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok';
  url: string;
}

export const socialMediaPlugin = {
  name: 'socialmedia',
  init: (editor: HugeRTEEditor) => {
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
      e.content = e.content.replace(
        /\[social-embed platform="([^"]+)" url="([^"]+)"\]/g,
        '<div class="social-embed-placeholder" data-platform="$1" data-url="$2" contenteditable="false" style="border: 2px dashed #ccc; padding: 20px; margin: 10px 0; text-align: center; background: #f9f9f9; border-radius: 8px;">📱 $1 Post<br><small>$2</small></div>'
      );
    });

    // Convert placeholders back to shortcodes when saving
    editor.on('GetContent', (e: any) => {
      e.content = e.content.replace(
        /<div class="social-embed-placeholder" data-platform="([^"]+)" data-url="([^"]+)"[^>]*>[\s\S]*?<\/div>/g,
        '[social-embed platform="$1" url="$2"]'
      );
    });
  }
};
