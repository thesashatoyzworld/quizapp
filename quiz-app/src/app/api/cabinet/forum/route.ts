import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  CATEGORIES, FORUM_ADMINS, LIMITS, cleanText, ensureMember, isCategory, loadAuthors,
  notifyComment, notifyNewPost, ownImages, resolveViewer,
} from '@/lib/forum';

export const runtime = 'nodejs';

// Сообщество (форум кабинета).
//
//   GET  /api/cabinet/forum                → лента веток
//   GET  /api/cabinet/forum?post=<id>      → ветка целиком с комментариями
//   POST /api/cabinet/forum { action, ... } → post | comment | delete | pin | solve
//
// Опознание и доступ — в resolveViewer (src/lib/forum.ts).

const FEED_LIMIT = 200;

function deny(identified: boolean, tier = 0) {
  return NextResponse.json({ success: true, identified, allowed: false, tier });
}

/** «Ждёт ответа»: последнее слово не за Сашей и ветка не закрыта. */
function waiting(p: { lastAuthorTg: bigint; solved: boolean; category: string }, admins: Set<string>) {
  return !p.solved && p.category !== 'announce' && !admins.has(String(p.lastAuthorTg));
}

export async function GET(request: NextRequest) {
  try {
    const viewer = await resolveViewer(request);
    if (!viewer) return deny(false);
    if (!viewer.allowed) return deny(true, viewer.tier);

    const me = { id: String(viewer.telegramId), isAdmin: viewer.isAdmin };
    const admins = new Set([...FORUM_ADMINS].map(String));

    const postId = request.nextUrl.searchParams.get('post');
    if (postId) {
      const post = await prisma.forumPost.findFirst({ where: { id: postId, deleted: false } });
      if (!post) return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
      const comments = await prisma.forumComment.findMany({
        where: { postId },
        orderBy: { createdAt: 'asc' },
      });
      const authors = await loadAuthors([post.authorTg, ...comments.map((c) => c.authorTg)]);
      return NextResponse.json({
        success: true, identified: true, allowed: true, me,
        post: {
          id: post.id, category: post.category, title: post.title, body: post.body,
          images: post.images, pinned: post.pinned, solved: post.solved,
          createdAt: post.createdAt, commentCount: post.commentCount,
          waiting: waiting(post, admins),
          author: authors.get(String(post.authorTg)),
        },
        // Удалённый комментарий с ответами оставляем заглушкой, чтобы ответы
        // не повисли без контекста; без ответов — убираем совсем.
        comments: comments
          .filter((c) => !c.deleted || comments.some((r) => r.parentId === c.id && !r.deleted))
          .map((c) => ({
            id: c.id, parentId: c.parentId, createdAt: c.createdAt, deleted: c.deleted,
            body: c.deleted ? '' : c.body, images: c.deleted ? [] : c.images,
            author: authors.get(String(c.authorTg)),
          })),
      });
    }

    const posts = await prisma.forumPost.findMany({
      where: { deleted: false },
      orderBy: [{ pinned: 'desc' }, { lastActivityAt: 'desc' }],
      take: FEED_LIMIT,
    });

    // Кто отвечал: до четырёх последних комментаторов на карточку.
    const recent = posts.length
      ? await prisma.forumComment.findMany({
          where: { postId: { in: posts.map((p) => p.id) }, deleted: false },
          orderBy: { createdAt: 'desc' },
          select: { postId: true, authorTg: true },
        })
      : [];
    const repliers = new Map<string, bigint[]>();
    for (const c of recent) {
      const list = repliers.get(c.postId) ?? [];
      if (list.length < 4 && !list.some((x) => x === c.authorTg)) list.push(c.authorTg);
      repliers.set(c.postId, list);
    }

    const authors = await loadAuthors([
      ...posts.map((p) => p.authorTg),
      ...[...repliers.values()].flat(),
    ]);

    return NextResponse.json({
      success: true, identified: true, allowed: true, me,
      categories: CATEGORIES,
      posts: posts.map((p) => ({
        id: p.id, category: p.category, title: p.title,
        excerpt: p.body.replace(/\s+/g, ' ').trim().slice(0, 220),
        images: p.images.slice(0, 4), imageCount: p.images.length,
        pinned: p.pinned, solved: p.solved, commentCount: p.commentCount,
        createdAt: p.createdAt, lastActivityAt: p.lastActivityAt,
        waiting: waiting(p, admins),
        author: authors.get(String(p.authorTg)),
        repliers: (repliers.get(p.id) ?? []).map((id) => authors.get(String(id))),
      })),
    });
  } catch (error) {
    console.error('[forum] GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

type Body = Record<string, unknown>;

export async function POST(request: NextRequest) {
  try {
    const viewer = await resolveViewer(request);
    if (!viewer) return deny(false);
    if (!viewer.allowed) return deny(true, viewer.tier);
    const me = viewer.telegramId;
    const meTg = BigInt(me);

    const body = (await request.json().catch(() => ({}))) as Body;
    const action = body.action;

    if (action === 'post') {
      const title = cleanText(body.title, LIMITS.title).replace(/\n+/g, ' ');
      const text = cleanText(body.body, LIMITS.body);
      const category = body.category;
      if (!title) return bad('Напиши заголовок');
      if (!isCategory(category)) return bad('Выбери категорию');
      if (category === 'announce' && !viewer.isAdmin) return bad('Анонсы пишет только Саша');
      const images = await ownImages(body.images, me);
      if (!text && !images.length) return bad('Напиши, что нужно, или приложи картинки');

      const member = await ensureMember(me);
      const post = await prisma.forumPost.create({
        data: { authorTg: meTg, category, title, body: text, images, lastAuthorTg: meTg },
      });
      if (!viewer.isAdmin) await notifyNewPost(post, member.name);
      return NextResponse.json({ success: true, id: post.id });
    }

    if (action === 'comment') {
      const postId = String(body.postId || '');
      const text = cleanText(body.body, LIMITS.comment);
      const images = await ownImages(body.images, me);
      if (!text && !images.length) return bad('Пустой комментарий');

      const post = await prisma.forumPost.findFirst({ where: { id: postId, deleted: false } });
      if (!post) return bad('Ветка не найдена', 404);

      // Ответ на ответ вешаем на корневой комментарий: вложенность одна, как в Skool.
      let parentId: string | null = null;
      let parentAuthorTg: bigint | null = null;
      if (body.parentId) {
        const parent = await prisma.forumComment.findFirst({ where: { id: String(body.parentId), postId } });
        if (parent) {
          parentId = parent.parentId ?? parent.id;
          parentAuthorTg = parent.authorTg;
        }
      }

      const member = await ensureMember(me);
      const now = new Date();
      const comment = await prisma.forumComment.create({
        data: { postId, parentId, authorTg: meTg, body: text, images, createdAt: now },
      });
      await prisma.forumPost.update({
        where: { id: postId },
        data: {
          commentCount: { increment: 1 }, lastAuthorTg: meTg, lastActivityAt: now,
          // Автор дописал в закрытую ветку — значит, вопрос снова открыт.
          ...(post.solved && post.authorTg === meTg ? { solved: false } : {}),
        },
      });
      await notifyComment({
        post, commentId: comment.id, body: text || '📷 картинка',
        commenterTg: me, commenterName: member.name, parentAuthorTg,
      });
      return NextResponse.json({ success: true, id: comment.id });
    }

    if (action === 'delete') {
      const id = String(body.id || '');
      if (body.kind === 'post') {
        const post = await prisma.forumPost.findUnique({ where: { id } });
        if (!post || (post.authorTg !== meTg && !viewer.isAdmin)) return bad('Нельзя', 403);
        await prisma.forumPost.update({ where: { id }, data: { deleted: true } });
        return NextResponse.json({ success: true });
      }
      const comment = await prisma.forumComment.findUnique({ where: { id } });
      if (!comment || (comment.authorTg !== meTg && !viewer.isAdmin)) return bad('Нельзя', 403);
      await prisma.forumComment.update({ where: { id }, data: { deleted: true } });
      await recountPost(comment.postId);
      return NextResponse.json({ success: true });
    }

    if (action === 'pin') {
      if (!viewer.isAdmin) return bad('Нельзя', 403);
      await prisma.forumPost.update({ where: { id: String(body.id) }, data: { pinned: !!body.value } });
      return NextResponse.json({ success: true });
    }

    if (action === 'solve') {
      const post = await prisma.forumPost.findUnique({ where: { id: String(body.id) } });
      if (!post || (post.authorTg !== meTg && !viewer.isAdmin)) return bad('Нельзя', 403);
      await prisma.forumPost.update({ where: { id: post.id }, data: { solved: !!body.value } });
      return NextResponse.json({ success: true });
    }

    return bad('Неизвестное действие');
  } catch (error) {
    console.error('[forum] POST error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

function bad(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

/** После удаления комментария пересчитываем счётчик и «последнее слово». */
async function recountPost(postId: string) {
  const post = await prisma.forumPost.findUnique({ where: { id: postId } });
  if (!post) return;
  const alive = await prisma.forumComment.findMany({
    where: { postId, deleted: false },
    orderBy: { createdAt: 'desc' },
    select: { authorTg: true, createdAt: true },
  });
  await prisma.forumPost.update({
    where: { id: postId },
    data: {
      commentCount: alive.length,
      lastAuthorTg: alive[0]?.authorTg ?? post.authorTg,
      lastActivityAt: alive[0]?.createdAt ?? post.createdAt,
    },
  });
}
