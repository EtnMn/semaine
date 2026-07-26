import { Component, inject, input, output, signal } from "@angular/core";
import { TitleCasePipe } from "@angular/common";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideCalendar,
  lucideCalendarPlus,
  lucideEllipsis,
  lucideGlobe,
  lucideHourglass,
  lucidePencil,
  lucideSmile,
  lucideStar,
  lucideSun,
  lucideTrash2,
  lucideWrench,
  lucideZap,
} from "@ng-icons/lucide";
import { Task, TaskDifficulty } from "./task.model";
import { TasksService } from "./tasks.service";
import { HlmAlertDialogImports } from "@spartan-ng/helm/alert-dialog";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmDropdownMenuImports } from "@spartan-ng/helm/dropdown-menu";

@Component({
  selector: "app-task-card",
  templateUrl: "./task-card.component.html",
  styleUrl: "./task-card.component.css",
  host: { class: "block h-full" },
  imports: [NgIcon, HlmButton, HlmDropdownMenuImports, HlmAlertDialogImports, TitleCasePipe],
  providers: [
    provideIcons({
      lucideEllipsis,
      lucidePencil,
      lucideTrash2,
      lucideHourglass,
      lucideZap,
      lucideSun,
      lucideCalendar,
      lucideCalendarPlus,
      lucideGlobe,
      lucideSmile,
      lucideStar,
      lucideWrench,
    }),
  ],
})
export class TaskCardComponent {
  public readonly task = input.required<Task>();
  public readonly taskEdited = output<string>();
  public readonly taskDeleted = output<string>();
  protected readonly taskService = inject(TasksService);

  protected readonly confirmingDelete = signal(false);

  protected getDifficultyColorClass(difficulty: TaskDifficulty): string {
    switch (difficulty) {
      case "easy":
        return "task-card--easy";
      case "medium":
        return "task-card--medium";
      case "hard":
        return "task-card--hard";
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

  protected async onEditTask(): Promise<void> {
    this.taskEdited.emit(this.task().id);
  }

  protected onDeleteTask(): void {
    this.confirmingDelete.set(true);
  }

  protected onConfirmDialogStateChanged(state: "open" | "closed"): void {
    this.confirmingDelete.set(state === "open");
  }

  protected onConfirmDeleteTask(): void {
    this.confirmingDelete.set(false);
    this.taskDeleted.emit(this.task().id);
  }
}
