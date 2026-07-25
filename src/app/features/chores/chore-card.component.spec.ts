import { TestBed } from "@angular/core/testing";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConfirmationService } from "primeng/api";

import { Chore } from "./chore.model";
import { ChoreCardComponent } from "./chore-card.component";

const mockChore: Chore = {
  id: "chore-1",
  date: "2026-07-25",
  task: {
    id: "task-1",
    name: "Clean kitchen",
    description: "Wipe all surfaces",
    periodicity: "weekly",
    difficulty: "easy",
    duration: 20,
    tags: ["home"],
  },
};

describe("ChoreCardComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChoreCardComponent],
      providers: [provideAnimationsAsync(), ConfirmationService],
    }).compileComponents();
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(ChoreCardComponent);
    fixture.componentRef.setInput("chore", mockChore);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should display chore task name", () => {
    const fixture = TestBed.createComponent(ChoreCardComponent);
    fixture.componentRef.setInput("chore", mockChore);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("Clean kitchen");
  });

  it("should display chore duration", () => {
    const fixture = TestBed.createComponent(ChoreCardComponent);
    fixture.componentRef.setInput("chore", mockChore);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("20 min");
  });

  it("getChoreColorClass should return correct class for each difficulty", () => {
    const fixture = TestBed.createComponent(ChoreCardComponent);
    fixture.componentRef.setInput("chore", mockChore);
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      getChoreColorClass: (d: string) => string;
    };

    expect(component.getChoreColorClass("easy")).toBe("chore-block--easy");
    expect(component.getChoreColorClass("medium")).toBe("chore-block--medium");
    expect(component.getChoreColorClass("hard")).toBe("chore-block--hard");
  });

  it("getDifficultyBadgeClass should return correct class", () => {
    const fixture = TestBed.createComponent(ChoreCardComponent);
    fixture.componentRef.setInput("chore", mockChore);
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      getDifficultyBadgeClass: (d: string) => string;
    };

    expect(component.getDifficultyBadgeClass("easy")).toContain("lime");
    expect(component.getDifficultyBadgeClass("medium")).toContain("amber");
    expect(component.getDifficultyBadgeClass("hard")).toContain("rose");
  });

  it("getPeriodicityIcon should return correct icon", () => {
    const fixture = TestBed.createComponent(ChoreCardComponent);
    fixture.componentRef.setInput("chore", mockChore);
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      getPeriodicityIcon: (p: string) => string;
    };

    expect(component.getPeriodicityIcon("daily")).toBe("pi-sun");
    expect(component.getPeriodicityIcon("weekly")).toBe("pi-calendar");
    expect(component.getPeriodicityIcon("monthly")).toBe("pi-calendar-plus");
    expect(component.getPeriodicityIcon("yearly")).toBe("pi-history");
    expect(component.getPeriodicityIcon("unique")).toBe("pi-star");
    expect(component.getPeriodicityIcon("unknown")).toBe("pi-calendar");
  });

  it("should emit closed event when close is confirmed", async () => {
    const fixture = TestBed.createComponent(ChoreCardComponent);
    fixture.componentRef.setInput("chore", mockChore);
    fixture.detectChanges();

    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);

    const component = fixture.componentInstance as unknown as {
      onCloseChore: (id: string) => void;
    };

    // Access the component's own ConfirmationService instance
    const confirmationService = fixture.debugElement.injector.get(ConfirmationService);
    vi.spyOn(confirmationService, "confirm").mockImplementation((config) => {
      config.accept?.();
      return confirmationService;
    });

    component.onCloseChore("chore-1");

    expect(closed).toHaveBeenCalledWith("chore-1");
  });
});
