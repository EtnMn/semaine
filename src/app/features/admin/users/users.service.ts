import { inject, Injectable } from "@angular/core";

import { SupabaseService } from "@core/services/supabase.service";

import { User } from "./user.model";

@Injectable({ providedIn: "root" })
export class UsersService {
  private readonly supabaseService = inject(SupabaseService);

  public async getPage(page: number, pageSize = 20): Promise<{ users: User[]; total: number }> {
    const [pageResult, countResult] = await Promise.all([
      this.supabaseService.client.rpc("get_users_page", {
        p_limit: pageSize,
        p_offset: page * pageSize,
      }),
      this.supabaseService.client.from("profiles").select("*", { count: "exact", head: true }),
    ]);

    if (pageResult.error) {
      throw pageResult.error;
    }

    if (countResult.error) {
      throw countResult.error;
    }

    return {
      users: (pageResult.data ?? []) as User[],
      total: countResult.count ?? 0,
    };
  }
}
