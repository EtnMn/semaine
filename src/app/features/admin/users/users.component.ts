import { Component, inject, OnInit, signal } from "@angular/core";
import { AvatarModule } from "primeng/avatar";
import { DataViewModule } from "primeng/dataview";
import { DividerModule } from "primeng/divider";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ToastModule } from "primeng/toast";
import { MessageModule } from "primeng/message";

import { User } from "./user.model";
import { UsersService } from "./users.service";
import { UserInfoComponent } from "@shared/components/user-info.component";
import { ConfirmationService, MessageService } from "primeng/api";
import { AuthService } from "@core/services";

@Component({
  selector: "app-admin-users",
  templateUrl: "./users.component.html",
  imports: [
    DataViewModule,
    AvatarModule,
    UserInfoComponent,
    DividerModule,
    ButtonModule,
    ConfirmDialogModule,
    MessageModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
  host: { class: "max-w-4xl mx-auto" },
})
export class UsersComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly authService = inject(AuthService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  protected readonly users = signal<User[]>([]);
  protected readonly me = this.authService.currentUser;
  protected readonly totalCount = signal(0);
  protected readonly loading = signal(false);
  protected readonly pageSize = 20;

  public ngOnInit(): void {
    void this.loadPage(0);
  }

  protected onDeleteUser(user: User): void {
    this.confirmationService.confirm({
      message: `Do you want to delete the user: ${user.name}?`,
      header: "Delete user",
      icon: "pi pi-exclamation-triangle",
      rejectLabel: "Cancel",
      rejectButtonProps: {
        label: "Cancel",
        severity: "secondary",
        outlined: true,
      },
      acceptButtonProps: {
        label: "Delete",
        severity: "danger",
      },
      accept: () => void this.deleteUser(user),
    });
  }

  private async deleteUser(user: User): Promise<void> {
    try {
      await this.usersService.deleteUser(user.id);
      this.users.update((list) => list.filter((u) => u.id !== user.id));
      this.totalCount.update((count) => count - 1);
      this.messageService.add({
        severity: "success",
        summary: "Deleted",
        detail: `User ${user.name} has been deleted`,
      });
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? ` ${error.message}`
          : "Failed to delete user ${user.name}";
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: `${message}`,
      });
    }
  }

  protected async loadPage(page: number): Promise<void> {
    const timer = setTimeout(() => this.loading.set(true), 300);
    try {
      const { users, total } = await this.usersService.getPage(page, this.pageSize);
      this.users.set(users);
      this.totalCount.set(total);
    } finally {
      clearTimeout(timer);
      this.loading.set(false);
    }
  }
}
