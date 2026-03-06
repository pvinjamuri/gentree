// POST /api/trees/:slug/comments — Add comment (no auth required)
import { Env, json, error, nanoid } from '../../../../lib/helpers';

interface AddCommentBody {
  memberId: string;
  authorName: string;
  text: string;
  type?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ params, request, env }) => {
  const slug = params.slug as string;
  const body = await request.json<AddCommentBody>();

  if (!body.memberId) return error('Member ID is required');
  if (!body.authorName?.trim()) return error('Author name is required');
  if (!body.text?.trim()) return error('Comment text is required');

  const commentType = body.type || 'general';
  if (!['general', 'birthday', 'condolence', 'memory'].includes(commentType)) {
    return error('Invalid comment type');
  }

  const tree = await env.DB.prepare('SELECT id FROM trees WHERE slug = ?').bind(slug).first();
  if (!tree) return error('Tree not found', 404);

  const id = nanoid();
  await env.DB.prepare(
    'INSERT INTO comments (id, tree_id, member_id, author_name, text, type) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, tree.id, body.memberId, body.authorName.trim(), body.text.trim(), commentType).run();

  return json({ id, memberId: body.memberId, authorName: body.authorName.trim(), text: body.text.trim(), type: commentType }, 201);
};
