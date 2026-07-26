import { TestBed } from "@angular/core/testing";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "@spartan-ng/brain/sonner";
import { signal } from "@angular/core";

import { Chore } from "./chore.model";
import { ChoresComponent } from "./chores.component";
import { ChoresService } from "./chores.service";
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

describe("ChoresComponent", () => {
  let mockChoresService: {
    getNextChores: ReturnType<typeof vi.fn>;
    closeChore: ReturnType<typeof vi.fn>;
  };

  let mockTasksService: {
    getDifficultyIcon: ReturnType<typeof vi.fn>;
    getPeriodicityIcon: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockChoresService = {
      getNextChores: vi.fn().mockResolvedValue([mockChore]),
      closeChore: vi.fn().mockResolvedValue(undefined),
    };

    mockTasksService = {
      getDifficultyIcon: vi.fn((difficulty: string) => {
        return {
          easy: "lucideSmile",
          medium: "lucideStar",
          hard: "lucideWrench",
        }[difficulty];
      }),
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
    };

    await TestBed.configureTestingModule({
      imports: [ChoresComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: ChoresService, useValue: mockChoresService },
        { provide: TasksService, useValue: mockTasksService },
      ],
    }).compileComponents();
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(ChoresComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should call getNextChores on init", async () => {
    const fixture = TestBed.createComponent(ChoresComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mockChoresService.getNextChores).toHaveBeenCalledOnce();
  });

  it("should display chores after loading", async () => {
    const fixture = TestBed.createComponent(ChoresComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("Clean kitchen");
  });

  it("should set loading to false after init", async () => {
    const fixture = TestBed.createComponent(ChoresComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as {
      loading: ReturnType<typeof signal>;
    };
    expect(component.loading()).toBe(false);
  });

  it("should show error message when getNextChores fails", async () => {
    mockChoresService.getNextChores.mockRejectedValue(new Error("Network error"));

    const errorSpy = vi.spyOn(toast, "error");

    const fixture = TestBed.createComponent(ChoresComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(errorSpy).toHaveBeenCalledWith(
      "Failed to load chores.",
      expect.objectContaining({ description: "Network error" }),
    );
  });
});
