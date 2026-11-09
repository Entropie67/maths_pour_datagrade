// Moteur MathALÉA embarquable : génération, affichage et vérification des
// exercices, sans l'application (menus, URL, exports). Il est construit à part
// (`pnpm build:moteur`) et chargé à l'exécution par une application hôte, qui
// peut ainsi recevoir les nouveaux exercices sans être mise à jour.
// L'API est versionnée par API_MOTEUR : l'hôte refuse un moteur incompatible.
import 'boxicons/css/boxicons.min.css'
import 'katex/dist/katex.min.css'
import seedrandom from 'seedrandom'
import { mount, unmount } from 'svelte'
import '../app.css'

import Keyboard from '../components/keyboard/Keyboard.svelte'

import { composeQuestionContext } from '../lib/components/questionContext'
import { verifQuestionCliqueFigure } from '../lib/customElements/CliqueFigureElement'
import {
  listOfCustomElements,
  mathaleaCustomElementsRegistry,
} from '../lib/customElements/MathaleaCustomElement'
import { uniformiseResults } from '../lib/interactif/gestionInteractif'
import {
  mathaleaFormatExercice,
  mathaleaGenerateSeed,
  mathaleaHandleExerciceSimple,
  mathaleaHandleParamOfOneExercice,
  mathaleaLoadExerciceFromUuid,
  mathaleaRenderDiv,
} from '../lib/mathalea'
import { mathaleaWriteStudentPreviousAnswers } from '../lib/mathaleaUtils'
import { referentielLocale } from '../lib/stores/languagesStore'
import {
  interactivityTypeToCustomElementFormat,
  type IExercice,
  type InterfaceParams,
} from '../lib/types'
import { loadMathLive } from '../modules/loaders'

export const API_MOTEUR = 1
export const VERSION_MOTEUR: string =
  typeof __MOTEUR_VERSION__ === 'string' ? __MOTEUR_VERSION__ : 'dev'

declare const __MOTEUR_VERSION__: string | undefined

export interface ParamsExercice {
  uuid: string
  id?: string
  nbQuestions?: number
  sup?: string
  sup2?: string
  sup3?: string
  sup4?: string
  sup5?: string
  alea?: string
  /** false : énoncés sans champs de réponse ni QCM cliquables (export, impression). Par défaut : true */
  interactif?: boolean
}

export interface QuestionPreparee {
  contexte: string // consigne et introduction communes, à garder visibles
  enonce: string
  correction: string
  interactive: boolean
}

export interface ExercicePrepare {
  uuid: string
  titre: string
  graine: string
  numero: number
  questions: QuestionPreparee[]
  // Objet MathALÉA, à repasser tel quel à verifier()
  interne: IExercice
}

export interface ResultatVerification {
  juste: boolean
  points: number
  total: number
  retour: string // message de MathALÉA (HTML), vide le plus souvent
  reponses: Record<string, string>
}

let initialise = false

/** À appeler une fois avant le premier exercice */
export async function initialiser() {
  if (initialise) return
  initialise = true
  // Hors du site, aucune remontée d'erreur (bugsnag) : simple journal local
  if (typeof window.notify !== 'function') {
    window.notify = (message: unknown) => console.warn('[moteur]', message)
  }
  await loadMathLive()
}

/**
 * Langue du référentiel : en fr-CH, MathALÉA adapte notations et vocabulaire
 * (\cdot, préimage…). À fixer avant de générer les exercices.
 */
export function definirLangue(langue: 'fr-FR' | 'fr-CH') {
  referentielLocale.set(langue)
}

/**
 * Charge et génère un exercice. Sans graine, une nouvelle est tirée : l'hôte
 * la conserve (ExercicePrepare.graine) pour régénérer exactement les mêmes valeurs.
 * `numero` fixe les identifiants des champs (champTexteEx<numero>Q<i>) : deux
 * exercices affichés en même temps doivent avoir des numéros différents.
 */
