import { Component, inject, input, output } from "@angular/core";
import { TitleCasePipe } from "@angular/common";
import { Task, TaskDifficulty } from "./task.model";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { MenuModule } from "primeng/menu";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmationService } from "primeng/api";

@Component({
  selector: "app-task-card",
  templateUrl: "./task-card.component.html",
  host: { class: "block h-full group" },
  imports: [CardModule, ButtonModule, MenuModule, ConfirmDialogModule, TitleCasePipe],
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

  protected difficultyBgClass(difficulty: TaskDifficulty): string {
    return {
      easy: "bg-lime-500 dark:bg-lime-600",
      medium: "bg-amber-500 dark:bg-amber-600",
      hard: "bg-rose-600 dark:bg-rose-700",
    }[difficulty];
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
