import type Figure from 'apigeom/src/Figure'
import Decimal from 'decimal.js'
import {
  isInteractivityType,
  isQcmValeur,
  interactivityTypeToCustomElementFormat,
  VALEUR_NAMES,
  type AnswerValueType,
  type AutoCorrection,
  type ClickFigures,
  type IExercice,
  type LegacyReponse,
  type LegacyReponses,
  type QcmValeur,
  type ResultOfExerciceInteractif,
  type Valeur,
  type ValeurNormalized,
} from '../../lib/types'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import Grandeur from '../../modules/Grandeur'
import Hms from '../../modules/Hms'
import { ensureAmcParam } from '../amc/amcHelpers'
import {
  inferAmcOptionsFromAnswerType,
  inferNumericValueForAMC,
} from '../amc/amcInferenceHelpers'
import type { AutoCorrectionAMC, ReponseParams } from '../amc/amcTypes'
import {
  listOfCustomElements,
  mathaleaCustomElementsRegistry,
} from '../customElements/MathaleaCustomElement'
import { prepareCliqueFigure } from '../customElements/CliqueFigureElement'
import { addElement, get, setStyles } from '../html/dom'
import { Complexe } from '../mathFonctions/Complexe'
import { afficheScore } from './afficheScore'
import { estUniteManquante, fonctionComparaison } from './comparisonFunctions'
import { syncQcmAutoCorrectionToAmc } from './qcm'
import '../customElements/DragAndDropElement'
import '../customElements/MetaInteractif2dElement'
import '../customElements/PointsCliquablesElement'
import '../customElements/ObjetsCliquablesElement'
import '../customElements/FractionCliquableElement'
import '../customElements/MathaleaLabyrintheElement'
import '../customElements/JuniperGreenElement'
import '../customElements/MathaleaBranchingQcm'
import '../customElements/MetaCustomElement'
import '../apigeom/apigeom-figure'

export function isClickFiguresArray(
  figures: Figure[] | ClickFigures[],
): figures is ClickFigures[] {
  return figures.length > 0 && Array.isArray(figures[0])
}

/**
 * Pour positionner le formatInteractif d'une question sur 'cliqueFigure'
 * On passe this.autoCorrection[i] c'est à dire l'objet réponse de la question.
 * à appeler après avoir rempli l'objet réponse qvec enonce et propositions
 * @param objetReponse
 */
export function setCliqueFigure(objetReponse: AutoCorrection) {
  objetReponse.formatInteractif = 'clique-figure'
}
/**
 * Pour positionner le formatInteractif d'une question sur 'qcm'
 * On passe this.autoCorrection[i] c'est à dire l'objet réponse de la question.
 * à appeler après avoir rempli l'objet réponse qvec enonce et propositions
 * @param objetReponse
 */
export function setQcm(objetReponse: AutoCorrection) {
  objetReponse.formatInteractif = 'qcm'
}
/**
 * Pour positionner le formatInteractif d'une question sur 'listeDeroulante'
 * On passe this.autoCorrection[i] c'est à dire l'objet réponse de la question.
 * à appeler après avoir rempli l'objet réponse qvec enonce et propositions
 * @param objetReponse
 */
export function setListeDeroulante(objetReponse: AutoCorrection) {
  objetReponse.formatInteractif = 'liste-deroulante'
}
// Garde structurel pour éviter d'importer MetaExercice et créer un cycle
const isMetaExercice = (
  x: unknown,
): x is {
  Exercices: unknown[]
  correctionInteractives: Array<(i: number) => string | string[]>
} =>
  typeof x === 'object' &&
  x !== null &&
  Array.isArray((x as { Exercices: unknown[] }).Exercices) &&
  Array.isArray(
    (x as { correctionInteractives: Array<(i: number) => string | string[]> })
      .correctionInteractives,
  )
/**
 * Lit la saisie brute (LaTeX) d'un champ de réponse mathlive avant toute vérification,
 * sans déclencher les effets de bord de verifQuestion (verrouillage du champ, écriture du score...).
 */
function getSaisieBruteChampAvecUnite(
  numeroExercice: number,
  i: number,
  key: string,
): string | null {
  const baseId = `champTexteEx${numeroExercice}Q${i}`
  const mathaleaMathfield = document.querySelector(
    `mathalea-mathfield[mathfield-id="${baseId}"]`,
  ) as
    | (Element & {
        value?: string
        getPromptValue?: (id: string) => string
      })
    | null
  if (key === 'reponse') {
    if (mathaleaMathfield != null) return mathaleaMathfield.value ?? ''
    const champTexte = document.getElementById(baseId) as
      (HTMLElement & { value?: string }) | null
    return champTexte?.value ?? null
  }
  if (/^champ\d+$/.test(key)) {
    return mathaleaMathfield?.getPromptValue?.(key) ?? null
  }
  return null
}

