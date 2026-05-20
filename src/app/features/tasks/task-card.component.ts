import { Component, input, output } from "@angular/core";
import { TitleCasePipe } from "@angular/common";
import { Task, TaskDifficulty } from "./task.model";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";

@Component({
  selector: "app-task-card",
  templateUrl: "./task-card.component.html",
  host: { class: "block h-full" },
  imports: [CardModule, ButtonModule, TitleCasePipe],
})
export class TaskCardComponent {
  public readonly task = input.required<Task>();
  public readonly taskEdited = output<string>();

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
}
