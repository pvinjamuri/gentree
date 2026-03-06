// POST /api/trees — Create a new family tree
import { Env, json, error, nanoid, slugify } from '../../lib/helpers';
import { hashPin, signToken } from '../../lib/auth';

interface CreateTreeBody {
  name: string;
  pin: string;
  creatorEmail?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = await request.json<CreateTreeBody>();

  if (!body.name?.trim()) return error('Family name is required');
  if (!body.pin || body.pin.length < 4 || body.pin.length > 6) {
    return error('PIN must be 4-6 digits');
  }
  if (!/^\d+$/.test(body.pin)) return error('PIN must be numeric');

  const id = nanoid();
  // Always append a random number so no family "owns" a bare last-name slug
  const num = Math.floor(100 + Math.random() * 900); // 3-digit: 100–999
  let slug = `${slugify(body.name)}-${num}`;

  // In the unlikely event of collision, add more randomness
  const existing = await env.DB.prepare('SELECT id FROM trees WHERE slug = ?').bind(slug).first();
  if (existing) {
    slug = `${slug}${Math.floor(10 + Math.random() * 90)}`; // append 2 more digits
  }

  const pinHash = await hashPin(body.pin);

  await env.DB.prepare(
    'INSERT INTO trees (id, slug, name, pin_hash, creator_email) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, slug, body.name.trim(), pinHash, body.creatorEmail || null).run();

  // Return a signed edit token (24h)
  const token = await signToken(
    { slug, exp: Math.floor(Date.now() / 1000) + 86400 },
    env.HMAC_SECRET
  );

  return json({ id, slug, name: body.name.trim(), token }, 201);
};