/**
 * Indique si l'exercice contient une réponse attendant une unité (options.unite === true)
 * dont la saisie actuelle en oublie une. Sert à bloquer la toute première vérification
 * pour inviter l'élève à compléter l'unité avant de corriger.
 * Avec `questionIndex`, seule cette question est examinée (vérification question par question).
 */
export function exerciceAUneUniteManquante(
  exercice: IExercice,
  questionIndex?: number,
): boolean {
  if (exercice.numeroExercice == null) return false
  const debut = questionIndex ?? 0
  const fin =
    questionIndex == null ? exercice.autoCorrection.length : questionIndex + 1
  for (let i = debut; i < fin; i++) {
    const valeur = exercice.autoCorrection[i]?.valeur
    if (valeur == null) continue
    for (const key of VALEUR_NAMES) {
      if (key === 'bareme' || key === 'feedback' || key === 'callback') continue
      const champ = valeur[key]
      if (champ == null || typeof champ !== 'object' || !('options' in champ))
        continue
      if (champ.options?.unite !== true) continue
      const saisie = getSaisieBruteChampAvecUnite(
        exercice.numeroExercice,
        i,
        key,
      )
      if (saisie != null && estUniteManquante(saisie)) return true
    }
  }
  return false
}

export type ResultOfQuestionInteractive = {
  isOk: boolean
  feedback: string
  score: { nbBonnesReponses: number; nbReponses: number }
}

/**
 * Vérifie la réponse d'une seule question en appelant la fonction associée à son formatInteractif ('mathlive', 'listeDeroulante', 'cliqueFigure', 'qcm')
 * et affiche son éventuel feedback sous la question.
 * @param {Exercice} exercice
 * @param {number} i indice de la question
 * @returns le résultat de la question, ou `undefined` si elle n'est pas vérifiable (pas de réponse attendue ou format non géré)
 */
export function verifQuestionExercice(
  exercice: IExercice,
  i: number,
): ResultOfQuestionInteractive | undefined {
  // Une question sans réponse attendue (question de démonstration, de rédaction...)
  // au milieu de questions interactives ne doit pas être vérifiée ni comptée.
  if (exercice.autoCorrection[i] == null) return undefined
  const format = exercice.autoCorrection[i]?.formatInteractif ?? 'mathlive'
  const customElementFormat =
    interactivityTypeToCustomElementFormat(format) ?? format
  if (!listOfCustomElements.includes(customElementFormat)) return undefined
  // On traite le cas de tous les MathaleaCustomElement ici
  const liste = Array.from(mathaleaCustomElementsRegistry)
  const [tag, elementClasse] =
    liste.find((custom) => custom[0] === customElementFormat) ?? []
  if (tag == null || elementClasse == null) {
    throw Error(
      "Une classe de listOfCustomElements n'est pas enregistrée dans le registre mathaleaCustomElementsRegistry",
    )
  }
  if (
    elementClasse.verifQuestion == null ||
    typeof elementClasse.verifQuestion !== 'function'
  ) {
    throw Error(
      `L'élément '${tag}' n'a pas de méthode verifQuestion ou celle-ci n'est pas une fonction`,
    )
  }
  const result = elementClasse.verifQuestion(exercice, i)
  if (
    result == null ||
    typeof result !== 'object' ||
    !('isOk' in result) ||
    !('score' in result)
  ) {
    throw Error(
      `L'élément '${tag}' a une fonction verifQuestion qui n'a pas retourné une valeur conforme.`,
    )
  }
  if (result.feedback && result.feedback !== '') {
    const divFeedback = document.querySelector(
      `#feedbackEx${exercice.numeroExercice}Q${i}`,
    )
    if (divFeedback != null) {
      divFeedback.innerHTML = `💡 ${result.feedback}`
      divFeedback.classList.add(
        'py-2',
        'italic',
        'text-coopmaths-warn-darkest',
        'dark:text-coopmathsdark-warn-darkest',
      )
      ;(divFeedback as HTMLDivElement).style.display = 'block'
    }
  }
  return result
}

/**
 * Cette fonction vérifie les réponses de chaque question avec `verifQuestionExercice`
 * @param {Exercice} exercice
 * @param {HTMLDivElement} divScore
 * @param {HTMLButtonElement} buttonScore
 * @returns {{numberOfPoints: number, numberOfQuestions: number}}
 */
export function exerciceInteractif(
  exercice: IExercice,
  divScore: HTMLDivElement,
  buttonScore: HTMLButtonElement,
): ResultOfExerciceInteractif {
  let nbQuestionsValidees = 0
  let nbQuestionsNonValidees = 0
  const perQuestionIsOk: boolean[] = []
  exercice.answers = {}

  const nbQuestions = exercice.autoCorrection.length

  for (let i = 0; i < nbQuestions; i++) {
    const result = verifQuestionExercice(exercice, i)
    if (result == null) continue
    nbQuestionsValidees += result.score.nbBonnesReponses
    nbQuestionsNonValidees +=
      result.score.nbReponses - result.score.nbBonnesReponses
    perQuestionIsOk[i] = result.isOk
  }
  return afficheScore(
    exercice,
    nbQuestionsValidees,
    nbQuestionsNonValidees,
    divScore,
    buttonScore,
    perQuestionIsOk,
  )
}

