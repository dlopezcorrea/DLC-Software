export interface PaginationParams {
  page?: number;
  perPage?: number;
}

export function getPaginationParams(query: Record<string, unknown>) {
  const page = Math.max(1, Number(query.page) || 1);
  const perPage = Math.min(100, Math.max(1, Number(query.perPage) || 25));
  const skip = (page - 1) * perPage;
  return { page, perPage, skip, take: perPage };
}

export function buildPaginationMeta(total: number, page: number, perPage: number) {
  return {
    page,
    perPage,
    total,
    totalPages: Math.ceil(total / perPage),
  };
}
