import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "@core/services";

// Guard to protect routes that require administrator role.
export const adminGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  await authService.initialized;
  return authService.isAdministrator() || router.createUrlTree(["/unauthorized"]);
};
