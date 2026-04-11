/**
 * SMISSI API client
 * Base URL is read from VITE_API_URL env var (default: http://localhost:3000/api)
 */

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

/* ─── Token helpers ──────────────────────────────────────────────── */
export function getToken(): string | null {
  return localStorage.getItem('smissi_token');
}
export function setToken(t: string): void {
  localStorage.setItem('smissi_token', t);
}
export function setRefreshToken(t: string): void {
  localStorage.setItem('smissi_refresh', t);
}
export function getRefreshToken(): string | null {
  return localStorage.getItem('smissi_refresh');
}
export function clearTokens(): void {
  localStorage.removeItem('smissi_token');
  localStorage.removeItem('smissi_refresh');
}

/* ─── Core fetch wrapper ─────────────────────────────────────────── */
async function req<T>(
  method: string,
  path: string,
  body?: unknown,
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));

  // unwrap the TransformInterceptor envelope { data, statusCode, timestamp }
  const data = (json as any)?.data ?? json;

  if (!res.ok) {
    const msg = (data as any)?.message ?? res.statusText;
    throw new Error(Array.isArray(msg) ? msg.join('; ') : String(msg));
  }

  return data as T;
}

/* ─── Auth ───────────────────────────────────────────────────────── */
export const authApi = {
  login: (email: string, password: string, role: string) =>
    req<{ accessToken: string; refreshToken: string; user: any }>(
      'POST', '/auth/login', { email, password, role }, false,
    ),

  refresh: (refreshToken: string) =>
    req<{ accessToken: string }>('POST', '/auth/refresh', { refreshToken }, false),

  me: () => req<any>('GET', '/users/me'),
};

/* ─── Admin Users ────────────────────────────────────────────────── */
export interface ApiUser {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  staffNo: string;
  roles: string[];
  schoolId: string;
  schoolName: string;
  isActive: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles: string[];
  phone?: string;
  staffNo?: string;
  schoolId?: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  roles?: string[];
  phone?: string;
  staffNo?: string;
  isActive?: boolean;
}

export const usersApi = {
  list: (params?: { search?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.status && params.status !== 'all') qs.set('status', params.status);
    const suffix = qs.toString() ? `?${qs}` : '';
    return req<ApiUser[]>('GET', `/users${suffix}`);
  },

  create: (payload: CreateUserPayload) =>
    req<ApiUser>('POST', '/users', payload),

  update: (id: string, payload: UpdateUserPayload) =>
    req<ApiUser>('PATCH', `/users/${id}`, payload),

  toggleStatus: (id: string) =>
    req<ApiUser>('PATCH', `/users/${id}/toggle-status`),

  get: (id: string) =>
    req<ApiUser>('GET', `/users/${id}`),
};

/* ─── School Profile ─────────────────────────────────────────────── */
export interface ApiSchool {
  id: string;
  name: string;
  code: string;
  motto: string;
  foundedYear: string;
  type: string;
  ownership: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  principalName: string;
  deoName: string;
  moesId: string;
  streams: string;
  country: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSchoolPayload {
  name?: string;
  code?: string;
  motto?: string;
  foundedYear?: string;
  type?: string;
  ownership?: string;
  district?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  principalName?: string;
  deoName?: string;
  moesId?: string;
  streams?: string;
}

export const schoolApi = {
  get:    ()                          => req<ApiSchool>('GET',   '/schools/me'),
  update: (payload: UpdateSchoolPayload) => req<ApiSchool>('PATCH', '/schools/me', payload),
};

/* ─── Activity Log ───────────────────────────────────────────────── */
export interface ApiActivity {
  id: string;
  type: string;
  description: string;
  userName: string;
  userRole: string;
  ipAddress: string;
  severity: 'info' | 'success' | 'warn' | 'danger';
  entityType: string;
  entityId: string;
  createdAt: string;
}

export interface ActivityListResponse {
  data: ApiActivity[];
  total: number;
}

export const activityApi = {
  list: (params?: {
    limit?: number;
    skip?: number;
    severity?: string;
    search?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.limit)    qs.set('limit',    String(params.limit));
    if (params?.skip)     qs.set('skip',     String(params.skip));
    if (params?.severity) qs.set('severity', params.severity);
    if (params?.search)   qs.set('search',   params.search);
    const suffix = qs.toString() ? `?${qs}` : '';
    return req<ActivityListResponse>('GET', `/activity${suffix}`);
  },

  purgeOld: () =>
    req<{ deleted: number; message: string }>('DELETE', '/activity/old'),
};

/* ─── Approvals ──────────────────────────────────────────────────── */
export interface ApiApproval {
  id: string;
  type: string;
  title: string;
  description: string;
  urgency: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedById: string;
  requestedBy?: { id: string; firstName: string; lastName: string; email: string; roles: string[] };
  reviewedById: string;
  reviewedBy?: { id: string; firstName: string; lastName: string };
  reviewNotes: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export const approvalsApi = {
  listPending: () =>
    req<ApiApproval[]>('GET', '/approvals/pending'),

  listAll: (status?: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    const qs = status ? `?status=${status}` : '';
    return req<ApiApproval[]>('GET', `/approvals${qs}`);
  },

  approve: (id: string, notes?: string) =>
    req<ApiApproval>('POST', `/approvals/${id}/approve`, { notes }),

  reject: (id: string, notes?: string) =>
    req<ApiApproval>('POST', `/approvals/${id}/reject`, { notes }),
};

/* ─── Admin Stats ────────────────────────────────────────────────── */
export interface ApiAdminStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalStudents: number;
  pendingApprovals: number;
  feeCollectedThisTerm: number | null;
  systemUptime: string;
  openSupportTickets: number;
}

export const adminStatsApi = {
  getStats: () => req<ApiAdminStats>('GET', '/admin/stats'),
};
