# Maintenance de `@scratch2latex/scratch-core`

MathALÉA utilise `@scratch2latex/scratch-core` pour les fonctionnalités Scratch
partagées : rendu, simulation, interprétation et dictionnaire français des blocs.

Le paquet est déclaré dans `package.json` avec la branche `main` du dépôt
`scratch-core`. Le commit réellement installé est verrouillé dans
`pnpm-lock.yaml`.

## Mise à jour de `scratchblocks`

Quand `scratch-core` met à jour `scratchblocks`, les noms de commandes anglais
peuvent changer. Le dictionnaire `scratchFr.json` doit alors être synchronisé
dans `scratch-core`, puis consommé depuis MathALÉA sans copie locale.

Procédure dans le dépôt `scratch-core` :

1. Mettre à jour `scratchblocks`.
2. Synchroniser `src/json/scratchFr.json` avec les nouveaux noms de commandes.
3. Vérifier que toutes les clés de `commands` existent dans la version de
   `scratchblocks` installée par `scratch-core`. `scratchblocks.loadLanguages()`
   ne tolère pas les clés inconnues.
4. Vérifier que le script de build copie le fichier vers
   `dist/json/scratchFr.json`.
5. Exposer le fichier dans `package.json` :

```json
"./json/scratchFr.json": {
  "default": "./dist/json/scratchFr.json"
}
```

6. Publier ou pousser la nouvelle version sur la branche consommée par MathALÉA.

Procédure dans MathALÉA :

1. Mettre à jour la dépendance :

```bash
pnpm install --no-frozen-lockfile
```

2. Vérifier que `pnpm-lock.yaml` pointe vers la nouvelle version et le nouveau
   commit de `@scratch2latex/scratch-core`.
3. Importer le dictionnaire depuis le sous-chemin exporté par le paquet :

```ts
import scratchFr from '@scratch2latex/scratch-core/json/scratchFr.json'
```

4. Ne pas conserver de copie locale dans `src/json/`.
5. Lancer au minimum :

```bash
pnpm vitest --run src/lib/customElements/ScratchEditor.test.ts
pnpm check
```

Le fichier `pnpm-lock.yaml` doit être committé avec la montée de version : il
garantit que la CI et les autres environnements installent bien la version de
`scratch-core` qui expose `./json/scratchFr.json`.

## Symptôme d'export manquant

Si Vite affiche une erreur de ce type :

```text
Missing "./json/scratchFr.json" specifier in "@scratch2latex/scratch-core" package
```

cela signifie que la version installée de `scratch-core` ne déclare pas encore
ce sous-chemin dans son champ `exports`, ou que `pnpm-lock.yaml` pointe encore
vers un ancien commit. Corriger d'abord `scratch-core`, puis relancer
`pnpm install --no-frozen-lockfile` dans MathALÉA et vérifier le diff du
lockfile.

## Symptôme de commande inconnue

Si les tests navigateur échouent dans `renderScratch` avec :

```text
Cannot read properties of undefined (reading 'spec')
```

pendant `scratchblocks.loadLanguages({ fr: scratchFr })`, une clé de
`scratchFr.commands` n'existe probablement pas dans la version de
`scratchblocks` installée. Lors de la montée vers `scratchblocks` 3.7.1, par
exemple, `SOUND_SETEFFECTTO` ne devait pas être ajouté : l'id attendu par
`scratchblocks` reste `SOUND_SETEFFECTO`.
