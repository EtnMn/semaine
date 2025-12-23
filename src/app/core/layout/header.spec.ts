import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { signal, computed } from "@angular/core";
import { DarkModeService } from "@core/services";
import { Header } from "./header";

describe("Header", () => {
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
      imports: [Header],
      providers: [{ provide: DarkModeService, useValue: mockDarkModeService }],
    }).compileComponents();
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(Header);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it("should display the title", () => {
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector("h1")?.textContent).toBe("etn-semaine");
  });
});
