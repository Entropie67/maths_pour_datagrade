import type { PageAnalysee, ResultatAnalyse } from './analyseScan'
import type { OmrEvaluation } from './omrTypes'
import { otsuThreshold } from './binarize'
import { ouvrirPdf } from './pdfRaster'
import { pivoter180 } from './qr'
import { applyHomography, pageToImage, type Homography } from './registration'

const xml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
      })[c]!,
  )

/** SVG autonome : scan redressé et annotations dans le même repère de pixels. */
export function construirePageAnnotee(
  evaluation: OmrEvaluation,
  resultat: ResultatAnalyse,
  page: PageAnalysee,
  image: { width: number; height: number; url: string },
  projection: Homography | null,
): string {
  const copie = resultat.copies.find((c) => c.copieId === page.copieId)!
  const meta = evaluation.copies.find((c) => c.copieId === page.copieId)!
  const validee =
    resultat.revision?.validees.includes(copie.copieId) &&
    !copie.aArbitrer &&
    !copie.pagesManquantes.length
  const exercices = new Map<number, { points: number; max: number }>()
  for (const q of copie.questions) {
    const exercice = evaluation.questions.find((m) => m.qid === q.qid)!.exercice
    const total = exercices.get(exercice) ?? { points: 0, max: 0 }
    total.points += q.points
    total.max += q.pointsMax
    exercices.set(exercice, total)
  }
  const font = image.width / 65
  // Une bande ajoutée au-dessus du scan évite de masquer l'écriture de l'élève.
  const lignes = [
    `${copie.eleve.nom} — ${validee ? 'Note' : 'Note provisoire'} : ${copie.points} / ${copie.pointsMax}`,
    ...Array.from(
      exercices,
      ([n, total]) => `Exercice ${n + 1} : ${total.points} / ${total.max}`,
    ),
    ...(copie.pagesManquantes.length
      ? [`Pages absentes : ${copie.pagesManquantes.join(', ')}.`]
      : []),
  ].flatMap((ligne) => ligne.match(/.{1,90}(?:\s|$)|.{1,90}/gu) ?? [''])
  const bande = font * (lignes.length + 1) * 1.5
  // Réserver une marge extérieure au scan : aucun feedback ne peut masquer
  // une case, y compris quand plusieurs questions sont sur la même ligne.
  const marge = font * 15
  const largeur = image.width + marge
  const hauteurBadge = font * 3.4
  let basBadge = bande + font
  const marques: string[] = []
  for (const q of copie.questions) {
    const boxes = evaluation.layouts[meta.layoutId].filter(
      (b) => b.qid === q.qid && b.page === page.page,
    )
    if (!boxes.length) continue
    const question = evaluation.questions.find((m) => m.qid === q.qid)!
    const first = boxes.reduce((a, b) => (a.y < b.y ? a : b))
    const pos = projection
      ? applyHomography(projection, { x: first.x, y: first.y })
      : null
    const x = image.width + font
    const y = Math.max(basBadge, bande + (pos?.y ?? font))
    basBadge = y + hauteurBadge + font * 0.6
    const enAttente = q.statut !== 'lu' && q.statut !== 'sansReponse'
    const correcte = !enAttente && q.points === q.pointsMax
    const partielle = !enAttente && !correcte && q.points > 0
    const color =
      enAttente || partielle ? '#b45309' : correcte ? '#15803d' : '#b91c1c'
    const libelle = enAttente
      ? 'À vérifier'
      : correcte
        ? 'Correct'
        : partielle
          ? 'Partiel'
          : 'Incorrect'
    marques.push(
      `<g data-feedback="${xml(q.qid)}" font-family="sans-serif" font-size="${font}" fill="${color}"><rect x="${x}" y="${y}" width="${marge - font * 2}" height="${hauteurBadge}" rx="${font * 0.6}" fill="white" stroke="${color}" stroke-width="${font / 12}"/><text x="${x + font * 0.5}" y="${y + font * 1.3}">${xml(`Ex. ${question.exercice + 1} · Q${question.question + 1}`)}</text><text x="${x + font * 0.5}" y="${y + font * 2.6}" font-weight="bold">${xml(`${libelle} · ${q.points} / ${q.pointsMax}`)}</text></g>`,
    )
  }
  const hauteur = Math.max(image.height + bande, basBadge)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${largeur}" height="${hauteur}" viewBox="0 0 ${largeur} ${hauteur}"><rect width="100%" height="100%" fill="white"/><image href="${xml(image.url)}" x="0" y="${bande}" width="${image.width}" height="${image.height}"/><g font-family="sans-serif" font-size="${font}" fill="#b91c1c">${lignes.map((ligne, i) => `<text x="${font}" y="${font * 1.5 * (i + 1)}">${xml(ligne)}</text>`).join('')}</g>${marques.join('')}</svg>`
}

export function sourcePagesAnnotees(
  evaluation: OmrEvaluation,
  pages: string[],
): string {
  return (
    `#set page(width: ${evaluation.page.widthPt}pt, height: ${evaluation.page.heightPt}pt, margin: 0pt)\n` +
    pages
      .map(
        (svg) =>
          `#image(bytes(${JSON.stringify(svg)}), format: "svg", width: 100%, height: 100%, fit: "contain")`,
      )
      .join('\n#pagebreak()\n')
  )
}

export async function telechargerCopiesAnnotees(
  evaluation: OmrEvaluation,
  resultat: ResultatAnalyse,
  fichier: Blob,
  copieId?: string,
): Promise<void> {
  const pages = resultat.copies
    .filter((c) => copieId == null || c.copieId === copieId)
    .flatMap((c) =>
      resultat.pages
        .filter((p) => p.statut === 'ok' && p.copieId === c.copieId)
        .sort((a, b) => a.page! - b.page!),
    )
  if (!pages.length) throw new Error('Aucune page de copie à exporter.')
  const document = await ouvrirPdf(await fichier.arrayBuffer())
  const svgs: string[] = []
  try {
    for (const page of pages) {
      let image = await document.rendrePage(page.rang)
      if (page.retournee) image = pivoter180(image)
      const canvas = new OffscreenCanvas(image.width, image.height)
      const ctx = canvas.getContext('2d')!
      const rgba = ctx.createImageData(image.width, image.height)
      for (let i = 0; i < image.data.length; i++) {
        rgba.data[i * 4] =
          rgba.data[i * 4 + 1] =
          rgba.data[i * 4 + 2] =
            image.data[i]
        rgba.data[i * 4 + 3] = 255
      }
      ctx.putImageData(rgba, 0, 0)
      const blob = await canvas.convertToBlob({ type: 'image/png' })
      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(blob)
      })
      const projection = page.lectureManuelle
        ? null
        : pageToImage(image, otsuThreshold(image), evaluation.reperes)
      svgs.push(
        construirePageAnnotee(
          evaluation,
          resultat,
          page,
          { ...image, url },
          projection,
        ),
      )
    }
  } finally {
    await document.fermer()
  }
  const { compileTypstToPdf } =
    await import('../../components/setup/typst/typstCompiler')
  const { downloadBlob } = await import('../spreadsheet')
  const { nomDeFichier } = await import('./omrExport')
  const pdf = await compileTypstToPdf(sourcePagesAnnotees(evaluation, svgs))
  if (!pdf) throw new Error('Compilation des copies annotées impossible.')
  downloadBlob(
    new Blob([pdf as BlobPart], { type: 'application/pdf' }),
    `${nomDeFichier(evaluation.sujet.titre)}-${copieId ? nomDeFichier(copieId) : 'classe'}-copies-annotees.pdf`,
  )
}
