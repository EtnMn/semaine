import { Task } from "../tasks/task.model";

export interface Chore {
  id: string;
  date: string;
  task: Omit<Task, "started">;
}
