import { Component, inject, OnInit, signal } from "@angular/core";
import { AvatarModule } from "primeng/avatar";
import { DataViewModule } from "primeng/dataview";
import { DividerModule } from "primeng/divider";

import { User } from "./user.model";
import { UsersService } from "./users.service";
import { UserInfoComponent } from "@shared/components/user-info.component";

@Component({
  selector: "app-admin-users",
  templateUrl: "./users.component.html",
  imports: [DataViewModule, AvatarModule, UserInfoComponent, DividerModule],
  host: { class: "max-w-4xl mx-auto" },
})
export class UsersComponent implements OnInit {
  private readonly usersService = inject(UsersService);

  protected readonly users = signal<User[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly loading = signal(false);
  protected readonly pageSize = 20;
  protected readonly failedAvatars = signal(new Set<string>());

  public ngOnInit(): void {
    void this.loadPage(0);
  }

  protected onAvatarError(userId: string): void {
    this.failedAvatars.update((set) => new Set(set).add(userId));
  }

  private async loadPage(page: number): Promise<void> {
    this.loading.set(true);
    try {
      const { users, total } = await this.usersService.getPage(page, this.pageSize);
      this.users.set(users);
      this.totalCount.set(total);
    } finally {
      this.loading.set(false);
    }
  }
}
