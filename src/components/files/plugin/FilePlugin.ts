
import type { Editor as HugeRTEEditor } from 'hugerte';
import { openFileSelectionDialog } from './FileDialog';
import { FILE_SHORTCODE_PATTERN } from './FileShortcode';
import { fileEditorStyles, fileIconSvg } from './FileStyles';

export const filePlugin = {
  init: (editor: HugeRTEEditor) => {
    // Register the button in the editor toolbar
    editor.ui.registry.addButton('file', {
      icon: 'document',
      tooltip: 'Insert file download',
      onAction: () => {
        // Open file selection dialog
        openFileSelectionDialog(editor);
      }
    });

    // Register a custom icon
    editor.ui.registry.addIcon('file-download', fileIconSvg);
    
    // Register custom formatter for file shortcodes
    editor.formatter.register('fileShortcode', {
      inline: 'span',
      classes: 'file-shortcode-preview',
      attributes: {
        'data-mce-decoration': 'file-shortcode'
      }
    });

    // Add a nodeFilter to convert shortcodes to decorations
    editor.on('SetContent', (e) => {
      const content = editor.getContent();
      const updatedContent = content.replace(FILE_SHORTCODE_PATTERN, (match, fileId) => {
        return `<span class="file-shortcode-preview" data-mce-decoration="file-shortcode" data-file-id="${fileId}">📄 File Download</span>`;
      });
      if (content !== updatedContent) {
        editor.setContent(updatedContent);
      }
    });

    // Add custom CSS to style file shortcodes in the editor
    editor.dom.addStyle(fileEditorStyles);

    console.log('File plugin initialized');
  }
};
