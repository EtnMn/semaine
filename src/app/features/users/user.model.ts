export interface User {
  id: string;
  avatar_url: string | null;
  email: string;
  name: string | null;
  role: "user" | "admin";
}
