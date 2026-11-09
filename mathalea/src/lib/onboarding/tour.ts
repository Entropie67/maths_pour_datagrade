import { driver } from 'driver.js'
import { get } from 'svelte/store'
import 'driver.js/dist/driver.css'
import './tour.css'
import { darkMode, exercicesParams } from '../stores/generalStore'
import type { InterfaceParams } from '../types'

const TOUR_SEEN_KEY = 'mathalea-onboarding-tour-vue'
const DEMO_EXERCISE_ID = '3L11'
const DEMO_EXERCISE_2_ID = '4G20'

let originalExercicesParams: InterfaceParams[] | null = null
let demoExerciseIndex = -1
let demo4G20Added = false

/**
 * Verrou anti-double-clic&nbsp;: un `onNextClick`/`onPrevClick` rejoue une
 * action sur la page (saisie, clic…) puis fait avancer/reculer driver.js
 * après un court délai (cf. `moveNextAfterRender`). Pendant ce délai, le
 * bouton reste cliquable côté driver.js&nbsp;; un double-clic (fréquent sur
 * Firefox où le rendu est perçu comme plus lent) rejouerait alors l'action et
 * ferait avancer/reculer la visite deux fois d'affilée. Ce verrou ignore les
 * clics reçus pendant qu'une transition est déjà en cours.
 */
let navLock = false

function withNavGuard(action: () => void): void {
  if (navLock) return
  navLock = true
  action()
}

/**
 * `true` si la visite guidée a déjà été vue sur ce poste (localStorage).
 */
export function hasSeenTour(): boolean {
  try {
    return window.localStorage.getItem(TOUR_SEEN_KEY) === '1'
  } catch {
    // Stockage indisponible (navigation privée, quota…) : on considère
    // qu'elle a été vue pour ne pas ré-afficher la visite à chaque page.
    return true
  }
}

export function markTourSeen(): void {
  try {
    window.localStorage.setItem(TOUR_SEEN_KEY, '1')
  } catch {
    // Stockage indisponible : rien à faire
  }
}

