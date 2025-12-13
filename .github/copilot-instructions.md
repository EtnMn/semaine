# Copilot Instructions for etn-semaine

## Project Overview

Modern Angular 21 application using standalone components, signals, and Vitest for testing. Built with TypeScript, styled with Tailwind CSS v4, running in a dev container.

## Tech Stack & Patterns

- **Angular 21**: Standalone components (no NgModules), signals for state management
- **Component Structure**: Each component has separate `.ts`, `.html`, and `.css` files (e.g., `app.ts`, `app.html`, `app.css`)
- **UI Library**: PrimeNG 21 for components (buttons, forms, tables, dialogs, etc.)
- **Styling**: Tailwind CSS v4 with PostCSS + PrimeNG theme (Aura Light Blue)
- **Icons**: PrimeIcons (included with PrimeNG)
- **Testing**: Vitest (not Karma) - tests run in terminal, no browser UI
- **Package Manager**: pnpm (required, enforced by `packageManager` field)

## Development Workflow

### Dev Container Setup

This project runs in a **dev container** (Debian-based). All development happens inside the container:

- Port 4200 is exposed for `ng serve` with `host: 0.0.0.0` in `angular.json`
- Supabase CLI is pre-installed
- SSH keys are mounted from host (`~/.ssh`)

### Essential Commands

```bash
pnpm start          # Start dev server on localhost:4200
pnpm build          # Production build
pnpm test           # Run Vitest tests (terminal only, no UI)
pnpm lint           # ESLint check
pnpm lint:fix       # Auto-fix ESLint issues
pnpm format         # Format all files with Prettier
pnpm format:check   # Check formatting without changes
```

## Code Conventions

### TypeScript/Angular

- **Double quotes** for strings (configured in Prettier)
- **Signals** for reactive state: `protected readonly title = signal("value")`
- **Component selectors**: Use `app-` prefix with kebab-case (enforced by ESLint)
- **Directive selectors**: Use `app` prefix with camelCase (enforced by ESLint)
- **Standalone components**: Always use `imports: [...]` array, no NgModules

### File Organization

- Components follow pattern: `component-name.ts`, `component-name.html`, `component-name.css`
- Tests are colocated: `component-name.spec.ts` in same directory
- All source code in `src/app/`

### Code Style

- Line width: 100 characters
- Semicolons: required
- Trailing commas: always
- Tab width: 2 spaces
- Tailwind classes are auto-sorted by `prettier-plugin-tailwindcss`

### PrimeNG Usage

- Import PrimeNG components in `imports` array of standalone components
- Example: `import { ButtonModule } from "primeng/button";`
- Use PrimeNG components for UI (buttons, forms, tables, dialogs, menus, etc.)
- Combine PrimeNG components with Tailwind utility classes for custom styling
- Available theme: Aura Light Blue (configured in `styles.css`)
- PrimeIcons available with `<i class="pi pi-icon-name"></i>`
- Animations enabled via `provideAnimationsAsync()` in `app.config.ts`

## ESLint Configuration

Uses flat config (`eslint.config.mjs`) with:

- TypeScript ESLint recommended + stylistic rules
- Angular ESLint for components and templates
- Prettier integration (no conflicts)
- Template files (`.html`) use Angular template parser

## Debugging

Launch configurations in `.vscode/launch.json`:

- **"ng serve"**: Opens Microsoft Edge (not Chrome) at `localhost:4200`
- No test debugging config (Vitest runs in terminal)

## Important Notes

- **Do NOT use Karma** - this project uses Vitest
- **Do NOT create NgModules** - all components are standalone
- **Browser for debugging**: Microsoft Edge (configured in launch.json)
- **Format before commit**: Run `pnpm format` to ensure consistent code style
