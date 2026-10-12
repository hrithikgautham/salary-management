import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { SupabaseService } from './supabase.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(environment.apiBaseUrl)) return next(request);
  const auth = inject(SupabaseService);
  return from(auth.accessToken()).pipe(switchMap(token => {
    if (!token) return next(request);
    return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }));
};
