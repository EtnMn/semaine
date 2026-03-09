import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { MessageModule } from "primeng/message";

import { AuthService } from "@core/services";

import { SocialLoginButtonComponent } from "./social-login-button.component";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  host: { class: "flex flex-col flex-1 items-center" },
  imports: [FormsModule, ButtonModule, InputTextModule, MessageModule, SocialLoginButtonComponent],
})
export class LoginComponent {
  protected readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal("");

  protected async onSignIn(provider: "google" | "github"): Promise<void> {
    this.errorMessage.set("");
    this.loading.set(true);

    const returnUrl = this.route.snapshot.queryParamMap.get("returnUrl");
    if (returnUrl) {
      sessionStorage.setItem("returnUrl", returnUrl);
    }

    try {
      await this.authService.signIn(provider);
    } catch (error: unknown) {
      console.error("Login error:", error);
      const message =
        error instanceof Error ? error.message : "An error occurred. Please try again.";
      this.errorMessage.set(message);
    } finally {
      this.loading.set(false);
    }
  }
}
