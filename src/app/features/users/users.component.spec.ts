import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { signal, WritableSignal } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { AuthService } from "@core/services";
import { UsersService } from "./users.service";
import { UsersComponent } from "./users.component";
import { User } from "./user.model";

const mockUsers: User[] = [
  { id: "1", email: "alice@example.com", name: "Alice", avatar_url: null, role: "admin" },
  { id: "2", email: "bob@example.com", name: "Bob", avatar_url: null, role: "user" },
];

describe("UsersComponent", () => {
  let mockUsersService: {
    getUsersPage: ReturnType<typeof vi.fn>;
    deleteUser: ReturnType<typeof vi.fn>;
    updateUserRole: ReturnType<typeof vi.fn>;
    inviteUser: ReturnType<typeof vi.fn>;
  };
  let mockCurrentUser: WritableSignal<{ id: string } | null>;

  beforeEach(async () => {
    mockCurrentUser = signal<{ id: string } | null>(null);

    mockUsersService = {
      getUsersPage: vi.fn().mockResolvedValue({ users: mockUsers, total: 2 }),
      deleteUser: vi.fn().mockResolvedValue(undefined),
      updateUserRole: vi.fn().mockResolvedValue(undefined),
      inviteUser: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [UsersComponent],
      providers: [
        provideAnimationsAsync(),
        ConfirmationService,
        MessageService,
        { provide: UsersService, useValue: mockUsersService },
        {
          provide: AuthService,
          useFactory: () => ({
            currentUser: mockCurrentUser.asReadonly(),
            isAuthenticated: signal(true),
            isAdministrator: signal(true),
            initialized: Promise.resolve(),
          }),
        },
      ],
    }).compileComponents();
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(UsersComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should load first page on init", async () => {
    const fixture = TestBed.createComponent(UsersComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mockUsersService.getUsersPage).toHaveBeenCalledWith(0, 20);
  });

  it("should display users after loading", async () => {
    const fixture = TestBed.createComponent(UsersComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("Alice");
    expect(el.textContent).toContain("Bob");
  });

  it("should show invite dialog when clicking Invite user", async () => {
    const fixture = TestBed.createComponent(UsersComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      inviteDialogVisible: WritableSignal<boolean>;
      onInviteUser: () => void;
    };

    component.onInviteUser();
    fixture.detectChanges();

    expect(component.inviteDialogVisible()).toBe(true);
  });

  it("should call inviteUser and close dialog on valid invite", async () => {
    const fixture = TestBed.createComponent(UsersComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as {
      inviteDialogVisible: WritableSignal<boolean>;
      inviteLoading: WritableSignal<boolean>;
      onConfirmInvite: (form: {
        valid: boolean;
        value: { email: string };
        resetForm: () => void;
      }) => Promise<void>;
    };

    const mockForm = {
      valid: true,
      value: { email: "new@example.com" },
      resetForm: vi.fn(),
    };

    await component.onConfirmInvite(mockForm as never);

    expect(mockUsersService.inviteUser).toHaveBeenCalledWith("new@example.com");
    expect(component.inviteDialogVisible()).toBe(false);
  });

  it("should not call inviteUser when form is invalid", async () => {
    const fixture = TestBed.createComponent(UsersComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as {
      onConfirmInvite: (form: { valid: boolean }) => Promise<void>;
    };

    await component.onConfirmInvite({ valid: false });

    expect(mockUsersService.inviteUser).not.toHaveBeenCalled();
  });

  it("should call updateUserRole when toggling role", async () => {
    const fixture = TestBed.createComponent(UsersComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as {
      menuItems: () => { label?: string; command: () => void }[];
      openUserMenu: (menu: { toggle: () => void }, user: User, event: MouseEvent) => void;
    };

    const mockMenu = { toggle: vi.fn() };
    component.openUserMenu(mockMenu, mockUsers[1], new MouseEvent("click"));
    fixture.detectChanges();

    const items = component.menuItems();
    expect(items).toHaveLength(1);
    expect(items[0].label).toBe("Set to administrator");
  });

  it("should update user role to admin", async () => {
    const fixture = TestBed.createComponent(UsersComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as {
      openUserMenu: (menu: { toggle: () => void }, user: User, event: MouseEvent) => void;
      menuItems: () => { label?: string; command: () => void }[];
    };

    const mockMenu = { toggle: vi.fn() };
    component.openUserMenu(mockMenu, mockUsers[1], new MouseEvent("click"));
    fixture.detectChanges();

    await component.menuItems()[0].command();
    await fixture.whenStable();

    expect(mockUsersService.updateUserRole).toHaveBeenCalledWith("2", "admin");
  });

  it("should reload page after invite", async () => {
    const fixture = TestBed.createComponent(UsersComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    mockUsersService.getUsersPage.mockClear();

    const component = fixture.componentInstance as unknown as {
      onConfirmInvite: (form: {
        valid: boolean;
        value: { email: string };
        resetForm: () => void;
      }) => Promise<void>;
    };

    await component.onConfirmInvite({
      valid: true,
      value: { email: "x@example.com" },
      resetForm: vi.fn(),
    } as never);

    await fixture.whenStable();

    expect(mockUsersService.getUsersPage).toHaveBeenCalledWith(0, 20);
  });
});
