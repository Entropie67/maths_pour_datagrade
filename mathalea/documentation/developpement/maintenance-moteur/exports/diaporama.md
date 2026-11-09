# Vue Diaporama

La vue Diaporama (`v=diaporama` dans l'URL) projette les questions une par une, avec un décompte par diapositive. Tout est sous `src/components/setup/diaporama/`.

## Composants

- `Diaporama.svelte` — orchestrateur : charge les exercices, construit les diapositives, maintient l'URL ;
- `slideshowSettings/` — écran de réglages (durées, nombres de questions, transitions, ordre, sélection) ;
- `slideshowPlay/` — lecture du diaporama (décompte, corrections, zoom, raccourcis clavier) ;
- `slideshowOverview/` — aperçu imprimable de la série et tableau des réponses (`answersTable.ts`).

## Construction des diapositives

`setSlidesContent()` appelle `reroll()` sur chaque exercice puis découpe `listeQuestions` en diapositives, une par question et par vue (`nbVues`, jusqu'à 4 vues obtenues en dérivant la graine).

Les exercices statiques (annales et banques externes, dont FFJM) sont chargés avec `buildExercise()` : leurs images d'énoncé et de correction alimentent `listeQuestions` et `listeCorrections`. Ils donnent une seule question, dont le nombre n'est pas modifiable, et `reroll()` conserve leurs images telles quelles. Le diaporama remplace le marqueur `{zoomFactor}` de leurs balises d'image par `1` avant le rendu.

Deux invariants à respecter dans cette fonction :

- **elle peut être rejouée pendant la lecture.** `Diaporama.svelte` écoute l'événement `updateAsyncEx` : un exercice qui charge ses modules en tâche de fond (voir plus bas) le déclenche quand son contenu réel remplace les `« chargement... »`. La question courante (`slideshow.currentQuestion`) doit donc être conservée, sinon le diaporama revient aux réglages en pleine séance ;
- **le nombre de questions vient de l'exercice**, pas des réglages : `nbQuestions` est relu après chaque génération.

## Exercices dont le nombre de questions n'est connu qu'après génération

Les exercices « Sélection d'automatismes » (`1A`, `3A`, construits par [`_automatismesCan.ts`](../../../../src/exercices/_automatismesCan.ts)) tirent leurs questions par catégorie : leur `nbQuestions` vaut 0 tant que `nouvelleVersion()` n'a pas été appelée. `Diaporama.svelte` génère donc une première fois, au montage, les exercices dont `nbQuestions` est nul, faute de quoi l'écran de réglages annonce 0 question.

Ces exercices posent aussi `nbQuestionsModifiable = false` : le champ « Nombres de questions » des réglages est désactivé quand cette propriété vaut `false`, puisque la valeur saisie serait écrasée à la génération suivante. Le nombre de questions se règle par le formulaire de catégories de l'exercice, dont les maximums sont bornés par le nombre d'exercices réellement disponibles dans chaque catégorie.

## Enchaînement des diapositives

`$globalOptions.flow` décrit l'alternance :

| Valeur | Enchaînement |
| --- | --- |
| `0` | `Q->Q` — questions seules |
| `1` | `Q->R->Q` — la correction remplace la question |
| `2` | `Q->(Q+R)->Q` — la correction s'ajoute sous la question |

Dans les modes `1` et `2`, la correction est une diapositive à part entière : elle a son propre décompte et l'enchaînement se poursuit tout seul. Ce décompte dure autant que la question, sauf si `$globalOptions.durationCorrection` est défini (réglage « Durée d'affichage de la correction », paramètre d'URL `dCorr`, en secondes). Seuls le défilement manuel (`manualMode`) et l'option « Avec une pause après chaque question » (`pauseAfterEachQuestion`) mettent le diaporama en pause.

Le décompte est porté par `ratioTime` (0 à 100) et `startTimer()` dans `SlideshowPlay.svelte` ; `nextQuestion()` est la seule porte de sortie d'une diapositive, qu'elle soit déclenchée par le décompte, par la flèche droite ou par le bouton suivant.

## Tableau des réponses

`SlideshowOverviewAnswersTable.svelte` affiche, pour chaque question, dans l'ordre :

1. les lettres des bonnes propositions si la question est un QCM (`extraitLettresQcm`, lues dans `autoCorrection[i].propositions`) ;
2. la réponse explicite `listeReponsesCourtes[i]`, si elle est renseignée ; sinon les réponses mises en évidence en orange dans la correction (`extraitReponsesCourtes`), repérées par `reponsesMisesEnEvidence` comme pour la [correction minimale Typst](typst.md#correction-minimale) : `miseEnEvidence()` dans une formule et `texteEnCouleurEtGras()` hors formule. Pour un QCM, les textes orange sont ignorés : ce sont les lettres déjà affichées. Plusieurs réponses (typiquement `remplisLesBlancs`) font afficher la correction entière, plus lisible que des valeurs isolées (`doitAfficherFormuleComplete`) ;
3. sinon, une **miniature** de la correction complète, SVG compris, calée sur sa fin (là où se trouve en général la réponse : figure, tableau de signes, construction). Un clic l'ouvre en grand dans une modale.

Une question sans correction affiche « – ». `reponseCourteDisponible = false`
ou `listeReponsesCourtes[i] = null` impose la miniature pour une question sans
lettres de QCM, même si la correction contient des étapes orange. Les réglages
signalent les exercices pour lesquels la miniature sera utilisée. Voir le
[contrat auteur](../../auteurs-exercices/rediger-un-exercice.md#réponse-courte-et-correction-minimale).

Côté exercice, une réponse n'est donc reprise que si elle est en orange : les étapes intermédiaires ou les commentaires de la correction détaillée doivent être mis en évidence dans une autre couleur (`bleuMathalea`), sinon ils apparaissent comme réponses dans le tableau et dans la correction minimale.

## Passerelles vers les exports PDF

L'écran de réglages propose deux sorties PDF, à côté du bouton « Play » :

- `goToTypstWithSeries()` ouvre la [vue Typst](typst.md) avec autant de séries
  que de vues du diaporama (sujets + corrigés à imprimer) ;
- l'icône diaporama ouvre la [vue Diaporama PDF](diaporama-pdf.md)
  (`$globalOptions.v = 'slides'`) : une question en grand par page, au format
  d'un écran.

Tests : `tests/unit/automatismesCan.test.ts`, `tests/unit/diaporamaAnswersTable.test.ts`.
