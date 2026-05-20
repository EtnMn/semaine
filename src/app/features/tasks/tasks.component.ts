import { Component, inject, OnInit, signal } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DataViewModule } from "primeng/dataview";
import { ToastModule } from "primeng/toast";

import { Task } from "./task.model";
import { TasksService } from "./tasks.service";
import { TaskCardComponent } from "./task-card.component";
import { EmptyMessageComponent } from "@shared/components/empty-message/empty-message.components";

@Component({
  selector: "app-tasks",
  templateUrl: "./tasks.component.html",
  imports: [
    ToastModule,
    ConfirmDialogModule,
    DataViewModule,
    ButtonModule,
    TaskCardComponent,
    EmptyMessageComponent,
  ],
  providers: [ConfirmationService, MessageService],
})
export class TasksComponent implements OnInit {
  private readonly tasksService = inject(TasksService);

  protected readonly loading = signal(false);
  protected readonly tasks = signal<Task[]>([]);
  protected readonly total = signal(0);
  protected readonly pageSize = 9;

  public ngOnInit(): void {
    this.loadPage(0);
  }

  protected async loadPage(page: number): Promise<void> {
    this.loading.set(true);
    try {
      const { tasks, total } = await this.tasksService.getTasksPage(
        page / this.pageSize,
        this.pageSize,
      );
      this.tasks.set(tasks);
      this.total.set(total);
    } finally {
      this.loading.set(false);
    }
  }

  protected async onCreateTask(): Promise<void> {
    // to be implemented.
  }

  protected async onEditTask(taskId: string): Promise<void> {
    console.log("Edit task", taskId);
  }
}
