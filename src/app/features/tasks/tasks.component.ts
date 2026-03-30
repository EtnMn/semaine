import { Component, inject, OnInit, signal } from "@angular/core";

import { Task } from "./task.model";
import { TasksService } from "./tasks.service";

@Component({
  selector: "app-tasks",
  templateUrl: "./tasks.component.html",
  imports: [],
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
      this.tasks.set(tasks);
      this.total.set(total);
    } finally {
      this.loading.set(false);
    }
  }
}
