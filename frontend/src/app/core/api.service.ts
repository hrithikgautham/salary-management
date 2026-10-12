import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardSummary, Employee, FilterOptions, PageResponse, SalaryAuditEntry } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;
  dashboard(): Promise<DashboardSummary> { return firstValueFrom(this.http.get<DashboardSummary>(`${this.base}/dashboard/summary`)); }
  filters(): Promise<FilterOptions> { return firstValueFrom(this.http.get<FilterOptions>(`${this.base}/employees/filters`)); }
  employees(query: Record<string, string | number | undefined>): Promise<PageResponse<Employee>> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => { if (value !== undefined && value !== '') params = params.set(key, String(value)); });
    return firstValueFrom(this.http.get<PageResponse<Employee>>(`${this.base}/employees`, { params }));
  }
  employee(id: string): Promise<Employee> { return firstValueFrom(this.http.get<Employee>(`${this.base}/employees/${id}`)); }
  createEmployee(body: Record<string, unknown>): Promise<Employee> { return firstValueFrom(this.http.post<Employee>(`${this.base}/employees`, body)); }
  updateSalary(id: string, body: { salaryAmount: number; salaryCurrency: string; expectedVersion: number; reason: string }): Promise<Employee> {
    return firstValueFrom(this.http.put<Employee>(`${this.base}/employees/${id}/salary`, body));
  }
  salaryAudit(id: string): Promise<SalaryAuditEntry[]> { return firstValueFrom(this.http.get<SalaryAuditEntry[]>(`${this.base}/employees/${id}/salary-audit`)); }
}
