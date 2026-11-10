import type { MathfieldElement } from 'mathlive'
import type ListeDeroulanteElement from '../customElements/ListeDeroulanteElement'
import type { IExercice } from '../../lib/types'
import type { CompareResult } from './checks/types'
import { fonctionComparaison } from './comparisonFunctions'
import { toutPourUnPoint } from './fonctionsBaremes'

export type MathLiveVerificationResult = {
  isOk: boolean
  feedback: string
  score: { nbBonnesReponses: number; nbReponses: number }
}

type FieldElement = HTMLInputElement | MathfieldElement
type PromptState = 'correct' | 'incorrect' | 'undefined' | undefined

type LockablePromptMathfield = MathfieldElement & {
  getPromptState?: (id: string) => [PromptState, boolean]
  setPromptState: (id: string, state: PromptState, locked: boolean) => void
}

function scoreFromResult(result: { isOk: boolean }): number {
  const score = (result as Partial<CompareResult>).score
  return typeof score === 'number' ? score : result.isOk ? 1 : 0
}

function errorResult(): MathLiveVerificationResult {
  return {
    isOk: false,
    feedback: 'erreur dans le programme',
    score: { nbBonnesReponses: 0, nbReponses: 1 },
  }
}

function getQuestionData(exercice: IExercice, i: number) {
  const questionAutoCorrection = exercice.autoCorrection[i]
  if (questionAutoCorrection == null) {
    throw Error(
      `Vérification MathLive appelée sur une question sans réponse: ${JSON.stringify(
        {
          exercice,
          question: i,
          autoCorrection: questionAutoCorrection,
        },
      )}`,
    )
  }
  const reponses = questionAutoCorrection.valeur
  if (reponses == null) {
    window.notify(
      `Vérification MathLive: reponses est null pour la question ${i} de l'exercice ${exercice.id}`,
      { exercice, i },
    )
    return null
  }
  return {
    questionAutoCorrection,
    reponses,
    bareme: reponses.bareme ?? toutPourUnPoint,
    variables: Object.entries(reponses).filter(
      ([key]) => key !== 'callback' && key !== 'bareme' && key !== 'feedback',
    ),
  }
}

function writeFeedback(exercice: IExercice, i: number, feedback: string): void {
  const divFeedback = document.querySelector(
    `#feedbackEx${exercice.numeroExercice}Q${i}`,
  )
  if (feedback.length === 0 || divFeedback == null) return
  divFeedback.innerHTML = `💡 ${feedback}`
  divFeedback.classList.add(
    'py-2',
    'italic',
    'text-coopmaths-warn-darkest',
    'dark:text-coopmathsdark-warn-darkest',
  )
  ;(divFeedback as HTMLDivElement).style.display = 'block'
}

function ordinalFr(n: number): string {
  return n === 1 ? '1ère' : `${n}e`
}

function lockFillInTheBlankPrompts(mfe: MathfieldElement): void {
  const promptMathfield = mfe as LockablePromptMathfield
  mfe.classList.add('corrected')
  for (const promptId of mfe.getPrompts()) {
    const [state] = promptMathfield.getPromptState?.(promptId) ?? [undefined]
    promptMathfield.setPromptState(promptId, state, true)
  }
  mfe.readOnly = true
}

