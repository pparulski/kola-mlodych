
// Styles for file shortcodes in the editor
export const fileEditorStyles = `
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
`;

// Custom icon for the file button
export const fileIconSvg = '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14v-4H8l4-4 4 4h-3v4h-2z" fill="currentColor"/></svg>';
