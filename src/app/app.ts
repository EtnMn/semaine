import { Component, computed, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { MenubarModule } from "primeng/menubar";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, ButtonModule, MenubarModule],
  templateUrl: "./app.html",
})
export class App {
  protected readonly title = signal("etn-semaine");
  protected readonly isDarkMode = signal(false);

  protected readonly icon = computed(() => (this.isDarkMode() ? "pi pi-sun" : "pi pi-moon"));

  private ngOnInit(): void {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      this.toggleDarkMode();
    }
  }

  protected toggleDarkMode(): void {
    const element = document.querySelector("html");
    element?.classList.toggle("etn-dark");
    this.isDarkMode.update((value) => !value);
  }
}
