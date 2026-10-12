import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { DashboardSummary } from '../../core/models';

@Component({ selector: 'app-dashboard', standalone: true, imports: [CommonModule, RouterLink, CurrencyPipe], template: `
  <section class="page-content">
    <div class="page-heading heading-with-action"><div><div class="eyebrow">MONDAY, PEOPLE OPERATIONS</div><h1>Good to see you.</h1><p>Here's what's happening across your workforce.</p></div><a class="button primary" routerLink="/employees/new">＋ Add employee</a></div>
    <div class="loading-state" *ngIf="loading">Loading your workforce overview…</div>
    <div class="notice error-notice" *ngIf="error">{{ error }} <button class="text-button" (click)="load()">Retry</button></div>
    <ng-container *ngIf="summary as s">
      <div class="metric-grid">
        <article class="metric-card"><div class="metric-top"><span>Total employees</span><span class="metric-icon indigo">♙</span></div><strong>{{ s.totalEmployees | number }}</strong><div class="metric-foot"><span class="status-dot indigo-dot"></span> Across all locations</div></article>
        <article class="metric-card"><div class="metric-top"><span>Active employees</span><span class="metric-icon green">✓</span></div><strong>{{ s.activeEmployees | number }}</strong><div class="metric-foot"><span class="status-dot green-dot"></span> {{ s.totalEmployees ? (s.activeEmployees / s.totalEmployees * 100 | number:'1.0-0') : 0 }}% of workforce</div></article>
        <article class="metric-card"><div class="metric-top"><span>On leave</span><span class="metric-icon amber">◷</span></div><strong>{{ s.employeesOnLeave | number }}</strong><div class="metric-foot">Currently on leave</div></article>
        <article class="metric-card"><div class="metric-top"><span>Countries</span><span class="metric-icon blue">◎</span></div><strong>{{ countryCount(s) }}</strong><div class="metric-foot">Global workforce</div></article>
      </div>
      <div class="content-grid dashboard-grid">
        <section class="panel"><div class="panel-heading"><div><h2>Compensation overview</h2><p>Current, non-terminated employees by currency</p></div><a routerLink="/insights" class="link-arrow">Full insights ↗</a></div>
          <div class="currency-list"><div class="currency-row" *ngFor="let c of s.compensationByCurrency"><div class="currency-symbol">{{ currencySymbol(c.currency) }}</div><div class="currency-main"><div class="currency-heading"><strong>{{ c.currency }}</strong><span>{{ c.employees | number }} employees</span></div><div class="bar-track"><div class="bar-fill" [style.width.%]="barWidth(c.employees, s.compensationByCurrency)"></div></div></div><div class="currency-total"><strong>{{ c.totalSalary | currency:c.currency:'symbol-narrow':'1.0-0' }}</strong><small>total annual salary</small></div></div></div>
          <div class="currency-footnote">Currencies are shown separately. No cross-currency total is calculated.</div>
        </section>
        <section class="panel"><div class="panel-heading"><div><h2>Quick actions</h2><p>Common HR workflows</p></div></div>
          <a class="action-row" routerLink="/employees"><span class="action-icon">⌕</span><span><strong>Find an employee</strong><small>Search and filter your directory</small></span><span class="row-chevron">→</span></a>
          <a class="action-row" routerLink="/employees/new"><span class="action-icon">＋</span><span><strong>Add an employee</strong><small>Create a new employee record</small></span><span class="row-chevron">→</span></a>
          <a class="action-row" routerLink="/insights"><span class="action-icon">⌁</span><span><strong>Explore salary insights</strong><small>Compare teams and countries</small></span><span class="row-chevron">→</span></a>
          <div class="security-callout"><span>✓</span><div><strong>Changes are traceable</strong><p>Salary updates include a reason and an audit history.</p></div></div>
        </section>
      </div>
      <section class="panel lower-panel"><div class="panel-heading"><div><h2>Salary distribution by country</h2><p>Active and on-leave employees, grouped by local currency</p></div><a routerLink="/insights" class="link-arrow">Explore details ↗</a></div>
        <div class="table-wrap"><table><thead><tr><th>Country</th><th>Currency</th><th>Employees</th><th>Average salary</th><th>Total salary</th></tr></thead><tbody><tr *ngFor="let row of s.byCountry | slice:0:8"><td><strong>{{ row.label }}</strong><small class="table-sub">{{ row.segment }}</small></td><td><span class="currency-pill">{{ row.currency }}</span></td><td>{{ row.employees | number }}</td><td>{{ row.averageSalary | currency:row.currency:'symbol-narrow':'1.0-0' }}</td><td class="numeric">{{ row.totalSalary | currency:row.currency:'symbol-narrow':'1.0-0' }}</td></tr></tbody></table></div>
      </section>
    </ng-container>
    <div class="page-footnote">ACME Salary Management <span>Demo data only · Annual salary figures</span></div>
  </section>
` })
export class DashboardComponent {
  private readonly api = inject(ApiService); summary: DashboardSummary | null = null; loading = true; error = '';
  constructor() { void this.load(); }
  async load() { this.loading = true; this.error = ''; try { this.summary = await this.api.dashboard(); } catch { this.error = 'Could not load dashboard data. Make sure the API is running and your session is valid.'; } finally { this.loading = false; } }
  countryCount(s: DashboardSummary) { return new Set(s.byCountry.map(x => x.segment)).size; }
  barWidth(value: number, rows: { employees: number }[]) { return Math.max(4, (value / Math.max(1, ...rows.map(r => r.employees))) * 100); }
  currencySymbol(code: string) { return ({ INR: '₹', USD: '$', GBP: '£', EUR: '€', SGD: 'S$', AUD: 'A$', CAD: 'C$', JPY: '¥', BRL: 'R$' } as Record<string, string>)[code] || code; }
}
