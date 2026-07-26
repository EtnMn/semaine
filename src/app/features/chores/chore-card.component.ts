import { Component, input, output, inject, signal } from "@angular/core";
import { TitleCasePipe } from "@angular/common";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideCalendar,
  lucideCalendarPlus,
  lucideGlobe,
  lucideHourglass,
  lucideSmile,
  lucideStar,
  lucideSun,
  lucideThumbsUp,
  lucideWrench,
  lucideZap,
} from "@ng-icons/lucide";
import { Chore } from "./chore.model";
import { TaskDifficulty } from "@features/tasks/task.model";
import { HlmAlertDialogImports } from "@spartan-ng/helm/alert-dialog";
import { HlmButton } from "@spartan-ng/helm/button";
import { TasksService } from "../tasks/tasks.service";

@Component({
  selector: "app-chore-card",
  templateUrl: "./chore-card.component.html",
  styleUrl: "./chore-card.component.css",
  host: { class: "contents" },
  imports: [NgIcon, HlmButton, HlmAlertDialogImports, TitleCasePipe],
  providers: [
    provideIcons({
      lucideThumbsUp,
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
export class ChoreCardComponent {
  public readonly chore = input.required<Chore>();
  public readonly closing = input<boolean>(false);
  public readonly closed = output<string>();
  protected readonly taskService = inject(TasksService);

  protected readonly confirmingClose = signal(false);

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

  protected onCloseChore(): void {
    this.confirmingClose.set(true);
  }

  protected onConfirmDialogStateChanged(state: "open" | "closed"): void {
    this.confirmingClose.set(state === "open");
  }

  protected onConfirmCloseChore(choreId: string): void {
    this.confirmingClose.set(false);
    this.closed.emit(choreId);
  }
}
