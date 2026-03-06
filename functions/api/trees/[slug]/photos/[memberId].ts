// PUT /api/trees/:slug/photos/:memberId — Upload photo to R2
import { Env, json, error } from '../../../../lib/helpers';
import { verifyToken } from '../../../../lib/auth';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const onRequestPut: PagesFunction<Env> = async ({ params, request, env }) => {
  const slug = params.slug as string;
  const memberId = params.memberId as string;

  // Verify auth
  const auth = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!auth) return error('Authorization required', 401);
  const payload = await verifyToken(auth, env.HMAC_SECRET);
  if (!payload || payload.slug !== slug) return error('Invalid or expired token', 403);

  // Validate content type
  const contentType = request.headers.get('Content-Type') || '';
  if (!ALLOWED_TYPES.includes(contentType)) {
    return error(`Invalid content type. Allowed: ${ALLOWED_TYPES.join(', ')}`);
  }

  // Validate size
  const contentLength = parseInt(request.headers.get('Content-Length') || '0');
  if (contentLength > MAX_SIZE) {
    return error('File too large. Maximum 5MB');
  }

  // Get tree
  const tree = await env.DB.prepare('SELECT id FROM trees WHERE slug = ?').bind(slug).first();
  if (!tree) return error('Tree not found', 404);

  // Upload to R2
  const ext = contentType.split('/')[1] === 'jpeg' ? 'jpg' : contentType.split('/')[1];
  const key = `${tree.id}/${memberId}/${Date.now()}.${ext}`;

  await env.PHOTOS.put(key, request.body, {
    httpMetadata: { contentType },
  });

  // The photo URL — served via R2 public access or a worker proxy
  const photoUrl = `/api/trees/${slug}/photos/${memberId}?key=${encodeURIComponent(key)}`;

  // Update member's photo_url
  await env.DB.prepare('UPDATE members SET photo_url = ? WHERE id = ?')
    .bind(photoUrl, memberId).run();

  return json({ photoUrl });
};

// GET /api/trees/:slug/photos/:memberId — Serve photo from R2
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  if (!key) return error('Missing key parameter');

  const object = await env.PHOTOS.get(key);
  if (!object) return error('Photo not found', 404);

  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
