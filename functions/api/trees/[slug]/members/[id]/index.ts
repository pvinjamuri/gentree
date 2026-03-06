// PUT /api/trees/:slug/members/:id — Update member
// DELETE /api/trees/:slug/members/:id — Delete member
import { Env, json, error } from '../../../../../lib/helpers';
import { verifyToken } from '../../../../../lib/auth';

async function authorize(request: Request, slug: string, secret: string): Promise<Response | null> {
  const auth = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!auth) return error('Authorization required', 401);
  const payload = await verifyToken(auth, secret);
  if (!payload || payload.slug !== slug) return error('Invalid or expired token', 403);
  return null;
}

export const onRequestPut: PagesFunction<Env> = async ({ params, request, env }) => {
  const slug = params.slug as string;
  const memberId = params.id as string;

  const authErr = await authorize(request, slug, env.HMAC_SECRET);
  if (authErr) return authErr;

  const body = await request.json<Record<string, unknown>>();

  // Build dynamic UPDATE query from provided fields
  const allowedFields: Record<string, string> = {
    name: 'name', gender: 'gender', dateOfBirth: 'date_of_birth',
    dateOfDeath: 'date_of_death', facebookUrl: 'facebook_url',
    phone: 'phone', email: 'email', location: 'location',
    bio: 'bio', generation: 'generation', maidenName: 'maiden_name',
    photoUrl: 'photo_url', nameTe: 'name_te', nameOr: 'name_or',
  };

  const sets: string[] = [];
  const values: unknown[] = [];

  for (const [key, col] of Object.entries(allowedFields)) {
    if (key in body) {
      sets.push(`${col} = ?`);
      values.push(body[key] ?? null);
    }
  }

  if (sets.length === 0) return error('No fields to update');

  values.push(memberId);
  await env.DB.prepare(`UPDATE members SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...values).run();

  return json({ ok: true });
};

export const onRequestDelete: PagesFunction<Env> = async ({ params, request, env }) => {
  const slug = params.slug as string;
  const memberId = params.id as string;

  const authErr = await authorize(request, slug, env.HMAC_SECRET);
  if (authErr) return authErr;

  // Delete member and cascade (relationships/comments cleaned by ON DELETE CASCADE)
  await env.DB.prepare('DELETE FROM members WHERE id = ?').bind(memberId).run();

  return json({ ok: true });
};