export function verifySingleMathLiveField(
  exercice: IExercice,
  i: number,
  field: FieldElement | null,
  writeResult = true,
): MathLiveVerificationResult {
  let champTexte = field
  try {
    const data = getQuestionData(exercice, i)
    if (data == null) return errorResult()
    const { reponses, bareme } = data
    const spanReponseLigne = document.querySelector(
      `#resultatCheckEx${exercice.numeroExercice}Q${i}`,
    ) as HTMLSpanElement | null

    if (typeof reponses.callback === 'function') {
      const variables = data.variables
      const mfe = champTexte as MathfieldElement | null
      if (mfe != null) {
        if (
          'getValue' in mfe &&
          mfe.getValue().length > 0 &&
          typeof exercice.answers === 'object'
        ) {
          exercice.answers[`Ex${exercice.numeroExercice}Q${i}`] = mfe.getValue()
        }
        if (mfe.value.length > 0 && typeof exercice.answers === 'object') {
          exercice.answers[`Ex${exercice.numeroExercice}Q${i}`] = mfe.value
        }
      }
      return reponses.callback(exercice, i, variables, bareme)
    }

    if (champTexte == null) {
      champTexte = document.getElementById(
        `champTexteEx${exercice.numeroExercice}Q${i}`,
      ) as FieldElement | null
    }
    if (champTexte == null) {
      throw Error(
        `Vérification champ MathLive: champ introuvable ${JSON.stringify({
          selecteur: `champTexteEx${String(exercice.numeroExercice)}Q${String(i)}`,
        })}`,
      )
    }
    if (champTexte.value.length > 0 && typeof exercice.answers === 'object') {
      exercice.answers[`Ex${exercice.numeroExercice}Q${i}`] = champTexte.value
    }
    const saisie = champTexte.value
    let customFeedback = ''
    if (typeof reponses.feedback === 'function') {
      customFeedback = reponses.feedback({ saisie })
    }
    const objetReponse = reponses.reponse
    if (objetReponse == null) {
      window.notify(
        `Vérification champ MathLive: objetReponse est null pour la question ${i} de l'exercice ${exercice.id}`,
        { exercice, i },
      )
      return errorResult()
    }

    const options = objetReponse.options ?? {}
    const noFeedback = options.noFeedback ?? false
    if (saisie == null || saisie === '') {
      champTexte.readOnly = true
      // Une question vide vaut autant de points qu'une question remplie.
      const [, nbReponsesVide] = bareme([0])
      return {
        isOk: false,
        feedback: noFeedback ? '' : 'Vous devez saisir une réponse.',
        score: { nbBonnesReponses: 0, nbReponses: nbReponsesVide ?? 1 },
      }
    }

    let isOk = false
    let feedback = ''
    let bestScore = 0
    const compareFunction = objetReponse.compare ?? fonctionComparaison
    const expectedValues = Array.isArray(objetReponse.value)
      ? objetReponse.value
      : [objetReponse.value]
    for (const reponse of expectedValues) {
      const check = compareFunction(saisie, reponse, options)
      const checkScore = scoreFromResult(check)
      bestScore = Math.max(bestScore, checkScore)
      if (check.isOk) {
        isOk = true
        bestScore = 1
        feedback = check.feedback ?? ''
        break
      }
      if (check.feedback) feedback = check.feedback
    }

    let nbReponses = 1
    let nbBonnesReponses = bestScore
    ;[nbBonnesReponses, nbReponses] = bareme([bestScore])
    bestScore = nbBonnesReponses

    if (customFeedback.length > 0) {
      feedback = `${feedback} ${feedback.length > 0 ? '<br>' : ''} ${customFeedback}`
    }
    if (spanReponseLigne != null) {
      spanReponseLigne.innerHTML = ''
      if (isOk) {
        spanReponseLigne.innerHTML = '😎'
        spanReponseLigne.style.fontSize = 'large'
      } else if (writeResult) {
        spanReponseLigne.innerHTML = '☹️'
        spanReponseLigne.style.fontSize = 'large'
      }
    }
    if (isOk || writeResult) champTexte.readOnly = true
    return {
      isOk,
      feedback: noFeedback ? '' : feedback,
      score: { nbBonnesReponses: bestScore, nbReponses: nbReponses ?? 1 },
    }
  } catch (error) {
    console.error('Erreur dans verifySingleMathLiveField', error)
    window.notify(`Erreur dans verifySingleMathLiveField : ${error}`, {
      champTexteValue: champTexte?.value ?? null,
      exercice: exercice?.id,
      i,
      autoCorrection: exercice?.autoCorrection[i],
      errorMessage: error instanceof Error ? error.message : '',
      errorStack: error instanceof Error ? error.stack : '',
    })
    return errorResult()
  }
}

