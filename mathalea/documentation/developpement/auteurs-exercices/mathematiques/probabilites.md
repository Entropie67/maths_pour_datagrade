# Probabilités

Ce guide fixe la notation et les consignes des exercices de probabilités
(`1A-P03-*`, `1A-P04-*`, `1A-P05-*`, et les exercices de probabilité conditionnelle).

## Notation

- Une probabilité s'écrit avec un `P` majuscule : `P(B)`, `P_A(B)`,
  `P(A \cap C)`, `P_{\overline A}(B)`. Ne jamais écrire `p(B)` ni `p_A(B)`.
- Les événements sont désignés par une lettre majuscule, éventuellement
  indicée : `A_1`, `S`, `\overline{S}`.
- Dans une phrase, « la probabilité » reste au féminin, mais la notation
  `P(B)` désigne un nombre et son participe s'accorde au masculin :
  « $P(B)$ est égal à : » (et non « la probabilité $P(B)$ est égal »).

## Consignes en saisie libre

Dans une partie non QCM, la dernière phrase demande la valeur de la probabilité
à calculer, sans question de forme « Quelle est la probabilité… ? » :

- en non interactif : « Calculer $P(B)$. » ;
- en interactif : « $P(B)=$ » suivi du champ de saisie, sur la même ligne.

```ts
this.enonceCourt = () =>
  this.enonce.replace(
    /La probabilité de l'événement \$B\$ est: \s*$/,
    this.interactif ? '$P(B)=$' : 'Calculer $P(B)$.',
  )
this.champReponseCourteEnLigne = true
```

Le champ est placé à la suite de la consigne grâce à `champReponseCourteEnLigne`
(voir [Conserver un QCM en option](interactivite-simple.md#conserver-un-qcm-en-option)).

## Saisie de la réponse

- Clavier : `clavierDeBaseAvecFraction` pour une fraction, `clavierNumbers`
  pour un décimal positif.
- Comparaison : par défaut, toute écriture de même valeur est acceptée. Pour
  imposer la forme, `compareReponseCourte` avec `fractionEgale` pour une
  fraction, `nombreDecimalSeulement` pour un nombre.
- Pas de `amcType` (voir [Export AMC](complements/export-amc.md#type-amc-et-saisie-libre)).

Exemples : `src/exercices/1e/1A-P05-1.ts` à `1A-P05-5.ts`, `1A-P04-1.ts` à
`1A-P04-3.ts` (`1A-P04-4` reste un QCM), `1A-P03-1.ts` et `1A-P03-2.ts`.

## Réponse sous forme de notation

Quand la réponse attendue est une notation (`P_E(F)`, `P(E\cap F)`) et non une
valeur, `1A-P06-1` la fait saisir avec un clavier réduit (`clavierEntierementPersonnalisable`
et `dataKeys` : `P`, les lettres des événements de l'énoncé, l'indice, les parenthèses,
`\cap` et `\cup`) et la compare avec `texteAvecCasse` (les majuscules comptent). Pour une intersection, les deux
ordres `P(E\cap F)` et `P(F\cap E)` sont acceptés.
