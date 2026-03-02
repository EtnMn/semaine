## Plan: Intégration Supabase avec Auth OAuth et RLS

Intégration complète de Supabase dans l'application Angular 21 pour l'authentification (email/password + OAuth) et la gestion de données avec Row Level Security. Le plan suit les patterns établis du projet (signals, standalone components, services avec `inject()`). L'architecture créera un service Supabase centralisé, un service Auth avec état réactif via signals, un service de données type-safe, des guards pour protéger les routes, et des composants d'authentification réutilisables. La configuration utilisera un système d'environnement pour gérer les credentials Supabase de manière sécurisée.

**Steps**

1. **Installer les dépendances Supabase**
   - Exécuter `pnpm install @supabase/supabase-js`
   - `ng generate environments`
   - Créer `src/env/environment.local.ts` avec VOS VRAIES credentials Supabase (IGNORÉ par Git)
   - Créer `src/app/core/services/supabase.service.ts`

2. **Créer le service de données type-safe**
   - Créer `src/app/core/services/database.service.ts`
   - Définir les types TypeScript pour les tables (interface)
   - Injecter `SupabaseService` via `inject()`
   - Méthodes génériques: `select<T>()`, `insert<T>()`, `update<T>()`, `delete<T>()`
   - Utiliser les méthodes Supabase avec typage fort
   - Ajouter l'export dans [src/app/core/services/index.ts](src/app/core/services/index.ts)

3. **Créer les composants d'authentification**
   - Créer composant `src/app/features/auth/profile/` pour afficher/éditer le profil utilisateur
   - Ajouter barrel export [src/app/features/auth/index.ts](src/app/features/auth/index.ts)

4. **Créer un service d'exemple avec RLS**
   - Créer `src/app/features/[nom-feature]/services/[entity].service.ts` comme exemple
   - Pattern: injecter `DatabaseService` et `AuthService`
   - Méthodes CRUD qui respectent RLS (les requêtes utilisent automatiquement la session)
   - Utiliser signals pour l'état local: `private readonly items = signal<Entity[]>([])`

5. **Configurer les secrets pour la production**
   - Ajouter les secrets dans GitHub Repository Settings:
     - `SUPABASE_URL` - URL de votre projet Supabase
     - `SUPABASE_ANON_KEY` - Clé anonyme publique de Supabase
   - Configurer Azure Static Web Apps pour utiliser ces variables via GitHub Actions
   - Modifier le workflow `.github/workflows/azure-static-web-apps.yml` pour injecter les variables au build
   - Documenter dans README le processus de configuration des credentials (dev local + production)

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
