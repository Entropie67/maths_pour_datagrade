/**
 * @author Jean-claude Lhote
 */
import { buildAMCId } from './amcHelpers'
import { normalizeAMCNum, normalizeAMCOpen, normalizeQcm } from './amcNormalize'
import {
  AMCHybrideContainerTemplate,
  AMCIntervalsTemplate,
  AMCNumTemplate,
  AMCOpenTemplate,
  qcmTemplate,
  renderTemplate,
} from './amcTemplates'
import type {
  AMCElement,
  AMCHybrideRenderParams,
  AMCUneProposition,
  AutoCorrectionAMC,
  QuestionContext,
  QuestionQcmContext,
} from './amcTypes'

export function renderQcm(
  autoCorrectionItem: AMCUneProposition,
  contexte: QuestionQcmContext,
) {
  if (autoCorrectionItem.amcInterval != null) {
    return renderTemplate(AMCIntervalsTemplate, {
      ref: contexte.ref,
      id: contexte.id,
      enonce:
        autoCorrectionItem.enonce ??
        contexte.exercice.listeQuestions[contexte.index],
      correction:
        autoCorrectionItem.options?.correction ??
        contexte.exercice.listeCorrections[contexte.index],
      interval: autoCorrectionItem.amcInterval,
    })
  }
  const data = normalizeQcm(autoCorrectionItem, contexte)
  return renderTemplate(qcmTemplate, data)
}

export function renderAMCNum(
  item: AutoCorrectionAMC,
  contexte: QuestionContext,
) {
  const data = normalizeAMCNum(item, contexte)
  return renderTemplate(AMCNumTemplate, {
    ...data,
  })
}

export function renderOpen(item: AMCUneProposition, contexte: QuestionContext) {
  const data = normalizeAMCOpen(item, contexte)
  return renderTemplate(AMCOpenTemplate, {
    ...data,
  })
}

