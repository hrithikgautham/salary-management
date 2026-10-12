import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(SupabaseService);
  const router = inject(Router);
  const token = await auth.accessToken();
  return token ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
