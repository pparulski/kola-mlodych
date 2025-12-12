import { Editor } from '@hugerte/hugerte-react';

// Import core types needed
import type { HugeRTE, Editor as HugeRTEEditor } from 'hugerte';

import { galleryPlugin } from '@/components/gallery/GalleryPlugin';
import { socialMediaPlugin } from '@/components/editor/SocialMediaPlugin';
import { imageUploadHandler } from '@/components/gallery/ImageUploadHandler';

// Type for the core options object
type CoreEditorOptions = Parameters<HugeRTE['init']>[0];

// Define the type for the init prop ACCEPTED by this component.
// It's based on the core options but OMITS the forbidden keys.
type RichTextEditorInitProps = Omit<CoreEditorOptions, 'selector' | 'target' | 'readonly'>;

interface RichTextEditorProps {
  value: string;
  onEditorChange: (content: string) => void;
  // Use the OMITTED type for the prop definition
  init?: RichTextEditorInitProps;
  height?: number;
  menubar?: boolean;
}

// Define defaults - OK if this includes forbidden keys for now,
// as they will be omitted before passing to the component prop.
// Using the core type here is fine for defining the defaults.
const defaultInitOptions: CoreEditorOptions = {
  plugins: [
    'accordion', 'advlist', 'autosave', 'directionality', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'help', 'wordcount', 'quickbars', 'visualchars', 'emoticons'
  ],
  toolbar: 'undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify | ' +
      'bullist numlist outdent indent | link image | print preview media gallery socialmedia | ' +
      'forecolor backcolor emoticons | help',
  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
  setup: (editor: HugeRTEEditor) => {
    console.log("Setting up HugeRTE editor...");
    try {
      galleryPlugin.init(editor);
      socialMediaPlugin.init(editor);
      console.log("Gallery and social media plugins initialized successfully.");

      editor.on('PreInit', () => { // Or 'BeforeSetContent' or 'LoadContent' might also be relevant
        console.log("HugeRTE PreInit: Adding iframe node filter.");
        editor.parser.addNodeFilter('iframe', nodes => {
          console.log(`Found ${nodes.length} iframe(s) in content.`);
          nodes.forEach((node, index) => {
            const existingSandbox = node.attr('sandbox') || '';
            const sandboxTokens = new Set(existingSandbox.split(/\s+/).filter(Boolean));
            
            // Add ALL required sandbox permissions for zrzutka widget
            sandboxTokens.add('allow-scripts');
            sandboxTokens.add('allow-popups');
            sandboxTokens.add('allow-popups-to-escape-sandbox');
            // 'allow-same-origin' is powerful. Only add if zrzutka.pl widget *truly* needs it
            // and you understand the implications. For just opening popups, it's usually not required.
            // Let's keep it for now if zrzutka needs it to function beyond just popups.
            sandboxTokens.add('allow-same-origin'); 
            // Consider if other permissions are needed by zrzutka, e.g., allow-forms
            // sandboxTokens.add('allow-forms'); 

            const newSandboxValue = Array.from(sandboxTokens).join(' ');
            console.log(`Iframe ${index} original sandbox: "${existingSandbox}", new sandbox: "${newSandboxValue}"`);
            node.attr('sandbox', newSandboxValue);

            // --- Also ensure 'allow' attribute is correctly set for payment/fullscreen ---
            const existingAllow = node.attr('allow') || '';
            const allowTokens = new Set(existingAllow.split(/;\s*/).filter(Boolean));
            allowTokens.add('fullscreen');
            allowTokens.add('payment');
            // allowTokens.add('clipboard-write'); // If needed
            
            const newAllowValue = Array.from(allowTokens).join('; ');
            console.log(`Iframe ${index} original allow: "${existingAllow}", new allow: "${newAllowValue}"`);
            node.attr('allow', newAllowValue);

            if (!node.attr('allowfullscreen')) {
              node.attr('allowfullscreen', 'true');
            }
            if (!node.attr('referrerpolicy')) {
              node.attr('referrerpolicy', 'no-referrer-when-downgrade');
            }
          });
        });
      });
    } catch (pluginError) {
      console.error("Error initializing gallery plugin or iframe filter:", pluginError);
    }
  },
  // Add our custom image upload handler that will use compression
  images_upload_handler: imageUploadHandler,
  automatic_uploads: true,
  file_picker_types: 'image',
  // Configuration for image tools
  image_advtab: true,
  image_dimensions: false, // Don't let users specify dimensions
  height: 450,
  menubar: true,
  // Preserve important iframe attributes when saving content
  extended_valid_elements:
    'iframe[src|width|height|name|title|allowfullscreen|sandbox|allow|referrerpolicy|frameborder|scrolling|style]'
};

export function RichTextEditor({
  value,
  onEditorChange,
  init: initProp = {},
  height,
  menubar,
}: RichTextEditorProps) {

  // Merge options - start with defaults
  const mergedOptions = {
    ...defaultInitOptions,
    ...initProp, // User-provided init options override defaults
    ...(height !== undefined && { height }), // Specific props override again
    ...(menubar !== undefined && { menubar }),
  };

  const finalInitOptions: CoreEditorOptions = mergedOptions;

  console.log("Final Init Options Passed to Editor:", JSON.stringify(finalInitOptions));

  return (
    <Editor
      value={value}
      onEditorChange={onEditorChange}
      init={finalInitOptions as RichTextEditorInitProps}
    />
  );
}
