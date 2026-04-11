import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }  from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

// ── Public pages
import LandingPage from './pages/LandingPage';
import LoginPage   from './pages/LoginPage';

// ── Head Teacher (already nested — no change)
import { HeadTeacherLayout } from './components/layout/HeadTeacherLayout';
import HTDashboard     from './pages/head-teacher/Dashboard';
import HTAnnouncements from './pages/head-teacher/Announcements';
import HTCalendar      from './pages/head-teacher/Calendar';
import HTAcademic      from './pages/head-teacher/Academic';
import HTStaff         from './pages/head-teacher/Staff';
import HTStudents      from './pages/head-teacher/Students';
import HTResults       from './pages/head-teacher/Results';
import HTBoarding      from './pages/head-teacher/Boarding';
import HTFinance       from './pages/head-teacher/Finance';
import HTSecurity      from './pages/head-teacher/Security';
import HTReports       from './pages/head-teacher/Reports';
import HTPortals       from './pages/head-teacher/Portals';
import HTMessages      from './pages/head-teacher/Messages';
import HTSettings      from './pages/head-teacher/Settings';

// ── Teacher portal
import TeacherLayout         from './pages/teacher/index';
import TeacherDashboard      from './pages/teacher/Dashboard';
import TeacherClasses        from './pages/teacher/MyClasses';
import TeacherAttendance     from './pages/teacher/Attendance';
import TeacherMarks          from './pages/teacher/MarksGrades';
import TeacherNotes          from './pages/teacher/LessonNotes';
import TeacherAssignments    from './pages/teacher/Assignments';
import TeacherCurriculum     from './pages/teacher/CurriculumCoverage';
import TeacherComms          from './pages/teacher/Communications';
import TeacherPortals        from './pages/teacher/Portals';
import TeacherSettings       from './pages/teacher/Settings';

// ── Bursar portal
import BursarLayout          from './pages/bursar/index';
import BursarDashboard       from './pages/bursar/Dashboard';
import BursarFees            from './pages/bursar/FeeCollection';
import BursarArrears         from './pages/bursar/Arrears';
import BursarExpenses        from './pages/bursar/Expenses';
import BursarInvoices        from './pages/bursar/SupplierInvoices';
import BursarPayroll         from './pages/bursar/Payroll';
import BursarReports         from './pages/bursar/Reports';
import BursarComms           from './pages/bursar/Communications';
import BursarPortals         from './pages/bursar/Portals';
import BursarSettings        from './pages/bursar/Settings';

// ── ECA portal
import ECALayout             from './pages/eca/index';
import ECADashboard          from './pages/eca/Dashboard';
import ECAAnnouncements      from './pages/eca/Announcements';
import ECARegistry           from './pages/eca/Registry';
import ECASports             from './pages/eca/Sports';
import ECACompetitions       from './pages/eca/Competitions';
import ECACultural           from './pages/eca/Cultural';
import ECALeadership         from './pages/eca/Leadership';
import ECAPatrons            from './pages/eca/Patrons';
import ECAAttendance         from './pages/eca/Attendance';
import ECATimetable          from './pages/eca/Timetable';
import ECAComms              from './pages/eca/Communications';
import ECAPortals            from './pages/eca/Portals';
import ECASettings           from './pages/eca/Settings';

// ── Exam Officer portal
import ExamLayout            from './pages/exam-officer/index';
import ExamDashboard         from './pages/exam-officer/Dashboard';
import ExamSchedule          from './pages/exam-officer/Schedule';
import ExamResults           from './pages/exam-officer/ResultsEntry';
import ExamPaperSecurity     from './pages/exam-officer/PaperSecurity';
import ExamMarking           from './pages/exam-officer/Marking';
import ExamReports           from './pages/exam-officer/Reports';
import ExamComms             from './pages/exam-officer/Communications';
import ExamPortals           from './pages/exam-officer/Portals';
import ExamSettings          from './pages/exam-officer/Settings';

// ── Counsellor portal
import CounsellorLayout      from './pages/counsellor/index';
import CounsellorDashboard   from './pages/counsellor/Dashboard';
import CounsellorStudents    from './pages/counsellor/Students';
import CounsellorSessions    from './pages/counsellor/Sessions';
import CounsellorWelfare     from './pages/counsellor/Welfare';
import CounsellorReferrals   from './pages/counsellor/Referrals';
import CounsellorReports     from './pages/counsellor/Reports';
import CounsellorComms       from './pages/counsellor/Communications';
import CounsellorPortals     from './pages/counsellor/Portals';
import CounsellorSettings    from './pages/counsellor/Settings';

