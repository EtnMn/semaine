import { TestBed } from "@angular/core/testing";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConfirmationService } from "primeng/api";

import { Task } from "./task.model";
import { TaskCardComponent } from "./task-card.component";
import { TasksService } from "./tasks.service";

const mockTask: Task = {
  id: "task-1",
  name: "Test Task",
  description: "A test task description",
  periodicity: "weekly",
  difficulty: "medium",
  started: true,
  duration: 30,
  tags: ["health", "fitness"],
};

describe("TaskCardComponent", () => {
  let mockTasksService: {
    getPeriodicityIcon: ReturnType<typeof vi.fn>;
    getDifficultyIcon: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockTasksService = {
      getPeriodicityIcon: vi.fn((periodicity: string) => {
        const icons: Record<string, string> = {
          unique: "pi-bolt",
          daily: "pi-sun",
          weekly: "pi-calendar",
          monthly: "pi-calendar-plus",
          yearly: "pi-globe",
        };
        return icons[periodicity.toLowerCase()] ?? "pi-calendar";
      }),
      getDifficultyIcon: vi.fn((difficulty: string) => {
        return {
          easy: "pi pi-face-smile",
          medium: "pi pi-star",
          hard: "pi pi-wrench",
        }[difficulty];
      }),
    };

    await TestBed.configureTestingModule({
      imports: [TaskCardComponent],
      providers: [
        provideAnimationsAsync(),
        ConfirmationService,
        { provide: TasksService, useValue: mockTasksService },
      ],
    }).compileComponents();
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(TaskCardComponent);
    fixture.componentRef.setInput("task", mockTask);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should display the task name", () => {
    const fixture = TestBed.createComponent(TaskCardComponent);
    fixture.componentRef.setInput("task", mockTask);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("Test Task");
  });

  it("should display task description", () => {
    const fixture = TestBed.createComponent(TaskCardComponent);
    fixture.componentRef.setInput("task", mockTask);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("A test task description");
  });

  it("should display task tags", () => {
    const fixture = TestBed.createComponent(TaskCardComponent);
    fixture.componentRef.setInput("task", mockTask);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("health");
    expect(el.textContent).toContain("fitness");
  });

  it("should call taskService.getDifficultyIcon on render", () => {
    const fixture = TestBed.createComponent(TaskCardComponent);
    fixture.componentRef.setInput("task", mockTask);
    fixture.detectChanges();

    expect(mockTasksService.getDifficultyIcon).toHaveBeenCalledWith("medium");
  });

  it("getDifficultyColorClass should return correct class for each difficulty", () => {
    const fixture = TestBed.createComponent(TaskCardComponent);
    fixture.componentRef.setInput("task", mockTask);
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      getDifficultyColorClass: (d: string) => string;
    };

    expect(component.getDifficultyColorClass("easy")).toBe("task-card--easy");
    expect(component.getDifficultyColorClass("medium")).toBe("task-card--medium");
    expect(component.getDifficultyColorClass("hard")).toBe("task-card--hard");
  });

  it("getDifficultyBadgeClass should return correct class for each difficulty", () => {
    const fixture = TestBed.createComponent(TaskCardComponent);
    fixture.componentRef.setInput("task", mockTask);
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      getDifficultyBadgeClass: (d: string) => string;
    };

    expect(component.getDifficultyBadgeClass("easy")).toContain("lime");
    expect(component.getDifficultyBadgeClass("medium")).toContain("amber");
    expect(component.getDifficultyBadgeClass("hard")).toContain("rose");
  });

  it("should call taskService.getPeriodicityIcon on render", () => {
    const fixture = TestBed.createComponent(TaskCardComponent);
    fixture.componentRef.setInput("task", mockTask);
    fixture.detectChanges();

    expect(mockTasksService.getPeriodicityIcon).toHaveBeenCalledWith("weekly");
  });

  it("should emit taskEdited with task id on edit", async () => {
    const fixture = TestBed.createComponent(TaskCardComponent);
    fixture.componentRef.setInput("task", mockTask);
    fixture.detectChanges();

    const taskEdited = vi.fn();
    fixture.componentInstance.taskEdited.subscribe(taskEdited);

    const component = fixture.componentInstance as unknown as {
      onEditTask: () => Promise<void>;
    };

    await component.onEditTask();

    expect(taskEdited).toHaveBeenCalledWith("task-1");
  });

  it("should emit taskDeleted with task id when delete is confirmed", () => {
    const fixture = TestBed.createComponent(TaskCardComponent);
    fixture.componentRef.setInput("task", mockTask);
    fixture.detectChanges();

    const taskDeleted = vi.fn();
    fixture.componentInstance.taskDeleted.subscribe(taskDeleted);

    // Access the component's own ConfirmationService instance
    const confirmationService = fixture.debugElement.injector.get(ConfirmationService);
    vi.spyOn(confirmationService, "confirm").mockImplementation((config) => {
      config.accept?.();
      return confirmationService;
    });

    const component = fixture.componentInstance as unknown as {
      onDeleteTask: () => void;
    };

    // Access private method via cast
    (component as unknown as { onDeleteTask: () => void }).onDeleteTask();

    expect(taskDeleted).toHaveBeenCalledWith("task-1");
  });
});
