
import type { Config } from "tailwindcss";
import typography from '@tailwindcss/typography';

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
          DEFAULT: "#800020", // burgundy
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#4a0012", // darker burgundy
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#590014", // deep burgundy
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
            maxWidth: '100%',
            h1: {
              color: theme('colors.foreground'),
              fontWeight: '700',
              fontSize: '2.25em',
              marginTop: '0',
              marginBottom: '0.8em',
              lineHeight: '1.1',
            },
            h2: {
              color: theme('colors.foreground'),
              fontWeight: '600',
              fontSize: '1.75em',
              marginTop: '1.5em',
              marginBottom: '0.5em',
              lineHeight: '1.2',
            },
            h3: {
              color: theme('colors.foreground'),
              fontWeight: '600',
              fontSize: '1.5em',
              marginTop: '1.5em',
              marginBottom: '0.5em',
              lineHeight: '1.3',
            },
            h4: {
              color: theme('colors.foreground'),
              fontWeight: '600',
              marginTop: '1.5em',
              marginBottom: '0.5em',
              lineHeight: '1.4',
            },
            p: {
              marginTop: '1em',
              marginBottom: '1em',
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
              borderLeftWidth: '4px',
              borderLeftColor: theme('colors.border'),
              paddingLeft: '1rem',
              marginLeft: 0,
              marginRight: 0,
            },
            hr: {
              borderColor: theme('colors.border'),
              marginTop: '3em',
              marginBottom: '3em',
            },
            ol: {
              marginTop: '1.25em',
              marginBottom: '1.25em',
              paddingLeft: '1.625em',
              li: {
                marginTop: '0.5em',
                marginBottom: '0.5em',
              },
              'ol, ul': {
                marginTop: '0.75em',
                marginBottom: '0.75em',
              },
            },
            ul: {
              marginTop: '1.25em',
              marginBottom: '1.25em',
              paddingLeft: '1.625em',
              listStyleType: 'disc',
              li: {
                marginTop: '0.5em',
                marginBottom: '0.5em',
              },
              'ol, ul': {
                marginTop: '0.75em',
                marginBottom: '0.75em',
              },
            },
            table: {
              width: '100%',
              marginTop: '1.5em',
              marginBottom: '1.5em',
              borderCollapse: 'collapse',
              borderColor: theme('colors.border'),
              fontSize: theme('fontSize.sm')[0],
            },
            thead: {
              borderBottomWidth: '1px',
              borderBottomColor: theme('colors.border'),
            },
            'thead th': {
              color: theme('colors.foreground'),
              fontWeight: '600',
              padding: '0.75rem',
              textAlign: 'left',
            },
            'tbody tr': {
              borderBottomWidth: '1px',
              borderBottomColor: theme('colors.border'),
            },
            'tbody td': {
              padding: '0.75rem',
            },
            img: {
              marginTop: '1.5em',
              marginBottom: '1.5em',
              borderRadius: theme('borderRadius.md'),
            },
            figure: {
              marginTop: '2em',
              marginBottom: '2em',
            },
            'figure img': {
              marginTop: '0',
              marginBottom: '0',
            },
            figcaption: {
              color: theme('colors.muted.foreground'),
              fontSize: '0.875em',
              marginTop: '0.5em',
              textAlign: 'center',
            },
            code: {
              color: theme('colors.foreground'),
              backgroundColor: theme('colors.muted.DEFAULT'),
              padding: '0.25rem 0.4rem',
              borderRadius: '0.25rem',
              fontSize: '0.875em',
              fontWeight: '500',
            },
            pre: {
              backgroundColor: theme('colors.muted.DEFAULT'),
              color: theme('colors.foreground'),
              borderRadius: theme('borderRadius.md'),
              padding: '1rem',
              overflowX: 'auto',
              border: `1px solid ${theme('colors.border')}`,
              fontSize: '0.875em',
              lineHeight: '1.7',
              marginTop: '1.5em',
              marginBottom: '1.5em',
            },
            'pre code': {
              backgroundColor: 'transparent',
              borderWidth: '0',
              borderRadius: '0',
              padding: '0',
              color: 'inherit',
              fontSize: 'inherit',
              fontWeight: 'inherit',
              lineHeight: 'inherit',
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.foreground'),
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
    require("tailwindcss-animate"),
    typography(),
  ],
} satisfies Config;
