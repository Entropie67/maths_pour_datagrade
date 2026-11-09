import {
  idCase,
  PAPIERS,
  questionsDeLaCopie,
  type OmrDocumentSource,
} from './buildOmrDocument'
import { reperesRelatifs } from './omrTypstTemplate'
import type { OmrBox, OmrEvaluation, OmrQuestion } from './omrTypes'

/**
 * Jointure entre ce que la compilation Typst sait — *où* est chaque case — et
 * ce que seul MathALÉA sait — *ce que vaut* chaque case.
 *
 * Le résultat est le fichier `.mathalea-eval.json` remis au professeur avec le
 * PDF. Il contient le corrigé et la liste des élèves : c'est une donnée
 * personnelle, qui ne quitte jamais son poste.
 */

/** Une métadonnée telle que renvoyée par `query('<omr-box>')`, en points. */
export interface OmrAnchor {
  copie: string
  id: string
  /** Rang physique de la feuille dans le document imprimé */
  page: number
  x: number
  y: number
  w: number
  h: number
}

/** Filtre et type les valeurs renvoyées par `query`, qui n'est pas typée. */
export function parseAnchors(values: unknown): OmrAnchor[] {
  if (!Array.isArray(values)) return []
  const anchors: OmrAnchor[] = []
  for (const value of values) {
    if (value == null || typeof value !== 'object') continue
    const { copie, id, page, x, y, w, h } = value as Record<string, unknown>
    if (
      typeof copie === 'string' &&
      typeof id === 'string' &&
      typeof page === 'number' &&
      typeof x === 'number' &&
      typeof y === 'number' &&
      typeof w === 'number' &&
      typeof h === 'number'
    ) {
      anchors.push({ copie, id, page, x, y, w, h })
    }
  }
  return anchors
}

/** Ce que vaut une case, indépendamment de sa position. */
interface SensDeLaCase {
  qid: string
  correct: boolean
  valeur?: string
}

/**
 * Table `copie → (id de case → sens)`, construite depuis la description du
 * document. Une table par copie est nécessaire dès que les copies ne portent
 * plus le même sujet : avec une graine par élève, deux copies partagent les
 * identifiants de case (`q1.0`…) mais pas les bonnes réponses.
 */
function sensDesCases(
  source: OmrDocumentSource,
): Map<string, Map<string, SensDeLaCase>> {
  const parCopie = new Map<string, Map<string, SensDeLaCase>>()
  for (const copie of source.copies) {
    const table = new Map<string, SensDeLaCase>()
    parCopie.set(copie.copieId, table)
    for (const question of questionsDeLaCopie(copie)) {
      if (question.type === 'AMCNum') {
        question.colonnes.forEach((colonne, indexColonne) => {
          colonne.valeurs.forEach((valeur, indexValeur) => {
            table.set(idCase(question.qid, `${indexColonne}_${indexValeur}`), {
              qid: question.qid,
              correct: valeur === colonne.attendu,
              valeur,
            })
          })
        })
      } else if (question.type === 'AMCOpen') {
        for (let point = 0; point <= question.points; point++) {
          // aucune case n'est « correcte » : c'est le correcteur qui en
          // noircit une, et sa valeur est le nombre de points attribués
          table.set(idCase(question.qid, point), {
            qid: question.qid,
            correct: false,
            valeur: String(point),
          })
        }
      } else {
        question.propositions.forEach((proposition, index) => {
          table.set(idCase(question.qid, index), {
            qid: question.qid,
            correct: proposition.correct,
          })
        })
      }
    }
  }
  return parCopie
}

/** Liste des questions et de leur barème, dans l'ordre du document. */
function questionsDuDocument(source: OmrDocumentSource): OmrQuestion[] {
  const questions: OmrQuestion[] = []
  const vues = new Set<string>()
  source.copies.forEach((copie) => {
    copie.exercices.forEach((exercice, indexExercice) => {
      exercice.questions.forEach((question, indexQuestion) => {
        if (vues.has(question.qid)) return
        vues.add(question.qid)
        questions.push({
          qid: question.qid,
          exercice: indexExercice,
          question: indexQuestion,
          type: question.type,
          points: question.points,
        })
      })
    })
  })
  return questions
}

