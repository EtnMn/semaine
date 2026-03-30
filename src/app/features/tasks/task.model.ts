export interface Task {
  id: number;
  difficulty: "easy" | "medium" | "hard";
  duration: number;
  name: string;
  periodicity: "unique" | "daily" | "weekly" | "monthly" | "yearly";
  started: boolean;
  tags: string[];
}
