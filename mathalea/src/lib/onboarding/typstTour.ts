import { driver, type DriveStep, type Driver } from 'driver.js'
import { get } from 'svelte/store'
import 'driver.js/dist/driver.css'
import './tour.css'
import { darkMode } from '../stores/generalStore'

const TOUR_SEEN_KEY = 'mathalea-onboarding-tour-typst'

/**
 * `true` si la visite guidée de la vue Typst a déjà été vue sur ce poste
 * (localStorage).
 */
export function hasSeenTypstTour(): boolean {
  try {
    return window.localStorage.getItem(TOUR_SEEN_KEY) === '1'
  } catch {
    // Stockage indisponible (navigation privée, quota…) : on considère
    // qu'elle a été vue pour ne pas ré-afficher la visite à chaque page.
    return true
  }
}

export function markTypstTourSeen(): void {
  try {
    window.localStorage.setItem(TOUR_SEEN_KEY, '1')
  } catch {
    // Stockage indisponible : rien à faire
  }
}

/**
 * La palette de mise en page, le panneau de réglages et son bouton
 * n'existent (ou ne sont utiles) qu'en mode Aperçu&nbsp;: le mode Code
 * masque l'aperçu, et le mode Côte à côte ne laisse pas assez de place au
 * panneau de réglages pour qu'il s'ouvre. Les pastilles de la palette
 * (colonnes, saut de page, ajout d'exercice…) exigent en plus que la
 * palette elle-même soit affichée (bouton « Mise en page »), un réglage
 * indépendant du mode d'affichage. La visite cible tout cela dans plusieurs
 * étapes&nbsp;: si l'utilisateur l'a relancée depuis un autre état que celui
 * par défaut (bouton « Aide », après avoir déjà utilisé la vue), ces cibles
 * n'existeraient pas et driver.js resterait bloqué à attendre un élément
 * introuvable (`waitForElement`). On force donc le retour à l'état par
 * défaut avant de démarrer la visite, et on le restaure à la fin pour ne
 * pas altérer les préférences enregistrées de l'utilisateur.
 */
function ensureTourReadyState(): () => void {
  const restoreFns: Array<() => void> = []

  const modeButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>(
      '[data-tour="typst-mode-switch"] button',
    ),
  )
  const activeModeBtn = modeButtons.find(
    (button) => button.getAttribute('aria-pressed') === 'true',
  )
  const previewBtn = modeButtons.find(
    (button) => button.textContent?.trim() === 'Aperçu',
  )
  if (
    previewBtn != null &&
    activeModeBtn != null &&
    activeModeBtn !== previewBtn
  ) {
    // `setDisplayMode` (voir Typst.svelte) rouvre aussi le panneau de
    // réglages en revenant en Aperçu, et le referme en le quittant à la
    // restauration&nbsp;: rien d'autre à faire pour ce panneau.
    previewBtn.click()
    restoreFns.push(() => activeModeBtn.click())
  } else {
    // Le mode Aperçu était déjà actif&nbsp;: seul le panneau de réglages a
    // pu être refermé manuellement (bouton « Fermer les réglages » ou
    // nouveau clic sur « Réglages », que le survol de l'étape correspondante
    // laisse cliquable).
    const settingsToggle = document.querySelector<HTMLButtonElement>(
      '[data-tour="typst-settings-toggle"]',
    )
    if (
      settingsToggle != null &&
      document.querySelector('.typst-settings-pane') == null
    ) {
      settingsToggle.click()
      restoreFns.push(() => settingsToggle.click())
    }
  }

  // Le bouton « Mise en page » (palette de pastilles sur l'aperçu) est
  // toujours affiché, quel que soit le mode&nbsp;: son état n'est pas lié à
  // `setDisplayMode`, on le vérifie donc indépendamment.
  const layoutToggle = document.querySelector<HTMLButtonElement>(
    '[data-tour="typst-layout-toggle"]',
  )
  if (
    layoutToggle != null &&
    layoutToggle.getAttribute('aria-pressed') === 'false'
  ) {
    layoutToggle.click()
    restoreFns.push(() => layoutToggle.click())
  }

  return () => {
    for (const restore of restoreFns.reverse()) restore()
  }
}

