import { Component, input } from "@angular/core";

@Component({
  selector: "app-empty-message",
  templateUrl: "./empty-message.components.html",
})
export class EmptyMessageComponent {
  public readonly title = input("No items to display");
  public readonly caption = input<string>();
}
