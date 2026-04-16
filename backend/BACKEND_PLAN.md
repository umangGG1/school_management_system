# SMISSI Backend — Complete Implementation Plan

## Context

SMISSI is a full-featured school management system for Ugandan secondary schools (up to 5,000 students). The frontend at `/Users/aadi/Desktop/SMS` has 35+ portal pages across 17 role-based portals. The backend at `/Users/aadi/school_management_system/backend` is a NestJS + PostgreSQL + TypeORM monolith with 21 modules already scaffolded and ~95% implemented for existing modules.

**Why this plan is needed:**
- ZERO database indexes exist anywhere in the codebase — this is the #1 cause of slowdown as data grows
- Redis is installed but never wired into any module
- No background job queue (BullMQ) — payroll/PDF/SMS will block HTTP threads
- 6 modules required by the frontend have no backend code at all
- Admin module has 11 stub methods using in-memory seed arrays

**Goal:** Make the backend production-ready and fast at 500 students today and equally fast at 5,000 students one year from now.

---

## Current State Summary

| Area | Status |
|---|---|
| 21 existing NestJS modules | Implemented (~95%) |
| Database indexes | **ZERO** — critical gap |
| Redis caching | Installed, not wired |
| BullMQ job queue | Not installed, not wired |
| Admin module stubs | 11 methods using in-memory arrays |
| Missing modules (6) | payroll, facilities, uniform, store, sen, gate |
| Connection pool | TypeORM defaults (not tuned) |
| Real-time (Socket.io) | Not installed |
| External integrations | Not implemented |

---

## Phase 1 — Database Performance Fix (DO FIRST)

**Why first:** Every subsequent query benefits. Adding indexes later requires table locks on live data.

### 1.1 New migration: `003-add-indexes.ts`

**File:** `src/database/migrations/003-add-indexes.ts`

Add these indexes (no data changes, safe to run on live DB):

```sql
-- USERS (used in every auth check)
CREATE INDEX CONCURRENTLY idx_users_school_id ON users(school_id);
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- STUDENTS
CREATE INDEX CONCURRENTLY idx_students_school_active ON students(school_id, is_active);
CREATE INDEX CONCURRENTLY idx_students_class ON students(class_id, school_id);
CREATE INDEX CONCURRENTLY idx_students_admission ON students(admission_number);

-- STUDENT ATTENDANCE (1M+ rows/year — most critical)
CREATE INDEX CONCURRENTLY idx_attendance_school_date ON student_attendance(school_id, date DESC);
CREATE INDEX CONCURRENTLY idx_attendance_class_date ON student_attendance(class_id, date DESC);
CREATE INDEX CONCURRENTLY idx_attendance_student_date ON student_attendance(student_id, date DESC);

-- INVOICES & PAYMENTS
CREATE INDEX CONCURRENTLY idx_invoices_school_term ON invoices(school_id, term, academic_year);
CREATE INDEX CONCURRENTLY idx_invoices_student_status ON invoices(student_id, status);
CREATE INDEX CONCURRENTLY idx_payments_school_date ON payments(school_id, created_at DESC);

-- STAFF
CREATE INDEX CONCURRENTLY idx_staff_school ON staff_members(school_id, is_active);
CREATE INDEX CONCURRENTLY idx_staff_attendance_date ON staff_attendance(school_id, date DESC);
CREATE INDEX CONCURRENTLY idx_staff_leaves_status ON staff_leaves(school_id, status);

-- ACTIVITY LOG (audit trail — unbounded, filter-heavy)
CREATE INDEX CONCURRENTLY idx_activity_school_created ON activity_logs(school_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_activity_severity ON activity_logs(severity, created_at DESC);

-- ANNOUNCEMENTS
CREATE INDEX CONCURRENTLY idx_announcements_school_pinned ON announcements(school_id, is_pinned, is_deleted);

-- EXAM MARKS
CREATE INDEX CONCURRENTLY idx_exam_marks_exam ON exam_marks(exam_timetable_id, student_id);
CREATE INDEX CONCURRENTLY idx_exam_marks_student ON exam_marks(student_id, school_id);

-- NOTIFICATIONS
CREATE INDEX CONCURRENTLY idx_notifications_recipient ON notifications(recipient_id, is_read, created_at DESC);

-- MESSAGES
CREATE INDEX CONCURRENTLY idx_messages_inbox ON messages(to_user_id, status, created_at DESC);
CREATE INDEX CONCURRENTLY idx_messages_sent ON messages(from_user_id, created_at DESC);

-- BOARDING
CREATE INDEX CONCURRENTLY idx_dorm_allocations_student ON dorm_allocations(student_id, school_id);
CREATE INDEX CONCURRENTLY idx_student_leaves_status ON student_leaves(school_id, status);
```

