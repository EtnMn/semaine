import { Component, input } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideUser } from "@ng-icons/lucide";
import { HlmAvatarImports } from "@spartan-ng/helm/avatar";
import { HlmSkeletonImports } from "@spartan-ng/helm/skeleton";

@Component({
  selector: "app-user-info",
  host: { class: "block overflow-hidden" },
  imports: [NgIcon, HlmAvatarImports, HlmSkeletonImports],
  viewProviders: [provideIcons({ lucideUser })],
  template: `
    <div class="flex items-center gap-4">
      @if (loading()) {
        <div hlmSkeleton class="size-8 shrink-0 rounded-full"></div>
      } @else {
        <hlm-avatar class="shrink-0">
          <img [src]="avatarUrl()!" hlmAvatarImage alt="" />
          <span hlmAvatarFallback>
            <ng-icon name="lucideUser" />
          </span>
        </hlm-avatar>
      }
      <div class="flex min-w-0 flex-col" [class.gap-y-2]="loading()">
        @if (loading()) {
          <div hlmSkeleton class="mt-1 h-4 w-32"></div>
          <div hlmSkeleton class="h-4 w-40"></div>
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
