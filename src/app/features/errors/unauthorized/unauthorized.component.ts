import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ButtonModule } from "primeng/button";

@Component({
  selector: "app-unauthorized",
  imports: [RouterLink, ButtonModule],
  templateUrl: "./unauthorized.component.html",
  host: { class: "justify-center" },
})
export class UnauthorizedComponent {}