### 1.2 TypeORM connection pool — modify `app.module.ts`

Add to the TypeORM `useFactory` return object:
```typescript
extra: {
  max: config.get<number>('DB_POOL_MAX', 20),
  min: config.get<number>('DB_POOL_MIN', 2),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
},
```

### 1.3 Fix N+1 query in `finance.service.ts`

Replace `collectionSummary()` — currently loads all invoices with relations then does JS `array.reduce()`. Replace with a single SQL aggregate:

```typescript
const rows = await this.invoiceRepo.createQueryBuilder('inv')
  .select('inv.class_id', 'classId')
  .addSelect('SUM(inv.amount)', 'target')
  .addSelect('SUM(inv.paid_amount)', 'collected')
  .where('inv.school_id = :schoolId AND inv.term = :term AND inv.academic_year = :year', { schoolId, term, academicYear: year })
  .groupBy('inv.class_id')
  .getRawMany();
```

### 1.4 Add `.env` pool variables

```env
DB_POOL_MAX=20
DB_POOL_MIN=2
```

---

## Phase 2 — Redis Caching Layer

### 2.1 Install packages

```bash
npm install @nestjs/cache-manager cache-manager cache-manager-redis-yet redis
```

### 2.2 Wire CacheModule in `app.module.ts`

```typescript
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

CacheModule.registerAsync({
  isGlobal: true,
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => ({
    store: await redisStore({
      socket: { host: config.get('REDIS_HOST', 'localhost'), port: config.get('REDIS_PORT', 6379) },
    }),
    ttl: 300_000, // 5 minutes default in milliseconds
  }),
}),
```

### 2.3 New file: `src/common/cache/cache.service.ts`

```typescript
@Injectable()
export class AppCacheService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async getOrSet<T>(key: string, factory: () => Promise<T>, ttlMs: number): Promise<T> {
    const cached = await this.cache.get<T>(key);
    if (cached !== undefined) return cached;
    const value = await factory();
    await this.cache.set(key, value, ttlMs);
    return value;
  }

  async del(key: string) { await this.cache.del(key); }
}
```

### 2.4 Cache Key Conventions & TTL

| Cache Key | TTL | Invalidated When |
|---|---|---|
| `dashboard:ht:{schoolId}:{term}` | 5 min | Any student/staff/finance write |
| `dashboard:finance:{schoolId}:{term}` | 5 min | Any payment recorded |
| `students:count:{schoolId}` | 2 min | Student created/deactivated |
| `classes:{schoolId}` | 30 min | Class created/updated |
| `fee-structure:{schoolId}:{term}:{year}` | 60 min | Fee structure updated |
| `school:{schoolId}` | 60 min | School settings updated |
| `subjects:{schoolId}` | 60 min | Subject created/updated |

### 2.5 Apply caching

Inject `AppCacheService` into `DashboardService`, `FinanceService`, `StudentsService`, `AcademicService`. Wrap expensive aggregation methods with `getOrSet`. Add `cache.del(...)` invalidation in write methods.

---

## Phase 3 — Background Jobs (BullMQ)

### 3.1 Install packages

```bash
npm install @nestjs/bullmq bullmq
```

