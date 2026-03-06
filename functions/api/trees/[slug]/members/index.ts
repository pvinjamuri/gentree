// POST /api/trees/:slug/members — Add a new member (requires edit token)
import { Env, json, error, nanoid } from '../../../../lib/helpers';
import { verifyToken } from '../../../../lib/auth';

interface AddMemberBody {
  name: string;
  gender: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  facebookUrl?: string;
  phone?: string;
  email?: string;
  location?: string;
  bio?: string;
  generation?: number;
  maidenName?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ params, request, env }) => {
  const slug = params.slug as string;

  // Verify auth token
  const auth = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!auth) return error('Authorization required', 401);
  const payload = await verifyToken(auth, env.HMAC_SECRET);
  if (!payload || payload.slug !== slug) return error('Invalid or expired token', 403);

  const body = await request.json<AddMemberBody>();
  if (!body.name?.trim()) return error('Name is required');
  if (!['male', 'female', 'other'].includes(body.gender)) return error('Invalid gender');

  // Get tree ID
  const tree = await env.DB.prepare('SELECT id FROM trees WHERE slug = ?').bind(slug).first();
  if (!tree) return error('Tree not found', 404);

  const id = nanoid();
  await env.DB.prepare(
    `INSERT INTO members (id, tree_id, name, gender, date_of_birth, date_of_death, facebook_url, phone, email, location, bio, generation, maiden_name)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, tree.id, body.name.trim(), body.gender,
    body.dateOfBirth || null, body.dateOfDeath || null,
    body.facebookUrl || null, body.phone || null,
    body.email || null, body.location || null,
    body.bio || null, body.generation ?? 0,
    body.maidenName || null
  ).run();

  return json({ id, name: body.name.trim(), gender: body.gender, generation: body.generation ?? 0 }, 201);
};
