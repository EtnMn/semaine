---
description: "Angular-specific coding standards and best practices"
applyTo: "**/*.ts, **/*.html, **/*.css"
---

# Angular Development Instructions

Instructions for generating high-quality Angular applications with TypeScript, using Angular Signals for state management, adhering to Angular best practices as outlined at https://angular.dev.

## Project Context

- Angular 21 with standalone components (no NgModules)
- TypeScript with strict mode enabled
- **pnpm** as package manager (required, enforced)
- **PrimeNG 21** for UI components (buttons, forms, tables, dialogs, menus, etc.)
- Vitest for unit testing (not Karma)
- Tailwind CSS v4 for styling
- Dev container environment (Debian-based)
- Follow Angular Style Guide (https://angular.dev/style-guide)

## Development Standards

### Architecture

- Use standalone components unless modules are explicitly required
- Organize code by standalone feature modules or domains for scalability
- Implement lazy loading for feature modules to optimize performance
- Use Angular's built-in dependency injection system effectively
- Structure components with a clear separation of concerns (smart vs. presentational components)

### TypeScript

- Enable strict mode in `tsconfig.json` for type safety
- Define clear interfaces and types for components, services, and models
- Use type guards and union types for robust type checking
- Implement proper error handling with RxJS operators (e.g., `catchError`)
- Use typed forms (e.g., `FormGroup`, `FormControl`) for reactive forms

### Component Design

- Follow Angular's component lifecycle hooks best practices
- Use `input()` `output()`, `viewChild()`, `viewChildren()`, `contentChild()` and `contentChildren()` functions instead of decorators
- Leverage Angular's change detection strategy (default or `OnPush` for performance)
- Keep templates clean and logic in component classes or services
- Use Angular directives and pipes for reusable functionality

### Styling

- Use Angular's component-level CSS encapsulation (default: ViewEncapsulation.Emulated)
- **Primary UI components**: Use PrimeNG for standard UI elements (buttons, forms, tables, dialogs, menus, etc.)
- Import PrimeNG modules in component `imports` array: `import { ButtonModule } from "primeng/button";`
- **Custom styling**: Use Tailwind CSS v4 utility classes alongside PrimeNG components
- Component styles in separate `.css` files (e.g., `component-name.css`)
- Tailwind classes are auto-sorted by `prettier-plugin-tailwindcss`
- **Icons**: Use PrimeIcons with `<i class="pi pi-icon-name"></i>`
- **Theme**: Aura Light Blue (configured in `src/styles.css`)
- Animations are enabled via `provideAnimationsAsync()` in `app.config.ts`
- Implement responsive design using Tailwind utilities
- Maintain accessibility (a11y) with ARIA attributes and semantic HTML

### State Management

- **Prefer Angular Signals** for reactive state management in components and services
- Use `signal()`, `computed()`, and `effect()` for reactive state updates
- Use writable signals for mutable state and computed signals for derived state
- Pattern: `protected readonly propertyName = signal(initialValue)`
- Handle loading and error states with signals and proper UI feedback
- Use Angular's `AsyncPipe` only when combining signals with RxJS observables

### Data Fetching

- Use Angular's `HttpClient` for API calls with proper typing
- Implement RxJS operators for data transformation and error handling
- Use Angular's `inject()` function for dependency injection in standalone components
- Implement caching strategies (e.g., `shareReplay` for observables)
- Store API response data in signals for reactive updates
- Handle API errors with global interceptors for consistent error handling

### Security

- Sanitize user inputs using Angular's built-in sanitization
- Implement route guards for authentication and authorization
- Use Angular's `HttpInterceptor` for CSRF protection and API authentication headers
- Validate form inputs with Angular's reactive forms and custom validators
- Follow Angular's security best practices (e.g., avoid direct DOM manipulation)

### Performance

- Enable production builds with `ng build --prod` for optimization
- Use lazy loading for routes to reduce initial bundle size
- Optimize change detection with `OnPush` strategy and signals for fine-grained reactivity
- Use trackBy in `ngFor` loops to improve rendering performance
- Implement server-side rendering (SSR) or static site generation (SSG) with Angular Universal (if specified)

### Testing

- Write unit tests for components, services, and pipes using **Vitest** (not Karma)
- Tests are colocated: `component-name.spec.ts` in same directory as component
- Use Angular's `TestBed` for component testing with mocked dependencies
- Test signal-based state updates using Angular's testing utilities
- Run tests with `pnpm test` (terminal only, no browser UI)
- Mock HTTP requests using `provideHttpClientTesting` when needed
- Ensure high test coverage for critical functionality

## Implementation Process

1. Plan project structure with standalone components
2. Define TypeScript interfaces and models
3. Scaffold components using Angular CLI: `ng generate component component-name`
4. Create separate `.ts`, `.html`, and `.css` files for each component
5. Implement signal-based state management in components and services
6. Build reusable components with `input()` and `output()` functions
7. Add reactive forms and validation if needed
8. Apply styling with Tailwind CSS utilities
9. Implement lazy-loaded routes and guards for authentication
10. Add error handling and loading states using signals
11. Write unit tests with Vitest (colocated `.spec.ts` files)
12. Format code with `pnpm format` and fix linting with `pnpm lint:fix`
13. Optimize performance and bundle size

## Additional Guidelines

- **File naming**: Components use pattern `component-name.ts`, `component-name.html`, `component-name.css` (no `.component` suffix)
- Use Angular CLI commands with pnpm: `ng generate component component-name`
- **Code formatting**: Use double quotes for strings (configured in Prettier)
- Line width: 100 characters, semicolons required, trailing commas always
- Run `pnpm format` before committing to ensure consistent code style
- Run `pnpm lint:fix` to auto-fix ESLint issues
- Document components and services with clear JSDoc comments
- Ensure accessibility compliance (WCAG 2.1) where applicable
- Keep code DRY by creating reusable utilities and shared components
- Use signals consistently for state management to ensure reactive updates
