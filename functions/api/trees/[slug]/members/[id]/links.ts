// GET /api/trees/:slug/members/:id/links — list links for a member
// POST /api/trees/:slug/members/:id/links — create a link to another tree's member
// DELETE handled by link id endpoint
import { Env, json, error, nanoid } from '../../../../../lib/helpers';
import { verifyToken } from '../../../../../lib/auth';

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const memberId = params.id as string;

  const linksResult = await env.DB.prepare(
    'SELECT * FROM member_links WHERE member_id = ?'
  ).bind(memberId).all();

  // Fetch linked tree names for display
  const links = [];
  for (const row of linksResult.results || []) {
    const linkedTree = await env.DB.prepare(
      'SELECT name FROM trees WHERE slug = ?'
    ).bind(row.linked_tree_slug).first();
    links.push({
      id: row.id,
      linkedTreeSlug: row.linked_tree_slug,
      linkedTreeName: linkedTree?.name || row.linked_tree_slug,
      linkedMemberId: row.linked_member_id,
    });
  }

  return json({ links });
};

export const onRequestPost: PagesFunction<Env> = async ({ params, request, env }) => {
  const slug = params.slug as string;

  const auth = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!auth) return error('Authorization required', 401);
  const payload = await verifyToken(auth, env.HMAC_SECRET);
  if (!payload || payload.slug !== slug) return error('Invalid or expired token', 403);

  const memberId = params.id as string;
  const body = await request.json<{ linkedTreeSlug: string; linkedMemberId: string }>();

  if (!body.linkedTreeSlug || !body.linkedMemberId) {
    return error('linkedTreeSlug and linkedMemberId are required');
  }

  // Verify the linked tree and member exist
  const linkedTree = await env.DB.prepare('SELECT id FROM trees WHERE slug = ?')
    .bind(body.linkedTreeSlug).first();
  if (!linkedTree) return error('Linked tree not found', 404);

  const linkedMember = await env.DB.prepare('SELECT id FROM members WHERE id = ? AND tree_id = ?')
    .bind(body.linkedMemberId, linkedTree.id).first();
  if (!linkedMember) return error('Linked member not found in that tree', 404);

  // Get current tree
  const tree = await env.DB.prepare('SELECT id FROM trees WHERE slug = ?').bind(slug).first();
  if (!tree) return error('Tree not found', 404);

  // Check for duplicate link
  const existing = await env.DB.prepare(
    'SELECT id FROM member_links WHERE member_id = ? AND linked_tree_slug = ? AND linked_member_id = ?'
  ).bind(memberId, body.linkedTreeSlug, body.linkedMemberId).first();
  if (existing) return error('Link already exists');

  const id = nanoid();
  await env.DB.prepare(
    'INSERT INTO member_links (id, member_id, tree_id, linked_tree_slug, linked_member_id) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, memberId, tree.id, body.linkedTreeSlug, body.linkedMemberId).run();

  // Create the reverse link in the other tree
  const reverseId = nanoid();
  const reverseExisting = await env.DB.prepare(
    'SELECT id FROM member_links WHERE member_id = ? AND linked_tree_slug = ? AND linked_member_id = ?'
  ).bind(body.linkedMemberId, slug, memberId).first();
  if (!reverseExisting) {
    await env.DB.prepare(
      'INSERT INTO member_links (id, member_id, tree_id, linked_tree_slug, linked_member_id) VALUES (?, ?, ?, ?, ?)'
    ).bind(reverseId, body.linkedMemberId, linkedTree.id, slug, memberId).run();
  }

  return json({ id, linkedTreeSlug: body.linkedTreeSlug, linkedMemberId: body.linkedMemberId }, 201);
};
