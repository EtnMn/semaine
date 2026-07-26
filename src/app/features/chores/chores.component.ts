import { Component, inject, OnInit, signal } from "@angular/core";
import { ChoresService } from "./chores.service";
import { toast } from "@spartan-ng/brain/sonner";
import { HlmSkeletonImports } from "@spartan-ng/helm/skeleton";
import { Chore } from "./chore.model";
import { ChoreCardComponent } from "./chore-card.component";
import { EmptyMessageComponent } from "@shared/components/empty-message/empty-message.components";

@Component({
  selector: "app-chores",
  templateUrl: "./chores.component.html",
  imports: [HlmSkeletonImports, ChoreCardComponent, EmptyMessageComponent],
})
export class ChoresComponent implements OnInit {
  private readonly choresService = inject(ChoresService);

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
      toast.error("Failed to load chores.", {
        description: error instanceof Error ? error.message : String(error),
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
        toast.success("Chore closed", { description: `"${choreName}" is done!` });
      }, 750);
    } catch (error) {
      this.closingChoreIds.update((ids) => ids.filter((id) => id !== choreId));
      toast.error("Failed to close chore.", {
        description: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