// ── Stub portals (proper folder structure, simplified dashboards)
import DeputyHMLayout        from './pages/deputy-hm/index';
import DeputyHMDashboard     from './pages/deputy-hm/Dashboard';
import HODLayout             from './pages/hod/index';
import HODDashboard          from './pages/hod/Dashboard';
import NurseLayout           from './pages/nurse/index';
import NurseDashboard        from './pages/nurse/Dashboard';
import DormMasterLayout      from './pages/dorm-master/index';
import DormMasterDashboard   from './pages/dorm-master/Dashboard';
import SecurityLayout        from './pages/security/index';
import SecurityDashboard     from './pages/security/Dashboard';
import StudentLayout         from './pages/student/index';
import StudentDashboard      from './pages/student/Dashboard';
import ParentLayout          from './pages/parent/index';
import ParentDashboard       from './pages/parent/Dashboard';

// ── Admin Portal
import AdminLayout           from './pages/admin-portal/index';
import AdminDashboard        from './pages/admin-portal/Dashboard';
import AdminUsers            from './pages/admin-portal/Users';
import AdminRoles            from './pages/admin-portal/Roles';
import AdminApprovals        from './pages/admin-portal/Approvals';
import AdminSchool           from './pages/admin-portal/School';
import AdminAcademic         from './pages/admin-portal/Academic';
import AdminFees             from './pages/admin-portal/Fees';
import AdminActivity         from './pages/admin-portal/ActivityLog';
import AdminIntegrations     from './pages/admin-portal/Integrations';
import AdminReports          from './pages/admin-portal/Reports';
import AdminSupport          from './pages/admin-portal/Support';
import AdminComms            from './pages/admin-portal/Communications';
import AdminSettings         from './pages/admin-portal/Settings';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Public ── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* ── Head Teacher ── */}
            <Route path="/ht" element={<HeadTeacherLayout />}>
              <Route index element={<Navigate to="/ht/dashboard" replace />} />
              <Route path="dashboard"     element={<HTDashboard />} />
              <Route path="announcements" element={<HTAnnouncements />} />
              <Route path="calendar"      element={<HTCalendar />} />
              <Route path="academic"      element={<HTAcademic />} />
              <Route path="staff"         element={<HTStaff />} />
              <Route path="students"      element={<HTStudents />} />
              <Route path="results"       element={<HTResults />} />
              <Route path="boarding"      element={<HTBoarding />} />
              <Route path="finance"       element={<HTFinance />} />
              <Route path="security"      element={<HTSecurity />} />
              <Route path="reports"       element={<HTReports />} />
              <Route path="portals"       element={<HTPortals />} />
              <Route path="messages"      element={<HTMessages />} />
              <Route path="settings"      element={<HTSettings />} />
            </Route>

            {/* ── Teacher ── */}
            <Route path="/teacher" element={<TeacherLayout />}>
              <Route index element={<Navigate to="/teacher/dashboard" replace />} />
              <Route path="dashboard"    element={<TeacherDashboard />} />
              <Route path="classes"      element={<TeacherClasses />} />
              <Route path="attendance"   element={<TeacherAttendance />} />
              <Route path="marks"        element={<TeacherMarks />} />
              <Route path="notes"        element={<TeacherNotes />} />
              <Route path="assignments"  element={<TeacherAssignments />} />
              <Route path="curriculum"   element={<TeacherCurriculum />} />
              <Route path="communications" element={<TeacherComms />} />
              <Route path="portals"      element={<TeacherPortals />} />
              <Route path="settings"     element={<TeacherSettings />} />
            </Route>

            {/* ── Bursar ── */}
            <Route path="/bursar" element={<BursarLayout />}>
              <Route index element={<Navigate to="/bursar/dashboard" replace />} />
              <Route path="dashboard"     element={<BursarDashboard />} />
              <Route path="fees"          element={<BursarFees />} />
              <Route path="arrears"       element={<BursarArrears />} />
              <Route path="expenses"      element={<BursarExpenses />} />
              <Route path="invoices"      element={<BursarInvoices />} />
              <Route path="payroll"       element={<BursarPayroll />} />
              <Route path="reports"       element={<BursarReports />} />
              <Route path="communications" element={<BursarComms />} />
              <Route path="portals"       element={<BursarPortals />} />
              <Route path="settings"      element={<BursarSettings />} />
            </Route>

            {/* ── ECA ── */}
            <Route path="/eca" element={<ECALayout />}>
              <Route index element={<Navigate to="/eca/dashboard" replace />} />
              <Route path="dashboard"     element={<ECADashboard />} />
              <Route path="announcements" element={<ECAAnnouncements />} />
              <Route path="registry"      element={<ECARegistry />} />
              <Route path="sports"        element={<ECASports />} />
              <Route path="competitions"  element={<ECACompetitions />} />
              <Route path="cultural"      element={<ECACultural />} />
              <Route path="leadership"    element={<ECALeadership />} />
              <Route path="patrons"       element={<ECAPatrons />} />
              <Route path="attendance"    element={<ECAAttendance />} />
              <Route path="timetable"     element={<ECATimetable />} />
              <Route path="communications" element={<ECAComms />} />
              <Route path="portals"       element={<ECAPortals />} />
              <Route path="settings"      element={<ECASettings />} />
            </Route>

            {/* ── Exam Officer ── */}
            <Route path="/exam-officer" element={<ExamLayout />}>
              <Route index element={<Navigate to="/exam-officer/dashboard" replace />} />
              <Route path="dashboard"      element={<ExamDashboard />} />
              <Route path="schedule"       element={<ExamSchedule />} />
              <Route path="results"        element={<ExamResults />} />
              <Route path="paper-security" element={<ExamPaperSecurity />} />
              <Route path="marking"        element={<ExamMarking />} />
              <Route path="reports"        element={<ExamReports />} />
              <Route path="communications" element={<ExamComms />} />
              <Route path="portals"        element={<ExamPortals />} />
              <Route path="settings"       element={<ExamSettings />} />
            </Route>

            {/* ── Counsellor ── */}
            <Route path="/counsellor" element={<CounsellorLayout />}>
              <Route index element={<Navigate to="/counsellor/dashboard" replace />} />
              <Route path="dashboard"      element={<CounsellorDashboard />} />
              <Route path="students"       element={<CounsellorStudents />} />
              <Route path="sessions"       element={<CounsellorSessions />} />
              <Route path="welfare"        element={<CounsellorWelfare />} />
              <Route path="referrals"      element={<CounsellorReferrals />} />
              <Route path="reports"        element={<CounsellorReports />} />
              <Route path="communications" element={<CounsellorComms />} />
              <Route path="portals"        element={<CounsellorPortals />} />
              <Route path="settings"       element={<CounsellorSettings />} />
            </Route>

            {/* ── Deputy HM ── */}
            <Route path="/deputy-hm" element={<DeputyHMLayout />}>
              <Route index element={<Navigate to="/deputy-hm/dashboard" replace />} />
              <Route path="dashboard" element={<DeputyHMDashboard />} />
            </Route>

            {/* ── HOD ── */}
            <Route path="/hod" element={<HODLayout />}>
              <Route index element={<Navigate to="/hod/dashboard" replace />} />
              <Route path="dashboard" element={<HODDashboard />} />
            </Route>

            {/* ── Nurse ── */}
            <Route path="/nurse" element={<NurseLayout />}>
              <Route index element={<Navigate to="/nurse/dashboard" replace />} />
              <Route path="dashboard" element={<NurseDashboard />} />
            </Route>

            {/* ── Dorm Master ── */}
            <Route path="/dorm-master" element={<DormMasterLayout />}>
              <Route index element={<Navigate to="/dorm-master/dashboard" replace />} />
              <Route path="dashboard" element={<DormMasterDashboard />} />
            </Route>

            {/* ── Security ── */}
            <Route path="/security" element={<SecurityLayout />}>
              <Route index element={<Navigate to="/security/dashboard" replace />} />
              <Route path="dashboard" element={<SecurityDashboard />} />
            </Route>

            {/* ── Student ── */}
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
            </Route>

            {/* ── Parent ── */}
            <Route path="/parent" element={<ParentLayout />}>
              <Route index element={<Navigate to="/parent/dashboard" replace />} />
              <Route path="dashboard" element={<ParentDashboard />} />
            </Route>

            {/* ── Admin Portal ── */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard"      element={<AdminDashboard />}    />
              <Route path="users"          element={<AdminUsers />}        />
              <Route path="roles"          element={<AdminRoles />}        />
              <Route path="approvals"      element={<AdminApprovals />}    />
              <Route path="school"         element={<AdminSchool />}       />
              <Route path="academic"       element={<AdminAcademic />}     />
              <Route path="fees"           element={<AdminFees />}         />
              <Route path="activity"       element={<AdminActivity />}     />
              <Route path="integrations"   element={<AdminIntegrations />} />
              <Route path="reports"        element={<AdminReports />}      />
              <Route path="support"        element={<AdminSupport />}      />
              <Route path="communications" element={<AdminComms />}        />
              <Route path="settings"       element={<AdminSettings />}     />
            </Route>

            {/* ── Redirects ── */}
            <Route path="/dashboard" element={<Navigate to="/ht/dashboard" replace />} />
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
