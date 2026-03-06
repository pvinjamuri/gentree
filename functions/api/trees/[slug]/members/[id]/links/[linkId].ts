// DELETE /api/trees/:slug/members/:id/links/:linkId — remove a member link
import { Env, json, error } from '../../../../../../lib/helpers';
import { verifyToken } from '../../../../../../lib/auth';

export const onRequestDelete: PagesFunction<Env> = async ({ params, request, env }) => {
  const slug = params.slug as string;

  const auth = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!auth) return error('Authorization required', 401);
  const payload = await verifyToken(auth, env.HMAC_SECRET);
  if (!payload || payload.slug !== slug) return error('Invalid or expired token', 403);

  const linkId = params.linkId as string;

  // Get the link before deleting so we can remove the reverse
  const link = await env.DB.prepare('SELECT * FROM member_links WHERE id = ?').bind(linkId).first();
  if (link) {
    // Remove reverse link
    await env.DB.prepare(
      'DELETE FROM member_links WHERE member_id = ? AND linked_tree_slug = ? AND linked_member_id = ?'
    ).bind(link.linked_member_id, slug, link.member_id).run();
  }

  await env.DB.prepare('DELETE FROM member_links WHERE id = ?').bind(linkId).run();

  return json({ ok: true });
};
