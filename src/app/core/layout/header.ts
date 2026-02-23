import { Component, computed, inject, signal } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { MenubarModule } from "primeng/menubar";

import { AuthService, DarkModeService } from "@core/services";

@Component({
  selector: "app-header",
  imports: [ButtonModule, MenubarModule],
  templateUrl: "./header.html",
})
export class Header {
  protected readonly darkMode = inject(DarkModeService);
  private readonly authService = inject(AuthService);

  protected readonly title = signal("etn semaine");

  protected readonly userName = computed(() => {
    const user = this.authService.currentUser();
    return user?.user_metadata?.["name"] ?? user?.email ?? null;
  });

  protected toggleDarkMode(): void {
    this.darkMode.toggle();
  }
}
