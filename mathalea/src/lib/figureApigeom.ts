import Figure from 'apigeom'
import { get } from 'svelte/store'
import {
  ApigeomFigureElement,
  apigeomFigureToSvg,
} from './apigeom/apigeom-figure'
import { canOptions } from '../../src/lib/stores/canStore'
import { DomReadyActionElement } from './customElements/DomReadyAction'
import type { IExercice } from '../lib/types'
import { context } from '../modules/context'
import { exercicesParams } from './stores/generalStore'
import { globalOptions } from './stores/globalOptions'
import { enableFigureUiRecovery } from './apigeom/recoverFigureUi'

/**
 * Identifiant de la figure évaluée de chaque question (indice de question
 * affiché → id de la figure), pour chaque tableau `autoCorrection`. Ce tableau
 * est recréé par reinit() à chaque nouveau tirage de l'exercice : l'état est
 * ainsi remis à zéro avec lui.
 */
const evaluatedFigureIds = new WeakMap<
  IExercice['autoCorrection'],
  Map<number, string>
>()

export function isFigureArray(
  figs: IExercice['figuresApiGeom'],
): figs is Figure[] {
  return Array.isArray(figs) && figs.length > 0 && figs[0] instanceof Figure
}

/**
 * - Insère une figure apigeom dans la sortie HTML de l'exercice
 *
 * - defaultAction permet de sélectionner le bouton activé par défaut (bouton qui doit être présent dans la toolbar de la figure)
 *
 * - L'id est générée automatiquement avec le numéro de l'exercice et de la question
 *
 * - Si une même question a plusieurs figures, il faut ajouter un idAddendum (par exemple 'Correction' pour la figure de correction)
 */
