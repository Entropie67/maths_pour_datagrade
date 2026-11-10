import {
  mesurerPage,
  noterPages,
  type PageAnalysee,
  type ResultatAnalyse,
} from './analyseScan'
import type { GrayImage, OmrEvaluation } from './omrTypes'
import { pivoter180 } from './qr'
import { reviserResultat, revisionVide } from './omrReview'

/** Les seuils changent pour les copies concernées : refaire leur arbitrage. */
function recalculer(
  evaluation: OmrEvaluation,
  resultat: ResultatAnalyse,
  pages: PageAnalysee[],
  concernees: Set<string | undefined>,
): ResultatAnalyse {
  const revision = JSON.parse(
    JSON.stringify(resultat.revision ?? revisionVide()),
  ) as NonNullable<ResultatAnalyse['revision']>
  for (const id of concernees) {
    if (!id) continue
    delete revision.cases[id]
    for (const q of Object.values(revision.questions[id] ?? {})) delete q.points
  }
  revision.validees = revision.validees.filter((id) => !concernees.has(id))
  return reviserResultat(evaluation, {
    ...noterPages(evaluation, pages),
    revision,
  })
}

export interface AssociationPage {
  rang: number
  copieId: string
  page: number
  retournee: boolean
  manuelle: boolean
  remplacer: boolean
}

/** Associe une page sans dépendre de son QR, après identification visuelle. */
export function associerPage(
  evaluation: OmrEvaluation,
  resultat: ResultatAnalyse,
  image: GrayImage,
  association: AssociationPage,
): ResultatAnalyse {
  const originale = resultat.pages.find((p) => p.rang === association.rang)
  const copie = evaluation.copies.find((c) => c.copieId === association.copieId)
  if (
    !originale ||
    !copie ||
    !Number.isInteger(association.page) ||
    association.page < 1 ||
    association.page > copie.pages.length
  ) {
    throw new Error('Choisir une copie et un numéro de page valides.')
  }
  const conflit = resultat.pages.find(
    (p) =>
      p.rang !== association.rang &&
      p.statut === 'ok' &&
      p.copieId === copie.copieId &&
      p.page === association.page,
  )
  if (conflit && !association.remplacer)
    throw new Error(
      'Cette page est déjà associée. Choisir explicitement de la remplacer.',
    )
  const mesures = association.manuelle
    ? evaluation.layouts[copie.layoutId]
        .filter((b) => b.page === association.page)
        .map((b) => ({ id: b.id, darkness: 0 }))
    : mesurerPage(
        association.retournee ? pivoter180(image) : image,
        evaluation,
        copie.copieId,
        association.page,
      )
  if (mesures == null)
    throw new Error(
      'Repères introuvables. Choisir la saisie manuelle ou importer un meilleur scan.',
    )
  const pages = resultat.pages.map((p): PageAnalysee => {
    if (p.rang === association.rang)
      return {
        rang: p.rang,
        statut: 'ok',
        copieId: copie.copieId,
        page: association.page,
        retournee: association.retournee,
        lectureManuelle: association.manuelle,
        mesures,
      }
    if (p.rang === conflit?.rang) return { ...p, statut: 'doublon' }
    return p
  })
  return recalculer(
    evaluation,
    resultat,
    pages,
    new Set([
      originale.statut === 'ok' ? originale.copieId : undefined,
      copie.copieId,
    ]),
  )
}

export function ecarterPage(
  evaluation: OmrEvaluation,
  resultat: ResultatAnalyse,
  rang: number,
): ResultatAnalyse {
  const page = resultat.pages.find((p) => p.rang === rang)
  if (!page) throw new Error('Page inconnue.')
  return recalculer(
    evaluation,
    resultat,
    resultat.pages.map((p) =>
      p.rang === rang ? { ...p, statut: 'ecartee' } : p,
    ),
    new Set([page.statut === 'ok' ? page.copieId : undefined]),
  )
}
