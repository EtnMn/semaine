import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { SupabaseService } from "@core/services/supabase.service";
import { UsersService } from "./users.service";
import { User } from "./user.model";

const mockUsers: User[] = [
  { id: "1", email: "alice@example.com", name: "Alice", avatar_url: null, role: "admin" },
  { id: "2", email: "bob@example.com", name: "Bob", avatar_url: null, role: "user" },
];

interface MockSupabaseService {
  client: {
    rpc: ReturnType<typeof vi.fn>;
    from: ReturnType<typeof vi.fn>;
    functions: { invoke: ReturnType<typeof vi.fn> };
  };
  rpc: ReturnType<typeof vi.fn>;
  from: ReturnType<typeof vi.fn>;
  invoke: ReturnType<typeof vi.fn>;
}

function createMockSupabaseService(): MockSupabaseService {
  const rpc = vi.fn();
  const from = vi.fn();
  const invoke = vi.fn();

  return {
    client: {
      rpc,
      from,
      functions: { invoke },
    },
    rpc,
    from,
    invoke,
  };
}

describe("UsersService", () => {
  let service: UsersService;
  let mock: ReturnType<typeof createMockSupabaseService>;

  beforeEach(() => {
    mock = createMockSupabaseService();

    TestBed.configureTestingModule({
      providers: [UsersService, { provide: SupabaseService, useValue: mock }],
    });

    service = TestBed.inject(UsersService);
  });

  describe("getUsersPage", () => {
    it("should return users and total count", async () => {
      mock.rpc.mockResolvedValue({ data: mockUsers, error: null });
      mock.from.mockReturnValue({
        select: vi.fn().mockResolvedValue({ count: 2, error: null }),
      });

      const result = await service.getUsersPage(0, 20);

      expect(result.users).toEqual(mockUsers);
      expect(result.total).toBe(2);
    });

    it("should throw on rpc error", async () => {
      mock.rpc.mockResolvedValue({ data: null, error: { message: "rpc error" } });
      mock.from.mockReturnValue({
        select: vi.fn().mockResolvedValue({ count: 0, error: null }),
      });

      await expect(service.getUsersPage(0, 20)).rejects.toThrow("rpc error");
    });

    it("should throw on count error", async () => {
      mock.rpc.mockResolvedValue({ data: mockUsers, error: null });
      mock.from.mockReturnValue({
        select: vi.fn().mockResolvedValue({ count: null, error: { message: "count error" } }),
      });

      await expect(service.getUsersPage(0, 20)).rejects.toThrow("count error");
    });

    it("should pass correct pagination params", async () => {
      mock.rpc.mockResolvedValue({ data: [], error: null });
      mock.from.mockReturnValue({
        select: vi.fn().mockResolvedValue({ count: 0, error: null }),
      });

      await service.getUsersPage(2, 10);

      expect(mock.rpc).toHaveBeenCalledWith("get_users_page", { p_limit: 10, p_offset: 20 });
    });
  });

  describe("deleteUser", () => {
    it("should call delete_user rpc with correct id", async () => {
      mock.rpc.mockResolvedValue({ error: null });

      await service.deleteUser("1");

      expect(mock.rpc).toHaveBeenCalledWith("delete_user", { p_user_id: "1" });
    });

    it("should throw on rpc error", async () => {
      mock.rpc.mockResolvedValue({ error: { message: "delete failed" } });

      await expect(service.deleteUser("1")).rejects.toThrow("delete failed");
    });
  });

  describe("updateUserRole", () => {
    it("should update role via profiles table", async () => {
      const eq = vi.fn().mockResolvedValue({ error: null });
      const update = vi.fn().mockReturnValue({ eq });
      mock.from.mockReturnValue({ update });

      await service.updateUserRole("1", "admin");

      expect(mock.from).toHaveBeenCalledWith("profiles");
      expect(update).toHaveBeenCalledWith({ role: "admin" });
      expect(eq).toHaveBeenCalledWith("id", "1");
    });

    it("should throw on error", async () => {
      const eq = vi.fn().mockResolvedValue({ error: { message: "update failed" } });
      const update = vi.fn().mockReturnValue({ eq });
      mock.from.mockReturnValue({ update });

      await expect(service.updateUserRole("1", "admin")).rejects.toThrow("update failed");
    });
  });

  describe("inviteUser", () => {
    it("should invoke invite-user function with email", async () => {
      mock.invoke.mockResolvedValue({ error: null });

      await service.inviteUser("test@example.com");

      expect(mock.invoke).toHaveBeenCalledWith("invite-user", {
        body: { email: "test@example.com" },
      });
    });

    it("should throw on function error", async () => {
      mock.invoke.mockResolvedValue({ error: { message: "invite failed" } });

      await expect(service.inviteUser("test@example.com")).rejects.toThrow("invite failed");
    });

    it("should extract error message from context response", async () => {
      const contextError = Object.assign(new Error("raw error"), {
        context: {
          json: vi.fn().mockResolvedValue({ error: "Email already registered" }),
        },
      });
      mock.invoke.mockResolvedValue({ error: contextError });

      await expect(service.inviteUser("test@example.com")).rejects.toThrow(
        "Email already registered",
      );
    });
  });
});
