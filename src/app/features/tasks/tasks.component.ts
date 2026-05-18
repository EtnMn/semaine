import { NgClass } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DataViewModule } from "primeng/dataview";
import { ToastModule } from "primeng/toast";

import { Task, TaskDifficulty } from "./task.model";
import { TasksService } from "./tasks.service";

@Component({
  selector: "app-tasks",
  templateUrl: "./tasks.component.html",
  imports: [NgClass, ToastModule, ConfirmDialogModule, DataViewModule, ButtonModule],
  providers: [ConfirmationService, MessageService],
})
export class TasksComponent implements OnInit {
  private readonly tasksService = inject(TasksService);

  protected readonly loading = signal(false);
  protected readonly tasks = signal<Task[]>([]);
  protected readonly total = signal(0);

  public ngOnInit(): void {
    this.loadPage(0);
  }

  protected async loadPage(page: number): Promise<void> {
    try {
      const { tasks, total } = await this.tasksService.getTasksPage(page);
      this.tasks.set([]);
      this.total.set(total);
    } finally {
      this.loading.set(false);
    }
  }

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

  protected periodicityIcon(periodicity: Task["periodicity"]): string {
    return (
      {
        unique: "pi pi-flag",
        daily: "pi pi-sun",
        weekly: "pi pi-calendar",
        monthly: "pi pi-calendar-plus",
        yearly: "pi pi-star",
      }[periodicity] ?? "pi pi-calendar"
    );
  }

  protected async onCreateTask(): Promise<void> {
    // to be implemented.
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async onEditTask(_task: Task): Promise<void> {
    // to be implemented.
  }
}
