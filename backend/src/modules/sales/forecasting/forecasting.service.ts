import { prisma } from '../../../config/database';

export async function getSummary(orgId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [openOpportunities, wonThisMonth, lostThisMonth] = await Promise.all([
    prisma.opportunity.findMany({
      where: { organizationId: orgId, status: 'OPEN' },
      select: { value: true, probability: true },
    }),
    prisma.opportunity.aggregate({
      where: {
        organizationId: orgId,
        status: 'WON',
        actualCloseDate: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { value: true },
    }),
    prisma.opportunity.aggregate({
      where: {
        organizationId: orgId,
        status: 'LOST',
        actualCloseDate: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { value: true },
    }),
  ]);

  const totalPipelineValue = openOpportunities.reduce(
    (sum, opp) => sum + Number(opp.value),
    0
  );

  const weightedPipelineValue = openOpportunities.reduce(
    (sum, opp) => sum + Number(opp.value) * (opp.probability / 100),
    0
  );

  return {
    totalPipelineValue,
    weightedPipelineValue,
    wonThisMonth: Number(wonThisMonth._sum.value ?? 0),
    lostThisMonth: Number(lostThisMonth._sum.value ?? 0),
  };
}

export async function getByStage(orgId: string, pipelineId?: string) {
  const stageWhere: Record<string, unknown> = {
    pipeline: { organizationId: orgId },
  };

  if (pipelineId) {
    stageWhere.pipelineId = pipelineId;
  }

  const stages = await prisma.stage.findMany({
    where: stageWhere,
    orderBy: { order: 'asc' },
    select: {
      id: true,
      name: true,
      color: true,
      opportunities: {
        where: { organizationId: orgId, status: 'OPEN' },
        select: { value: true, probability: true },
      },
    },
  });

  return stages.map((stage) => {
    const totalValue = stage.opportunities.reduce(
      (sum, opp) => sum + Number(opp.value),
      0
    );
    const weightedValue = stage.opportunities.reduce(
      (sum, opp) => sum + Number(opp.value) * (opp.probability / 100),
      0
    );

    return {
      stageId: stage.id,
      stageName: stage.name,
      color: stage.color,
      count: stage.opportunities.length,
      totalValue,
      weightedValue,
    };
  });
}

export async function getByUser(orgId: string) {
  const users = await prisma.user.findMany({
    where: {
      organizations: { some: { organizationId: orgId } },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      assignedOpps: {
        where: { organizationId: orgId },
        select: { value: true, status: true },
      },
    },
  });

  return users
    .map((user) => {
      const openOpps = user.assignedOpps.filter((o) => o.status === 'OPEN');
      const wonOpps = user.assignedOpps.filter((o) => o.status === 'WON');

      return {
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        openCount: openOpps.length,
        totalValue: openOpps.reduce((sum, o) => sum + Number(o.value), 0),
        wonCount: wonOpps.length,
        wonValue: wonOpps.reduce((sum, o) => sum + Number(o.value), 0),
      };
    })
    .filter((u) => u.openCount > 0 || u.wonCount > 0);
}

type Period = 'month' | 'quarter' | 'year';

function getPeriodBuckets(period: Period): Array<{ label: string; start: Date; end: Date }> {
  const now = new Date();
  const buckets: Array<{ label: string; start: Date; end: Date }> = [];

  if (period === 'month') {
    // Last 12 months
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      const label = start.toLocaleString('default', { month: 'short', year: 'numeric' });
      buckets.push({ label, start, end });
    }
  } else if (period === 'quarter') {
    // Last 8 quarters
    const currentQuarter = Math.floor(now.getMonth() / 3);
    for (let i = 7; i >= 0; i--) {
      const totalQuarters = currentQuarter - i;
      const year = now.getFullYear() + Math.floor(totalQuarters / 4);
      const quarter = ((totalQuarters % 4) + 4) % 4;
      const start = new Date(year, quarter * 3, 1);
      const end = new Date(year, quarter * 3 + 3, 0, 23, 59, 59, 999);
      const label = `Q${quarter + 1} ${year}`;
      buckets.push({ label, start, end });
    }
  } else {
    // Last 3 years
    for (let i = 2; i >= 0; i--) {
      const year = now.getFullYear() - i;
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31, 23, 59, 59, 999);
      buckets.push({ label: String(year), start, end });
    }
  }

  return buckets;
}

export async function getByPeriod(orgId: string, period: Period = 'month') {
  const buckets = getPeriodBuckets(period);

  const earliest = buckets[0].start;
  const latest = buckets[buckets.length - 1].end;

  const closedOpportunities = await prisma.opportunity.findMany({
    where: {
      organizationId: orgId,
      status: { in: ['WON', 'LOST'] },
      actualCloseDate: { gte: earliest, lte: latest },
    },
    select: { status: true, value: true, actualCloseDate: true },
  });

  return buckets.map((bucket) => {
    const inBucket = closedOpportunities.filter(
      (o) =>
        o.actualCloseDate != null &&
        o.actualCloseDate >= bucket.start &&
        o.actualCloseDate <= bucket.end
    );

    const won = inBucket.filter((o) => o.status === 'WON');
    const lost = inBucket.filter((o) => o.status === 'LOST');

    return {
      period: bucket.label,
      wonCount: won.length,
      wonValue: won.reduce((sum, o) => sum + Number(o.value), 0),
      lostCount: lost.length,
    };
  });
}

export async function getConversionRates(orgId: string, pipelineId?: string) {
  const stageWhere: Record<string, unknown> = {
    pipeline: { organizationId: orgId },
  };

  if (pipelineId) {
    stageWhere.pipelineId = pipelineId;
  }

  const stages = await prisma.stage.findMany({
    where: stageWhere,
    orderBy: { order: 'asc' },
    select: {
      id: true,
      name: true,
      order: true,
      opportunities: {
        where: { organizationId: orgId },
        select: { id: true },
      },
    },
  });

  const results: Array<{ fromStage: string; toStage: string; rate: number }> = [];

  for (let i = 0; i < stages.length - 1; i++) {
    const fromStage = stages[i];
    const toStage = stages[i + 1];

    const fromCount = fromStage.opportunities.length;

    if (fromCount === 0) {
      results.push({
        fromStage: fromStage.name,
        toStage: toStage.name,
        rate: 0,
      });
      continue;
    }

    // Count opportunities that are at or beyond the toStage (by order)
    const advancedCount = await prisma.opportunity.count({
      where: {
        organizationId: orgId,
        ...(pipelineId ? { pipelineId } : {}),
        stage: { order: { gte: toStage.order } },
      },
    });

    const totalAtOrBeyondFrom = await prisma.opportunity.count({
      where: {
        organizationId: orgId,
        ...(pipelineId ? { pipelineId } : {}),
        stage: { order: { gte: fromStage.order } },
      },
    });

    const rate =
      totalAtOrBeyondFrom > 0
        ? Math.round((advancedCount / totalAtOrBeyondFrom) * 100 * 10) / 10
        : 0;

    results.push({
      fromStage: fromStage.name,
      toStage: toStage.name,
      rate,
    });
  }

  return results;
}
