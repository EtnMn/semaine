import { Component, input, output } from "@angular/core";
import { Button } from "primeng/button";

@Component({
  selector: "app-social-login-button",
  template: `
    <p-button severity="secondary" fluid [disabled]="disabled()" (click)="clicked.emit()">
      <i [class]="'pi pi-' + icon()"></i>
      <span class="font-medium">Continue with {{ label() }}</span>
    </p-button>
  `,
  imports: [Button],
})
export class SocialLoginButtonComponent {
  public readonly icon = input.required<string>();
  public readonly label = input.required<string>();
  public readonly disabled = input(false);
  public readonly clicked = output<void>();
}
