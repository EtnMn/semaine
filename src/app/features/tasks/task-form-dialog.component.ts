import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { AutoCompleteModule } from "primeng/autocomplete";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { MessageModule } from "primeng/message";
import { SelectModule } from "primeng/select";
import { TextareaModule } from "primeng/textarea";
import { ToggleSwitchModule } from "primeng/toggleswitch";

import {
  Task,
  TaskDifficulty,
  TaskPeriodicity,
  TASK_DIFFICULTIES,
  TASK_PERIODICITIES,
} from "./task.model";

@Component({
  selector: "app-task-form-dialog",
  templateUrl: "./task-form-dialog.component.html",
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    AutoCompleteModule,
    ToggleSwitchModule,
    InputNumberModule,
    MessageModule,
  ],
})
export class TaskFormDialogComponent {
  private readonly fb = inject(FormBuilder);

  public readonly task = input<Task | null>(null);
  public readonly taskSaved = output<Omit<Task, "id">>();
  public readonly displayed = model<boolean>(false);

  protected readonly loading = signal(false);
  protected readonly isEditMode = computed(() => !!this.task());
  protected readonly dialogTitle = computed(() =>
    this.isEditMode() ? "Edit task" : "Create task",
  );

  protected readonly periodicityOptions = TASK_PERIODICITIES.map((p) => ({
    label: p.charAt(0).toUpperCase() + p.slice(1),
    value: p,
  }));

  protected readonly difficultyOptions = TASK_DIFFICULTIES.map((d) => ({
    label: d.charAt(0).toUpperCase() + d.slice(1),
    value: d,
  }));

  protected readonly form = this.fb.group({
    name: ["", Validators.required],
    description: [""],
    periodicity: ["unique" as TaskPeriodicity, Validators.required],
    difficulty: ["medium" as TaskDifficulty, Validators.required],
    duration: [1, Validators.compose([Validators.min(0), Validators.required])],
    started: [true],
    tags: [[] as string[]],
  });

  constructor() {
    effect(() => {
      const task = this.task();
      untracked(() => {
        this.form.reset({
          name: "",
          description: "",
          periodicity: "unique",
          difficulty: "medium",
          duration: 1,
          started: true,
          tags: [],
        });
        if (task) {
          this.form.patchValue(task);
        }
      });
    });
  }

  protected onHide(): void {
    this.form.reset({
      name: "",
      description: "",
      periodicity: "unique",
      difficulty: "medium",
      duration: 1,
      started: true,
      tags: [],
    });

    this.loading.set(false);
  }

  protected onSubmit(): void {
    this.loading.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.loading.set(false);
      return;
    }
    this.taskSaved.emit(this.form.getRawValue() as Omit<Task, "id">);
  }
}
