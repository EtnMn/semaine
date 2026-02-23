import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { MessageModule } from "primeng/message";

import { AuthService } from "@core/services";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  imports: [FormsModule, ButtonModule, InputTextModule, MessageModule],
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly email = signal("");
  protected readonly loading = signal(false);
  protected readonly submitted = signal(false);
  protected readonly errorMessage = signal("");

  protected async onSubmit(): Promise<void> {
    this.errorMessage.set("");
    this.loading.set(true);

    try {
      await this.authService.signInWithGithub();
      this.submitted.set(true);
    } catch {
      this.errorMessage.set("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      this.loading.set(false);
    }
  }
}
