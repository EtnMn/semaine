import { TestBed } from "@angular/core/testing";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { beforeEach, describe, expect, it } from "vitest";

import { UserInfoComponent } from "./user-info.component";

describe("UserInfoComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserInfoComponent],
      providers: [provideAnimationsAsync()],
    }).compileComponents();
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(UserInfoComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should display name and email", () => {
    const fixture = TestBed.createComponent(UserInfoComponent);
    fixture.componentRef.setInput("name", "Alice");
    fixture.componentRef.setInput("email", "alice@example.com");
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("Alice");
    expect(el.textContent).toContain("alice@example.com");
  });

  it("should show avatar image when avatarUrl is provided", () => {
    const fixture = TestBed.createComponent(UserInfoComponent);
    fixture.componentRef.setInput("avatarUrl", "https://example.com/avatar.png");
    fixture.componentRef.setInput("name", "Alice");
    fixture.componentRef.setInput("email", "alice@example.com");
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const avatar = el.querySelector("hlm-avatar");
    expect(avatar).toBeTruthy();
  });

  it("should show skeleton elements when loading", () => {
    const fixture = TestBed.createComponent(UserInfoComponent);
    fixture.componentRef.setInput("loading", true);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const skeletons = el.querySelectorAll("[hlmSkeleton]");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should not show skeleton when not loading", () => {
    const fixture = TestBed.createComponent(UserInfoComponent);
    fixture.componentRef.setInput("loading", false);
    fixture.componentRef.setInput("name", "Bob");
    fixture.componentRef.setInput("email", "bob@example.com");
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("Bob");
  });
});
