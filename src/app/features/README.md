# Features Module

Feature-specific modules organized by domain/functionality.

## Structure

Each feature should have its own directory with:

- Components specific to that feature
- Services scoped to that feature
- Models/interfaces for that feature
- Routes for that feature

## Example Structure

```
features/
  auth/
    components/
    services/
    models/
    auth.routes.ts
  dashboard/
    components/
    services/
    dashboard.routes.ts
```

## Guidelines

- Organize by business domain or feature area
- Each feature should be lazy-loadable
- Keep feature-specific logic within its folder