export default function figureApigeom({
  exercice,
  figure,
  animation = false,
  i,
  defaultAction,
  idAddendum = '',
  isDynamic,
  hasFeedback = true,
}: {
  exercice: IExercice
  figure: Figure
  animation?: boolean
  i: number
  /** identifiant supplémentaire pour identifier l'
   * si c'est la figure de la correction ou une 2e figure dans la question
   */
  idAddendum?: string
  /** Action en cours au lancement de l'exercice qui doit obligatoirement être un bouton de la toolbar */
  defaultAction?: string
  /** figure chargé en interactif et pourtant on souhaite qu'elle soit statique => isDynamic = false */
  isDynamic?: boolean
  /** la figure sera-t-elle évaluée ? */
  hasFeedback?: boolean
}): string {
  if (!context.isHtml) return ''
  // Export Typst : le montage DOM différé (DomReadyActionElement) ci-dessous
  // ne s'exécute jamais dans le pipeline Typst (chaîne de caractères, sans
  // DOM), donc la figure resterait un simple <div> vide. `apigeomFigureToSvg`
  // fournit directement le SVG (texte intégré) à embarquer comme image.
  if (context.isTypst) return apigeomFigureToSvg(figure)
  // Styles par défaut
  figure.isDynamic = isDynamic !== undefined ? isDynamic : !!exercice.interactif
  figure.divButtons.style.display = figure.isDynamic ? 'grid' : 'none'
  figure.divUserMessage.style.fontSize = '1em'
  figure.divUserMessage.style.pointerEvents = 'none'
  figure.divUserMessage.style.removeProperty('color')
  figure.divUserMessage.classList.add('text-coopmaths-struct')
  if (!exercice.interactif) {
    figure.divUserMessage.style.display = 'none'
  }
  // Quand l'exercice est réhébergé comme une question d'un méta-exercice, ses
  // questions sont décalées : c'est l'index dans l'exercice affiché qui doit
  // servir aux identifiants DOM, sinon deux sous-exercices produisent les mêmes
  // (`...F0`) et les clés de `answers` ne correspondent plus à la question.
  const indexQuestionAffichee = i + (exercice.indexQuestionHote ?? 0)
  const idApigeom = `apigeomEx${exercice.numeroExercice}F${indexQuestionAffichee}${idAddendum}`
  figure.id = idApigeom

  // Une question n'a qu'une figure évaluée : la première figure dynamique
  // enregistrée (la figure de correction, appelée ensuite, ne l'est pas), quel
  // que soit son idAddendum. Ne pas déduire cet état de autoCorrection[i] : un
  // tirage peut être rejeté après avoir appelé figureApigeom(), puis être
  // remplacé à ce même index, avec le même id.
  const evaluatedIds =
    evaluatedFigureIds.get(exercice.autoCorrection) ?? new Map()
  evaluatedFigureIds.set(exercice.autoCorrection, evaluatedIds)
  const registeredId = evaluatedIds.get(indexQuestionAffichee)
  const isEvaluatedFigure =
    hasFeedback &&
    exercice.interactif === true &&
    typeof exercice.correctionInteractive === 'function' &&
    isDynamic !== false &&
    (idAddendum === '' ||
      registeredId === undefined ||
      registeredId === idApigeom)
  if (isEvaluatedFigure) evaluatedIds.set(indexQuestionAffichee, idApigeom)
  const verifyCallbackName = `${idApigeom}-verification`
  const verificationCallback = (
    displayedExercice: IExercice,
    questionIndex: number,
  ) => {
    const result = exercice.correctionInteractive!(questionIndex)
    if (exercice.answers != null) {
      displayedExercice.answers = {
        ...displayedExercice.answers,
        ...exercice.answers,
      }
    }
    return result
  }
  if (isEvaluatedFigure) {
    const goodAnswers = (exercice as IExercice & { goodAnswers?: unknown[] })
      .goodAnswers
    // `goodAnswers` est indexé par question ; `goodAnswers[i]` contient les
    // réponses attendues de CETTE question (un tableau de points à placer, ou
    // une réponse unique). Le barème de la question est donc le nombre de
    // points qu'elle demande, pas le nombre de questions de l'exercice.
    const goodAnswersQuestion = Array.isArray(goodAnswers)
      ? goodAnswers[i]
      : undefined
    const pointsMax = Array.isArray(goodAnswersQuestion)
      ? Math.max(goodAnswersQuestion.length, 1)
      : 1
    ApigeomFigureElement.registerVerificationCallback(
      verifyCallbackName,
      verificationCallback,
      pointsMax,
    )
    exercice.autoCorrection[i] = {
      ...(exercice.autoCorrection[i] ?? {}),
      formatInteractif: ApigeomFigureElement.elementTag,
    }
  }

  // Auto-enregistrement de la figure dans le champ dédié figuresApiGeom pour
  // qu'elle soit détruite par reinit() (cf. exportedReinit), indépendamment de
  // l'endroit où l'exercice la range par ailleurs (this.figure, variable
  // locale…). Sans cela, les figures apigeom non suivies ne sont jamais
  // détruites → fuite mémoire (listeners DOM + références circulaires).
  // NB : on n'utilise PAS exercice.figures qui est surchargé (Figure[] pour
  // apigeom OU ClickFigures[] pour cliqueFigure).
  if (!Array.isArray(exercice.figuresApiGeom)) exercice.figuresApiGeom = []
  if (!exercice.figuresApiGeom.includes(figure)) {
    exercice.figuresApiGeom.push(figure)
  }
  const setupAction = `figureApigeom:setup:${idApigeom}`

  // Pour revoir la copie de l'élève dans Capytale
  // Attention, la clé de answers[] doit contenir apigeom, c'est pourquoi l'id est généré par cette fonction
  function idApigeomFunct(event: Event): void {
    if (!figure.options) {
      // figure effacée, donc on annule la mise à jour...
      destroy()
      return
    }
    const customEvent = event as CustomEvent
    const json = customEvent.detail
    figure.loadJson(JSON.parse(json))
    if (get(canOptions).isChoosen && get(canOptions).state === 'solutions') {
      // c'est la can et on est en mode solutions
      figure.divButtons.style.display = 'none'
      figure.divUserMessage.style.display = 'none'
    }
  }
  document.addEventListener(idApigeom, idApigeomFunct)

  let oldZoom = 1
  function updateZoom(event: Event): void {
    if (!figure.options) {
      // figure effacée, donc on annule la mise à jour...
      destroy()
      return
    }
    // console.log('ExZoom:' + idApigeom)
    const customEvent = event as CustomEvent
    const targetContainer = customEvent.detail.container
    const figureContainer = document.getElementById(idApigeom)
    if (
      targetContainer instanceof HTMLElement &&
      (figureContainer === null || !targetContainer.contains(figureContainer))
    ) {
      return
    }
    const zoom = Number(customEvent.detail.zoom)
    if (oldZoom !== zoom) {
      oldZoom = zoom
      // console.log('zoom:' + idApigeom + ':' + zoom)
      if (figure != null)
        figure.zoom(zoom, {
          changeHeight: true,
          changeWidth: true,
          changeLeft: false,
          changeBottom: false,
        })
    }
  }
  document.addEventListener('zoomChanged', updateZoom)

  function updateAffichage(container: HTMLDivElement): void {
    if (!figure.options) {
      // figure effacée, donc on annule la mise à jour...
      destroy()
      return
    }
    if (!context.isHtml) {
      return
    }

    container.innerHTML = ''
    try {
      figure.setContainer(container)
      enableFigureUiRecovery(figure)
    } catch (e) {
      window.notify(
        `figureApigeom: erreur lors du setContainer de la figure ${idApigeom}`,
        {
          figure,
          container,
          exo: exercice,
          globalOptions: get(globalOptions),
          exercicesParams: get(exercicesParams),
        },
      )
      throw e
    }

    if (animation) {
      figure.divUserMessage.innerHTML = ''
      figure.restart()
      setTimeout(() => {
        figure.buttons.get('PLAY')?.click()
      }, 3000)
    }
    if (defaultAction) {
      figure.buttons.get(defaultAction)?.click()
      // MGu que la première fois
      defaultAction = ''
    }
    const zoom = Number(get(globalOptions).z)
    if (oldZoom !== zoom) {
      oldZoom = zoom
      figure.zoom(zoom, {
        changeHeight: true,
        changeWidth: true,
        changeLeft: false,
        changeBottom: false,
      })
    }
  }
  // Le conteneur peut se déconnecter du DOM sans que la figure ne soit
  // détruite pour autant (onglet TBI masqué, exercice replié en disposition
  // libre...) : Svelte détruit puis recrée le sous-arbre, donc l'élément
  // <mathalea-dom-ready> se déconnecte puis s'en reconnecte un nouveau, avec
  // la même action. Désinscrire le callback à la déconnexion l'empêcherait
  // d'être retrouvé à la reconnexion (la figure resterait vide jusqu'au
  // rechargement de la page). La désinscription réelle est déjà assurée par
  // destroy() ci-dessous, appelé explicitement quand la figure est vraiment
  // détruite (cf. exportedReinit).
  const setupCallback = ({ element }: { element: HTMLElement }) => {
    // Le conteneur de cette figure est le frère placé juste avant son
    // <mathalea-dom-ready>. On part de l'élément qui a déclenché le montage
    // plutôt que d'interroger tout le document par id : lors d'un changement
    // de vue Svelte, l'ancien et le nouveau sous-arbre peuvent coexister le
    // temps d'une frame et porter brièvement le même id.
    const container = element.previousElementSibling
    if (!(container instanceof HTMLDivElement) || container.id !== idApigeom) {
      return
    }
    updateAffichage(container)
  }
  DomReadyActionElement.registerCallback(setupAction, setupCallback)

  // --------------------------
  // CLEANUP
  // --------------------------

  let destroyed = false
  const destroy = () => {
    if (destroyed) return
    destroyed = true
    DomReadyActionElement.unregisterCallback(setupAction, setupCallback)
    if (isEvaluatedFigure) {
      ApigeomFigureElement.unregisterVerificationCallback(
        verifyCallbackName,
        verificationCallback,
      )
    }
    document.removeEventListener(idApigeom, idApigeomFunct)
    document.removeEventListener('zoomChanged', updateZoom)
  }

  // On surcharge la méthode clearHtml de la figure pour faire le cleanup des listeners
  const originalDestroy = figure.destroy?.bind(figure)

  figure.destroy = () => {
    destroy()
    // Appeler Apigeom original pour purger ce qu’il doit purger
    if (figure.options && originalDestroy) {
      originalDestroy()
    }
  }

  if (hasFeedback) {
    const content = `<div class="m-6 leading-none" id="${idApigeom}"></div>${DomReadyActionElement.create(
      {
        id: `${idApigeom}-setup`,
        action: setupAction,
      },
    )}<span id="resultatCheckEx${exercice.numeroExercice}Q${indexQuestionAffichee}"></span><div class="ml-2 py-2 text-coopmaths-warn-darkest dark:text-coopmathsdark-warn-darkest" id="feedbackEx${exercice.numeroExercice}Q${indexQuestionAffichee}"></div>`
    return isEvaluatedFigure
      ? `<${ApigeomFigureElement.elementTag} legacy-mount numero-exercice="${exercice.numeroExercice ?? 0}" index="${indexQuestionAffichee}" verify-callback-name="${verifyCallbackName}">${content}</${ApigeomFigureElement.elementTag}>`
      : content
  }
  return `<div class="m-6 leading-none" id="${idApigeom}"></div>${DomReadyActionElement.create(
    {
      id: `${idApigeom}-setup`,
      action: setupAction,
    },
  )}`
}
