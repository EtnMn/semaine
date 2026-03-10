import { Component } from "@angular/core";
import { ErrorComponent } from "./error.component";

@Component({
  selector: "app-not-found",
  imports: [ErrorComponent],
  template: `<app-error code="404" message="Oops! The page you're looking for can't be found." />`,
})
export class NotFoundComponent {}
