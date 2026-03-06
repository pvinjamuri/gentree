// GET /api/trees/:slug — Get tree with all members, relationships
// PUT /api/trees/:slug — Update tree metadata (requires auth)
import { Env, json, error } from '../../../lib/helpers';
import { verifyToken } from '../../../lib/auth';

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const slug = params.slug as string;

  const tree = await env.DB.prepare(
    'SELECT id, slug, name, description, origin, creator_email, created_at FROM trees WHERE slug = ?'
  ).bind(slug).first();

  if (!tree) return error('Tree not found', 404);

  const [membersResult, relationshipsResult] = await Promise.all([
    env.DB.prepare('SELECT * FROM members WHERE tree_id = ? ORDER BY generation, name')
      .bind(tree.id).all(),
    env.DB.prepare('SELECT * FROM relationships WHERE tree_id = ?')
      .bind(tree.id).all(),
  ]);

  return json({
    tree: {
      id: tree.id,
      slug: tree.slug,
      name: tree.name,
      description: tree.description || undefined,
      origin: tree.origin || undefined,
      creatorEmail: tree.creator_email || undefined,
      createdAt: tree.created_at,
    },
    members: (membersResult.results || []).map(rowToMember),
    relationships: (relationshipsResult.results || []).map(rowToRelationship),
  });
};

function rowToMember(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    gender: row.gender,
    dateOfBirth: row.date_of_birth || undefined,
    dateOfDeath: row.date_of_death || undefined,
    photoUrl: row.photo_url || undefined,
    facebookUrl: row.facebook_url || undefined,
    phone: row.phone || undefined,
    email: row.email || undefined,
    location: row.location || undefined,
    bio: row.bio || undefined,
    generation: row.generation,
    maidenName: row.maiden_name || undefined,
  };
}

function rowToRelationship(row: Record<string, unknown>) {
  return {
    id: row.id,
    type: row.type,
    fromMemberId: row.from_member_id,
    toMemberId: row.to_member_id,
  };
}

export const onRequestPut: PagesFunction<Env> = async ({ params, request, env }) => {
  const slug = params.slug as string;

  const auth = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!auth) return error('Authorization required', 401);
  const payload = await verifyToken(auth, env.HMAC_SECRET);
  if (!payload || payload.slug !== slug) return error('Invalid or expired token', 403);

  const body = await request.json<Record<string, unknown>>();
  const allowed: Record<string, string> = { name: 'name', description: 'description', origin: 'origin' };
  const sets: string[] = [];
  const values: unknown[] = [];

  for (const [key, col] of Object.entries(allowed)) {
    if (key in body) {
      sets.push(`${col} = ?`);
      values.push(body[key] ?? null);
    }
  }

  if (sets.length === 0) return error('No fields to update');

  values.push(slug);
  await env.DB.prepare(`UPDATE trees SET ${sets.join(', ')} WHERE slug = ?`)
    .bind(...values).run();

  return json({ ok: true });
};
