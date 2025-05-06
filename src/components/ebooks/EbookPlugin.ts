
import type { Editor as HugeRTEEditor } from 'hugerte';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define the ebook shortcode pattern
const EBOOK_SHORTCODE_PATTERN = /\[ebook id="([^"]+)"\]/g;

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

    // Register a custom element to represent ebooks in the editor
    editor.ui.registry.addIcon('ebook', '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18 2h-6v6h-2V2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM4 20V4h6v10l2-1.5 2 1.5V4h6v16H4z" fill="currentColor"/></svg>');
    
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
    editor.dom.addStyle(`
      .ebook-shortcode-preview {
        display: inline-flex;
        align-items: center;
        background-color: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 4px;
        padding: 4px 8px;
        margin: 2px;
        color: #16a34a;
        cursor: pointer;
        white-space: nowrap;
      }
      .ebook-shortcode-preview::before {
        content: "📚";
        margin-right: 4px;
      }
    `);

    console.log('Ebook plugin initialized');
  }
};

// Function to open ebook selection dialog
async function openEbookSelectionDialog(editor: HugeRTEEditor) {
  try {
    // Fetch ebooks from Supabase
    const { data: ebooks, error } = await supabase
      .from('ebooks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ebooks:', error);
      toast.error('Failed to load ebooks');
      return;
    }

    if (!ebooks || ebooks.length === 0) {
      toast.warning('No ebooks available. Please upload ebooks first.');
      return;
    }

    // Create and open a dialog with ebook options
    const container = document.createElement('div');
    container.className = 'ebook-selection-dialog';
    container.innerHTML = `
      <style>
        .ebook-selection-dialog {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 400px;
          overflow-y: auto;
        }
        .ebook-item {
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ebook-item:hover {
          background-color: #f3f4f6;
        }
        .ebook-thumb {
          width: 40px;
          height: 60px;
          object-fit: cover;
          border-radius: 2px;
          background-color: #f3f4f6;
        }
        .ebook-details {
          flex: 1;
        }
        .ebook-title {
          font-weight: 500;
        }
        .ebook-year {
          font-size: 0.85em;
          color: #6b7280;
        }
        .dialog-title {
          font-size: 1.25em;
          font-weight: 600;
          margin-bottom: 16px;
        }
      </style>
      <div class="dialog-title">Select an ebook to insert</div>
      <div class="ebook-list">
        ${ebooks.map(ebook => `
          <div class="ebook-item" data-ebook-id="${ebook.id}">
            <img src="${ebook.cover_url || ''}" class="ebook-thumb" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'40\\' height=\\'60\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'%23cccccc\\' stroke-width=\\'2\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\'%3E%3Cpath d=\\'M4 19.5A2.5 2.5 0 0 1 6.5 17H20\\' /%3E%3Cpath d=\\'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z\\' /%3E%3C/svg%3E'">
            <div class="ebook-details">
              <div class="ebook-title">${ebook.title}</div>
              ${ebook.publication_year ? `<div class="ebook-year">Rok: ${ebook.publication_year}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Add click handlers for ebook selection
    document.body.appendChild(container);
    const ebookItems = container.querySelectorAll('.ebook-item');
    ebookItems.forEach(item => {
      item.addEventListener('click', () => {
        const ebookId = item.getAttribute('data-ebook-id');
        if (ebookId) {
          insertEbook(editor, ebookId);
          document.body.removeChild(container);
        }
      });
    });
  } catch (err) {
    console.error('Error in ebook selection dialog:', err);
    toast.error('An error occurred while loading ebooks');
  }
}

// Function to insert ebook shortcode into editor
function insertEbook(editor: HugeRTEEditor, ebookId: string) {
  const shortcode = `[ebook id="${ebookId}"]`;
  editor.insertContent(shortcode);
  toast.success('Ebook inserted');
}