### 3.2 New file: `src/common/queues/queues.module.ts`

```typescript
BullModule.forRootAsync({ inject: [ConfigService], useFactory: (c) => ({
  connection: { host: c.get('REDIS_HOST'), port: c.get('REDIS_PORT') }
}) }),
BullModule.registerQueue(
  { name: 'payroll' },
  { name: 'pdf-generation' },
  { name: 'sms' },
  { name: 'email' },
  { name: 'archival' },
)
```

### 3.3 Processors

| File | Queue | Responsibility |
|---|---|---|
| `processors/payroll.processor.ts` | `payroll` | Generate payslips |
| `processors/pdf.processor.ts` | `pdf-generation` | Puppeteer HTML→PDF render |
| `processors/sms.processor.ts` | `sms` | Africa's Talking API call |
| `processors/archival.processor.ts` | `archival` | Delete activity_logs > 90 days |

### 3.4 Fix Admin module stubs

Replace in-memory SEED arrays with DB-backed entities:

**New entities:**
- `src/admin/entities/academic-term.entity.ts` — `AcademicTerm` (id, schoolId, name, startDate, endDate, isCurrent)
- `src/admin/entities/support-ticket.entity.ts` — `SupportTicket` (id, schoolId, subject, description, status, priority, createdBy, assignedTo, resolvedAt)
- `src/admin/entities/integration-config.entity.ts` — `IntegrationConfig` (id, schoolId, provider, isEnabled, config jsonb, lastTestedAt)

Create `src/admin/admin.service.ts` with real TypeORM queries. Add migration `005-admin-entities.ts`.

---

## Phase 4 — 6 New Modules

### 4.1 Payroll Module (`src/payroll/`)

**Entities:**
- `payroll-run.entity.ts` — id, schoolId, month (YYYY-MM), status (DRAFT/APPROVED/PAID), totalGross, totalNet, totalPaye, totalNssf, runBy, approvedBy, processedAt
- `payslip.entity.ts` — id, payrollRunId, staffMemberId, schoolId, grossSalary, payeDeduction, nssfEmployee, nssfEmployer, saccoDeduction, otherDeductions, netPay, paymentMethod, paymentRef, pdfUrl
- `salary-component.entity.ts` — id, staffMemberId, schoolId, componentType (BASE/HOUSING/TRANSPORT/MEDICAL/OTHER), amount, isActive
- `paye-bracket.entity.ts` — id, country, minIncome, maxIncome, rate, fixedAmount, effectiveFrom

**PAYE Brackets — Uganda FY2024/25 (store in DB, NOT hardcoded):**

| Income Range (UGX/month) | Rate |
|---|---|
| 0 – 235,000 | 0% |
| 235,001 – 335,000 | 10% on excess over 235,000 |
| 335,001 – 410,000 | 10,000 + 20% on excess over 335,000 |
| 410,001 – 10,000,000 | 25,000 + 30% on excess over 410,000 |
| Over 10,000,000 | 2,857,000 + 40% on excess over 10,000,000 |

**NSSF:** 5% employee + 10% employer of gross.

**Endpoints:**
```
GET  /payroll/runs              — list runs (paginated)
POST /payroll/runs              — create run → enqueues BullMQ job → returns 202
GET  /payroll/runs/:id          — run details with payslips
POST /payroll/runs/:id/approve  — approve run
GET  /payroll/payslips/:staffId — staff's payslip history
GET  /payroll/payslips/:id/pdf  — download PDF (presigned R2 URL)
GET  /payroll/components/:staffId — salary components
POST /payroll/components        — add/update component
GET  /payroll/paye-brackets     — current PAYE table
```

**Key:** `createPayrollRun` must use a TypeORM `queryRunner` transaction — wrap all Payslip inserts + PayrollRun insert atomically.

---

### 4.2 Facilities Module (`src/facilities/`)

