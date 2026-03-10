import { computed, inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { Profile, SupabaseService } from "./supabase.service";
import { User } from "@supabase/supabase-js";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly supabaseService = inject(SupabaseService);
  private readonly router = inject(Router);
  private readonly user = signal<User | null>(null);
  private readonly profile = signal<Profile | null>(null);

  public readonly initialized: Promise<void>;
  public readonly currentUser = this.user.asReadonly();

  constructor() {
    this.supabaseService.authChanges((event, session) => {
      this.user.set(session?.user ?? null);
      if (session?.user) {
        this.supabaseService.getProfile(session.user).then(({ data }) => this.profile.set(data));
        if (event === "SIGNED_IN") {
          const returnUrl = sessionStorage.getItem("returnUrl");
          sessionStorage.removeItem("returnUrl");
          if (returnUrl) {
            void this.router.navigateByUrl(returnUrl);
          }
        }
      } else {
        this.profile.set(null);
      }
    });

    this.initialized = this.supabaseService.getUser().then(async (user) => {
      this.user.set(user);
      if (user) {
        const { data } = await this.supabaseService.getProfile(user);
        this.profile.set(data);
      }
    });
  }

  public readonly isAuthenticated = computed(() => this.user() !== null);

  public readonly isAdministrator = computed(() => this.profile()?.role === "admin");

  public async signIn(provider: "google" | "github"): Promise<void> {
    await this.supabaseService.signIn(provider);
  }

  public async signOut(): Promise<void> {
    await this.supabaseService.signOut();
    await this.router.navigate(["/login"]);
  }
}