/**
 * Laisse Svelte terminer son cycle de rendu (déclenché par l'action qui
 * vient de s'exécuter — clic sur le bouton « Ajouter un exercice », sur une
 * tuile du référentiel…) avant de faire avancer la visite&nbsp;: driver.js
 * capture l'élément cible de l'étape suivante de façon synchrone, ce qui
 * peut le faire pointer sur un nœud que Svelte remplace juste après si on
 * ne lui laisse pas ce délai (même raison que dans `tour.ts`).
 */
function moveNextAfterRender(driverObj: { moveNext: () => void }): void {
  setTimeout(() => driverObj.moveNext(), 50)
}

/**
 * Pastille de mise en page (colonnes/espacement) d'une liste de questions,
 * pour les étapes qui la décrivent. Celle de l'énoncé de l'exercice 1 est
 * privilégiée (son `data-testid` n'est pas unique, on la retrouve par le
 * titre de sa rangée « Colonnes ») ; à défaut, la première pastille de ce
 * type — une fiche « Course aux nombres » présente ses questions en tableau
 * et n'en a que pour les corrections. Renvoie `null` quand la fiche n'en a
 * aucune&nbsp;: les étapes correspondantes sont alors retirées de la visite,
 * sans quoi driver.js resterait à attendre une cible introuvable.
 */
function findTasksWidget(): HTMLElement | null {
  const widgets = Array.from(
    document.querySelectorAll<HTMLElement>(
      '[data-testid="typst-overlay-tasks"]',
    ),
  )
  return (
    widgets.find(
      (widget) =>
        widget.querySelector(
          '[title="Colonnes des questions de l\'exercice 1"]',
        ) != null,
    ) ??
    widgets[0] ??
    null
  )
}

/**
 * Cherche, parmi les tuiles de navigation de la modale « Ajouter un
 * exercice » (rubriques, niveaux, thèmes, sous-thèmes…), celle dont le
 * libellé contient `text`. Même principe que `findNodeButtonByText` dans
 * `tour.ts`, pour le référentiel de cette modale plutôt que le menu de la
 * page d'accueil.
 */
function findAddExerciseTileButton(text: string): HTMLButtonElement | null {
  const container = document.querySelector('[data-tour="add-exercise-results"]')
  if (container == null) return null
  const buttons = container.querySelectorAll<HTMLButtonElement>('button')
  for (const button of buttons) {
    if (button.textContent?.includes(text)) return button
  }
  return null
}

/**
 * Descend automatiquement, sans action de l'utilisateur, dans les tuiles de
 * la modale « Ajouter un exercice » en suivant `path` (un libellé de tuile
 * par niveau). Chaque clic attend le rendu Svelte du niveau suivant avant de
 * continuer (même délai que `moveNextAfterRender`).
 */
function autoNavigateAddExerciseTiles(path: string[]): void {
  const [label, ...rest] = path
  if (label == null) return
  findAddExerciseTileButton(label)?.click()
  if (rest.length > 0) setTimeout(() => autoNavigateAddExerciseTiles(rest), 500)
}

/** Simule Échap pour refermer la modale « Ajouter un exercice ». */
function closeAddExerciseModal(): void {
  window.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
  )
}

/**
 * Fait passer la visite à l'étape suivante quand l'utilisateur appuie sur
 * Entrée (même mécanisme que `tour.ts`)&nbsp;: driver.js gère déjà la flèche
 * droite comme « Suivant », y compris la résolution du bon gestionnaire
 * (action de démo de l'étape courante, ou bouton « Terminer » en fin de
 * visite) — on réutilise cette logique plutôt que de la dupliquer.
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
 * Lance la visite guidée de la vue Typst (driver.js). Une partie décrit
 * simplement l'interface (comme la visite de la page d'accueil dans les
 * grandes lignes), une autre — l'ouverture de la modale « Ajouter un
 * exercice » et la navigation dans les référentiels — la démontre par de
 * vrais clics, comme `tour.ts` le fait pour la page d'accueil. Ciblée sur
 * l'état par défaut d'un premier passage (mode Aperçu, panneau de réglages
 * ouvert) — voir `ensureTourReadyState`.
 *
 * Le « Précédent » est désactivé sur les étapes internes à la navigation
 * dans la modale (une fois les tuiles parcourues, driver.js ne sait pas
 * rejouer cette navigation dans l'autre sens). Juste après, l'étape
 * « Les réglages du document » redirige plutôt « Précédent » vers la
 * pastille « Ajouter un exercice » (voir son `onPrevClick`) plutôt que de le
 * désactiver&nbsp;: un retour standard viserait l'étape juste avant elle,
 * dont la cible a disparu avec la fermeture de la modale.
 */
