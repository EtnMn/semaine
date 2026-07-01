import { Component, inject, OnInit, signal } from "@angular/core";
import { ChoresService } from "./chores.service";
import { MessageService } from "primeng/api";
import { ToastModule } from "primeng/toast";
import { DataViewModule } from "primeng/dataview";
import { Chore } from "./chore.model";
import { ButtonModule } from "primeng/button";
import { TaskDifficulty } from "@features/tasks/task.model";

@Component({
  selector: "app-chores",
  templateUrl: "./chores.component.html",
  styleUrl: "./chores.component.css",
  imports: [ToastModule, DataViewModule, ButtonModule],
  providers: [MessageService],
})
export class ChoresComponent implements OnInit {
  private readonly choresService = inject(ChoresService);
  private readonly messageService = inject(MessageService);

  protected readonly loading = signal(false);
  protected readonly chores = signal<Chore[]>([]);
  protected readonly closingChoreIds = signal<string[]>([]);

  public ngOnInit(): void {
    this.loadChores();
  }

  private async loadChores(): Promise<void> {
    this.loading.set(true);
    try {
      this.chores.set(await this.choresService.getNextChores());
    } catch (error) {
      this.messageService.add({
        severity: "error",
        summary: "Failed to load chores.",
        detail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      this.loading.set(false);
    }
  }

  protected async onCloseChore(choreId: string): Promise<void> {
    this.closingChoreIds.update((ids) => [...ids, choreId]);
    try {
      await this.choresService.closeChore(choreId);
      setTimeout(() => {
        this.chores.update((list) => list.filter((c) => c.id !== choreId));
        this.closingChoreIds.update((ids) => ids.filter((id) => id !== choreId));
      }, 750);
    } catch (error) {
      this.closingChoreIds.update((ids) => ids.filter((id) => id !== choreId));
      this.messageService.add({
        severity: "error",
        summary: "Failed to close chore.",
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }

  protected getChoreColorClass(difficulty: TaskDifficulty): string {
    switch (difficulty) {
      case "easy":
        return "chore-block--easy";
      case "medium":
        return "chore-block--medium";
      case "hard":
        return "chore-block--hard";
      default: {
        const exhaustiveCheck: never = difficulty;
        return exhaustiveCheck;
      }
    }
  }

  protected getDifficultyBadgeClass(difficulty: string): string {
    const classes: Record<string, string> = {
      easy: "bg-lime-100 text-lime-700 dark:bg-lime-500/15 dark:text-lime-400",
      medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
      hard: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
    };
    return classes[difficulty.toLowerCase()] ?? classes["medium"];
  }

  protected getPeriodicityIcon(periodicity: string): string {
    const icons: Record<string, string> = {
      unique: "pi-star",
      daily: "pi-sun",
      weekly: "pi-calendar",
      monthly: "pi-calendar-plus",
      yearly: "pi-history",
    };
    return icons[periodicity.toLowerCase()] ?? "pi-calendar";
  }
}
