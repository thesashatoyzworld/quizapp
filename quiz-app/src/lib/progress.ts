import { prisma } from '@/lib/prisma';
import { LESSONS } from '@/content/kurs';

// ─────────────────────────────────────────────────────────────
// Прогресс обучения: кто из купивших что открывал, читал и досматривал.
//
// Источники — только то, что уже пишется в общую таблицу events:
//   kurs_done       статья урока домотана до конца
//   video_progress  максимум досмотра записи (одна строка на человека и видео)
//   section_view    заход в раздел
//   material_view   открытие материала (разбор, созвон, промпт, файл)
//
// Люди берутся из product_access: активный доступ роли uroven, тариф
// зашит в productSlug суффиксом -t<N>.
// ─────────────────────────────────────────────────────────────

export type LessonRow = {
  slug: string;
  num: string;
  title: string;
  /** статья домотана до конца */
  read: boolean;
  /** максимум досмотра записи, % */
  watched: number;
  /** сколько минут записи реально просмотрено */
  minutes: number;
  lastAt: string | null;
};

export type Touch = {
  kind: string;
  slug: string;
  title: string;
  /** для видео — максимум досмотра, иначе null */
  watched: number | null;
  at: string;
};

export type Student = {
  tg: string;
  username: string | null;
  name: string | null;
  tier: number;
  grantedAt: string;
  expiresAt: string | null;
  /** сколько уроков прочитано и сколько записей досмотрено хотя бы наполовину */
  lessonsRead: number;
  lessonsWatched: number;
  lessonsTotal: number;
  /** минут записей курса просмотрено суммарно */
  minutes: number;
  lessons: LessonRow[];
  /** разборы, созвоны, личное, промпты, поток */
  extras: Touch[];
  sections: { section: string; visits: number; lastAt: string }[];
  lastSeen: string | null;
  /** дней с последнего следа; null — следов нет. Считаем здесь, чтобы страница не звала часы в рендере */
  daysSince: number | null;
};

const ROLE = 'uroven';

/** Тариф зашит в productSlug суффиксом -t<N>. */
function tierFromSlug(slug: string): number {
  const m = /-t(\d+)$/.exec(slug);
  return m ? parseInt(m[1], 10) : 0;
}

