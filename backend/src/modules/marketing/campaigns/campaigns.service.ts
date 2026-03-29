import { prisma } from '../../../config/database';
import { NotFoundError, ValidationError } from '../../../utils/errors';
import { getPaginationParams, buildPaginationMeta } from '../../../utils/pagination';
import { emailTransporter } from '../../../config/email';
import { env } from '../../../config/env';
import type { CreateCampaignInput, UpdateCampaignInput } from './campaigns.schema';

export async function listCampaigns(orgId: string, query: Record<string, unknown>) {
  const { page, perPage, skip, take } = getPaginationParams(query);

  const where: Record<string, unknown> = { organizationId: orgId };

  if (query.status && typeof query.status === 'string') {
    where.status = query.status;
  }

  if (query.type && typeof query.type === 'string') {
    where.type = query.type;
  }

  if (query.search && typeof query.search === 'string') {
    where.name = { contains: query.search.trim(), mode: 'insensitive' };
  }

  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        emailTemplate: {
          select: { id: true, name: true },
        },
        _count: {
          select: { contacts: true },
        },
      },
    }),
    prisma.campaign.count({ where }),
  ]);

  const result = campaigns.map((c) => ({
    ...c,
    recipientCount: c._count.contacts,
    _count: undefined,
  }));

  return {
    campaigns: result,
    meta: buildPaginationMeta(total, page, perPage),
  };
}

export async function getCampaignById(orgId: string, id: string) {
  const campaign = await prisma.campaign.findFirst({
    where: { id, organizationId: orgId },
    include: {
      emailTemplate: {
        select: { id: true, name: true, subject: true },
      },
      segments: {
        include: {
          segment: {
            select: { id: true, name: true, memberCount: true },
          },
        },
      },
    },
  });

  if (!campaign) {
    throw new NotFoundError('Campaign');
  }

  const analytics = {
    totalRecipients: campaign.totalRecipients,
    sentCount: campaign.sentCount,
    deliveredCount: campaign.deliveredCount,
    openCount: campaign.openCount,
    clickCount: campaign.clickCount,
    bounceCount: campaign.bounceCount,
    unsubscribeCount: campaign.unsubscribeCount,
    openRate:
      campaign.deliveredCount > 0
        ? ((campaign.openCount / campaign.deliveredCount) * 100).toFixed(2)
        : '0.00',
    clickRate:
      campaign.deliveredCount > 0
        ? ((campaign.clickCount / campaign.deliveredCount) * 100).toFixed(2)
        : '0.00',
    bounceRate:
      campaign.totalRecipients > 0
        ? ((campaign.bounceCount / campaign.totalRecipients) * 100).toFixed(2)
        : '0.00',
  };

  return {
    ...campaign,
    segments: campaign.segments.map((cs) => cs.segment),
    analytics,
  };
}

export async function createCampaign(orgId: string, data: CreateCampaignInput) {
  const { segmentIds, ...campaignData } = data;

  const campaign = await prisma.campaign.create({
    data: {
      organizationId: orgId,
      name: campaignData.name,
      description: campaignData.description ?? null,
      type: campaignData.type ?? 'EMAIL',
      emailTemplateId: campaignData.emailTemplateId ?? null,
      fromName: campaignData.fromName ?? null,
      fromEmail: campaignData.fromEmail ?? null,
      replyTo: campaignData.replyTo ?? null,
      subject: campaignData.subject ?? null,
      ...(segmentIds && segmentIds.length > 0
        ? {
            segments: {
              create: segmentIds.map((segmentId) => ({ segmentId })),
            },
          }
        : {}),
    },
    include: {
      segments: {
        include: {
          segment: { select: { id: true, name: true, memberCount: true } },
        },
      },
    },
  });

  return {
    ...campaign,
    segments: campaign.segments.map((cs) => cs.segment),
  };
}

