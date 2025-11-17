import crawlers from 'crawler-user-agents';

// --- Helper Functions ---

const isCrawler = (userAgent) => {
    if (!userAgent) return false;
    const lowercasedUserAgent = userAgent.toLowerCase();
    const commonBots = ['googlebot', 'bingbot', 'yahoo', 'duckduckgo', 'facebookexternalhit', 'twitterbot', 'linkedinbot', 'pinterest'];
    if (commonBots.some(bot => lowercasedUserAgent.includes(bot))) {
        return true;
    }
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

    // --- Universal Description Generator ---
    const generateDescription = (content, maxLength = 160) => {
        if (!content) return null;
        // Strip HTML and normalize whitespace
        let plainText = content.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();

        // Decode common HTML entities so regex matches even if CMS stores diacritics as entities
        const decodeHtmlEntities = (str) => {
            if (!str) return str;
            // Decode numeric entities (decimal and hex)
            str = str.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
            str = str.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
            // Minimal named entities map (extend as needed)
            const map = {
                '&amp;': '&',
                '&quot;': '"',
                '&apos;': '\'',
                '&lt;': '<',
                '&gt;': '>',
                '&oacute;': 'ó',
                '&Oacute;': 'Ó',
                '&nbsp;': ' '
            };
            return str.replace(/&(amp|quot|apos|lt|gt|oacute|Oacute|nbsp);/g, (m) => map[m] || m);
        };
        plainText = decodeHtmlEntities(plainText);

        // Remove the leading Alarm Studencki announcement if present so it doesn't pollute SEO/OG descriptions
        // Example full intro:
        // "Tekst jest częścią siódmego numeru Alarmu Studenckiego. Chcesz nas wesprzeć? Wpłać na zrzutkę, dzięki której wydajemy naszą gazetę."
        // We generalize to any "... numeru Alarmu Studenckiego. Chcesz nas wesprzeć? Wpłać na zrzutkę, dzięki której wydajemy naszą gazetę."
        const alarmIntroPattern = /^\s*Tekst jest częścią.*?naszą gazetę\.(\s+|$)/i;
        if (alarmIntroPattern.test(plainText)) {
            plainText = plainText.replace(alarmIntroPattern, '').trim();
        }

        if (plainText.length > maxLength) {
            let truncatedText = plainText.substring(0, maxLength);
            truncatedText = truncatedText.substring(0, Math.min(truncatedText.length, truncatedText.lastIndexOf(' ')));
            return truncatedText + '...';
        }
        return plainText;
    };

    if (newsMatch) {
        const slug = newsMatch[1];
        const data = await fetchFromSupabase(context, `news?slug=eq.${slug}&select=title,content,featured_image`);
        if (data) {
            seoData.title = data.title;
            seoData.description = generateDescription(data.content);
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
        // --- START: EDITED EBOOK BLOCK ---
        const slug = ebookMatch[1];
        const data = await fetchFromSupabase(context, `ebooks?slug=eq.${slug}&select=title,description,cover_url`);
        if (data) {
            seoData.title = `${data.title} – Publikacja`;
            seoData.description = generateDescription(data.description);
            seoData.image = data.cover_url || seoData.image;
            seoData.isArticle = true;
        }
        // --- END: EDITED EBOOK BLOCK ---
    } else if (url.pathname === '/ebooks') {
        seoData.title = "Ebooki";
        seoData.description = "Wydane publikacje i raporty dostępne za darmo.";
    } else if (url.pathname === '/stolowki') {
        seoData.title = "Przywróćmy stołówki, wyślij apel do władz!";
        seoData.description = "Stwórz i wyślij wiadomość w sprawie uruchomienia stołówek studenckich – wybierz argumenty i wyślij gotowego maila.";
        // Open Graph/Twitter image override
        seoData.image = 'https://supabase.mlodzi.ozzip.pl/storage/v1/object/public/news_images//akcja.png';
    } else if (staticPageMatch && !['auth', 'manage', 'ebooks', 'downloads', 'struktury'].includes(staticPageMatch[1])) {
        const slug = staticPageMatch[1];
        const data = await fetchFromSupabase(context, `static_pages?slug=eq.${slug}&select=title,content`);
        if (data) {
            seoData.title = data.title;
            seoData.description = generateDescription(data.content);
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