**Entities:**
- `asset.entity.ts` — id, schoolId, name, description, category (FURNITURE/EQUIPMENT/VEHICLE/LAB/OTHER), quantity, unitCost, location, serialNumber, condition (NEW/GOOD/FAIR/POOR), purchasedAt, warrantyExpiry, isActive
- `facility-booking.entity.ts` — id, schoolId, facilityName, bookedBy, bookingDate, startTime, endTime, purpose, status (PENDING/APPROVED/CANCELLED)
- `maintenance-request.entity.ts` — id, schoolId, assetId, reportedBy, description, priority (LOW/MEDIUM/HIGH/CRITICAL), status (OPEN/IN_PROGRESS/RESOLVED), resolvedAt

**Endpoints:**
```
GET  /facilities/assets            — list (paginated, filter category/location)
POST /facilities/assets            — add asset
PATCH /facilities/assets/:id       — update asset
GET  /facilities/bookings          — list bookings (date filter)
POST /facilities/bookings          — create booking (check time conflicts)
PATCH /facilities/bookings/:id     — approve/cancel
GET  /facilities/maintenance       — maintenance requests (status filter)
POST /facilities/maintenance       — submit request
PATCH /facilities/maintenance/:id  — update status
```

---

### 4.3 Uniform Module (`src/uniform/`)

**Entities:**
- `uniform-item.entity.ts` — id, schoolId, name (SHIRT/TROUSER/SKIRT/BLAZER/BELT/TIE/SOCKS/SHOES), gender (MALE/FEMALE/UNISEX), unitPrice, supplier
- `uniform-stock.entity.ts` — id, uniformItemId, schoolId, size (XS/S/M/L/XL/XXL/XXXL), quantityInStock, reorderLevel, lastUpdated
- `uniform-allocation.entity.ts` — id, studentId, schoolId, uniformItemId, size, quantity, issuedAt, issuedBy, returnedAt, condition

**Endpoints:**
```
GET  /uniform/stock                    — all stock (with low-stock flag)
GET  /uniform/stock/low                — items at/below reorder level
POST /uniform/stock/adjust             — add/remove stock quantity
GET  /uniform/allocations              — all allocations (paginated)
GET  /uniform/allocations/:studentId   — student's allocations
POST /uniform/allocations              — issue uniform (atomic decrement)
PATCH /uniform/allocations/:id/return  — record return
```

**Atomic decrement (prevent overselling):**
```sql
UPDATE uniform_stock SET quantity_in_stock = quantity_in_stock - $1
WHERE id = $2 AND quantity_in_stock >= $1
-- Check affected rows: if 0 → throw ConflictException('Insufficient stock')
```

---

### 4.4 Store Module (`src/store/`)

**Entities:**
- `store-item.entity.ts` — id, schoolId, name, code (unique per school), category (STATIONERY/EQUIPMENT/CLEANING/SPORTS/OTHER), unit, quantityInStock, reorderLevel, unitCost
- `stock-movement.entity.ts` — id, storeItemId, schoolId, type (IN/OUT/ADJUSTMENT), quantity, reason, performedBy, createdAt
- `requisition.entity.ts` — id, schoolId, requestedBy, department, status (PENDING/APPROVED/PARTIALLY_FULFILLED/FULFILLED/REJECTED), notes, reviewedBy, reviewedAt
- `requisition-item.entity.ts` — id, requisitionId, storeItemId, quantityRequested, quantityIssued, notes

**Endpoints:**
```
GET  /store/items                       — list (paginated)
POST /store/items                       — add item
PATCH /store/items/:id                  — update
GET  /store/items/low-stock             — items at/below reorder
GET  /store/movements                   — movement history
POST /store/movements                   — manual stock adjustment
GET  /store/requisitions                — list (paginated, status filter)
POST /store/requisitions                — create requisition
PATCH /store/requisitions/:id/approve   — approve + issue (transactional)
PATCH /store/requisitions/:id/reject    — reject
```

---

### 4.5 SEN Module (`src/sen/`)

