import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { MessageModule } from "primeng/message";

import { AuthService } from "@core/services";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  host: { class: "flex flex-col flex-1 md:justify-center items-center" },
  imports: [FormsModule, ButtonModule, InputTextModule, MessageModule],
})
export class LoginComponent {
  protected readonly authService = inject(AuthService);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal("");

  protected async onSignIn(provider: "google" | "github"): Promise<void> {
    this.errorMessage.set("");
    this.loading.set(true);

    try {
      await this.authService.signIn(provider);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An error occurred. Please try again.";
      this.errorMessage.set(message);
    } finally {
      this.loading.set(false);
    }
  }
}
