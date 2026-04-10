# SMISSI — School Management Information System
## Backend Development Plan
### Prepared for: Client Presentation
### Date: March 2026
### Prepared by: Development Team

---

## 1. Executive Summary

SMISSI is a comprehensive, multi-school management platform designed to digitise and unify every operational department of a secondary school — from academic management and fee collection to boarding, security, health, and HR. The client has completed the design of 35 role-based web portals covering all major school functions.

This document outlines the complete backend development plan, structured in two phases, to bring these portals to life with a robust, scalable, and secure server infrastructure.

- **Total Portals to Power:** 35 across 15 functional modules
- **Target Scale:** Up to 5,000 students per school, multi-school capable
- **Platform:** Web (responsive — works on desktop and mobile browsers)
- **Country of Operation:** Uganda (UGX currency, PAYE/NSSF compliance, MTN/Airtel Mobile Money)

---

## 2. System Overview

SMISSI serves the following distinct user groups, each with a dedicated portal:

| User Role | Portal |
|---|---|
| Head Teacher | Main School Dashboard |
| Deputy Head Master | Administrative Oversight |
| Head of Department | Department & Staff Management |
| Examinations Officer | Exam Management |
| Teacher | Dashboard, Gradebook, Classes, Report Cards, SEN, Behaviour |
| Finance Officer | Dashboard, Fee Capture, Invoicing, Reports, Audit |
| Payroll/HR Officer | Payroll Dashboard, HR Portal |
| Boarding Master | Dorm Operations |
| Head of Boarding | Boarding Oversight |
| Nurse | Sick Bay / Medical Records |
| Gate Guard | Access & Visitor Logs |
| Head of Security | Security Dashboard |
| ECA Officer | Extra-Curricular Activities |
| Communications Officer | Notices & Announcements |
| Uniform Officer | Uniform Inventory & Issuance |
| Facilities Manager | Inventory, Labs, Store |
| Student | Finance Account, Boarding Portal |
| Parent | Boarding Welfare & Attendance |
| School Counselor | Student Welfare Records |

---

## 3. Technical Architecture Recommendation

### 3.1 Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| Backend Framework | Node.js with NestJS | Enterprise-grade, modular, TypeScript — scales cleanly across 15 modules |
| Database | PostgreSQL | Relational integrity for complex school data (students, fees, grades, payroll) |
| Cache / Sessions | Redis | Fast session management, real-time notification queuing |
| File Storage | AWS S3 (or Cloudflare R2) | Report cards, payslips, medical records, certificates |
| Authentication | JWT + Role-Based Access Control (RBAC) | Secure, stateless, supports 20+ user roles |
| Real-time Notifications | WebSockets (Socket.io) | Instant alerts for gate events, medical emergencies, fee reminders |
| PDF Generation | Puppeteer | Report cards, payslips, invoices, receipts |
| SMS Gateway | Africa's Talking | Uganda-native SMS provider — best coverage and rates |
| Email Service | SendGrid | Transactional emails — receipts, reports, parent notifications |
| Payments | MTN Mobile Money + Airtel Money (via Pesapal) | Primary payment methods in Uganda |
| Hosting | AWS or DigitalOcean | Scalable cloud hosting with Ugandan-friendly latency options |
| CI/CD | GitHub Actions | Automated testing and deployment pipeline |

### 3.2 Multi-School Architecture

The system is designed from the ground up to support multiple schools on a single platform. Each school operates as an isolated tenant — data is never shared between schools. A super-admin dashboard allows management of all schools from one interface.

---

## 4. Core Data Foundation

Before any module is built, the following foundational data structures will be established. All other modules depend on these.

### 4.1 Identity & Access Management
- Users (all roles), role assignments, and permission groups
- Multi-school tenant isolation
- Password management, session control, audit logging of logins

### 4.2 School & Academic Structure
- Schools, campuses, academic years, and terms
- Classes, streams/sections, and subjects
- Timetables and academic calendars

### 4.3 People Registry
- Student records (personal info, admission number, class, guardian contacts)
- Staff records (personal info, role, department, qualifications)
- Parent/guardian records linked to students

---

## 5. Phase 1 — Core Platform (Revenue-Critical Operations)

Phase 1 delivers the systems that directly impact daily school operations and revenue collection. These are the most critical modules to go live first.

**Estimated Phase 1 Timeline: 16–20 weeks**

---

### Module 1: Authentication & Access Control

