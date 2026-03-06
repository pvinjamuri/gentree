// GET /api/trees/:slug/comments/:memberId — List comments for a member
import { Env, json, error } from '../../../../lib/helpers';

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const memberId = params.memberId as string;

  const result = await env.DB.prepare(
    'SELECT * FROM comments WHERE member_id = ? ORDER BY created_at DESC'
  ).bind(memberId).all();

  const comments = (result.results || []).map((row) => ({
    id: row.id,
    memberId: row.member_id,
    authorName: row.author_name,
    text: row.text,
    type: row.type,
    createdAt: row.created_at,
  }));

  return json({ comments });
};
