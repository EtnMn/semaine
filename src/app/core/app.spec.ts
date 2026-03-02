import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { signal, computed } from "@angular/core";

import { AuthService, DarkModeService } from "@core/services";

import { App } from "./app";

describe("App", () => {
  beforeEach(async () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        {
          provide: DarkModeService,
          useValue: {
            isDark: signal(false).asReadonly(),
            icon: computed(() => "pi pi-moon"),
            toggle: vi.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            currentUser: signal(null).asReadonly(),
            isAuthenticated: computed(() => false),
            signOut: vi.fn(),
            initialized: Promise.resolve(),
          },
        },
      ],
    }).compileComponents();
  });

  it("should create the app", () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should render header, main with router-outlet, and footer", () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector("app-header")).toBeTruthy();
    expect(el.querySelector("main")).toBeTruthy();
    expect(el.querySelector("router-outlet")).toBeTruthy();
    expect(el.querySelector("app-footer")).toBeTruthy();
  });
});
