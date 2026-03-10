import { Component } from "@angular/core";
import { ErrorComponent } from "./error.component";

@Component({
  selector: "app-unauthorized",
  imports: [ErrorComponent],
  template: `<app-error code="403" message="Oops! You are not authorized to view this page." />`,
})
export class UnauthorizedComponent {}
