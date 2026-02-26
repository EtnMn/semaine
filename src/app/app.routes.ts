import { Routes } from "@angular/router";
import { authGuard } from "@core/guards/auth.guard";
import { guestGuard } from "@core/guards/guest.guard";

export const routes: Routes = [
  {
    path: "login",
    canActivate: [guestGuard],
    loadComponent: () =>
      import("@features/auth/login/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "",
    canActivate: [authGuard],
    loadComponent: () => import("@features/home/home.component").then((m) => m.HomeComponent),
  },
];
