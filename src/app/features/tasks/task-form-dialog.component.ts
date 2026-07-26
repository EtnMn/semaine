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
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideLoaderCircle, lucideX } from "@ng-icons/lucide";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmDialogImports } from "@spartan-ng/helm/dialog";
import { HlmFieldImports } from "@spartan-ng/helm/field";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmInputGroupImports } from "@spartan-ng/helm/input-group";
import { HlmSelectImports } from "@spartan-ng/helm/select";
import { HlmSwitch } from "@spartan-ng/helm/switch";
import { HlmTextarea } from "@spartan-ng/helm/textarea";

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
    NgIcon,
    HlmButton,
    ...HlmDialogImports,
    ...HlmFieldImports,
    HlmInput,
    HlmTextarea,
    HlmSwitch,
    ...HlmSelectImports,
    ...HlmInputGroupImports,
  ],
  providers: [provideIcons({ lucideLoaderCircle, lucideX })],
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

  protected onDialogStateChanged(state: "open" | "closed"): void {
    this.displayed.set(state === "open");
    if (state === "closed") {
      this.onHide();
    }
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

  protected onAddTag(input: HTMLInputElement): void {
    const value = input.value.trim();
    input.value = "";
    if (!value) {
      return;
    }

    const tagsControl = this.form.controls.tags;
    const tags = tagsControl.value ?? [];
    if (tags.includes(value)) {
      return;
    }

    tagsControl.setValue([...tags, value]);
  }

  protected removeTag(tag: string): void {
    const tagsControl = this.form.controls.tags;
    tagsControl.setValue((tagsControl.value ?? []).filter((t) => t !== tag));
  }
}
