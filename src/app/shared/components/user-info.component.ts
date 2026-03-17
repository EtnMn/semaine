import { Component, input } from "@angular/core";

@Component({
  selector: "app-user-info",
  host: { class: "block" },
  template: `
    <div class="flex w-full flex-col items-start">
      <span class="font-bold">{{ name() }}</span>
      <span class="text-sm">{{ email() }}</span>
    </div>
  `,
})
export class UserInfoComponent {
  public name = input<string>();
  public email = input<string | null>();
}
