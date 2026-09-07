export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const ACCESS_TOKEN_KEY = 'firefiles.access_token';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.dispatchEvent(new Event('firefiles:unauthorized'));
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    if (response.status === 401) clearAccessToken();
    throw new ApiError(response.status, `API Error: ${response.statusText}`);
  }
  
  if (response.status !== 204) {
    return response.json();
  }
  
  return {} as T;
}

export const get = <T>(endpoint: string) => request<T>(endpoint);
export const post = <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) });
export const put = <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) });
export const patch = <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) });
export const del = <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' });

export async function checkHealth(): Promise<{status: string}> {
  return get<{status: string}>('/api/health');
}
