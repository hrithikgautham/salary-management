import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { DashboardSummary } from '../../core/models';

@Component({ selector: 'app-insights', standalone: true, imports: [CommonModule, CurrencyPipe, RouterLink], template: `
  <section class="page-content">
    <div class="page-heading heading-with-action"><div><div class="eyebrow">COMPENSATION ANALYTICS</div><h1>Salary insights</h1><p>Understand how compensation is distributed across your organization.</p></div><a routerLink="/employees" class="button secondary">View employees ↗</a></div>
    <div class="notice info-notice"><span>ⓘ</span><div><strong>Compare like with like</strong><p>Salary amounts are grouped by currency. This report does not convert foreign currencies or calculate a misleading global total.</p></div></div>
    <div class="loading-state" *ngIf="loading">Calculating compensation insights…</div><div class="notice error-notice" *ngIf="error">{{ error }} <button class="text-button" (click)="load()">Retry</button></div>
    <ng-container *ngIf="summary as s">
      <section class="panel insight-panel"><div class="panel-heading"><div><h2>Compensation by currency</h2><p>Employees excluding terminated records</p></div></div><div class="insight-currency-grid"><article class="insight-currency-card" *ngFor="let row of s.compensationByCurrency"><div class="insight-card-top"><span class="currency-pill">{{ row.currency }}</span><span>{{ row.employees }} people</span></div><div class="insight-average">{{ row.averageSalary | currency:row.currency:'symbol-narrow':'1.0-0' }}</div><small>Average annual salary</small><div class="range-track"><span></span></div><div class="range-labels"><span>Min {{ row.minSalary | currency:row.currency:'symbol-narrow':'1.0-0' }}</span><span>Max {{ row.maxSalary | currency:row.currency:'symbol-narrow':'1.0-0' }}</span></div><div class="currency-card-total"><small>Combined total in {{ row.currency }}</small><strong>{{ row.totalSalary | currency:row.currency:'symbol-narrow':'1.0-0' }}</strong></div></article></div></section>
      <div class="content-grid insights-grid"><section class="panel"><div class="panel-heading"><div><h2>By country</h2><p>Compensation grouped by currency</p></div></div><div class="table-wrap"><table><thead><tr><th>Country</th><th>Currency</th><th>Employees</th><th>Average</th><th>Total</th></tr></thead><tbody><tr *ngFor="let row of s.byCountry"><td><strong>{{ row.label }}</strong><small class="table-sub">{{ row.segment }}</small></td><td><span class="currency-pill">{{ row.currency }}</span></td><td>{{ row.employees }}</td><td>{{ row.averageSalary | currency:row.currency:'symbol-narrow':'1.0-0' }}</td><td class="numeric">{{ row.totalSalary | currency:row.currency:'symbol-narrow':'1.0-0' }}</td></tr></tbody></table></div></section>
      <section class="panel"><div class="panel-heading"><div><h2>By department</h2><p>Compensation grouped by currency</p></div></div><div class="department-list"><div class="department-insight" *ngFor="let row of s.byDepartment"><div class="department-insight-title"><span class="department-badge">{{ row.segment.slice(0,1) }}</span><div><strong>{{ row.segment }}</strong><small>{{ row.employees }} employees · {{ row.currency }}</small></div></div><div class="department-insight-amount"><strong>{{ row.averageSalary | currency:row.currency:'symbol-narrow':'1.0-0' }}</strong><small>average / year</small></div></div></div></section></div>
    </ng-container>
    <div class="page-footnote">Source: current employee records <span>Annual salary · Currency-specific aggregates</span></div>
  </section>
` })
export class InsightsComponent {
  private readonly api = inject(ApiService); summary: DashboardSummary | null = null; loading = true; error = '';
  constructor() { void this.load(); }
  async load() { this.loading = true; this.error = ''; try { this.summary = await this.api.dashboard(); } catch { this.error = 'Could not load salary insights. Check the API connection and your login.'; } finally { this.loading = false; } }
}
