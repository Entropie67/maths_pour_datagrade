import {
  buildOdsBlob,
  buildXlsxBlob,
  downloadBlob,
  type SheetData,
} from '../spreadsheet'
import type { ResultatAnalyse } from './analyseScan'
import type { OmrEvaluation } from './omrTypes'
import type { OmrQuestionStatut } from './scoring'

/**
 * Export du bilan de correction.
 *
 * Le classeur est produit dans le navigateur par `src/lib/spreadsheet.ts`,
 * déjà utilisé par l'export du référentiel : aucune donnée d'élève ne transite
 * par un serveur, ce qui est toute la raison d'être de cette fonctionnalité.
 */

/** Libellé lisible d'un statut de question, pour la colonne de diagnostic. */
const LIBELLE_STATUT: Record<OmrQuestionStatut, string> = {
  lu: '',
  ambigu: 'à vérifier',
  sansReponse: 'sans réponse',
  multiple: 'plusieurs cases',
  pageManquante: 'page manquante',
}

/** Ce qu'affiche une cellule de résultat : les points, ou pourquoi ils manquent. */
function cellule(points: number, statut: OmrQuestionStatut): string | number {
  return statut === 'lu' ? points : LIBELLE_STATUT[statut]
}

/**
 * Construit la grille du bilan : une ligne par élève, une colonne par question,
 * plus le total et un rappel des anomalies.
 */
export function grilleBilan(
  evaluation: OmrEvaluation,
  resultat: ResultatAnalyse,
): (string | number)[][] {
  const entete = [
    'Élève',
    ...evaluation.questions.map(
      (question) =>
        `Ex. ${question.exercice + 1} · Q${question.question + 1} (/${question.points})`,
    ),
    'Total',
    'Sur',
    'Anomalies',
  ]
  const lignes = resultat.copies.map((copie) => {
    const parQuestion = new Map(copie.questions.map((q) => [q.qid, q]))
    const anomalies: string[] = []
    if (
      resultat.lectures &&
      !resultat.revision?.validees.includes(copie.copieId)
    ) {
      anomalies.push('note provisoire : relecture non validée')
    }
    if (copie.pagesManquantes.length > 0) {
      anomalies.push(`pages absentes : ${copie.pagesManquantes.join(', ')}`)
    }
    if (copie.aArbitrer > 0) {
      anomalies.push(`${copie.aArbitrer} question(s) à vérifier`)
    }
    return [
      copie.eleve.nom,
      ...evaluation.questions.map((question) => {
        const resultatQuestion = parQuestion.get(question.qid)
        if (resultatQuestion == null) return ''
        return cellule(resultatQuestion.points, resultatQuestion.statut)
      }),
      copie.points,
      copie.pointsMax,
      anomalies.join(' ; '),
    ]
  })

  // les copies jamais retrouvées figurent au bilan : leur absence est une
  // information, pas un zéro
  for (const copieId of resultat.copiesAbsentes) {
    const copie = evaluation.copies.find((c) => c.copieId === copieId)
    if (copie == null) continue
    lignes.push([
      copie.eleve.nom,
      ...evaluation.questions.map(() => ''),
      '',
      '',
      'copie non retrouvée dans le lot',
    ])
  }

  return [entete, ...lignes]
}

/** Grille détaillée : ce qui a été lu question par question. */
export function grilleReponses(
  evaluation: OmrEvaluation,
  resultat: ResultatAnalyse,
): (string | number)[][] {
  const entete = [
    'Élève',
    ...evaluation.questions.map(
      (question) => `Ex. ${question.exercice + 1} · Q${question.question + 1}`,
    ),
  ]
  const lignes = resultat.copies.map((copie) => {
    const parQuestion = new Map(copie.questions.map((q) => [q.qid, q]))
    return [
      copie.eleve.nom,
      ...evaluation.questions.map((question) => {
        const r = parQuestion.get(question.qid)
        if (r == null) return ''
        return r.statut === 'lu' ? (r.reponse ?? '') : LIBELLE_STATUT[r.statut]
      }),
    ]
  })
  return [entete, ...lignes]
}

/** Les deux onglets du classeur de bilan. */
export function feuillesBilan(
  evaluation: OmrEvaluation,
  resultat: ResultatAnalyse,
): SheetData[] {
  return [
    { name: 'Bilan', rows: grilleBilan(evaluation, resultat) },
    { name: 'Réponses lues', rows: grilleReponses(evaluation, resultat) },
  ]
}

/** Sérialise une grille en CSV, séparateur point-virgule (convention française). */
export function versCsv(grille: readonly (string | number)[][]): string {
  return grille
    .map((ligne) =>
      ligne
        .map((cellule) => {
          const texte = String(cellule ?? '')
          return /[";\n]/.test(texte) ? `"${texte.replace(/"/g, '""')}"` : texte
        })
        .join(';'),
    )
    .join('\n')
}

/** Nom de fichier sûr, dérivé du titre de l'évaluation. */
export function nomDeFichier(titre: string): string {
  const base = titre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base === '' ? 'evaluation' : base.toLowerCase()
}

/** Télécharge le bilan au format demandé. */
export async function telechargerBilan(
  evaluation: OmrEvaluation,
  resultat: ResultatAnalyse,
  format: 'xlsx' | 'ods' | 'csv',
): Promise<void> {
  const nom = nomDeFichier(evaluation.sujet.titre)
  if (format === 'csv') {
    const csv = versCsv(grilleBilan(evaluation, resultat))
    // le BOM fait ouvrir le fichier en UTF-8 par Excel, qui sinon suppose
    // l'encodage du système et abîme les accents des noms d'élèves
    downloadBlob(
      new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }),
      `${nom}-bilan.csv`,
    )
    return
  }
  const feuilles = feuillesBilan(evaluation, resultat)
  const blob =
    format === 'xlsx'
      ? await buildXlsxBlob(feuilles)
      : await buildOdsBlob(feuilles)
  downloadBlob(blob, `${nom}-bilan.${format}`)
}
