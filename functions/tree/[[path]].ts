// Serve standalone SPA for any /tree/[slug]/* path
// Bypasses Next.js routing and Cloudflare's static asset resolution entirely

interface Env {
  ASSETS: Fetcher;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const segments = url.pathname.replace(/^\/tree\/?/, '').split('/').filter(Boolean);

  if (segments.length === 0) {
    // /tree/ — serve the Next.js static page
    return context.env.ASSETS.fetch(context.request);
  }

  // /tree/[slug]/* — fetch the standalone SPA HTML from ASSETS
  // Use a clean GET request to avoid redirect loops
  const assetUrl = new URL(context.request.url);
  assetUrl.pathname = '/tree-app.html';
  const asset = await context.env.ASSETS.fetch(assetUrl.toString());

  // Return the HTML with correct headers, bypassing any ASSETS redirects
  const html = await asset.text();
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
};
