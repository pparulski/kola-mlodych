
// Styles for ebook shortcodes in the editor
export const ebookEditorStyles = `
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
`;

// Custom icon for the ebook button
export const ebookIconSvg = '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18 2h-6v6h-2V2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM4 20V4h6v10l2-1.5 2 1.5V4h6v16H4z" fill="currentColor"/></svg>';
