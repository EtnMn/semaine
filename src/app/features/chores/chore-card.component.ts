import { Component, input, output } from "@angular/core";
import { Chore } from "./chore.model";
import { TaskDifficulty } from "@features/tasks/task.model";
import { ButtonModule } from "primeng/button";

@Component({
  selector: "app-chore-card",
  templateUrl: "./chore-card.component.html",
  styleUrl: "./chore-card.component.css",
  imports: [ButtonModule],
  host: { class: "contents" },
})
export class ChoreCardComponent {
  public readonly chore = input.required<Chore>();
  public readonly closing = input<boolean>(false);
  public readonly closed = output<string>();

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