export function renderAMCHybride(params: AMCHybrideRenderParams): {
  texQr: string
  nextId: number
  melange: boolean
} {
  const {
    type,
    autoCorrectionItem,
    exercice,
    ref,
    idExo,
    questionIndex,
    currentId,
  } = params

  let id = currentId
  const item = autoCorrectionItem ?? {}
  let melange = params.melange

  if (type !== 'AMCHybride') {
    ;(
      window as { notify?: (message: string, payload?: unknown) => void }
    ).notify?.(
      'exportQcmAMC : Il doit y avoir une erreur de type AMC, je ne connais pas le type : ',
      { type },
    )
  }

  item.enonce = item.enonce ?? exercice.listeQuestions[questionIndex]
  if (item.enonce === undefined || item.propositions === undefined) {
    return { texQr: '', nextId: id, melange }
  }

  if (item.melange !== undefined) {
    melange = item.melange
  }

  const opts = item.options ?? {}
  const props: Array<Record<string, any>> = item.propositions ?? []
  const blocks: string[] = []

  const stripElementWrapper = (latex: string): string => {
    const match = latex.match(/\\element\s*\{[^}]*\}\s*\{([\s\S]*)\}\s*$/)
    return match ? match[1].trim() : latex.trim()
  }

  const withQuestionNumberDisabled = (
    latex: string,
    disableNumber: boolean,
  ): string => {
    if (!disableNumber) return latex
    return `\\def\\AMCbeginQuestion#1#2{}\\AMCquestionNumberfalse\n${latex}`
  }

  const enrichAMCNumBlock = (
    latex: string,
    options: { correction?: string; subQuestionText?: string },
  ): string => {
    let content = latex
    const correction = options.correction?.trim()
    const subQuestionText = options.subQuestionText
      ?.replace(/^undefined\s*(<br\s*\/?>|\\\\)\s*/i, '')
      .trim()

    if (correction && !content.includes('\\explain{')) {
      content = content.replace(
        /(\\begin\{questionmultx\}\{[^}]*\}\s*)/,
        (match) => `${match}\\explain{${correction}}\n`,
      )
    }

    if (subQuestionText && !content.includes(subQuestionText)) {
      content = content.replace(
        /\\AMCnumericChoices/,
        (match) => `${subQuestionText}\n${match}`,
      )
    }

    return content
  }

  for (let qr = 0; qr < props.length; qr++) {
    const prop = props[qr] ?? {}
    const qType = prop.type
    const blockId = buildAMCId(ref, idExo, id)

    if (qType === 'qcmMono' || qType === 'qcmMult') {
      const disableNumber =
        (qr > 0 &&
          (qType === 'qcmMono' ||
            (qType === 'qcmMult' && !opts.avecSymboleMult))) ||
        !!opts.numerotationEnonce

      const blockLatex = renderQcm(prop, {
        type: qType === 'qcmMult' ? 'qcmMult' : 'qcm',
        ref,
        id: blockId,
        exercice,
        index: questionIndex,
      })

      blocks.push(
        withQuestionNumberDisabled(
          stripElementWrapper(blockLatex),
          disableNumber,
        ),
      )
      id++
      continue
    }

    if (qType === 'AMCOpen') {
      const p0 = prop.propositions?.[0] ?? {}
      const disableNumber = qr > 0 || p0.numQuestionVisible === false

      const blockLatex = renderOpen(prop, {
        ref,
        id: blockId,
        exercice,
        index: questionIndex,
      })

      let content = stripElementWrapper(blockLatex)
      if (p0.numQuestionVisible === false) {
        content = content.replace(
          /\\begin\{question\}\{([^}]*)\}/,
          '\\begin{question}{$1}\\QuestionIndicative',
        )
      }
      blocks.push(withQuestionNumberDisabled(content, disableNumber))
      id++
      continue
    }

    if (qType === 'AMCNum') {
      const p0 = prop.propositions?.[0] ?? {}
      const disableNumber =
        qr > 0 || (qr === 0 && item.enonceApresNumQuestion === true)
      const correction =
        typeof prop.texte === 'string'
          ? prop.texte
          : typeof p0.texte === 'string'
            ? p0.texte
            : ''
      const displayLabel =
        typeof p0.reponse?.display?.label === 'string'
          ? p0.reponse.display.label
          : undefined
      const subQuestionText =
        displayLabel ??
        (typeof p0.reponse?.texte === 'string' ? p0.reponse.texte : '')

      const delegatedNum = {
        enonce: p0.enonce ?? prop.enonce ?? '',
        reponse: p0.reponse,
      }

      const blockLatex = renderAMCNum(delegatedNum, {
        ref,
        id: blockId,
        exercice,
        index: questionIndex,
      })

      blocks.push(
        withQuestionNumberDisabled(
          enrichAMCNumBlock(stripElementWrapper(blockLatex), {
            correction,
            subQuestionText,
          }),
          disableNumber,
        ),
      )
      id++
    }
  }

  const enonceTexte =
    item.enonceAvant === undefined
      ? `${item.enonce} ${item.enonceCentre !== undefined || item.enonceCentre ? '' : '\n '}`
      : item.enonceAvant
        ? `${item.enonce} ${item.enonceCentre !== undefined || item.enonceCentre ? '' : '\n '}`
        : item.enonceAvantUneFois && questionIndex === 0
          ? `${item.enonce} ${item.enonceCentre !== undefined || item.enonceCentre ? '' : '\n '}`
          : ''

  const texQr = renderTemplate(AMCHybrideContainerTemplate, {
    ref,
    multicolsAll: !!opts.multicolsAll,
    barreseparation: !!opts.barreseparation,
    numerotationEnonce: !!opts.numerotationEnonce,
    enonceId: buildAMCId(ref, idExo, currentId + 10) + 'Enonce',
    enonceAGauche:
      Array.isArray(item.enonceAGauche) && item.enonceAGauche.length === 2,
    enonceAGaucheLeft: Array.isArray(item.enonceAGauche)
      ? item.enonceAGauche[0]
      : 0.5,
    enonceAGaucheRight: Array.isArray(item.enonceAGauche)
      ? item.enonceAGauche[1]
      : 0.5,
    enonceCentre: item.enonceCentre !== undefined || item.enonceCentre,
    enonce: enonceTexte,
    multicols: !!opts.multicols && !opts.multicolsAll,
    closeMulticols: !!opts.multicols || !!opts.multicolsAll,
    content: blocks.join('\n'),
  })

  return { texQr, nextId: id, melange }
}

export function renderElement(
  element: AMCElement,
  contexte: QuestionContext | QuestionQcmContext,
) {
  switch (element.type) {
    case 'qcm':
      return renderQcm(element.data, contexte as QuestionQcmContext)
    case 'num':
      return renderAMCNum(element.data, contexte)
    case 'open':
      return renderOpen(element.data, contexte)
  }
}
