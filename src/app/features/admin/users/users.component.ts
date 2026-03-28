import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { FormsModule, NgForm } from "@angular/forms";
import { AvatarModule } from "primeng/avatar";
import { DataViewModule } from "primeng/dataview";
import { DividerModule } from "primeng/divider";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from "primeng/inputtext";
import { ToastModule } from "primeng/toast";
import { MessageModule } from "primeng/message";
import { TagModule } from "primeng/tag";
import { MenuModule } from "primeng/menu";
import { MenuItem } from "primeng/api";

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
    DialogModule,
    InputTextModule,
    FormsModule,
    MessageModule,
    ToastModule,
    TagModule,
    MenuModule,
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

  protected readonly inviteDialogVisible = signal(false);
  protected readonly inviteLoading = signal(false);

  protected email = "";

  private readonly menuUser = signal<User | null>(null);

  protected readonly menuItems = computed<MenuItem[]>(() => {
    if (!this.menuUser()) return [];

    return [
      {
        label: this.menuUser()!.role === "admin" ? "Set to user" : "Set to administrator",
        linkClass: "text-sm",
        command: () => void this.toggleRole(this.menuUser()!),
      },
    ];
  });

  public ngOnInit(): void {
    this.loadPage(0);
  }

  protected onInviteUser(): void {
    this.inviteDialogVisible.set(true);
  }

  protected async onConfirmInvite(form: NgForm): Promise<void> {
    if (form.valid) {
      this.inviteLoading.set(true);
      try {
        await this.usersService.inviteUser(form.value.email);
        this.inviteDialogVisible.set(false);
        this.messageService.add({
          severity: "success",
          summary: "Invitation sent",
          detail: `An invitation has been sent to ${form.value.email}`,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to send invitation";
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: message,
        });
      } finally {
        form.resetForm();
        this.loadPage(0);
        this.inviteLoading.set(false);
      }
    }
  }

  protected openUserMenu(
    menu: { toggle: (e: MouseEvent) => void },
    user: User,
    event: MouseEvent,
  ): void {
    this.menuUser.set(user);
    menu.toggle(event);
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

  private async toggleRole(user: User): Promise<void> {
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      await this.usersService.updateUserRole(user.id, newRole);
      this.users.update((list) =>
        list.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)),
      );
      this.messageService.add({
        severity: "success",
        summary: "Role updated",
        detail: `${user.name ?? user.email} is now ${newRole === "admin" ? "an administrator" : "a user"}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update role";
      this.messageService.add({ severity: "error", summary: "Error", detail: message });
    }
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
          : `Failed to delete user ${user.name}`;
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