export async function updateCampaign(orgId: string, id: string, data: UpdateCampaignInput) {
  const existing = await prisma.campaign.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Campaign');
  }

  const { segmentIds, ...campaignData } = data;

  await prisma.campaign.update({
    where: { id },
    data: {
      ...(campaignData.name !== undefined && { name: campaignData.name }),
      ...(campaignData.description !== undefined && { description: campaignData.description }),
      ...(campaignData.type !== undefined && { type: campaignData.type }),
      ...('emailTemplateId' in campaignData && {
        emailTemplateId: campaignData.emailTemplateId ?? null,
      }),
      ...(campaignData.fromName !== undefined && { fromName: campaignData.fromName }),
      ...(campaignData.fromEmail !== undefined && { fromEmail: campaignData.fromEmail }),
      ...(campaignData.replyTo !== undefined && { replyTo: campaignData.replyTo }),
      ...(campaignData.subject !== undefined && { subject: campaignData.subject }),
    },
  });

  if (segmentIds !== undefined) {
    await prisma.campaignSegment.deleteMany({ where: { campaignId: id } });
    if (segmentIds.length > 0) {
      await prisma.campaignSegment.createMany({
        data: segmentIds.map((segmentId) => ({ campaignId: id, segmentId })),
        skipDuplicates: true,
      });
    }
  }

  const updated = await prisma.campaign.findUniqueOrThrow({
    where: { id },
    include: {
      emailTemplate: { select: { id: true, name: true, subject: true } },
      segments: {
        include: {
          segment: { select: { id: true, name: true, memberCount: true } },
        },
      },
    },
  });

  return {
    ...updated,
    segments: updated.segments.map((cs) => cs.segment),
  };
}

export async function deleteCampaign(orgId: string, id: string) {
  const existing = await prisma.campaign.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Campaign');
  }

  if (existing.status !== 'DRAFT') {
    throw new ValidationError('Only campaigns in DRAFT status can be deleted');
  }

  await prisma.campaign.delete({ where: { id } });

  return { message: 'Campaign deleted successfully' };
}

export async function scheduleCampaign(orgId: string, id: string, scheduledAt: string) {
  const existing = await prisma.campaign.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Campaign');
  }

  if (existing.status !== 'DRAFT' && existing.status !== 'SCHEDULED') {
    throw new ValidationError('Only DRAFT or SCHEDULED campaigns can be scheduled');
  }

  const campaign = await prisma.campaign.update({
    where: { id },
    data: {
      status: 'SCHEDULED',
      scheduledAt: new Date(scheduledAt),
    },
  });

  return campaign;
}

