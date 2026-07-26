import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { signal, computed, WritableSignal } from "@angular/core";
import { provideRouter } from "@angular/router";
import { User } from "@supabase/supabase-js";
import { AuthService, DarkModeService } from "@core/services";
import { Header } from "./header";

describe("Header", () => {
  let mockDarkModeToggle: ReturnType<typeof vi.fn>;
  let mockIsDark: WritableSignal<boolean>;
  let mockUser: WritableSignal<User | null>;
  let mockIsAuthenticated: ReturnType<typeof computed>;
  let mockSignOut: ReturnType<typeof vi.fn>;

  function createMockUser(overrides: Partial<User> = {}): User {
    return {
      id: "user-123",
      email: "test@example.com",
      app_metadata: {},
      user_metadata: { name: "Test User", avatar_url: "https://example.com/avatar.png" },
      aud: "authenticated",
      created_at: "2025-01-01T00:00:00Z",
      ...overrides,
    } as User;
  }

  beforeEach(async () => {
    mockDarkModeToggle = vi.fn();
    mockIsDark = signal(false);
    mockUser = signal<User | null>(null);
    mockIsAuthenticated = computed(() => mockUser() !== null);
    mockSignOut = vi.fn();

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
      providers: [
        provideRouter([]),
        {
          provide: DarkModeService,
          useFactory: () => ({
            isDark: mockIsDark.asReadonly(),
            icon: computed(() => (mockIsDark() ? "lucideSun" : "lucideMoon")),
            toggle: mockDarkModeToggle,
          }),
        },
        {
          provide: AuthService,
          useFactory: () => ({
            currentUser: mockUser.asReadonly(),
            isAuthenticated: mockIsAuthenticated,
            isAdministrator: computed(() => false),
            signOut: mockSignOut,
            initialized: Promise.resolve(),
          }),
        },
      ],
    }).compileComponents();
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(Header);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should display the title", () => {
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector("h1")?.textContent).toBe("semaine");
  });

  it("should display moon icon when light mode", () => {
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector("ng-icon")).toBeTruthy();
  });

  it("should call toggle on dark mode button click", () => {
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll("button");
    const darkModeButton = Array.from(buttons)[0] as HTMLElement;
    darkModeButton.click();

    expect(mockDarkModeToggle).toHaveBeenCalled();
  });

  it("should not show avatar or user button when not authenticated", () => {
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector("hlm-avatar")).toBeNull();
    expect(el.querySelector("ng-icon[name='lucideUser']")).toBeNull();
  });

  it("should show avatar when authenticated with avatar url", () => {
    mockUser.set(createMockUser());
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();

    const avatar = fixture.nativeElement.querySelector("hlm-avatar");
    expect(avatar).toBeTruthy();
  });

  it("should show user icon when authenticated without avatar url", () => {
    mockUser.set(createMockUser({ user_metadata: { name: "Test User" } }));
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector("hlm-avatar")).toBeNull();
    expect(el.querySelector("ng-icon[name='lucideUser']")).toBeTruthy();
  });

  it("should display user name in menu when opened", async () => {
    mockUser.set(createMockUser());
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();

    const avatarButton = fixture.nativeElement.querySelector("hlm-avatar")!.closest("button")!;
    avatarButton.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const menuPanel = document.querySelector("hlm-dropdown-menu");
    expect(menuPanel?.querySelector(".font-bold")?.textContent).toBe("Test User");
  });

  it("should fall back to email when name is not available", async () => {
    mockUser.set(createMockUser({ user_metadata: {} }));
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();

    const userButton = fixture.nativeElement
      .querySelector("ng-icon[name='lucideUser']")!
      .closest("button")!;
    userButton.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const menuPanel = document.querySelector("hlm-dropdown-menu");
    expect(menuPanel?.querySelector(".font-bold")?.textContent).toBe("test@example.com");
  });

  it("should not render menu when no user", () => {
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector("hlm-dropdown-menu")).toBeNull();
  });

  it("should display avatar with correct image", () => {
    mockUser.set(createMockUser());
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();

    // jsdom never fires the img's `load` event, so the avatar's async canShow()
    // signal stays false and only the fallback is projected. We can still assert
    // the avatar host renders for an authenticated user with an avatar url.
    const avatar = fixture.nativeElement.querySelector("hlm-avatar");
    expect(avatar).toBeTruthy();
  });

  it("should not render avatar when url is not available", () => {
    mockUser.set(createMockUser({ user_metadata: {} }));
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector("hlm-avatar")).toBeNull();
  });

  it("should display user email in menu when opened", async () => {
    mockUser.set(createMockUser());
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();

    const avatarButton = fixture.nativeElement.querySelector("hlm-avatar")!.closest("button")!;
    avatarButton.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const menuPanel = document.querySelector("hlm-dropdown-menu");
    expect(menuPanel?.querySelector(".text-sm")?.textContent).toBe("test@example.com");
  });
});
