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

/* ─── Admin Terms ────────────────────────────────────────────────── */
export interface ApiTerm {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  weeks: number;
  status: 'current' | 'upcoming' | 'past';
}

export const termsApi = {
  list:   ()                    => req<ApiTerm[]>('GET',   '/admin/terms'),
  create: (body: Partial<ApiTerm>) => req<ApiTerm>('POST', '/admin/terms', body),
  update: (id: string, body: Partial<ApiTerm>) => req<ApiTerm>('PATCH', `/admin/terms/${id}`, body),
};

/* ─── Fee Structure ──────────────────────────────────────────────── */
export interface ApiFeeStructureItem {
  id: string;
  classLevel: string;
  category: string;
  tuition: number;
  boarding: number;
  meals: number;
  devLevy: number;
  total: number;
  term: string;
  academicYear: string;
  isActive: boolean;
}

export const feeStructureApi = {
  list:   (term?: string, academicYear?: string) => {
    const qs = new URLSearchParams();
    if (term) qs.set('term', term);
    if (academicYear) qs.set('academicYear', academicYear);
    const suffix = qs.toString() ? `?${qs}` : '';
    return req<ApiFeeStructureItem[]>('GET', `/finance/fee-structure${suffix}`);
  },
  create: (body: Partial<ApiFeeStructureItem>) => req<ApiFeeStructureItem>('POST', '/finance/fee-structure', body),
  update: (id: string, body: Partial<ApiFeeStructureItem>) => req<ApiFeeStructureItem>('PATCH', `/finance/fee-structure/${id}`, body),
};

/* ─── Admin Reports ──────────────────────────────────────────────── */
export interface ApiReport {
  id: string;
  name: string;
  type: string;
  generatedAt: string | null;
  size: string | null;
  status: 'ready' | 'pending';
  format?: string;
}

export const adminReportsApi = {
  list:     ()                                          => req<ApiReport[]>('GET',  '/admin/reports'),
  generate: (body: { type: string; term?: string; format?: string }) => req<ApiReport>('POST', '/admin/reports/generate', body),
};

/* ─── Support Tickets ────────────────────────────────────────────── */
export interface ApiTicket {
  id: string;
  title: string;
  reporterName: string;
  reporterRole: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved';
  category: string;
  createdAt: string;
}

export const supportApi = {
  list:   ()                                       => req<ApiTicket[]>('GET',   '/admin/support'),
  create: (body: Partial<ApiTicket>)               => req<ApiTicket>('POST',  '/admin/support', body),
  update: (id: string, body: { status?: string; reply?: string }) => req<ApiTicket>('PATCH', `/admin/support/${id}`, body),
};

/* ─── Integrations ───────────────────────────────────────────────── */
export interface ApiIntegration {
  id: string;
  name: string;
  status: 'connected' | 'pending' | 'disconnected';
  lastTested: string | null;
  icon: string;
  configured: boolean;
  testResult?: string;
  message?: string;
}

export const integrationsApi = {
  list:       ()                                    => req<ApiIntegration[]>('GET',   '/admin/integrations'),
  test:       (id: string)                          => req<ApiIntegration>('POST',  `/admin/integrations/${id}/test`),
  update:     (id: string, body: Partial<ApiIntegration> & { config?: Record<string,string> }) =>
                req<ApiIntegration>('PATCH', `/admin/integrations/${id}`, body),
};

/* ═══════════════════════════════════════════════════════════
   HEAD TEACHER APIs
═══════════════════════════════════════════════════════════ */

/* ─── HT Dashboard ───────────────────────────────────────── */
export interface HtDashboardStats {
  stats: { totalStudents: number; feeCollectionRate: number; staffPresent: number; staffTotal: number; avgPerformance: number };
  feeCollection: { termTarget: number; collected: number; collectionRate: number; byClass: any[] };
  classPerformance: any[];
  boarding: any;
  security: any;
  medical: any;
  pendingApprovals: any[];
  recentActivity: any[];
  recentAnnouncements: any[];
  upcomingEvents: any[];
}

