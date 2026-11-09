import type { MathfieldElement } from 'mathlive'
import {
  compteChampsDeReponse,
  pointsMaxDuBareme,
} from '../interactif/baremeExercice'
import type { CompareResult } from '../interactif/checks/types'
import { fonctionComparaison } from '../interactif/comparisonFunctions'
import { toutPourUnPoint } from '../interactif/fonctionsBaremes'
import { nommeChampsAutourDe } from '../interactif/nomAccessibleChamp'
import type { IExercice } from '../types'
import type ListeDeroulanteElement from './ListeDeroulanteElement'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'
/**
 * @author Jean-Claude Lhote
 */
export class MetaInteractif2dElement extends MathaleaCustomElement {
  static readonly elementTag = 'meta-interactif-2d'

  static create({
    id,
    numeroExercice,
    questionIndex,
    fieldIndex,
    innerHtml = '',
    interactivityOn = true,
  }: {
    id?: string
    numeroExercice: number
    questionIndex: number
    fieldIndex: number
    innerHtml?: string
    interactivityOn?: boolean
  }): string {
    const elementId =
      id ??
      `${MetaInteractif2dElement.elementTag}Ex${numeroExercice}Q${questionIndex}field${fieldIndex}`
    return `<${MetaInteractif2dElement.elementTag} id="${elementId}" numero-exercice="${numeroExercice}" question-index="${questionIndex}" field-index="${fieldIndex}" interactivity-on="${interactivityOn ? 'true' : 'false'}" style="display: inline-flex; position: relative; align-items: center;">${innerHtml}<span id="resultatCheckEx${numeroExercice}Q${questionIndex}field${fieldIndex}" style="position: absolute; left: 100%; top: 50%; transform: translateY(-50%); margin-left: 4px;"></span></${MetaInteractif2dElement.elementTag}>`
  }

  static pointsMaxQuestion(exercice: IExercice, i: number): number {
    const valeur = exercice.autoCorrection?.[i]?.valeur
    return pointsMaxDuBareme(valeur?.bareme, compteChampsDeReponse(valeur))
  }

