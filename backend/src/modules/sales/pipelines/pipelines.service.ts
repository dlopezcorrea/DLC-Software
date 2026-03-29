import { prisma } from '../../../config/database';
import { NotFoundError, ConflictError } from '../../../utils/errors';
import type { Prisma } from '@prisma/client';
import type {
  CreatePipelineInput,
  UpdatePipelineInput,
  CreateStageInput,
  UpdateStageInput,
  ReorderStagesInput,
} from './pipelines.schema';

const DEFAULT_STAGES = [
  { name: 'Prospecting', probability: 10, color: '#6366f1', isWon: false, isLost: false, order: 1 },
  { name: 'Qualification', probability: 25, color: '#8b5cf6', isWon: false, isLost: false, order: 2 },
  { name: 'Proposal', probability: 50, color: '#f59e0b', isWon: false, isLost: false, order: 3 },
  { name: 'Negotiation', probability: 75, color: '#f97316', isWon: false, isLost: false, order: 4 },
  { name: 'Closed Won', probability: 100, color: '#22c55e', isWon: true, isLost: false, order: 5 },
  { name: 'Closed Lost', probability: 0, color: '#ef4444', isWon: false, isLost: true, order: 6 },
];

export async function listPipelines(orgId: string) {
  const pipelines = await prisma.pipeline.findMany({
    where: { organizationId: orgId, isActive: true },
    orderBy: { createdAt: 'asc' },
    include: {
      stages: {
        orderBy: { order: 'asc' },
        include: {
          _count: {
            select: { opportunities: true },
          },
        },
      },
      _count: {
        select: { opportunities: true },
      },
    },
  });

  return pipelines;
}

export async function createPipeline(orgId: string, data: CreatePipelineInput) {
  const pipeline = await prisma.pipeline.create({
    data: {
      organizationId: orgId,
      name: data.name,
      description: data.description,
      currency: data.currency ?? 'USD',
      stages: {
        create: DEFAULT_STAGES,
      },
    },
    include: {
      stages: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return pipeline;
}

export async function getPipelineById(orgId: string, id: string) {
  const pipeline = await prisma.pipeline.findFirst({
    where: { id, organizationId: orgId },
    include: {
      stages: {
        orderBy: { order: 'asc' },
        include: {
          opportunities: {
            where: { status: 'OPEN' },
            orderBy: { createdAt: 'desc' },
            include: {
              contact: {
                select: { id: true, firstName: true, lastName: true, email: true },
              },
              assignee: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
          },
        },
      },
    },
  });

  if (!pipeline) {
    throw new NotFoundError('Pipeline');
  }

  return pipeline;
}

export async function updatePipeline(orgId: string, id: string, data: UpdatePipelineInput) {
  const existing = await prisma.pipeline.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Pipeline');
  }

  const pipeline = await prisma.pipeline.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.currency !== undefined && { currency: data.currency }),
    },
    include: {
      stages: { orderBy: { order: 'asc' } },
    },
  });

  return pipeline;
}

export async function deletePipeline(orgId: string, id: string) {
  const existing = await prisma.pipeline.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Pipeline');
  }

  const openOpportunities = await prisma.opportunity.count({
    where: { pipelineId: id, status: 'OPEN' },
  });

  if (openOpportunities > 0) {
    throw new ConflictError(
      `Cannot delete pipeline with ${openOpportunities} open opportunity(s). Close or move them first.`
    );
  }

  await prisma.pipeline.update({
    where: { id },
    data: { isActive: false },
  });

  return { message: 'Pipeline deleted successfully' };
}

export async function addStage(pipelineId: string, data: CreateStageInput) {
  const pipeline = await prisma.pipeline.findUnique({
    where: { id: pipelineId },
  });

  if (!pipeline) {
    throw new NotFoundError('Pipeline');
  }

  const maxOrderResult = await prisma.stage.aggregate({
    where: { pipelineId },
    _max: { order: true },
  });

  const nextOrder = (maxOrderResult._max.order ?? 0) + 1;

  const stage = await prisma.stage.create({
    data: {
      pipelineId,
      name: data.name,
      probability: data.probability,
      color: data.color ?? '#6366f1',
      isWon: data.isWon ?? false,
      isLost: data.isLost ?? false,
      order: nextOrder,
    },
  });

  return stage;
}

export async function updateStage(pipelineId: string, stageId: string, data: UpdateStageInput) {
  const existing = await prisma.stage.findFirst({
    where: { id: stageId, pipelineId },
  });

  if (!existing) {
    throw new NotFoundError('Stage');
  }

  const stage = await prisma.stage.update({
    where: { id: stageId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.probability !== undefined && { probability: data.probability }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.isWon !== undefined && { isWon: data.isWon }),
      ...(data.isLost !== undefined && { isLost: data.isLost }),
      ...(data.order !== undefined && { order: data.order }),
    },
  });

  return stage;
}

export async function deleteStage(pipelineId: string, stageId: string) {
  const stage = await prisma.stage.findFirst({
    where: { id: stageId, pipelineId },
  });

  if (!stage) {
    throw new NotFoundError('Stage');
  }

  // Find previous stage to move opportunities to
  const previousStage = await prisma.stage.findFirst({
    where: {
      pipelineId,
      order: { lt: stage.order },
      id: { not: stageId },
    },
    orderBy: { order: 'desc' },
  });

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Move opportunities to previous stage (or null if no previous stage)
    if (previousStage) {
      await tx.opportunity.updateMany({
        where: { stageId },
        data: { stageId: previousStage.id },
      });
    } else {
      // Find next stage as fallback
      const nextStage = await tx.stage.findFirst({
        where: {
          pipelineId,
          order: { gt: stage.order },
          id: { not: stageId },
        },
        orderBy: { order: 'asc' },
      });

      if (nextStage) {
        await tx.opportunity.updateMany({
          where: { stageId },
          data: { stageId: nextStage.id },
        });
      }
    }

    await tx.stage.delete({ where: { id: stageId } });
  });

  return { message: 'Stage deleted successfully' };
}

export async function reorderStages(pipelineId: string, data: ReorderStagesInput) {
  const pipeline = await prisma.pipeline.findUnique({
    where: { id: pipelineId },
  });

  if (!pipeline) {
    throw new NotFoundError('Pipeline');
  }

  await prisma.$transaction(
    data.stages.map((s: { id: string; order: number }) =>
      prisma.stage.update({
        where: { id: s.id },
        data: { order: s.order },
      })
    )
  );

  const stages = await prisma.stage.findMany({
    where: { pipelineId },
    orderBy: { order: 'asc' },
  });

  return stages;
}
