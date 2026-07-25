import { TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it } from "vitest";

import { EmptyMessageComponent } from "./empty-message.components";

describe("EmptyMessageComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyMessageComponent],
    }).compileComponents();
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(EmptyMessageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should display default title when none provided", () => {
    const fixture = TestBed.createComponent(EmptyMessageComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("No items to display");
  });

  it("should display custom title when provided", () => {
    const fixture = TestBed.createComponent(EmptyMessageComponent);
    fixture.componentRef.setInput("title", "No tasks found");
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("No tasks found");
  });

  it("should display caption when provided", () => {
    const fixture = TestBed.createComponent(EmptyMessageComponent);
    fixture.componentRef.setInput("caption", "Try creating one");
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("Try creating one");
  });

  it("should not display caption when not provided", () => {
    const fixture = TestBed.createComponent(EmptyMessageComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const paragraphs = el.querySelectorAll("p");
    // Only the title paragraph should be present
    expect(paragraphs.length).toBe(1);
  });
});
