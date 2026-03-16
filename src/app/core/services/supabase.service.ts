import { Injectable } from "@angular/core";
import {
  AuthChangeEvent,
  createClient,
  Session,
  SupabaseClient,
  User,
} from "@supabase/supabase-js";

import { environment } from "@env/environment";

export interface Profile {
  id: string;
  role: "user" | "admin";
}

@Injectable({ providedIn: "root" })
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabase.url, environment.supabase.key);
  }

  public get client(): SupabaseClient {
    return this.supabase;
  }

  // Get the current user details if there is an existing session.
  public async getUser(): Promise<User | null> {
    const { data, error } = await this.supabase.auth.getUser();
    if (error) {
      return null;
    }
    return data.user;
  }

  // Get application profile details for a user by their unique id.
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public getProfile(user: User) {
    return this.supabase.from("profiles").select(`role`).eq("id", user.id).single<Profile>();
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  public async signIn(provider: "github" | "google"): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public signOut() {
    return this.supabase.auth.signOut();
  }
}
