import { Component, computed, input, output } from "@angular/core";
import { NgClass } from "@angular/common";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideArrowRight } from "@ng-icons/lucide";
import { simpleGithub, simpleGoogle } from "@ng-icons/simple-icons";

@Component({
  selector: "app-social-login-button",
  template: `
    <button
      type="button"
      [disabled]="disabled()"
      (click)="clicked.emit()"
      class="group flex h-12 w-full cursor-pointer items-center gap-3 rounded-xl border px-4 text-sm font-semibold transition-all duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      [ngClass]="buttonClasses()"
    >
      <span
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        [ngClass]="iconClasses()"
      >
        <ng-icon [name]="brandIcon()" />
      </span>
      <span class="flex-1 text-left">Continue with {{ label() }}</span>
      <ng-icon
        name="lucideArrowRight"
        class="text-xs opacity-30 transition-opacity duration-150 group-hover:opacity-70"
      />
    </button>
  `,
  imports: [NgClass, NgIcon],
  providers: [provideIcons({ lucideArrowRight, simpleGithub, simpleGoogle })],
})
export class SocialLoginButtonComponent {
  public readonly icon = input.required<string>();
  public readonly label = input.required<string>();
  public readonly disabled = input(false);
  public readonly clicked = output<void>();

  protected readonly brandIcon = computed(() =>
    this.icon() === "github" ? "simpleGithub" : "simpleGoogle",
  );

  protected readonly buttonClasses = computed(() =>
    this.icon() === "github"
      ? "border-gray-800 bg-gray-900 text-white shadow-sm hover:bg-gray-800 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750"
      : "border-gray-200 bg-gray-50 text-gray-800 shadow-sm hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-transparent dark:text-gray-100 dark:hover:border-blue-700",
  );

  protected readonly iconClasses = computed(() =>
    this.icon() === "github"
      ? "bg-white/10 text-white"
      : "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
  );
}
