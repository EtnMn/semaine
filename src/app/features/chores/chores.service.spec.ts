import { TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SupabaseService } from "@core/services/supabase.service";

import { Chore } from "./chore.model";
import { ChoresService } from "./chores.service";

const mockChore: Chore = {
  id: "chore-1",
  date: "2026-07-25",
  task: {
    id: "task-1",
    name: "Clean kitchen",
    description: "Wipe all surfaces",
    periodicity: "weekly",
    difficulty: "easy",
    duration: 20,
    tags: ["home"],
  },
};

describe("ChoresService", () => {
  let service: ChoresService;
  let mockClient: {
    from: ReturnType<typeof vi.fn>;
    functions: { invoke: ReturnType<typeof vi.fn> };
  };
  let queryBuilder: {
    select: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    range: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    queryBuilder = {
      select: vi.fn(),
      order: vi.fn(),
      range: vi.fn(),
    };

    queryBuilder.select.mockReturnValue(queryBuilder);
    queryBuilder.order.mockReturnValue(queryBuilder);

    mockClient = {
      from: vi.fn().mockReturnValue(queryBuilder),
      functions: { invoke: vi.fn() },
    };

    TestBed.configureTestingModule({
      providers: [ChoresService, { provide: SupabaseService, useValue: { client: mockClient } }],
    });

    service = TestBed.inject(ChoresService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("getNextChores", () => {
    it("should return chores when successful", async () => {
      queryBuilder.range.mockResolvedValue({ data: [mockChore], error: null });

      const result = await service.getNextChores();

      expect(mockClient.from).toHaveBeenCalledWith("chores");
      expect(queryBuilder.select).toHaveBeenCalledWith(
        "id, date, task:tasks(name, description, periodicity, difficulty, duration, tags)",
      );
      expect(result).toEqual([mockChore]);
    });

    it("should return empty array when data is null", async () => {
      queryBuilder.range.mockResolvedValue({ data: null, error: null });

      const result = await service.getNextChores();

      expect(result).toEqual([]);
    });

    it("should throw when supabase returns an error", async () => {
      queryBuilder.range.mockResolvedValue({ data: null, error: { message: "DB error" } });

      await expect(service.getNextChores()).rejects.toThrow("DB error");
    });
  });

  describe("closeChore", () => {
    it("should invoke close-chore function with chore id", async () => {
      mockClient.functions.invoke.mockResolvedValue({ error: null });

      await service.closeChore("chore-1");

      expect(mockClient.functions.invoke).toHaveBeenCalledWith("close-chore", {
        body: { chore_id: "chore-1" },
      });
    });

    it("should throw when the edge function returns an error", async () => {
      mockClient.functions.invoke.mockResolvedValue({ error: { message: "Close error" } });

      await expect(service.closeChore("chore-1")).rejects.toThrow("Close error");
    });
  });
});
