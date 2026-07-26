import { TestBed } from "@angular/core/testing";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Chore } from "./chore.model";
import { ChoreCardComponent } from "./chore-card.component";
import { TasksService } from "../tasks/tasks.service";

const mockChore: Chore = {
  id: "chore-1",
  date: "2026-07-25",
  created_at: "2026-07-25T10:00:00Z",
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
  let mockTasksService: {
    getPeriodicityIcon: ReturnType<typeof vi.fn>;
    getDifficultyIcon: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockTasksService = {
      getPeriodicityIcon: vi.fn((periodicity: string) => {
        const icons: Record<string, string> = {
          unique: "lucideZap",
          daily: "lucideSun",
          weekly: "lucideCalendar",
          monthly: "lucideCalendarPlus",
          yearly: "lucideGlobe",
        };
        return icons[periodicity.toLowerCase()] ?? "lucideCalendar";
      }),
      getDifficultyIcon: vi.fn((difficulty: string) => {
        return {
          easy: "lucideSmile",
          medium: "lucideStar",
          hard: "lucideWrench",
        }[difficulty];
      }),
    };

    await TestBed.configureTestingModule({
      imports: [ChoreCardComponent],
      providers: [provideAnimationsAsync(), { provide: TasksService, useValue: mockTasksService }],
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

  it("should call taskService.getPeriodicityIcon on render", () => {
    const fixture = TestBed.createComponent(ChoreCardComponent);
    fixture.componentRef.setInput("chore", mockChore);
    fixture.detectChanges();

    expect(mockTasksService.getPeriodicityIcon).toHaveBeenCalledWith("weekly");
  });

  it("should emit closed event when close is confirmed", () => {
    const fixture = TestBed.createComponent(ChoreCardComponent);
    fixture.componentRef.setInput("chore", mockChore);
    fixture.detectChanges();

    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);

    const component = fixture.componentInstance as unknown as {
      onConfirmCloseChore: (id: string) => void;
    };

    component.onConfirmCloseChore("chore-1");

    expect(closed).toHaveBeenCalledWith("chore-1");
  });
});
