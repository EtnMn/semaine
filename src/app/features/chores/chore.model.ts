import { Task } from "../tasks/task.model";

export interface Chore {
  id: string;
  date: string;
  created_at: string;
  task: Omit<Task, "started">;
}
