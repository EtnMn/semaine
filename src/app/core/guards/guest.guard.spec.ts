import { TestBed } from "@angular/core/testing";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { describe, it, expect, beforeEach } from "vitest";
import { signal } from "@angular/core";
import { AuthService } from "@core/services";
import { guestGuard } from "./guest.guard";

describe("guestGuard", () => {
  let mockIsAuthenticated: ReturnType<typeof signal<boolean>>;
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  beforeEach(() => {
    mockIsAuthenticated = signal(false);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { createUrlTree: (commands: string[]) => commands } },
        {
          provide: AuthService,
          useValue: {
            initialized: Promise.resolve(),
            isAuthenticated: mockIsAuthenticated.asReadonly(),
          },
        },
      ],
    });
  });

  it("should allow access when user is not authenticated", async () => {
    mockIsAuthenticated.set(false);

    const result = await TestBed.runInInjectionContext(() => guestGuard(route, state));

    expect(result).toBe(true);
  });

  it("should redirect to / when user is authenticated", async () => {
    mockIsAuthenticated.set(true);

    const result = await TestBed.runInInjectionContext(() => guestGuard(route, state));

    expect(result).toEqual(["/"]);
  });

  it("should wait for auth initialization before checking", async () => {
    let resolveInit!: () => void;
    const initPromise = new Promise<void>((resolve) => (resolveInit = resolve));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { createUrlTree: (commands: string[]) => commands } },
        {
          provide: AuthService,
          useValue: {
            initialized: initPromise,
            isAuthenticated: mockIsAuthenticated.asReadonly(),
          },
        },
      ],
    });

    mockIsAuthenticated.set(false);
    const guardPromise = TestBed.runInInjectionContext(() => guestGuard(route, state));

    resolveInit();
    const result = await guardPromise;

    expect(result).toBe(true);
  });
});