**Entities:**
- `sen-record.entity.ts` — id, studentId, schoolId, category (LEARNING_DISABILITY/PHYSICAL/VISUAL/HEARING/SPEECH/BEHAVIOURAL/OTHER), identifiedAt, identifiedBy, status (ACTIVE/CLOSED), notes
- `sen-observation.entity.ts` — id, senRecordId, studentId, schoolId, observedBy, observationDate, notes, academicImpact, behaviourNotes, recommendations
- `accommodation-plan.entity.ts` — id, senRecordId, studentId, schoolId, createdBy, plan (text), reviewDate, status (ACTIVE/EXPIRED/CANCELLED)

**Endpoints:**
```
GET  /sen/students                        — students with SEN records
GET  /sen/records/:studentId              — student SEN history
POST /sen/records                         — create record
PATCH /sen/records/:id                    — update
GET  /sen/observations/:studentId         — student observations
POST /sen/observations                    — add observation
POST /sen/accommodation-plans             — create plan
GET  /sen/accommodation-plans/:studentId  — student's plans
```

**Role guard:** Only `TEACHER`, `HEAD_TEACHER`, `DEPUTY_HM` roles may access.

---

### 4.6 Gate Module (`src/gate/`) — with Socket.io

**Entities:**
- `gate-pass.entity.ts` — id, schoolId, studentId, requestedBy, passCode (6-digit), reason, authorizedBy, validFrom, validUntil, status (PENDING/APPROVED/USED/EXPIRED/REVOKED), usedAt
- `visitor-log.entity.ts` — id, schoolId, visitorName, visitorPhone, nationalId, hostName, hostDept, purpose, vehicleReg, entryTime, exitTime, badgeNumber

**Partial unique index for passCode:**
```sql
CREATE UNIQUE INDEX ON gate_passes(school_id, pass_code) WHERE status IN ('APPROVED', 'USED');
```

**Socket.io events:**
- `gate:pass-approved` — payload: { studentId, passCode, validUntil }
- `gate:student-exit` — payload: { studentId, loggedAt }
- `gate:overdue-return` — cron at 20:00 checks passes past validUntil

**Endpoints:**
```
POST  /gate/passes/request        — request pass
PATCH /gate/passes/:id/approve    — authorize (dorm master / HT)
GET   /gate/passes/pending        — pending approvals
GET   /gate/passes/active         — currently active passes
POST  /gate/exit/log              — log exit using passCode
POST  /gate/return/log            — log return
GET   /gate/logs                  — gate log history (date filter)
POST  /gate/visitors              — register visitor
GET   /gate/visitors              — visitor log (date filter)
GET   /gate/visitors/current      — on-campus visitors
```

---

## Phase 5 — Real-time Notifications (Socket.io)

### 5.1 Install

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

### 5.2 New file: `src/common/gateways/notification.gateway.ts`

```typescript
@WebSocketGateway({ cors: { origin: process.env.FRONTEND_URL }, namespace: '/notifications' })
export class NotificationGateway {
  @WebSocketServer() server: Server;

  emitToSchool(schoolId: string, event: string, payload: any) {
    this.server.to(`school:${schoolId}`).emit(event, payload);
  }
  emitToUser(userId: string, event: string, payload: any) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }
}
```

### 5.3 `main.ts` change

```typescript
import { IoAdapter } from '@nestjs/platform-socket.io';
app.useWebSocketAdapter(new IoAdapter(app));
```

### 5.4 Wire into existing services

| Service | Event to emit | Trigger |
|---|---|---|
| `BoardingService.submitRollCall()` | `boarding:missing-students` | Any MISSING entries in roll call |
| `SecurityService.createIncident()` | `security:new-incident` | New incident created |
| `GateService.approvePass()` | `gate:pass-approved` | Pass approved |

---

## Phase 6 — External Integrations

### 6.1 File Storage — Cloudflare R2

```bash
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage @aws-sdk/s3-request-presigner multer @types/multer
```