export function verifyFillInTheBlankMathLive(
  exercice: IExercice,
  i: number,
  mathfield: MathfieldElement | null,
): MathLiveVerificationResult {
  try {
    const data = getQuestionData(exercice, i)
    if (data == null) return errorResult()
    const { reponses, bareme, variables } = data
    const mfe =
      mathfield ??
      (document.querySelector(
        `#champTexteEx${exercice.numeroExercice}Q${i}`,
      ) as MathfieldElement | null)
    if (mfe == null) {
      throw Error(
        `Vérification fill-in-the-blank: mathfield introuvable ${JSON.stringify(
          {
            selecteur: `math-field#champTexteEx${exercice.numeroExercice}Q${i}`,
          },
        )}`,
      )
    }

    if (typeof reponses.callback === 'function') {
      // Sans cette sauvegarde, la copie rechargée (Capytale…) n'aurait aucune saisie à restaurer.
      if (mfe.getValue().length > 0 && typeof exercice.answers === 'object') {
        exercice.answers[`Ex${exercice.numeroExercice}Q${i}`] = mfe.getValue()
      }
      const result = reponses.callback(exercice, i, variables, bareme)
      lockFillInTheBlankPrompts(mfe)
      return result
    }

    const points = []
    const saisies: Record<string, string> = {}
    let feedback = ''
    let compteurSaisiesVides = 0
    let compteurBonnesReponses = 0
    let noFeedback = false
    for (const [key, reponse] of variables) {
      if (!key.match(/champ\d/)) continue
      const saisie = mfe.getPromptValue(key)
      saisies[key] = saisie
      const compareFunction = reponse.compare ?? fonctionComparaison
      const options = reponse.options
      noFeedback = noFeedback || Boolean(options?.noFeedback)
      let result
      let compareFeedback = ''
      if (
        (saisie == null || saisie === '') &&
        Array.isArray(reponse.value) &&
        reponse.value.includes('')
      ) {
        // Une valeur attendue vide ('') accepte un champ laissé vide (module 1 non écrit).
        result = { isOk: true }
      } else if (saisie == null || saisie === '') {
        compteurSaisiesVides++
        result = { isOk: false, feedback: 'saisieVide' }
      } else {
        const expectedValues = Array.isArray(reponse.value)
          ? reponse.value
          : [reponse.value]
        for (const expected of expectedValues) {
          result = compareFunction(saisie, expected, options)
          if (result.feedback) compareFeedback = result.feedback
          if (result.isOk) break
        }
      }
      if (result.isOk) {
        compteurBonnesReponses++
        points.push(scoreFromResult(result))
        mfe.setPromptState(key, 'correct', true)
      } else {
        points.push(scoreFromResult(result))
        mfe.setPromptState(key, 'incorrect', true)
        if (result.feedback === 'saisieVide') result.feedback = null
        else {
          const fieldNumber =
            variables.length > 1
              ? `${ordinalFr(Number(key.charAt(key.length - 1)))} réponse : `
              : ''
          if (!compareFeedback) {
            result = {
              isOk: false,
              feedback: `${fieldNumber}Le résultat est incorrect.<br>`,
            }
          } else {
            const firstChar = compareFeedback.charAt(0)
            const lowerFirst =
              fieldNumber !== '' && /[a-zA-Z]/.test(firstChar)
                ? firstChar.toLowerCase()
                : firstChar
            result.feedback = `${fieldNumber}${lowerFirst + compareFeedback.slice(1)}<br>`
          }
        }
      }
      mfe.classList.add('corrected')
      if (result.feedback != null) feedback += result.feedback
    }

    if (compteurBonnesReponses === variables.length) {
      if (!feedback || feedback.trim() === '') feedback = ''
    } else if (
      compteurBonnesReponses === 0 &&
      compteurSaisiesVides === 0 &&
      !feedback
    ) {
      feedback =
        variables.length === 1
          ? " Le résultat n'est pas correct."
          : " Aucun résultat n'est correct."
    }
    if (compteurSaisiesVides === 1) {
      feedback += ` Il manque une réponse dans ${variables.length === 1 ? 'la' : 'une'} zone de saisie.<br>`
    } else if (compteurSaisiesVides > 1) {
      feedback += ` Il manque une réponse dans ${compteurSaisiesVides} zones de saisie.<br>`
    }
    if (typeof reponses.feedback === 'function') {
      feedback += reponses.feedback(saisies)
      writeFeedback(exercice, i, feedback)
    }
    const [nbBonnesReponses, nbReponses] = bareme(points)
    if (mfe.getValue().length > 0 && typeof exercice.answers === 'object') {
      exercice.answers[`Ex${exercice.numeroExercice}Q${i}`] = mfe.getValue()
    }
    lockFillInTheBlankPrompts(mfe)
    const spanReponseLigne = document.querySelector(
      `#resultatCheckEx${exercice.numeroExercice}Q${i}`,
    ) as HTMLSpanElement | null
    if (spanReponseLigne != null) {
      spanReponseLigne.innerHTML = nbBonnesReponses === nbReponses ? '😎' : '☹️'
    }
    return {
      isOk: nbBonnesReponses === nbReponses,
      feedback: noFeedback ? '' : feedback,
      score: { nbBonnesReponses, nbReponses },
    }
  } catch (error) {
    console.error('Erreur dans verifyFillInTheBlankMathLive', error)
    window.notify(`Erreur dans verifyFillInTheBlankMathLive : ${error}`, {
      exercice: exercice?.id,
      i,
      autoCorrection: exercice?.autoCorrection[i],
      errorMessage: error instanceof Error ? error.message : '',
      errorStack: error instanceof Error ? error.stack : '',
    })
    return errorResult()
  }
}

