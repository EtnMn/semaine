import { Component, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideSearch } from "@ng-icons/lucide";
import { toast } from "@spartan-ng/brain/sonner";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmInputGroupImports } from "@spartan-ng/helm/input-group";
import { HlmNumberedPagination } from "@spartan-ng/helm/pagination";
import { HlmSkeletonImports } from "@spartan-ng/helm/skeleton";
import { HlmSwitch } from "@spartan-ng/helm/switch";

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
    NgIcon,
    HlmButton,
    ...HlmInputGroupImports,
    HlmSwitch,
    HlmNumberedPagination,
    HlmSkeletonImports,
    TaskCardComponent,
    TaskFormDialogComponent,
    EmptyMessageComponent,
  ],
  providers: [provideIcons({ lucideSearch })],
})
export class TasksComponent implements OnInit {
  private readonly tasksService = inject(TasksService);

  protected readonly editingTask = signal<Task | null>(null);
  protected readonly loading = signal(false);
  protected readonly taskFormDisplayed = signal(false);
  protected readonly showOnlyStarted = signal(true);
  protected readonly tasks = signal<Task[]>([]);
  protected readonly total = signal(0);
  protected readonly searchTerm = signal("");
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(9);

  private searchDebounce: ReturnType<typeof setTimeout> | undefined;

  public ngOnInit(): void {
    this.loadPage(1);
  }

  protected async loadPage(page: number): Promise<void> {
    this.currentPage.set(page);
    this.loading.set(true);
    try {
      const { tasks, total } = await this.tasksService.getTasksPage(
        page - 1,
        this.pageSize(),
        this.searchTerm(),
        this.showOnlyStarted(),
      );
      this.tasks.set(tasks);
      this.total.set(total);
    } catch (error) {
      toast.error("Failed to load tasks.", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      this.loading.set(false);
    }
  }

  protected onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.loadPage(1);
  }

  protected onSearch(query: string): void {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.searchTerm.set(query);
      this.loadPage(1);
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
      toast.error("Error", { description: message });
    }
  }

  protected async onSaveTask(data: Omit<Task, "id">): Promise<void> {
    const editingId = this.editingTask()?.id;
    try {
      if (editingId) {
        await this.tasksService.updateTask(editingId, data);
        toast.success("Task updated", { description: `"${data.name}" has been updated.` });
      } else {
        await this.tasksService.createTask(data);
        toast.success("Task created", { description: `"${data.name}" has been created.` });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Error", { description: message });
    } finally {
      this.taskFormDisplayed.set(false);
      this.loadPage(1);
    }
  }

  protected async onDeleteTask(taskId: string): Promise<void> {
    try {
      await this.tasksService.deleteTask(taskId);
      toast.success("Task deleted", { description: "The task has been deleted." });
      this.loadPage(1);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Error", { description: message });
    }
  }
}
