import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCircleAlert } from "@ng-icons/lucide";
import { HlmAlertImports } from "@spartan-ng/helm/alert";

import { AuthService } from "@core/services";

import { SocialLoginButtonComponent } from "./social-login-button.component";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  imports: [FormsModule, NgIcon, HlmAlertImports, SocialLoginButtonComponent],
  providers: [provideIcons({ lucideCircleAlert })],
})
export class LoginComponent {
  protected readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal(
    decodeURIComponent(this.route.snapshot.queryParamMap.get("error_description") ?? ""),
  );

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
