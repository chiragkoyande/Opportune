// ============================================================
// Opportune V4 — API Types
// Strongly typed API response structures, pagination & filters
// ============================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  cursor?: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  code?: string;
  details?: Record<string, unknown>;
}