export async function sendNow(orgId: string, id: string) {
  const campaign = await prisma.campaign.findFirst({
    where: { id, organizationId: orgId },
    include: {
      emailTemplate: true,
      segments: {
        include: {
          segment: {
            include: {
              members: {
                include: {
                  contact: {
                    select: {
                      id: true,
                      email: true,
                      firstName: true,
                      lastName: true,
                      emailOptIn: true,
                      doNotContact: true,
                      isActive: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!campaign) {
    throw new NotFoundError('Campaign');
  }

  if (campaign.status !== 'DRAFT' && campaign.status !== 'SCHEDULED') {
    throw new ValidationError('Campaign must be in DRAFT or SCHEDULED status to send');
  }

  if (!campaign.emailTemplate) {
    throw new ValidationError('Campaign must have an email template before sending');
  }

  if (!campaign.segments || campaign.segments.length === 0) {
    throw new ValidationError('Campaign must have at least one segment before sending');
  }

  // Collect and deduplicate contacts across all segments
  const contactMap = new Map<
    string,
    {
      id: string;
      email: string | null;
      firstName: string;
      lastName: string;
      emailOptIn: boolean;
      doNotContact: boolean;
      isActive: boolean;
    }
  >();

  for (const campaignSegment of campaign.segments) {
    for (const membership of campaignSegment.segment.members) {
      const contact = membership.contact;
      if (!contactMap.has(contact.id)) {
        contactMap.set(contact.id, contact);
      }
    }
  }

  const contacts = Array.from(contactMap.values()).filter(
    (c) => c.isActive && !c.doNotContact && c.emailOptIn && c.email
  );

  const totalRecipients = contacts.length;

  // Create CampaignContact records as PENDING
  if (totalRecipients > 0) {
    await prisma.campaignContact.createMany({
      data: contacts.map((c) => ({
        campaignId: id,
        contactId: c.id,
        status: 'PENDING' as const,
      })),
      skipDuplicates: true,
    });
  }

  // Set campaign to RUNNING
  await prisma.campaign.update({
    where: { id },
    data: {
      status: 'RUNNING',
      startedAt: new Date(),
      totalRecipients,
    },
  });

  let sentCount = 0;
  let deliveredCount = 0;
  let bounceCount = 0;

  const fromAddress = campaign.fromEmail
    ? `${campaign.fromName ?? env.SMTP_FROM_NAME} <${campaign.fromEmail}>`
    : `${env.SMTP_FROM_NAME} <${env.SMTP_FROM_EMAIL}>`;

  const subject =
    campaign.subject ?? campaign.emailTemplate.subject;

  // Send emails synchronously
  for (const contact of contacts) {
    const campaignContactRecord = await prisma.campaignContact.findUnique({
      where: { campaignId_contactId: { campaignId: id, contactId: contact.id } },
    });

    if (!campaignContactRecord) continue;

    // Replace template variables with contact data
    const variableMap: Record<string, string> = {
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email ?? '',
      fullName: `${contact.firstName} ${contact.lastName}`.trim(),
    };

    let renderedHtml = campaign.emailTemplate.htmlBody;
    let renderedPlain = campaign.emailTemplate.plainBody ?? '';
    let renderedSubject = subject;

    for (const [key, value] of Object.entries(variableMap)) {
      const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      renderedHtml = renderedHtml.replace(placeholder, value);
      renderedPlain = renderedPlain.replace(placeholder, value);
      renderedSubject = renderedSubject.replace(placeholder, value);
    }

    try {
      await emailTransporter.sendMail({
        from: fromAddress,
        to: contact.email!,
        replyTo: campaign.replyTo ?? undefined,
        subject: renderedSubject,
        html: renderedHtml,
        text: renderedPlain || undefined,
      });

      await prisma.campaignContact.update({
        where: { id: campaignContactRecord.id },
        data: { status: 'DELIVERED', sentAt: new Date() },
      });

      sentCount++;
      deliveredCount++;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';

      await prisma.campaignContact.update({
        where: { id: campaignContactRecord.id },
        data: {
          status: 'BOUNCED',
          bouncedAt: new Date(),
          errorMsg: errorMessage,
        },
      });

      bounceCount++;
    }
  }

  // Mark campaign as COMPLETED
  const completed = await prisma.campaign.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      sentCount,
      deliveredCount,
      bounceCount,
    },
  });

  return completed;
}

export async function pauseCampaign(orgId: string, id: string) {
  const existing = await prisma.campaign.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Campaign');
  }

  if (existing.status !== 'RUNNING') {
    throw new ValidationError('Only RUNNING campaigns can be paused');
  }

  const campaign = await prisma.campaign.update({
    where: { id },
    data: { status: 'PAUSED' },
  });

  return campaign;
}

export async function cancelCampaign(orgId: string, id: string) {
  const existing = await prisma.campaign.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Campaign');
  }

  if (existing.status === 'COMPLETED') {
    throw new ValidationError('Completed campaigns cannot be cancelled');
  }

  const campaign = await prisma.campaign.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  return campaign;
}

export async function getCampaignAnalytics(orgId: string, id: string) {
  const campaign = await prisma.campaign.findFirst({
    where: { id, organizationId: orgId },
    select: {
      id: true,
      name: true,
      status: true,
      type: true,
      totalRecipients: true,
      sentCount: true,
      deliveredCount: true,
      openCount: true,
      clickCount: true,
      bounceCount: true,
      unsubscribeCount: true,
      scheduledAt: true,
      startedAt: true,
      completedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!campaign) {
    throw new NotFoundError('Campaign');
  }

  const statusBreakdown = await prisma.campaignContact.groupBy({
    by: ['status'],
    where: { campaignId: id },
    _count: { status: true },
  });

  const breakdown = statusBreakdown.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = row._count.status;
    return acc;
  }, {});

  return {
    ...campaign,
    openRate:
      campaign.deliveredCount > 0
        ? parseFloat(((campaign.openCount / campaign.deliveredCount) * 100).toFixed(2))
        : 0,
    clickRate:
      campaign.deliveredCount > 0
        ? parseFloat(((campaign.clickCount / campaign.deliveredCount) * 100).toFixed(2))
        : 0,
    bounceRate:
      campaign.totalRecipients > 0
        ? parseFloat(((campaign.bounceCount / campaign.totalRecipients) * 100).toFixed(2))
        : 0,
    unsubscribeRate:
      campaign.deliveredCount > 0
        ? parseFloat(((campaign.unsubscribeCount / campaign.deliveredCount) * 100).toFixed(2))
        : 0,
    breakdown,
  };
}

export async function getCampaignContacts(
  orgId: string,
  campaignId: string,
  query: Record<string, unknown>
) {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, organizationId: orgId },
  });

  if (!campaign) {
    throw new NotFoundError('Campaign');
  }

  const { page, perPage, skip, take } = getPaginationParams(query);

  const statusFilter =
    query.status && typeof query.status === 'string' ? { status: query.status as never } : {};

  const [records, total] = await Promise.all([
    prisma.campaignContact.findMany({
      where: { campaignId, ...statusFilter },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            jobTitle: true,
            department: true,
            type: true,
            isActive: true,
          },
        },
      },
    }),
    prisma.campaignContact.count({ where: { campaignId, ...statusFilter } }),
  ]);

  return {
    contacts: records,
    meta: buildPaginationMeta(total, page, perPage),
  };
}
