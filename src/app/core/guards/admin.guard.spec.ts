import { TestBed } from "@angular/core/testing";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { describe, it, expect, beforeEach } from "vitest";
import { signal } from "@angular/core";
import { AuthService } from "@core/services";
import { adminGuard } from "./admin.guard";

describe("adminGuard", () => {
  let mockIsAdministrator: ReturnType<typeof signal<boolean>>;
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  beforeEach(() => {
    mockIsAdministrator = signal(false);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { createUrlTree: (commands: string[]) => commands } },
        {
          provide: AuthService,
          useValue: {
            initialized: Promise.resolve(),
            isAdministrator: mockIsAdministrator.asReadonly(),
          },
        },
      ],
    });
  });

  it("should allow access when user is administrator", async () => {
    mockIsAdministrator.set(true);

    const result = await TestBed.runInInjectionContext(() => adminGuard(route, state));

    expect(result).toBe(true);
  });

  it("should redirect to / when user is not administrator", async () => {
    mockIsAdministrator.set(false);

    const result = await TestBed.runInInjectionContext(() => adminGuard(route, state));

    expect(result).toEqual(["/unauthorized"]);
  });
});