function fillInput(input: HTMLInputElement, value: string): void {
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

/**
 * Coche ou décoche une case du panneau de paramètres comme le ferait l'enseignant.
 * Ces cases réagissent à `change` et non à `input` ; on ne notifie rien quand la
 * case est déjà dans l'état voulu, pour ne pas régénérer l'exercice inutilement.
 */
function setCheckbox(selecteur: string, coche: boolean): void {
  const input = document.querySelector<HTMLInputElement>(selecteur)
  if (input === null || input.checked === coche) return
  input.checked = coche
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

/**
 * Porte le poids d'apparition d'un cas du panneau de paramètres à
 * `poidsCible`. Le poids ne se règle plus par un champ numérique mais avec un
 * bouton « + » (cf `ListePondereeItems.svelte`) ; chaque clic n'est répercuté
 * qu'au cycle de rendu Svelte suivant, donc on relit le poids réellement
 * affiché avant chaque nouveau clic, puis on appelle `apres` une fois la
 * cible atteinte.
 */
function augmentePoidsCase(
  selecteurCase: string,
  poidsCible: number,
  apres: () => void,
): void {
  const ligne = document
    .querySelector<HTMLInputElement>(selecteurCase)
    ?.closest('div')
  const poidsAffiche = Number(
    document.querySelector(`${selecteurCase}-poids`)?.textContent ?? '0',
  )
  if (ligne == null || poidsAffiche >= poidsCible) {
    apres()
    return
  }
  ligne
    .querySelector<HTMLButtonElement>('button[aria-label^="Augmenter le poids"]')
    ?.click()
  setTimeout(() => augmentePoidsCase(selecteurCase, poidsCible, apres), 30)
}

/**
 * Laisse Svelte terminer son cycle de rendu (déclenché par l'action qui
 * vient de s'exécuter — saisie, clic sur un nœud du référentiel…) avant de
 * faire avancer la visite : driver.js capture l'élément cible de l'étape
 * suivante de façon synchrone, ce qui peut le faire pointer sur un nœud que
 * Svelte remplace juste après si on ne lui laisse pas ce délai.
 */
function moveNextAfterRender(driverObj: { moveNext: () => void }): void {
  setTimeout(() => {
    driverObj.moveNext()
    navLock = false
  }, 50)
}

function movePreviousAfterRender(driverObj: { movePrevious: () => void }): void {
  setTimeout(() => {
    driverObj.movePrevious()
    navLock = false
  }, 50)
}

function restoreExercicesParams(): void {
  if (originalExercicesParams !== null) {
    exercicesParams.set(originalExercicesParams)
    originalExercicesParams = null
  }
}

/**
 * Étape 2 → 3 : simule la saisie de « 3L11 » dans le champ de recherche.
 */
function playSearchDemo(): void {
  const input = document.querySelector<HTMLInputElement>(
    '[data-tour="search-input"]',
  )
  if (input) fillInput(input, DEMO_EXERCISE_ID)
}

function clearSearchInput(): void {
  const input = document.querySelector<HTMLInputElement>(
    '[data-tour="search-input"]',
  )
  if (input) fillInput(input, '')
}

/**
 * Étape 3 → 4 : simule le clic sur le résultat « 3L11 » pour l'ajouter à la
 * feuille d'exercices. On mémorise l'index qu'aura ce nouvel exercice dans
 * `exercicesParams` (toujours ajouté en fin de liste) pour cibler ensuite
 * son panneau de paramètres.
 */
function playAddExerciseDemo(): void {
  demoExerciseIndex = get(exercicesParams).length
  const button = document.querySelector<HTMLButtonElement>(
    `[data-tour-id="${DEMO_EXERCISE_ID}"] button`,
  )
  button?.click()
}

/**
 * Étape 4 → 3 (Précédent)&nbsp;: retire l'exercice de démonstration ajouté
 * par `playAddExerciseDemo`, pour permettre un aller-retour sans dupliquer
 * l'exercice dans la feuille.
 */
function undoAddExerciseDemo(): void {
  if (demoExerciseIndex < 0) return
  const index = demoExerciseIndex
  exercicesParams.update((list) => list.filter((_, i) => i !== index))
  demoExerciseIndex = -1
}

/**
 * Étape 5 → 6 : règle le nombre de questions à 4, puis coche la première forme
 * de développement avec un poids de 3 et la deuxième avec un poids de 1, pour
 * illustrer concrètement le mécanisme (3 questions sous la forme 1, 1 question
 * sous la forme 2). Le réglage du poids passe par des clics successifs sur le
 * bouton « + » (asynchrones), d'où le `apres` appelé une fois le poids 3
 * atteint.
 */
function playFormeDeveloppementDemo(apres: () => void): void {
  const nbQuestionsInput = document.querySelector<HTMLInputElement>(
    `#settings-nb-questions-${demoExerciseIndex}`,
  )
  if (nbQuestionsInput) fillInput(nbQuestionsInput, '4')
  const liste = `#settings-formTextListe3-${demoExerciseIndex}`
  // 3L11 arrive réglé sur « Mélange », donc toutes les formes cochées : on ne
  // garde que les deux premières.
  for (const forme of [3, 4, 5, 6]) setCheckbox(`${liste}-${forme}`, false)
  setCheckbox(`${liste}-1`, true)
  setCheckbox(`${liste}-2`, true)
  // Cocher la case pose le poids à 1 ; on clique « + » jusqu'à 3.
  augmentePoidsCase(`${liste}-1`, 3, apres)
}

/**
 * Cherche, parmi les boutons de nœuds du référentiel (menu de gauche —
 * niveaux, chapitres…), celui dont le libellé contient `text`. Ces boutons
 * portent un id `titre-liste-…` généré dynamiquement (position dans l'arbre,
 * dépend du tri courant) : on ne peut donc pas les cibler par id, mais leur
 * propre texte (hors enfants, rendus dans un `<ul>` frère) suffit.
 */
function findNodeButtonByText(text: string): Element | null {
  const buttons = document.querySelectorAll<HTMLButtonElement>(
    'button[id^="titre-liste-"]',
  )
  for (const button of buttons) {
    if (button.textContent?.includes(text)) return button
  }
  return null
}

/**
 * `true` si le nœud porté par `button` est actuellement déplié (son
 * conteneur d'enfants contient une liste `<ul>` — rendue uniquement quand
 * `unfold` est vrai côté `ReferentielNode.svelte`).
 */
function isNodeUnfolded(button: HTMLButtonElement): boolean {
  const wrapper = button.parentElement?.lastElementChild
  return wrapper?.querySelector('ul') != null
}

function clickNodeByText(text: string): void {
  const button = findNodeButtonByText(text)
  // Un clic sur ce bouton bascule le pli/dépli du nœud : si la visite
  // rejoue cette action après un aller-retour Précédent/Suivant sur un nœud
  // déjà ouvert, un clic non gardé le refermerait.
  if (button instanceof HTMLButtonElement && !isNodeUnfolded(button)) {
    button.click()
  }
}

/**
 * Étape « 4G20 » : simule le clic sur l'exercice pour l'ajouter, une fois le
 * niveau « Quatrième » puis le chapitre « Théorème de Pythagore » dépliés.
 */
function playChoisirExerciceParNiveauDemo(): void {
  demo4G20Added = true
  const button = document.querySelector<HTMLButtonElement>(
    `[data-tour-id="${DEMO_EXERCISE_2_ID}"] button`,
  )
  button?.click()
}

/**
 * Étape « raccourci Ctrl+K » → 4G20 (Précédent)&nbsp;: retire l'exercice de
 * démonstration ajouté par `playChoisirExerciceParNiveauDemo` (toujours en
 * fin de liste), pour permettre un aller-retour sans le dupliquer.
 */
function undoChoisirExerciceParNiveauDemo(): void {
  if (!demo4G20Added) return
  exercicesParams.update((list) => list.slice(0, -1))
  demo4G20Added = false
}

/** Simule Ctrl+K (ou Cmd+K) pour ouvrir la modale « Ajouter un exercice ». */
function openAddExerciseShortcut(): void {
  window.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
  )
}

/** Simule la saisie « Pythagore » dans la modale Ctrl+K. */
function playPythagoreSearchDemo(): void {
  const input = document.querySelector<HTMLInputElement>(
    '[data-tour="add-exercise-search-input"]',
  )
  if (input) fillInput(input, 'Pythagore')
}

/** Simule Échap pour refermer la modale « Ajouter un exercice ». */
function closeAddExerciseModal(): void {
  window.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
  )
}