Every portal login and permission is managed here.

- Secure login for all 20+ user roles
- Role-based permissions (a teacher cannot access finance data; a gate guard cannot access medical records)
- Password reset via SMS or email
- Session management and automatic timeout
- Full login audit trail (who logged in, when, from where)
- Multi-school support (staff at School A cannot access School B)

---

### Module 2: Student Information Management

The central student record that all other modules reference.

- Student registration and admission records
- Class enrollment and stream assignment
- Parent/guardian contact information
- Document storage (birth certificates, admission letters)
- Student search and filtering across all classes
- Student transfer management (between classes or schools)
- Alumni records

**Portals powered:** Head Teacher, Deputy HM, HOD, Teacher

---

### Module 3: Academic Management

Powers all classroom-level teaching and learning operations.

**3.1 Timetable & Scheduling**
- Class timetables linked to teachers and subjects
- Academic calendar management (terms, holidays, exam periods)

**3.2 Attendance Tracking**
- Daily attendance marking by teachers (present / absent / late / excused)
- Attendance history per student
- Automated alerts to parents for unexplained absences
- Attendance reports by class, student, or period

**3.3 Gradebook & Assessments**
- Teachers enter marks for assignments, tests, midterms, and finals
- Weighted grade calculations (e.g., assignments 30%, exams 70%)
- Grade thresholds and pass/fail indicators
- Assessment publishing controls (draft vs. published)
- Class-wide performance statistics

**3.4 Report Cards**
- Automated report card generation from gradebook data
- Teacher comments and remarks per student
- Admin review and approval workflow before distribution
- PDF export and print-ready formatting
- Term-on-term performance comparison
- Archive of all past report cards

**3.5 Examinations Management**
- Exam scheduling with venue and room allocation
- Invigilator assignment
- Mark sheet generation
- Automated grade calculation from marks entered
- Result publication workflow (marks entered → reviewed → published)
- Exam analytics (pass rates, grade distributions)

**Portals powered:** Teacher Dashboard, Gradebook, Class Management, Report Cards (Teacher + Admin), Examinations Officer

---

### Module 4: Finance — Fee Management

The most critical revenue system for the school.

**4.1 Fee Structures**
- Define fee categories: Tuition, Boarding, Day Scholar, PTA, Development
- Set fee amounts by class, term, and student type (government-sponsored, private, scholarship)
- Support for UPE and USE government subsidy tracking

**4.2 Fee Capture & Payment Processing**
- Student fee account lookup by name or admission number
- Record payments: cash, bank transfer, MTN Mobile Money, Airtel Money
- Instant receipt generation (printable and digital)
- Partial payment recording and balance tracking
- Payment history per student

**4.3 Invoice Management**
- Bulk invoice generation for all students at term start
- Invoice status tracking: Paid, Partially Paid, Overdue
- Automated SMS/email reminders for overdue accounts
- Filter and manage accounts by class, fee type, or status

**4.4 Student Finance Self-Service**
- Students view their own account balance and payment history
- Download and print account statements and receipts
- Share account summary with parent/guardian

**4.5 Financial Reports**
- Fee collection summaries by class, stream, or term
- Defaulter reports with aging analysis
- Collection rate dashboards
- Revenue trends over time
- Bank reconciliation support
- Export to PDF and Excel

**4.6 Audit Trail**
- Every financial transaction is permanently logged
- Records: who did it, what was changed, old value, new value, timestamp
- Immutable audit log — entries cannot be edited or deleted
- Filter and export audit records for compliance

**Portals powered:** Finance Dashboard, Fee Capture, Invoice Management, Student Finance Portal, Financial Reports, Audit Trail

---

### Module 5: Payroll Management

**5.1 Staff Salary Administration**
- Staff salary profiles (basic salary, allowances, contract type)
- Monthly payroll run processing
- Automatic PAYE calculation (per Uganda Revenue Authority rates)
- NSSF deductions (staff 5% + employer 10%)
- SACCO deductions
- Absenteeism and disciplinary deductions
- Salary advance requests and automatic recovery from subsequent months

**5.2 Payslip Generation**
- Detailed payslips showing all earnings and deductions
- Monthly payslip archive per staff member
- PDF download and print
- Bulk payslip generation and distribution

**5.3 Payroll Approval & Disbursement**
- Payroll review and approval workflow before processing
- Disbursement via bank transfer, Mobile Money, or cash
- Payroll status tracking (processing → approved → disbursed)