/** «21:33» → 1293 секунды. Пусто или мусор → 0. */
function durationSeconds(human: string): number {
  const parts = (human || '').split(':').map((p) => parseInt(p, 10));
  if (parts.some((n) => Number.isNaN(n))) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

type Meta = Record<string, unknown> | null;
const str = (m: Meta, k: string): string => (m && typeof m[k] === 'string' ? (m[k] as string) : '');
const num = (m: Meta, k: string): number => (m && typeof m[k] === 'number' ? (m[k] as number) : 0);

export async function getStudents(): Promise<Student[]> {
  const now = new Date();

  const access = await prisma.productAccess.findMany({
    where: {
      role: ROLE,
      status: 'active',
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      telegramId: { not: null },
    },
    orderBy: { grantedAt: 'asc' },
  });

  // Один человек может держать несколько доступов (докупил тариф) — берём максимум.
  const byTg = new Map<string, Student>();
  for (const a of access) {
    const tg = String(a.telegramId);
    const tier = tierFromSlug(a.productSlug);
    const prev = byTg.get(tg);
    if (prev && prev.tier >= tier) continue;
    byTg.set(tg, {
      tg,
      username: null,
      name: null,
      tier,
      grantedAt: a.grantedAt.toISOString(),
      expiresAt: a.expiresAt ? a.expiresAt.toISOString() : null,
      lessonsRead: 0,
      lessonsWatched: 0,
      lessonsTotal: LESSONS.filter((l) => !!l.kinescopeId).length,
      minutes: 0,
      lessons: [],
      extras: [],
      sections: [],
      lastSeen: null,
      daysSince: null,
    });
  }
  if (byTg.size === 0) return [];

  const ids = [...byTg.keys()].map((t) => BigInt(t));

  const [users, events] = await Promise.all([
    prisma.user.findMany({
      where: { telegramId: { in: ids } },
      select: { telegramId: true, username: true, firstName: true },
    }),
    prisma.event.findMany({
      where: {
        telegramId: { in: ids },
        type: { in: ['kurs_done', 'video_progress', 'section_view', 'material_view'] },
      },
      select: { telegramId: true, type: true, metadata: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  for (const u of users) {
    const s = byTg.get(String(u.telegramId));
    if (s) { s.username = u.username; s.name = u.firstName; }
  }

  // Разложим события по человеку: уроки отдельно, всё остальное — «прочее».
  const read = new Map<string, Map<string, Date>>();          // tg → slug → когда дочитал
  const video = new Map<string, Map<string, { pct: number; sec: number; at: Date }>>();
  const extras = new Map<string, Map<string, Touch>>();        // tg → kind:slug → касание
  const sections = new Map<string, Map<string, { visits: number; lastAt: Date }>>();

  const put = <T>(m: Map<string, Map<string, T>>, tg: string) => {
    let inner = m.get(tg);
    if (!inner) { inner = new Map(); m.set(tg, inner); }
    return inner;
  };

  for (const e of events) {
    const tg = String(e.telegramId);
    const s = byTg.get(tg);
    if (!s) continue;
    const meta = e.metadata as Meta;
    if (!s.lastSeen || e.createdAt.toISOString() > s.lastSeen) s.lastSeen = e.createdAt.toISOString();

    if (e.type === 'kurs_done') {
      const slug = str(meta, 'lesson');
      if (slug) put(read, tg).set(slug, e.createdAt);
      continue;
    }

    if (e.type === 'video_progress') {
      const kind = str(meta, 'kind');
      const slug = str(meta, 'slug');
      if (!slug) continue;
      const pct = num(meta, 'percent');
      const sec = num(meta, 'seconds');
      const last = str(meta, 'lastAt');
      const at = last ? new Date(last) : e.createdAt;
      if (at.toISOString() > (s.lastSeen || '')) s.lastSeen = at.toISOString();
      if (kind === 'kurs') {
        put(video, tg).set(slug, { pct, sec, at });
      } else {
        const key = `${kind}:${slug}`;
        const prev = put(extras, tg).get(key);
        put(extras, tg).set(key, {
          kind,
          slug,
          title: prev?.title || slug,
          watched: pct,
          at: at.toISOString(),
        });
      }
      continue;
    }

    if (e.type === 'section_view') {
      const section = str(meta, 'section');
      if (!section) continue;
      const inner = put(sections, tg);
      const prev = inner.get(section);
      inner.set(section, { visits: (prev?.visits ?? 0) + 1, lastAt: e.createdAt });
      continue;
    }

    // material_view
    const kind = str(meta, 'kind');
    const slug = str(meta, 'slug');
    if (!slug || kind === 'kurs') continue; // уроки считаем по чтению и досмотру
    const key = `${kind}:${slug}`;
    const prev = put(extras, tg).get(key);
    put(extras, tg).set(key, {
      kind,
      slug,
      title: str(meta, 'title') || prev?.title || slug,
      watched: prev?.watched ?? null,
      at: e.createdAt.toISOString(),
    });
  }

  for (const s of byTg.values()) {
    const r = read.get(s.tg) ?? new Map();
    const v = video.get(s.tg) ?? new Map();

    s.lessons = LESSONS.filter((l) => !!l.kinescopeId).map((l, i) => {
      const w = v.get(l.slug);
      const doneAt = r.get(l.slug);
      const secs = w ? Math.min(w.sec, durationSeconds(l.duration) || w.sec) : 0;
      const at = [doneAt, w?.at].filter(Boolean).sort((a, b) => (a! > b! ? -1 : 1))[0];
      return {
        slug: l.slug,
        num: String(i).padStart(2, '0'),
        title: l.title,
        read: !!doneAt,
        watched: w?.pct ?? 0,
        minutes: Math.round(secs / 60),
        lastAt: at ? at.toISOString() : null,
      };
    });

    s.lessonsRead = s.lessons.filter((l) => l.read).length;
    s.lessonsWatched = s.lessons.filter((l) => l.watched >= 50).length;
    s.minutes = s.lessons.reduce((sum, l) => sum + l.minutes, 0);
    s.extras = [...(extras.get(s.tg)?.values() ?? [])].sort((a, b) => (a.at > b.at ? -1 : 1));
    s.sections = [...(sections.get(s.tg)?.entries() ?? [])]
      .map(([section, x]) => ({ section, visits: x.visits, lastAt: x.lastAt.toISOString() }))
      .sort((a, b) => (a.lastAt > b.lastAt ? -1 : 1));
    s.daysSince = s.lastSeen
      ? Math.max(0, Math.floor((now.getTime() - new Date(s.lastSeen).getTime()) / 86400000))
      : null;
  }

  // Сначала старшие тарифы, внутри тарифа — кто активнее.
  return [...byTg.values()].sort((a, b) => {
    if (b.tier !== a.tier) return b.tier - a.tier;
    const av = a.lessonsRead + a.lessonsWatched;
    const bv = b.lessonsRead + b.lessonsWatched;
    if (bv !== av) return bv - av;
    return (b.lastSeen || '') > (a.lastSeen || '') ? 1 : -1;
  });
}
