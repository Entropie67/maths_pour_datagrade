# MathALÉA pour DataGrade

Copie complète du code officiel de MathALÉA, conservée dans `mathalea/`, avec son moteur, ses catalogues, son interface, ses tests et ses licences. Révision : `f03d4179f5ebade4828bb3b78e8cf2021309a37b`.

Voir [l'origine et les empreintes](UPSTREAM.md), [le rapport de validation](validation/RESULTATS.md) et [la préparation DataGrade](docs/INTEGRATION-DATAGRADE.md).

## Lancer en local

Node.js 24.13.0 et pnpm 12.6.0 ont été utilisés pour cette validation.

```sh
cd mathalea
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

Ouvrir l'adresse affichée par Vite, normalement `http://localhost:5173/alea/`.

## Vérifier et compiler

Avant les commandes de génération, à la racine :

```sh
node scripts/verify-upstream.mjs
```

Dans `mathalea/` :

```sh
corepack pnpm makeJson
corepack pnpm prebuild-unit-tests
corepack pnpm build
corepack pnpm build:moteur
```

Les deux scripts de build amont utilisent une affectation de variable Unix. Sous PowerShell, remplacer les deux dernières commandes par :

```powershell
$env:NODE_OPTIONS='--max-old-space-size=6144'
corepack pnpm exec vite build
corepack pnpm exec vite build -c vite.moteur.config.ts
```

Le contrôle navigateur supplémentaire se lance à la racine avec `node scripts/smoke-browser.mjs`, après démarrage du serveur et installation de Chromium via `corepack pnpm exec playwright install chromium` dans `mathalea/`.

## Périmètre et licence

L'import inclut tous les fichiers suivis en amont. Les médias d'annales et services externes absents du dépôt nécessitent une préparation supplémentaire pour un hébergement autonome. La compilation et les tests réussis ne constituent pas une validation exhaustive de toutes les fonctionnalités.

MathALÉA est distribué sous [AGPL-3.0](mathalea/LICENSE). Les auteurs et mentions d'origine sont conservés. Toute distribution ou mise à disposition d'une version modifiée doit conserver les mentions applicables et fournir son code source correspondant selon cette licence. Prévoir un accès visible aux sources de la version déployée dans le futur habillage.
