export type UserRole =
  | 'HEAD_TEACHER' | 'DEPUTY_HEAD' | 'HOD' | 'EXAMINATIONS_OFFICER'
  | 'TEACHER' | 'SEN_TEACHER' | 'FINANCE_OFFICER' | 'PAYROLL_OFFICER'
  | 'HR_OFFICER' | 'BOARDING_MASTER' | 'HEAD_OF_BOARDING' | 'NURSE'
  | 'GATE_GUARD' | 'HEAD_OF_SECURITY' | 'ECA_OFFICER'
  | 'COMMUNICATIONS_OFFICER' | 'UNIFORM_OFFICER' | 'FACILITIES_MANAGER'
  | 'SCHOOL_COUNSELOR' | 'STUDENT' | 'PARENT' | 'SUPER_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  activeRole: UserRole;
  schoolName: string;
  schoolId: string;
  avatarUrl?: string;
}
