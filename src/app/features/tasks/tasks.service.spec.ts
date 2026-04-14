import { TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SupabaseService } from "@core/services/supabase.service";

import { Task } from "./task.model";
import { TasksService } from "./tasks.service";

interface MockQueryBuilder {
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  range: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
}

describe("TasksService", () => {
  let service: TasksService;
  let queryBuilder: MockQueryBuilder;
  let mockClient: { from: ReturnType<typeof vi.fn> };

  const mockTask: Task = {
    id: 1,
    name: "Test task",
    description: "",
    periodicity: "weekly",
    difficulty: "medium",
    started: true,
    duration: 30,
    tags: ["health"],
  };

  beforeEach(() => {
    queryBuilder = {
      select: vi.fn(),
      eq: vi.fn(),
      single: vi.fn(),
      range: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    queryBuilder.select.mockReturnValue(queryBuilder);
    queryBuilder.eq.mockReturnValue(queryBuilder);
    queryBuilder.update.mockReturnValue(queryBuilder);
    queryBuilder.delete.mockReturnValue(queryBuilder);

    mockClient = { from: vi.fn().mockReturnValue(queryBuilder) };

    TestBed.configureTestingModule({
      providers: [TasksService, { provide: SupabaseService, useValue: { client: mockClient } }],
    });

    service = TestBed.inject(TasksService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("getTask", () => {
    it("should return the task when found", async () => {
      queryBuilder.single.mockResolvedValue({ data: mockTask, error: null });

      const result = await service.getTask("1");

      expect(mockClient.from).toHaveBeenCalledWith("tasks");
      expect(queryBuilder.select).toHaveBeenCalledWith(
        "id, name, periodicity, difficulty, started, duration, tags",
      );
      expect(queryBuilder.eq).toHaveBeenCalledWith("id", "1");
      expect(result).toEqual(mockTask);
    });

    it("should throw when supabase returns an error", async () => {
      queryBuilder.single.mockResolvedValue({ data: null, error: { message: "DB error" } });

      await expect(service.getTask("1")).rejects.toThrow("DB error");
    });

    it("should throw when task is not found", async () => {
      queryBuilder.single.mockResolvedValue({ data: null, error: null });

      await expect(service.getTask("1")).rejects.toThrow("Task not found");
    });
  });

  describe("getTasksPage", () => {
    it("should return paginated tasks with total count", async () => {
      queryBuilder.range.mockResolvedValue({ data: [mockTask], error: null, count: 42 });

      const result = await service.getTasksPage(0, 20);

      expect(mockClient.from).toHaveBeenCalledWith("tasks");
      expect(queryBuilder.select).toHaveBeenCalledWith(
        "id, name, periodicity, difficulty, started, duration, tags",
        { count: "exact" },
      );
      expect(queryBuilder.range).toHaveBeenCalledWith(0, 19);
      expect(result).toEqual({ tasks: [mockTask], total: 42 });
    });

    it("should use page offset correctly for page > 0", async () => {
      queryBuilder.range.mockResolvedValue({ data: [], error: null, count: 100 });

      await service.getTasksPage(1, 20);

      expect(queryBuilder.range).toHaveBeenCalledWith(20, 39);
    });

    it("should default total to 0 when count is null", async () => {
      queryBuilder.range.mockResolvedValue({ data: [], error: null, count: null });

      const result = await service.getTasksPage(0);

      expect(result.total).toBe(0);
    });

    it("should throw when supabase returns an error", async () => {
      queryBuilder.range.mockResolvedValue({
        data: null,
        error: { message: "DB error" },
        count: null,
      });

      await expect(service.getTasksPage(0)).rejects.toThrow("DB error");
    });
  });

  describe("createTask", () => {
    it("should call insert with the task data", async () => {
      const { id: _id, ...taskWithoutId } = mockTask;
      void _id;
      queryBuilder.insert.mockResolvedValue({ error: null });

      await service.createTask(taskWithoutId);

      expect(mockClient.from).toHaveBeenCalledWith("tasks");
      expect(queryBuilder.insert).toHaveBeenCalledWith(taskWithoutId);
    });

    it("should throw when supabase returns an error", async () => {
      const { id: _id, ...taskWithoutId } = mockTask;
      void _id;
      queryBuilder.insert.mockResolvedValue({ error: { message: "Insert error" } });

      await expect(service.createTask(taskWithoutId)).rejects.toThrow("Insert error");
    });
  });

  describe("updateTask", () => {
    it("should call update with partial task data and the task id", async () => {
      queryBuilder.eq.mockResolvedValue({ error: null });

      await service.updateTask("1", { name: "Updated" });

      expect(mockClient.from).toHaveBeenCalledWith("tasks");
      expect(queryBuilder.update).toHaveBeenCalledWith({ name: "Updated" });
      expect(queryBuilder.eq).toHaveBeenCalledWith("id", "1");
    });

    it("should throw when supabase returns an error", async () => {
      queryBuilder.eq.mockResolvedValue({ error: { message: "Update error" } });

      await expect(service.updateTask("1", { name: "Updated" })).rejects.toThrow("Update error");
    });
  });

  describe("deleteTask", () => {
    it("should call delete with the task id", async () => {
      queryBuilder.eq.mockResolvedValue({ error: null });

      await service.deleteTask("1");

      expect(mockClient.from).toHaveBeenCalledWith("tasks");
      expect(queryBuilder.delete).toHaveBeenCalled();
      expect(queryBuilder.eq).toHaveBeenCalledWith("id", "1");
    });

    it("should throw when supabase returns an error", async () => {
      queryBuilder.eq.mockResolvedValue({ error: { message: "Delete error" } });

      await expect(service.deleteTask("1")).rejects.toThrow("Delete error");
    });
  });
});
