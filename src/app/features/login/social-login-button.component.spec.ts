import { TestBed } from "@angular/core/testing";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SocialLoginButtonComponent } from "./social-login-button.component";

describe("SocialLoginButtonComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialLoginButtonComponent],
      providers: [provideAnimationsAsync()],
    }).compileComponents();
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(SocialLoginButtonComponent);
    fixture.componentRef.setInput("icon", "google");
    fixture.componentRef.setInput("label", "Google");
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should display the label", () => {
    const fixture = TestBed.createComponent(SocialLoginButtonComponent);
    fixture.componentRef.setInput("icon", "github");
    fixture.componentRef.setInput("label", "GitHub");
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("GitHub");
  });

  it("should emit clicked event when button is clicked", () => {
    const fixture = TestBed.createComponent(SocialLoginButtonComponent);
    fixture.componentRef.setInput("icon", "google");
    fixture.componentRef.setInput("label", "Google");
    fixture.detectChanges();

    const clicked = vi.fn();
    fixture.componentInstance.clicked.subscribe(clicked);

    const button = fixture.nativeElement.querySelector("button") as HTMLButtonElement;
    button.click();

    expect(clicked).toHaveBeenCalledOnce();
  });

  it("should disable the button when disabled input is true", () => {
    const fixture = TestBed.createComponent(SocialLoginButtonComponent);
    fixture.componentRef.setInput("icon", "google");
    fixture.componentRef.setInput("label", "Google");
    fixture.componentRef.setInput("disabled", true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("should enable the button by default", () => {
    const fixture = TestBed.createComponent(SocialLoginButtonComponent);
    fixture.componentRef.setInput("icon", "google");
    fixture.componentRef.setInput("label", "Google");
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector("button") as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });
});
