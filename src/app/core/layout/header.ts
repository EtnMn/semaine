import { Component, inject, signal } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { MenubarModule } from "primeng/menubar";

import { DarkModeService } from "@core/services";

@Component({
  selector: "app-header",
  imports: [ButtonModule, MenubarModule],
  templateUrl: "./header.html",
})
export class Header {
  protected readonly darkMode = inject(DarkModeService);
  protected readonly title = signal("etn-semaine");

  protected toggleDarkMode(): void {
    this.darkMode.toggle();
  }
}
