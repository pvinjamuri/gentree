// POST /api/trees/:slug/verify-pin — Verify PIN and return edit token
import { Env, json, error } from '../../../lib/helpers';
import { verifyPin, signToken } from '../../../lib/auth';

export const onRequestPost: PagesFunction<Env> = async ({ params, request, env }) => {
  const slug = params.slug as string;
  const body = await request.json<{ pin: string }>();

  if (!body.pin) return error('PIN is required');

  const tree = await env.DB.prepare(
    'SELECT id, pin_hash FROM trees WHERE slug = ?'
  ).bind(slug).first();

  if (!tree) return error('Tree not found', 404);

  const valid = await verifyPin(body.pin, tree.pin_hash as string);
  if (!valid) return error('Invalid PIN', 403);

  const token = await signToken(
    { slug, exp: Math.floor(Date.now() / 1000) + 86400 },
    env.HMAC_SECRET
  );

  return json({ token });
};