export async function preparerExercice(
  params: ParamsExercice,
  numero: number,
): Promise<ExercicePrepare> {
  const exercice = await mathaleaLoadExerciceFromUuid(params.uuid)
  const interactif = params.interactif !== false
  const p: InterfaceParams = {
    ...params,
    alea: params.alea ?? mathaleaGenerateSeed(),
    interactif: interactif ? '1' : '0',
  } as InterfaceParams
  mathaleaHandleParamOfOneExercice(exercice, p)
  exercice.interactif = interactif
  exercice.numeroExercice = numero
  if (exercice.typeExercice === 'simple') {
    mathaleaHandleExerciceSimple(exercice, interactif, numero)
  } else if (typeof exercice.nouvelleVersionWrapper === 'function') {
    seedrandom(String(exercice.seed), { global: true })
    exercice.nouvelleVersionWrapper(numero)
  }
  const contexte = mathaleaFormatExercice(composeQuestionContext(exercice))
  const questions = (exercice.listeQuestions ?? []).map((enonce, i) => ({
    contexte,
    enonce: mathaleaFormatExercice(enonce),
    correction: mathaleaFormatExercice(exercice.listeCorrections?.[i] ?? ''),
    interactive: exercice.autoCorrection?.[i] != null,
  }))
  return {
    uuid: params.uuid,
    titre: exercice.titre ?? '',
    graine: String(exercice.seed),
    numero,
    questions,
    interne: exercice,
  }
}

/**
 * Rend un élément déjà inséré dans le document : formules KaTeX, champs
 * MathLive, figures. À appeler après chaque insertion de HTML du moteur.
 */
export async function afficher(element: HTMLElement) {
  mathaleaRenderDiv(element, -1)
  await loadMathLive(element)
  ajusterFigures(element)
  document.dispatchEvent(new CustomEvent('exercicesAffiches'))
}

/**
 * Réduit les figures mathalea2d plus larges que l'élément (95 % de sa largeur),
 * étiquettes KaTeX comprises. Même calcul que adjustMathalea2dFiguresWidth
 * (ExerciceMathaleaVueEleve.svelte). À rappeler si la largeur change (rotation).
 */
export function ajusterFigures(element: HTMLElement) {
  const largeur = element.clientWidth
  if (!largeur) return
  for (const figure of element.querySelectorAll<SVGElement>('.mathalea2d')) {
    const d = figure.dataset
    if (!d.widthInitiale) d.widthInitiale = figure.getAttribute('width') ?? ''
    if (!d.heightInitiale)
      d.heightInitiale = figure.getAttribute('height') ?? ''
    const largeurInitiale = Number(d.widthInitiale)
    if (!largeurInitiale) continue
    const coef = Math.min(1, (largeur * 0.95) / largeurInitiale)
    figure.setAttribute('width', String(largeurInitiale * coef))
    figure.setAttribute('height', String(Number(d.heightInitiale) * coef))
    for (const etiquette of figure.parentElement?.querySelectorAll<HTMLElement>(
      'div.divLatex',
    ) ?? []) {
      etiquette.style.setProperty(
        'top',
        `${Number(etiquette.dataset.top ?? 0) * coef}px`,
      )
      etiquette.style.setProperty(
        'left',
        `${Number(etiquette.dataset.left ?? 0) * coef}px`,
      )
    }
  }
}

/** Réinjecte des réponses enregistrées dans les champs affichés */
export async function ecrireReponses(reponses: Record<string, string>) {
  await Promise.all(mathaleaWriteStudentPreviousAnswers(reponses))
}

function reponsesDeLaQuestion(exercice: IExercice, i: number) {
  const motif = new RegExp(`Ex${exercice.numeroExercice}Q${i}(?!\\d)`)
  return Object.fromEntries(
    Object.entries(exercice.answers ?? {}).filter(([cle]) => motif.test(cle)),
  )
}

/**
 * Vérifie la question i d'un exercice affiché. Même logique que la vue
 * « une question par page » de MathALÉA (QuestionParPage.svelte).
 */
