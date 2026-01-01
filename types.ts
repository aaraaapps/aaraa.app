
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface Employee {
  id: string;
  name: string;
  designation: string;
  department: string;
  role: UserRole;
  dashboard: string;
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED'
}

export interface Submission {
  id: string;
  employee_id: string;
  employee_name: string;
  type: 'BILL' | 'SITE_PHOTO' | 'PETTY_CASH';
  title: string;
  amount?: number;
  url: string;
  status: SubmissionStatus;
  created_at: string;
  department: string;
}

export interface BOQItem {
  id: string;
  item_name: string;
  unit: string;
}

export interface Project {
  id?: string;
  project_code: string;
  project_name: string;
  project_type: string;
  project_category: string;
  project_status: string;
  client_name: string;
  client_org?: string;
  client_contact?: string;
  client_mobile?: string;
  client_email?: string;
  contract_type?: string;
  agreement_value: number;
  site_address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  start_date: string;
  completion_date: string;
  actual_completion_date?: string;
  defect_liability_period?: number;
  project_manager_id: string;
  site_engineers_ids?: string[];
  qs_engineer_id?: string;
  safety_officer_id?: string;
  reporting_manager_id?: string;
  estimated_cost: number;
  approved_budget: number;
  retention_percentage?: number;
  gst_applicable?: boolean;
  payment_terms?: string;
  boq_attached?: boolean;
  boq_version?: string;
  scope_summary?: string;
  exclusions?: string;
  work_order_number?: string;
  work_order_date?: string;
  project_visibility?: string;
  approval_flow?: string;
  notifications_enabled?: boolean;
  boq_json: any[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  created_at: string;
}
