# Église de Bunia — Gestion de la trésorerie

Application de gestion des offrandes et des projets pour l'Église de Bunia : page publique de vision et de collecte, dons par QR code sans création de compte, espace donateur, tableau de bord trésorier avec filtres, et reçus imprimables (officiels).

## Démarrage

```bash
npm install
copy .env.example .env.local   # Windows (macOS/Linux : cp)
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Base de données & authentification (Supabase)

Le projet s'appuie sur **Supabase** pour la base de données (PostgreSQL) et
l'authentification (e-mail/mot de passe, Google, réinitialisation par e-mail).

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Dans **SQL Editor**, exécutez le script `supabase/migrations/0001_init.sql`
   (tables, types, index, triggers et politiques RLS).
3. Dans **Project Settings > API**, copiez l'URL, la clé `anon` et la clé
   `service_role` dans `.env.local`.
4. (Google, optionnel) Dans **Authentication > Providers**, activez Google et
   renseignez votre `Client ID` / `Client Secret` Google. Ajoutez l'URL de
   redirection `https://<votre-domaine>/auth/callback`.
5. (E-mails) Dans **Authentication > URL Configuration**, définissez le
   *Site URL* sur l'URL de l'application.

Pour devenir **trésorier**, créez votre compte puis, dans le SQL Editor :

```sql
update public.profils set role = 'tresorier'
 where id = (select id from auth.users where email = 'vous@exemple.cd');
```

## Environnement (`.env.local`)

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase (obligatoire). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé `anon` Supabase (obligatoire). |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé `service_role` — serveur uniquement (écritures, admin). |
| `NEXT_PUBLIC_APP_URL` | URL publique utilisée pour les liens de réinitialisation (optionnel). |

## Comptes de démonstration

Créez vos comptes via `/inscription` (l'inscription crée le profil et le
donateur liés). Puis promouvez un compte en trésorier (voir ci-dessus).

## Fonctionnalités

- **Public** : accueil (vision, valeurs, projets, témoignages), page « Notre vision », liste des projets avec progression, formulaire d'offrande sans compte, connexion/inscription, mot de passe oublié (lien retourné dans la réponse API — pas de serveur mail configuré).
- **Donateur** : espace personnel (`/espace`) regroupant ses dons, reçus et progression de ses projets soutenus.
- **Trésorier** (`/tresorier`) : tableau de bord (totaux, tendances), gestion des opérations (recherche, filtres par type/méthode/projet/donateur/période, export CSV, bénéficiaire auto si cadeau), gestion des donateurs et des projets, et générateur de QR codes redirigeant vers l'offrande.
- **Reçus** : chaque opération dispose d'un reçu officiel imprimable (`/recu/[id]`), avec montant en toutes lettres et fenêtre « Imprimer ».

## Installation comme application (PWA)

L'application est installable sur Android, iOS, Windows et macOS : ouvrez le site puis « Installer l'application » (une icône est ajoutée au bureau / écran d'accueil). Un service worker (`public/sw.js`) assure un démarrage rapide et un affichage de secours hors-ligne.

- Manifeste : `src/app/manifest.ts`
- Icônes et écrans de démarrage : `public/icons/` (régénérer avec `powershell -ExecutionPolicy Bypass -File scripts/generate-icons.ps1`)
- Remplacez les fichiers de `public/icons/` par votre logo officiel quand vous l'aurez.

## Stockage

Base de données **Supabase** (PostgreSQL). Le schéma complet se trouve dans
`supabase/migrations/0001_init.sql`. Les accès serveur passent par
`src/lib/store.ts` (client `service_role`) et l'authentification par
`src/lib/auth.ts` (session Supabase vérifiée côté serveur).

## Scripts

```bash
npm run dev     # serveur de développement
npm run build   # build de production
npm run start   # serveur de production
npm run lint    # eslint
```