**5.4 Compliance Reporting**
- PAYE return reports (for URA submission)
- NSSF contribution reports
- Monthly payroll summary exports

**Portals powered:** Payroll Management Dashboard, Teacher Payslip Portal

---

### Module 6: Communications

**6.1 Announcements & Notice Board**
- Create and publish notices for staff, students, or parents
- Notice categories (academic, administrative, urgent)
- Scheduled publishing

**6.2 Broadcast Messaging**
- Send bulk SMS to targeted groups (e.g., all parents of S4, all boarding students)
- Send bulk email with attachments
- In-app notifications for portal users

**6.3 Message Delivery Tracking**
- Delivery confirmation and read receipts
- Communication history and archive
- Message templates for common scenarios (fee reminders, event notices)

**Portals powered:** Communications Portal

---

### Module 7: Leadership Dashboards

**7.1 Head Teacher Dashboard**
- School-wide overview: total students enrolled, fee collection rate, staff count
- Academic performance summary across all classes
- Recent incidents and alerts
- Pending approvals

**7.2 Deputy Head Master Dashboard**
- Student discipline management and incident tracking
- Leave application approvals (staff and student)
- Attendance analytics across the school
- Academic performance monitoring

**Portals powered:** Head Teacher Dashboard, Deputy HM Portal

---

## 6. Phase 2 — Extended Operations

Phase 2 delivers the operational and specialist modules that support the broader school environment beyond core academics and finance.

**Estimated Phase 2 Timeline: 14–18 weeks**

---

### Module 8: Boarding Management

For schools with residential students.

**8.1 Dorm Structure & Room Allocation**
- Define buildings, floors, wings, and rooms
- Set room capacities and bedspace assignments
- Allocate students to rooms at the start of each term
- Track occupancy rates and available spaces

**8.2 Daily Boarding Operations (Dorm Master)**
- Evening and morning roll call — mark students present/absent in dorms
- Track student check-in and check-out times
- Log boarding incidents and violations
- Nightly occupancy reports

**8.3 Head of Boarding Oversight**
- Approval workflows for student leave requests
- Boarding violation records and disciplinary tracking
- Investigation management (open → in progress → resolved)
- Boarding statistics and analytics dashboard

**8.4 Student Leave Management**
- Students submit leave requests (exeat) with reason and duration
- Multi-level approval (Dorm Master → Head of Boarding)
- Leave pass generation for approved requests
- Overdue return alerts (student expected back but not checked in)

**8.5 Parent Portal (Boarding)**
- View child's boarding attendance records
- Track leave request status (submitted, approved, returned)
- Receive alerts for absences or welfare concerns
- View room assignment and roommate details
- Contact boarding staff directly

**Portals powered:** Boarding Master, Head of Boarding, Student Boarding Portal, Parent Portal (both views)

---

### Module 9: Health & Medical (Sick Bay)

- Register student and staff visits to the sick bay
- Record vital signs (temperature, pulse, blood pressure)
- Document symptoms, diagnosis, and treatment given
- Prescription and medication dispensing log
- Medical history per student (allergies, chronic conditions)
- Discharge records with follow-up instructions
- Referral letters for cases requiring external treatment
- Medical records access controls (nurse and senior admin only)
- Monthly sick bay utilisation reports

**Portal powered:** Nursing Portal

---

### Module 10: Security & Access Control

**10.1 Gate Management — Student Exit & Return**
- Students request gate passes (destination, reason, expected return)
- Gate guard records departure and return times
- Permission validation before exit is authorised
- Alerts for students who have not returned by expected time
- Daily exit/return log reports

**10.2 Gate Guard Portal**
- Visitor registration (name, ID, purpose, person visiting, vehicle)
- ID card verification for students and staff
- Vehicle entry log (registration plate, driver, purpose)
- Access pass issuance (time-limited)
- Complete entry/exit log per day

**10.3 Head of Security Dashboard**
- Security incident reporting and classification
- Incident investigation workflow (open → in progress → resolved)
- Access pattern analytics (unusual entries, repeated visitors)
- Security alerts and escalations
- Monthly security reports

**Portals powered:** Gate Portal, Gate Guard Portal, Head of Security Dashboard

---

### Module 11: Facilities & Inventory Management

**11.1 General Inventory (Facilities Office)**
- Asset register with item codes, categories, and descriptions
- Stock level tracking with automatic low-stock alerts
- Supplier database and purchase order management
- Equipment maintenance request logging
- Breakdown reports and repair tracking
- Asset depreciation tracking

