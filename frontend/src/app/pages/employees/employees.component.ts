import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Employee, FilterOptions, PageResponse } from '../../core/models';

@Component({ selector: 'app-employees', standalone: true, imports: [CommonModule, FormsModule, RouterLink], template: `
  <section class="page-content">
    <div class="page-heading heading-with-action"><div><div class="eyebrow">PEOPLE DIRECTORY</div><h1>Employees</h1><p>Manage employee details and current compensation.</p></div><a class="button primary" routerLink="/employees/new">＋ Add employee</a></div>
    <section class="panel directory-panel">
      <div class="directory-toolbar"><div class="search-field"><span>⌕</span><input aria-label="Search employees" [(ngModel)]="q" (ngModelChange)="searchChanged()" placeholder="Search name, employee ID, email…"></div><select aria-label="Filter by country" [(ngModel)]="country" (ngModelChange)="applyFilters()"><option value="">All countries</option><option *ngFor="let item of filters.countries" [value]="item">{{ item }}</option></select><select aria-label="Filter by department" [(ngModel)]="department" (ngModelChange)="applyFilters()"><option value="">All departments</option><option *ngFor="let item of filters.departments" [value]="item">{{ item }}</option></select><select aria-label="Filter by status" [(ngModel)]="status" (ngModelChange)="applyFilters()"><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="ON_LEAVE">On leave</option><option value="TERMINATED">Terminated</option></select></div>
      <div class="results-line"><span><strong>{{ result?.totalItems || 0 | number }}</strong> employees found</span><span>Showing {{ result?.items?.length || 0 }} of {{ result?.totalItems || 0 | number }}</span></div>
      <div class="loading-state compact" *ngIf="loading">Loading employees…</div><div class="notice error-notice" *ngIf="error">{{ error }} <button class="text-button" (click)="load()">Retry</button></div>
      <div class="table-wrap employee-table" *ngIf="!loading && result"><table><thead><tr><th><button class="sort-button" (click)="sortBy('last_name')">Employee <span>{{ sort === 'last_name' ? (direction === 'asc' ? '↑' : '↓') : '↕' }}</span></button></th><th>Employee ID</th><th>Department / title</th><th>Location</th><th>Status</th><th><button class="sort-button" (click)="sortBy('salary_amount')">Annual salary <span>{{ sort === 'salary_amount' ? (direction === 'asc' ? '↑' : '↓') : '↕' }}</span></button></th><th></th></tr></thead><tbody><tr *ngFor="let e of result.items"><td><div class="employee-cell"><span class="employee-avatar" [class]="'employee-avatar avatar-tone-' + (e.employeeNumber.charCodeAt(e.employeeNumber.length - 1) % 5)">{{ initials(e) }}</span><span><strong>{{ e.firstName }} {{ e.lastName }}</strong><small>{{ e.email }}</small></span></div></td><td class="mono">{{ e.employeeNumber }}</td><td><strong class="table-strong">{{ e.department }}</strong><small class="table-sub">{{ e.jobTitle }}</small></td><td><span>{{ e.countryName }}</span><small class="table-sub">{{ e.countryCode }}</small></td><td><span class="status-pill" [class]="'status-pill ' + e.employmentStatus.toLowerCase()"><span></span>{{ statusLabel(e.employmentStatus) }}</span></td><td><strong class="salary-value">{{ e.salaryAmount | currency:e.salaryCurrency:'symbol-narrow':'1.0-0' }}</strong><small class="table-sub">{{ e.salaryCurrency }} / year</small></td><td><a class="row-open" [routerLink]="['/employees', e.id]" [attr.aria-label]="'View ' + e.firstName + ' ' + e.lastName">↗</a></td></tr><tr *ngIf="result.items.length === 0"><td colspan="7"><div class="empty-state"><strong>No employees match those filters.</strong><span>Try changing your search or clearing a filter.</span><button class="button secondary" (click)="clearFilters()">Clear filters</button></div></td></tr></tbody></table></div>
      <div class="pagination" *ngIf="result && result.totalItems > 0"><span>Page {{ result.page + 1 }} of {{ result.totalPages }}</span><div class="pagination-controls"><select aria-label="Rows per page" [(ngModel)]="size" (ngModelChange)="changeSize()"><option [ngValue]="10">10 / page</option><option [ngValue]="25">25 / page</option><option [ngValue]="50">50 / page</option><option [ngValue]="100">100 / page</option></select><button class="page-button" [disabled]="page === 0" (click)="changePage(page - 1)">← Previous</button><button class="page-button" [disabled]="!result || page + 1 >= result.totalPages" (click)="changePage(page + 1)">Next →</button></div></div>
    </section>
    <div class="page-footnote">Salary data is confidential <span>Every salary update is logged in the employee's audit history.</span></div>
  </section>
` })
export class EmployeesComponent {
  private readonly api = inject(ApiService);
  result: PageResponse<Employee> | null = null; filters: FilterOptions = { countries: [], departments: [] };
  q = ''; country = ''; department = ''; status = ''; page = 0; size = 25; sort = 'last_name'; direction = 'asc'; loading = false; error = ''; private debounce?: ReturnType<typeof setTimeout>;
  constructor() { void this.loadFilters(); void this.load(); }
  async loadFilters() { try { this.filters = await this.api.filters(); } catch { /* table request will show the useful API error */ } }
  searchChanged() { if (this.debounce) clearTimeout(this.debounce); this.debounce = setTimeout(() => { this.page = 0; void this.load(); }, 250); }
  applyFilters() { this.page = 0; void this.load(); }
  clearFilters() { this.q = ''; this.country = ''; this.department = ''; this.status = ''; this.applyFilters(); }
  changePage(page: number) { this.page = page; void this.load(); }
  changeSize() { this.page = 0; void this.load(); }
  sortBy(field: string) { if (this.sort === field) this.direction = this.direction === 'asc' ? 'desc' : 'asc'; else { this.sort = field; this.direction = 'asc'; } void this.load(); }
  async load() { this.loading = true; this.error = ''; try { this.result = await this.api.employees({ q: this.q.trim(), country: this.country, department: this.department, status: this.status, page: this.page, size: this.size, sort: this.sort, direction: this.direction }); } catch { this.error = 'Could not load employees. Check that the API and database are available.'; } finally { this.loading = false; } }
  initials(e: Employee) { return `${e.firstName?.[0] || ''}${e.lastName?.[0] || ''}`.toUpperCase(); }
  statusLabel(status: string) { return status === 'ON_LEAVE' ? 'On leave' : status.charAt(0) + status.slice(1).toLowerCase(); }
}
