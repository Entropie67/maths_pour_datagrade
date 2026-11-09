# MathALÉA pour DataGrade

Copie complète du code officiel de MathALÉA, conservée dans `mathalea/`, avec son moteur, ses catalogues, son interface, ses tests et ses licences. Révision : `f03d4179f5ebade4828bb3b78e8cf2021309a37b`.

Voir [l'origine et les empreintes](UPSTREAM.md), [le rapport de validation](validation/RESULTATS.md) et [la préparation DataGrade](docs/INTEGRATION-DATAGRADE.md).

Cible de déploiement : **https://maths.datagrade.fr/alea/**. Voir [les chemins et réglages d'hébergement](docs/DEPLOIEMENT-DATAGRADE.md). La publication sur ce serveur reste à effectuer.

## Lancer en local

Node.js 24.13.0 et pnpm 12.6.0 ont été utilisés pour cette validation.

```sh
cd mathalea
corepack pnpm install --frozen-lockfile
corepack pnpm exec vite --config ../vite.annales-locales.config.mjs --port 5180 --strictPort
```

Ouvrir `http://localhost:5180/alea/`. Ce profil sert les annales présentes dans le dépôt. Le profil amont `pnpm dev` reste disponible, mais redirige les médias d'annales vers CoopMaths.

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

## Déployer sur maths.datagrade.fr

Le workflow [`deploy-hostinger.yml`](.github/workflows/deploy-hostinger.yml) compile `mathalea/` puis dépose `dist/` par FTP (`lftp`, connexion de contrôle chiffrée, données en clair car Hostinger coupe le FTPS sur le canal de données, cinq transferts en parallèle) dans `public_html/alea/` du site Hostinger `maths.datagrade.fr`, à chaque push sur `integration/mathalea-complet` ou `main` touchant `mathalea/`, `hostinger/` ou le workflow, et à la demande (*Run workflow*). L'application est alors servie sur `https://maths.datagrade.fr/alea/` et `https://maths.datagrade.fr/alea/deploiement.json` indique le commit déployé et le lien vers ses sources.

Trois secrets de dépôt sont nécessaires (*Settings → Secrets and variables → Actions*) : `FTP_HOST` (hôte FTP Hostinger, sans `ftp://`), `FTP_USER` (nom d'utilisateur complet) et `FTP_PASSWORD`. Ils ne doivent figurer nulle part ailleurs.

Le fichier [`hostinger/alea.htaccess`](hostinger/alea.htaccess), copié en `dist/.htaccess`, reprend pour Apache les règles de `mathalea/deploy/nginx/` : cache long des fichiers hachés, `index.html` jamais mis en cache, types MIME, compression, et renvoi des scans d'annales absents (`/alea/static/`) vers coopmaths.fr comme le fait le serveur de développement amont. Seuls les fichiers absents ou de taille différente sont renvoyés (plus `index.html`, `version.txt`, `deploiement.json` et `.htaccess`, renvoyés à chaque fois), et les fichiers disparus du build sont supprimés du serveur ; le premier envoi (1,7 Go, 16 000 fichiers avec les annales) est long.

## Périmètre et licence

L'import inclut tous les fichiers suivis en amont et les médias d'annales récupérés depuis les sources officielles. Voir [l'inventaire, les fichiers manquants et les essais locaux](resources/README.md). Les services externes nécessitent encore une préparation pour un hébergement autonome. La compilation et les tests réussis ne constituent pas une validation exhaustive de toutes les fonctionnalités.

MathALÉA est distribué sous [AGPL-3.0](mathalea/LICENSE). Les auteurs et mentions d'origine sont conservés. Toute distribution ou mise à disposition d'une version modifiée doit conserver les mentions applicables et fournir son code source correspondant selon cette licence. Prévoir un accès visible aux sources de la version déployée dans le futur habillage.