**11.2 Laboratory & Workspace Management**
- Lab and workspace catalogue (computer labs, science labs, multipurpose rooms)
- Booking and reservation system with time slot scheduling
- Equipment checkout and check-in tracking
- Lab utilisation reports
- Maintenance scheduling for lab equipment

**11.3 Store & Supply Requisitions**
- Teachers and departments submit supply requisition requests
- Approval workflow (requester → store manager → procurement)
- Issue tracking — stock levels updated upon every issue
- Supplier orders triggered when stock falls below reorder point
- Requisition history and usage patterns

**Portals powered:** Facilities Office, Labs & Workspaces, Store & Facilities (Teacher view)

---

### Module 12: Extra-Curricular Activities (ECA)

- Club and activity catalogue (sports, cultural, academic clubs)
- Student registration in activities
- Team roster and squad management
- Coach and advisor assignment per activity
- Activity scheduling — matches, rehearsals, competitions
- Attendance tracking for ECA sessions
- Achievement and award recording (medals, certificates)
- Participation certificates generation
- Activity budget tracking (optional)

**Portal powered:** ECA Office Portal

---

### Module 13: Uniform Management

- Uniform item master (shirts, trousers, skirts, ties, shoes, badges — by size and class)
- Stock inventory with quantity tracking
- Supplier orders and stock receipts
- Student allocation records (what was issued to whom, when, in what condition)
- Student replacement requests
- Return and damage recording
- Low stock alerts
- Distribution receipts and labels

**Portal powered:** Uniform Office Portal

---

### Module 14: Human Resources (HR)

- Staff profiles with full employment history
- Department and position management
- Staff onboarding documentation
- Leave management (annual, sick, maternity, unpaid)
- Leave balance tracking and approval workflow
- Staff performance appraisal management (linked to HOD portal)
- Contract management and renewal alerts
- Staff disciplinary records

**Portal powered:** HR Portal

---

### Module 15: Special Educational Needs (SEN) & Counseling

**15.1 SEN Management (Teacher Access)**
- SEN student identification and classification
- Individual accommodation plans (extra time, modified assessments, seating)
- Classroom observation log
- Progress monitoring towards support goals
- Coordination notes with inclusion specialists
- Evidence gathering for review meetings

**15.2 School Counselor Portal**
- Student welfare case records
- Counseling session logs (date, topic, outcome)
- Referral management (internal and external)
- At-risk student tracking
- Confidential record access controls

**Portals powered:** SEN Teacher Dashboard, School Counselor Portal

---

### Module 16: Head of Department Portal

- Department staff list and assignment management
- Curriculum and syllabus document management
- Scheme of work planning and publication
- Subject-to-teacher assignment management
- Teacher performance appraisal records
- Department-level academic performance analytics
- Academic planning approvals

**Portal powered:** HOD Portal

---

## 7. Cross-Cutting Technical Features

These capabilities are built once and used across all modules.

### 7.1 Notification System
- In-app notifications (bell icon in all portals)
- SMS notifications via Africa's Talking (fee reminders, attendance alerts, boarding events)
- Email notifications (report cards, payslips, invoices)
- Configurable notification preferences per user

### 7.2 Reporting Engine
- Every module includes export to PDF and Excel
- Scheduled reports (e.g., weekly attendance report auto-emailed to Head Teacher every Friday)
- Custom date range filters
- Report archive

### 7.3 Audit & Compliance Logging
- Every data change across the system is logged (who, what, when)
- Financial transactions have immutable audit trails
- System activity logs for security compliance

### 7.4 Search & Filtering
- Fast global student and staff search across all portals
- Advanced filters in every list view

### 7.5 Data Backup & Recovery
- Automated daily database backups
- Point-in-time recovery capability
- Backup retention for 90 days

---

## 8. Integration Points

| Integration | Purpose | Provider |
|---|---|---|
| MTN Mobile Money | Fee payments | MTN Uganda API |
| Airtel Money | Fee payments | Airtel Uganda API |
| Pesapal | Payment gateway aggregator (wraps MTN, Airtel, cards) | Pesapal |
| Africa's Talking | SMS notifications | Africa's Talking |
| SendGrid | Email (receipts, reports, notifications) | SendGrid |
| AWS S3 | Document and file storage | Amazon Web Services |
| Uganda Revenue Authority | PAYE compliance reporting | URA (manual export initially) |
| NSSF Uganda | Contribution reporting | NSSF (manual export initially) |

