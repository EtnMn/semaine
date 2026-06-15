import { Component, inject, OnInit, signal } from "@angular/core";
import { ChoresService } from "./chores.service";
import { MessageService } from "primeng/api";
import { ToastModule } from "primeng/toast";
import { Chore } from "./chore.model";

@Component({
  selector: "app-chores",
  templateUrl: "./chores.component.html",
  imports: [ToastModule],
  providers: [MessageService],
})
export class ChoresComponent implements OnInit {
  private readonly choresService = inject(ChoresService);
  private readonly messageService = inject(MessageService);

  protected readonly loading = signal(false);
  protected readonly chores = signal<Chore[]>([]);

  public ngOnInit(): void {
    this.loadChores();
  }

  private async loadChores(): Promise<void> {
    this.loading.set(true);
    try {
      this.chores.set(await this.choresService.getNextChores());
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
}