function ensureCustomFeedbackElement(exercice: IExercice): void {
  // Le get est non strict car on sait que l'élément n'existe pas à la première itération de l'exercice
  let eltFeedback = get(`feedbackEx${exercice.numeroExercice}`, false)
  // On ajoute le div pour le feedback
  if (!eltFeedback) {
    const eltExercice = get(
      `exercice${exercice.numeroExercice}`,
    ) as HTMLDivElement
    eltFeedback = addElement(
      eltExercice,
      'div',
      {
        id: `feedbackEx${exercice.numeroExercice}`,
      },
      '',
    )
  }
  setStyles(eltFeedback, 'marginBottom: 20px')
  if (eltFeedback) eltFeedback.innerHTML = ''
}

function verifQuestionCustom(
  exercice: IExercice,
  questionIndex: number,
): {
  isOk: boolean
  feedback: string
  score: { nbBonnesReponses: number; nbReponses: number }
} {
  const correction = exercice.correctionInteractive?.(questionIndex)
  if (correction == null) {
    return {
      isOk: false,
      feedback: '',
      score: { nbBonnesReponses: 0, nbReponses: 1 },
    }
  }
  if (Array.isArray(correction) && exercice.exoCustomResultat) {
    const nbBonnesReponses = correction.filter(
      (result) => result === 'OK',
    ).length
    return {
      isOk: nbBonnesReponses === correction.length,
      feedback: '',
      score: {
        nbBonnesReponses,
        nbReponses: correction.length,
      },
    }
  }
  const isOk = correction === 'OK'
  return {
    isOk,
    feedback: '',
    score: { nbBonnesReponses: isOk ? 1 : 0, nbReponses: 1 },
  }
}

export function prepareExerciceCliqueFigure(exercice: IExercice) {
  prepareCliqueFigure(exercice)
}

export function exerciceContientCliqueFigure(exercice: IExercice): boolean {
  return (
    exercice.autoCorrection?.some((autoCorrection) => {
      const format = autoCorrection?.formatInteractif
      return (
        (interactivityTypeToCustomElementFormat(format) ?? format) ===
        'clique-figure'
      )
    }) ?? false
  )
}

export function normalizeLegacySetReponseValueForAMC(
  value: LegacyReponse,
  formatInteractif: ReponseParams['formatInteractif'],
): LegacyReponse {
  if (
    formatInteractif !== 'fractionEgale' ||
    !(value instanceof FractionEtendue)
  )
    return value

  const simplified = value.simplifie()
  return simplified.den === 1 ? simplified.num : simplified
}

/**
 * Précise la réponse attendue
 * Cette fonction est dépréciée : elle est remplacée par la fonction handleAnswers qu'elle appelle pour les anciens exercices
 * C'est donc maintenant un wrapper de handleAnswers.
 * @param {Exercice} exercice = this
 * @param {number} i numéro de la question
 * @param {any} valeurs Attention à ce que vous mettez ici : ça doit être en accord avec le formatInteractif ! pas de texNombre ou de stringNombre !
 * @param {ReponseParams} params
 * @deprecated Dans la mesure du possible, utiliser handleAnswers après avoir consulter la doc
 * @see documentation/developpement/auteurs-exercices/interactivite-simple.md
 */
