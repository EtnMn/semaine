import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { HlmToasterImports } from "@spartan-ng/helm/sonner";
import { Footer } from "@core/layout/footer/footer";
import { Header } from "@core/layout/header/header";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, Footer, Header, HlmToasterImports],
  templateUrl: "./app.html",
})
export class App {}
