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
- Use a Feature-Based directory structure
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

## Deployment

This application is deployed to **Azure Static Web Apps** using automated CI/CD pipelines.

### Deployment Platform

- **Service**: Azure Static Web Apps
- **Configuration**: `staticwebapp.config.json`

### Automated Deployment (CI/CD)

Deployment is fully automated via GitHub Actions (`.github/workflows/azure-static-web-apps.yml`):

**Triggers:**

- **Push to main**: Automatic production deployment
- **Pull Requests**: Deploys preview environments for testing
- **PR Closed**: Automatically cleans up preview environments

**Build Process:**

1. Uses pnpm 10.25.0 and Node.js 20
2. Installs dependencies with `pnpm install --frozen-lockfile`
3. Builds production bundle with `pnpm build`
4. Deploys to Azure Static Web Apps from `dist/etn-semaine/browser`

**Deployment Notes:**

- Requires `AZURE_STATIC_WEB_APPS_API_TOKEN` secret in GitHub repository settings
- Build happens in CI/CD pipeline (not on Azure)
- Preview environments created automatically for PRs with unique URLs
- GitHub deployment summary shows live URL after successful deployment

### Static Web App Configuration

Key features configured in `staticwebapp.config.json`:

- **SPA Routing**: All routes fallback to `/index.html` (Angular client-side routing)
- **Caching**: Static assets cached for 1 year, HTML not cached
- **Security Headers**: CSP, X-Frame-Options, X-XSS-Protection, etc.
- **MIME Types**: Proper font and asset type declarations

## Infrastructure as Code (Terraform)

Azure infrastructure is managed with **Terraform** using a modular architecture. The IaC is located in the `infra/` directory.

### Terraform Structure

```
infra/
├── main.tf              # Module calls
├── variables.tf         # Global variables
├── outputs.tf           # Global outputs
├── providers.tf         # azurerm provider with OIDC
├── backend.tf           # Azure Storage backend
└── modules/
    ├── resource-group/  # azurerm_resource_group
    ├── storage-account/ # azurerm_storage_account
    └── static-web-app/  # azurerm_static_web_app
```

### Terraform Commands

```bash
cd infra

# Initialize (download providers, configure backend)
terraform init

# Format all files
terraform fmt -recursive

# Validate configuration
terraform validate

# Preview changes
terraform plan

# Apply changes (production only via CI/CD)
terraform apply
```

### Terraform CI/CD Workflows

Three GitHub Actions workflows manage the Terraform lifecycle:

| Workflow                 | Trigger           | Actions                                           |
| ------------------------ | ----------------- | ------------------------------------------------- |
| `terraform-validate.yml` | Push (any branch) | Format auto-commit, validate, tfsec security scan |
| `terraform-plan.yml`     | PR to main        | Generate plan, comment summary on PR              |
| `terraform-apply.yml`    | Merge to main     | Apply changes to Azure                            |

**Workflow Details:**

1. **Validation** (`terraform-validate.yml`):
   - Auto-formats Terraform files and commits changes
   - Runs `terraform validate` for syntax checking
   - Executes `tfsec` for security analysis

2. **Plan on PR** (`terraform-plan.yml`):
   - Generates `terraform plan` output
   - Posts a summary comment on the PR with add/change/destroy counts
   - Updates existing comment on subsequent pushes

3. **Apply on Merge** (`terraform-apply.yml`):
   - Runs `terraform apply -auto-approve`
   - Uses `production` environment for protection rules
   - Outputs deployment summary

### Azure Authentication (OIDC)

Uses **Workload Identity Federation** (no secrets stored in GitHub):

- **Method**: OpenID Connect (OIDC) via Azure AD App Registration
- **Provider Config**: `use_oidc = true` in `providers.tf` and `backend.tf`

**Required GitHub Variables** (not secrets):

- `AZURE_CLIENT_ID` — App Registration client ID
- `AZURE_TENANT_ID` — Azure AD tenant ID
- `AZURE_SUBSCRIPTION_ID` — Subscription ID

**Azure Prerequisites:**

1. Create an App Registration in Azure AD
2. Configure Federated Credential for `repo:EtnMn/semaine:*`
3. Assign Contributor role on the resource group

### Terraform Backend

State is stored remotely in Azure Storage:

- **Resource Group**: `rg-etn-semaine-tfstate`
- **Storage Account**: `stetnsemainetfstate`
- **Container**: `tfstate`
- **State File**: `terraform.tfstate`

## Important Notes

- **Do NOT use Karma** - this project uses Vitest
- **Do NOT create NgModules** - all components are standalone
- **Browser for debugging**: Microsoft Edge (configured in launch.json)
- **Format before commit**: Run `pnpm format` to ensure consistent code style
- **Deployment**: Always happens automatically via GitHub Actions on push to main