/**
 * Ouvre la modale « Ajouter un exercice » (Ctrl+K) et y saisit « Pythagore »,
 * puis appelle `callback`. Factorisé pour être rejoué à l'identique en
 * avançant (étape « raccourci » → aperçus) comme en reculant (étape
 * « aperçus » → « raccourci », la modale ayant été refermée entre-temps).
 */
function openAndSearchPythagore(callback: () => void): void {
  openAddExerciseShortcut()
  // La modale se monte de façon asynchrone (juste après le raccourci) : on
  // attend qu'elle existe avant d'y saisir la recherche.
  setTimeout(() => {
    playPythagoreSearchDemo()
    callback()
  }, 100)
}

/**
 * Fait passer la visite à l'étape suivante quand l'utilisateur appuie sur
 * Entrée (comme annoncé par le texte de l'étape « 3L11 »). On ne réimplémente
 * pas ici la résolution du bon gestionnaire (action de démo de l'étape
 * courante, ou bouton « Terminer » en fin de visite)&nbsp;: driver.js le fait
 * déjà pour la flèche droite, donc on simule cette touche pour réutiliser
 * exactement la même logique plutôt que de la dupliquer.
 */
function handleTourEnterKey(event: KeyboardEvent): void {
  if (event.key !== 'Enter') return
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
  // Empêche l'activation native du bouton actuellement focalisé dans le
  // popover (souvent le bouton de fermeture « × », premier élément
  // focalisable) avant de déclencher l'avancée de la visite.
  event.preventDefault()
  window.dispatchEvent(
    new KeyboardEvent('keyup', { key: 'ArrowRight', bubbles: true }),
  )
}