---

## 9. Security Standards

- All data transmitted over HTTPS (TLS 1.3)
- Passwords stored with bcrypt hashing (never in plain text)
- JWT tokens with short expiry and refresh token rotation
- Role-based access control — no user can access data outside their permissions
- Rate limiting on all API endpoints to prevent abuse
- Input validation and SQL injection prevention on all database queries
- Medical and counseling records have additional access layer beyond standard RBAC
- Financial audit logs are immutable — no record can be deleted or altered

---

## 10. Phased Delivery Summary

### Phase 1 — Core Platform

| Module | Description |
|---|---|
| 1. Authentication & RBAC | Login, roles, permissions, multi-school |
| 2. Student Information | Student records, enrollment, guardians |
| 3. Academic Management | Timetables, attendance, gradebook, report cards, exams |
| 4. Finance — Fees | Fee structure, capture, invoicing, student portal, reports, audit |
| 5. Payroll | Salary processing, PAYE/NSSF, payslips, disbursement |
| 6. Communications | Notices, SMS/email broadcasts, delivery tracking |
| 7. Leadership Dashboards | Head Teacher and Deputy HM dashboards |

**Phase 1 delivers:** The systems the school depends on every day — student records, academic results, fee collection, payroll, and school-wide communication.

---

### Phase 2 — Extended Operations

| Module | Description |
|---|---|
| 8. Boarding Management | Room allocation, daily operations, leave, parent portal |
| 9. Health & Medical | Sick bay records, medication, referrals |
| 10. Security & Gate | Student exit/return, visitor management, incident tracking |
| 11. Facilities & Inventory | Assets, labs, requisitions, suppliers |
| 12. ECA | Clubs, activities, achievements, scheduling |
| 13. Uniform Management | Stock, issuance, student allocation |
| 14. Human Resources | Staff profiles, leave, appraisals, contracts |
| 15. SEN & Counseling | Accommodation plans, observations, welfare records |
| 16. HOD Portal | Curriculum, schemes of work, teacher appraisals |

**Phase 2 delivers:** The full operational ecosystem — every department from the boarding house to the security gate is connected to the central system.

---

## 11. Team & Resource Requirements

To deliver both phases efficiently, the recommended team structure is:

| Role | Responsibility |
|---|---|
| Backend Lead (1) | Architecture, code review, API design |
| Backend Developers (2–3) | Module development, database, integrations |
| DevOps Engineer (1, part-time) | Server setup, CI/CD, backups, monitoring |
| QA Engineer (1) | Testing all modules before delivery |
| Project Manager (1) | Client communication, milestone tracking |

---

## 12. Key Assumptions & Client Responsibilities

The following are assumed or required from the client side for development to proceed smoothly:

1. **Frontend handover**: All 35 HTML/CSS frontend files to be provided to the development team for API integration.
2. **School data**: Initial data for students, staff, classes, and fee structures to be provided for system setup and testing.
3. **UAT participation**: Client designated staff to participate in User Acceptance Testing for each module before sign-off.
4. **Uganda-specific data**: URA PAYE tax bands, NSSF rates, and any other statutory rates to be confirmed by client.
5. **Payment accounts**: MTN and Airtel merchant accounts to be registered by client — development team will handle integration.
6. **SMS account**: Africa's Talking account to be registered — development team handles integration.
7. **Domain & hosting**: Client to provide preferred domain name; development team provisions hosting infrastructure.
8. **Seed data**: For multi-school setup, each school's configuration details (name, logo, admin contacts) to be provided.

---

## 13. What Success Looks Like

At the end of Phase 1, the school will be able to:
- Enroll students and manage their full academic records digitally
- Mark and track attendance from every classroom
- Generate report cards at the end of each term
- Capture and track all fee payments with automated receipts
- Process monthly payroll with statutory deductions
- Communicate with all staff, students, and parents via SMS and email

At the end of Phase 2, the school will additionally be able to:
- Manage the boarding house end-to-end, including parent visibility
- Track every person who enters or leaves the school gate
- Manage medical records for students in the sick bay
- Run the store, labs, and facilities with full inventory control
- Record and track every student discipline case and counseling session
- Coordinate all extra-curricular activities from one platform

---

*This document is intended for client review and discussion. All timelines and team structures are indicative and will be finalised following a detailed technical scoping session.*