export function verifyTableauMathLive(
  exercice: IExercice,
  i: number,
  table: HTMLTableElement | null,
): MathLiveVerificationResult {
  try {
    const data = getQuestionData(exercice, i)
    if (data == null) return errorResult()
    const { reponses, bareme, variables } = data
    if (typeof reponses.callback === 'function') {
      return reponses.callback(exercice, i, variables, bareme)
    }
    const tableElement =
      table ??
      document.querySelector<HTMLTableElement>(
        `table#tabMathliveEx${exercice.numeroExercice}Q${i}`,
      )
    if (tableElement == null) {
      throw Error(
        `Vérification tableau-mathlive: tableau introuvable ${JSON.stringify({
          selecteur: `table#tabMathliveEx${exercice.numeroExercice}Q${i}`,
        })}`,
      )
    }
    const points = []
    let resultat = 'OK'
    const cellules = variables.filter(([key]) => key.match(/L\dC\d/) != null)
    for (const [key, reponse] of cellules) {
      const options = reponse.options
      const noFeedback = Boolean(options?.noFeedback)
      const compareFunction = reponse.compare ?? fonctionComparaison
      const input = Array.from(
        tableElement.querySelectorAll('math-field, liste-deroulante'),
      ).find(
        (el) => el.id === `champTexteEx${exercice.numeroExercice}Q${i}${key}`,
      ) as (MathfieldElement | ListeDeroulanteElement) | undefined
      if (input == null) {
        throw Error(
          `Vérification tableau-mathlive: cellule introuvable ${JSON.stringify({
            selecteur: `champTexteEx${exercice.numeroExercice}Q${i}${key}`,
          })}`,
        )
      }
      const isListe = input.tagName === 'LISTE-DEROULANTE'
      const resultatCheckCellId = `resultatCheckEx${exercice.numeroExercice}Q${i}${key}`
      const resultatCheckCell =
        document.getElementById(resultatCheckCellId) ??
        document.createElement('span')
      resultatCheckCell.id = resultatCheckCellId
      if (resultatCheckCell.parentElement !== input.parentElement) {
        input.parentElement?.insertBefore(resultatCheckCell, input.nextSibling)
      }

      const expectedValues = Array.isArray(reponse.value)
        ? reponse.value
        : [reponse.value]
      let result
      if (
        input.value === '' &&
        !(options?.nonReponseAcceptee && expectedValues.includes(''))
      ) {
        result = {
          isOk: false,
          feedback: noFeedback
            ? ''
            : `Vous devez saisir une réponse dans la cellule ${key}.<br>`,
        }
      } else {
        if (isListe) {
          // Une liste déroulante compare une simple égalité de texte plutôt
          // que la comparaison mathématique utilisée pour les math-fields.
          const isOk = expectedValues.some(
            (valeur: unknown) => String(valeur) === input.value,
          )
          result = { isOk, feedback: '' }
        } else {
          for (const expected of expectedValues) {
            result = compareFunction(input.value, expected, options)
            if (result.isOk) break
          }
        }
      }
      points.push(scoreFromResult(result))
      if (result.isOk) {
        resultatCheckCell.innerHTML = '😎'
      } else {
        resultat = 'KO'
        resultatCheckCell.innerHTML = '☹️'
      }
      if (input.value.length > 0 && typeof exercice.answers === 'object') {
        exercice.answers[`Ex${exercice.numeroExercice}Q${i}${key}`] =
          input.value
      }
      if (isListe) {
        ;(input as ListeDeroulanteElement).interactivityOn = false
      } else {
        ;(input as MathfieldElement).readOnly = true
      }
    }
    const [nbBonnesReponses, nbReponses] = bareme(points)
    return {
      isOk: resultat === 'OK',
      feedback: '',
      score: { nbBonnesReponses, nbReponses },
    }
  } catch (error) {
    console.error('Erreur dans verifyTableauMathLive', error)
    window.notify(`Erreur dans verifyTableauMathLive : ${error}`, {
      exercice: exercice?.id,
      i,
      autoCorrection: exercice?.autoCorrection[i],
      errorMessage: error instanceof Error ? error.message : '',
      errorStack: error instanceof Error ? error.stack : '',
    })
    return errorResult()
  }
}
