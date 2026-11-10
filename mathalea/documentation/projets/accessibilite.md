# Accessibilité de MathALÉA

Cette page fait le point sur l'accessibilité de MathALÉA : d'où part le projet,
ce qui a déjà changé pour les élèves et les enseignants, et ce qu'il reste à
faire. Elle s'adresse aux contributeurs, y compris ceux qui découvrent le sujet.

Le **RGAA** (référentiel général d'amélioration de l'accessibilité) est la
méthode française d'évaluation de l'accessibilité d'un site. Sa version 4.1.2
compte 106 critères, cités ici par leur numéro : le critère 10.4, par exemple,
porte sur l'agrandissement du texte. Voir les
[critères officiels](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/).

État de la page : 7 novembre 2026. MathALÉA ne fait l'objet d'aucune déclaration
de conformité, et cette page n'en tient pas lieu.

## Où en est-on

Le point de départ est un audit technique interne du 6 novembre 2026, réalisé
avec un assistant d'IA sur le commit `19ca0d75e4`, juste avant les correctifs
décrits plus bas. Il a parcouru 20 vues avec le RGAA 4.1.2 et ne vaut pas
attestation.

| Résultat                                                    | Critères |
| ----------------------------------------------------------- | -------- |
| Non conformes                                               | 41       |
| Conformes                                                   | 28       |
| Non testés                                                  | 24       |
| Non applicables                                             | 13       |
| **Taux indicatif, conformes / (conformes + non conformes)** | **41 %** |

Ce taux sert de point de départ pour suivre les progrès. Il ne peut pas figurer
dans une déclaration d'accessibilité, pour trois raisons : aucun lecteur d'écran
n'a été utilisé, 24 critères n'ont pas été testés et l'échantillon n'a pas été
validé. Aucun audit n'a été refait depuis les correctifs : **aucun nouveau taux
n'est disponible**.

Les autres limites à garder en tête :

- navigateurs : Chromium, et WebKit pour le clavier. Firefox n'a pas été testé,
  ni aucun appareil mobile réel ;
- périmètre : copie locale du dépôt et non la production. Les vues bêta (quizz,
  évaluation avec scan) n'ont pas été parcourues. La Course aux nombres et le
  diaporama ont surtout été vus sur leur écran de départ ;
- exercices : 6M2B-1 sur toutes les vues, plus 6N3Q, 1G11-2, 6G0-7 et 5N1F-2. Les
  constats portent sur les mécanismes communs, et chaque exercice peut ajouter
  ses propres défauts ;
- documents : aucun PDF généré n'a été ouvert.

<details>
<summary>Détail de l'audit, pour comparer lors de la prochaine mesure</summary>

| Thématique                        | Conformes | Non conformes | Non testés | Non applicables |
| --------------------------------- | --------- | ------------- | ---------- | --------------- |
| 1. Images                         | 1         | 4             | 1          | 3               |
| 2. Cadres                         | 1         | 1             | 0          | 0               |
| 3. Couleurs                       | 0         | 3             | 0          | 0               |
| 4. Multimédia                     | 1         | 0             | 12         | 0               |
| 5. Tableaux                       | 1         | 1             | 5          | 1               |
| 6. Liens                          | 1         | 1             | 0          | 0               |
| 7. Scripts                        | 1         | 3             | 0          | 1               |
| 8. Éléments obligatoires          | 5         | 4             | 0          | 1               |
| 9. Structuration de l'information | 0         | 3             | 0          | 1               |
| 10. Présentation de l'information | 6         | 7             | 1          | 0               |
| 11. Formulaires                   | 2         | 6             | 4          | 1               |
| 12. Navigation                    | 5         | 4             | 0          | 2               |
| 13. Consultation                  | 4         | 4             | 1          | 3               |

Critères non conformes le 6 novembre 2026 : 1.1, 1.2, 1.3, 1.6, 2.2, 3.1, 3.2,
3.3, 5.4, 6.1, 7.1, 7.3, 7.5, 8.2, 8.6, 8.7, 8.9, 9.1, 9.2, 9.3, 10.1, 10.4, 10.8,
10.9, 10.10, 10.11, 10.13, 11.1, 11.2, 11.5, 11.6, 11.9, 11.13, 12.6, 12.7, 12.8,
12.10, 13.3, 13.5, 13.8, 13.10.

Critères non testés : 1.9, 4.1 à 4.9, 4.11 à 4.13, 5.1, 5.2, 5.3, 5.7, 5.8, 10.5,
11.3, 11.8, 11.10, 11.11, 13.1.

