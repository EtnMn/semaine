import { Injectable, signal, computed } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class DarkModeService {
  private readonly isDarkMode = signal(false);

  public readonly isDark = this.isDarkMode.asReadonly();

  public readonly icon = computed(() => (this.isDarkMode() ? "pi pi-sun" : "pi pi-moon"));

  constructor() {
    this.initializeDarkMode();
  }

  private initializeDarkMode(): void {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      this.toggle();
    }
  }
  public toggle(): void {
    const element = document.querySelector("html");
    element?.classList.toggle("app-dark");
    this.isDarkMode.update((value) => !value);
  }
}
