import { Routes } from "@angular/router";
import { authGuard } from "@core/guards/auth.guard";
import { guestGuard } from "@core/guards/guest.guard";
import { adminGuard } from "@core/guards/admin.guard";

export const routes: Routes = [
  {
    path: "login",
    canActivate: [guestGuard],
    loadComponent: () =>
      import("@features/auth/login/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "admin",
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: "users",
        loadComponent: () =>
          import("@features/admin/users/users.component").then((m) => m.UsersComponent),
      },
    ],
  },
  {
    path: "unauthorized",
    canActivate: [authGuard],
    loadComponent: () =>
      import("@features/errors/unauthorized/unauthorized.component").then(
        (m) => m.UnauthorizedComponent,
      ),
  },
  {
    path: "",
    canActivate: [authGuard],
    loadComponent: () => import("@features/home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "**",
    loadComponent: () =>
      import("@features/errors/not-found/not-found.component").then((m) => m.NotFoundComponent),
  },
];