export const htDashboardApi = {
  getSummary: (term?: string, academicYear?: string) => {
    const qs = new URLSearchParams();
    if (term) qs.set('term', term);
    if (academicYear) qs.set('academicYear', academicYear);
    const suffix = qs.toString() ? `?${qs}` : '';
    return req<HtDashboardStats>('GET', `/dashboard/head-teacher${suffix}`);
  },
  getAcademic:  (term?: string, academicYear?: string) => {
    const qs = new URLSearchParams();
    if (term) qs.set('term', term); if (academicYear) qs.set('academicYear', academicYear);
    return req<any>('GET', `/dashboard/academic${qs.toString() ? '?' + qs : ''}`);
  },
  getFinance:   (term?: string, academicYear?: string) => {
    const qs = new URLSearchParams();
    if (term) qs.set('term', term); if (academicYear) qs.set('academicYear', academicYear);
    return req<any>('GET', `/dashboard/finance${qs.toString() ? '?' + qs : ''}`);
  },
  getBoarding:  () => req<any>('GET', '/dashboard/boarding'),
  getSecurity:  (date?: string) => req<any>('GET', `/dashboard/security${date ? '?date=' + date : ''}`),
  getStaff:     () => req<any>('GET', '/dashboard/staff'),
};

/* ─── Announcements ──────────────────────────────────────── */
export interface ApiAnnouncement {
  id: string;
  schoolId: string;
  title: string;
  body: string;
  category: string;     // GENERAL | ACADEMIC | BOARDING | FINANCE | DISCIPLINE | EMERGENCY
  audience: string;     // ALL_STAFF | ALL_STUDENTS | ALL_PARENTS | ALL | SPECIFIC_CLASS
  isPinned: boolean;
  publishAt: string | null;
  expiresAt: string | null;
  createdById: string;
  createdBy?: { id: string; firstName: string; lastName: string };
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementPayload {
  title: string;
  body: string;
  category?: string;      // ACADEMIC | ADMINISTRATIVE | URGENT | BOARDING | SAFETY | GENERAL
  targetAudience?: string; // ALL | ALL_STAFF | ALL_STUDENTS | ALL_PARENTS | BOARDING_STAFF | BOARDING_STUDENTS | SPECIFIC_CLASS
  isPinned?: boolean;
  publishedAt?: string;
  expiresAt?: string;
  targetClassId?: string;
}

export const announcementsApi = {
  list:    (pinned?: boolean) => {
    const suffix = pinned !== undefined ? `?pinned=${pinned}` : '';
    return req<ApiAnnouncement[]>('GET', `/announcements${suffix}`);
  },
  listPinned: () => req<ApiAnnouncement[]>('GET', '/announcements/pinned'),
  get:     (id: string) => req<ApiAnnouncement>('GET', `/announcements/${id}`),
  create:  (payload: CreateAnnouncementPayload) => req<ApiAnnouncement>('POST', '/announcements', payload),
  update:  (id: string, payload: Partial<CreateAnnouncementPayload>) =>
    req<ApiAnnouncement>('PATCH', `/announcements/${id}`, payload),
  delete:  (id: string) => req<{ success: boolean }>('DELETE', `/announcements/${id}`),
};

/* ─── Calendar ───────────────────────────────────────────── */
export interface ApiCalendarEvent {
  id: string;
  schoolId: string;
  title: string;
  description: string | null;
  date: string;         // ISO date string
  endDate: string | null;
  type: string;         // ACADEMIC | EXAM | HOLIDAY | MEETING | COMMUNITY | SPORTS | OTHER
  isSchoolWide: boolean;
  classId: string | null;
  notes: string | null;
  isRecurring: boolean;
  createdById: string;
  createdAt: string;
}

export interface CreateCalendarEventPayload {
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  type?: string;
  isSchoolWide?: boolean;
  classId?: string;
  notes?: string;
}

export const calendarApi = {
  list:      (term?: string, academicYear?: string) => {
    const qs = new URLSearchParams();
    if (term) qs.set('term', term); if (academicYear) qs.set('academicYear', academicYear);
    return req<ApiCalendarEvent[]>('GET', `/calendar${qs.toString() ? '?' + qs : ''}`);
  },
  upcoming:  (days?: number) => req<ApiCalendarEvent[]>('GET', `/calendar/upcoming${days ? '?days=' + days : ''}`),
  term:      (term: string, academicYear: string) =>
    req<ApiCalendarEvent[]>('GET', `/calendar/term?term=${encodeURIComponent(term)}&academicYear=${encodeURIComponent(academicYear)}`),
  get:       (id: string) => req<ApiCalendarEvent>('GET', `/calendar/${id}`),
  create:    (payload: CreateCalendarEventPayload) => req<ApiCalendarEvent>('POST', '/calendar', payload),
  update:    (id: string, payload: Partial<CreateCalendarEventPayload>) =>
    req<ApiCalendarEvent>('PATCH', `/calendar/${id}`, payload),
  delete:    (id: string) => req<{ success: boolean }>('DELETE', `/calendar/${id}`),
};

/* ─── Messages ───────────────────────────────────────────── */
export interface ApiMessage {
  id: string;
  schoolId: string;
  fromUserId: string;
  toUserId: string | null;
  subject: string;
  body: string;
  audience: string | null;    // ALL_STAFF | ALL_HOD | BOARDING_STAFF | etc.
  isRead: boolean;
  readAt: string | null;
  parentId: string | null;
  from?: { id: string; firstName: string; lastName: string; roles: string[] };
  createdAt: string;
}

export interface SendMessagePayload {
  recipientId?: string;
  subject: string;
  body: string;
  category?: string;
  parentMessageId?: string;
}

export const messagesApi = {
  inbox:        (limit = 20, skip = 0) =>
    req<ApiMessage[]>('GET', `/messages/inbox?limit=${limit}&skip=${skip}`),
  sent:         (limit = 20, skip = 0) =>
    req<ApiMessage[]>('GET', `/messages/sent?limit=${limit}&skip=${skip}`),
  unreadCount:  () => req<{ count: number }>('GET', '/messages/unread-count'),
  get:          (id: string) => req<ApiMessage>('GET', `/messages/${id}`),
  send:         (payload: SendMessagePayload) => req<ApiMessage>('POST', '/messages', payload),
  markRead:     (id: string) => req<ApiMessage>('PATCH', `/messages/${id}/read`),
  markAllRead:  () => req<{ updated: number }>('PATCH', '/messages/mark-all-read'),
  delete:       (id: string) => req<{ success: boolean }>('DELETE', `/messages/${id}`),
};

/* ─── HT Staff View ──────────────────────────────────────── */
export interface ApiStaffMember {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  phone: string;
  isActive: boolean;
  userId?: string;
  schoolId: string;
  createdAt: string;
}

export interface ApiStaffAttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  onLeave: number;
}

