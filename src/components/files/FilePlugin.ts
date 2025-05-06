
import type { Editor as HugeRTEEditor } from 'hugerte';
import { supabase } from '@/integrations/supabase/client';
import { Dialog } from '@/components/ui/dialog';
import { toast } from 'sonner';

// Define the file shortcode pattern
const FILE_SHORTCODE_PATTERN = /\[file id="([^"]+)"\]/g;

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

    // Register a custom element to represent files in the editor
    editor.ui.registry.addIcon('file-download', '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14v-4H8l4-4 4 4h-3v4h-2z" fill="currentColor"/></svg>');
    
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
    editor.dom.addStyle(`
      .file-shortcode-preview {
        display: inline-flex;
        align-items: center;
        background-color: #f0f9ff;
        border: 1px solid #bae6fd;
        border-radius: 4px;
        padding: 4px 8px;
        margin: 2px;
        color: #0369a1;
        cursor: pointer;
        white-space: nowrap;
      }
      .file-shortcode-preview::before {
        content: "📄";
        margin-right: 4px;
      }
    `);

    console.log('File plugin initialized');
  }
};

// Function to open file selection dialog
async function openFileSelectionDialog(editor: HugeRTEEditor) {
  try {
    // Fetch files from Supabase
    const { data: files, error } = await supabase
      .from('downloads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files');
      return;
    }

    if (!files || files.length === 0) {
      toast.warning('No files available. Please upload files first.');
      return;
    }

    // Create and open a dialog with file options
    const container = document.createElement('div');
    container.className = 'file-selection-dialog';
    container.innerHTML = `
      <style>
        .file-selection-dialog {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 400px;
          overflow-y: auto;
        }
        .file-item {
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          margin-bottom: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .file-item:hover {
          background-color: #f3f4f6;
        }
        .file-name {
          font-weight: 500;
        }
        .file-date {
          font-size: 0.85em;
          color: #6b7280;
        }
        .dialog-title {
          font-size: 1.25em;
          font-weight: 600;
          margin-bottom: 16px;
        }
      </style>
      <div class="dialog-title">Select a file to insert</div>
      <div class="file-list">
        ${files.map(file => `
          <div class="file-item" data-file-id="${file.id}">
            <span class="file-name">${file.name}</span>
            <span class="file-date">${new Date(file.created_at).toLocaleDateString()}</span>
          </div>
        `).join('')}
      </div>
    `;

    // Add click handlers for file selection
    document.body.appendChild(container);
    const fileItems = container.querySelectorAll('.file-item');
    fileItems.forEach(item => {
      item.addEventListener('click', () => {
        const fileId = item.getAttribute('data-file-id');
        if (fileId) {
          insertFile(editor, fileId);
          document.body.removeChild(container);
        }
      });
    });
  } catch (err) {
    console.error('Error in file selection dialog:', err);
    toast.error('An error occurred while loading files');
  }
}

// Function to insert file shortcode into editor
function insertFile(editor: HugeRTEEditor, fileId: string) {
  const shortcode = `[file id="${fileId}"]`;
  editor.insertContent(shortcode);
  toast.success('File inserted');
}
