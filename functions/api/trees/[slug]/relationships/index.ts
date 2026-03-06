// POST /api/trees/:slug/relationships — Add relationship
import { Env, json, error, nanoid } from '../../../../lib/helpers';
import { verifyToken } from '../../../../lib/auth';

interface AddRelationshipBody {
  type: string;
  fromMemberId: string;
  toMemberId: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ params, request, env }) => {
  const slug = params.slug as string;

  const auth = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!auth) return error('Authorization required', 401);
  const payload = await verifyToken(auth, env.HMAC_SECRET);
  if (!payload || payload.slug !== slug) return error('Invalid or expired token', 403);

  const body = await request.json<AddRelationshipBody>();
  if (!['parent', 'spouse', 'sibling'].includes(body.type)) return error('Invalid relationship type');
  if (!body.fromMemberId || !body.toMemberId) return error('Both member IDs required');

  const tree = await env.DB.prepare('SELECT id FROM trees WHERE slug = ?').bind(slug).first();
  if (!tree) return error('Tree not found', 404);

  const id = nanoid();
  await env.DB.prepare(
    'INSERT INTO relationships (id, tree_id, type, from_member_id, to_member_id) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, tree.id, body.type, body.fromMemberId, body.toMemberId).run();

  return json({ id, type: body.type, fromMemberId: body.fromMemberId, toMemberId: body.toMemberId }, 201);
};
