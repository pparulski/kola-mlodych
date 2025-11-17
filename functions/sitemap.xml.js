// Dynamic sitemap for Cloudflare Pages Functions
// URL: /sitemap.xml
// Generates a sitemap from Supabase content on each request so it stays up to date

async function fetchAll(context, path) {
  const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = context.env;
  if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) return [];
  const url = `${VITE_SUPABASE_URL}/rest/v1/${path}`;
  const res = await fetch(url, {
    headers: {
      apikey: VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${VITE_SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) return [];
  return res.json();
}

function isoDate(d) {
  try {
    if (!d) return null;
    const date = new Date(d);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch (_) {
    return null;
  }
}

function xmlEscape(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function onRequest(context) {
  const { request } = context;
  const origin = new URL(request.url).origin;

  // Collect data in parallel
  const [news, staticPages, categories, ebooks] = await Promise.all([
    // Select minimal fields; include date fields when available
    fetchAll(context, 'news?select=slug,updated_at,created_at,date'),
    fetchAll(context, 'static_pages?select=slug,updated_at,created_at'),
    fetchAll(context, 'categories?select=slug,updated_at,created_at'),
    fetchAll(context, 'ebooks?select=slug,updated_at,created_at'),
  ]);

  // Build URL entries
  const nowIso = new Date().toISOString();
  const urls = [];

  // Core routes
  urls.push({ loc: `${origin}/`, changefreq: 'daily', priority: 1.0, lastmod: nowIso });
  urls.push({ loc: `${origin}/news`, changefreq: 'hourly', priority: 0.9, lastmod: nowIso });
  urls.push({ loc: `${origin}/ebooks`, changefreq: 'weekly', priority: 0.7, lastmod: nowIso });
  urls.push({ loc: `${origin}/downloads`, changefreq: 'weekly', priority: 0.5, lastmod: nowIso });
  urls.push({ loc: `${origin}/struktury`, changefreq: 'monthly', priority: 0.4, lastmod: nowIso });

  // News articles
  for (const n of news || []) {
    if (!n?.slug) continue;
    const lastmod = isoDate(n.updated_at || n.date || n.created_at) || nowIso;
    urls.push({
      loc: `${origin}/news/${encodeURIComponent(n.slug)}`,
      changefreq: 'daily',
      priority: 0.8,
      lastmod,
    });
  }

  // Static pages (exclude admin/auth-like slugs if present)
  for (const p of staticPages || []) {
    if (!p?.slug) continue;
    if (['auth', 'manage'].includes(p.slug)) continue;
    const lastmod = isoDate(p.updated_at || p.created_at) || nowIso;
    urls.push({
      loc: `${origin}/${encodeURIComponent(p.slug)}`,
      changefreq: 'monthly',
      priority: 0.6,
      lastmod,
    });
  }

  // Categories
  for (const c of (categories || [])) {
    if (!c?.slug) continue;
    const lastmod = isoDate(c.updated_at || c.created_at) || nowIso;
    urls.push({
      loc: `${origin}/category/${encodeURIComponent(c.slug)}`,
      changefreq: 'weekly',
      priority: 0.5,
      lastmod,
    });
  }

  // Ebooks
  for (const e of (ebooks || [])) {
    if (!e?.slug) continue;
    const lastmod = isoDate(e.updated_at || e.created_at) || nowIso;
    urls.push({
      loc: `${origin}/ebooks/${encodeURIComponent(e.slug)}`,
      changefreq: 'monthly',
      priority: 0.6,
      lastmod,
    });
  }

  // Construct XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map(u => `\n  <url>` +
      `\n    <loc>${xmlEscape(u.loc)}</loc>` +
      (u.lastmod ? `\n    <lastmod>${xmlEscape(u.lastmod)}</lastmod>` : '') +
      (u.changefreq ? `\n    <changefreq>${u.changefreq}</changefreq>` : '') +
      (u.priority != null ? `\n    <priority>${u.priority.toFixed(1)}</priority>` : '') +
      `\n  </url>`
    ).join('') +
    `\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=UTF-8',
      // Cache at edge for 1 hour; bypass on querystring for manual refresh
      'cache-control': 'public, max-age=0, s-maxage=3600',
    },
  });
}