export interface CreateStaffActionPayload {
  staffId: string;         // FK → staff_members.id
  actionType: string;      // WARNING | VERBAL_WARNING | SUSPENSION | COMMENDATION | PROMOTION | DEMOTION | DISMISSAL | QUERY
  reason: string;
  notes?: string;
}

export const htStaffApi = {
  list:           () => req<ApiStaffMember[]>('GET', '/staff'),
  getAttendance:  () => req<ApiStaffAttendanceSummary>('GET', '/staff/attendance/today'),
  getLeaves:      (status?: string) =>
    req<any[]>('GET', `/staff/leave/requests${status ? '?status=' + status : ''}`),
  approveLeave:   (id: string) => req<any>('PATCH', `/staff/leave/${id}/approve`),
  rejectLeave:    (id: string, reason: string) =>
    req<any>('PATCH', `/staff/leave/${id}/reject`, { rejectionReason: reason }),
  recordAction:   (payload: CreateStaffActionPayload) => req<any>('POST', '/staff/actions', payload),
  getActions:     () => req<any[]>('GET', '/staff/actions'),
};

/* ─── HT Students View ───────────────────────────────────── */
export interface ApiStudentDiscipline {
  id: string;
  studentId: string;
  student?: any;
  actionType: string;   // WRITTEN_WARNING | SUSPENSION | EXPULSION | PARENT_SUMMONS | OTHER
  offence: string;
  notes: string | null;
  status: string;       // PENDING | RESOLVED | ESCALATED
  issuedById: string;
  issuedBy?: any;
  createdAt: string;
}