export function startTypstTour(): void {
  const restoreState = ensureTourReadyState()
  // Laisse Svelte terminer son rendu (bouton « Réglages » qui apparaît, ou
  // panneau qui s'ouvre) avant que driver.js ne cherche la cible de ses
  // premières étapes.
  setTimeout(() => {
    // Cibles qui n'existent pas sur toutes les fiches : leurs étapes sont
    // retirées plutôt que de laisser driver.js patienter (`waitForElement`)
    // devant une pastille qui ne viendra jamais.
    const tasksWidget = findTasksWidget()
    const hasPagebreak =
      document.querySelector(
        '.typst-pill:has([data-testid="typst-overlay-pagebreak"])',
      ) != null
    const hasAddExercise =
      document.querySelector(
        '.typst-pill:has([data-testid="typst-overlay-add-exercise"])',
      ) != null

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
      // défilement instantané, pas fluide&nbsp;: avec `animate:false`,
      // driver.js positionne son halo une frame après avoir déclenché le
      // défilement, sans attendre la fin d'un défilement fluide (animé sur
      // plusieurs frames) — et comme l'aperçu Typst défile dans son propre
      // conteneur interne plutôt que la fenêtre, l'évènement `scroll` qui
      // lui permettrait de corriger ensuite ne se déclenche jamais côté
      // `window`. Le halo restait donc figé à la position d'avant
      // défilement pour les pastilles hors champ (ex. « Ajouter un
      // exercice », en bas de l'aperçu). Un défilement instantané se
      // termine avant cette frame, la position lue est donc la bonne.
      smoothScroll: false,
      // voir le commentaire équivalent dans `tour.ts` : anime désactivée pour
      // ne pas rester figée si `requestAnimationFrame` est throttlé.
      animate: false,
      popoverClass: get(darkMode).isActive
        ? 'mathalea-tour-popover mathalea-tour-popover-dark'
        : 'mathalea-tour-popover',
      onDestroyed: () => {
        window.removeEventListener('keydown', handleTourEnterKey)
        markTypstTourSeen()
        restoreState()
      },
      steps: [
        {
          popover: {
            title: 'La vue Impression',
            description:
              'Cette vue génère votre fiche en PDF et vous permet de la modifier en direct grâce au nouveau langage de composition, le <strong>Typst</strong>.',
          },
        },
        {
          element: '[data-tour="typst-mode-switch"]',
          popover: {
            title: 'Trois modes d’affichage',
            description:
              '<strong>Code</strong> ouvre un éditeur complet (autocomplétion, recherche, multi-curseurs, raccourcis clavier) avec un bouton pour télécharger le <code>.typ</code>. <strong>Côte à côte</strong> affiche le code et le rendu ensemble. <strong>Aperçu</strong> montre que le résultat compilé et les réglages.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '.typst-preview-pane',
          popover: {
            title: 'Un aperçu compilé en temps réel',
            description:
              'Le document est recompilé automatiquement à chaque modification, page par page, exactement comme le PDF final. Double-cliquez sur un exercice pour accéder directement à son code.',
            side: 'left',
            align: 'start',
          },
        },
        {
          element: '[data-tour="typst-layout-toggle"]',
          popover: {
            title: 'Ajuster la mise en page depuis l’aperçu',
            description:
              "Ce bouton affiche des pastilles directement sur l’aperçu&nbsp;: nombre de colonnes et espacement des questions par exercice, insertion de texte ou de section entre deux exercices, zoom et alignement des figures, lignes pointillées entre les questions ou à la fin de l'exercice, fusion d’exercices. Aucune modification manuelle du code n’est nécessaire.",
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '[data-tour="typst-layout-toggle"]',
          popover: {
            title: 'Gérer les exercices depuis l’aperçu',
            description:
              'Les mêmes pastilles permettent d’ajouter, supprimer ou déplacer un exercice, de regénérer de nouvelles données pour un seul exercice, d’ouvrir ses réglages, d’éditer directement son code (énoncé ou correction au format Typst) ou une ligne du tableau «&nbsp;Course aux nombres&nbsp;», et de modifier le titre, le sous-titre, l’en-tête, la page de garde ou le pied de page.',
            side: 'bottom',
            align: 'start',
          },
        },
        ...(tasksWidget != null
          ? [
              {
                element: () => tasksWidget,
                popover: {
                  title: 'Colonnes des questions',
                  description:
                    "Sur une liste de questions (l'énoncé d'un exercice ou sa correction), ces flèches règlent son nombre de colonnes (auto par défaut).",
                  side: 'left' as const,
                  align: 'start' as const,
                },
              },
              {
                element: () => tasksWidget,
                popover: {
                  title: 'Espacement des questions',
                  description:
                    "Juste en dessous, ces flèches règlent l'espacement vertical entre les questions.",
                  side: 'left' as const,
                  align: 'start' as const,
                },
              },
            ]
          : []),
        ...(hasPagebreak
          ? [
              {
                // `data-testid="typst-overlay-pagebreak"` n'est pas unique (un
                // par repère de mise en page) ; `querySelector` retient le
                // premier du DOM, qui est toujours celui du repère juste après
                // le premier exercice, qu'il y ait ou non d'autres exercices
                // ensuite. La pastille entière (pas juste le bouton) est ciblée
                // pour que le halo de la visite ne mette pas en avant qu'une
                // moitié de pastille, l'autre restant délavée (voir tour.css).
                element:
                  '.typst-pill:has([data-testid="typst-overlay-pagebreak"])',
                popover: {
                  title: 'Un saut de page',
                  description:
                    "Ce bouton insère un saut de page juste après l'exercice qui précède&nbsp;: pratique pour forcer un exercice à démarrer en haut d'une page.",
                  side: 'top' as const,
                  align: 'center' as const,
                },
              },
            ]
          : []),
        ...(hasAddExercise
          ? [
              {
                element:
                  '.typst-pill:has([data-testid="typst-overlay-add-exercise"])',
                popover: {
                  title: 'Ajouter un exercice',
                  description:
                    "Au bas de l'aperçu, ce bouton permet d'ajouter un exercice à la fin de la fiche. Essayons-le.",
                  side: 'top' as const,
                  align: 'center' as const,
                  onNextClick: (
                    _element: Element | undefined,
                    _step: DriveStep,
                    opts: { driver: { moveNext: () => void } },
                  ) => {
                    document
                      .querySelector<HTMLButtonElement>(
                        '[data-testid="typst-overlay-add-exercise"]',
                      )
                      ?.click()
                    // laisse la modale se monter avant de commencer à y
                    // cliquer ; la navigation se poursuit en arrière-plan
                    // pendant que l'étape suivante affiche déjà son
                    // explication (pas besoin d'attendre chaque « Suivant »)
                    setTimeout(
                      () =>
                        autoNavigateAddExerciseTiles([
                          'Lycée Général',
                          'Terminale',
                          'Terminale Spé',
                          'Les suites numériques',
                          'Limites de suites',
                        ]),
                      200,
                    )
                    moveNextAfterRender(opts.driver)
                  },
                },
              },
              {
                element: '[data-tour="add-exercise-results"]',
                popover: {
                  title: 'Parcourir les référentiels',
                  description:
                    'On retrouve les mêmes rubriques que la page d’accueil. Ici&nbsp;: «&nbsp;Lycée Général&nbsp;» → «&nbsp;Terminale&nbsp;» → «&nbsp;Terminale Spé&nbsp;» → «&nbsp;Les suites numériques&nbsp;» → «&nbsp;Limites de suites&nbsp;».',
                  side: 'right' as const,
                  align: 'start' as const,
                  disableButtons: ['previous' as const],
                },
              },
              {
                element:
                  '[data-tour="add-exercise-results"] [data-tour="exercise-preview"]',
                popover: {
                  title: 'Aperçu et paramètres avant ajout',
                  description:
                    'On obtient un aperçu de chaque exercice du sous-thème comme il apparaîtra dans la fiche. La roue dentée <i class="bx bx-cog"></i> permet de le paramétrer (nombre de questions, variantes…) avant de cliquer sur «&nbsp;Ajouter&nbsp;».',
                  side: 'left' as const,
                  align: 'start' as const,
                  disableButtons: ['previous' as const],
                  onNextClick: (
                    _element: Element | undefined,
                    _step: DriveStep,
                    opts: { driver: { moveNext: () => void } },
                  ) => {
                    closeAddExerciseModal()
                    moveNextAfterRender(opts.driver)
                  },
                },
              },
            ]
          : []),
        {
          element: '[data-tour="typst-settings-toggle"]',
          popover: {
            title: 'Les réglages du document',
            description:
              'Ce bouton ouvre le panneau de réglages pour modifier le document en direct.',
            side: 'bottom',
            align: 'start',
            // La modale « Ajouter un exercice » vient de se refermer&nbsp;:
            // un « Précédent » standard viserait l'étape « Aperçu et
            // paramètres avant ajout », dont la cible a disparu avec elle
            // (driver.js resterait bloqué 8&nbsp;s à l'attendre avant
            // d'abandonner). On revient donc directement à la pastille
            // « Ajouter un exercice », dernière étape dont la cible existe
            // toujours dans le DOM.
            ...(hasAddExercise
              ? {
                  onPrevClick: (
                    _element: Element | undefined,
                    _step: DriveStep,
                    opts: { driver: Driver },
                  ) => {
                    const steps = opts.driver.getConfig().steps ?? []
                    const addExerciseIndex = steps.findIndex(
                      (step) => step.popover?.title === 'Ajouter un exercice',
                    )
                    if (addExerciseIndex >= 0)
                      opts.driver.moveTo(addExerciseIndex)
                  },
                }
              : {}),
          },
        },
        {
          element: '[data-tour="export-view-links"]',
          popover: {
            title: 'Les deux autres exports',
            description:
              'En tête des réglages, ces liens reprennent les mêmes exercices, avec les mêmes données, dans la vue <strong>Flash-cards</strong> (cartes question au recto, réponse au verso, à découper) et dans la vue <strong>Diaporama PDF</strong> (une question en grand par page, au format d’un écran, puis les corrections). Chacune de ces vues renvoie vers les deux autres.',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '[data-tour="typst-settings-layout"]',
          popover: {
            title: 'Mise en page générale',
            description:
              'Format (A4/A5), orientation, nombre de colonnes du document, affichage et style de la correction, présentation «&nbsp;Course aux nombres&nbsp;», fusion de tous les exercices, référence des exercices et QR-code vers chacun.',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '[data-tour="typst-settings-typography"]',
          popover: {
            title: 'Habillage et typographie',
            description:
              'Style de l’en-tête, pied de page, police du texte et des maths, taille, interligne, espacement des mots (à augmenter pour nos élèves dyslexiques) et entre les exercices, numéros de question en gras, style et couleur des badges d’exercice.',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '[data-tour="typst-settings-cover"]',
          popover: {
            title: 'Page de garde',
            description:
              'Modèles prêts à l’emploi (Évaluation, Brevet des collèges, BAC, Course aux nombres) avec leurs champs (titre, session, matière, durée, consignes) et un barème calculé automatiquement à partir des exercices.',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '[data-tour="typst-new-data"]',
          popover: {
            title: 'Nouvelles données pour toute la fiche',
            description:
              'Regénère de nouvelles valeurs aléatoires pour tous les exercices d’un coup, sans avoir à les régénérer un par un. Avec plusieurs versions, le bouton du sujet affiché ne change que ce sujet, « Tous les sujets » les change tous. Les flèches à côté annulent ou rétablissent un tirage.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '[data-tour="typst-versions"]',
          popover: {
            title: 'Plusieurs versions',
            description:
              "De 1 à 4 versions différentes (données aléatoires distinctes) de la même fiche, générées et exportées ensemble&nbsp;: pratique pour que les élèves n'aient pas la même copie.",
            side: 'bottom',
            align: 'end',
          },
        },
        {
          element: '#typst-download-pdf-button',
          popover: {
            title: 'Exporter la fiche',
            description:
              'Téléchargez un PDF unique (énoncé et correction), ou deux PDF séparés avec le bouton voisin «&nbsp;Énoncé + corrigé séparés&nbsp;».',
            side: 'bottom',
            align: 'end',
          },
        },
        {
          popover: {
            title: 'En cas d’erreur de compilation',
            description:
              'Si le code Typst ne compile pas, un panneau apparaît en bas de l’écran avec les erreurs traduites en français, un lien pour sauter à la ligne concernée, et un bouton pour revenir à la dernière version qui compilait.',
          },
        },
        {
          element: '[data-tour="help-button"]',
          popover: {
            title: 'Besoin d’aide plus tard ?',
            description:
              'Ce bouton permet à tout moment de relancer cette visite guidée, de consulter la liste complète des raccourcis clavier de l’éditeur, d’en savoir plus sur le langage Typst ou de nous contacter.',
            side: 'bottom',
            align: 'end',
          },
        },
      ],
    })

    window.addEventListener('keydown', handleTourEnterKey)
    driverObj.drive()
  }, 60)
}