export function setReponse(
  exercice: IExercice,
  i: number,
  valeurs: LegacyReponses,
  params: ReponseParams = {},
) {
  const url = new URL(window.location.href)
  // if (Array.isArray(valeurs) && !url.searchParams.has('testCI')) window.notifyLocal('setReponse a reçu un Array de reponses, il faut en finir avec ça', { valeurs })
  if (exercice.formatInteractif === 'qcm') return
  let formatInteractif = params?.formatInteractif
  let precision = params?.precision
  let signe = params?.signe
  if (formatInteractif === undefined) formatInteractif = 'calcul'
  let reponses: Array<LegacyReponse>
  if (url.hostname === 'localhost' && url.searchParams.has('triche')) {
    console.info(
      `Réponses de l'exercice ${(exercice.numeroExercice ?? 0) + 1} - question ${i + 1} : `,
      valeurs,
    )
  }
  if (
    typeof valeurs === 'object' &&
    (formatInteractif === 'tableauMathlive' ||
      formatInteractif === 'fillInTheBlank')
  ) {
    throw Error(
      'setReponse ne doit pas être utilisé pour tableauMathlive ni fillInTheBlank, il faut utiliser handleAnswers',
    )
  }
  if (Array.isArray(valeurs)) {
    // il peut y avoir une liste de valeurs de réponses à tester, on transfert dans reponses
    reponses = [...valeurs] // reponses contient donc directement le tableau valeurs
    // si valeur est un tableau on prend le signe de la première valeur
    if (valeurs[0] instanceof FractionEtendue) {
      signe = (valeurs[0] as FractionEtendue).signe === -1 // si c'est une fraction, alors on regarde son signe (valeur -1, 0 ou 1)
    } else {
      if (typeof valeurs[0] === 'number') {
        signe = signe ?? valeurs[0] < 0 // on teste si elle est négative, si oui, on force la case signe pour AMC
      } else {
        signe = signe ?? Number(valeurs[0]) < 0
      }
    }
  } else {
    // Il n'y a qu'une valeur, on uniformise le format : reponses est une liste de une seule valeur
    reponses = [valeurs] // ici, valeurs n'est pas un tableau mais on le met dans reponses sous forme de tableau
    if (valeurs instanceof FractionEtendue) {
      signe = valeurs.signe === -1 ? true : Boolean(signe) // si c'est une fraction, alors on regarde son signe (valeur -1, 0 ou 1)
    } else {
      signe = Number(valeurs) < 0 ? true : Boolean(signe) // on teste si elle est négative, si oui, on force la case signe pour AMC
    }
  }
  params.signe = signe

  // @fixme reponses est un array ! toujours. Normalement, il ne devrait y avoir qu'une seule goodAnswer dedans, mais avant, on n'avait pas d'autres moyens pour verifier les saisies diverses
  const reponse: LegacyReponse = (
    reponses as Array<LegacyReponse>
  )[0] as LegacyReponse // reponse est la première d'entre elles (ou la seule)

  // en contexte d'export AMC, on ne touche pas à l'existant
  if (context.isAmc) {
    let laReponseDemandee: LegacyReponse
    if (exercice.autoCorrectionAMC == null) exercice.autoCorrectionAMC = []
    switch (formatInteractif) {
      case 'Num':
        if (!(reponse instanceof FractionEtendue)) {
          window.notify('setReponse : type "Num" une fraction est attendue !', {
            reponses,
            exercice: exercice.uuid,
          })
        } else if (Number.isNaN(reponse.num) || Number.isNaN(reponse.den)) {
          window.notify('setReponse : La fraction ne convient pas !', {
            reponses,
            exercice: exercice.uuid,
          })
        }
        break
      case 'Den':
        if (!(reponse instanceof FractionEtendue)) {
          window.notify('setReponse : type "Den" une fraction est attendue !', {
            reponses,
            exercice: exercice.uuid,
          })
        }
        break
      case 'calcul':
        laReponseDemandee = reponse
        if (typeof laReponseDemandee === 'string') {
          laReponseDemandee = laReponseDemandee.replaceAll('dfrac', 'frac')
        }
        if (
          typeof laReponseDemandee === 'number' ||
          typeof laReponseDemandee === 'string'
        ) {
          laReponseDemandee = laReponseDemandee
            .toString()
            .replace(/\s/g, '')
            .replace(',', '.')
        }
        break

      case 'texte':
        if (!(typeof reponse === 'string')) {
          window.notify(
            'setReponse : type "texte" la réponse n\'est pas un string !',
            { reponses, exercice: exercice.uuid },
          )
        }
        break

      case 'ignorerCasse':
        if (!(typeof reponse === 'string')) {
          window.notify(
            'setReponse : type "ignorerCasse" la réponse n\'est pas un string !',
            { reponses, exercice: exercice.uuid },
          )
        }
        break

      case 'fractionEgale':
        if (!(reponse instanceof FractionEtendue))
          window.notify(
            'setReponse : type "fractionEgale" une fraction est attendue !',
            { reponses, exercice: exercice.uuid },
          )
        else if (isNaN(reponse.num) || isNaN(reponse.den))
          window.notify('setReponse : La fraction ne convient pas !', {
            reponses,
            exercice: exercice.uuid,
          })
        break

      case 'unites': // Pour les exercices où l'on attend une mesure avec une unité au choix
        if (!(reponse instanceof Grandeur)) {
          window.notify(
            'setReponse : type "longueur" la réponse n\'est pas une instance de Grandeur !',
            { reponses, exercice: exercice.uuid },
          )
        }
        break
    }

    if (exercice.autoCorrectionAMC[i] === undefined) {
      exercice.autoCorrectionAMC[i] = {}
    }

    const valeur = Array.isArray(valeurs) ? valeurs[0] : valeurs
    // `setReponse` conserve les anciens formats de comparaison, qui ne sont
    // pas les `formatInteractif` normalisés de `handleAnswers`. Pour AMC, une
    // fractionEgale doit être réduite avant d'en déduire le nombre de cases ;
    // une fraction entière devient un entier (par exemple 100/25 -> 4).
    const valeurAmc = normalizeLegacySetReponseValueForAMC(
      valeur,
      formatInteractif,
    )
    const autoCorrectioAMC: AutoCorrectionAMC = exercice.autoCorrectionAMC[
      i
    ] as AutoCorrectionAMC
    const rep = autoCorrectioAMC ? (autoCorrectioAMC.reponse ?? {}) : {}
    if (params.digits == null && params.decimals == null) {
      const paramsAMCFromAnswerType = inferAmcOptionsFromAnswerType({
        reponse: { value: valeurAmc },
      })
      params = {
        ...params,
        ...paramsAMCFromAnswerType,
      }
    }
    if (rep != null) {
      rep.param = params
      // @ts-expect-error Pour AMC on ne change pas le format de réponse
      rep.valeur = valeurAmc
    }
    exercice.autoCorrectionAMC[i].reponse = rep
    return // La réponse est prête pour AMC
  }
  // Ici on est en context non Amc, donc s'il y a un setReponse, c'est pour html interactif.
  // On va transformer le l'objetReponse pour handleAnswers(), il n'y
  let laReponseDemandee: LegacyReponse
  if (exercice != null) {
    params.formatInteractif = 'mathlive'
    switch (formatInteractif) {
      case 'liste-deroulante': {
        if (exercice.autoCorrection == null) exercice.autoCorrection = []
        if (exercice.autoCorrection[i] == null) exercice.autoCorrection[i] = {}

        const questionAutoCorrection = exercice.autoCorrection[i]
        questionAutoCorrection.formatInteractif = 'liste-deroulante'
        questionAutoCorrection.options = undefined
        questionAutoCorrection.valeur = {
          reponse: {
            value: Array.isArray(reponses)
              ? reponses.map((value) => String(value))
              : String(reponses),
          },
        }
        return
      }
      case 'Num':
        if (!(reponse instanceof FractionEtendue)) {
          window.notify('setReponse : type "Num" une fraction est attendue !', {
            reponses,
            exercice: exercice.uuid,
          })
        } else if (Number.isNaN(reponse.num) || Number.isNaN(reponse.den)) {
          window.notify('setReponse : La fraction ne convient pas !', {
            reponses,
            exercice: exercice.uuid,
          })
        }
        return handleAnswers(
          exercice,
          i,
          {
            reponse: {
              value: String((reponse as FractionEtendue).num),
            },
          },
          params,
        )

      case 'Den':
        if (!(reponse instanceof FractionEtendue)) {
          window.notify('setReponse : type "Den" une fraction est attendue !', {
            reponses,
            exercice: exercice.uuid,
          })
        }
        return handleAnswers(
          exercice,
          i,
          {
            reponse: {
              value: String((reponse as FractionEtendue).den),
            },
          },
          params,
        )

      case 'calcul': {
        if (reponses.length === 1) {
          laReponseDemandee = reponse
          if (typeof laReponseDemandee === 'string') {
            laReponseDemandee = laReponseDemandee
              .replaceAll('dfrac', 'frac')
              .replace(/\s/g, '')
              .replace(',', '.')
          }

          return handleAnswers(
            exercice,
            i,
            {
              reponse: {
                value: laReponseDemandee,
              },
            },
            params,
          )
        }
        const value: string[] = []
        for (let i = 0; i < reponses.length; i++) {
          laReponseDemandee = reponses[i]
          if (typeof laReponseDemandee === 'string') {
            laReponseDemandee = laReponseDemandee
              .replaceAll('dfrac', 'frac')
              .replace(/\s/g, '')
              .replace(',', '.')
          } else if (typeof laReponseDemandee === 'number') {
            laReponseDemandee = String(laReponseDemandee)
          } else if (laReponseDemandee instanceof FractionEtendue) {
            laReponseDemandee = laReponseDemandee.texFraction.replaceAll(
              'dfrac',
              'frac',
            )
          } else if (laReponseDemandee instanceof Decimal) {
            laReponseDemandee = laReponseDemandee.toString()
          }
          value.push(laReponseDemandee as string)
        }

        return handleAnswers(exercice, i, { reponse: { value } }, params)
      }

      case 'texte':
        if (typeof reponse !== 'string') {
          window.notify(
            'setReponse : type "texte" la réponse n\'est pas un string !',
            { reponses, exercice: exercice.uuid },
          )
        }
        return handleAnswers(
          exercice,
          i,
          {
            reponse: {
              value: Array.isArray(reponses)
                ? reponses.map(String)
                : String(reponses),
              options: { texteAvecCasse: true },
            },
          },
          params,
        )

      case 'ignorerCasse':
        if (typeof reponse !== 'string') {
          window.notify(
            'setReponse : type "ignorerCasse" la réponse n\'est pas un string !',
            { reponses, exercice: exercice.uuid },
          )
        }
        return handleAnswers(
          exercice,
          i,
          {
            reponse: {
              value: Array.isArray(reponses)
                ? reponses.map((el) => String(el).toLowerCase())
                : String(reponses).toLowerCase(),
              options: { texteSansCasse: true },
            },
          },
          params,
        )

      case 'fractionEgale':
        if (!(reponse instanceof FractionEtendue)) {
          window.notify(
            'setReponse : type "fractionEgale" une fraction est attendue !',
            { reponses, exercice: exercice.uuid },
          )
        } else if (Number.isNaN(reponse.num) || Number.isNaN(reponse.den)) {
          window.notify('setReponse : La fraction ne convient pas !', {
            reponses,
            exercice: exercice.uuid,
          })
        }
        if (Array.isArray(reponse)) {
          window.notify(
            "setReponse a reçu une liste de réponse pour le format fractionEgale, c'est incohérent !",
            { reponses, exercice: exercice.uuid },
          )
        }
        if (reponse instanceof FractionEtendue) {
          return handleAnswers(
            exercice,
            i,
            {
              reponse: {
                value: reponse, // reponse.texFraction.replace('dfrac', 'frac') plus nécessaire : le wrapper de handleAnswers s'en occupe
              },
            },
            params,
          )
        }
        break

      case 'unites': // Pour les exercices où l'on attend une mesure avec une unité au choix
        if (precision == null) precision = 0 // Des exercices utilisent le format 'unites' mais ne définissent pas la précision
        if (!(reponse instanceof Grandeur)) {
          window.notify(
            'setReponse : type "longueur" la réponse n\'est pas une instance de Grandeur !',
            { reponses, exercice: exercice.uuid },
          )
        }
        if (reponse instanceof Grandeur) {
          return handleAnswers(
            exercice,
            i,
            {
              reponse: {
                value: reponse, // .toString().replace('\u202f', '') plus nécessaire grâce au wrapper de handleAnswers
                options: {
                  unite: true,
                  precisionUnite:
                    10 ** precision *
                    10 ** (reponse.puissanceUnite * reponse.puissancePrefixe),
                },
              },
            },
            params,
          )
        }
        break
      case 'intervalleStrict': // Pour les exercice où la saisie doit être dans un intervalle
        if (
          reponses.length !== 2 ||
          reponses.filter((el) => typeof el !== 'number').length !== 0
        ) {
          window.notify(
            'setReponse : type "intervalle" la réponse n\'est pas un tupple [number,number] !',
            { reponses, exercice: exercice.uuid },
          )
        }
        return handleAnswers(
          exercice,
          i,
          {
            reponse: {
              value: `]${reponses[0]};${reponses[1]}[`,
              options: { estDansIntervalle: true },
            },
          },
          params,
        )
      case 'intervalle':
        if (
          !Array.isArray(reponses) ||
          reponses.length !== 2 ||
          reponses.filter((el) => typeof el !== 'number').length !== 0
        ) {
          window.notify(
            'setReponse : type "intervalle" la réponse n\'est pas un tupple [number,number] !',
            { reponses, exercice: exercice.uuid },
          )
        }
        return handleAnswers(
          exercice,
          i,
          {
            reponse: {
              value: `[${reponses[0]};${reponses[1]}]`,
              options: { estDansIntervalle: true },
            },
          },
          params,
        )
      case 'puissance':
        if (typeof reponse !== 'string') {
          window.notify(
            'setReponse : type "puissance" la réponse n\'est pas un string !',
            { reponses, exercice: exercice.uuid },
          )
        }
        return handleAnswers(
          exercice,
          i,
          {
            reponse: {
              value: String(reponse),
              options: { puissance: true },
            },
          },
          params,
        )
    }
  }

  if (exercice.autoCorrection[i] === undefined) {
    exercice.autoCorrection[i] = {}
  }
  if (exercice.autoCorrection[i].valeur === undefined) {
    exercice.autoCorrection[i].valeur = {}
  }
  exercice.autoCorrection[i].valeur = handleDefaultValeur({
    reponse: { value: reponses as unknown as AnswerValueType },
  }) as ValeurNormalized
}

