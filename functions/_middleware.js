import crawlers from 'crawler-user-agents';

// --- Helper Functions ---

const isCrawler = (userAgent) => {
    // This is the final, correct logic for this function.
    if (!userAgent) return false;
    const lowercasedUserAgent = userAgent.toLowerCase();
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
    console.log(`[LIVE DEBUG] Attempting to fetch: ${query}`);
    const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = context.env;
    if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) { 
        console.error("[LIVE ERROR] Supabase environment variables are MISSING.");
        return null; 
    }
    console.log("[LIVE DEBUG] Supabase environment variables are PRESENT.");
    try {
        const response = await fetch(`${VITE_SUPABASE_URL}/rest/v1/${query}`, {
            headers: { 'apikey': VITE_SUPABASE_ANON_KEY, 'Authorization': `Bearer ${VITE_SUPABASE_ANON_KEY}` }
        });
        if (!response.ok) { 
            console.error(`[LIVE ERROR] Supabase fetch failed with status: ${response.status}`, await response.text());
            return null; 
        }
        const data = await response.json();
        return data && data.length > 0 ? data[0] : null;
    } catch (error) { 
        console.error(`[LIVE ERROR] An exception occurred while fetching from Supabase.`, error);
        return null; 
    }
}

// --- Main Middleware Function ---
export async function onRequest(context) {
    console.log("\n--- [LIVE DEBUG] New Request ---");
    
    const { request, next } = context;
    const userAgent = request.headers.get("User-Agent") || "";
    
    console.log(`[LIVE DEBUG] User-Agent: "${userAgent}"`);

    if (!isCrawler(userAgent)) {
        console.log("[LIVE DEBUG] Result: NOT a crawler. Passing through.");
        return next();
    }

    console.log("[LIVE DEBUG] Result: CRAWLER DETECTED! Proceeding...");
    
    const url = new URL(request.url);
    let seoData = { 
        canonicalUrl: url.href,
        image: 'https://mlodzi.ozzip.pl/lovable-uploads/9b7922d9-f1dc-431e-a55d-1f5b63ebd5bf.png'
    };

    const newsMatch = url.pathname.match(/^\/news\/(.+)/);
    const categoryMatch = url.pathname.match(/^\/category\/(.+)/);
    const staticPageMatch = url.pathname.match(/^\/([^/.]+)$/);

    if (newsMatch) {
        console.log(`[LIVE DEBUG] Route matched: news`);
        const slug = newsMatch[1];
        const data = await fetchFromSupabase(context, `news?slug=eq.${slug}&select=title,content,featured_image`);
        console.log("[LIVE DEBUG] Supabase data for news:", data);
        if (data) {
            seoData.title = data.title;
            seoData.description = data.content ? data.content.substring(0, 160).replace(/<[^>]*>?/gm, '') + '...' : null;
            seoData.image = data.featured_image || seoData.image;
            seoData.isArticle = true;
        }
    } else if (categoryMatch) {
        console.log(`[LIVE DEBUG] Route matched: category`);
        const slug = categoryMatch[1];
        const data = await fetchFromSupabase(context, `categories?slug=eq.${slug}&select=name`);
        console.log("[LIVE DEBUG] Supabase data for category:", data);
        if (data) {
            seoData.title = `${data.name}`;
            seoData.description = `Przeglądaj najnowsze wiadomości i artykuły w kategorii ${data.name}.`;
        }
    } else if (url.pathname === '/struktury') {
        console.log(`[LIVE DEBUG] Route matched: /struktury`);
        seoData.title = "Struktury";
        seoData.description = "Szczegółowe informacje o lokalnych strukturach młodzieżowych OZZ IP.";
    } else if (url.pathname === '/downloads') {
        console.log(`[LIVE DEBUG] Route matched: /downloads`);
        seoData.title = "Do pobrania";
        seoData.description = "Materiały, wzory pism i dokumenty do pobrania.";
    } else if (url.pathname === '/ebooks') {
        console.log(`[LIVE DEBUG] Route matched: /ebooks`);
        seoData.title = "Ebooki";
        seoData.description = "Wydane publikacje i raporty dostępne za darmo.";
    } else if (staticPageMatch && !['auth', 'manage', 'ebooks', 'downloads', 'struktury'].includes(staticPageMatch[1])) {
        console.log(`[LIVE DEBUG] Route matched: static page`);
        const slug = staticPageMatch[1];
        // CORRECTED: Removed image_url from select as it does not exist in your static_pages schema
        const data = await fetchFromSupabase(context, `static_pages?slug=eq.${slug}&select=title,content`);
        console.log("[LIVE DEBUG] Supabase data for static page:", data);
        if (data) {
            seoData.title = data.title;
            seoData.description = data.content ? data.content.substring(0, 160).replace(/<[^>]*>?/gm, '') + '...' : null;
        }
    }

    console.log("[LIVE DEBUG] Final seoData before injection:", seoData);

    const response = await next();
    console.log(`[LIVE DEBUG] Received response from next(). Status: ${response.status}`);
    
    return new HTMLRewriter()
        .on("head", {
            element(element) {
                console.log("[LIVE DEBUG] HTMLRewriter triggered. Injecting tags.");
                element.append(generateTags(seoData), { html: true });
            },
        })
        .transform(response);
}