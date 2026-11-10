# Workflows de contribution au moteur

Cette page complète le [démarrage auteur](../../auteurs-exercices/demarrage.md)
pour les modifications transversales.

## Mettre à jour une branche

Commencez par vérifier l'état du dépôt :

```sh
git status
git branch --show-current
```

Sur une branche propre, récupérez les changements de la branche principale
selon le workflow convenu par l'équipe. Ne réécrivez pas l'historique d'une
branche partagée sans coordination.

## Vérifications

Les commandes de référence sont :

```sh
pnpm prebuild-unit-tests
pnpm check
pnpm build
```

Ajoutez les tests ciblés du sous-système modifié. Les suites Playwright, LaTeX,
PDF et les jobs GitLab sont décrits dans
[Tests et CI](../../../tests/README.md).

## Store pnpm

Le store du dépôt est configuré par :

```yaml
storeDir: .pnpm-store
```

dans `pnpm-workspace.yaml`. Les commandes pnpm ne nécessitent pas d'option
supplémentaire. Le dossier est ignoré par Git et utilisé comme cache en CI.

## Build et dépendances

- `pnpm install` installe les versions de `pnpm-lock.yaml` sans modifier ce fichier ;
- si le manifeste et le lockfile divergent, l'installation échoue : vérifier que
  les deux fichiers ont été récupérés ensemble ;
- pour modifier volontairement les dépendances, lancer
  `pnpm install --no-frozen-lockfile` après avoir changé `package.json`, puis
  relire et committer les deux fichiers ;
- `pnpm build` vérifie la production d'une application distribuable ;
- les navigateurs Playwright et les outils LaTeX sont des prérequis séparés ;
- la version de pnpm est fixée par `packageManager` dans `package.json` et doit
  rester alignée avec la CI ; pnpm est l'outil d'installation, pas une
  `devDependency` du projet.

### Diagnostiquer la durée du build

Le script `build` de `package.json` enchaîne `pnpm makeJson` et `vite build`,
avec une limite de tas Node de 6 Gio transmise par `NODE_OPTIONS` pour traiter
le catalogue complet sans épuiser la limite par défaut. Cette limite n'est
pas une réservation de mémoire.
`makeJson` génère les référentiels statiques, le menu international et le
manifeste des fonds de quizz ; voir [le menu d'exercices](../architecture/menu-exercices.md).
Les tests et la vérification TypeScript ne font pas partie de `pnpm build`.

Pour isoler les deux étapes, les exécuter successivement :

```sh
time pnpm makeJson
time env NODE_OPTIONS=--max-old-space-size=6144 pnpm exec vite build
```

Vite indique la fin de la transformation des modules, puis le rendu des
chunks. Les imports dynamiques d'exercices dans `src/lib/exerciseModules.ts`
permettent un chargement à la demande dans le navigateur, mais les modules
correspondants doivent tout de même être traités pendant le build.
`vite.config.ts` configure notamment Svelte, Tailwind et le découpage des
chunks. Le rapport `dist/stats.html` de Rollup Visualizer est optionnel :
`pnpm build:analyze` le génère. Son analyse du graphe peut prendre plusieurs
dizaines de secondes ; elle décrit la taille du bundle, pas le temps de
compilation. Le calcul des tailles gzip est désactivé par
`reportCompressedSize: false`.

Le catalogue utilise un registre unique, chargé dynamiquement. Les sélecteurs
d'automatismes consultent une liste de chemins via `exerciseLoader.ts` ; ils
ne doivent pas réintroduire chacun un `import.meta.glob` de chargeurs sur tout
le catalogue. Les fonctions de rendu KaTeX et de distracteurs QCM sont séparées
de `mathalea.ts` pour éviter de rattacher les helpers des exercices au module
qui orchestre l'application. Les JSON sont importés par défaut et transformés
en `JSON.parse`, sans créer un export nommé pour chaque entrée du référentiel.

Pour obtenir un profil CPU de Vite après avoir généré les JSON :

```sh
mkdir -p /tmp/mathalea-build-profile
node --max-old-space-size=6144 --cpu-prof \
  --cpu-prof-dir=/tmp/mathalea-build-profile \
  ./node_modules/vite/bin/vite.js build
```

Le fichier `.cpuprofile` s'ouvre dans un visualiseur de profils CPU, par
exemple celui de Chrome DevTools. Distinguer le temps du ramasse-miettes,
les transformations des plugins et le travail de Rollup. Les durées des
opérations asynchrones peuvent se chevaucher : leur somme n'est pas une
durée totale de build. Le profil Node ne mesure pas directement le CPU des
processus auxiliaires comme esbuild. Comparer les essais avec les mêmes
options mémoire et sans autre build simultané.

## Diagnostic

En cas d'échec :

1. relancez la commande ciblée sans masquer sa sortie ;
2. vérifiez les versions de Node et pnpm ;
3. identifiez le premier test en erreur ;
4. comparez avec le job correspondant dans `.gitlab-ci.yml` ;
5. consultez les documents de [Tests et CI](../../../tests/README.md).
