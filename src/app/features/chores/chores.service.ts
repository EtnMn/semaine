import { inject, Injectable } from "@angular/core";
import { SupabaseService } from "@core/services/supabase.service";
import { PostgrestError } from "@supabase/supabase-js";

import { Chore } from "./chore.model";

@Injectable({ providedIn: "root" })
export class ChoresService {
  private readonly supabaseService = inject(SupabaseService);

  public async getNextChores(): Promise<Chore[]> {
    const query = this.supabaseService.client
      .from("chores")
      .select("id, date, task(name, description, periodicity, difficulty, duration, tags)")
      .order("date", { ascending: true })
      .range(0, 19);

    const { data: chores, error } = (await query) as {
      data: Chore[] | null;
      error: PostgrestError | null;
    };

    if (error) {
      throw new Error(error.message);
    }

    return chores ?? [];
  }
}
