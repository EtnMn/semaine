import { Component, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ConfirmationService, MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DataViewModule } from "primeng/dataview";
import { ToastModule } from "primeng/toast";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { ToggleSwitchModule } from "primeng/toggleswitch";

import { Task } from "./task.model";
import { TaskFormDialogComponent } from "./task-form-dialog.component";
import { TasksService } from "./tasks.service";
import { TaskCardComponent } from "./task-card.component";
import { EmptyMessageComponent } from "@shared/components/empty-message/empty-message.components";

@Component({
  selector: "app-tasks",
  templateUrl: "./tasks.component.html",
  imports: [
    FormsModule,
    ToastModule,
    ConfirmDialogModule,
    DataViewModule,
    ButtonModule,
    TaskCardComponent,
    TaskFormDialogComponent,
    EmptyMessageComponent,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ToggleSwitchModule,
  ],
  providers: [ConfirmationService, MessageService],
})
export class TasksComponent implements OnInit {
  private readonly tasksService = inject(TasksService);
  private readonly messageService = inject(MessageService);

  protected readonly editingTask = signal<Task | null>(null);
  protected readonly loading = signal(false);
  protected readonly taskFormDisplayed = signal(false);
  protected readonly showOnlyStarted = signal(true);
  protected readonly tasks = signal<Task[]>([]);
  protected readonly total = signal(0);
  protected readonly searchTerm = signal("");
  protected readonly pageSize = 9;

  private searchDebounce: ReturnType<typeof setTimeout> | undefined;

  public ngOnInit(): void {
    this.loadPage(0);
  }

  protected async loadPage(page: number): Promise<void> {
    this.loading.set(true);
    try {
      const { tasks, total } = await this.tasksService.getTasksPage(
        page / this.pageSize,
        this.pageSize,
        this.searchTerm(),
        this.showOnlyStarted(),
      );
      this.tasks.set(tasks);
      this.total.set(total);
    } catch (error) {
      this.messageService.add({
        severity: "error",
        summary: "Failed to load tasks.",
        detail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      this.loading.set(false);
    }
  }

  protected toggleShowStartedOnly(): void {
    this.loadPage(0);
  }

  protected onSearch(query: string): void {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.searchTerm.set(query);
      this.loadPage(0);
    }, 300);
  }

  protected onCreateTask(): void {
    this.editingTask.set(null);
    this.taskFormDisplayed.set(true);
  }

  protected async onEditTask(taskId: string): Promise<void> {
    try {
      const task = await this.tasksService.getTask(taskId);
      this.editingTask.set(task);
      this.taskFormDisplayed.set(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load task";
      this.messageService.add({ severity: "error", summary: "Error", detail: message });
    }
  }

  protected async onSaveTask(data: Omit<Task, "id">): Promise<void> {
    const editingId = this.editingTask()?.id;
    try {
      if (editingId) {
        await this.tasksService.updateTask(editingId, data);
        this.messageService.add({
          severity: "success",
          summary: "Task updated",
          detail: `"${data.name}" has been updated.`,
        });
      } else {
        await this.tasksService.createTask(data);
        this.messageService.add({
          severity: "success",
          summary: "Task created",
          detail: `"${data.name}" has been created.`,
        });
      }
      this.taskFormDisplayed.set(false);
      this.loadPage(0);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      this.messageService.add({ severity: "error", summary: "Error", detail: message });
    }
  }

  protected async onDeleteTask(taskId: string): Promise<void> {
    try {
      await this.tasksService.deleteTask(taskId);
      this.messageService.add({
        severity: "success",
        summary: "Task deleted",
        detail: "The task has been deleted.",
      });
      this.loadPage(0);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      this.messageService.add({ severity: "error", summary: "Error", detail: message });
    }
  }
}
