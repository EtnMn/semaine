import { TestBed } from "@angular/core/testing";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { signal } from "@angular/core";

import { Task } from "./task.model";
import { TaskFormDialogComponent } from "./task-form-dialog.component";

const mockTask: Task = {
  id: "task-1",
  name: "Existing Task",
  description: "An existing task",
  periodicity: "monthly",
  difficulty: "hard",
  started: false,
  duration: 60,
  tags: ["work"],
};

describe("TaskFormDialogComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormDialogComponent],
      providers: [provideAnimationsAsync()],
    }).compileComponents();
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(TaskFormDialogComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should be in create mode when no task is provided", () => {
    const fixture = TestBed.createComponent(TaskFormDialogComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      isEditMode: ReturnType<typeof signal<boolean>>;
      dialogTitle: ReturnType<typeof signal<string>>;
    };

    expect(component.isEditMode()).toBe(false);
    expect(component.dialogTitle()).toBe("Create task");
  });

  it("should be in edit mode when a task is provided", () => {
    const fixture = TestBed.createComponent(TaskFormDialogComponent);
    fixture.componentRef.setInput("task", mockTask);
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      isEditMode: ReturnType<typeof signal<boolean>>;
      dialogTitle: ReturnType<typeof signal<string>>;
    };

    expect(component.isEditMode()).toBe(true);
    expect(component.dialogTitle()).toBe("Edit task");
  });

  it("form should be invalid when name is empty", () => {
    const fixture = TestBed.createComponent(TaskFormDialogComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      form: { invalid: boolean; controls: { name: { value: string } } };
    };

    expect(component.form.invalid).toBe(true);
  });

  it("form should pre-populate with task data in edit mode", async () => {
    const fixture = TestBed.createComponent(TaskFormDialogComponent);
    fixture.componentRef.setInput("task", mockTask);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as {
      form: { value: { name: string; periodicity: string; difficulty: string } };
    };

    expect(component.form.value.name).toBe("Existing Task");
    expect(component.form.value.periodicity).toBe("monthly");
    expect(component.form.value.difficulty).toBe("hard");
  });

  it("onSubmit should emit taskSaved when form is valid", () => {
    const fixture = TestBed.createComponent(TaskFormDialogComponent);
    fixture.detectChanges();

    const taskSaved = vi.fn();
    fixture.componentInstance.taskSaved.subscribe(taskSaved);

    const component = fixture.componentInstance as unknown as {
      form: { patchValue: (v: Partial<Task>) => void };
      onSubmit: () => void;
    };

    component.form.patchValue({ name: "New Task" });
    component.onSubmit();

    expect(taskSaved).toHaveBeenCalledOnce();
    expect(taskSaved.mock.calls[0][0]).toMatchObject({ name: "New Task" });
  });

  it("onSubmit should not emit when form is invalid", () => {
    const fixture = TestBed.createComponent(TaskFormDialogComponent);
    fixture.detectChanges();

    const taskSaved = vi.fn();
    fixture.componentInstance.taskSaved.subscribe(taskSaved);

    const component = fixture.componentInstance as unknown as { onSubmit: () => void };
    component.onSubmit();

    expect(taskSaved).not.toHaveBeenCalled();
  });

  it("onHide should reset the form", () => {
    const fixture = TestBed.createComponent(TaskFormDialogComponent);
    fixture.componentRef.setInput("task", mockTask);
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      form: { value: { name: string } };
      onHide: () => void;
    };

    component.onHide();

    expect(component.form.value.name).toBe("");
  });
});
