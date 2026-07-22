import { Component, inject, input, output } from "@angular/core";
import { TitleCasePipe } from "@angular/common";
import { Task, TaskDifficulty } from "./task.model";
import { ButtonModule } from "primeng/button";
import { MenuModule } from "primeng/menu";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmationService } from "primeng/api";

@Component({
  selector: "app-task-card",
  templateUrl: "./task-card.component.html",
  styleUrl: "./task-card.component.css",
  host: { class: "block h-full" },
  imports: [ButtonModule, MenuModule, ConfirmDialogModule, TitleCasePipe],
  providers: [ConfirmationService],
})
export class TaskCardComponent {
  public readonly task = input.required<Task>();
  public readonly taskEdited = output<string>();
  public readonly taskDeleted = output<string>();
  private readonly confirmationService = inject(ConfirmationService);

  protected readonly items = [
    {
      label: "Edit",
      icon: "pi pi-pencil",
      command: () => this.onEditTask(),
    },
    {
      label: "Delete",
      icon: "pi pi-trash",
      labelClass: "text-red-600 dark:text-red-400",
      iconClass: "!text-red-600 dark:!text-red-400",
      command: () => this.onDeleteTask(),
    },
  ];

  protected difficultyIcon(difficulty: TaskDifficulty): string {
    return { easy: "pi pi-check", medium: "pi pi-bolt", hard: "pi pi-exclamation-triangle" }[
      difficulty
    ];
  }

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

  protected async onEditTask(): Promise<void> {
    this.taskEdited.emit(this.task().id);
  }

  private onDeleteTask(): void {
    this.confirmationService.confirm({
      message: "Do you want to delete this record?",
      header: `Delete task${this.task().name}`,
      icon: "pi pi-info-circle",
      rejectLabel: "Cancel",
      rejectButtonProps: {
        label: "Cancel",
        severity: "secondary",
        outlined: true,
      },
      acceptButtonProps: {
        label: "Delete",
        severity: "danger",
      },

      accept: () => {
        this.taskDeleted.emit(this.task().id);
      },
    });
  }
}
