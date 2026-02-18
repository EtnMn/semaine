import { Injectable } from "@angular/core";
import {
  AuthChangeEvent,
  AuthOtpResponse,
  createClient,
  Session,
  SupabaseClient,
  User,
} from "@supabase/supabase-js";

import { environment } from "../../../env/environment";

export interface Profile {
  id?: string;
  name: string;
}

@Injectable({ providedIn: "root" })
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabase.url, environment.supabase.key);
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
  public profile(user: User) {
    return this.supabase.from("profiles").select(`name`).eq("id", user.id).single<Profile>();
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  public signIn(email: string): Promise<AuthOtpResponse> {
    return this.supabase.auth.signInWithOtp({ email });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public signOut() {
    return this.supabase.auth.signOut();
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public updateProfile(profile: Profile) {
    const update = {
      ...profile,
      updated_at: new Date(),
    };
    return this.supabase.from("profiles").upsert(update);
  }
}
