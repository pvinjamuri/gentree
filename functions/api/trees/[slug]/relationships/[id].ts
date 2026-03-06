// DELETE /api/trees/:slug/relationships/:id — Remove relationship
import { Env, json, error } from '../../../../lib/helpers';
import { verifyToken } from '../../../../lib/auth';

export const onRequestDelete: PagesFunction<Env> = async ({ params, request, env }) => {
  const slug = params.slug as string;

  const auth = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!auth) return error('Authorization required', 401);
  const payload = await verifyToken(auth, env.HMAC_SECRET);
  if (!payload || payload.slug !== slug) return error('Invalid or expired token', 403);

  const relId = params.id as string;
  await env.DB.prepare('DELETE FROM relationships WHERE id = ?').bind(relId).run();

  return json({ ok: true });
};
