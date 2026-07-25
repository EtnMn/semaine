import { inject } from "@angular/core";
import { CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "@core/services";

// Guard to protect routes that require authentication.
export const authGuard: CanActivateFn = async (route, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  await authService.initialized;
  if (authService.isAuthenticated()) return true;

  const queryParams: Record<string, string> = { returnUrl: state.url };
  const errorDescription = route.queryParamMap.get("error_description");
  if (errorDescription) {
    queryParams["error_description"] = errorDescription;
  }
  return router.createUrlTree(["/login"], { queryParams });
};
