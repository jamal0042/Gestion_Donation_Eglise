# Église de Bunia — Gestion de la trésorerie

Application de gestion des offrandes et des projets pour l'Église de Bunia : page publique de vision et de collecte, dons par QR code sans création de compte, espace donateur, tableau de bord trésorier avec filtres, et reçus imprimables (officiels).

## Démarrage

```bash
npm install
cp .env.example .env.local   # Windows : copy .env.example .env.local
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Environnement (`.env.local`)

| Variable | Rôle |
|---|---|
| `AUTH_SECRET` | Secret de signature de la session JWT (obligatoire, ≥ 32 octets). |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Connexion Google (optionnel). |
| `NEXT_PUBLIC_APP_URL` | URL publique utilisée pour les liens de réinitialisation (optionnel). |

## Comptes de démonstration

| Rôle | E-mail | Mot de passe |
|---|---|---|
| Trésorier | `tresorier@eglisabunia.cd` | `Demo1234!` |
| Donateur | `jean@exemple.cd` | `Demo1234!` |

## Fonctionnalités

- **Public** : accueil (vision, valeurs, projets, témoignages), page « Notre vision », liste des projets avec progression, formulaire d'offrande sans compte, connexion/inscription, mot de passe oublié (lien retourné dans la réponse API — pas de serveur mail configuré).
- **Donateur** : espace personnel (`/espace`) regroupant ses dons, reçus et progression de ses projets soutenus.
- **Trésorier** (`/tresorier`) : tableau de bord (totaux, tendances), gestion des opérations (recherche, filtres par type/méthode/projet/donateur/période, export CSV, bénéficiaire auto si cadeau), gestion des donateurs et des projets, et générateur de QR codes redirigeant vers l'offrande.
- **Reçus** : chaque opération dispose d'un reçu officiel imprimable (`/recu/[id]`), avec montant en toutes lettres et fenêtre « Imprimer ».

## Stockage

Prototype local : données JSON sous `data/` (`operations.json`, `donateurs.json`, `projets.json`, `users.json`, `resets.json`). Pensez à migrer vers une base de données en production.

## Scripts

```bash
npm run dev     # serveur de développement
npm run build   # build de production
npm run start   # serveur de production
npm run lint    # eslint
```