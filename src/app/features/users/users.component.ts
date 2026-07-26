import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { FormsModule, NgForm } from "@angular/forms";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideEllipsisVertical, lucideLoaderCircle } from "@ng-icons/lucide";
import { toast } from "@spartan-ng/brain/sonner";
import { HlmAlertDialogImports } from "@spartan-ng/helm/alert-dialog";
import { HlmBadge } from "@spartan-ng/helm/badge";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmDialogImports } from "@spartan-ng/helm/dialog";
import { HlmDropdownMenuImports } from "@spartan-ng/helm/dropdown-menu";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmLabel } from "@spartan-ng/helm/label";
import { HlmPaginationImports } from "@spartan-ng/helm/pagination";
import { HlmSeparatorImports } from "@spartan-ng/helm/separator";

import { User } from "./user.model";
import { UsersService } from "./users.service";
import { UserInfoComponent } from "@shared/components/user-info.component";
import { EmptyMessageComponent } from "@shared/components/empty-message/empty-message.components";
import { AuthService } from "@core/services";

@Component({
  selector: "app-admin-users",
  templateUrl: "./users.component.html",
  imports: [
    UserInfoComponent,
    NgIcon,
    HlmDialogImports,
    HlmAlertDialogImports,
    HlmDropdownMenuImports,
    HlmSeparatorImports,
    HlmButtonImports,
    HlmInput,
    HlmLabel,
    HlmBadge,
    HlmPaginationImports,
    FormsModule,
    EmptyMessageComponent,
  ],
  providers: [provideIcons({ lucideLoaderCircle, lucideEllipsisVertical })],
})
export class UsersComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly authService = inject(AuthService);

  protected readonly me = this.authService.currentUser;
  protected readonly users = signal<User[]>([]);
  protected readonly total = signal(0);
  protected readonly loading = signal(false);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(20);

  protected readonly inviteDialogVisible = signal(false);
  protected readonly inviteLoading = signal(false);

  protected readonly deleteUserTarget = signal<User | null>(null);

  protected email = "";

  protected readonly totalPages = computed(() =>
    Array.from({ length: Math.ceil(this.total() / this.pageSize()) }, (_, i) => i + 1),
  );

  public ngOnInit(): void {
    this.loadPage(1);
  }

  protected onInviteUser(): void {
    this.inviteDialogVisible.set(true);
  }

  protected onInviteDialogStateChanged(state: "open" | "closed", form: NgForm): void {
    this.inviteDialogVisible.set(state === "open");
    if (state === "closed") {
      form.resetForm();
    }
  }

  protected async onConfirmInvite(form: NgForm): Promise<void> {
    if (form.valid) {
      this.inviteLoading.set(true);
      try {
        await this.usersService.inviteUser(form.value.email);
        this.inviteDialogVisible.set(false);
        toast.success("Invitation sent", {
          description: `An invitation has been sent to ${form.value.email}`,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to send invitation";
        toast.error("Error", { description: message });
      } finally {
        form.resetForm();
        this.loadPage(1);
        this.inviteLoading.set(false);
      }
    }
  }

  protected onDeleteUser(user: User): void {
    this.deleteUserTarget.set(user);
  }

  protected onDeleteDialogStateChanged(state: "open" | "closed"): void {
    if (state === "closed") {
      this.deleteUserTarget.set(null);
    }
  }

  protected async onConfirmDeleteUser(): Promise<void> {
    const user = this.deleteUserTarget();
    if (!user) {
      return;
    }
    this.deleteUserTarget.set(null);
    await this.deleteUser(user);
  }

  protected async loadPage(page: number): Promise<void> {
    this.currentPage.set(page);
    this.loading.set(true);
    const timer = setTimeout(() => this.loading.set(true), 300);
    try {
      const { users, total } = await this.usersService.getUsersPage(page - 1, this.pageSize());
      this.users.set(users);
      this.total.set(total);
    } finally {
      clearTimeout(timer);
      this.loading.set(false);
    }
  }

  protected onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.loadPage(1);
  }

  protected async toggleRole(user: User): Promise<void> {
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      await this.usersService.updateUserRole(user.id, newRole);
      this.users.update((list) =>
        list.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)),
      );
      toast.success("Role updated", {
        description: `${user.name ?? user.email} is now ${newRole === "admin" ? "an administrator" : "a user"}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update role";
      toast.error("Error", { description: message });
    }
  }

  private async deleteUser(user: User): Promise<void> {
    try {
      await this.usersService.deleteUser(user.id);
      this.users.update((list) => list.filter((u) => u.id !== user.id));
      this.total.update((count) => count - 1);
      toast.success("Deleted", { description: `User ${user.name} has been deleted` });
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? ` ${error.message}`
          : `Failed to delete user ${user.name}`;
      toast.error("Error", { description: message });
    }
  }
}
