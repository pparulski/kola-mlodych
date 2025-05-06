
import type { Editor as HugeRTEEditor } from 'hugerte';
import { openEbookSelectionDialog } from './EbookDialog';
import { EBOOK_SHORTCODE_PATTERN } from './EbookShortcode';
import { ebookEditorStyles, ebookIconSvg } from './EbookStyles';

export const ebookPlugin = {
  init: (editor: HugeRTEEditor) => {
    // Register the button in the editor toolbar
    editor.ui.registry.addButton('ebook', {
      icon: 'book',
      tooltip: 'Insert ebook',
      onAction: () => {
        // Open ebook selection dialog
        openEbookSelectionDialog(editor);
      }
    });

    // Register a custom icon for ebooks
    editor.ui.registry.addIcon('ebook', ebookIconSvg);
    
    // Register custom formatter for ebook shortcodes
    editor.formatter.register('ebookShortcode', {
      inline: 'span',
      classes: 'ebook-shortcode-preview',
      attributes: {
        'data-mce-decoration': 'ebook-shortcode'
      }
    });

    // Add a nodeFilter to convert shortcodes to decorations
    editor.on('SetContent', (e) => {
      const content = editor.getContent();
      const updatedContent = content.replace(EBOOK_SHORTCODE_PATTERN, (match, ebookId) => {
        return `<span class="ebook-shortcode-preview" data-mce-decoration="ebook-shortcode" data-ebook-id="${ebookId}">📚 Ebook</span>`;
      });
      if (content !== updatedContent) {
        editor.setContent(updatedContent);
      }
    });

    // Add custom CSS to style ebook shortcodes in the editor
    editor.dom.addStyle(ebookEditorStyles);

    console.log('Ebook plugin initialized');
  }
};
