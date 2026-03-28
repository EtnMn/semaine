# EtnSemaine

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

### Supabase Configuration

This project uses **Supabase** for authentication and database. To configure your local environment:

**1. Get your Supabase credentials:**

- Go to [Supabase Dashboard](https://supabase.com/dashboard)
- Select your project
- Go to Settings → API
- Copy your `URL` and `anon/public` key

**2. Create your local environment file:**

```bash
# Copy the template
cp src/env/environment.ts src/env/environment.local.ts
```

**3. Edit `src/env/environment.local.ts` with your real credentials:**

```typescript
export const environment = {
  production: false,
  supabase: {
    url: "https://your-project.supabase.co",
    key: "your-real-key-here",
  },
};
```

**4. Start the dev server with local configuration:**

```bash
ng serve --configuration=local
```

**Important:** `environment.local.ts` is ignored by Git and will never be committed. Keep your credentials safe!

**For CI/CD:** Production credentials are injected at build time using `envsubst`. Configure the following in your GitHub repository settings:

- **Variable** (`Settings > Variables > Actions`): `SUPABASE_URL` — your Supabase project URL
- **Secret** (`Settings > Secrets > Actions`): `SUPABASE_KEY` — your Supabase anon/public key

The build workflow replaces `${SUPABASE_URL}` and `${SUPABASE_KEY}` placeholders in `src/env/environment.ts` before building the production bundle.

**Supabase Dashboard Configuration:**

In **Authentication** → **URL Configuration**:

1. Set **Site URL** to your production URL (e.g. `https://white-island-0b8280303.azurestaticapps.net`)
2. Add the following **Redirect URLs**:
   - `http://localhost:4200` — for local development
   - `https://*.westeurope.6.azurestaticapps.net` — PR preview environments

This ensures OAuth redirects work correctly across all environments. The app dynamically sets `redirectTo` to `window.location.origin` so users are always redirected back to the environment they started from.

### Edge Functions

Edge Functions are located in `supabase/functions/` and deployed automatically by the CI/CD pipeline alongside database migrations.

| Function      | Description                                                    | Auth                                        |
| ------------- | -------------------------------------------------------------- | ------------------------------------------- |
| `invite-user` | Sends an invitation email to a new user. Restricted to admins. | JWT verified manually (admin role required) |

**Setup:**

The `invite-user` function requires the Supabase service role key to call the admin API. Set it as a project secret:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

> The service role key is available in **Supabase Dashboard → Settings → API → Service role secret**. It is never exposed to the browser.

**Manual deployment:**

```bash
supabase functions deploy --all
```

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Infrastructure as Code (Terraform)

This project uses Terraform to manage Azure infrastructure. The Terraform configuration is located in the `infra/` directory.

### Local Development

**Prerequisites:**

- Azure CLI installed and authenticated (`az login`)
- Terraform CLI installed

**Note:** The subscription ID is configured in `infra/terraform.tfvars` (not committed to Git).

### CI/CD with OIDC

GitHub Actions workflows use **OIDC (OpenID Connect)** for secure authentication to Azure without storing secrets.

**Azure Configuration:**

1. Create an **App Registration** in Azure AD
2. Add two **Federated Credentials** for the GitHub repository, one for main branch and second one for PR
3. Grant **Contributor** role on the tfstate resource group
4. Grant **Contributor** role on the web app resource group

**GitHub Configuration:**

Add these to your repository settings:

Variables (`Settings > Variables > Actions`):

- `AZURE_CLIENT_ID` — App Registration client ID
- `AZURE_TENANT_ID` — Azure AD tenant ID
- `AZURE_SUBSCRIPTION_ID` — Azure subscription ID
- `SUPABASE_URL` — Supabase project URL

Secrets (`Settings > Secrets > Actions`):

- `AZURE_STATIC_WEB_APPS_API_TOKEN` — Azure Static Web Apps deployment token
- `SUPABASE_KEY` — Supabase anon/public key

**Workflows:**

- `terraform-format-security.yml` — Format and security scan (runs on all pushes)
- `terraform-plan.yml` — Generate plan and comment on PRs
- `terraform-apply.yml` — Apply changes to Azure (runs on merge to main)

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
