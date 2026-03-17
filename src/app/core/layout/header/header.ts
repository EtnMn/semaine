import { Component, computed, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { MenubarModule } from "primeng/menubar";
import { AvatarModule } from "primeng/avatar";
import { MenuModule } from "primeng/menu";
import { MenuItem } from "primeng/api";

import { AuthService, DarkModeService } from "@core/services";
import { UserInfoComponent } from "@shared/components/user-info.component";

@Component({
  selector: "app-header",
  imports: [RouterLink, ButtonModule, MenubarModule, AvatarModule, MenuModule, UserInfoComponent],
  templateUrl: "./header.html",
})
export class Header {
  protected readonly darkMode = inject(DarkModeService);
  protected readonly authService = inject(AuthService);

  protected readonly title = signal("semaine");

  protected readonly items = computed<MenuItem[]>(() => [
    {
      separator: true,
    },
    {
      label: "Manage users",
      icon: "pi pi-users",
      routerLink: "/admin/users",
      visible: this.authService.isAdministrator(),
      linkClass: "text-sm",
    },
    {
      separator: true,
      visible: this.authService.isAdministrator(),
    },
    {
      label: "Sign out",
      icon: "pi pi-sign-out",
      linkClass: "text-sm",
      command: () => {
        this.authService.signOut();
      },
    },
  ]);

  protected readonly userName = computed(() => {
    const user = this.authService.currentUser();
    return user?.user_metadata?.["name"] ?? user?.email ?? null;
  });

  protected readonly avatarUrl = computed(() => {
    const user = this.authService.currentUser();
    return user?.user_metadata?.["avatar_url"] ?? null;
  });

  protected readonly userEmail = computed(() => {
    const user = this.authService.currentUser();
    return user?.email ?? null;
  });

  protected toggleDarkMode(): void {
    this.darkMode.toggle();
  }
}
