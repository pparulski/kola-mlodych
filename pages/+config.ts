
import vikeReact from 'vike-react/config'
import type { Config } from 'vike/types'

// Default configs (can be overridden by pages)
export default {
  // Use vike-react
  extends: [vikeReact],
  
  // Default <title>
  title: 'Koordynacja młodzieżowa OZZ Inicjatywa Pracownicza',
  
  // Default <meta name="description">
  description: 'Oficjalna strona struktur młodzieżowych OZZ Inicjatywa Pracownicza.',
  
  // Default favicon
  favicon: '/lovable-uploads/a69f462f-ae71-40a5-a60a-babfda61840e.png'
} satisfies Config
