import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "@core/services";

// Guard to protect routes that should only be accessible to unauthenticated users.
export const guestGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  await authService.initialized;
  return !authService.isAuthenticated() || router.createUrlTree(["/"]);
};
