// POST /api/trees/:slug/members/:id/sync — deep sync from a linked tree
// Pulls personal info + creates related members (parents, spouse, children, siblings)
// and their relationships in this tree
import { Env, json, error, nanoid } from '../../../../../lib/helpers';
import { verifyToken } from '../../../../../lib/auth';

interface MemberRow {
  id: string; name: string; gender: string; date_of_birth: string | null;
  date_of_death: string | null; photo_url: string | null; phone: string | null;
  email: string | null; location: string | null; bio: string | null;
  facebook_url: string | null; maiden_name: string | null; generation: number;
  tree_id: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ params, request, env }) => {
  const slug = params.slug as string;

  const auth = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!auth) return error('Authorization required', 401);
  const payload = await verifyToken(auth, env.HMAC_SECRET);
  if (!payload || payload.slug !== slug) return error('Invalid or expired token', 403);

  const memberId = params.id as string;
  const body = await request.json<{ linkedTreeSlug: string; linkedMemberId: string }>();

  // Get both trees
  const [thisTree, linkedTree] = await Promise.all([
    env.DB.prepare('SELECT id FROM trees WHERE slug = ?').bind(slug).first(),
    env.DB.prepare('SELECT id FROM trees WHERE slug = ?').bind(body.linkedTreeSlug).first(),
  ]);
  if (!thisTree) return error('Tree not found', 404);
  if (!linkedTree) return error('Linked tree not found', 404);

  const linkedMember = await env.DB.prepare('SELECT * FROM members WHERE id = ? AND tree_id = ?')
    .bind(body.linkedMemberId, linkedTree.id).first() as MemberRow | null;
  if (!linkedMember) return error('Linked member not found', 404);

  // 1. Sync personal fields for the primary member
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

  // 2. Fetch all relationships involving the linked member in the source tree
  const relsResult = await env.DB.prepare(
    'SELECT * FROM relationships WHERE tree_id = ? AND (from_member_id = ? OR to_member_id = ?)'
  ).bind(linkedTree.id, body.linkedMemberId, body.linkedMemberId).all();
  const sourceRels = relsResult.results || [];

  // Collect all related source member IDs
  const relatedSourceIds = new Set<string>();
  for (const r of sourceRels) {
    if (r.from_member_id !== body.linkedMemberId) relatedSourceIds.add(r.from_member_id as string);
    if (r.to_member_id !== body.linkedMemberId) relatedSourceIds.add(r.to_member_id as string);
  }

  // 3. For each related member, find or create in this tree
  // Map: source member ID -> this tree's member ID
  const sourceToLocal: Record<string, string> = {};
  sourceToLocal[body.linkedMemberId] = memberId;

  // Check existing member_links to find already-linked members
  const existingLinks = await env.DB.prepare(
    'SELECT member_id, linked_member_id FROM member_links WHERE tree_id = ? AND linked_tree_slug = ?'
  ).bind(thisTree.id, body.linkedTreeSlug).all();
  for (const link of existingLinks.results || []) {
    sourceToLocal[link.linked_member_id as string] = link.member_id as string;
  }

  // Get this member's generation to compute relative generations
  const thisMember = await env.DB.prepare('SELECT generation FROM members WHERE id = ?')
    .bind(memberId).first();
  const baseGen = (thisMember?.generation as number) || 0;
  const sourceBaseGen = linkedMember.generation || 0;

  let created = 0;
  let relsCreated = 0;

  for (const sourceId of relatedSourceIds) {
    if (sourceToLocal[sourceId]) continue; // Already mapped

    // Fetch source member data
    const sourceMember = await env.DB.prepare('SELECT * FROM members WHERE id = ?')
      .bind(sourceId).first() as MemberRow | null;
    if (!sourceMember) continue;

    // Create in this tree
    const newId = nanoid();
    const relativeGen = baseGen + ((sourceMember.generation || 0) - sourceBaseGen);

    await env.DB.prepare(
      `INSERT INTO members (id, tree_id, name, gender, date_of_birth, date_of_death,
        photo_url, phone, email, location, bio, facebook_url, maiden_name, generation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      newId, thisTree.id, sourceMember.name, sourceMember.gender,
      sourceMember.date_of_birth, sourceMember.date_of_death,
      sourceMember.photo_url, sourceMember.phone, sourceMember.email,
      sourceMember.location, sourceMember.bio, sourceMember.facebook_url,
      sourceMember.maiden_name, relativeGen
    ).run();

    sourceToLocal[sourceId] = newId;
    created++;

    // Create bidirectional member_link
    const linkId1 = nanoid();
    const linkId2 = nanoid();
    await env.DB.prepare(
      'INSERT INTO member_links (id, member_id, tree_id, linked_tree_slug, linked_member_id) VALUES (?, ?, ?, ?, ?)'
    ).bind(linkId1, newId, thisTree.id, body.linkedTreeSlug, sourceId).run();
    await env.DB.prepare(
      'INSERT INTO member_links (id, member_id, tree_id, linked_tree_slug, linked_member_id) VALUES (?, ?, ?, ?, ?)'
    ).bind(linkId2, sourceId, linkedTree.id, slug, newId).run();
  }

  // 4. Create relationships in this tree mirroring the source
  // First, get existing relationships in this tree to avoid duplicates
  const existingRels = await env.DB.prepare(
    'SELECT type, from_member_id, to_member_id FROM relationships WHERE tree_id = ?'
  ).bind(thisTree.id).all();
  const existingRelSet = new Set(
    (existingRels.results || []).map(r => `${r.type}|${r.from_member_id}|${r.to_member_id}`)
  );

  for (const r of sourceRels) {
    const localFrom = sourceToLocal[r.from_member_id as string];
    const localTo = sourceToLocal[r.to_member_id as string];
    if (!localFrom || !localTo) continue;

    const key = `${r.type}|${localFrom}|${localTo}`;
    if (existingRelSet.has(key)) continue;

    const relId = nanoid();
    await env.DB.prepare(
      'INSERT INTO relationships (id, tree_id, type, from_member_id, to_member_id) VALUES (?, ?, ?, ?, ?)'
    ).bind(relId, thisTree.id, r.type, localFrom, localTo).run();
    existingRelSet.add(key);
    relsCreated++;
  }

  return json({
    ok: true,
    membersCreated: created,
    relationshipsCreated: relsCreated,
  });
};
