
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// List of known crawler user agents
const crawlerUserAgents = [
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegrambot',
  'skypeuripreview',
  'slackbot',
  'discordbot',
  'googlebot',
  'bingbot',
  'yandexbot',
  'baiduspider',
  'applebot',
  'redditbot',
  'pinterest',
  'tumblr',
  'vkshare',
  'okru',
  'viber',
  'line',
  'kakaotalk',
  'wechat',
  'messenger'
];

function isCrawler(userAgent: string): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return crawlerUserAgents.some(crawler => ua.includes(crawler));
}

function stripHtmlAndDecodeEntities(html: string): string {
  if (!html) return '';
  
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, ' ');
  
  // Decode common HTML entities
  const entities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&nbsp;': ' ',
    '&#39;': "'",
    '&hellip;': '...',
    '&mdash;': '—',
    '&ndash;': '–',
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&lsquo;': "'",
    '&rsquo;': "'"
  };
  
  for (const [entity, replacement] of Object.entries(entities)) {
    text = text.replace(new RegExp(entity, 'g'), replacement);
  }
  
  // Clean up extra whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

function generateDescription(content?: string): string {
  if (!content) return 'Oficjalna strona struktur młodzieżowych OZZ Inicjatywa Pracownicza.';
  
  const plainText = stripHtmlAndDecodeEntities(content);
  
  if (plainText.length > 160) {
    return `${plainText.substring(0, 157)}...`;
  }
  
  return plainText;
}

async function getNewsArticle(slug: string) {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getStaticPage(slug: string) {
  const { data, error } = await supabase
    .from('static_pages')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getCategory(slug: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

function generateMetaTags(data: {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: 'website' | 'article';
  publishedAt?: string;
  modifiedAt?: string;
}): string {
  const baseUrl = 'https://mlodzi.ozzip.pl';
  const fullImageUrl = data.image && !data.image.startsWith('http') ? `${baseUrl}${data.image}` : data.image;
  const fullUrl = `${baseUrl}${data.url}`;
  
  return `
    <meta name="description" content="${data.description}" />
    <meta property="og:title" content="${data.title}" />
    <meta property="og:description" content="${data.description}" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:type" content="${data.type || 'website'}" />
    <meta property="og:site_name" content="Koła Młodych OZZ IP" />
    <meta property="og:locale" content="pl" />
    ${fullImageUrl ? `
    <meta property="og:image" content="${fullImageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${data.title}" />` : ''}
    ${data.publishedAt ? `<meta property="article:published_time" content="${data.publishedAt}" />` : ''}
    ${data.modifiedAt ? `<meta property="article:modified_time" content="${data.modifiedAt}" />` : ''}
    <meta name="twitter:card" content="${fullImageUrl ? 'summary_large_image' : 'summary'}" />
    <meta name="twitter:title" content="${data.title}" />
    <meta name="twitter:description" content="${data.description}" />
    ${fullImageUrl ? `<meta name="twitter:image" content="${fullImageUrl}" />` : ''}
    <link rel="canonical" href="${fullUrl}" />
  `;
}

function generatePrerenderedHTML(data: {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: 'website' | 'article';
  publishedAt?: string;
  modifiedAt?: string;
}): string {
  const metaTags = generateMetaTags(data);
  
  return `<!DOCTYPE html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/lovable-uploads/a69f462f-ae71-40a5-a60a-babfda61840e.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="robots" content="index, follow" />
    <title>${data.title}</title>
    ${metaTags}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const userAgent = req.headers.get('user-agent') || '';
    const url = new URL(req.url);
    const path = url.pathname;
    
    console.log('Crawler handler - Path:', path, 'User-Agent:', userAgent);
    
    // If not a crawler, return a redirect to the main app
    if (!isCrawler(userAgent)) {
      console.log('Not a crawler, redirecting to main app');
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `https://mlodzi.ozzip.pl${path}`,
          ...corsHeaders
        }
      });
    }
    
    console.log('Crawler detected, generating pre-rendered HTML');
    
    let pageData: {
      title: string;
      description: string;
      image?: string;
      url: string;
      type?: 'website' | 'article';
      publishedAt?: string;
      modifiedAt?: string;
    };

    // Handle different route types
    if (path === '/' || path === '') {
      // Homepage
      pageData = {
        title: 'Koordynacja młodzieżowa OZZ Inicjatywa Pracownicza',
        description: 'Oficjalna strona struktur młodzieżowych OZZ Inicjatywa Pracownicza.',
        url: '/',
        image: '/lovable-uploads/a69f462f-ae71-40a5-a60a-babfda61840e.png'
      };
    } else if (path.startsWith('/news/')) {
      // News article
      const slug = path.replace('/news/', '');
      const article = await getNewsArticle(slug);
      
      if (!article) {
        pageData = {
          title: 'Artykuł nie znaleziony',
          description: 'Przepraszamy, ale artykuł o tym adresie nie istnieje lub został usunięty.',
          url: path
        };
      } else {
        pageData = {
          title: article.title,
          description: generateDescription(article.content),
          url: path,
          type: 'article',
          image: article.featured_image,
          publishedAt: article.date || article.created_at,
          modifiedAt: article.date || article.created_at
        };
      }
    } else if (path.startsWith('/category/')) {
      // Category page
      const slug = path.replace('/category/', '');
      const category = await getCategory(slug);
      
      if (!category) {
        pageData = {
          title: 'Kategoria nie znaleziona',
          description: 'Przepraszamy, ale nie mogliśmy znaleźć kategorii o podanym adresie.',
          url: path
        };
      } else {
        pageData = {
          title: category.name,
          description: `Przeglądaj artykuły z kategorii ${category.name} na stronie Kół Młodych OZZ Inicjatywy Pracowniczej.`,
          url: path
        };
      }
    } else {
      // Static page
      const slug = path.replace('/', '');
      const page = await getStaticPage(slug);
      
      if (!page) {
        pageData = {
          title: 'Strona nie znaleziona',
          description: 'Przepraszamy, ale strona o tym adresie nie istnieje.',
          url: path
        };
      } else {
        pageData = {
          title: page.title,
          description: generateDescription(page.content),
          url: path
        };
      }
    }

    const prerenderedHTML = generatePrerenderedHTML(pageData);
    
    console.log('Generated pre-rendered HTML for crawler');
    
    return new Response(prerenderedHTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Error in crawler handler:', error);
    
    // Return a basic HTML page with default meta tags
    const defaultHTML = generatePrerenderedHTML({
      title: 'Koordynacja młodzieżowa OZZ Inicjatywa Pracownicza',
      description: 'Oficjalna strona struktur młodzieżowych OZZ Inicjatywa Pracownicza.',
      url: '/',
      image: '/lovable-uploads/a69f462f-ae71-40a5-a60a-babfda61840e.png'
    });
    
    return new Response(defaultHTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        ...corsHeaders
      }
    });
  }
};

serve(handler);
