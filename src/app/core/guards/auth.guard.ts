import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "@core/services";

// Guard to protect routes that require authentication.
export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  await authService.initialized;
  return authService.isAuthenticated() || router.createUrlTree(["/login"]);
};