**New file:** `src/common/storage/storage.service.ts`
- `upload(buffer, key, mimeType)` → public URL
- `getPresignedUrl(key, expiresInSecs)` → time-limited download URL
- `delete(key)` → deletes file

### 6.2 SMS — Africa's Talking

```bash
npm install africastalking
```

**New file:** `src/common/sms/sms.service.ts`  
All calls enqueued to `sms` BullMQ queue — never synchronous.

### 6.3 Email — Resend

```bash
npm install resend
```

**New file:** `src/common/email/email.service.ts`  
Called via `email` BullMQ queue.

### 6.4 PDF — Puppeteer

```bash
npm install puppeteer
```

**New file:** `src/common/pdf/pdf.service.ts`  
`renderHtml(template, data)` → Buffer → upload to R2 → return URL.  
Used for: payslips, report cards, receipts, financial reports.

### 6.5 Payments — Pesapal (MTN + Airtel)

**New file:** `src/common/payments/pesapal.service.ts`
- `initiatePayment(amount, orderId, phone, method)` → redirect URL
- `handleIpn(payload)` → IPN webhook → update invoice status

Add to `finance.controller.ts`:
```
POST /finance/pay/:invoiceId   — initiate mobile money payment
POST /finance/ipn              — Pesapal IPN webhook
```

---

## Phase 7 — Migration 004: New Module Tables

**File:** `src/database/migrations/004-new-modules.ts`

Creates 22 tables: `payroll_runs`, `payslips`, `salary_components`, `paye_brackets`, `assets`, `facility_bookings`, `maintenance_requests`, `uniform_items`, `uniform_stock`, `uniform_allocations`, `store_items`, `stock_movements`, `requisitions`, `requisition_items`, `sen_records`, `sen_observations`, `accommodation_plans`, `gate_passes`, `visitor_logs`, `academic_terms`, `support_tickets`, `integration_configs`

**Inline indexes (not CONCURRENTLY inside a transaction):**
```sql
CREATE UNIQUE INDEX ON gate_passes(school_id, pass_code) WHERE status IN ('APPROVED', 'USED');
CREATE INDEX ON payslips(staff_member_id, school_id, created_at DESC);
CREATE INDEX ON store_items(school_id, quantity_in_stock);
CREATE INDEX ON sen_records(student_id, school_id, status);
```

---

## `app.module.ts` Final Shape

Add these imports (in order):
```typescript
CacheModule.registerAsync({ isGlobal: true, ... }),   // Phase 2
BullModule.forRootAsync({ ... }),                      // Phase 3
AppCacheModule,        // src/common/cache/cache.module.ts
QueuesModule,          // src/common/queues/queues.module.ts
GatewaysModule,        // src/common/gateways/gateways.module.ts
StorageModule,         // src/common/storage/storage.module.ts
PayrollModule,
FacilitiesModule,
UniformModule,
StoreModule,
SenModule,
GateModule,
```

Plus TypeORM `extra` pool config (Phase 1).

---

## New `.env` Variables

```env
# DB Pool
DB_POOL_MAX=20
DB_POOL_MIN=2

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=smissi-uploads
R2_PUBLIC_URL=

# SMS (Africa's Talking)
AT_API_KEY=
AT_USERNAME=
AT_SENDER_ID=SMISSI

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=noreply@smissi.ac.ug

# Payments (Pesapal)
PESAPAL_CONSUMER_KEY=
PESAPAL_CONSUMER_SECRET=
PESAPAL_ENV=sandbox
```

---

## All Files to Create / Modify

### Modified Files

| File | Change |
|---|---|
| `src/app.module.ts` | Pool config, CacheModule, BullMQ, 6 new modules, Socket.io adapter |
| `src/main.ts` | `app.useWebSocketAdapter(new IoAdapter(app))` |
| `src/finance/finance.service.ts` | Replace JS reduce with SQL aggregate in `collectionSummary` |
| `src/admin/admin.controller.ts` | Replace SEED stubs with `AdminService` calls |
| `package.json` | All new dependencies |
| `.env.example` | All new env vars |

