import { Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideHouse } from "@ng-icons/lucide";
import { HlmButtonImports } from "@spartan-ng/helm/button";

@Component({
  selector: "app-error",
  imports: [RouterLink, NgIcon, HlmButtonImports],
  viewProviders: [provideIcons({ lucideHouse })],
  templateUrl: "./error.component.html",
})
export class ErrorComponent {
  public code = input.required<string>();
  public message = input.required<string>();
}
