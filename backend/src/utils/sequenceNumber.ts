import { prisma } from '../config/database';

type SequencePrefix = 'INV' | 'QUO' | 'TKT' | 'CON';

export async function generateSequenceNumber(prefix: SequencePrefix): Promise<string> {
  const year = new Date().getFullYear();
  const key = `${prefix}-${year}`;

  const counter = await prisma.sequenceCounter.upsert({
    where: { key },
    update: { value: { increment: 1 } },
    create: { key, value: 1 },
  });

  const paddedValue = String(counter.value).padStart(4, '0');
  return `${prefix}-${year}-${paddedValue}`;
}
