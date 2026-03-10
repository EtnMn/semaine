import { Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ButtonModule } from "primeng/button";

@Component({
  selector: "app-error",
  imports: [RouterLink, ButtonModule],
  templateUrl: "./error.component.html",
})
export class ErrorComponent {
  public code = input.required<string>();
  public message = input.required<string>();
}
