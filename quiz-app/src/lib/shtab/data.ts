// Раздел «Штаб»: задачи из трекера и ночные смены. Данные кладёт скрипт
// синхронизации штаба, здесь только чтение.
import { prisma } from '@/lib/prisma';
import { summarize, groupSections, type TaskRow } from './summary';

export type ReportLink = { kind: 'pr' | 'file' | 'url'; label: string; url?: string; fileId?: string };

export async function getShtabBoard(now = new Date()) {
  const [tasks, reports, files] = await Promise.all([
    prisma.shtabTask.findMany({ orderBy: [{ sectionOrder: 'asc' }, { position: 'asc' }] }),
    prisma.shtabReport.findMany({
      orderBy: { shiftDate: 'desc' },
      select: { id: true, shiftDate: true, title: true, forSasha: true, syncedAt: true },
    }),
    prisma.shtabFile.findMany({ select: { id: true, aliases: true } }),
  ]);

  const rows: TaskRow[] = tasks.map((t) => ({
    id: t.id,
    section: t.section,
    sectionOrder: t.sectionOrder,
    grp: t.grp,
    text: t.text,
    detail: t.detail,
    status: t.status,
    lineDate: t.lineDate,
    doneAt: t.doneAt,
  }));

  return {
    summary: summarize(rows, reports, now),
    sections: groupSections(rows),
    reports,
    fileAliases: aliasMap(files),
    syncedAt: tasks[0]?.syncedAt ?? null,
  };
}

export async function getShtabReport(id: string) {
  const [report, files] = await Promise.all([
    prisma.shtabReport.findUnique({ where: { id } }),
    prisma.shtabFile.findMany({ select: { id: true, title: true, aliases: true } }),
  ]);
  if (!report) return null;
  return {
    report: { ...report, links: (report.links ?? []) as ReportLink[] },
    fileAliases: aliasMap(files),
    fileTitles: Object.fromEntries(files.map((f) => [f.id, f.title])),
  };
}

export function getShtabFile(id: string) {
  return prisma.shtabFile.findUnique({ where: { id } });
}

/** Упоминание файла в тексте → id сохранённого файла. */
function aliasMap(files: { id: string; aliases: string[] }[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const f of files) for (const a of f.aliases) map[a] = f.id;
  return map;
}
