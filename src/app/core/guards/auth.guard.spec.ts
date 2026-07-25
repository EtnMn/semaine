import { TestBed } from "@angular/core/testing";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { describe, it, expect, beforeEach } from "vitest";
import { signal, Injector, runInInjectionContext } from "@angular/core";
import { AuthService } from "@core/services";
import { authGuard } from "./auth.guard";

describe("authGuard", () => {
  let mockIsAuthenticated: ReturnType<typeof signal<boolean>>;
  let injector: Injector;
  const route = { queryParamMap: { get: () => null } } as unknown as ActivatedRouteSnapshot;
  const state = { url: "/tasks" } as RouterStateSnapshot;

  beforeEach(() => {
    mockIsAuthenticated = signal(false);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { createUrlTree: (commands: string[]) => commands } },
        {
          provide: AuthService,
          useValue: {
            initialized: Promise.resolve(),
            isAuthenticated: () => mockIsAuthenticated(),
          },
        },
      ],
    });

    injector = TestBed.inject(Injector);
  });

  it("should allow access when user is authenticated", async () => {
    mockIsAuthenticated.set(true);

    const result = await runInInjectionContext(injector, () => authGuard(route, state));

    expect(result).toBe(true);
  });

  it("should redirect to /login when user is not authenticated", async () => {
    mockIsAuthenticated.set(false);

    const result = await runInInjectionContext(injector, () => authGuard(route, state));

    expect(result).toEqual(["/login"]);
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
            isAuthenticated: () => mockIsAuthenticated(),
          },
        },
      ],
    });

    injector = TestBed.inject(Injector);
    mockIsAuthenticated.set(true);
    const guardPromise = runInInjectionContext(injector, () => authGuard(route, state));

    resolveInit();
    const result = await guardPromise;

    expect(result).toBe(true);
  });
});
