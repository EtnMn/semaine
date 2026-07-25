import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { beforeEach, describe, expect, it } from "vitest";

import { ErrorComponent } from "./error.component";

describe("ErrorComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(ErrorComponent);
    fixture.componentRef.setInput("code", "404");
    fixture.componentRef.setInput("message", "Not found");
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should display the error code", () => {
    const fixture = TestBed.createComponent(ErrorComponent);
    fixture.componentRef.setInput("code", "404");
    fixture.componentRef.setInput("message", "Not found");
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("404");
  });

  it("should display the error message", () => {
    const fixture = TestBed.createComponent(ErrorComponent);
    fixture.componentRef.setInput("code", "403");
    fixture.componentRef.setInput("message", "You are not authorized");
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("You are not authorized");
  });

  it("should render a back to home button", () => {
    const fixture = TestBed.createComponent(ErrorComponent);
    fixture.componentRef.setInput("code", "404");
    fixture.componentRef.setInput("message", "Not found");
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("Back to Home");
  });
});
