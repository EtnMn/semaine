import { computed, inject, Injectable, signal } from "@angular/core";
import { SupabaseService } from "./supabase.service";
import { User } from "@supabase/supabase-js";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly supabaseService = inject(SupabaseService);
  private readonly user = signal<User | null>(null);

  public readonly initialized: Promise<void>;
  public readonly currentUser = this.user.asReadonly();

  constructor() {
    this.supabaseService.authChanges((_event, session) => {
      this.user.set(session?.user ?? null);
    });

    this.initialized = this.supabaseService.getUser().then((user) => this.user.set(user));
  }

  public readonly isAuthenticated = computed(() => this.user() !== null);

  public async signIn(provider: "google" | "github"): Promise<void> {
    await this.supabaseService.signIn(provider);
  }

  public async signOut(): Promise<void> {
    await this.supabaseService.signOut();
  }
}
