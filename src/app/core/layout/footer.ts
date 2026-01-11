import { Component, signal } from "@angular/core";

@Component({
  selector: "app-footer",
  imports: [],
  templateUrl: "./footer.html",
})
export class Footer {
  protected readonly year = signal(new Date().getFullYear());
}
