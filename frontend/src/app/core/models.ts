export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  countryName: string;
  department: string;
  jobTitle: string;
  employmentStatus: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  hireDate: string;
  salaryAmount: number;
  salaryCurrency: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}
export interface PageResponse<T> { items: T[]; page: number; size: number; totalItems: number; totalPages: number; }
export interface FilterOptions { countries: string[]; departments: string[]; }
export interface SalaryAuditEntry {
  id: string; employeeId: string; changedBy: string; changedAt: string;
  oldSalaryAmount: number; newSalaryAmount: number; oldSalaryCurrency: string; newSalaryCurrency: string; reason: string;
}
export interface CurrencySummary { currency: string; employees: number; averageSalary: number; minSalary: number; maxSalary: number; totalSalary: number; }
export interface SegmentSummary { segment: string; label: string; currency: string; employees: number; averageSalary: number; totalSalary: number; }
export interface DashboardSummary {
  totalEmployees: number; activeEmployees: number; employeesOnLeave: number; terminatedEmployees: number;
  compensationByCurrency: CurrencySummary[]; byCountry: SegmentSummary[]; byDepartment: SegmentSummary[];
}
