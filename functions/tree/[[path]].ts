// Serve standalone SPA for any /tree/[slug]/* path
// Injects OG meta tags for rich link previews

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const segments = url.pathname.replace(/^\/tree\/?/, '').split('/').filter(Boolean);

  if (segments.length === 0) {
    // /tree/ — serve the Next.js static page
    return context.env.ASSETS.fetch(context.request);
  }

  const slug = segments[0];

  // Fetch the standalone SPA HTML from ASSETS
  const assetUrl = new URL(context.request.url);
  assetUrl.pathname = '/tree-app.html';
  const asset = await context.env.ASSETS.fetch(assetUrl.toString());
  let html = await asset.text();

  // Fetch tree info for OG tags
  try {
    const tree = await context.env.DB.prepare(
      'SELECT name, description, origin FROM trees WHERE slug = ?'
    ).bind(slug).first();

    if (tree) {
      const memberCount = await context.env.DB.prepare(
        'SELECT COUNT(*) as count FROM members WHERE tree_id = (SELECT id FROM trees WHERE slug = ?)'
      ).bind(slug).first();

      const treeName = tree.name as string;
      const count = (memberCount?.count as number) || 0;
      const origin = tree.origin as string || '';
      const desc = tree.description as string || '';

      const title = `${treeName} Family Tree — Gentree`;
      const description = desc
        || `${treeName} family tree with ${count} member${count !== 1 ? 's' : ''}${origin ? '. Origin: ' + origin : ''}. View and explore on Gentree.`;
      const pageUrl = url.origin + '/tree/' + slug;

      // Check if viewing a specific member
      let memberName = '';
      if (segments[1] === 'member' && segments[2]) {
        const member = await context.env.DB.prepare(
          'SELECT name FROM members WHERE id = ?'
        ).bind(segments[2]).first();
        if (member) {
          memberName = member.name as string;
        }
      }

      const ogTitle = memberName ? `${memberName} — ${treeName} Family Tree` : title;
      const ogDesc = memberName ? `${memberName} in the ${treeName} family tree on Gentree.` : description;

      const ogTags = `
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeAttr(ogTitle)}" />
    <meta property="og:description" content="${escapeAttr(ogDesc)}" />
    <meta property="og:url" content="${escapeAttr(pageUrl)}" />
    <meta property="og:site_name" content="Gentree" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeAttr(ogTitle)}" />
    <meta name="twitter:description" content="${escapeAttr(ogDesc)}" />
    <meta name="description" content="${escapeAttr(ogDesc)}" />`;

      // Inject OG tags before </head>
      html = html.replace('</head>', ogTags + '\n</head>');
      // Update page title
      html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(ogTitle)}</title>`);
    }
  } catch {
    // If DB query fails, serve without OG tags
  }

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
};

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
