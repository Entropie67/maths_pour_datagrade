import { createList } from '../format/lists'
import { context } from '../../modules/context'
import { formaterReponse } from '../outils/ecritures'
import { texteEnCouleurEtGras, texteGras } from '../outils/embellissements'
import type {
  AnswerValueType,
  BuildQcmForExerciseParams,
  BuildSimpleVersionQcmParams,
  IExercice,
  MessageMode,
  QcmAutoCorrectionProposition,
  SharedQcmProposition,
} from '../types'
import { alignerMiseEnEvidenceQcm } from './alignerMiseEnEvidenceQcm'
import { propositionsQcm } from './qcm'

const QCM_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

function buildCorrectionSeparator(correction = ''): string {
  if (correction.endsWith('\\end{tikzpicture}')) return '\n\n'
  if (correction !== '') return '<br>'
  return ''
}

function buildCorrectAnswersMessage(
  propositions: SharedQcmProposition[],
  mode: Exclude<MessageMode, 'aucun'>,
): string {
  const bonnesLettres = propositions
    .map((proposition, index) => ({ proposition, index }))
    .filter(({ proposition }) => proposition.statut)
    .map(({ index }) => QCM_LETTERS[index] ?? String(index + 1))

  if (mode === 'multiple') {
    return `Les bonnes réponses sont les réponses ${texteEnCouleurEtGras(bonnesLettres.join(' ; '))}.`
  }

  return `<br>La bonne réponse est la réponse ${texteEnCouleurEtGras(bonnesLettres[0] ?? '')}.`
}

function buildCorrectionsList(
  propositions: SharedQcmProposition[],
  exoInteractif: boolean,
): string {
  const corrections = propositions
    .map((proposition, index) => {
      if (proposition.correction == null || proposition.correction === '')
        return ''
      return (
        // La lettre en gras, et non le rang : hors interactif les propositions sont
        // étiquetées A, B, C… (format 'lettre'), tout comme le message final.
        `${!exoInteractif && QCM_LETTERS[index] ? `réponse ${texteGras(QCM_LETTERS[index])} : ` : ''} ${proposition.correction}` +
        /* +`${ // Eric : J'ai enlevé les coches (21/08/2026)
        context.isHtml
          ? proposition.statut
            ? ' \u2705' // ✅
            : ' \u274C' // ❌
          : proposition.statut
            ? '$ {\\bf \\color[cmyk]{.63,.23,.93,.06}\\boldsymbol{\\checkmark}} $' // ✅
            : '$ {\\bf \\color[rgb]{1,.1,.1}\\boldsymbol{\\times}} $' // ❌
      }*/
        `<br>`
      )
    })
    .filter((correction) => correction !== '')

  if (corrections.length === 0) return ''

  return createList({
    items: corrections,
    style: 'fleches',
  })
}

export function buildQcmForExercise(
  exercice: IExercice,
  questionIndex: number,
  {
    question,
    correction: correctionBrute = '',
    propositions,
    options,
    ajouteQcmCorr = false,
    messageMode = 'single',
  }: BuildQcmForExerciseParams,
): { question: string; correction: string } {
  const bonnes = propositions.filter((proposition) => proposition.statut)
  const correction =
    bonnes.length === 1
      ? alignerMiseEnEvidenceQcm(correctionBrute, bonnes[0].texte)
      : correctionBrute
  const autoCorrectionOptions = { ...(options ?? {}) }

  const qcmPropositions: QcmAutoCorrectionProposition[] = propositions.map(
    (proposition) => ({
      texte: proposition.texte,
      statut: proposition.statut,
      feedback: proposition.feedback,
    }),
  )

  const aucuneIndex = qcmPropositions.findIndex((p) =>
    /^Aucune de ces propositions\.?$/.test(p.texte?.trim() ?? ''),
  )
  const hasAucune = aucuneIndex !== -1
  if (hasAucune && aucuneIndex !== qcmPropositions.length - 1) {
    const [aucuneProp] = qcmPropositions.splice(aucuneIndex, 1)
    qcmPropositions.push(aucuneProp)
  }

  if (autoCorrectionOptions.dontKnow) {
    qcmPropositions.push({
      texte: 'Je ne sais pas',
      statut: false,
    })
    autoCorrectionOptions.lastChoice =
      qcmPropositions.length - (hasAucune ? 3 : 2)
  } else if (hasAucune) {
    autoCorrectionOptions.lastChoice = qcmPropositions.length - 2
  }

  exercice.autoCorrection[questionIndex] = {
    enonce: question,
    formatInteractif: 'mathalea-qcm',
    options: autoCorrectionOptions,
    propositions: qcmPropositions,
  }
  exercice.autoCorrectionAMC = exercice.autoCorrectionAMC ?? []
  exercice.autoCorrectionAMC[questionIndex] = {
    enonce: question,
    options: { ...autoCorrectionOptions, correction },
    propositions: qcmPropositions,
  }

  const qcm = propositionsQcm(exercice, questionIndex, {
    style: 'margin:0 3px 0 3px;',
    format: exercice.interactif ? (options?.format ?? 'case') : 'lettre',
  })

  const shuffledPropositions =
    exercice.autoCorrection[questionIndex].propositions?.map(
      (proposition, index) => {
        const initialIndex = qcm.indexes?.[index] ?? index
        return {
          texte: proposition.texte ?? '',
          statut: Boolean(proposition.statut),
          correction: propositions[initialIndex]?.correction,
          feedback: proposition.feedback,
        }
      },
    ) ?? []

  let correctionTexte = `${correction ?? ''}${buildCorrectionsList(shuffledPropositions, exercice.interactif)}`
  if (correctionTexte === '') {
    correctionTexte = correction
    const extrasAreAdded = ajouteQcmCorr || !exercice.interactif
    if (extrasAreAdded) {
      correctionTexte += buildCorrectionSeparator(correction)
    }
  }

  if (ajouteQcmCorr) {
    correctionTexte += `<br>${qcm.texteCorr}`
  }

  if (!exercice.interactif && messageMode !== 'aucun') {
    correctionTexte += buildCorrectAnswersMessage(
      shuffledPropositions.filter(
        (proposition) => proposition.texte !== 'Je ne sais pas',
      ),
      messageMode,
    )
  }

  return {
    question: `${question}${options?.compact || (context.isHtml && !context.isTypst && propositions.some((proposition) => /<svg\b[^>]*\bmathalea2d\b/.test(proposition.texte))) ? '<br>' : '<br><br>'}${qcm.texte}`,
    correction: correctionTexte,
  }
}

export function buildSimpleVersionQcmProps(
  reponse: AnswerValueType,
  distracteurs: (string | number)[],
): SharedQcmProposition[] {
  return [
    {
      texte: formaterReponse(reponse),
      statut: true,
    },
    ...distracteurs.map((distracteur) => ({
      texte: formaterReponse(distracteur),
      statut: false,
    })),
  ]
}

export function buildSimpleVersionQcm(
  exercice: IExercice,
  questionIndex: number,
  {
    question,
    correction,
    reponse,
    distracteurs,
    options,
  }: BuildSimpleVersionQcmParams,
): { question: string; correction: string } {
  return buildQcmForExercise(exercice, questionIndex, {
    question,
    correction,
    propositions: buildSimpleVersionQcmProps(reponse, distracteurs),
    options,
    messageMode: 'single',
  })
}