  static verifQuestion(
    exercice: IExercice,
    i: number,
  ): {
    isOk: boolean
    feedback: string
    score: { nbBonnesReponses: number; nbReponses: number }
  } {
    let eltFeedback = document.querySelector(
      `#resultatCheckEx${exercice.numeroExercice}Q${i}`,
    ) as HTMLSpanElement
    if (!eltFeedback) {
      const firstField = document.querySelector(
        `#MetaInteractif2dEx${exercice.numeroExercice}Q${i}field0`,
      )
      const svgContainer =
        firstField == null ? null : findRelativePositionContainer(firstField)
      const insertAfter =
        svgContainer ??
        firstField?.parentElement ??
        document.querySelector(`#exercice${exercice.numeroExercice}`)
      eltFeedback = document.createElement('span')
      eltFeedback.id = `resultatCheckEx${exercice.numeroExercice}Q${i}`
      eltFeedback.style.display = 'block'
      eltFeedback.style.marginTop = '4px'
      eltFeedback.style.marginBottom = '16px'
      if (insertAfter) {
        insertAfter.insertAdjacentElement('afterend', eltFeedback)
      } else {
        document.body.appendChild(eltFeedback)
      }
    }
    if (eltFeedback) {
      eltFeedback.style.marginBottom = '20px'
      eltFeedback.innerHTML = ''
    }
    if (exercice.autoCorrection[i]?.valeur == null) {
      throw Error(
        `MetaInteractif2dElement.verifQuestion appelé sur une question sans réponse: ${JSON.stringify(
          {
            exercice,
            question: i,
            autoCorrection: exercice.autoCorrection[i],
          },
        )}`,
      )
    }
    const reponses = exercice.autoCorrection[i].valeur
    if (reponses == null) {
      window.notify(
        `MetaInteractif2dElement.verifQuestion: reponses est null pour la question ${i} de l'exercice ${exercice.id}`,
        { exercice, i },
      )
      return {
        isOk: false,
        feedback: 'erreur dans le programme',
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }
    const bareme: (arg: number[]) => [number, number] =
      reponses.bareme ?? toutPourUnPoint
    const variables = Object.entries(reponses).filter(
      ([key]) => key !== 'bareme' && key !== 'feedback',
    )
    const points = []
    const saisies: Record<string, string> = {}
    let feedback = ''
    let compteurSaisiesVides = 0
    let compteurBonnesReponses = 0
    let noFeedback = false
    for (const [field, reponse] of variables) {
      const options = reponse.options
      noFeedback = noFeedback || Boolean(options?.noFeedback)
      const compareFunction = reponse.compare ?? fonctionComparaison
      const index = parseInt(field.replace('field', ''), 10)
      // Un champ peut être une liste déroulante placée hors de la figure
      // (id `liste-deroulanteEx<n>Q<i>field<k>`).
      const liste = document.querySelector<ListeDeroulanteElement>(
        `#liste-deroulanteEx${exercice.numeroExercice}Q${i}field${index}`,
      )
      if (liste != null) {
        const choix = liste.value
        const smiley = liste.querySelector<HTMLSpanElement>(
          `[id="resultatCheckEx${exercice.numeroExercice}Q${i}field${index}"]`,
        )
        if (choix === '') {
          compteurSaisiesVides++
          points.push(0)
          if (smiley != null) smiley.innerHTML = '☹️'
          continue
        }
        saisies[`liste-deroulanteEx${exercice.numeroExercice}Q${i}${field}`] =
          choix
        const estJuste = choix === String(reponse.value)
        if (estJuste) compteurBonnesReponses++
        points.push(estJuste ? 1 : 0)
        if (smiley != null) smiley.innerHTML = estJuste ? '😎' : '☹️'
        continue
      }
      const mf = document.querySelector(
        `#MetaInteractif2dEx${exercice.numeroExercice}Q${i}field${index}`,
      ) as MathfieldElement
      const smiley = document.getElementById(
        `resultatCheckEx${exercice.numeroExercice}Q${i}field${index}`,
      )
      const saisie = mf.getPromptValue('champ1')
      if (saisie === '') {
        compteurSaisiesVides++
        mf.classList.add('corrected')
        points.push(0)
        if (smiley != null) smiley.innerHTML = '☹️'
        continue
      }
      saisies[`MetaInteractif2dEx${exercice.numeroExercice}Q${i}${field}`] =
        saisie
      let result
      if (Array.isArray(reponse.value)) {
        let ii = 0
        while (!result?.isOk && ii < reponse.value.length) {
          result = compareFunction(saisie, reponse.value[ii], options)
          ii++
        }
      } else {
        result = compareFunction(saisie, reponse.value, options)
      }
      if (result.isOk) {
        compteurBonnesReponses++
        points.push(scoreFromResult(result))
        mf.setPromptState('champ1', 'correct', true)
        mf.classList.add('correct')
      } else {
        points.push(scoreFromResult(result))
        mf.setPromptState('champ1', 'incorrect', true)
        mf.classList.add('incorrect')
        if (result.feedback === 'saisieVide') result.feedback = null
        else {
          result = {
            isOk: false,
            feedback: '',
          }
        }
      }
      mf.classList.add('corrected')
      if (smiley != null) smiley.innerHTML = result.isOk ? '😎' : '☹️'
      if (result.feedback != null) feedback += result.feedback
    }

    if (compteurBonnesReponses === variables.length) {
      feedback = ''
    } else if (compteurSaisiesVides > 0) {
      feedback = `Il manque ${compteurSaisiesVides} réponse${compteurSaisiesVides > 1 ? 's' : ''}.`
    } else {
      feedback = `Certaines réponses sont incorrectes.`
    }

    const [nbBonnesReponses, nbReponses] = bareme(points)
    const spanReponseLigne = document.querySelector(
      `#resultatCheckEx${exercice.numeroExercice}Q${i}`,
    ) as HTMLSpanElement
    if (spanReponseLigne != null) {
      spanReponseLigne.innerHTML = nbBonnesReponses === nbReponses ? '😎' : '☹️'
    }
    exercice.answers ??= {}
    exercice.answers[`MetaInteractif2dEx${exercice.numeroExercice}Q${i}`] =
      JSON.stringify(saisies)

    document
      .querySelectorAll<MetaInteractif2dElement>(
        `${MetaInteractif2dElement.elementTag}[numero-exercice="${exercice.numeroExercice}"][question-index="${i}"]`,
      )
      .forEach((element) => {
        element.interactivityOn = false
      })
    document
      .querySelectorAll<ListeDeroulanteElement>(
        `liste-deroulante[id^="liste-deroulanteEx${exercice.numeroExercice}Q${i}field"]`,
      )
      .forEach((liste) => {
        liste.interactivityOn = false
      })

    return {
      isOk: nbBonnesReponses === nbReponses,
      feedback: noFeedback ? '' : feedback,
      score: { nbBonnesReponses, nbReponses },
    }
  }

  static formatStudentAnswer(rawAnswer: string): string {
    return formatMetaInteractif2dAnswer(rawAnswer)
  }

  render(): string | void {
    nommeChampsAutourDe(this)
    return super.render()
  }

  protected onInteractivityChanged(isOn: boolean): void {
    this.querySelectorAll<MathfieldElement>('math-field').forEach((field) => {
      field.readOnly = true
      field.disabled = !isOn
      field.tabIndex = isOn ? 0 : -1
    })
  }
}

function scoreFromResult(result: { isOk: boolean }): number {
  const score = (result as Partial<CompareResult>).score
  return typeof score === 'number' ? score : result.isOk ? 1 : 0
}

function formatMetaInteractif2dAnswer(rawAnswer: string): string {
  try {
    const parsed = JSON.parse(rawAnswer) as Record<string, unknown>
    const values = Object.entries(parsed).filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === 'string' && entry[1] !== '',
    )
    return values
      .map(([key, value]) =>
        key.startsWith('liste-deroulante') ? value : `$${value}$`,
      )
      .join(' et ')
  } catch {
    return rawAnswer
  }
}

registerMathaleaCustomElement(MetaInteractif2dElement)

function findRelativePositionContainer(element: Element): HTMLElement | null {
  let current = element.parentElement
  while (current != null) {
    if (
      current.tagName === 'DIV' &&
      current.style.position.toLowerCase() === 'relative'
    ) {
      return current
    }
    current = current.parentElement
  }
  return null
}
