import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIf, AsyncPipe } from '@angular/common';
import { SupabaseService } from './core/supabase.service';

@Component({
  selector: 'app-root', standalone: true, imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, AsyncPipe],
  template: `
    <div class="app-frame">
      <aside class="sidebar" *ngIf="auth.session$ | async as session">
        <a class="brand" routerLink="/dashboard"><span class="brand-mark">A</span><span>ACME<span class="brand-sub">PEOPLE OPERATIONS</span></span></a>
        <div class="nav-label">WORKSPACE</div>
        <nav>
          <a routerLink="/dashboard" routerLinkActive="active"><span class="nav-icon">▦</span> Overview</a>
          <a routerLink="/employees" routerLinkActive="active"><span class="nav-icon">♙</span> Employees</a>
          <a routerLink="/insights" routerLinkActive="active"><span class="nav-icon">⌁</span> Salary insights</a>
        </nav>
        <div class="sidebar-bottom"><div class="security-note"><span class="security-dot"></span><div><strong>Secure workspace</strong><small>HR access only</small></div></div></div>
      </aside>
      <main class="main-shell" [class.full-shell]="!(auth.session$ | async)">
        <header class="topbar" *ngIf="auth.session$ | async as session">
          <div class="breadcrumb">People operations <span>/</span> <strong>{{ pageLabel }}</strong></div>
          <div class="user-menu"><span class="avatar">{{ (session.user.email || 'H').slice(0,1).toUpperCase() }}</span><span class="user-email">{{ session.user.email }}</span><button class="signout" (click)="signOut()">Sign out</button></div>
        </header>
        <router-outlet />
      </main>
    </div>
  `
})
export class AppComponent {
  readonly auth = inject(SupabaseService);
  private readonly router = inject(Router);
  get pageLabel(): string {
    const url = this.router.url;
    if (url.startsWith('/employees/new')) return 'Add employee';
    if (url.startsWith('/employees/')) return 'Employee details';
    if (url.startsWith('/employees')) return 'Employees';
    if (url.startsWith('/insights')) return 'Salary insights';
    return 'Overview';
  }
  async signOut() { await this.auth.signOut(); await this.router.navigateByUrl('/login'); }
}
