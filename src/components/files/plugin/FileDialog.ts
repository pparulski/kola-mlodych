
import type { Editor as HugeRTEEditor } from 'hugerte';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createFileShortcode } from './FileShortcode';

// Function to open file selection dialog
export async function openFileSelectionDialog(editor: HugeRTEEditor) {
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

    // Create dialog element
    const dialog = document.createElement('div');
    dialog.className = 'file-selection-dialog';
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

    // Add dialog to document
    document.body.appendChild(overlay);
    document.body.appendChild(dialog);

    // Add click handlers for file selection
    const fileItems = dialog.querySelectorAll('.file-item');
    fileItems.forEach(item => {
      item.addEventListener('click', () => {
        const fileId = item.getAttribute('data-file-id');
        if (fileId) {
          insertFile(editor, fileId);
          document.body.removeChild(dialog);
          document.body.removeChild(overlay);
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
  const shortcode = createFileShortcode(fileId);
  editor.insertContent(shortcode);
  toast.success('File inserted');
}