// La solution est-elle un nombre ? Si oui, on force l'option nombreDecimalSeulement.
function isValidNumber(value: unknown): boolean {
  // Convertir la valeur en chaîne et remplacer les séparateurs de milliers (par exemple, ',')
  const cleanedValue = String(value)
    .replace(/,/g, '') // Enlève les caractères ',' (séparateurs de milliers comme dans "1,5")
    .replace(',', '.') // Remplace la virgule par un point pour les décimales
  // Vérifier que la chaîne ne contient que des chiffres et un seul séparateur décimal (point ou virgule)
  // Ou un nombre javascript écrit dans tous les formats supportés
  // const validNumberPattern = /^[+-]?(\d*(\.\d*)?([eE][+-]?\d*)?|0[xX][0-9a-fA-F]*|0[bB][01]*)$/
  const validNumberPattern = /^[+-]?\d+(.\d+)?$/

  // Vérifier si la chaîne nettoyée correspond à un nombre valide
  return validNumberPattern.test(cleanedValue)
}

function handleDefaultValeur(reponse: Valeur): ValeurNormalized {
  for (const [, val] of Object.entries(reponse)) {
    if (val !== undefined) {
      if (val?.value !== undefined) {
        if (Array.isArray(val.value)) {
          if (val.options?.estDansIntervalle) {
            // Si c'est un intervalle, on s'assure que les bornes sont des nombres valides
            if (
              val.value.length === 2 &&
              isValidNumber(val.value[0]) &&
              isValidNumber(val.value[1])
            ) {
              val.value = `]${val.value.map(String).join(';')}[`
            }
          }
          for (let i = 0; i < val.value.length; i++) {
            if (typeof val.value[i] === 'string') continue
            if (
              val.value[i] instanceof Decimal ||
              val.value[i] instanceof Grandeur ||
              val.value[i] instanceof Hms ||
              typeof val.value[i] === 'number'
            ) {
              val.value[i] = val.value[i].toString()
            }
            if (val.value[i] instanceof Complexe) {
              val.value[i] = val.value[i].tex()
            }
            if (val.value[i] instanceof FractionEtendue)
              val.value[i] = val.value[i].texFraction
          }
        } else {
          if (typeof val.value === 'string') continue
          if (
            val.value instanceof Decimal ||
            val.value instanceof Grandeur ||
            val.value instanceof Hms ||
            typeof val.value === 'number'
          ) {
            val.value = val.value.toString()
          }
          if (val.value instanceof Complexe) {
            val.value = val.value.tex()
          }
          if (val.value instanceof FractionEtendue)
            val.value = val.value.texFraction
        }
      }

      if (val.compare === undefined) val.compare = fonctionComparaison
      if (val.options === undefined || Object.keys(val.options).length === 0) {
        let reponseAttendueEstUnNombre: boolean
        if (Array.isArray(val.value)) {
          reponseAttendueEstUnNombre = true
          for (let ee = 0; ee < val.value.length; ee++) {
            reponseAttendueEstUnNombre &&= isValidNumber(val.value[ee])
          }
        } else {
          reponseAttendueEstUnNombre = isValidNumber(val.value)
        }
        const options = reponseAttendueEstUnNombre
          ? { nombreDecimalSeulement: true }
          : {}
        val.options = options
      }
    }
  }
  return reponse as ValeurNormalized // La normalisation consiste à transformer toute value en string et c'est fait maintenant par cette fonction
}

