import { derived, get, writable } from 'svelte/store'
import { statsPageTracker } from '../../modules/statsUtils'
import { CALCULATRICES_NON_FORCEES } from '../calculatrices'
import { buildDsParams } from '../components/buildDsParams'
import { normaliseCoeffBareme } from '../interactif/baremeExercice'
import type {
  InterfaceParams,
  InterfaceResultExercice,
  bibliothequeExercise,
} from '../types'
import { type JSONReferentielEnding } from '../types/referentiels'
import type { VueType } from '../VueType'
import { canOptions } from './canStore'
import { globalOptions } from './globalOptions'

/**
 * Pour bloquer la mise à jour de l'url
 */
export const freezeUrl = writable<boolean>(false)

/**
 * Réglages encodés (base64) de la vue Typst, maintenus dans l'URL
 * par updateGlobalOptionsInURL. Alimenté par la vue Typst elle-même.
 */
export const typstParamStore = writable<string>('')

/**
 * Dossier ouvert à l'arrivée dans « Mes sauvegardes », dans « Mes feuilles »
 * (fiches de la vue Impression), « Mes sélections » (liens) ou « Mes séances
 * au vidéoprojecteur » (états de la vue TBI) ; `null` : la racine.
 * `selectionId` : sélection à montrer (retour après modification).
 */
export const savesLocationStore = writable<{
  space: 'feuilles' | 'selections' | 'seances'
  folderId: string | null
  selectionId?: string
  /** Volet de réglages à ouvrir à l'arrivée (widget « Tirage au sort » de la vue TBI) */
  panel?: 'classes'
}>({ space: 'feuilles', folderId: null })

/**
 * Feuille de « Mes feuilles » ouverte dans la vue Typst ou LaTeX
 * (paramètre `feuille` de l'URL), pour l'enregistrer à nouveau au même
 * endroit. Chaîne vide : fiche qui n'est pas (encore) enregistrée.
 */
export const currentSheetStore = writable<string>('')

/**
 * Séance de « Mes séances au vidéoprojecteur » ouverte dans la vue TBI
 * (paramètre `seance` de l'URL), pour l'enregistrer à nouveau au même
 * endroit. Chaîne vide : séance qui n'est pas (encore) enregistrée.
 */
export const currentSessionStore = writable<string>('')

/**
 * Dernière feuille reliée avant de quitter la vue Typst : « Enregistrer »
 * crée alors une nouvelle feuille, mais propose de remplacer celle-ci (fiche
 * complétée en passant par l'accueil).
 */
export const previousSheetStore = writable<string>('')

/**
 * Demande d'ouverture de la modale des raccourcis clavier de l'éditeur
 * Typst, depuis un endroit hors de `Typst.svelte` (bouton « Aide » de
 * `NavBar`, commun à toutes les vues). La vue Typst est seule à la lire et
 * à la remettre à `false` une fois consultée.
 */
export const typstShortcutsOpen = writable<boolean>(false)

/**
 * Pendant de `typstShortcutsOpen` pour la vue LaTeX (`v=tex`) : demande
 * d'ouverture de la modale des raccourcis clavier de l'éditeur depuis le
 * bouton « Aide » de `NavBar`. La vue LaTeX est seule à la lire et à la
 * remettre à `false` une fois consultée.
 */
export const texShortcutsOpen = writable<boolean>(false)

/**
 * Réglages encodés (base64) de la vue LaTeX (`v=tex`), maintenus dans l'URL
 * par updateGlobalOptionsInURL. Alimenté par la vue elle-même.
 */
export const texParamStore = writable<string>('')

/**
 * Réglages encodés (base64) de la vue TBI, maintenus dans l'URL
 * par updateGlobalOptionsInURL. Alimenté par la vue TBI elle-même.
 */
export const tbiParamStore = writable<string>('')

/**
 * Pour signaler que MathALÉA est dans une iframe
 */
export const isInIframe = writable<boolean>(false)

/**
 * exercicesParams est un tableau d'objets décrivant les exercices
 * {id, uuid, alea, interactif, cd, sup, sup2, sup3, sup4,sup5, n}
 */
export const exercicesParams = writable<InterfaceParams[]>([])

/**
 * Nombre de points maximum de chaque exercice interactif, hors coefficient
 * de barème, indexé comme `exercicesParams` (0 pour un exercice non
 * interactif). Alimenté par `ExerciceMathaleaVueProf` à chaque
 * (re)génération des questions.
 */
