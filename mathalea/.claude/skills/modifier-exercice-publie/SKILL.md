---
name: modifier-exercice-publie
description: Modifier ou corriger un exercice MathALÉA déjà publié sans casser les liens partagés (graine + paramètres). Utiliser pour tout correctif, refactoring ou ajout d'option sur un exercice existant, quand pnpm stability:check signale une dérive, ou quand l'utilisateur parle d'archiver un exercice (pnpm archive, archive:retro). Aussi utile après la modification d'un utilitaire de src/lib ou d'un exercice parent.
---

# Modifier un exercice publié

Règle : pour un `uuid` et une graine donnés, les nombres de l'énoncé ne
changent jamais, quels que soient les paramètres `s`, `s2`, `s3`. Référence
complète : `documentation/tests/stabilite-exercices.md`.

## Pendant la modification

- Ne jamais déplacer, supprimer ni insérer un appel aléatoire (`randint`,
  `choice`, `shuffle`, `combinaisonListes`, `gestionnaireFormulaireTexte`…)
  avant ou entre ceux qui existent. Un nouveau tirage se place **après** les
  autres, et seulement dans la branche qui en a besoin.
- Une nouvelle option doit laisser le chemin par défaut et les valeurs
  existantes de `sup*` strictement identiques.
- Ne pas remplacer `sort(() => Math.random() - 0.5)` par `shuffle` sur un
  exercice publié : utiliser `sortRandomlyLikeV8` s'il faut le rendre portable.
- Toute modification importante (option, saisie, correction) met à jour
  `dateDeModifImportante` à la date du jour.

## Vérifier

```sh
CHANGED_FILES="src/exercices/<niveau>/<fichier>.ts" pnpm stability:check
pnpm check:changed
```

Si un utilitaire de `src/lib`, `src/modules` ou un parent partagé a changé, le
contrôle porte sur tout le catalogue : lancer `pnpm stability:check` sans
filtre.

Après `stability:check`, si le serveur de dev affiche une page blanche :
`touch src/json/*.json`, puis recharger.

## Si le test signale une dérive

Dans cet ordre de préférence :

1. **Dérive involontaire** : remettre les tirages dans leur ordre d'origine.
2. **Dérive mineure assumée** (exercice publié depuis peu, ou énoncé faux de
   toute façon) : demander à l'utilisateur, puis `pnpm stability:update` et
   l'expliquer dans le message de commit.
3. **Changement en profondeur** : archiver **avant** de committer, depuis un
   working tree où `HEAD` contient encore la version publiée :

   ```sh
   pnpm archive <REF>       # ex. pnpm archive 6N1E
   pnpm makeJson
   pnpm stability:update
   ```

   Les enfants de l'exercice doivent être archivés aussi. `pnpm archive` les liste en fin de sortie (sans les archiver) : lancer `pnpm archive` sur chacun. Pour comparer à
   l'œil : `pnpm review:archives` (serveur de dev lancé).
4. **Dérive déjà commitée** (souvent via un utilitaire ou un parent) :
   `pnpm archive:retro <REF>` (options `--changed-file`, `--good-rev`,
   `--date`, détaillées dans la doc).

`pnpm archive` et `pnpm archive:retro` renseignent aussi
`src/json/uuidsRemplaces.json` (ancien uuid → nouveau) : ne jamais supprimer un
uuid publié sans qu'il y figure (`pnpm uuids:check`). Un retour arrière qui
supprime des archives garde l'uuid de transition dans la table. Les vieilles
archives se purgent avec `pnpm archive:purge`.

Vérifier ensuite que l'archive reproduit l'ancien tirage :
`CHANGED_FILES="<chemin de l'archive -old.ts>" pnpm stability:check`.

Ne pas committer sans l'accord de l'utilisateur ; message au format
`fix(<REF>): …`.