export function verifier(
  prepare: ExercicePrepare,
  i: number,
): ResultatVerification {
  const exercice = prepare.interne
  exercice.answers ??= {}
  const type = exercice.autoCorrection[i]?.formatInteractif
  let resultat: {
    isOk: boolean
    feedback: string
    score: { nbBonnesReponses: number; nbReponses: number }
  }
  if (type == null) {
    resultat = {
      isOk: false,
      feedback: '',
      score: { nbBonnesReponses: 0, nbReponses: 0 },
    }
  } else if (type === 'cliqueFigure') {
    resultat = uniformiseResults(verifQuestionCliqueFigure(exercice, i))
  } else if (type === 'custom') {
    resultat = uniformiseResults(exercice.correctionInteractive!(i))
  } else {
    const format = interactivityTypeToCustomElementFormat(type) ?? type
    const entree = listOfCustomElements.includes(format)
      ? Array.from(mathaleaCustomElementsRegistry).find(
          ([tag]) => tag === format,
        )
      : undefined
    if (entree == null || typeof entree[1].verifQuestion !== 'function') {
      throw new Error(`Type d'interactivité non pris en charge : ${type}`)
    }
    resultat = uniformiseResults(entree[1].verifQuestion(exercice, i))
  }
  return {
    juste: resultat.isOk,
    points: resultat.score.nbBonnesReponses,
    total: resultat.score.nbReponses,
    retour: resultat.feedback ?? '',
    reponses: reponsesDeLaQuestion(exercice, i),
  }
}

/**
 * Monte le clavier virtuel de MathALÉA (fixé en bas de l'écran, touches
 * propres à chaque champ). Renvoie la fonction qui le démonte. L'élément
 * #mathalea-virtual-keyboard permet à l'hôte de mesurer sa hauteur.
 */
export function monterClavier(cible: HTMLElement): () => void {
  const clavier = mount(Keyboard, { target: cible })
  return () => {
    void unmount(clavier)
  }
}

/** Paramètre réglable d'un exercice, comme dans le formulaire du site (Settings.svelte) */
export interface ParametreExercice {
  cle: 'sup' | 'sup2' | 'sup3' | 'sup4' | 'sup5'
  titre: string
  type: 'nombre' | 'liste' | 'case' | 'texte'
  max?: number // nombre : de 1 à max
  options?: { valeur: string; libelle: string }[] // liste : une valeur ; texte : plusieurs, séparées par des tirets
  aide?: string
  defaut: string
}

export interface DescriptionExercice {
  uuid: string
  titre: string
  nbQuestions: number
  nbQuestionsModifiable: boolean
  parametres: ParametreExercice[]
}

/** Valeurs « n : libellé » d'une info-bulle de paramètre */
const optionsDe = (aide: string) =>
  aide
    .split('\n')
    .map((l) => /^\s*(\d+)\s*:\s*(.+)$/.exec(l))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => ({ valeur: m[1], libelle: m[2].trim() }))

/**
 * Nombre de questions et paramètres (sup à sup5) d'un exercice, avec leurs
 * valeurs par défaut, pour l'éditeur de parcours de l'hôte.
 */
