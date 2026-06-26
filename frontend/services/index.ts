import { api } from "@/lib/api";
import { createResource } from "./crud";
import type {
  AttendanceRecord,
  DashboardData,
  Department,
  Employee,
  LeaveRequest,
  LeaveType,
  Paginated,
  Payroll,
  PayrollPeriod,
  Payslip,
  Position,
  TeamMember,
} from "@/types";

// Allowance/Deduction are simple lookup lists; typed loosely here.
type Allowance = { id: number; name: string; code: string; amount: string };
type Deduction = { id: number; name: string; code: string; amount: string };

export const employeesApi = createResource<Employee>("employees");
export const departmentsApi = createResource<Department>("departments");
export const positionsApi = createResource<Position>("positions");
export const attendanceApi = createResource<AttendanceRecord>("attendance");
export const leavesApi = createResource<LeaveRequest>("leaves");
export const payrollPeriodsApi = createResource<PayrollPeriod>("payroll-periods");
export const payrollsApi = createResource<Payroll>("payrolls");
export const payslipsApi = createResource<Payslip>("payslips");

// Employee-specific actions.
export const archiveEmployee = (id: number) =>
  api.patch<{ data: Employee }>(`/employees/${id}/archive`).then((r) => r.data.data);

export interface AccountResult {
  data: Employee;
  account: { email: string; temp_password: string };
  message: string;
}

export const createEmployeeAccount = (id: number) =>
  api.post<AccountResult>(`/employees/${id}/create-account`).then((r) => r.data);

// Reference lookups (return plain arrays, not paginated).
export const lookups = {
  leaveTypes: () => api.get<LeaveType[]>("/leave-types").then((r) => r.data),
  allowances: () => api.get<Allowance[]>("/allowances").then((r) => r.data),
  deductions: () => api.get<Deduction[]>("/deductions").then((r) => r.data),
};

// Payroll generation.
export interface GeneratePayrollPayload {
  payroll_period_id: number;
  scope: "all" | "employee" | "department";
  employee_id?: number;
  department_id?: number;
}
export const generatePayroll = (payload: GeneratePayrollPayload) =>
  api.post<{ message: string; generated: number; skipped: number }>("/payrolls/generate", payload).then((r) => r.data);

// Payslip generation for a payroll.
export const generatePayslip = (payrollId: number) =>
  api.post<{ data: Payslip }>(`/payrolls/${payrollId}/payslip`).then((r) => r.data.data);

// Payslip PDF download/preview (require auth header → fetch as blob).
export async function downloadPayslip(id: number, filename: string) {
  const res = await api.get(`/payslips/${id}/download`, { responseType: "blob" });
  const url = URL.createObjectURL(res.data as Blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function previewPayslip(id: number) {
  const res = await api.get(`/payslips/${id}/preview`, { responseType: "blob" });
  const url = URL.createObjectURL(res.data as Blob);
  window.open(url, "_blank");
}

// Dashboard.
export const getDashboard = () =>
  api.get<{ data: DashboardData }>("/reports/dashboard").then((r) => r.data.data);

// Self-service portal (current employee).
export const portal = {
  employee: () => api.get<{ data: Employee | null }>("/me/employee").then((r) => r.data.data),
  updateEmployee: (payload: Record<string, unknown>) =>
    api.put<{ data: Employee }>("/me/employee", payload).then((r) => r.data.data),
  payrolls:   () => api.get<{ data: Payroll[] }>("/me/payrolls").then((r) => r.data.data),
  payslips:   () => api.get<{ data: Payslip[] }>("/me/payslips").then((r) => r.data.data),
  leaves:     () => api.get<{ data: LeaveRequest[] }>("/me/leaves").then((r) => r.data.data),
  attendance: () => api.get<{ data: AttendanceRecord[] }>("/me/attendance").then((r) => r.data.data),
};

// Team members (tenant user management).
export const teamApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<Paginated<TeamMember>>("/team-members", { params }).then((r) => r.data),
  create: (data: { name: string; email: string; role: string }) =>
    api.post<{ data: TeamMember }>("/team-members", data).then((r) => r.data),
  remove: (id: number): Promise<{ message: string }> =>
    api.delete(`/team-members/${id}`).then((r) => r.data),
};
