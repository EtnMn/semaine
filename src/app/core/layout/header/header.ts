import { Component, computed, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideList,
  lucideLogOut,
  lucideMoon,
  lucideSun,
  lucideUser,
  lucideUsers,
} from "@ng-icons/lucide";
import { HlmAvatarImports } from "@spartan-ng/helm/avatar";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmDropdownMenuImports } from "@spartan-ng/helm/dropdown-menu";

import { AuthService, DarkModeService } from "@core/services";
import { UserInfoComponent } from "@shared/components/user-info.component";

@Component({
  selector: "app-header",
  imports: [
    RouterLink,
    NgIcon,
    HlmButtonImports,
    HlmAvatarImports,
    HlmDropdownMenuImports,
    UserInfoComponent,
  ],
  viewProviders: [
    provideIcons({ lucideList, lucideLogOut, lucideMoon, lucideSun, lucideUser, lucideUsers }),
  ],
  templateUrl: "./header.html",
})
export class Header {
  protected readonly darkMode = inject(DarkModeService);
  protected readonly authService = inject(AuthService);

  protected readonly title = signal("semaine");

  protected onSignOut(): void {
    this.authService.signOut();
  }

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
