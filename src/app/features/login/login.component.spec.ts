import { TestBed } from "@angular/core/testing";
import { provideRouter, ActivatedRoute } from "@angular/router";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { signal } from "@angular/core";

import { AuthService } from "@core/services";

import { LoginComponent } from "./login.component";

describe("LoginComponent", () => {
  let mockAuthService: {
    signIn: ReturnType<typeof vi.fn>;
    currentUser: ReturnType<typeof signal>;
    isAuthenticated: ReturnType<typeof signal>;
    initialized: Promise<void>;
  };
  let mockActivatedRoute: { snapshot: { queryParamMap: { get: ReturnType<typeof vi.fn> } } };

  beforeEach(async () => {
    mockAuthService = {
      signIn: vi.fn().mockResolvedValue(undefined),
      currentUser: signal(null),
      isAuthenticated: signal(false),
      initialized: Promise.resolve(),
    };

    mockActivatedRoute = {
      snapshot: { queryParamMap: { get: vi.fn().mockReturnValue(null) } },
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should display Sign in heading", () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("Sign in");
  });

  it("should display Google and GitHub login buttons", () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("Google");
    expect(el.textContent).toContain("GitHub");
  });

  it("should call signIn with google when Google button emits clicked", async () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      onSignIn: (provider: "google" | "github") => Promise<void>;
    };

    await component.onSignIn("google");

    expect(mockAuthService.signIn).toHaveBeenCalledWith("google");
  });

  it("should call signIn with github when GitHub button emits clicked", async () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      onSignIn: (provider: "google" | "github") => Promise<void>;
    };

    await component.onSignIn("github");

    expect(mockAuthService.signIn).toHaveBeenCalledWith("github");
  });

  it("should set error message when signIn throws", async () => {
    mockAuthService.signIn.mockRejectedValue(new Error("Auth failed"));

    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      onSignIn: (provider: "google" | "github") => Promise<void>;
      errorMessage: ReturnType<typeof signal<string>>;
    };

    await component.onSignIn("google");

    expect(component.errorMessage()).toBe("Auth failed");
  });

  it("should set loading to false after signIn completes", async () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      onSignIn: (provider: "google" | "github") => Promise<void>;
      loading: ReturnType<typeof signal<boolean>>;
    };

    await component.onSignIn("google");

    expect(component.loading()).toBe(false);
  });

  it("should store returnUrl in sessionStorage when present", async () => {
    mockActivatedRoute.snapshot.queryParamMap.get.mockReturnValue("/tasks");

    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      onSignIn: (provider: "google" | "github") => Promise<void>;
    };

    await component.onSignIn("google");

    expect(sessionStorage.getItem("returnUrl")).toBe("/tasks");
  });
});