/**
 * La fonction à privilégier à partir de maintenant.
 * @param {Exercice} exercice
 * @param {number} question
 * @param {AnswerType} reponses
 * @param {ReponseParams} params
 */
export function handleAnswers(
  exercice: IExercice,
  question: number,
  reponses: Valeur | QcmValeur,
  params: ReponseParams | undefined = {},
) {
  if (params?.formatInteractif === 'mathalea-qcm') {
    if (!isQcmValeur(reponses)) {
      window.notify(
        "handleAnswers() attend une valeur QCM pour le format 'mathalea-qcm'",
        { reponses, exercice: exercice.uuid, question },
      )
      return
    }
    exercice.autoCorrection ??= []
    const qcm = reponses.qcm
    exercice.autoCorrection[question] = {
      enonce: qcm.enonce,
      formatInteractif: 'mathalea-qcm',
      options: { ...(qcm.options ?? {}) },
      propositions: qcm.propositions.map((proposition) => ({
        texte: proposition.texte,
        statut: proposition.statut,
        feedback: proposition.feedback,
      })),
    }
    syncQcmAutoCorrectionToAmc(exercice, question, qcm.correction)
    return
  }
  if (isQcmValeur(reponses)) {
    window.notify(
      "Une valeur QCM doit utiliser formatInteractif: 'mathalea-qcm'",
      { reponses, exercice: exercice.uuid, question },
    )
    return
  }
  let formatInteractif =
    params?.formatInteractif ??
    exercice.autoCorrection[question]?.formatInteractif ??
    exercice.formatInteractif ??
    ('champ1' in reponses
      ? 'fill-in-the-blank'
      : typeof reponses === 'object' &&
          Object.keys(reponses).some((key) => key.match(/^L\d+C\d+$/))
        ? 'tableau-mathlive'
        : 'mathalea-mathfield')
  if (context.isAmc) {
    if (exercice.autoCorrectionAMC == null) exercice.autoCorrectionAMC = []
    if (exercice.autoCorrectionAMC[question] === undefined) {
      exercice.autoCorrectionAMC[question] = {}
    }
    const autoCorrectioAMC: AutoCorrectionAMC = exercice.autoCorrectionAMC[
      question
    ] as AutoCorrectionAMC
    const normalizeAmcValue = (val: any) => {
      if (typeof val === 'number') {
        return val
      }
      if (val instanceof FractionEtendue) {
        return { num: val.num, den: val.den }
      }
      if (val instanceof Decimal) {
        return val.toFixed(3)
      }
      if (typeof val === 'string') {
        return inferNumericValueForAMC(val)
      }
      return val
    }
    if (
      String(formatInteractif).toLowerCase() === 'mathlive' ||
      formatInteractif === 'mathalea-mathfield'
    ) {
      const reponseValue =
        'reponse' in reponses
          ? reponses.reponse!.value
          : 'champ1' in reponses
            ? reponses.champ1!.value
            : Object.keys(reponses).some((key) => key.match(/^L\d+C\d+$/))
              ? Object.fromEntries(
                  Object.entries(reponses)
                    .filter(([key]) => key.match(/^L\d+C\d+$/))
                    .map(([key, val]) => [key, val.value]),
                )
              : undefined
      if (
        typeof reponseValue === 'number' ||
        typeof reponseValue === 'string' ||
        reponseValue instanceof FractionEtendue ||
        reponseValue instanceof Decimal
      ) {
        autoCorrectioAMC.reponse = autoCorrectioAMC.reponse ?? {
          valeur: normalizeAmcValue(reponseValue),
        }
        const param = {
          ...ensureAmcParam(exercice, question),
          ...inferAmcOptionsFromAnswerType(reponses),
        }

        autoCorrectioAMC.reponse.param = {
          ...param,
        }
      }
    }
  }

  if (exercice.autoCorrection == null) exercice.autoCorrection = []
  if (!(reponses instanceof Object)) {
    window.notify(`handleAnswer() reponses doit être un objet : ${reponses}`, {
      reponses,
      exercice: exercice.uuid,
    })
  }

  if (exercice.autoCorrection[question] === undefined) {
    exercice.autoCorrection[question] = {}
  }

  if (formatInteractif === undefined) formatInteractif = 'mathalea-mathfield'

  const questionAutoCorrection = exercice.autoCorrection[question]
  const param = { ...(params ?? {}) }
  delete param.formatInteractif
  const normalizedFormatInteractif = isInteractivityType(formatInteractif)
    ? formatInteractif
    : 'mathlive'

  questionAutoCorrection.formatInteractif = normalizedFormatInteractif
  questionAutoCorrection.options =
    Object.keys(param).length > 0 ? param : undefined
  questionAutoCorrection.valeur = handleDefaultValeur(
    reponses,
  ) as unknown as ValeurNormalized

  const url = new URL(window.location.href)

  if (url.hostname === 'localhost' && url.searchParams.has('triche')) {
    console.info(
      `Réponses de l'exercice ${(exercice.numeroExercice ?? 0) + 1} - question ${question + 1} : `,
      questionAutoCorrection.valeur,
    )
  }
}

