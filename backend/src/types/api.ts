// ============================================================
// OPPORTUNE V4 — API Types
// Pagination & Standardized Envelopes
// ============================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasMore: boolean;
  hasPrevPage: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  pageSize?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  code: string;
  details?: Record<string, unknown>;
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    data,
    total,
    page,
    limit,
    pageSize: limit,
    totalPages,
    hasNextPage,
    hasMore: hasNextPage,
    hasPrevPage,
  };
}
