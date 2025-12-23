import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { signal, computed } from "@angular/core";

import { DarkModeService } from "@core/services";

import { App } from "./app";

describe("App", () => {
  const mockDarkModeService = {
    isDark: signal(false).asReadonly(),
    icon: computed(() => "pi pi-moon"),
    toggle: vi.fn(),
  };

  beforeEach(async () => {
    // Mock window.matchMedia for PrimeNG components
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
      providers: [provideRouter([]), { provide: DarkModeService, useValue: mockDarkModeService }],
    }).compileComponents();
  });

  it("should create the app", () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it("should render main layout with header", () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector("main")).toBeTruthy();
    expect(compiled.querySelector("app-header")).toBeTruthy();
    expect(compiled.querySelector("router-outlet")).toBeTruthy();
  });
});
