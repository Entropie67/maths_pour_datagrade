import type { ResultatAnalyse } from './analyseScan'
import type { OmrEvaluation } from './omrTypes'
import { reponseAttendue } from './omrReview'

// Les données utilisateur sont des chaînes Typst, jamais du code ou du markup.
const texte = (value: string) => JSON.stringify(value)
export function construireFeedback(
  evaluation: OmrEvaluation,
  resultat: ResultatAnalyse,
  copieId?: string,
): string {
  const copies = resultat.copies.filter(
    (c) => copieId == null || c.copieId === copieId,
  )
  if (!copies.length) throw new Error('Aucune copie à exporter.')
  return (
    `#set page(paper: "a4", margin: 14mm, numbering: "1")
#set text(font: "Noto Sans", size: 10pt, lang: "fr")
#set par(leading: 0.5em)
` +
    copies
      .map((copie) => {
        const validee =
          resultat.revision?.validees.includes(copie.copieId) &&
          copie.aArbitrer === 0 &&
          copie.pagesManquantes.length === 0
        const exercices = new Map<number, typeof copie.questions>()
        for (const q of copie.questions) {
          const meta = evaluation.questions.find(
            (question) => question.qid === q.qid,
          )!
          const questions = exercices.get(meta.exercice) ?? []
          questions.push(q)
          exercices.set(meta.exercice, questions)
        }
        return (
          `#text(size: 18pt, weight: "bold", ${texte(evaluation.sujet.titre)})
#parbreak()
#text(size: 14pt, ${texte(copie.eleve.nom)})
#parbreak()
#text(weight: "bold", ${texte(`${validee ? 'Note' : 'Note provisoire'} : ${copie.points} / ${copie.pointsMax}`)})
${copie.pagesManquantes.length ? `#parbreak()\n#text(${texte(`Pages absentes : ${copie.pagesManquantes.join(', ')}.`)})` : ''}
#v(4mm)
` +
          Array.from(exercices, ([exercice, questions]) => {
            const meta = (qid: string) =>
              evaluation.questions.find((question) => question.qid === qid)!
            const tableaux: string[] = []
            // Limiter les colonnes pour garder les réponses lisibles sur une page A4.
            for (let debut = 0; debut < questions.length; debut += 6) {
              const groupe = questions.slice(debut, debut + 6)
              const cellules = [
                `table.header(text(""), ${groupe.map((q) => `text(weight: "bold", ${texte(`Q${meta(q.qid).question + 1}`)})`).join(', ')}),`,
                `text(weight: "bold", "Note"),`,
                ...groupe.map((q) => {
                  const diagnostic =
                    q.statut !== 'lu' && q.statut !== 'sansReponse'
                      ? '\nRéponse à vérifier.'
                      : ''
                  return `text(${texte(`${q.points} / ${q.pointsMax}${diagnostic}`)}),`
                }),
              ]
              if (groupe.some((q) => meta(q.qid).type !== 'AMCOpen')) {
                for (const ligne of ['Saisie', 'Attendue']) {
                  cellules.push(`text(weight: "bold", ${texte(ligne)}),`)
                  for (const q of groupe) {
                    const valeur =
                      meta(q.qid).type === 'AMCOpen'
                        ? ''
                        : ligne === 'Saisie'
                          ? q.reponse || 'aucune'
                          : reponseAttendue(evaluation, copie.copieId, q.qid)
                    cellules.push(`text(${texte(valeur)}),`)
                  }
                }
              }
              tableaux.push(
                `#table(columns: (auto, ${groupe.map(() => '1fr').join(', ')}), inset: 5pt, stroke: 0.4pt + luma(75%), fill: (x, y) => if y == 0 { luma(96%) },\n${cellules.join('\n')}\n)`,
              )
            }
            const commentaires = questions.flatMap((q) => {
              const commentaire =
                resultat.revision?.questions[copie.copieId]?.[
                  q.qid
                ]?.commentaire.trim()
              return commentaire
                ? [
                    `#parbreak()\n#text(${texte(`Q${meta(q.qid).question + 1} : ${commentaire}`)})`,
                  ]
                : []
            })
            return `#text(weight: "bold", ${texte(`Exercice ${exercice + 1} — ${questions.reduce((somme, q) => somme + q.points, 0)} / ${questions.reduce((somme, q) => somme + q.pointsMax, 0)}`)})\n#v(2mm)\n${tableaux.join('\n#v(2mm)\n')}\n${commentaires.join('\n')}\n#v(4mm)\n`
          }).join('\n')
        )
      })
      .join('\n#pagebreak()\n')
  )
}

export async function telechargerFeedback(
  evaluation: OmrEvaluation,
  resultat: ResultatAnalyse,
  copieId?: string,
): Promise<void> {
  const { compileTypstToPdf } =
    await import('../../components/setup/typst/typstCompiler')
  const { downloadBlob } = await import('../spreadsheet')
  const { nomDeFichier } = await import('./omrExport')
  const pdf = await compileTypstToPdf(
    construireFeedback(evaluation, resultat, copieId),
  )
  if (!pdf) throw new Error('Compilation du corrigé impossible.')
  downloadBlob(
    new Blob([pdf as BlobPart], { type: 'application/pdf' }),
    `${nomDeFichier(evaluation.sujet.titre)}-${copieId ? nomDeFichier(copieId) : 'classe'}-feedback.pdf`,
  )
}
