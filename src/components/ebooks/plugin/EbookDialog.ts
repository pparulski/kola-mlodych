
import type { Editor as HugeRTEEditor } from 'hugerte';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createEbookShortcode } from './EbookShortcode';

// Function to insert ebook shortcode into editor
export function insertEbook(editor: HugeRTEEditor, ebookId: string) {
  const shortcode = createEbookShortcode(ebookId);
  editor.insertContent(shortcode);
  toast.success('Ebook inserted');
}

// Function to open ebook selection dialog
export async function openEbookSelectionDialog(editor: HugeRTEEditor) {
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

    // Create dialog element
    const dialog = document.createElement('div');
    dialog.className = 'ebook-selection-dialog';
    dialog.style.position = 'fixed';
    dialog.style.top = '50%';
    dialog.style.left = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.zIndex = '9999';
    dialog.style.backgroundColor = 'white';
    dialog.style.borderRadius = '8px';
    dialog.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    dialog.style.padding = '16px';
    dialog.style.maxWidth = '600px';
    dialog.style.width = '100%';
    dialog.style.maxHeight = '400px';
    dialog.style.overflowY = 'auto';

    // Create dialog overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '9998';

    // Close dialog when clicking on overlay
    overlay.addEventListener('click', () => {
      document.body.removeChild(dialog);
      document.body.removeChild(overlay);
    });

    // Create dialog content
    dialog.innerHTML = `
      <style>
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

    // Add dialog to document
    document.body.appendChild(overlay);
    document.body.appendChild(dialog);

    // Add click handlers for ebook selection
    const ebookItems = dialog.querySelectorAll('.ebook-item');
    ebookItems.forEach(item => {
      item.addEventListener('click', () => {
        const ebookId = item.getAttribute('data-ebook-id');
        if (ebookId) {
          insertEbook(editor, ebookId);
          document.body.removeChild(dialog);
          document.body.removeChild(overlay);
        }
      });
    });
  } catch (err) {
    console.error('Error in ebook selection dialog:', err);
    toast.error('An error occurred while loading ebooks');
  }
}