export const pointsMaxParExercice = writable<number[]>([])

/** Capacités d'un exercice vis-à-vis de l'interactivité. */
export type InteractiviteExercice = {
  id: string
  titre: string
  /** Faux pour un exercice sans version interactive. */
  interactifReady: boolean
  /** Vrai pour un exercice toujours interactif (non basculable en papier). */
  interactifObligatoire: boolean
}

/**
 * Pour chaque exercice (indexé comme `exercicesParams`), ce qu'il permet en
 * matière d'interactivité. Alimenté par `ExerciceMathaleaVueProf`, il sert au
 * sélecteur Papier / Numérique et à la modale qui liste les exercices sans
 * version interactive.
 */
export const interactiviteParExercice = writable<InteractiviteExercice[]>([])

/**
 * Nombre total de points de la copie numérique (somme des barèmes de tous
 * les exercices), utilisé notamment dans la vue prof en mode recorder
 * Capytale.
 */
export const pointsMaxTotal = derived(
  [exercicesParams, pointsMaxParExercice],
  ([$exercicesParams, $pointsMaxParExercice]) =>
    $exercicesParams.reduce((total, params, i) => {
      const pointsMax = $pointsMaxParExercice[i] ?? 0
      return total + pointsMax * normaliseCoeffBareme(params.coeffBareme)
    }, 0),
)

// tenir le compte des changements dans la liste : ajout/retrait -> +1
export const changes = writable<number>(0)

// pour indiquer qu'un réordonnancement est en cours (pour l'animation flip des exercices)
export const isReordering = writable<boolean>(false)

// pour la gestion du mode sombre
export const darkMode = writable({ isActive: false })

export const capytaleMode = writable<
  'none' | 'create' | 'assignment' | 'review' | 'view'
>('none')

export const capytaleStudentAssignment = writable<InterfaceResultExercice[]>()

// vrai lorsqu'une sauvegarde vers Capytale a échoué et n'a pas encore pu être rejouée
// (session expirée, coupure réseau, page parente qui ne répond plus)
// tant que c'est vrai, l'élève ne doit plus pouvoir modifier sa copie
export const capytaleConnectionLost = writable<boolean>(false)

// sauvegarde des résultats des exercices
export const resultsByExercice = writable<InterfaceResultExercice[]>([])

// vue Élève : détecter la nécessité d'un menu
export const isMenuNeededForExercises = writable<boolean>(false)
export const isMenuNeededForQuestions = writable<boolean>(false)
export const isSettingsMenuVisible = writable<boolean>(false)
export const isExportMenuVisible = writable<boolean>(false)

// pour garder trace du statut d'ouverture du menu de choix
export const isSideMenuVisible = writable<boolean>(true)

// pour garder trace de la page appelant l'export
export const previousView = writable<undefined | '' | VueType>(undefined)

// pour sauvegarder l'objet correspondant à la rubrique choisie pour les exos statiques
export const bibliothequeSectionContent = writable<bibliothequeExercise[]>([])
export const bibliothequeDisplayedContent =
  writable<Record<string, JSONReferentielEnding>>()
export const bibliothequePathToSection = writable<string[]>([])

/**
 * Déplace un exercice dans exercicesParams
 */
export function moveExercice(
  liste: InterfaceParams[],
  iDepart: number,
  iArrivee: number,
): InterfaceParams[] {
  liste.splice(iArrivee, 0, liste.splice(iDepart, 1)[0])
  return liste
}

let urlToWrite: URL
let timerId: ReturnType<typeof setTimeout> | undefined

/**
 * Complète l'URL courante avec les éléments relatifs au diaporama, puis
 * l'écrit dans la barre d'adresse (au plus toutes les 0,5 s)
 */
export function updateGlobalOptionsInURL(url: URL) {
  appendGlobalOptionsToURL(url)
  urlToWrite = url
  // On ne met à jour l'url qu'une fois toutes les 0,5 s
  // pour éviter l'erreur Attempt to use history.pushState() more than 100 times per 30 seconds
  if (timerId === undefined) {
    timerId = setTimeout(() => {
      const currentUrl = new URL(window.location.href)
      if (urlToWrite.href === currentUrl.href) {
        timerId = undefined
        return
      }
      window.history.pushState({}, '', urlToWrite)
      statsPageTracker()
      timerId = undefined
    }, 500)
  }
}