export async function decrireExercice(
  uuid: string,
): Promise<DescriptionExercice> {
  const e = await mathaleaLoadExerciceFromUuid(uuid)
  const parametres: ParametreExercice[] = []
  const suffixes = ['', '2', '3', '4', '5'] as const
  for (const n of suffixes) {
    const cle = `sup${n}` as ParametreExercice['cle']
    const exo = e as unknown as Record<string, unknown>
    const defaut = exo[cle] === undefined ? '' : String(exo[cle])
    const num = exo[`besoinFormulaire${n}Numerique`]
    const texte = exo[`besoinFormulaire${n}Texte`]
    const caseACocher = exo[`besoinFormulaire${n}CaseACocher`]
    if (Array.isArray(num) && num.length >= 2) {
      const aide = typeof num[2] === 'string' ? num[2] : ''
      const options = optionsDe(aide)
      parametres.push(
        options.length
          ? { cle, titre: String(num[0]), type: 'liste', options, defaut }
          : {
              cle,
              titre: String(num[0]),
              type: 'nombre',
              max: Number(num[1]) || undefined,
              aide: aide || undefined,
              defaut,
            },
      )
    } else if (Array.isArray(texte)) {
      const aide = String(texte[1] ?? '')
      const options = optionsDe(aide)
      parametres.push({
        cle,
        titre: String(texte[0]),
        type: 'texte',
        options: options.length ? options : undefined,
        aide: aide.split('\n')[0] || undefined,
        defaut,
      })
    } else if (Array.isArray(caseACocher)) {
      parametres.push({
        cle,
        titre: String(caseACocher[0]),
        type: 'case',
        defaut: defaut === 'true' ? 'true' : 'false',
      })
    }
  }
  return {
    uuid,
    titre: e.titre ?? '',
    nbQuestions: e.nbQuestions ?? 1,
    nbQuestionsModifiable: e.nbQuestionsModifiable !== false,
    parametres,
  }
}

export interface ExerciceDuReferentiel {
  uuid: string
  id: string
  titre: string
  niveau: string
  theme: string
  interactif: boolean
  /** Objectif du programme sous lequel le site range l'exercice (programmes 2025 et suivants) */
  objectif?: { code: string; libelle: string }
}

/**
 * Exercices du référentiel du site (menu « Exercices aléatoires »), pour
 * l'éditeur de parcours de l'hôte. Chargé à la demande : il n'alourdit pas
 * le démarrage.
 */
export async function listerExercices(
  pays: 'FR' | 'CH' = 'FR',
): Promise<ExerciceDuReferentiel[]> {
  const [
    { default: referentiel },
    { default: themes },
    { default: chapitres },
  ] = await Promise.all([
    pays === 'CH'
      ? import('../json/referentiel2022CH.json')
      : import('../json/referentiel2022FR.json'),
    import('../json/codeToThemeList.json'),
    // Noms des chapitres du menu du site (ReferentielNode.svelte)
    pays === 'CH'
      ? import('../json/levelsThemesListCH.json')
      : import('../json/levelsThemesList.json'),
  ])
  const nomsThemes = themes as Record<string, string | Record<string, string>>
  const nomsChapitres = chapitres as Record<string, { titre?: string }>
  const nomTheme = (code: string) => {
    const c = nomsChapitres[code]?.titre
    if (c) return c
    const t = nomsThemes[code]
    return typeof t === 'string' ? t : (t?.['fr-FR'] ?? t?.['fr-CH'] ?? code)
  }
  // Niveau > chapitre > objectif > exercice : le troisième code est un objectif du programme
  const objectifDe = (chemin: string[]) => {
    // Code d'objectif : il prolonge celui du chapitre (5N2 › 5N2G) ; ailleurs (CAN…), aucun
    const code =
      chemin.length >= 4 && chemin[2].startsWith(chemin[1]) ? chemin[2] : ''
    const libelle = code ? nomsChapitres[code]?.titre : undefined
    return libelle ? { objectif: { code, libelle } } : {}
  }
  const liste: ExerciceDuReferentiel[] = []
  const parcourir = (noeud: unknown, chemin: string[]) => {
    if (noeud == null || typeof noeud !== 'object') return
    const n = noeud as Record<string, unknown>
    if (typeof n.uuid === 'string' && typeof n.id === 'string') {
      const features = n.features as
        { interactif?: { isActive?: boolean } } | undefined
      liste.push({
        uuid: n.uuid,
        id: n.id,
        titre: String(n.titre ?? ''),
        niveau: chemin[0] ?? '',
        theme: nomTheme(chemin[1] ?? ''),
        interactif: features?.interactif?.isActive === true,
        ...objectifDe(chemin),
      })
      return
    }
    for (const [cle, valeur] of Object.entries(n))
      parcourir(valeur, [...chemin, cle])
  }
  parcourir(referentiel, [])
  return liste
}
