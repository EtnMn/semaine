import { inject, Injectable } from "@angular/core";

import { SupabaseService } from "@core/services/supabase.service";

import { User } from "./user.model";

@Injectable({ providedIn: "root" })
export class UsersService {
  private readonly supabaseService = inject(SupabaseService);

  public async getUsersPage(
    page: number,
    pageSize = 20,
  ): Promise<{ users: User[]; total: number }> {
    const [pageResult, countResult] = await Promise.all([
      this.supabaseService.client.rpc("get_users_page", {
        p_limit: pageSize,
        p_offset: page * pageSize,
      }),
      this.supabaseService.client.from("profiles").select("*", { count: "exact", head: true }),
    ]);

    if (pageResult.error) {
      throw new Error(pageResult.error.message);
    }

    if (countResult.error) {
      throw new Error(countResult.error.message);
    }

    return {
      users: (pageResult.data ?? []) as User[],
      total: countResult.count ?? 0,
    };
  }

  public async deleteUser(id: string): Promise<void> {
    const { error } = await this.supabaseService.client.rpc("delete_user", { p_user_id: id });
    if (error) {
      throw new Error(error.message);
    }
  }

  public async updateUserRole(id: string, role: "user" | "admin"): Promise<void> {
    const { error } = await this.supabaseService.client
      .from("profiles")
      .update({ role })
      .eq("id", id);
    if (error) {
      throw new Error(error.message);
    }
  }

  public async inviteUser(email: string): Promise<void> {
    const { error } = await this.supabaseService.client.functions.invoke("invite-user", {
      body: { email },
    });
    if (error instanceof Error && "context" in error) {
      const body = await (error as { context: Response }).context.json();
      throw new Error(body?.error ?? error.message);
    } else if (error) {
      throw new Error(error.message);
    }
  }
}