export interface CreateDisciplinePayload {
  actionType: string;
  offence: string;
  notes?: string;
  notify?: string;  // PARENT_AND_CLASS_TEACHER | PARENT_ONLY | CLASS_TEACHER_ONLY | ALL
}

export const htStudentsApi = {
  list:               (page = 1, limit = 20) =>
    req<{ data: any[]; total: number }>('GET', `/students?page=${page}&limit=${limit}`),
  get:                (id: string) => req<any>('GET', `/students/${id}`),
  getEnrollmentCount: () => req<{ total: number }>('GET', '/students/count'),
  getAllDiscipline:    (status?: string) =>
    req<ApiStudentDiscipline[]>('GET', `/students/discipline${status ? '?status=' + status : ''}`),
  getStudentDiscipline: (id: string) =>
    req<ApiStudentDiscipline[]>('GET', `/students/${id}/discipline`),
  recordDiscipline:   (studentId: string, payload: CreateDisciplinePayload) =>
    req<ApiStudentDiscipline>('POST', `/students/${studentId}/discipline`, payload),
};

/* ─── HT Reports ─────────────────────────────────────────── */
export interface HtReportQuery {
  term?: string;
  academicYear?: string;
  classId?: string;
}

export const htReportsApi = {
  academic: (query?: HtReportQuery) => {
    const qs = new URLSearchParams();
    if (query?.term) qs.set('term', query.term);
    if (query?.academicYear) qs.set('academicYear', query.academicYear);
    if (query?.classId) qs.set('classId', query.classId);
    return req<any>('GET', `/reports/academic${qs.toString() ? '?' + qs : ''}`);
  },
  finance: (query?: HtReportQuery) => {
    const qs = new URLSearchParams();
    if (query?.term) qs.set('term', query.term);
    if (query?.academicYear) qs.set('academicYear', query.academicYear);
    return req<any>('GET', `/reports/finance${qs.toString() ? '?' + qs : ''}`);
  },
  boarding: () => req<any>('GET', '/reports/boarding'),
  admin:    (query?: HtReportQuery) => {
    const qs = new URLSearchParams();
    if (query?.term) qs.set('term', query.term);
    if (query?.academicYear) qs.set('academicYear', query.academicYear);
    return req<any>('GET', `/reports/admin${qs.toString() ? '?' + qs : ''}`);
  },
};

/* ─── HT Security / Gate Log ─────────────────────────────── */
export const htSecurityApi = {
  overview:   () => req<any>('GET', '/dashboard/security'),
  gateLog:    (date?: string) => req<any[]>('GET', `/security/gate-log${date ? '?date=' + date : ''}`),
  incidents:  (status?: string) =>
    req<any[]>('GET', `/security/incidents${status ? '?status=' + status : ''}`),
};

/* ─── HT Boarding ────────────────────────────────────────── */
export const htBoardingApi = {
  summary:     () => req<any>('GET', '/dashboard/boarding'),
  dorms:       () => req<any[]>('GET', '/boarding/dorms'),
  missingStudents: () => req<any[]>('GET', '/boarding/missing-students'),
  leaves:      (status?: string) =>
    req<any[]>('GET', `/boarding/leaves${status ? '?status=' + status : ''}`),
};

