import type { ResultatAnalyse } from './analyseScan'
import type { OmrBoxReading, OmrBoxStatus, OmrEvaluation } from './omrTypes'
import { noterCopie } from './scoring'

export interface OmrRevision {
  cases: Record<string, Record<string, OmrBoxStatus>>
  questions: Record<
    string,
    Record<string, { points?: number; commentaire: string }>
  >
  validees: string[]
}

export function revisionVide(): OmrRevision {
  return { cases: {}, questions: {}, validees: [] }
}

export function lecturesRevisees(
  resultat: ResultatAnalyse,
  copieId: string,
): OmrBoxReading[] {
  return (resultat.lectures?.[copieId] ?? []).map((lecture) => ({
    ...lecture,
    status: resultat.revision?.cases[copieId]?.[lecture.id] ?? lecture.status,
  }))
}

/** Repartir des mesures originales : annuler une décision restitue la lecture. */
export function reviserResultat(
  evaluation: OmrEvaluation,
  resultat: ResultatAnalyse,
): ResultatAnalyse {
  if (!resultat.lectures) return resultat
  const copies = resultat.copies.map((original) => {
    const copie = noterCopie(
      evaluation,
      original.copieId,
      lecturesRevisees(resultat, original.copieId),
      resultat.pages
        .filter((p) => p.statut === 'ok' && p.copieId === original.copieId)
        .map((p) => p.page!),
    )
    for (const question of copie.questions) {
      const decision =
        resultat.revision?.questions[copie.copieId]?.[question.qid]
      if (decision?.points != null) {
        if (
          !Number.isFinite(decision.points) ||
          decision.points < 0 ||
          decision.points > question.pointsMax
        ) {
          throw new Error(
            'La note doit être comprise entre zéro et le maximum de la question.',
          )
        }
        question.points = decision.points
        question.statut = 'lu'
      }
    }
    copie.points = copie.questions.reduce((total, q) => total + q.points, 0)
    copie.aArbitrer = copie.questions.filter(
      (q) => q.statut !== 'lu' && q.statut !== 'sansReponse',
    ).length
    return copie
  })
  return { ...resultat, copies }
}

/** Réponse codée attendue, issue du corrigé propre à cette version du sujet. */
export function reponseAttendue(
  evaluation: OmrEvaluation,
  copieId: string,
  qid: string,
): string {
  const copie = evaluation.copies.find((c) => c.copieId === copieId)!
  const question = evaluation.questions.find((q) => q.qid === qid)!
  const boxes = evaluation.layouts[copie.layoutId].filter((b) => b.qid === qid)
  if (question.type === 'AMCOpen') return 'Évaluation du correcteur'
  if (question.type === 'AMCNum')
    return boxes
      .filter((b) => b.correct)
      .sort(
        (a, b) =>
          Number(a.id.split('.').at(-1)!.split('_')[0]) -
          Number(b.id.split('.').at(-1)!.split('_')[0]),
      )
      .map((b) => b.valeur ?? '')
      .join('')
  return boxes
    .map((b, i) => (b.correct ? String.fromCharCode(65 + i) : ''))
    .filter(Boolean)
    .join(', ')
}

/** Valider les copies prêtes, sans masquer les arbitrages ni les absences. */
export function validerCopies(
  resultat: ResultatAnalyse,
  copieId?: string,
): ResultatAnalyse {
  const revision = structuredClone(resultat.revision ?? revisionVide())
  const pretes = resultat.copies.filter(
    (c) =>
      (copieId == null || c.copieId === copieId) &&
      c.aArbitrer === 0 &&
      c.pagesManquantes.length === 0,
  )
  revision.validees = [
    ...new Set([...revision.validees, ...pretes.map((c) => c.copieId)]),
  ]
  return { ...resultat, revision }
}
