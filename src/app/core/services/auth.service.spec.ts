import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { SupabaseService } from "./supabase.service";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;
  let authChangeCallback: (event: AuthChangeEvent, session: Session | null) => void;
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let mockSupabaseService: {
    authChanges: ReturnType<typeof vi.fn>;
    getUser: ReturnType<typeof vi.fn>;
    getProfile: ReturnType<typeof vi.fn>;
    signIn: ReturnType<typeof vi.fn>;
    signOut: ReturnType<typeof vi.fn>;
  };

  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    app_metadata: {},
    user_metadata: { name: "Test User" },
    aud: "authenticated",
    created_at: "2025-01-01T00:00:00Z",
  } as unknown as User;

  beforeEach(() => {
    mockRouter = { navigate: vi.fn().mockResolvedValue(true) };
    mockSupabaseService = {
      authChanges: vi.fn().mockImplementation((cb) => {
        authChangeCallback = cb;
      }),
      getUser: vi.fn().mockResolvedValue(null),
      getProfile: vi.fn().mockResolvedValue({ data: null, error: null }),
      signIn: vi.fn().mockResolvedValue(undefined),
      signOut: vi.fn().mockResolvedValue(undefined),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter },
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should register auth change listener on construction", () => {
    expect(mockSupabaseService.authChanges).toHaveBeenCalledOnce();
  });

  it("should call getUser on construction", () => {
    expect(mockSupabaseService.getUser).toHaveBeenCalledOnce();
  });

  it("should not be authenticated initially when no user", async () => {
    await service.initialized;
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it("should be authenticated after getUser resolves with a user", async () => {
    mockSupabaseService.getUser.mockResolvedValue(mockUser);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter },
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    });

    const freshService = TestBed.inject(AuthService);
    await freshService.initialized;

    expect(freshService.isAuthenticated()).toBe(true);
    expect(freshService.currentUser()).toEqual(mockUser);
  });

  it("should update user on auth state change with session", async () => {
    await service.initialized;

    authChangeCallback("SIGNED_IN", { user: mockUser } as Session);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()).toEqual(mockUser);
  });

  it("should clear user on auth state change without session", async () => {
    await service.initialized;

    authChangeCallback("SIGNED_IN", { user: mockUser } as Session);
    expect(service.isAuthenticated()).toBe(true);

    authChangeCallback("SIGNED_OUT", null);
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it("should call supabaseService.signIn with provider", async () => {
    await service.signIn("google");
    expect(mockSupabaseService.signIn).toHaveBeenCalledWith("google");

    await service.signIn("github");
    expect(mockSupabaseService.signIn).toHaveBeenCalledWith("github");
  });

  it("should call supabaseService.signOut and navigate to /login", async () => {
    await service.signOut();

    expect(mockSupabaseService.signOut).toHaveBeenCalledOnce();
    expect(mockRouter.navigate).toHaveBeenCalledWith(["/login"]);
  });
});