/* ═══════════════════════════════════════════════════════════
   ACADEMIC (shared — teacher, deputy HM, student)
═══════════════════════════════════════════════════════════ */
export const academicApi = {
  /* timetable */
  getTimetable:      (classId?: string) => {
    const qs = classId ? `?classId=${classId}` : '';
    return req<any[]>('GET', `/academic/timetable${qs}`);
  },
  createTimetable:   (body: any) => req<any>('POST', '/academic/timetable', body),
  updateTimetable:   (id: string, body: any) => req<any>('PATCH', `/academic/timetable/${id}`, body),
  deleteTimetable:   (id: string) => req<any>('DELETE', `/academic/timetable/${id}`),

  /* classes & subjects */
  getClasses:    () => req<any[]>('GET', '/academic/classes'),
  getSubjects:   () => req<any[]>('GET', '/academic/subjects'),

  /* marks */
  getMarks:      (classId?: string, subjectId?: string) => {
    const qs = new URLSearchParams();
    if (classId) qs.set('classId', classId);
    if (subjectId) qs.set('subjectId', subjectId);
    return req<any[]>('GET', `/academic/marks${qs.toString() ? '?' + qs : ''}`);
  },
  getMyMarks:    () => req<any[]>('GET', '/academic/marks/me'),
  submitMark:    (body: any) => req<any>('POST', '/academic/marks/submit', body),
  bulkSubmit:    (body: any) => req<any>('POST', '/academic/marks/bulk-submit', body),

  /* attendance */
  markAttendance:    (body: any) => req<any>('POST', '/academic/attendance/mark', body),
  getClassAttendance: (classId: string) => req<any[]>('GET', `/academic/attendance/class/${classId}`),
  getMyAttendance:   () => req<any[]>('GET', '/academic/attendance/me'),

  /* cover lessons */
  getCoverLessons:   (date?: string) => req<any[]>('GET', `/academic/cover-lessons${date ? '?date=' + date : ''}`),
  createCoverLesson: (body: any) => req<any>('POST', '/academic/cover-lessons', body),
  assignCover:       (id: string, body: any) => req<any>('PATCH', `/academic/cover-lessons/${id}/assign`, body),

  /* lesson notes */
  getLessonNotes: (classId?: string) => {
    const qs = classId ? `?classId=${classId}` : '';
    return req<any[]>('GET', `/academic/lesson-notes${qs}`);
  },

  /* performance */
  getPerformance: (classId?: string, term?: string) => {
    const qs = new URLSearchParams();
    if (classId) qs.set('classId', classId);
    if (term) qs.set('term', term);
    return req<any>('GET', `/academic/performance${qs.toString() ? '?' + qs : ''}`);
  },
};

/* ═══════════════════════════════════════════════════════════
   STUDENT SELF — student-facing APIs
═══════════════════════════════════════════════════════════ */
export const studentSelfApi = {
  getMyMarks:      () => req<any[]>('GET', '/academic/marks/me'),
  getMyAttendance: () => req<any[]>('GET', '/academic/attendance/me'),
  getTimetable:    () => req<any[]>('GET', '/academic/timetable'),
  getMyBalance:    () => req<any>('GET', '/finance/balance/me'),
  getMyInvoices:   () => req<any[]>('GET', '/finance/invoices'),
};

/* ─── HT Profile & Settings (re-exported for clarity) ────── */
export const htSettingsApi = {
  getSchool:    () => req<ApiSchool>('GET', '/schools/me'),
  updateSchool: (payload: UpdateSchoolPayload & { currentTerm?: string; currentWeek?: number; academicYear?: string }) =>
    req<ApiSchool>('PATCH', '/schools/me', payload),
  getProfile:   () => req<any>('GET', '/users/me'),
  updateProfile: (payload: { firstName?: string; lastName?: string; email?: string; phone?: string }) =>
    req<any>('PATCH', '/users/me', payload),
};

