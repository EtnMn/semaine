export const TASK_DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type TaskDifficulty = (typeof TASK_DIFFICULTIES)[number];

export const TASK_PERIODICITIES = ["unique", "daily", "weekly", "monthly", "yearly"] as const;
export type TaskPeriodicity = (typeof TASK_PERIODICITIES)[number];

export interface Task {
  id: number;
  difficulty: TaskDifficulty;
  duration: number;
  name: string;
  periodicity: TaskPeriodicity;
  started: boolean;
  tags: string[];
}