/**
 * Complète l'URL avec les options globales et les réglages des vues, sans
 * l'écrire dans la barre d'adresse
 */
export function appendGlobalOptionsToURL(url: URL) {
  const options = get(globalOptions)
  const canStore = get(canOptions)
  if (options.v) {
    url.searchParams.append('v', options.v)
  } else {
    url.searchParams.delete('v')
  }
  if (options.z && options.z !== '1') {
    url.searchParams.append('z', options.z)
  } else {
    url.searchParams.delete('z')
  }
  if (options.durationGlobal) {
    url.searchParams.append('dGlobal', options.durationGlobal.toString())
  } else {
    url.searchParams.delete('dGlobal')
  }
  if (options.durationCorrection) {
    url.searchParams.append('dCorr', options.durationCorrection.toString())
  } else {
    url.searchParams.delete('dCorr')
  }
  if (
    options.v === 'eleve' ||
    options.v === 'myriade' ||
    options.v === 'indices' ||
    options.v === 'indice'
  ) {
    if (options.title != null && options.title.length > 0) {
      url.searchParams.append('title', options.title)
    } else {
      url.searchParams.delete('title')
    }
    if (options.iframe !== undefined && options.iframe.length > 0) {
      url.searchParams.append('iframe', options.iframe)
    } else {
      url.searchParams.delete('iframe')
    }
    if (options.answers !== undefined && options.answers.length > 0) {
      url.searchParams.append('answers', JSON.stringify(options.answers))
    } else {
      url.searchParams.delete('answers')
    }
    if (typeof options !== 'undefined') {
      let es = ''
      if (options.presMode != null) {
        es = presModeId.indexOf(options.presMode).toString()
      } else es = '1'
      es += options.setInteractive ?? '2'
      es += options.isSolutionAccessible ? '1' : '0'
      es += options.isInteractiveFree ? '1' : '0'
      es += options.oneShot ? '1' : '0'
      es += options.twoColumns ? '1' : '0'
      es += options.isTitleDisplayed ? '1' : '0'
      es += options.isReferenceDisplayed ? '1' : '0'
      es += options.isCorrectionOnlyOnError ? '1' : '0'
      // Calculatrices forcées et vérification question par question :
      // caractères facultatifs (voir buildEsParams)
      const forcees = options.calculatricesForcees ?? CALCULATRICES_NON_FORCEES
      if (forcees !== CALCULATRICES_NON_FORCEES || options.isCheckPerQuestion)
        es += forcees
      if (options.isCheckPerQuestion) es += '1'
      url.searchParams.append('es', es)
    }
    if (options.done) {
      url.searchParams.append('done', options.done)
    } else {
      url.searchParams.delete('done')
    }
  } else {
    url.searchParams.delete('title')
    url.searchParams.delete('es')
    // Choix « Numérique » de la conception de document : tous les exercices
    // en interactif, y compris ceux ajoutés ensuite (dans la vue élève, ce
    // réglage est porté par `es`)
    if (options.setInteractive === '1' && !options.recorder) {
      url.searchParams.append('numerique', '1')
    }
    url.searchParams.delete('iframe')
    url.searchParams.delete('answers')
    url.searchParams.delete('recorder')
    url.searchParams.delete('done')
  }
  if (options.v === 'can') {
    if (canStore) {
      url.searchParams.append('canD', canStore.durationInMinutes.toString())
      url.searchParams.append('canTi', canStore.title)
      url.searchParams.append('canT', canStore.subTitle)
      url.searchParams.append('canSA', canStore.solutionsAccess ? '1' : '0')
      url.searchParams.append('canSM', canStore.solutionsMode)
      url.searchParams.append('canI', canStore.isInteractive ? '1' : '0')
      if (canStore.timerMode === 'question') {
        url.searchParams.append(
          'canQ',
          canStore.durationPerQuestionInSeconds.toString(),
        )
      }
      if (canStore.feedbackMode === 'each') {
        url.searchParams.append('canFB', '1')
      }
    }
  }
  if (options.recorder) {
    url.searchParams.append('recorder', options.recorder)
  } else {
    url.searchParams.delete('recorder')
  }
  if (options.v === 'diaporama' || options.v === 'overview') {
    url.searchParams.append('ds', buildDsParams())
    if (
      options.select !== undefined &&
      options.select !== undefined &&
      options.select.length > 0 &&
      options.select.length < get(exercicesParams).length
    ) {
      url.searchParams.append('select', options.select.join('-'))
    }
    if (
      options.order !== undefined &&
      options.order.length > 0 &&
      options.shuffle
    ) {
      url.searchParams.append('order', options.order.join('-'))
    }
  } else {
    url.searchParams.delete('ds')
    url.searchParams.delete('select')
    url.searchParams.delete('order')
  }
  if (options.beta) {
    url.searchParams.append('beta', '1')
  }
  if (options.cor) {
    url.searchParams.append('cor', '1')
  }
  const currentUrl = new URL(window.location.href)
  if (currentUrl.searchParams.has('triche')) {
    url.searchParams.append('triche', '1')
  }
  // Vue Parcours : parcours à ouvrir et invitation à un salon, lus par la vue
  if (options.v === 'parcours') {
    for (const key of ['parcours', 'invitation']) {
      const value = currentUrl.searchParams.get(key)
      if (value !== null) url.searchParams.set(key, value)
    }
  }
  const logParam = currentUrl.searchParams.get('log')
  if (logParam !== null && /^[0-9]$/.test(logParam)) {
    url.searchParams.append('log', logParam)
  }
  const pdfParam = currentUrl.searchParams.get('pdfParam')
  if (
    (options.v === 'latex' || options.v === 'pdf') &&
    pdfParam !== null &&
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      pdfParam,
    )
  ) {
    url.searchParams.append('pdfParam', pdfParam)
  }
  // Même principe pour la vue Typst.
  const typstParam = get(typstParamStore)
  if (options.v === 'typst' && typstParam.length > 0) {
    url.searchParams.append('typstParam', typstParam)
  }
  const currentSheet = get(currentSheetStore)
  if (
    (options.v === 'typst' || options.v === 'tex' || options.v === 'omr') &&
    currentSheet.length > 0
  ) {
    url.searchParams.append('feuille', currentSheet)
  }
  // Même principe pour la vue LaTeX (v=tex).
  const texParam = get(texParamStore)
  if (options.v === 'tex' && texParam.length > 0) {
    url.searchParams.append('texParam', texParam)
  }
  // Même principe pour la vue TBI.
  const tbiParam = get(tbiParamStore)
  if (options.v === 'tbi' && tbiParam.length > 0) {
    url.searchParams.append('tbiParam', tbiParam)
  }
  const currentSession = get(currentSessionStore)
  if (options.v === 'tbi' && currentSession.length > 0) {
    url.searchParams.append('seance', currentSession)
  }
  // Pour les vues quizz, les réglages voyagent dans globalOptions :
  // subject (titre du quizz) et quizzParam (blob base64 produit par quizzconf).
  if (options.v === 'quizzconf' || options.v === 'quizz') {
    if (options.subject != null && options.subject.length > 0) {
      url.searchParams.append('subject', options.subject)
    } else {
      url.searchParams.delete('subject')
    }
    if (options.quizzParam != null && options.quizzParam.length > 0) {
      url.searchParams.append('quizzParam', options.quizzParam)
    } else {
      url.searchParams.delete('quizzParam')
    }
  } else {
    url.searchParams.delete('subject')
    url.searchParams.delete('quizzParam')
  }
  // Mode multi-joueurs (vue quizz uniquement) : rôle, PIN et identifiant de
  // room — le lien joueur minimal est ?v=quizz&quizzRole=player&pin=XXXXXX.
  if (options.v === 'quizz') {
    if (options.quizzRole != null) {
      url.searchParams.append('quizzRole', options.quizzRole)
    } else {
      url.searchParams.delete('quizzRole')
    }
    if (options.pin != null && options.pin.length > 0) {
      url.searchParams.append('pin', options.pin)
    } else {
      url.searchParams.delete('pin')
    }
    if (options.gameId != null && options.gameId.length > 0) {
      url.searchParams.append('gameId', options.gameId)
    } else {
      url.searchParams.delete('gameId')
    }
  } else {
    url.searchParams.delete('quizzRole')
    url.searchParams.delete('pin')
    url.searchParams.delete('gameId')
  }
}

export const presModeId: [
  // sync with src/components/urls.ts presentationMode
  'liste_exos',
  'un_exo_par_page',
  'liste_exos',
  'une_question_par_page',
  'recto',
  'verso',
  // 'cartes'
] = [
  'liste_exos',
  'un_exo_par_page',
  'liste_exos',
  'une_question_par_page',
  'recto',
  'verso',
  // 'cartes'
]
