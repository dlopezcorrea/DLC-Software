import { prisma } from '../../../config/database';
import { NotFoundError, ConflictError } from '../../../utils/errors';
import { getPaginationParams, buildPaginationMeta } from '../../../utils/pagination';
import type { CreateTemplateInput, UpdateTemplateInput, PreviewTemplateInput } from './templates.schema';

export async function listTemplates(orgId: string, query: Record<string, unknown>) {
  const { page, perPage, skip, take } = getPaginationParams(query);

  const where: Record<string, unknown> = { organizationId: orgId };

  if (query.isActive !== undefined) {
    where.isActive = query.isActive === 'true' || query.isActive === true;
  }

  if (query.search && typeof query.search === 'string') {
    const search = query.search.trim();
    where.name = { contains: search, mode: 'insensitive' };
  }

  const [templates, total] = await Promise.all([
    prisma.emailTemplate.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        subject: true,
        previewText: true,
        variables: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.emailTemplate.count({ where }),
  ]);

  return {
    templates,
    meta: buildPaginationMeta(total, page, perPage),
  };
}

export async function getTemplateById(orgId: string, id: string) {
  const template = await prisma.emailTemplate.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!template) {
    throw new NotFoundError('Email template');
  }

  return template;
}

export async function createTemplate(orgId: string, data: CreateTemplateInput) {
  const existing = await prisma.emailTemplate.findFirst({
    where: { organizationId: orgId, name: data.name },
  });

  if (existing) {
    throw new ConflictError(`An email template named '${data.name}' already exists`);
  }

  const template = await prisma.emailTemplate.create({
    data: {
      organizationId: orgId,
      name: data.name,
      subject: data.subject,
      htmlBody: data.htmlBody,
      plainBody: data.plainBody ?? null,
      variables: data.variables ?? [],
      previewText: data.previewText ?? null,
    },
  });

  return template;
}

export async function updateTemplate(orgId: string, id: string, data: UpdateTemplateInput) {
  const existing = await prisma.emailTemplate.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Email template');
  }

  if (data.name && data.name !== existing.name) {
    const duplicate = await prisma.emailTemplate.findFirst({
      where: { organizationId: orgId, name: data.name, NOT: { id } },
    });
    if (duplicate) {
      throw new ConflictError(`An email template named '${data.name}' already exists`);
    }
  }

  const template = await prisma.emailTemplate.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.subject !== undefined && { subject: data.subject }),
      ...(data.htmlBody !== undefined && { htmlBody: data.htmlBody }),
      ...(data.plainBody !== undefined && { plainBody: data.plainBody }),
      ...(data.variables !== undefined && { variables: data.variables }),
      ...(data.previewText !== undefined && { previewText: data.previewText }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });

  return template;
}

export async function deleteTemplate(orgId: string, id: string) {
  const existing = await prisma.emailTemplate.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Email template');
  }

  await prisma.emailTemplate.delete({ where: { id } });

  return { message: 'Email template deleted successfully' };
}

export async function previewTemplate(
  orgId: string,
  id: string,
  input: PreviewTemplateInput
) {
  const template = await prisma.emailTemplate.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!template) {
    throw new NotFoundError('Email template');
  }

  let renderedHtml = template.htmlBody;
  let renderedPlain = template.plainBody ?? '';
  let renderedSubject = template.subject;

  for (const [key, value] of Object.entries(input.data)) {
    const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    renderedHtml = renderedHtml.replace(placeholder, value);
    renderedPlain = renderedPlain.replace(placeholder, value);
    renderedSubject = renderedSubject.replace(placeholder, value);
  }

  return {
    subject: renderedSubject,
    htmlBody: renderedHtml,
    plainBody: renderedPlain || null,
    previewText: template.previewText,
  };
}
