import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../core/supabase.service';

@Component({ selector: 'app-login', standalone: true, imports: [CommonModule, FormsModule], template: `
  <div class="login-page">
    <section class="login-brand-panel"><div class="login-brand"><span class="brand-mark">A</span> ACME <span class="login-dot">·</span> PEOPLE</div><div class="brand-story"><div class="eyebrow light">PEOPLE FIRST. ALWAYS.</div><h1>Compensation clarity starts here.</h1><p>A clearer view of your people, your organization, and how you reward them.</p></div><div class="login-footnote">BUILT FOR THOUGHTFUL PEOPLE OPERATIONS <span>© 2026 ACME</span></div></section>
    <section class="login-form-panel"><div class="login-form-wrap"><div class="eyebrow">HR WORKSPACE</div><h2>Welcome back</h2><p class="muted">Sign in to manage your organization's compensation.</p>
      <div class="auth-tabs"><button [class.selected]="mode === 'signin'" (click)="mode='signin'">Sign in</button><button [class.selected]="mode === 'signup'" (click)="mode='signup'">Create account</button></div>
      <form (ngSubmit)="submit()" #authForm="ngForm">
        <label for="email">Work email</label><input id="email" name="email" type="email" [(ngModel)]="email" required email placeholder="you@company.com" autocomplete="email">
        <label for="password">Password</label><input id="password" name="password" type="password" [(ngModel)]="password" required minlength="8" placeholder="At least 8 characters" [autocomplete]="mode === 'signin' ? 'current-password' : 'new-password'">
        <div class="notice error-notice" *ngIf="error">{{ error }}</div><div class="notice success-notice" *ngIf="message">{{ message }}</div>
        <button class="button primary wide" type="submit" [disabled]="busy || !authForm.valid">{{ busy ? 'Please wait…' : (mode === 'signin' ? 'Sign in to workspace' : 'Create HR account') }} <span>→</span></button>
      </form>
      <p class="login-secure"><span>♧</span> Your access is protected by Supabase Authentication.</p>
    </div></section>
  </div>
` })
export class LoginComponent {
  private readonly auth = inject(SupabaseService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  email = ''; password = ''; mode: 'signin' | 'signup' = 'signin'; busy = false; error = ''; message = '';
  async submit() {
    this.busy = true; this.error = ''; this.message = '';
    try {
      if (this.mode === 'signin') {
        await this.auth.signIn(this.email.trim(), this.password);
        await this.router.navigateByUrl(this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard');
      } else {
        const result = await this.auth.signUp(this.email.trim(), this.password);
        if (!result.session) this.message = 'Account created. Check your inbox to confirm your email, then sign in.';
        else await this.router.navigateByUrl('/dashboard');
      }
    } catch (e) { this.error = e instanceof Error ? e.message : 'Authentication failed. Please try again.'; }
    finally { this.busy = false; }
  }
}