/**
 * Lance la visite guidée de la page d'accueil (driver.js). La visite
 * démontre elle-même les actions (recherche, ajout, saisie) : l'utilisateur
 * n'a qu'à cliquer sur « Suivant ». Les exercices de démonstration ajoutés
 * sont retirés à la fin (quelle que soit la façon dont la visite se
 * termine).
 */
export function startTour(): void {
  originalExercicesParams = get(exercicesParams)
  demoExerciseIndex = -1
  demo4G20Added = false
  navLock = false

  const driverObj = driver({
    showProgress: true,
    progressText: '{{current}} / {{total}}',
    nextBtnText: 'Suivant',
    prevBtnText: 'Précédent',
    doneBtnText: 'Terminer',
    allowClose: true,
    overlayOpacity: 0.65,
    stagePadding: 6,
    waitForElement: 8000,
    // driver.js anime les transitions entre étapes via requestAnimationFrame ;
    // dans un onglet en arrière-plan ou peu prioritaire (navigateur headless,
    // onglet non actif…), rAF peut être fortement throttlé et la transition
    // ne se termine alors jamais, laissant la visite figée sur l'étape
    // précédente. On désactive donc l'animation : chaque étape s'affiche
    // instantanément, sans dépendre du rythme des frames.
    animate: false,
    // Avec l'animation désactivée, driver.js ne calcule la position du halo
    // (l'« encart ») qu'une seule fois, sur la frame suivant le changement
    // d'étape — il ne se resynchronise jamais ensuite (il ne réécoute que le
    // scroll de `window`, jamais celui d'un conteneur interne comme le
    // panneau de paramètres ou le menu du référentiel). Avec un défilement
    // fluide (`smoothScroll: true`), cette frame arrive avant la fin du
    // défilement animé&nbsp;: le halo reste alors figé sur la position
    // d'avant le scroll (encart vide ou mal placé), un décalage d'autant
    // plus visible que l'étape nécessite un grand défilement — et invisible
    // quand l'élément est déjà à l'écran, d'où son caractère intermittent
    // selon les étapes. Un défilement instantané se termine avant cette
    // frame, donc la position capturée est toujours la bonne.
    smoothScroll: false,
    popoverClass: get(darkMode).isActive
      ? 'mathalea-tour-popover mathalea-tour-popover-dark'
      : 'mathalea-tour-popover',
    onDestroyed: () => {
      window.removeEventListener('keydown', handleTourEnterKey)
      // Sans effet si la modale Ctrl+K n'est pas ouverte : si la visite est
      // fermée pendant une de ses étapes, elle ne doit pas rester affichée.
      closeAddExerciseModal()
      restoreExercicesParams()
      markTourSeen()
    },
    steps: [
      {
        popover: {
          title: 'Bienvenue sur MathALÉA',
          description:
            'MathALÉA génère des exercices de mathématiques à données aléatoires, prêts à imprimer, à vidéoprojeter ou à utiliser sur mobile. On cherche, on choisit les exercices à gauche&nbsp;; ils s’affichent ensuite à droite et on peut les paramétrer.',
          // Pas d'étape précédente à cette première étape : inutile d'y
          // afficher un bouton « Précédent » désactivé.
          showButtons: ['next', 'close'],
        },
      },
      {
        element: '[data-tour="search-input"]',
        popover: {
          title: 'Rechercher un exercice',
          description:
            'Tapez un thème (« pythagore ») ou directement un identifiant d’exercice, par exemple <strong>3L11</strong>. Essayons&nbsp;!',
          side: 'right',
          align: 'start',
          onNextClick: (_element, _step, opts) => {
            withNavGuard(() => {
              playSearchDemo()
              moveNextAfterRender(opts.driver)
            })
          },
        },
      },
      {
        element: `[data-tour-id="${DEMO_EXERCISE_ID}"]`,
        popover: {
          title: '3L11 — Simple distributivité',
          description:
            'Cliquez sur un résultat (ou appuyons sur Entrée) pour l’ajouter à votre feuille d’exercices, à droite.',
          side: 'right',
          align: 'start',
          onNextClick: (_element, _step, opts) => {
            withNavGuard(() => {
              playAddExerciseDemo()
              moveNextAfterRender(opts.driver)
            })
          },
        },
      },
      {
        element: () =>
          document.querySelector(`#exercice${demoExerciseIndex}`) as Element,
        popover: {
          title: 'L’exercice sélectionné',
          description:
            'Chaque exercice ajouté s’affiche ici, avec son panneau de paramètres à droite&nbsp;: nombre de questions, niveau de difficulté…',
          side: 'left',
          align: 'start',
          onPrevClick: (_element, _step, opts) => {
            withNavGuard(() => {
              undoAddExerciseDemo()
              movePreviousAfterRender(opts.driver)
            })
          },
        },
      },
      {
        element: () =>
          document.querySelector(
            `#settings-formTextListe3-${demoExerciseIndex}`,
          ) as Element,
        // Les cases restent, par défaut, cliquables sous le halo de
        // driver.js : on désactive l'interaction pour que la démonstration
        // (forme 1 à 3, forme 2) reste fidèle au texte affiché.
        disableActiveInteraction: true,
        popover: {
          title: 'Paramétrer finement un exercice',
          description:
            'Pour certains exercices, on choisit les variantes proposées en cochant des cases, et on règle leur poids d’apparition. Cliquons sur Suivant pour ne garder que les <strong>formes 1</strong> (avec un poids de 3) <strong>et 2</strong>&nbsp;: sur 4 questions, cela donne trois questions sous la forme 1 et une sous la forme 2.',
          side: 'left',
          align: 'start',
          onNextClick: (_element, _step, opts) => {
            withNavGuard(() => {
              clearSearchInput()
              playFormeDeveloppementDemo(() => moveNextAfterRender(opts.driver))
            })
          },
        },
      },
      {
        element: () => findNodeButtonByText('Course aux nombres') as Element,
        popover: {
          title: 'Course aux nombres',
          description:
            'La Course Aux Nombres (CAN) est un concours d\'activités mentales qui vise à valoriser l’acquisition d\'automatismes chez les élèves à tous les niveaux.',
          side: 'right',
          align: 'start',
          onNextClick: (_element, _step, opts) => {
            withNavGuard(() => {
              clickNodeByText('Quatrième')
              moveNextAfterRender(opts.driver)
            })
          },
        },
      },
      {
        element: () => findNodeButtonByText('Quatrième') as Element,
        popover: {
          title: 'Une entrée par niveau',
          description:
            'Chaque niveau (Sixième, Cinquième…) se parcourt aussi directement&nbsp;: on y trouve des exercices d’application directe du cours, ainsi que des exercices de synthèse. Ouvrons <strong>Quatrième</strong>.',
          side: 'right',
          align: 'start',
          onNextClick: (_element, _step, opts) => {
            withNavGuard(() => {
              clickNodeByText('Pythagore')
              moveNextAfterRender(opts.driver)
            })
          },
        },
      },
      {
        element: () => findNodeButtonByText('Pythagore') as Element,
        popover: {
          title: 'Un chapitre',
          description:
            'Chaque niveau se découpe en chapitres. Ouvrons <strong>Théorème de Pythagore</strong>.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: `[data-tour-id="${DEMO_EXERCISE_2_ID}"]`,
        popover: {
          title: '4G20 — Calculer une longueur avec Pythagore',
          description:
            'On retrouve ici les exercices du chapitre, chacun avec son propre identifiant (ici <strong>4G20</strong>). Cliquons pour l’ajouter à la feuille.',
          side: 'right',
          align: 'start',
          onNextClick: (_element, _step, opts) => {
            withNavGuard(() => {
              playChoisirExerciceParNiveauDemo()
              moveNextAfterRender(opts.driver)
            })
          },
        },
      },
      {
        popover: {
          title: 'Un raccourci pour aller plus vite',
          description:
            'À tout moment, <strong>Ctrl+K</strong> ou <strong>Cmd+K</strong> ouvre une recherche avec aperçu des exercices. Essayons avec « Pythagore ».',
          onNextClick: (_element, _step, opts) => {
            withNavGuard(() => {
              openAndSearchPythagore(() => moveNextAfterRender(opts.driver))
            })
          },
          onPrevClick: (_element, _step, opts) => {
            withNavGuard(() => {
              undoChoisirExerciceParNiveauDemo()
              movePreviousAfterRender(opts.driver)
            })
          },
        },
      },
      {
        // On cible tout le conteneur de résultats plutôt qu'un aperçu de
        // brevet précis&nbsp;: une recherche « Pythagore » remonte une
        // centaine de résultats dont les aperçus se chargent tous de façon
        // asynchrone (et font grandir la liste en continu pendant plusieurs
        // secondes), si bien qu'un aperçu ciblé précisément dérive sans
        // cesse hors du halo de driver.js — qui reste alors figé sur une
        // position obsolète et laisse tout apparaître grisé sous le voile.
        // Le conteneur, lui, a une taille fixée par la mise en page de la
        // modale (`overflow-y-auto`) et ne bouge jamais, quel que soit ce
        // qui charge à l'intérieur.
        element: '[data-tour="add-exercise-results"]',
        popover: {
          title: 'Aperçus des exercices',
          description:
            'La recherche mélange exercices d’entraînement et sujets d’examen. Plus bas dans les résultats, chaque sujet de brevet s’affiche en aperçu, prêt à être ajouté à la feuille&nbsp;: pratique pour faire son choix.',
          side: 'top',
          align: 'center',
          onNextClick: (_element, _step, opts) => {
            withNavGuard(() => {
              closeAddExerciseModal()
              moveNextAfterRender(opts.driver)
            })
          },
          onPrevClick: (_element, _step, opts) => {
            // On revient à l'étape « raccourci Ctrl+K » : la modale a été
            // refermée en arrivant ici, donc on la referme aussi en
            // reculant (elle ne doit rester ouverte à aucune étape en amont
            // de celle-ci).
            withNavGuard(() => {
              closeAddExerciseModal()
              movePreviousAfterRender(opts.driver)
            })
          },
        },
      },
      {
        element: '[data-tour="export-buttons"]',
        popover: {
          title: 'Une fois la feuille prête',
          description:
            'Cinq boutons permettent de l’exploiter&nbsp;: <strong>Diaporama</strong> pour la présenter question par question, <strong>Vidéoprojection</strong> pour l’afficher au tableau, <strong>Lien élèves</strong> pour paramétrer un lien (interactif ou pas, correction ou pas...), <strong>Impression</strong> pour générer un PDF, et <strong>Plus d’exports</strong> pour les autres formats (Moodle, À la carte, AMC, Anki…).',
          side: 'bottom',
          align: 'end',
          onPrevClick: (_element, _step, opts) => {
            // On revient à l'étape « aperçus des exercices » : la modale
            // Ctrl+K, refermée en la quittant, doit être rouverte (avec la
            // même recherche) pour que son aperçu de brevet existe à nouveau
            // dans la page.
            withNavGuard(() => {
              openAndSearchPythagore(() => movePreviousAfterRender(opts.driver))
            })
          },
        },
      },
      {
        element: '[data-tour="help-button"]',
        popover: {
          title: 'Besoin d’aide plus tard ?',
          description:
            'Ce bouton rouvre cette visite guidée à tout moment, ainsi que d’autres liens utiles.',
          side: 'bottom',
          align: 'end',
        },
      },
    ],
  })

  window.addEventListener('keydown', handleTourEnterKey)
  driverObj.drive()
}
