import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import {
  buildOmrDocument,
  type OmrDocumentSource,
} from '../../src/lib/omr/buildOmrDocument'
import { buildEvaluation, parseAnchors } from '../../src/lib/omr/omrLayout'
import type { DocumentScanne } from '../../src/lib/omr/pdfRaster'
import {
  applyHomography,
  type Homography,
} from '../../src/lib/omr/registration'
import type {
  GrayImage,
  OmrBox,
  OmrEvaluation,
} from '../../src/lib/omr/omrTypes'
import { decodePng } from './omrPngDecode'

/**
 * Fabrique de lots de copies scannées, pour les tests de bout en bout.
 *
 * Les pages sont de vrais rendus Typst, pas des images synthétiques : c'est ce
 * qui permet de confronter le générateur au moteur de lecture, les deux seules
 * pièces qui doivent s'accorder sur la géométrie du document.
 */

const POLICES = resolve(__dirname, '../../public/fonts/typst')

/** Vrai si le binaire `typst` est installé sur la machine. */
export function typstDisponible(): boolean {
  return spawnSync('typst', ['--version']).status === 0
}

/** Compile un document et renvoie ses pages rendues et ses positions. */
export function compilerLot(source: OmrDocumentSource): {
  evaluation: OmrEvaluation
  pages: GrayImage[]
} {
  const dossier = mkdtempSync(join(tmpdir(), 'omr-lot-'))
  try {
    const fichier = join(dossier, 'main.typ')
    writeFileSync(fichier, buildOmrDocument(source), 'utf8')

    const compile = spawnSync('typst', [
      'compile',
      '--font-path',
      POLICES,
      '--format',
      'png',
      '--ppi',
      '150',
      fichier,
      join(dossier, 'page-{p}.png'),
    ])
    if (compile.status !== 0) {
      throw new Error(`compilation Typst : ${compile.stderr?.toString()}`)
    }

    const query = spawnSync('typst', [
      'query',
      '--font-path',
      POLICES,
      fichier,
      '<omr-box>',
      '--field',
      'value',
    ])
    if (query.status !== 0) {
      throw new Error(`query Typst : ${query.stderr?.toString()}`)
    }

    const evaluation = buildEvaluation(
      source,
      parseAnchors(JSON.parse(query.stdout.toString())),
      { titre: source.titre, checkSum: 'test', exercicesParams: [] },
    )

    const pages: GrayImage[] = []
    for (let p = 1; ; p++) {
      try {
        pages.push(decodePng(readFileSync(join(dossier, `page-${p}.png`))))
      } catch {
        break
      }
    }
    return { evaluation, pages }
  } finally {
    rmSync(dossier, { recursive: true, force: true })
  }
}

/** Copie profonde d'une image, pour ne pas altérer le rendu d'origine. */
export function copierImage(image: GrayImage): GrayImage {
  return {
    width: image.width,
    height: image.height,
    data: Uint8Array.from(image.data),
  }
}

/** Noircit une case, comme le ferait un élève au stylo. */
export function noircir(
  image: GrayImage,
  h: Homography,
  box: OmrBox,
  marge = 0.15,
): void {
  const coin = applyHomography(h, { x: box.x, y: box.y })
  const oppose = applyHomography(h, { x: box.x + box.w, y: box.y + box.h })
  const x0 = Math.round(coin.x + (oppose.x - coin.x) * marge)
  const x1 = Math.round(oppose.x - (oppose.x - coin.x) * marge)
  const y0 = Math.round(coin.y + (oppose.y - coin.y) * marge)
  const y1 = Math.round(oppose.y - (oppose.y - coin.y) * marge)
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) image.data[y * image.width + x] = 0
  }
}

/** Retourne une image d'un demi-tour, comme une feuille mal enfournée. */
export function retourner(image: GrayImage): GrayImage {
  const data = new Uint8Array(image.data.length)
  for (let i = 0; i < image.data.length; i++) {
    data[i] = image.data[image.data.length - 1 - i]
  }
  return { width: image.width, height: image.height, data }
}

/** Enveloppe une liste d'images en un « PDF scanné » pour `analyserScan`. */
export function documentDepuisPages(pages: GrayImage[]): DocumentScanne {
  return {
    nombreDePages: pages.length,
    rendrePage: async (rang: number) => pages[rang - 1],
    fermer: async () => {},
  }
}
