import type { ResultatAnalyse } from './analyseScan'
import { lireFichierEvaluation } from './genererEvaluation'
import { reviserResultat } from './omrReview'

/** Le scan exact est requis : les rangs des pages ne sont pas interchangeables. */
export async function lireSession(texte: string, scan: Blob) {
  const session = JSON.parse(texte)
  if (session.version !== 1 || typeof session.empreinte !== 'string')
    throw new Error('Format de correction inconnu.')
  const empreinte = Array.from(
    new Uint8Array(
      await crypto.subtle.digest('SHA-256', await scan.arrayBuffer()),
    ),
    (x) => x.toString(16).padStart(2, '0'),
  ).join('')
  if (empreinte !== session.empreinte)
    throw new Error(
      'Ce PDF ne correspond pas au scan de la correction enregistrée.',
    )
  const evaluation = lireFichierEvaluation(JSON.stringify(session.evaluation))
  const resultat = session.resultat as ResultatAnalyse
  if (
    !resultat ||
    !Array.isArray(resultat.pages) ||
    !Array.isArray(resultat.copies) ||
    !resultat.lectures ||
    !Array.isArray(resultat.copiesAbsentes)
  )
    throw new Error('Correction incomplète.')
  const ids = new Set(evaluation.copies.map((c) => c.copieId))
  for (const copie of resultat.copies) {
    const meta = evaluation.copies.find((c) => c.copieId === copie.copieId)
    const lectures = resultat.lectures[copie.copieId]
    if (!meta || !Array.isArray(lectures))
      throw new Error('Copie inconnue ou lectures absentes.')
    const boxes = new Set(evaluation.layouts[meta.layoutId].map((b) => b.id))
    for (const l of lectures) {
      if (
        !boxes.has(l.id) ||
        !['vide', 'cochee', 'ambigue'].includes(l.status) ||
        !Number.isFinite(l.darkness)
      )
        throw new Error('Lecture invalide.')
    }
  }
  for (const p of resultat.pages) {
    if (
      !Number.isInteger(p.rang) ||
      p.rang < 1 ||
      (p.statut === 'ok' && (!ids.has(p.copieId!) || !Number.isInteger(p.page)))
    )
      throw new Error('Page invalide.')
  }
  if (resultat.revision) {
    const r = resultat.revision
    if (!r.cases || !r.questions || !Array.isArray(r.validees))
      throw new Error('Révision invalide.')
    for (const cases of Object.values(r.cases)) {
      if (
        !cases ||
        Object.values(cases).some(
          (s) => !['vide', 'cochee', 'ambigue'].includes(s),
        )
      )
        throw new Error('Décision de lecture invalide.')
    }
    for (const questions of Object.values(r.questions)) {
      for (const q of Object.values(questions)) {
        if (!q || typeof q.commentaire !== 'string')
          throw new Error('Commentaire invalide.')
      }
    }
  }
  return { evaluation, resultat: reviserResultat(evaluation, resultat) }
}
