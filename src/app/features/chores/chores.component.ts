import { Component, inject, OnInit, signal } from "@angular/core";
import { ChoresService } from "./chores.service";
import { MessageService } from "primeng/api";
import { ToastModule } from "primeng/toast";
import { DataViewModule } from "primeng/dataview";
import { Chore } from "./chore.model";
import { ButtonModule } from "primeng/button";
import { ChoreCardComponent } from "./chore-card.component";

@Component({
  selector: "app-chores",
  templateUrl: "./chores.component.html",
  imports: [ToastModule, DataViewModule, ButtonModule, ChoreCardComponent],
  providers: [MessageService],
})
export class ChoresComponent implements OnInit {
  private readonly choresService = inject(ChoresService);
  private readonly messageService = inject(MessageService);

  protected readonly loading = signal(false);
  protected readonly chores = signal<Chore[]>([]);
  protected readonly closingChoreIds = signal<string[]>([]);

  public ngOnInit(): void {
    this.loadChores();
  }

  private async loadChores(): Promise<void> {
    this.loading.set(true);
    try {
      let newChores = await this.choresService.getNextChores();
      newChores = newChores.filter((c) => !this.chores().some((existing) => existing.id === c.id));
      newChores = newChores.slice(0, 12 - this.chores().length);
      this.chores.set(this.chores().concat(newChores));
    } catch (error) {
      this.messageService.add({
        severity: "error",
        summary: "Failed to load chores.",
        detail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      this.loading.set(false);
    }
  }

  protected async onCloseChore(choreId: string): Promise<void> {
    this.closingChoreIds.update((ids) => [...ids, choreId]);
    try {
      await this.choresService.closeChore(choreId);
      setTimeout(() => {
        const choreName = this.chores().find((c) => c.id === choreId)?.task.name ?? "Chore";
        this.chores.update((list) => list.filter((c) => c.id !== choreId));
        this.closingChoreIds.update((ids) => ids.filter((id) => id !== choreId));
        this.loadChores();
        this.messageService.add({
          severity: "success",
          summary: "Chore closed",
          detail: `"${choreName}" is done!`,
        });
      }, 750);
    } catch (error) {
      this.closingChoreIds.update((ids) => ids.filter((id) => id !== choreId));
      this.messageService.add({
        severity: "error",
        summary: "Failed to close chore.",
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
