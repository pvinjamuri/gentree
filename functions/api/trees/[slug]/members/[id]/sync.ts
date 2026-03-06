// POST /api/trees/:slug/members/:id/sync — sync member data from a linked tree
import { Env, json, error } from '../../../../../lib/helpers';
import { verifyToken } from '../../../../../lib/auth';

export const onRequestPost: PagesFunction<Env> = async ({ params, request, env }) => {
  const slug = params.slug as string;

  const auth = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!auth) return error('Authorization required', 401);
  const payload = await verifyToken(auth, env.HMAC_SECRET);
  if (!payload || payload.slug !== slug) return error('Invalid or expired token', 403);

  const memberId = params.id as string;
  const body = await request.json<{ linkedTreeSlug: string; linkedMemberId: string }>();

  // Fetch the linked member's data
  const linkedTree = await env.DB.prepare('SELECT id FROM trees WHERE slug = ?')
    .bind(body.linkedTreeSlug).first();
  if (!linkedTree) return error('Linked tree not found', 404);

  const linkedMember = await env.DB.prepare('SELECT * FROM members WHERE id = ? AND tree_id = ?')
    .bind(body.linkedMemberId, linkedTree.id).first();
  if (!linkedMember) return error('Linked member not found', 404);

  // Sync fields: name, date_of_birth, date_of_death, photo_url, phone, email, location, bio, facebook_url, maiden_name
  await env.DB.prepare(
    `UPDATE members SET
      name = ?, date_of_birth = ?, date_of_death = ?, photo_url = ?,
      phone = ?, email = ?, location = ?, bio = ?, facebook_url = ?, maiden_name = ?
    WHERE id = ?`
  ).bind(
    linkedMember.name, linkedMember.date_of_birth, linkedMember.date_of_death, linkedMember.photo_url,
    linkedMember.phone, linkedMember.email, linkedMember.location, linkedMember.bio,
    linkedMember.facebook_url, linkedMember.maiden_name,
    memberId
  ).run();

  return json({
    ok: true,
    synced: {
      name: linkedMember.name,
      dateOfBirth: linkedMember.date_of_birth || undefined,
      dateOfDeath: linkedMember.date_of_death || undefined,
      photoUrl: linkedMember.photo_url || undefined,
      phone: linkedMember.phone || undefined,
      email: linkedMember.email || undefined,
      location: linkedMember.location || undefined,
      bio: linkedMember.bio || undefined,
      facebookUrl: linkedMember.facebook_url || undefined,
      maidenName: linkedMember.maiden_name || undefined,
    }
  });
};
