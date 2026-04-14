import { inject, Injectable } from "@angular/core";

import { SupabaseService } from "@core/services/supabase.service";

import { Task } from "./task.model";

@Injectable({ providedIn: "root" })
export class TasksService {
  private readonly supabaseService = inject(SupabaseService);

  public async getTask(id: string): Promise<Task> {
    const { data, error } = await this.supabaseService.client
      .from("tasks")
      .select("id, name, description, periodicity, difficulty, started, duration, tags")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Task not found");
    }

    return data;
  }

  public async getTasksPage(
    page: number,
    pageSize = 20,
  ): Promise<{ tasks: Task[]; total: number }> {
    const { data, error, count } = await this.supabaseService.client
      .from("tasks")
      .select("id, name, description, periodicity, difficulty, started, duration, tags", {
        count: "exact",
      })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      throw new Error(error.message);
    }

    return { tasks: data, total: count ?? 0 };
  }

  public async createTask(task: Omit<Task, "id">): Promise<void> {
    const { error } = await this.supabaseService.client.from("tasks").insert(task);
    if (error) {
      throw new Error(error.message);
    }
  }

  public async updateTask(id: string, updates: Partial<Omit<Task, "id">>): Promise<void> {
    const { error } = await this.supabaseService.client.from("tasks").update(updates).eq("id", id);
    if (error) {
      throw new Error(error.message);
    }
  }

  public async deleteTask(id: string): Promise<void> {
    const { error } = await this.supabaseService.client.from("tasks").delete().eq("id", id);
    if (error) {
      throw new Error(error.message);
    }
  }
}