export function uniformiseResults(results: any): {
  isOk: boolean
  feedback: string
  score: { nbBonnesReponses: number; nbReponses: number }
} {
  if (typeof results === 'string') {
    // On traite ici le cas 'OK'|'KO'
    return {
      isOk: results === 'OK',
      feedback: '',
      score: {
        nbBonnesReponses: results === 'OK' ? 1 : 0,
        nbReponses: 1,
      },
    }
  } else if (
    Array.isArray(results) &&
    results.every((r) => typeof r === 'string')
  ) {
    // On traite ici le cas ['OK','OK','KO',...]
    const nbBonnesReponses = results.filter((r) => r === 'OK').length
    return {
      isOk: nbBonnesReponses === results.length,
      feedback: '',
      score: {
        nbBonnesReponses,
        nbReponses: results.length,
      },
    }
  } else if (
    typeof results === 'object' &&
    results !== null &&
    'isOk' in results
  ) {
    // On traite ici le cas { isOk: boolean, feedback?: string, score?: { nbBonnesReponses: number, nbReponses: number } }
    return {
      isOk: Boolean(results.isOk),
      feedback: typeof results.feedback === 'string' ? results.feedback : '',
      score:
        typeof results.score === 'object' && results.score !== null
          ? {
              nbBonnesReponses: Number(results.score.nbBonnesReponses) || 0,
              nbReponses: Number(results.score.nbReponses) || 0,
            }
          : { nbBonnesReponses: 0, nbReponses: 0 },
    }
  } else {
    window.notify(`Résultats au format inattendu :`, {
      results: JSON.stringify(results),
    })
    return {
      isOk: false,
      feedback: '',
      score: { nbBonnesReponses: 0, nbReponses: 0 },
    }
  }
}
