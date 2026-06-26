// Shared API types mirroring the Laravel resources.

export type Role = "super-admin" | "hr" | "manager" | "employee";

export interface User {
  id: number;
  name: string;
  email: string;
  status: string;
  is_owner?: boolean;
  roles: Role[];
  permissions: string[];
  force_password_change?: boolean;
  employee?: {
    id: number;
    employee_code: string;
    full_name: string;
    department_id: number | null;
    position_id: number | null;
  } | null;
  created_at?: string;
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  status: string;
  is_owner: boolean;
  force_password_change: boolean;
  roles: Role[];
  created_at: string;
}

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  status: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string | null;
  status: string;
  employees_count?: number;
  positions_count?: number;
}

export interface Position {
  id: number;
  title: string;
  level: "Junior" | "Mid" | "Senior";
  department_id: number | null;
  department?: { id: number; name: string } | null;
  base_salary: string;
  description: string | null;
  status: string;
  employees_count?: number;
}

export interface Employee {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  salary: string;
  date_hired: string | null;
  employment_type: string;
  status: string;
  has_account: boolean;
  user_id: number | null;
  department_id: number | null;
  position_id: number | null;
  department?: { id: number; name: string } | null;
  position?: { id: number; title: string; level: string } | null;
  profile?: EmployeeProfile | null;
}

export interface EmployeeProfile {
  id?: number;
  birth_date?: string | null;
  gender?: string | null;
  marital_status?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  tax_id?: string | null;
}

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  employee?: { id: number; full_name: string; employee_code: string };
  date: string;
  time_in: string | null;
  time_out: string | null;
  hours_worked: string;
  status: string;
  notes: string | null;
}

export interface LeaveType {
  id: number;
  name: string;
  code: string;
  default_days: number;
  status: string;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  employee?: { id: number; full_name: string; employee_code: string };
  leave_type_id: number;
  leave_type?: { id: number; name: string };
  start_date: string;
  end_date: string;
  days: number;
  reason: string | null;
  status: string;
}

export interface PayrollPeriod {
  id: number;
  name: string;
  cycle: string;
  start_date: string;
  end_date: string;
  pay_date: string | null;
  status: string;
  payrolls_count?: number;
}

export interface PayrollItem {
  id: number;
  type: "allowance" | "deduction" | "earning";
  label: string;
  amount: string;
}

export interface Payroll {
  id: number;
  payroll_period_id: number;
  employee_id: number;
  period?: { id: number; name: string; cycle: string };
  employee?: { id: number; full_name: string; employee_code: string };
  basic_salary: string;
  total_allowances: string;
  total_deductions: string;
  gross_pay: string;
  net_pay: string;
  status: string;
  remarks: string | null;
  items?: PayrollItem[];
  payslip?: { id: number; payslip_number: string } | null;
}

export interface Payslip {
  id: number;
  payslip_number: string;
  payroll_id: number;
  employee_id: number;
  employee?: { id: number; full_name: string; employee_code: string };
  payroll?: { id: number; net_pay: string; period: string | null };
  has_file: boolean;
  file_url: string | null;
  generated_at: string | null;
}

export interface DashboardData {
  counts: {
    employees: number;
    employees_active: number;
    departments: number;
    positions: number;
    payrolls: number;
    payroll_periods: number;
    payslips: number;
    leave_requests: number;
    leave_pending: number;
    attendance_today: number;
  };
  employees_by_department: { department: string; count: number }[];
  latest_period: {
    id: number;
    name: string;
    payroll_count: number;
    total_net: number;
    total_gross: number;
  } | null;
}

// Laravel paginated response shape (resource collection).
export interface Paginated<T> {
  data: T[];
  links: { first: string; last: string; prev: string | null; next: string | null };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}
