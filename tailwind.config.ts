
import type { Config } from "tailwindcss";
import typography from '@tailwindcss/typography';
import tailwindcssAnimate from 'tailwindcss-animate'; // Try this

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#C53030", // burgundy
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#B02828", // darker burgundy
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#D53F3F", // deep burgundy
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "scale-in": {
          "0%": {
            transform: "scale(0.95)",
            opacity: "0"
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1"
          }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.foreground'),
            maxWidth: '100%', // Keep this for responsiveness
    
            // General line height for prose content - adjust as needed
            // This will apply to <p>, <li>, etc., unless overridden
            lineHeight: '1.5', // Example: default is often 1.6-1.75. '1.5' is tighter.
    
            h1: {
              color: theme('colors.foreground'),
              fontWeight: '700',
              fontSize: '2.25em', // Consider slightly smaller if needed, e.g., '2em'
              marginTop: '0',
              marginBottom: '0.5em', // Reduced from 0.8em
              lineHeight: '1.1',   // Already tight
            },
            h2: {
              color: theme('colors.foreground'),
              fontWeight: '600',
              fontSize: '1.75em', // Consider '1.6em'
              marginTop: '1.2em',  // Reduced from 1.5em
              marginBottom: '0.4em', // Reduced from 0.5em
              lineHeight: '1.2',   // Already fairly tight
            },
            h3: {
              color: theme('colors.foreground'),
              fontWeight: '600',
              fontSize: '1.5em', // Consider '1.35em'
              marginTop: '1em',    // Reduced from 1.5em
              marginBottom: '0.3em', // Reduced from 0.5em
              lineHeight: '1.25',  // Reduced from 1.3
            },
            h4: {
              color: theme('colors.foreground'),
              fontWeight: '600',
              // fontSize: '1.125em', // Default h4 is usually 1.125em or 1.25em
              marginTop: '0.8em',  // Reduced from 1.5em
              marginBottom: '0.25em',// Reduced from 0.5em
              lineHeight: '1.3',   // Reduced from 1.4
            },
            // h5, h6 can be added similarly if used
            p: {
              marginTop: '0.75em', // Reduced from 1em
              marginBottom: '0.75em', // Reduced from 1em
              // lineHeight: '1.5', // Inherits from base or can be set here
            },
            a: {
              color: theme('colors.primary.DEFAULT'),
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            blockquote: {
              fontWeight: '400',
              fontStyle: 'italic',
              color: theme('colors.muted.foreground'),
              borderLeftWidth: '3px', // Slightly thinner border
              borderLeftColor: theme('colors.border'),
              paddingTop: '0.25em',    // Added
              paddingBottom: '0.25em', // Added
              paddingLeft: '0.75rem',  // Reduced from 1rem
              marginTop: '1em',       // Reduced
              marginBottom: '1em',    // Reduced
              marginLeft: 0,
              marginRight: 0,
            },
            hr: {
              borderColor: theme('colors.border'),
              marginTop: '2em',    // Reduced from 3em
              marginBottom: '2em', // Reduced from 3em
            },
            ol: {
              marginTop: '0.8em',     // Reduced from 1.25em
              marginBottom: '0.8em',  // Reduced from 1.25em
              paddingLeft: '1.75em', // Reduced from 1.625em
              li: {
                marginTop: '0.25em',    // Reduced from 0.5em
                marginBottom: '0.25em', // Reduced from 0.5em
                // lineHeight: '1.5', // Inherits or set specifically
              },
              'ol, ul': { // Nested lists
                marginTop: '0.5em',    // Reduced from 0.75em
                marginBottom: '0.5em', // Reduced from 0.75em
              },
            },
            ul: {
              marginTop: '0.8em',     // Reduced from 1.25em
              marginBottom: '0.8em',  // Reduced from 1.25em
              paddingLeft: '1.5em', // Reduced from 1.625em (ul usually has less padding than ol)
              listStyleType: 'disc',
              li: {
                marginTop: '0.25em',    // Reduced from 0.5em
                marginBottom: '0.25em', // Reduced from 0.5em
                // lineHeight: '1.5', // Inherits or set specifically
              },
              'ol, ul': { // Nested lists
                marginTop: '0.5em',    // Reduced from 0.75em
                marginBottom: '0.5em', // Reduced from 0.75em
              },
            },
            table: {
              width: '100%',
              marginTop: '1em',      // Reduced from 1.5em
              marginBottom: '1em',   // Reduced from 1.5em
              borderCollapse: 'collapse',
              borderColor: theme('colors.border'),
              fontSize: theme('fontSize.sm')[0], // Keep or adjust if needed
              // lineHeight: '1.4', // Table content line height
            },
            thead: {
              borderBottomWidth: '1px',
              borderBottomColor: theme('colors.border'),
            },
            'thead th': {
              color: theme('colors.foreground'),
              fontWeight: '600',
              padding: '0.5rem', // Reduced from 0.75rem
              textAlign: 'left',
            },
            'tbody tr': {
              borderBottomWidth: '1px',
              borderBottomColor: theme('colors.border'),
            },
            'tbody td': {
              padding: '0.5rem', // Reduced from 0.75rem
            },
            img: {
              marginTop: '1em',      // Reduced from 1.5em
              marginBottom: '1em',   // Reduced from 1.5em
              borderRadius: theme('borderRadius.md'),
            },
            figure: { // For images with captions
              marginTop: '1.25em',   // Reduced from 2em
              marginBottom: '1.25em',// Reduced from 2em
            },
            'figure img': {
              marginTop: '0',
              marginBottom: '0',
            },
            figcaption: {
              color: theme('colors.muted.foreground'),
              fontSize: '0.8em', // Reduced from 0.875em
              marginTop: '0.25em',// Reduced from 0.5em
              lineHeight: '1.3',  // Tighter line height for captions
              textAlign: 'center',
            },
            code: { // Inline code
              color: theme('colors.foreground'),
              backgroundColor: theme('colors.muted.DEFAULT'),
              padding: '0.15rem 0.3rem', // Slightly reduced padding
              borderRadius: '0.25rem',
              fontSize: '0.85em', // Slightly reduced from 0.875em
              fontWeight: '500',
            },
            pre: { // Code blocks
              backgroundColor: theme('colors.muted.DEFAULT'),
              color: theme('colors.foreground'),
              borderRadius: theme('borderRadius.md'),
              padding: '0.75rem', // Reduced from 1rem
              overflowX: 'auto',
              border: `1px solid ${theme('colors.border')}`,
              fontSize: '0.85em', // Reduced from 0.875em
              lineHeight: '1.5',   // Reduced from 1.7
              marginTop: '1em',      // Reduced from 1.5em
              marginBottom: '1em',   // Reduced from 1.5em
            },
            'pre code': { // Code inside pre, reset some inline code styles
              backgroundColor: 'transparent',
              borderWidth: '0',
              borderRadius: '0',
              padding: '0',
              color: 'inherit',
              fontSize: 'inherit',
              fontWeight: 'inherit',
              lineHeight: 'inherit',
            },
            // You might want to ensure there's no default top margin on the very first element
            // This can sometimes be tricky with prose, but you can try:
            ':first-child': {
              marginTop: '0',
            },
            // And no default bottom margin on the very last
            ':last-child': {
              marginBottom: '0',
            },
          },
        },
        dark: { // Apply similar or specific dark mode tightness adjustments if needed
          css: {
            // If dark mode needs different line heights or margins, define them here.
            // For now, it will inherit the tightened styles from DEFAULT.
            // Example: if you want paragraphs even tighter in dark mode:
            // p: {
            //   lineHeight: '1.45',
            // },
    
            // Ensure inherited colors are still appropriate for dark mode or override
            color: theme('colors.foreground'), // Already defined, just for structure
            hr: {
              borderColor: theme('colors.border'),
            },
            a: {
              color: theme('colors.primary.DEFAULT'),
            },
            blockquote: {
              color: theme('colors.muted.foreground'),
              borderLeftColor: theme('colors.border'),
            },
            code: {
              backgroundColor: theme('colors.muted.DEFAULT'),
            },
            pre: {
              backgroundColor: theme('colors.muted.DEFAULT'),
              border: `1px solid ${theme('colors.border')}`,
            },
            thead: {
              borderBottomColor: theme('colors.border'),
            },
            'thead th': {
              color: theme('colors.foreground'),
            },
            'tbody tr': {
              borderBottomColor: theme('colors.border'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    tailwindcssAnimate,
    typography(),
  ],
} satisfies Config;
