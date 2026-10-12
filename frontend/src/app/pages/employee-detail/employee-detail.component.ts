import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Employee, SalaryAuditEntry } from '../../core/models';

type EditForm = { employeeNumber: string; firstName: string; lastName: string; email: string; countryCode: string; countryName: string; department: string; jobTitle: string; employmentStatus: string; hireDate: string; salaryAmount: number; salaryCurrency: string; reason: string };

@Component({ selector: 'app-employee-detail', standalone: true, imports: [CommonModule, FormsModule, RouterLink], template: `
  <section class="page-content detail-page">
    <a routerLink="/employees" class="back-link">← Back to employees</a>
    <div class="page-heading heading-with-action"><div><div class="eyebrow">EMPLOYEE RECORD</div><h1>{{ isNew ? 'Add employee' : (employee ? employee.firstName + ' ' + employee.lastName : 'Employee details') }}</h1><p>{{ isNew ? 'Add an employee to the ACME directory.' : 'Review employee details and manage compensation.' }}</p></div><span *ngIf="employee" class="status-pill" [class]="'status-pill ' + employee.employmentStatus.toLowerCase()"><span></span>{{ statusLabel(employee.employmentStatus) }}</span></div>
    <div class="loading-state" *ngIf="loading">Loading employee record…</div><div class="notice error-notice" *ngIf="error">{{ error }}</div><div class="notice success-notice" *ngIf="message">{{ message }}</div>
    <ng-container *ngIf="isNew || employee">
      <div class="detail-layout">
        <div class="detail-main">
          <form class="panel form-panel" (ngSubmit)="saveEmployee()" #form="ngForm" *ngIf="isNew">
            <div class="panel-heading"><div><h2>Employee details</h2><p>Fields marked with * are required.</p></div></div>
            <div class="form-grid">
              <div class="form-field"><label>Employee number *</label><input name="employeeNumber" required [(ngModel)]="formData.employeeNumber" placeholder="ACME-10001"></div>
              <div class="form-field"><label>Work email *</label><input name="email" type="email" required email [(ngModel)]="formData.email" placeholder="name@company.com"></div>
              <div class="form-field"><label>First name *</label><input name="firstName" required [(ngModel)]="formData.firstName"></div>
              <div class="form-field"><label>Last name *</label><input name="lastName" required [(ngModel)]="formData.lastName"></div>
              <div class="form-field"><label>Department *</label><select name="department" required [(ngModel)]="formData.department"><option value="">Select department</option><option *ngFor="let d of departments" [value]="d">{{ d }}</option></select></div>
              <div class="form-field"><label>Job title *</label><input name="jobTitle" required [(ngModel)]="formData.jobTitle"></div>
              <div class="form-field"><label>Country code *</label><input name="countryCode" required minlength="2" maxlength="2" pattern="[A-Z]{2}" [(ngModel)]="formData.countryCode" placeholder="IN"></div>
              <div class="form-field"><label>Country name *</label><input name="countryName" required [(ngModel)]="formData.countryName" placeholder="India"></div>
              <div class="form-field"><label>Employment status *</label><select name="employmentStatus" required [(ngModel)]="formData.employmentStatus"><option value="ACTIVE">Active</option><option value="ON_LEAVE">On leave</option><option value="TERMINATED">Terminated</option></select></div>
              <div class="form-field"><label>Hire date *</label><input name="hireDate" type="date" required [(ngModel)]="formData.hireDate"></div>
            </div>
            <div class="form-section-heading"><h3>Annual compensation</h3><p>Amount and currency are always stored together.</p></div>
            <div class="form-grid salary-form-grid"><div class="form-field"><label>Annual salary *</label><input name="salaryAmount" type="number" min="0" step="0.01" required [(ngModel)]="formData.salaryAmount"></div><div class="form-field"><label>Currency *</label><select name="salaryCurrency" required [(ngModel)]="formData.salaryCurrency"><option *ngFor="let c of currencies" [value]="c">{{ c }}</option></select></div></div>
            <div class="form-actions"><a class="button secondary" routerLink="/employees">Cancel</a><button class="button primary" type="submit" [disabled]="saving || !form.valid">{{ saving ? 'Saving…' : 'Create employee' }}</button></div>
          </form>
          <ng-container *ngIf="employee && !isNew">
            <section class="panel person-summary"><div class="person-hero"><div class="person-large-avatar">{{ employee.firstName[0] }}{{ employee.lastName[0] }}</div><div><h2>{{ employee.firstName }} {{ employee.lastName }}</h2><p>{{ employee.jobTitle }} · {{ employee.department }}</p><span class="mono">{{ employee.employeeNumber }}</span></div></div><div class="person-summary-grid"><div><small>Work email</small><strong>{{ employee.email }}</strong></div><div><small>Location</small><strong>{{ employee.countryName }} ({{ employee.countryCode }})</strong></div><div><small>Hire date</small><strong>{{ employee.hireDate | date:'mediumDate' }}</strong></div><div><small>Employee since</small><strong>{{ yearsAtCompany(employee.hireDate) }}</strong></div></div></section>
            <section class="panel form-panel"><div class="panel-heading"><div><h2>Annual compensation</h2><p>Changes are recorded in the audit history.</p></div><span class="version-label">Record v{{ employee.version }}</span></div>
              <form (ngSubmit)="saveSalary()" #salaryForm="ngForm"><div class="salary-editor"><div class="form-field"><label>Annual salary *</label><input name="salaryAmount" type="number" min="0" step="0.01" required [(ngModel)]="formData.salaryAmount"></div><div class="form-field"><label>Currency *</label><select name="salaryCurrency" required [(ngModel)]="formData.salaryCurrency"><option *ngFor="let c of currencies" [value]="c">{{ c }}</option></select></div></div><div class="form-field reason-field"><label>Reason for change *</label><textarea name="reason" required minlength="3" maxlength="500" [(ngModel)]="formData.reason" rows="3" placeholder="e.g. Annual performance review, promotion, market adjustment"></textarea><small class="field-hint">A clear reason helps maintain an accurate compensation history.</small></div><div class="form-actions"><button class="button primary" type="submit" [disabled]="saving || !salaryForm.valid">{{ saving ? 'Saving…' : 'Save compensation changes' }}</button></div></form>
            </section>
          </ng-container>
        </div>
        <aside class="detail-side" *ngIf="employee && !isNew"><section class="panel side-panel"><h3>Current compensation</h3><strong class="big-salary">{{ employee.salaryAmount | currency:employee.salaryCurrency:'symbol-narrow':'1.0-2' }}</strong><span class="muted small">{{ employee.salaryCurrency }} per year</span><div class="side-divider"></div><div class="side-stat"><span>Employment status</span><strong>{{ statusLabel(employee.employmentStatus) }}</strong></div><div class="side-stat"><span>Last updated</span><strong>{{ employee.updatedAt | date:'mediumDate' }}</strong></div></section><section class="panel side-panel"><div class="side-title-row"><h3>Compensation history</h3><span class="history-count">{{ audit.length }}</span></div><p class="muted small">Recent salary changes for this employee.</p><div class="audit-list" *ngIf="audit.length; else noHistory"><div class="audit-item" *ngFor="let item of audit"><span class="audit-dot"></span><div><strong>{{ item.newSalaryAmount | currency:item.newSalaryCurrency:'symbol-narrow':'1.0-0' }}</strong><small>{{ item.changedAt | date:'mediumDate' }}</small><p>{{ item.reason }}</p><small class="audit-old">Previous: {{ item.oldSalaryAmount | currency:item.oldSalaryCurrency:'symbol-narrow':'1.0-0' }}</small></div></div></div><ng-template #noHistory><div class="history-empty">No salary changes recorded yet.</div></ng-template></section></aside>
      </div>
    </ng-container>
  </section>
` })
export class EmployeeDetailComponent {
  private readonly api = inject(ApiService); private readonly route = inject(ActivatedRoute); private readonly router = inject(Router);
  readonly currencies = ['INR', 'USD', 'GBP', 'EUR', 'SGD', 'AUD', 'CAD', 'JPY', 'BRL'];
  readonly departments = ['Engineering', 'Product', 'Design', 'People', 'Finance', 'Sales', 'Marketing', 'Operations', 'Legal', 'Security'];
  employee: Employee | null = null; audit: SalaryAuditEntry[] = []; loading = false; saving = false; error = ''; message = ''; isNew = false;
  formData: EditForm = { employeeNumber: '', firstName: '', lastName: '', email: '', countryCode: 'IN', countryName: 'India', department: 'Engineering', jobTitle: '', employmentStatus: 'ACTIVE', hireDate: new Date().toISOString().slice(0, 10), salaryAmount: 0, salaryCurrency: 'INR', reason: '' };
  constructor() { const id = this.route.snapshot.paramMap.get('id'); this.isNew = !id; if (id) void this.load(id); }
  async load(id: string) { this.loading = true; this.error = ''; try { this.employee = await this.api.employee(id); this.copyToForm(this.employee); this.audit = await this.api.salaryAudit(id); } catch { this.error = 'Could not load this employee. The record may not exist or the API is unavailable.'; } finally { this.loading = false; } }
  copyToForm(e: Employee) { this.formData = { employeeNumber: e.employeeNumber, firstName: e.firstName, lastName: e.lastName, email: e.email, countryCode: e.countryCode, countryName: e.countryName, department: e.department, jobTitle: e.jobTitle, employmentStatus: e.employmentStatus, hireDate: e.hireDate, salaryAmount: e.salaryAmount, salaryCurrency: e.salaryCurrency, reason: '' }; }
  async saveEmployee() { this.saving = true; this.error = ''; try { const { reason: _reason, ...body } = this.formData; const e = await this.api.createEmployee(body); await this.router.navigate(['/employees', e.id]); } catch (e) { this.error = e instanceof Error ? e.message : 'Could not create employee. Check duplicate employee number or email.'; } finally { this.saving = false; } }
  async saveSalary() { if (!this.employee) return; this.saving = true; this.error = ''; this.message = ''; try { this.employee = await this.api.updateSalary(this.employee.id, { salaryAmount: Number(this.formData.salaryAmount), salaryCurrency: this.formData.salaryCurrency, expectedVersion: this.employee.version, reason: this.formData.reason }); this.formData.reason = ''; this.audit = await this.api.salaryAudit(this.employee.id); this.message = 'Compensation updated and audit history recorded.'; } catch (e) { this.error = e instanceof Error ? e.message : 'Could not update salary. Reload the record and try again.'; } finally { this.saving = false; } }
  statusLabel(s: string) { return s === 'ON_LEAVE' ? 'On leave' : s.charAt(0) + s.slice(1).toLowerCase(); }
  yearsAtCompany(date: string) { const start = new Date(date); const now = new Date(); const years = Math.max(0, now.getFullYear() - start.getFullYear() - (now.getMonth() < start.getMonth() || (now.getMonth() === start.getMonth() && now.getDate() < start.getDate()) ? 1 : 0)); return years === 1 ? '1 year' : `${years} years`; }
}
