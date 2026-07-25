import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { beforeEach, describe, expect, it } from "vitest";

import { UnauthorizedComponent } from "./unauthorized-error.component";

describe("UnauthorizedComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnauthorizedComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(UnauthorizedComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should display 403 error code", () => {
    const fixture = TestBed.createComponent(UnauthorizedComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("403");
  });

  it("should display unauthorized message", () => {
    const fixture = TestBed.createComponent(UnauthorizedComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("not authorized");
  });
});
