import { TestBed } from "@angular/core/testing";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConfirmationService, MessageService } from "primeng/api";
import { signal } from "@angular/core";

import { Task } from "./task.model";
import { TasksComponent } from "./tasks.component";
import { TasksService } from "./tasks.service";

const mockTask: Task = {
  id: "task-1",
  name: "Test Task",
  description: "A test",
  periodicity: "weekly",
  difficulty: "easy",
  started: true,
  duration: 15,
  tags: [],
};

describe("TasksComponent", () => {
  let mockTasksService: {
    getTasksPage: ReturnType<typeof vi.fn>;
    getTask: ReturnType<typeof vi.fn>;
    createTask: ReturnType<typeof vi.fn>;
    updateTask: ReturnType<typeof vi.fn>;
    deleteTask: ReturnType<typeof vi.fn>;
    getDifficultyIcon: ReturnType<typeof vi.fn>;
    getPeriodicityIcon: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockTasksService = {
      getTasksPage: vi.fn().mockResolvedValue({ tasks: [mockTask], total: 1 }),
      getTask: vi.fn().mockResolvedValue(mockTask),
      createTask: vi.fn().mockResolvedValue(undefined),
      updateTask: vi.fn().mockResolvedValue(undefined),
      deleteTask: vi.fn().mockResolvedValue(undefined),
      getDifficultyIcon: vi.fn((difficulty: string) => {
        return {
          easy: "pi pi-face-smile",
          medium: "pi pi-star",
          hard: "pi pi-wrench",
        }[difficulty];
      }),
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
    };

    await TestBed.configureTestingModule({
      imports: [TasksComponent],
      providers: [
        provideAnimationsAsync(),
        ConfirmationService,
        MessageService,
        { provide: TasksService, useValue: mockTasksService },
      ],
    }).compileComponents();
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(TasksComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should load first page on init", async () => {
    const fixture = TestBed.createComponent(TasksComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mockTasksService.getTasksPage).toHaveBeenCalledWith(0, 9, "", true);
  });

  it("should display tasks after loading", async () => {
    const fixture = TestBed.createComponent(TasksComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("Test Task");
  });

  it("should set loading to false after loading", async () => {
    const fixture = TestBed.createComponent(TasksComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as {
      loading: ReturnType<typeof signal>;
    };
    expect(component.loading()).toBe(false);
  });

  it("onCreateTask should open dialog with no editing task", () => {
    const fixture = TestBed.createComponent(TasksComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      onCreateTask: () => void;
      editingTask: ReturnType<typeof signal>;
      taskFormDisplayed: ReturnType<typeof signal>;
    };

    component.onCreateTask();

    expect(component.editingTask()).toBeNull();
    expect(component.taskFormDisplayed()).toBe(true);
  });

  it("onEditTask should load task and open dialog", async () => {
    const fixture = TestBed.createComponent(TasksComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      onEditTask: (id: string) => Promise<void>;
      editingTask: ReturnType<typeof signal>;
      taskFormDisplayed: ReturnType<typeof signal>;
    };

    await component.onEditTask("task-1");

    expect(mockTasksService.getTask).toHaveBeenCalledWith("task-1");
    expect(component.editingTask()).toEqual(mockTask);
    expect(component.taskFormDisplayed()).toBe(true);
  });

  it("should show error toast when getTasksPage fails", async () => {
    mockTasksService.getTasksPage.mockRejectedValue(new Error("Load error"));

    const fixture = TestBed.createComponent(TasksComponent);
    // Get the component's own MessageService instance
    const messageService = fixture.debugElement.injector.get(MessageService);
    const addSpy = vi.spyOn(messageService, "add");

    fixture.detectChanges();
    await fixture.whenStable();

    expect(addSpy).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "error", detail: "Load error" }),
    );
  });
});
