# Signalement de bug sur un exercice

Un bouton « bug » permet à n'importe quel utilisateur de signaler un problème
sur l'exercice affiché, avec un texte de signalement déjà rempli.

## Où le bouton apparaît

| Vue | Composant | Emplacement dans la barre d'actions |
| --- | --- | --- |
| Vue prof (bureau) | [`HeaderExerciceVueProf.svelte`](../../../../src/components/shared/exercice/shared/headerExerciceVueProf/HeaderExerciceVueProf.svelte) | icône `bx-bug`, juste avant les boutons monter/descendre |
| Vue prof (mobile) | idem, menu plein écran | dernière entrée du menu |
| Vue élève, tous les exercices sur la même page | [`ExerciceVueEleveButtons.svelte`](../../../../src/components/shared/exercice/exerciceMathalea/exerciceMathaleaVueEleve/presentationalComponents/ExerciceVueEleveButtons.svelte) | icône seule, sans cadre, juste avant le réglage du nombre de colonnes |
| Vue élève, un exercice par page | idem (même composant, `presMode = 'un_exo_par_page'`) | idem |

Les deux vues élève partagent le même composant de boutons, il n'y a donc qu'un
seul point d'insertion à maintenir pour elles.

## Modale

[`BugReportModal.svelte`](../../../../src/components/shared/exercice/shared/BugReportModal.svelte)
(écrit avec les runes Svelte 5) affiche :

1. un message qui encourage au signalement ;
2. le choix du canal :
   - **par mail** vers `contact@coopmaths.fr`, ouvert à tous (élèves, parents,
     enseignants) ;
   - **sur la forge**, création d'une issue pré-remplie, qui suppose d'être
     connecté avec un compte académique ou un compte de la forge ;
3. le titre et la description, modifiables, avec un bouton de copie pour les
   utilisateurs qui préfèrent coller le texte ailleurs.

Le contexte est recalculé à chaque ouverture, car l'URL contient l'alea de
l'énoncé affiché. Les deux appelants encadrent la modale d'un `{#if}`, ce qui la
démonte à la fermeture.

## Construction du texte

[`src/lib/components/bugReport.ts`](../../../../src/lib/components/bugReport.ts)
produit le titre et la description ; il est couvert par
`src/lib/components/bugReport.test.ts`.

- titre : `Bug dans l'exercice <référence> : <titre>`, avec repli si l'un des
  deux manque ;
- description en markdown : section « Description du problème » à compléter,
  puis un bloc « Contexte » avec l'URL, la référence de l'exercice, le
  navigateur, le système et la date ;
- navigateur et système sont déduits de `navigator.userAgent` (`detectBrowser`
  teste les navigateurs dérivés de Chromium avant `Chrome`, et `detectOs` teste
  Android et iPadOS avant Linux et macOS) ;
- `buildMailtoUrl` ré-encode les espaces en `%20`, car les clients mail
  n'interprètent pas le `+` produit par `URLSearchParams` ;
- `buildForgeIssueUrl` utilise les paramètres GitLab `issue[title]` et
  `issue[description]` sur
  `https://forge.apps.education.fr/coopmaths/mathalea/-/issues/new`.
