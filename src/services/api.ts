// ============================================================
// Opportune V4 — API Client
// Centralized HTTP client configured with VITE_API_URL,
// authentication headers, error handling and resilient fallbacks.
// ============================================================

import { supabase } from '@/integrations/supabase/client';
import { ApiError } from '@/types/api';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/+$/, '');

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  timeoutMs?: number;
}

/**
 * Custom application API error class
 */
export class OpportuneApiError extends Error implements ApiError {
  statusCode?: number;
  code?: string;
  details?: Record<string, unknown>;

  constructor(message: string, statusCode?: number, code?: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'OpportuneApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Format search params object into query string
 */
function buildQueryString(params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  }
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Execute an authenticated API request with fallback mechanism
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
  fallbackData?: T
): Promise<T> {
  const { params, timeoutMs = 8000, headers: customHeaders, ...fetchOptions } = options;
  const queryString = buildQueryString(params);
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${API_BASE_URL}${cleanEndpoint}${queryString}`;

  const headers = new Headers(customHeaders);
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');

  // Attach Supabase auth token if user is signed in
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      headers.set('Authorization', `Bearer ${data.session.access_token}`);
    }
  } catch {
    // Ignore session fetch errors on public calls
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(fullUrl, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404 && fallbackData !== undefined) {
        return fallbackData;
      }
      let errorData: { message?: string; code?: string; details?: Record<string, unknown> } = {};
      try {
        errorData = await response.json();
      } catch {
        // Response wasn't json
      }
      throw new OpportuneApiError(
        errorData.message || `Request failed with status ${response.status}`,
        response.status,
        errorData.code,
        errorData.details
      );
    }

    const json = await response.json();
    return json as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    // If fallback data was provided and network failed/timed out, safely return fallback
    if (fallbackData !== undefined) {
      return fallbackData;
    }

    if (err instanceof OpportuneApiError) {
      throw err;
    }

    const message = err instanceof Error ? err.message : 'Unknown network error';
    throw new OpportuneApiError(message, 0, 'NETWORK_ERROR');
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions, fallback?: T) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }, fallback),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions, fallback?: T) =>
    apiRequest<T>(
      endpoint,
      {
        ...options,
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      },
      fallback
    ),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions, fallback?: T) =>
    apiRequest<T>(
      endpoint,
      {
        ...options,
        method: 'PATCH',
        body: body ? JSON.stringify(body) : undefined,
      },
      fallback
    ),

  delete: <T>(endpoint: string, options?: RequestOptions, fallback?: T) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }, fallback),
};