Deux faux positifs à ne pas reproduire. Un test envoyant les touches sans aucun
délai simule un piège au clavier dans les champs MathLive : dès 50 ms entre deux
Tab, le focus avance. Un contrôle automatique signale un focus absent sur ces
champs, alors que la bordure est dessinée dans leur shadow DOM et reste visible.

</details>

## Ce qui a été entrepris

Les 6 et 7 novembre 2026, Rémi Angot a livré sur `main` cinq chantiers. Ils
s'attaquent à quatre des six principaux blocages relevés par l'audit, sans tous les
lever : les figures et les annonces pendant la saisie demandent encore du travail.
Les critères cités sont ceux que chaque chantier vise : seule une nouvelle mesure
dira lesquels sont réellement satisfaits. Aucune session avec NVDA, JAWS ou
VoiceOver n'est consignée au 7 novembre 2026.

### Des boutons qui disent ce qu'ils font

Critères visés : 11.9 et, en partie, 7.1. Merge request
[!9982](https://forge.apps.education.fr/coopmaths/mathalea/-/merge_requests/9982),
commit `0b707f40a5`.

L'audit trouvait des boutons sans nom sur 18 vues sur 20 : Diaporama, Impression
ou Lien pour les élèves étaient annoncés comme un simple « bouton ». Les composants
communs (`ButtonIcon`, `ButtonIconTooltip`) reprennent désormais le texte de
l'infobulle comme nom. Le nom suit aussi l'état du bouton : « Activer le mode
sombre », « Masquer la correction ». Et « Augmenter » devient « Augmenter « Nombre
de questions » », ce qui dit enfin quelle valeur change.

### Des champs de réponse qui disent à quoi ils servent

Critères visés : 11.1 et 11.2. Merge request
[!9984](https://forge.apps.education.fr/coopmaths/mathalea/-/merge_requests/9984),
commit `98eeedfc85`.

Tous les champs de réponse s'appelaient « math input field », en anglais et sans
contexte. Chacun reçoit maintenant un nom en français, par exemple « Exercice 2,
question 3 : réponse 2 sur 4 » ou « ligne 2 (Prix), colonne 3 (x) » dans un
tableau. C'est automatique pour les auteurs d'exercices, sans effet sur les sorties
LaTeX, Typst et AMC ni sur les tirages. L'option `nomAccessible` permet de préciser
davantage. Détails dans
[Nom accessible des champs de réponse](../developpement/maintenance-moteur/interactivite/systeme-interactivite.md#nom-accessible-des-champs-de-réponse).

### Un repère clavier sur tous les boutons

Critère concerné : 10.7. Merge request
[!9999](https://forge.apps.education.fr/coopmaths/mathalea/-/merge_requests/9999),
commit `884af083dc`.

Un élève qui navigue au clavier voit où il se trouve, y compris sur « Vérifier » :
`src/app.css` impose à tous les boutons natifs un contour net, en thème clair, en
thème sombre et en couleurs forcées, même si leur style retire le contour par
défaut. La procédure de contrôle est décrite dans
[Navigation au clavier](../tests/navigation-clavier.md).

### Le glisser-déposer sans glisser

Critères visés : 7.3 et 13.10. Merge request
[!10001](https://forge.apps.education.fr/coopmaths/mathalea/-/merge_requests/10001),
commit `292afd4d00`.

Certains exercices étaient impossibles sans souris ou écran tactile. Il suffit
maintenant de sélectionner une étiquette, puis d'activer la zone où la déposer, au
clavier ou par un simple clic ou tap. Ce parcours aide donc aussi les élèves qui
ont du mal à faire un geste précis. Suppr retire une étiquette et les changements
sont annoncés aux lecteurs d'écran. Sept exercices ont reçu des noms de zones
compréhensibles : 3C10-4, 5N1F-2, 5N2F-1, 6N0A-6, 6N0A-10, 6N3I-5 et CM2N1D-1. Les
archives `5N1F-2-old` et `6N0A-6Old` héritent du mécanisme, sans ces noms. Code :
`src/lib/interactif/dragAndDropAccessible.ts`.

### Des figures qu'on peut décrire

Critères visés : 1.1 et 1.6. Merge request
[!10002](https://forge.apps.education.fr/coopmaths/mathalea/-/merge_requests/10002),
commit `f850a6dfb6`.

Pour un élève aveugle, 6M2B-1 se réduisait à une image vide suivie de longueurs
sans lien avec les côtés. `mathalea2d` accepte désormais une `description`, qui
remplace le tracé pour un lecteur d'écran, ou `decorative: true`. Les champs placés
dans la figure restent atteignables. Dans 6M2B-1, l'élève reçoit les dimensions,
jamais l'aire demandée. Dans 6G0-7, décrire la position des points donnerait la
réponse : la description présente la tâche et l'exercice déclare qu'il demande la
vue (`demandeLaVue`).

Ces deux exercices sont les seuls migrés, avec le modèle
`src/exercices/modèlesExos/25_figure_accessible.ts`. **Le stock existant n'est pas
traité** : voir la [feuille de route](#feuille-de-route).

### Des boutons pour agrandir le contenu

Avant l'audit, MathALÉA proposait déjà « Réduire la taille du texte » et
« Augmenter la taille du texte ». Un élève ou un enseignant peut ainsi agrandir un
exercice sans geste particulier, à la souris, au doigt ou au clavier, car ce sont
des boutons natifs et nommés. Chaque action change la taille de 10 %, et le réglage
reste dans l'URL (paramètre `z`).

`resizeContent()` (`src/lib/components/sizeTools.ts`) adapte le texte, les figures
`mathalea2d`, les blocs Scratch, les cases de QCM et les schémas en boîte. Les images
des exercices statiques suivent jusqu'à la largeur de leur conteneur, et le clavier
virtuel suit aussi. Ce travail continue d'être affiné : cases de QCM (`333a5c0eb4`),
images statiques (`14ed03034e`), labyrinthe (`38d72dc5dd`).

Ces boutons sont présents en vue élève (`btnZoom.svelte`), dans l'en-tête de la vue
prof sur grand écran et dans l'aperçu du diaporama (`ZoomButtons.svelte`), ainsi que
dans la barre Capytale.

Leur portée a des limites. En vue prof, ils agissent sur les exercices, ni sur
l'en-tête ni sur le menu. Ils sont absents de la vue mobile de conception
(`MobileView.svelte`) et de la Course aux nombres, qui applique toutefois un `z` reçu
par lien. L'audit ne les évalue pas et rien n'établit qu'ils satisfont le critère
10.4 : voir la [décision en cours](#décision-en-cours-sur-le-zoom-mobile).

### Autres améliorations

Ces corrections plus ciblées vont dans le même sens :

- contraste des listes déroulantes (`c2e0da3a55`) et des tableaux de variations en
  mode sombre (`49952f3a33`) ;
- respect du réglage « réduire les animations » (`prefers-reduced-motion`) dans le
  format « relier des étiquettes » (`95ea4c7ab1`) et la vue TBI (`f2a78399fa`).

## Ce qui fonctionnait déjà

L'audit du 6 novembre 2026 a aussi constaté des acquis, sur son échantillon :

- les formules KaTeX exposent du MathML aux technologies d'assistance ;
- aucun `tabindex` positif sur les 20 vues ;
- Tab traverse les champs MathLive jusqu'à « Vérifier la réponse », sans piège ;
- le focus est visible sur les éléments testés, champs de réponse compris ;
- l'espacement augmenté ne coupe pas de nouveau texte, et l'accueil se réorganise à
  320 px de large ;
- le panneau de paramètres nomme ses cases et ses boutons de poids ;
- 32 composants utilisent déjà `role="status"`, `role="alert"` ou `aria-live` ;
- Échap ferme la visite guidée et la modale d'ajout.

## Feuille de route

**Impact**, pour les personnes concernées :

- **Fort** : lève un blocage ou une forte gêne sur un parcours courant (consulter,
  naviguer, répondre, connaître son résultat) ;
- **Moyen** : gêne réelle mais contournable, limitée à une vue ou à un groupe
  d'exercices, ou prévention des régressions ;
- **Faible** : défaut isolé, sans conséquence sur le parcours.

**Difficulté**, pour l'équipe :

- **Faible** : moins d'un jour, localisé, sans décision à prendre ;
- **Moyenne** : plusieurs jours, composant partagé ou décision d'équipe ;
- **Élevée** : plusieurs semaines, stock d'exercices ou dépendance extérieure.

Ces évaluations sont des **estimations, à confirmer par l'équipe**. Le tableau est
trié par impact décroissant, puis par difficulté croissante : les premières lignes
sont les plus rentables. L'état est celui du 7 novembre 2026.

| Mesure | Public bénéficiaire | Impact | Difficulté | Critères RGAA | État | Où |
| --- | --- | --- | --- | --- | --- | --- |
| Choisir comment agrandir sur mobile : a) rendre le pincement possible ; b) faire des boutons + et - le mécanisme officiel. Voir la [décision en cours](#décision-en-cours-sur-le-zoom-mobile) | Personnes malvoyantes sur téléphone ou tablette | Fort (a), Moyen (b) | Faible (a), Moyenne (b) | 10.4 | Décision en cours | `index.html`, `Start.svelte`, `btnZoom.svelte`, `ZoomButtons.svelte`, `sizeTools.ts` |
| Menu et modale : `aria-expanded` sur les niveaux, focus retenu dans la modale d'ajout puis rendu au bouton d'origine | Lecteur d'écran, clavier | Fort | Faible | 7.1, 12.8 | À faire | `ReferentielNode.svelte`, `TypstAddExerciseModal.svelte` ; modèle : `BasicClassicModal.svelte` |
| Annoncer le résultat dans les vérificateurs communs : texte à la place de l'émoji seul, score dans un `role="status"`, focus conservé après la vérification | Élèves au lecteur d'écran | Fort | Moyenne | 7.5, 13.5 | À faire | `mathLiveVerifications.ts`, `qcm.ts`, `ExerciceMathaleaVueProf.svelte`, `ExerciceMathaleaVueEleve.svelte` |
| Lien d'évitement et zones : `main` sur les vues élève, Course aux nombres et écran de départ du diaporama, `nav` distinguées par un nom. Il faut aujourd'hui 20 tabulations pour atteindre la recherche en vue prof | Clavier, lecteur d'écran | Fort | Moyenne | 9.2, 12.6, 12.7 | À faire | `App.svelte`, `SetupShell.svelte`, vues concernées |
| Couleurs : l'orange d'action `#f15929` donne 3,39:1 sur blanc pour 4,5:1 attendus, sur 17 vues sur 20. Pistes : `#c93a0d` (4,75:1 sur `#f6f6f6`) et `#8a8a8a` (3,45:1) pour les bordures de champ | Personnes malvoyantes, vidéoprojection | Fort | Moyenne | 3.2, 3.3 | Décision à prendre : touche l'identité du site | `src/app.css` (variables, `math-field`), bouton de `ExerciceMathaleaVueEleve.svelte` |
| Tests réels avec NVDA, JAWS et VoiceOver, puis Firefox et mobile réel | Tous : oriente les priorités suivantes | Fort | Moyenne | Tous, dont 12.9 | À organiser | [Navigation au clavier](../tests/navigation-clavier.md) |
| Auditer les autres formats interactifs. Aucun `tabindex` ni gestion du clavier dans les points cliquables, les objets cliquables et l'horloge ; les autres formats restent à essayer | Personnes sans souris | Fort | Moyenne | 7.3, 13.10 | À auditer. Modèle : le glisser-déposer | `PointsCliquablesElement.ts`, `ObjetsCliquablesElement.ts`, `InteractiveClock.ts` |
| Figures du stock : environ 1 880 appels à `mathalea2d` dans 830 fichiers, hors archives. Traiter d'abord les plus utilisés, avec une stratégie et probablement une dérogation déclarée pour le reste. `demandeLaVue` est déclaré, mais rien ne le lit encore | Élèves aveugles ou malvoyants | Fort | Élevée | 1.1, 1.6, 13.5 | Moteur et règles livrés, 2 exercices migrés, stock à traiter | `src/exercices/` |
| Annonces de MathLive en anglais pendant la saisie (« start of prompt », « end of mathfield », « squared ») : signaler au projet, essayer `textToSpeechRules = 'sre'` (le moteur SRE doit être chargé à part), ou accepter et déclarer | Élèves au lecteur d'écran | Fort | Élevée | 8.7 | À instruire : dépend d'un projet extérieur | `setMathfield.ts`, projet MathLive |
| Test informatif `pnpm a11y:check`, sans axe-core : chaque figure d'un exercice modifié a une `description` ou `decorative: true` | Contributeurs, puis élèves | Moyen | Faible | 1.1, 1.6 | En cours, pas livré. Prérequis livré : l'option `description` | Modèle : `corrections:check`. Voir la note ci-dessous |
| Lever les petits défauts isolés | Variable | Moyen | Faible | Voir la liste ci-dessous | À faire | Voir la liste ci-dessous |
| Titres et listes : titre de page propre à chaque vue (14 vues sur 20 gardent celui de l'accueil), un seul `h1` (absent sur 13 vues), `li` directement dans leur `ul`, identifiants uniques | Lecteur d'écran | Moyen | Moyenne | 8.2, 8.6, 8.9, 9.1, 9.3 | À faire. 7 composants posent déjà leur titre | Vues de `src/components/`, `numbered-list` |
| Revue des exclusions : 70 `svelte-ignore a11y`, dont 17 sur `autofocus`, et 37 `focus:outline-none` dans `src/components`, surtout hors boutons | Clavier, lecteur d'écran | Moyen | Moyenne | 10.7 et selon les cas | À faire | `src/components/`, `src/lib/` |
| Limites de temps : la Course aux nombres et le quizz imposent un temps que l'élève ne peut ni suspendre ni prolonger. Une limite essentielle peut être admise, mais la question du tiers-temps se pose | Élèves bénéficiant d'un temps majoré | Moyen | Moyenne | 13.1 | À arbitrer | Vues CAN et quizz |
| Nouvelle mesure du taux, y compris les 24 critères non testés, puis déclaration d'accessibilité. L'obligation légale applicable à MathALÉA reste à vérifier | Tous, établissements | Moyen | Moyenne | Tous | À planifier après les correctifs | Hors code |
| Étendre l'annonce du résultat aux formats personnalisés et aux exercices qui écrivent leur émoji : 42 fichiers de `src/lib`, 65 de `src/exercices` | Élèves au lecteur d'écran | Moyen | Élevée | 7.5, 13.5 | À faire, après les vérificateurs communs | `src/lib/customElements/`, `src/exercices/` |
| Exercices publiés qui désignent un élément par sa seule couleur : 129 fichiers à trier selon l'audit. La règle existe déjà pour les nouveaux exercices | Personnes malvoyantes ou daltoniennes, impression en noir et blanc | Moyen | Élevée | 3.1 | À faire | `src/exercices/` |
| PDF balisés : les préambules LaTeX générés ne contiennent aucun balisage, et la sortie Typst reste à contrôler | Lecteur d'écran sur les documents | Moyen | Élevée | 13.3 | À instruire | Exports LaTeX et Typst |

**Note sur `pnpm a11y:check`.** Le modèle `corrections:check` fonctionne avec jsdom,
3 graines et `CHANGED_FILES`, sans navigateur : voir
[Contrôler les corrections minimales](../tests/corrections-minimales.md). Attention :
le job `testExosModifiedConsolidated` n'admet pas d'échec (`allow_failure: false`)
et chaque sous-test compte dans son bilan. Pour rester informatif, le contrôle ne
doit pas compter dans ce bilan ou doit vivre dans un job avec `allow_failure: true`.

### Décision en cours sur le zoom mobile

Au 7 novembre 2026, le pincement reste bloqué sur `main` par le `viewport` de
`index.html` et par l'annulation de `gesturestart` dans `Start.svelte`. L'audit a
classé le critère 10.4 non conforme pour cette raison. Rémi Angot hésite à rétablir
le pincement : il craint des zooms involontaires au double tap pour les élèves et
préfère les [boutons + et -](#des-boutons-pour-agrandir-le-contenu). Aucune voie
n'est retenue à ce stade.

| Voie | Ce qu'elle apporte | Ce qu'il reste à faire | Impact | Difficulté |
| --- | --- | --- | --- | --- |
| a) Rendre le pincement possible en laissant le double tap désactivé | Agrandit toute la page, interface comprise, sur toutes les vues | Tester sur un vrai appareil le correctif local, non commité, de la branche `remi/retablir-zoom-mobile`. Il garde la classe `touch-manipulation` du `body`, censée désactiver le double tap, et laisse passer le pincement sur le glisser-déposer. Vérifier aussi les zones où `touch-action` reste restreint (étiquettes, « relier des étiquettes ») | Fort | Faible |
| b) Faire des boutons + et - le mécanisme officiel | Écarte le zoom involontaire et conserve le réglage dans l'URL, mais seul le contenu des exercices est agrandi | Étendre si besoin aux vues sans boutons (vue mobile de conception, Course aux nombres) et à l'interface. Le blocage du navigateur resterait en place : il faudrait évaluer si les boutons suffisent au critère 10.4, ce que rien n'a établi | Moyen | Moyenne |

Les boutons restent disponibles dans les deux cas : la voie a) ne les retire pas.

### Petits défauts isolés

Chacun peut faire l'objet d'une petite contribution indépendante. Une bonne porte
d'entrée pour découvrir le sujet.

| Défaut | Critères | Où |
| --- | --- | --- |
| La graine, écrite en quasi-blanc dans le titre, est lue par les lecteurs d'écran : ajouter `aria-hidden` | 10.8 | `HeaderExerciceVueEleve.svelte` |
| La recherche n'a que son placeholder animé comme nom : lui donner une étiquette | 11.1, 11.2 | `SearchInput.svelte` |
| Les couples Oui/Non des QCM et les cases « Types de figure » ne sont ni regroupés ni légendés | 11.5, 11.6 | `qcm.ts`, panneau de paramètres |
| Les infobulles restent affichées après Échap et ne peuvent pas être survolées | 10.13 | `ButtonIconTooltip.svelte` |
| Le carrousel de la vue LaTeX change d'image toutes les 3 s, sans pause | 13.8 | `ImageCarousel.svelte` |
| `title="output"` sur les iframes de compilation, et pas de titre dans le code d'intégration proposé aux enseignants | 2.2 | `ButtonCompileLatexToPDF.svelte`, `ConfigEleve.svelte` |
| Les 5 composants à tableau n'ont ni `caption` ni nom sur le tableau | 5.4 | Composants OMR, classes, quizz, diaporama |
| Balise `center` | 10.1 | `Moodle.svelte` |
| La vue AMC déborde à 320 px et son bouton de fermeture sort de l'écran | 10.11 | Vue AMC |
| `role="tab"` hors de tout `tablist` dans la pagination de la Course aux nombres | 7.1 | `Pagination.svelte` |
| Les touches `+` et `-` du diaporama ne peuvent être ni désactivées ni modifiées | 12.10 | `SlideshowPlay.svelte` |
| Champ e-mail du quizz en `autocomplete="on"` au lieu de `email` | 11.13 | `QuizzMultiManager.svelte` |
| « Close » en anglais dans la visite guidée : driver.js propose l'option `closeBtnLabel` | 8.7 | `src/lib/onboarding/tour.ts` |
| Les images décoratives du cube de chargement portent un `alt` (« face coop ») | 1.2 | `index.html` |
| Noms sans rapport avec la fonction : « Logo Coopmaths 2 » sur le lien des mentions légales, « enveloppe » sur le lien de contact, « Coopmaths image-1 » dans le carrousel | 1.3, 6.1 | `Footer.svelte`, `Footer2.svelte`, `Latex.svelte`, `Pdf.svelte` |
| L'accueil indique « Choisissez un niveau à gauche » selon l'audit : une position seule, fausse sur mobile. Texte à retrouver, il n'a pas été localisé dans `src/components` | 10.9, 10.10 | À localiser |

## Ce qui protège des régressions

**Règles pour les nouveaux exercices.** La section
[Accessibilité du guide de rédaction](../developpement/auteurs-exercices/rediger-un-exercice.md#accessibilité)
fait référence. Elle est relayée par `AGENTS.md`, le skill `nouvel-exercice` et la
[liste de validation d'un exercice](../developpement/auteurs-exercices/valider-un-exercice.md).

**Tests automatiques en place** :

- `tests/unit/mathalea2dAccessibilite.test.ts` : description et figure décorative ;
- `src/lib/interactif/nomAccessibleChamp.test.ts` et `questionMathLive.test.ts` :
  noms des champs de réponse ;
- `tests/unit/dragAndDropAccessible.test.ts` et, en navigateur,
  `tests/e2e/tests/interactivity/dragAndDrop.accessible.test.ts` : glisser-déposer.

**Suivi périodique** : le [rapport axe-core sur 20 vues](../tests/rapport-accessibilite.md)
suit les défauts détectés par règle et par vue. Il informe sans rien bloquer et ne donne
aucun taux RGAA.

**Contrôle manuel** : [Navigation au clavier](../tests/navigation-clavier.md).

**Ce qui manque encore.** Rien ne vérifie automatiquement qu'une nouvelle figure
porte sa description : c'est l'objet de `pnpm a11y:check`, en cours. Aucun test ne
couvre les noms des boutons d'icône dans leur ensemble ni le contour de focus des
boutons.

## Tenir cette page à jour

Quand une mesure est livrée, la déplacer dans « Ce qui a été entrepris » avec sa
référence et son bénéfice concret. Dater chaque nouveau constat, recompter les
chiffres cités et n'annoncer un taux qu'après une nouvelle mesure complète.
