import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

export const AnonymousGuard: CanActivateFn = (route, state) => {
  const authService: AuthenticationService = inject(AuthenticationService);
  const router: Router = inject(Router);
  const authenticated = authService.isAuthenticated();

  if (!authenticated) return true;

  router.navigate(['/']);
  return false;
};
