import { Component, input } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { AvatarModule } from "primeng/avatar";
import { SkeletonModule } from "primeng/skeleton";

@Component({
  selector: "app-user-info",
  host: { class: "block overflow-hidden" },
  imports: [ButtonModule, AvatarModule, SkeletonModule],
  template: `
    <div class="flex items-center gap-4">
      @if (loading()) {
        <p-skeleton shape="circle" size="2rem" class="shrink-0" />
      } @else if (avatarUrl()) {
        <p-avatar [image]="avatarUrl()!" shape="circle" class="shrink-0" />
      } @else {
        <p-avatar icon="pi pi-user" severity="secondary" outlined class="shrink-0" />
      }
      <div class="flex min-w-0 flex-col" [class.gap-y-2]="loading()">
        @if (loading()) {
          <p-skeleton width="8rem" class="mt-1" />
          <p-skeleton width="10rem" />
        } @else {
          <span class="font-bold break-words">{{ name() }}</span>
          <span class="text-sm break-words">{{ email() }}</span>
        }
      </div>
    </div>
  `,
})
export class UserInfoComponent {
  public readonly avatarUrl = input<string | null>();
  public readonly email = input<string | null>();
  public readonly loading = input<boolean>(false);
  public readonly name = input<string>();
}