### New Files

```
src/database/migrations/003-add-indexes.ts
src/database/migrations/004-new-modules.ts
src/database/migrations/005-admin-entities.ts

src/common/cache/cache.service.ts
src/common/cache/cache.module.ts

src/common/queues/queues.module.ts
src/common/queues/processors/payroll.processor.ts
src/common/queues/processors/pdf.processor.ts
src/common/queues/processors/sms.processor.ts
src/common/queues/processors/archival.processor.ts

src/common/gateways/notification.gateway.ts
src/common/gateways/gateways.module.ts

src/common/storage/storage.service.ts
src/common/storage/storage.module.ts

src/common/sms/sms.service.ts
src/common/email/email.service.ts
src/common/pdf/pdf.service.ts
src/common/payments/pesapal.service.ts

src/payroll/payroll.module.ts
src/payroll/payroll.service.ts
src/payroll/payroll.controller.ts
src/payroll/entities/payroll-run.entity.ts
src/payroll/entities/payslip.entity.ts
src/payroll/entities/salary-component.entity.ts
src/payroll/entities/paye-bracket.entity.ts

src/facilities/facilities.module.ts
src/facilities/facilities.service.ts
src/facilities/facilities.controller.ts
src/facilities/entities/asset.entity.ts
src/facilities/entities/facility-booking.entity.ts
src/facilities/entities/maintenance-request.entity.ts

src/uniform/uniform.module.ts
src/uniform/uniform.service.ts
src/uniform/uniform.controller.ts
src/uniform/entities/uniform-item.entity.ts
src/uniform/entities/uniform-stock.entity.ts
src/uniform/entities/uniform-allocation.entity.ts

src/store/store.module.ts
src/store/store.service.ts
src/store/store.controller.ts
src/store/entities/store-item.entity.ts
src/store/entities/stock-movement.entity.ts
src/store/entities/requisition.entity.ts
src/store/entities/requisition-item.entity.ts

src/sen/sen.module.ts
src/sen/sen.service.ts
src/sen/sen.controller.ts
src/sen/entities/sen-record.entity.ts
src/sen/entities/sen-observation.entity.ts
src/sen/entities/accommodation-plan.entity.ts

src/gate/gate.module.ts
src/gate/gate.service.ts
src/gate/gate.controller.ts
src/gate/gate.gateway.ts
src/gate/entities/gate-pass.entity.ts
src/gate/entities/visitor-log.entity.ts

src/admin/admin.service.ts
src/admin/entities/academic-term.entity.ts
src/admin/entities/support-ticket.entity.ts
src/admin/entities/integration-config.entity.ts
```

---

## Execution Order

1. `npm install` — all new packages
2. Run migration `003-add-indexes` — safe, no data change
3. Build: `AppCacheModule`, `QueuesModule`, `GatewaysModule`, `StorageModule` (common infrastructure)
4. Build 6 new modules (independent of each other)
5. Fix `admin.controller.ts` stubs → `AdminService` + DB entities
6. Wire everything into `app.module.ts`
7. Apply Redis caching to `DashboardService`, `FinanceService`, `StudentsService`
8. Run migration `004-new-modules` (22 new tables)
9. Seed `paye_brackets` table with URA FY2024/25 rates

---

## Verification Checklist

```bash
# Type check
cd backend && npx tsc --noEmit

# Start dev server
npm run start:dev

# Verify indexes work (should show "Index Scan" not "Seq Scan")
EXPLAIN ANALYZE SELECT * FROM students WHERE school_id = '...' AND is_active = true;

# Verify Redis caching
# Call dashboard twice — second call must show no DB query in logs

# Verify payroll is async
curl -X POST /api/payroll/runs -d '{"month":"2026-04"}'
# Must return 202 Accepted immediately, not block

# Verify WebSocket
# Connect to ws://localhost:3000/notifications
# Create a security incident → receive security:new-incident event
```
