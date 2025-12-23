import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { DarkModeService } from "./dark-mode.service";

describe("DarkModeService", () => {
  let service: DarkModeService;

  beforeEach(() => {
    // Mock window.matchMedia
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

    TestBed.configureTestingModule({});
    service = TestBed.inject(DarkModeService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should initialize with light mode by default", () => {
    expect(service.isDark()).toBe(false);
    expect(service.icon()).toBe("pi pi-moon");
  });

  it("should toggle dark mode", () => {
    const initialState = service.isDark();

    service.toggle();

    expect(service.isDark()).toBe(!initialState);

    // Check HTML element class if it exists
    const htmlElement = document.querySelector("html");
    if (htmlElement) {
      expect(htmlElement.classList.contains("app-dark")).toBe(!initialState);
    }
  });

  it("should update icon when toggling", () => {
    expect(service.icon()).toBe("pi pi-moon");

    service.toggle();

    expect(service.icon()).toBe("pi pi-sun");

    service.toggle();

    expect(service.icon()).toBe("pi pi-moon");
  });
});
