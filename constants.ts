
import { UserRole, Employee } from './types';

export const COLORS = {
  primary: '#ed2f39',
  secondary: '#FFFFFF',
  text: '#1e293b',
  bg: '#f8fafc',
  accent: '#f1f5f9'
};

export const LOGO_URL = 'https://aaraainfrastructure.com/logo.png';

export const EMPLOYEE_MASTER: Employee[] = [
  { id: 'AI1001', name: 'Nanda Kumar', designation: 'Managing Director', department: 'Management', role: UserRole.SUPER_ADMIN, dashboard: 'MD Command Center' },
  { id: 'AI1002', name: 'Alekhya', designation: 'Director', department: 'Project', role: UserRole.ADMIN, dashboard: 'Executive Control' },
  { id: 'AI1003', name: 'Manikandan', designation: 'Foreman', department: 'Site', role: UserRole.USER, dashboard: 'Site Execution' },
  { id: 'AI1004', name: 'Alekhya B', designation: 'Business Head', department: 'Management', role: UserRole.ADMIN, dashboard: 'Executive Control' },
  { id: 'AI1005', name: 'S S Babu', designation: 'GM', department: 'Projects', role: UserRole.ADMIN, dashboard: 'Executive Control' },
  { id: 'AI1008', name: 'Imtiaz', designation: 'Purchase Executive', department: 'Procurement', role: UserRole.USER, dashboard: 'Procurement Desk' },
  { id: 'AI1011', name: 'Hajira S K', designation: 'Manager', department: 'Admin & HR', role: UserRole.ADMIN, dashboard: 'HR Command' },
  { id: 'AI1012', name: 'Sudha Ramanathan', designation: 'Manager', department: 'Accounts & Finance', role: UserRole.ADMIN, dashboard: 'Finance Control' },
  { id: 'AI1013', name: 'Gowri Shankar', designation: 'Manager', department: 'Tech & Digital Media', role: UserRole.ADMIN, dashboard: 'Tech Control' },
  { id: 'AI1015', name: 'Vinoth Kumar R', designation: 'Project Manager', department: 'Projects', role: UserRole.ADMIN, dashboard: 'Project Owner' },
  { id: 'AI1020', name: 'Rajesh Kumar', designation: 'Accounts Executive', department: 'Finance', role: UserRole.USER, dashboard: 'Finance Control' },
  { id: 'AI1027', name: 'Ajith', designation: 'Safety Officer', department: 'Site', role: UserRole.USER, dashboard: 'Safety Desk' },
  { id: 'AI1029', name: 'Praveen', designation: 'Quality Engineer', department: 'QA/QC', role: UserRole.USER, dashboard: 'QA Dashboard' }
  // Note: Only a representative subset is added for brevity, the logic will handle IDs generically.
];
