## Plan: Intégration Supabase avec Auth OAuth et RLS

Intégration complète de Supabase dans l'application Angular 21 pour l'authentification (email/password + OAuth) et la gestion de données avec Row Level Security. Le plan suit les patterns établis du projet (signals, standalone components, services avec `inject()`). L'architecture créera un service Supabase centralisé, un service Auth avec état réactif via signals, un service de données type-safe, des guards pour protéger les routes, et des composants d'authentification réutilisables. La configuration utilisera un système d'environnement pour gérer les credentials Supabase de manière sécurisée.

**Steps**

1. **Installer les dépendances Supabase**
   - Exécuter `pnpm install @supabase/supabase-js`
   - `ng generate environments`
   - Créer `src/env/environment.local.ts` avec VOS VRAIES credentials Supabase (IGNORÉ par Git)

2. **Créer le service Supabase core**
   - Créer `src/app/core/services/supabase.service.ts`
   - Pattern: `@Injectable({ providedIn: "root" })`
   - Initialiser le client Supabase avec `createClient()` depuis les variables d'environnement
   - Exposer le client via getter public
   - Ajouter l'export dans [src/app/core/services/index.ts](src/app/core/services/index.ts)

3. **Créer le service d'authentification avec signals**
   - Créer `src/app/core/services/auth.service.ts`
   - Pattern signal comme [dark-mode.service.ts](src/app/core/services/dark-mode.service.ts):
     - `private readonly user = signal<User | null>(null)`
     - `public readonly currentUser = this.user.asReadonly()`
     - `public readonly isAuthenticated = computed(() => this.user() !== null)`
   - Injecter `SupabaseService` via `inject()`
   - Méthodes: `signUp()`, `signIn()`, `signInWithOAuth()`, `signOut()`, `resetPassword()`
   - Écouter `onAuthStateChange()` dans le constructor pour synchroniser l'état
   - Ajouter l'export dans [src/app/core/services/index.ts](src/app/core/services/index.ts)

4. **Créer le service de données type-safe**
   - Créer `src/app/core/services/database.service.ts`
   - Définir les types TypeScript pour les tables (interface)
   - Injecter `SupabaseService` via `inject()`
   - Méthodes génériques: `select<T>()`, `insert<T>()`, `update<T>()`, `delete<T>()`
   - Utiliser les méthodes Supabase avec typage fort
   - Ajouter l'export dans [src/app/core/services/index.ts](src/app/core/services/index.ts)

5. **Créer le guard d'authentification**
   - Créer `src/app/core/guards/auth.guard.ts`
   - Implémenter `CanActivateFn` (functional guard)
   - Injecter `AuthService` et `Router` via `inject()`
   - Vérifier `isAuthenticated()`, rediriger vers `/login` si non authentifié
   - Créer barrel export [src/app/core/guards/index.ts](src/app/core/guards/index.ts)

6. **Créer les composants d'authentification**
   - Créer `src/app/features/auth/login/` avec `login.ts`, `login.html`, `login.css`
     - Standalone component avec PrimeNG forms (InputText, Password, Button)
     - Formulaire réactif pour email/password
     - Boutons OAuth pour providers (Google, GitHub, etc.)
     - Injecter `AuthService` via `inject()`
     - Utiliser `Router` pour redirection après connexion
   - Créer `src/app/features/auth/signup/` avec `signup.ts`, `signup.html`, `signup.css`
     - Même pattern que login
     - Validation de mot de passe (confirmation)
   - Créer composant `src/app/features/auth/profile/` pour afficher/éditer le profil utilisateur
   - Ajouter barrel export [src/app/features/auth/index.ts](src/app/features/auth/index.ts)

7. **Configurer les routes avec protection**
   - Modifier [app.routes.ts](src/app/app.routes.ts)
   - Ajouter routes publiques: `/login`, `/signup`
   - Ajouter routes protégées avec `canActivate: [authGuard]`: `/profile`, `/dashboard`, etc.
   - Configurer route par défaut et wildcard

8. **Ajouter l'état d'authentification dans le header**
   - Modifier [header.ts](src/app/core/layout/header.ts) et [header.html](src/app/core/layout/header.html)
   - Injecter `AuthService` via `inject()`
   - Afficher user info si `isAuthenticated()` est true
   - Ajouter bouton de déconnexion avec PrimeNG Button
   - Liens conditionnels (Login/Signup si non connecté, Profile si connecté)

9. **Créer un service d'exemple avec RLS**
   - Créer `src/app/features/[nom-feature]/services/[entity].service.ts` comme exemple
   - Pattern: injecter `DatabaseService` et `AuthService`
   - Méthodes CRUD qui respectent RLS (les requêtes utilisent automatiquement la session)
   - Utiliser signals pour l'état local: `private readonly items = signal<Entity[]>([])`

10. **Configurer les secrets pour la production**
    - Ajouter les secrets dans GitHub Repository Settings:
      - `SUPABASE_URL` - URL de votre projet Supabase
      - `SUPABASE_ANON_KEY` - Clé anonyme publique de Supabase
    - Configurer Azure Static Web Apps pour utiliser ces variables via GitHub Actions
    - Modifier le workflow `.github/workflows/azure-static-web-apps.yml` pour injecter les variables au build
    - Documenter dans README le processus de configuration des credentials (dev local + production)

**Verification**

- Exécuter `pnpm lint` pour vérifier la conformité ESLint
- Exécuter `pnpm format:check` pour valider le formatage
- Exécuter `pnpm build` pour vérifier que la compilation fonctionne
- Lancer `pnpm start` et tester:
  - Accéder à une route protégée → redirection vers `/login`
  - S'inscrire avec email/password
  - Se connecter avec email/password
  - Se connecter avec OAuth provider
  - Vérifier que le signal `currentUser` se met à jour
  - Vérifier l'affichage conditionnel dans le header
  - Se déconnecter et vérifier le retour à l'état non authentifié
  - Tester les opérations CRUD avec RLS
- Créer tests unitaires dans les fichiers `.spec.ts` pour:
  - `auth.service.spec.ts` - tester les méthodes d'authentification (mock Supabase)
  - `auth.guard.spec.ts` - tester la protection des routes
  - `database.service.spec.ts` - tester les opérations CRUD

**Decisions**

- **Configuration d'environnement sécurisée**:
  - `environment.ts` contient des placeholders (commité dans Git)
  - `environment.local.ts` contient les vraies credentials locales (ignoré par Git via `.gitignore`)
  - `environment.prod.ts` utilise des variables injectées via GitHub Secrets → Azure Config
  - Angular remplace automatiquement les fichiers selon le "fileReplacements" dans `angular.json`
  - **Aucune clé secrète n'est jamais commitée dans le repo**
- **Pattern signals**: Maintien de la cohérence avec [dark-mode.service.ts](src/app/core/services/dark-mode.service.ts) - signal privé writable + readonly accessor public
- **Functional guards**: Utilisation de `CanActivateFn` (moderne) plutôt que class-based guards (déprécié)
- **Service architecture**: Séparation en 3 services (Supabase client, Auth, Database) pour une meilleure séparation des responsabilités et testabilité
- **OAuth flow**: Redirection côté client (standard Supabase) plutôt que PKCE server-side
- **Typage TypeScript**: Définition des types de base de données dans `database.service.ts` pour centraliser les interfaces
