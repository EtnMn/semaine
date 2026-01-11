import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Footer } from "@app/core/layout/footer";
import { Header } from "@app/core/layout/header";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, Footer, Header],
  templateUrl: "./app.html",
})
export class App {}
