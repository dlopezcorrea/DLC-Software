import { prisma } from '../../../config/database';
import { NotFoundError, ValidationError } from '../../../utils/errors';
import { getPaginationParams, buildPaginationMeta } from '../../../utils/pagination';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateArticleInput,
  UpdateArticleInput,
} from './kb.schema';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

async function ensureUniqueSlug(baseSlug: string, existingId?: string): Promise<string> {
  let slug = baseSlug;
  let attempt = 0;

  while (true) {
    const conflict = await prisma.kBArticle.findFirst({
      where: {
        slug,
        ...(existingId ? { NOT: { id: existingId } } : {}),
      },
    });

    if (!conflict) break;

    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  return slug;
}

async function ensureUniqueCategorySlug(
  orgId: string,
  baseSlug: string,
  existingId?: string
): Promise<string> {
  let slug = baseSlug;
  let attempt = 0;

  while (true) {
    const conflict = await prisma.kBCategory.findFirst({
      where: {
        organizationId: orgId,
        slug,
        ...(existingId ? { NOT: { id: existingId } } : {}),
      },
    });

    if (!conflict) break;

    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  return slug;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function listCategories(orgId: string) {
  const allCategories = await prisma.kBCategory.findMany({
    where: { organizationId: orgId },
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    include: {
      _count: {
        select: { articles: true },
      },
    },
  });

  const categoryMap = new Map<
    string,
    (typeof allCategories)[0] & { children: unknown[]; articleCount: number }
  >();

  const roots: (typeof allCategories)[0] & { children: unknown[]; articleCount: number }[] = [];

  for (const cat of allCategories) {
    categoryMap.set(cat.id, {
      ...cat,
      children: [],
      articleCount: cat._count.articles,
    });
  }

  for (const cat of allCategories) {
    const node = categoryMap.get(cat.id)!;
    if (cat.parentId) {
      const parent = categoryMap.get(cat.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function createCategory(orgId: string, data: CreateCategoryInput) {
  const baseSlug = slugify(data.name);
  const slug = await ensureUniqueCategorySlug(orgId, baseSlug);

  const category = await prisma.kBCategory.create({
    data: {
      organizationId: orgId,
      name: data.name,
      slug,
      description: data.description,
      parentId: data.parentId ?? null,
      isPublic: data.isPublic ?? true,
    },
  });

  return category;
}

export async function updateCategory(orgId: string, id: string, data: UpdateCategoryInput) {
  const existing = await prisma.kBCategory.findFirst({
    where: { id, organizationId: orgId },
  });

  if (!existing) {
    throw new NotFoundError('Category');
  }

  let slug = existing.slug;
  if (data.name && data.name !== existing.name) {
    const baseSlug = slugify(data.name);
    slug = await ensureUniqueCategorySlug(orgId, baseSlug, id);
  }

  const category = await prisma.kBCategory.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name, slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...('parentId' in data && { parentId: data.parentId ?? null }),
      ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
    },
  });

  return category;
}

export async function deleteCategory(orgId: string, id: string) {
  const existing = await prisma.kBCategory.findFirst({
    where: { id, organizationId: orgId },
    include: { _count: { select: { articles: true } } },
  });

  if (!existing) {
    throw new NotFoundError('Category');
  }

  if (existing._count.articles > 0) {
    throw new ValidationError(
      `Cannot delete category with ${existing._count.articles} article(s). Move or delete them first.`
    );
  }

  await prisma.kBCategory.delete({ where: { id } });

  return { message: 'Category deleted successfully' };
}

// ─── Articles ─────────────────────────────────────────────────────────────────

export async function listArticles(orgId: string, query: Record<string, unknown>) {
  const { page, perPage, skip, take } = getPaginationParams(query);

  const where: Record<string, unknown> = {
    category: { organizationId: orgId },
  };

  if (query.categoryId && typeof query.categoryId === 'string') {
    where.categoryId = query.categoryId;
  }

  if (query.status && typeof query.status === 'string') {
    where.status = query.status;
  }

  if (query.search && typeof query.search === 'string') {
    const search = query.search.trim();
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [articles, total] = await Promise.all([
    prisma.kBArticle.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    }),
    prisma.kBArticle.count({ where }),
  ]);

  return {
    articles,
    meta: buildPaginationMeta(total, page, perPage),
  };
}

export async function getArticleById(orgId: string, id: string) {
  const article = await prisma.kBArticle.findFirst({
    where: {
      id,
      category: { organizationId: orgId },
    },
    include: {
      category: true,
    },
  });

  if (!article) {
    throw new NotFoundError('Article');
  }

  await prisma.kBArticle.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  return { ...article, viewCount: article.viewCount + 1 };
}

export async function createArticle(orgId: string, data: CreateArticleInput) {
  const category = await prisma.kBCategory.findFirst({
    where: { id: data.categoryId, organizationId: orgId },
  });

  if (!category) {
    throw new NotFoundError('Category');
  }

  const baseSlug = slugify(data.title);
  const slug = await ensureUniqueSlug(baseSlug);

  const article = await prisma.kBArticle.create({
    data: {
      categoryId: data.categoryId,
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt,
      isPublic: data.isPublic ?? true,
      tags: data.tags ?? [],
    },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return article;
}

export async function updateArticle(orgId: string, id: string, data: UpdateArticleInput) {
  const existing = await prisma.kBArticle.findFirst({
    where: {
      id,
      category: { organizationId: orgId },
    },
  });

  if (!existing) {
    throw new NotFoundError('Article');
  }

  if (data.categoryId) {
    const category = await prisma.kBCategory.findFirst({
      where: { id: data.categoryId, organizationId: orgId },
    });
    if (!category) {
      throw new NotFoundError('Category');
    }
  }

  let slug = existing.slug;
  if (data.title && data.title !== existing.title) {
    const baseSlug = slugify(data.title);
    slug = await ensureUniqueSlug(baseSlug, id);
  }

  const article = await prisma.kBArticle.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title, slug }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
      ...(data.tags !== undefined && { tags: data.tags }),
    },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return article;
}

export async function deleteArticle(orgId: string, id: string) {
  const existing = await prisma.kBArticle.findFirst({
    where: {
      id,
      category: { organizationId: orgId },
    },
  });

  if (!existing) {
    throw new NotFoundError('Article');
  }

  await prisma.kBArticle.delete({ where: { id } });

  return { message: 'Article deleted successfully' };
}

export async function publishArticle(orgId: string, id: string) {
  const existing = await prisma.kBArticle.findFirst({
    where: {
      id,
      category: { organizationId: orgId },
    },
  });

  if (!existing) {
    throw new NotFoundError('Article');
  }

  const article = await prisma.kBArticle.update({
    where: { id },
    data: {
      status: 'PUBLISHED',
      publishedAt: existing.publishedAt ?? new Date(),
    },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return article;
}

export async function submitFeedback(id: string, helpful: boolean) {
  const existing = await prisma.kBArticle.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError('Article');
  }

  const article = await prisma.kBArticle.update({
    where: { id },
    data: helpful
      ? { helpfulCount: { increment: 1 } }
      : { notHelpfulCount: { increment: 1 } },
    select: {
      id: true,
      helpfulCount: true,
      notHelpfulCount: true,
    },
  });

  return article;
}

export async function searchKB(orgId: string, q: string) {
  if (!q || q.trim().length === 0) {
    return { articles: [] };
  }

  const search = q.trim();

  const articles = await prisma.kBArticle.findMany({
    where: {
      category: { organizationId: orgId },
      status: 'PUBLISHED',
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ],
    },
    orderBy: [{ viewCount: 'desc' }, { helpfulCount: 'desc' }],
    take: 20,
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return { articles };
}