/**
 * Signature d'un jeu de cases, pour reconnaître deux mises en page identiques.
 *
 * Le corrigé fait partie de la signature : avec une graine par élève, deux
 * copies peuvent avoir la même géométrie tout en attendant des réponses
 * différentes ; les fusionner donnerait un corrigé faux à toute la classe.
 */
function signature(boxes: readonly OmrBox[]): string {
  return boxes
    .map(
      (b) =>
        `${b.id}:${b.page}:${b.x.toFixed(5)}:${b.y.toFixed(5)}:${
          b.correct ? '1' : '0'
        }:${b.valeur ?? ''}`,
    )
    .join('|')
}

/**
 * Assemble le fichier d'accompagnement à partir de la description du document
 * et des positions renvoyées par la compilation.
 *
 * Les mises en page identiques sont fusionnées : quand toute la classe compose
 * sur le même sujet — le cas courant — le fichier ne contient qu'un seul jeu de
 * positions au lieu d'un par élève.
 *
 * @param anchors métadonnées renvoyées par `query('<omr-box>')`
 * @param meta titre, empreinte et paramètres du sujet, pour la traçabilité
 */
export function buildEvaluation(
  source: OmrDocumentSource,
  anchors: readonly OmrAnchor[],
  meta: OmrEvaluation['sujet'],
): OmrEvaluation {
  const papier = PAPIERS[source.papier ?? 'a4']
  const largeurPt = (papier.largeurMm / 25.4) * 72
  const hauteurPt = (papier.hauteurMm / 25.4) * 72
  const sens = sensDesCases(source)

  // rangs physiques occupés par chaque copie, pour ramener les pages au rang
  // qu'elles ont dans la copie : le layout est ainsi le même pour tout le
  // monde, alors que les rangs physiques, eux, diffèrent d'une copie à l'autre
  const pagesParCopie = new Map<string, number[]>()
  for (const anchor of anchors) {
    const pages = pagesParCopie.get(anchor.copie) ?? []
    if (!pages.includes(anchor.page)) {
      pages.push(anchor.page)
      pages.sort((a, b) => a - b)
    }
    pagesParCopie.set(anchor.copie, pages)
  }

  const parCopie = new Map<string, OmrBox[]>()
  for (const anchor of anchors) {
    const sensCase = sens.get(anchor.copie)?.get(anchor.id)
    if (sensCase == null) continue // case inconnue du corrigé : ignorée
    const boxes = parCopie.get(anchor.copie) ?? []
    const pages = pagesParCopie.get(anchor.copie) as number[]
    boxes.push({
      id: anchor.id,
      qid: sensCase.qid,
      page: pages.indexOf(anchor.page) + 1,
      x: anchor.x / largeurPt,
      y: anchor.y / hauteurPt,
      w: anchor.w / largeurPt,
      h: anchor.h / hauteurPt,
      correct: sensCase.correct,
      ...(sensCase.valeur != null ? { valeur: sensCase.valeur } : {}),
    })
    parCopie.set(anchor.copie, boxes)
  }

  const layouts: Record<string, OmrBox[]> = {}
  const layoutParSignature = new Map<string, string>()
  const copies: OmrEvaluation['copies'] = []
  for (const copieSource of source.copies) {
    const boxes = parCopie.get(copieSource.copieId) ?? []
    boxes.sort((a, b) => a.page - b.page || a.y - b.y || a.x - b.x)
    const cle = signature(boxes)
    let layoutId = layoutParSignature.get(cle)
    if (layoutId == null) {
      layoutId = `L${layoutParSignature.size + 1}`
      layoutParSignature.set(cle, layoutId)
      layouts[layoutId] = boxes
    }
    copies.push({
      copieId: copieSource.copieId,
      eleve: copieSource.eleve,
      layoutId,
      pages: pagesParCopie.get(copieSource.copieId) ?? [],
    })
  }

  return {
    version: 1,
    sujet: meta,
    page: { widthPt: largeurPt, heightPt: hauteurPt },
    reperes: reperesRelatifs(papier.largeurMm, papier.hauteurMm),
    layouts,
    copies,
    questions: questionsDuDocument(source),
  }
}
