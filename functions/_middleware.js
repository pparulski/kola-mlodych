import crawlers from 'crawler-user-agents';

// --- Helper Functions ---

const isCrawler = (userAgent) => {
    if (!userAgent) return false;
    const lowercasedUserAgent = userAgent.toLowerCase();

    // 1. First, check for common, simple bot strings for robustness.
    const commonBots = ['googlebot', 'bingbot', 'yahoo', 'duckduckgo', 'facebookexternalhit', 'twitterbot', 'linkedinbot', 'pinterest'];
    if (commonBots.some(bot => lowercasedUserAgent.includes(bot))) {
        return true;
    }

    // 2. Then, use the more comprehensive library as a fallback.
    return crawlers.some(crawler => lowercasedUserAgent.includes(crawler.pattern.toLowerCase()));
};

function generateTags({ title, description, image, canonicalUrl, isArticle = false }) {
    const finalTitle = title ? `${title} – Koordynacja młodzieżowa OZZ IP` : "Koordynacja młodzieżowa OZZ Inicjatywa Pracownicza";
    const finalDescription = description || "Strona struktur młodzieżowych Ogólnopolskiego Związku Zawodowego Inicjatywa Pracownicza.";
    const fullImageUrl = image && !image.startsWith('http') ? `https://mlodzi.ozzip.pl${image}` : image;
    return `
        <title>${finalTitle}</title><meta name="description" content="${finalDescription}" /><link rel="canonical" href="${canonicalUrl}" /><meta property="og:type" content="${isArticle ? 'article' : 'website'}" /><meta property="og:url" content="${canonicalUrl}" /><meta property="og:title" content="${finalTitle}" /><meta property="og:description" content="${finalDescription}" />${fullImageUrl ? `<meta property="og:image" content="${fullImageUrl}" />` : ''}<meta name="twitter:card" content="${fullImageUrl ? 'summary_large_image' : 'summary'}" /><meta name="twitter:title" content="${finalTitle}" /><meta name="twitter:description" content="${finalDescription}" />${fullImageUrl ? `<meta name="twitter:image" content="${fullImageUrl}" />` : ''}
    `;
}

async function fetchFromSupabase(context, query) {
    const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = context.env;
    if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) { return null; }
    try {
        const response = await fetch(`${VITE_SUPABASE_URL}/rest/v1/${query}`, {
            headers: { 'apikey': VITE_SUPABASE_ANON_KEY, 'Authorization': `Bearer ${VITE_SUPABASE_ANON_KEY}` }
        });
        if (!response.ok) { return null; }
        const data = await response.json();
        return data && data.length > 0 ? data[0] : null;
    } catch (error) { return null; }
}

// --- Main Middleware Function ---
export async function onRequest(context) {
    const { request, next } = context;
    const url = new URL(request.url);

    // IMPROVEMENT: Ignore requests for static assets to improve efficiency
    const assetExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
    if (assetExtensions.some(ext => url.pathname.endsWith(ext))) {
        return next();
    }

    const userAgent = request.headers.get("User-Agent") || "";

    if (!isCrawler(userAgent)) {
        return next();
    }

    let seoData = { 
        canonicalUrl: url.href,
        image: 'https://mlodzi.ozzip.pl/img/9b7922d9-f1dc-431e-a55d-1f5b63ebd5bf.png'
    };

    const newsMatch = url.pathname.match(/^\/news\/(.+)/);
    const categoryMatch = url.pathname.match(/^\/category\/(.+)/);
    const ebookMatch = url.pathname.match(/^\/ebooks\/(.+)/);
    const staticPageMatch = url.pathname.match(/^\/([^/.]+)$/);

    if (newsMatch) {
        const slug = newsMatch[1];
        const data = await fetchFromSupabase(context, `news?slug=eq.${slug}&select=title,content,featured_image`);
        if (data) {
            seoData.title = data.title;
            seoData.description = data.content ? data.content.substring(0, 160).replace(/<[^>]*>?/gm, '') + '...' : null;
            seoData.image = data.featured_image || seoData.image;
            seoData.isArticle = true;
        }
    } else if (categoryMatch) {
        const slug = categoryMatch[1];
        const data = await fetchFromSupabase(context, `categories?slug=eq.${slug}&select=name`);
        if (data) {
            seoData.title = `${data.name}`;
            seoData.description = `Przeglądaj najnowsze wiadomości i artykuły w kategorii ${data.name}.`;
        }
    } else if (url.pathname === '/struktury') {
        seoData.title = "Struktury";
        seoData.description = "Szczegółowe informacje o lokalnych strukturach młodzieżowych OZZ IP.";
    } else if (url.pathname === '/downloads') {
        seoData.title = "Do pobrania";
        seoData.description = "Materiały, wzory pism i dokumenty do pobrania.";
    } else if (ebookMatch) {
        const slug = ebookMatch[1];
        const data = await fetchFromSupabase(context, `ebooks?slug=eq.${slug}&select=title,description,cover_url`);
        if (data) {
            seoData.title = data.title;
            seoData.description = data.description || "Publikacja do czytania online";
            seoData.image = data.cover_url || seoData.image;
            seoData.isArticle = true;
        }
    } else if (url.pathname === '/ebooks') {
        seoData.title = "Ebooki";
        seoData.description = "Wydane publikacje i raporty dostępne za darmo.";
    } else if (staticPageMatch && !['auth', 'manage', 'ebooks', 'downloads', 'struktury'].includes(staticPageMatch[1])) {
        const slug = staticPageMatch[1];
        const data = await fetchFromSupabase(context, `static_pages?slug=eq.${slug}&select=title,content`);
        if (data) {
            seoData.title = data.title;
            seoData.description = data.content ? data.content.substring(0, 160).replace(/<[^>]*>?/gm, '') + '...' : null;
        }
    }

    const response = await next();
    return new HTMLRewriter()
        .on("head", {
            element(element) {
                element.append(generateTags(seoData), { html: true });
            },
        })
        .transform(response);
}