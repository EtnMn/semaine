import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ButtonModule } from "primeng/button";

@Component({
  selector: "app-unauthorized",
  imports: [RouterLink, ButtonModule],
  templateUrl: "./unauthorized.component.html",
  host: { class: "flex flex-col flex-1 items-center" },
})
export class UnauthorizedComponent {}
