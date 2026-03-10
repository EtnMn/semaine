import { inject } from "@angular/core";
import { CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "@core/services";

// Guard to protect routes that require authentication.
export const authGuard: CanActivateFn = async (_route, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  await authService.initialized;
  return (
    authService.isAuthenticated() ||
    router.createUrlTree(["/login"], { queryParams: { returnUrl: state.url } })
  );
};
