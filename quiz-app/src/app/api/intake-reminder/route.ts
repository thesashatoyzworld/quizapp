import { NextRequest, NextResponse } from 'next/server';
import { Receiver } from '@upstash/qstash';
import { prisma } from '@/lib/prisma';
import { sendBotMessage } from '@/lib/telegram';
import { INTAKE_TOTAL } from '@/content/intake-tarif3';

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || '',
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || '',
});

// Одно напоминание по недособранной анкете. Второго нет.
export async function POST(request: NextRequest) {
  const signature = request.headers.get('upstash-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 401 });

  const body = await request.text();
  const valid = await receiver
    .verify({ signature, body, url: `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/intake-reminder` })
    .catch(() => false);
  if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

  const { intakeId } = JSON.parse(body) as { intakeId: string };
  const intake = await prisma.intake.findUnique({ where: { id: intakeId } });

  if (!intake) return NextResponse.json({ ok: true, skipped: 'not found' });
  if (intake.status === 'done') return NextResponse.json({ ok: true, skipped: 'done' });
  if (intake.remindedAt) return NextResponse.json({ ok: true, skipped: 'already reminded' });

  const left = INTAKE_TOTAL - intake.currentStep;
  const text =
    intake.status === 'in_progress'
      ? `мы остановились на вопросе ${intake.currentStep + 1}, осталось ${left}. продолжим? /anketa`
      : 'напоминаю про анкету до нашего созвона. начать: /anketa';

  await sendBotMessage(Number(intake.telegramId), text);
  await prisma.intake.update({ where: { id: intakeId }, data: { remindedAt: new Date() } });

  return NextResponse.json({ ok: true, reminded: intakeId });
}
