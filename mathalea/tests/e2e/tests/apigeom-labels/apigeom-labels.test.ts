/**
 * Contrôle générique : aucune commande LaTeX ne doit fuir telle quelle dans
 * le texte des labels des figures apiGeom, une fois converties en SVG pour
 * la sortie Typst (`apigeomFigureToSvg`, cf. src/lib/apigeom/apigeom-figure.ts).
 *
 * Contexte : `addTextElementsToSvg` (paquet apiGeom) ne connaît pas KaTeX et
 * pose le code LaTeX brut d'un label comme texte SVG si `cleanLatexLabel`
 * (côté MathALÉA) ne sait pas encore convertir la commande utilisée — cf.
 * l'exemple `$\mathcal C_f$` de TSA2-12/TCA1-23, affiché tel quel au lieu
 * d'être interprété. Plutôt que de compléter `cleanLatexLabel` au cas par
 * cas à chaque nouvelle commande rencontrée, ce test balaie tous les
 * exercices qui créent une figure apiGeom et détecte toute commande LaTeX
 * (`\xyz`) encore présente dans un label rendu, quelle qu'elle soit.
 *
 *   pnpm apigeom-labels:check
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import type { IExercice } from '../../../../src/lib/types'
import { createSolidesThreeJsMock } from '../../mocks/solidesThreeJs.mock'

beforeAll(() => {
  const proto = SVGElement.prototype as any
  if (!proto.getBBox) {
    proto.getBBox = () => ({ x: 0, y: 0, width: 0, height: 0 })
  }
  window.matchMedia = vi.fn().mockReturnValue({ matches: false })
  if (typeof window.notify !== 'function') {
    window.notify = vi.fn() as unknown as typeof window.notify
  }
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: () => ({
      fillRect: () => {},
      clearRect: () => {},
      getImageData: () => ({ data: [] }),
      putImageData: () => {},
      createImageData: () => [],
      setTransform: () => {},
      drawImage: () => {},
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      arc: () => {},
      fill: () => {},
      measureText: () => ({ width: 0 }),
      transform: () => {},
      rect: () => {},
      clip: () => {},
    }),
  })
})

vi.mock('../../../../src/lib/3d/3d_dynamique/Canvas3DElement', () => ({
  ajouteCanvas3d: vi.fn((args) => 'canvas3DElement-mock:' + args.length),
}))

vi.mock('../../../../src/lib/3d/3d_dynamique/solidesThreeJs', () =>
  createSolidesThreeJsMock(),
)

vi.mock('../../../../src/lib/components/version', () => ({
  fetchServerVersion: vi.fn(() => Promise.resolve('1.0.0')),
  checkForServerUpdate: vi.fn(() => Promise.resolve(false)),
}))

vi.mock('../../../../src/lib/renderScratch', () => ({
  renderScratch: vi.fn(() => 'mocked value'),
}))

vi.mock('apigeom', async (original) => {
  const real = await original()
  ;(globalThis as any).APP_VERSION = 'test'
  return real
})

const { mathaleaLoadExerciceFromUuid, mathaleaHandleExerciceSimple } =
  await import('../../../../src/lib/mathalea')
const { apigeomFigureToSvg } =
  await import('../../../../src/lib/apigeom/apigeom-figure')

const __dirname = dirname(fileURLToPath(import.meta.url))
const RACINE = resolve(__dirname, '../../../..')

/** Graine fixe : seul le contenu textuel des labels nous intéresse ici. */
const GRAINE = 'e906e'

/**
 * Une commande LaTeX oubliée par `cleanLatexLabel` (ex. `\mathcal`) : un
 * antislash suivi de lettres, jamais légitime dans un label déjà nettoyé.
 */
const COMMANDE_LATEX_RESIDUELLE = /\\[a-zA-Z]+/

/**
 * Exercices dont le code source instancie une figure apiGeom (import direct
 * du paquet, ou via le helper `figureApigeom`) : repère statique, bien plus
 * rapide qu'un tirage de tous les exercices pour trouver ceux à contrôler.
 */
function exercicesAvecFigureApigeom(): [string, string][] {
  const uuidsToUrl: Record<string, string> = JSON.parse(
    readFileSync(resolve(RACINE, 'src/json/uuidsToUrlFR.json'), 'utf8'),
  )
  return (Object.entries(uuidsToUrl) as [string, string][]).filter(
    ([, chemin]) => {
      if (chemin.endsWith('.svelte')) return false
      let source: string
      try {
        source = readFileSync(resolve(RACINE, 'src/exercices', chemin), 'utf8')
      } catch {
        return false
      }
      return (
        /from ['"]apigeom['"]/.test(source) || /figureApigeom\(/.test(source)
      )
    },
  )
}

const cibles = exercicesAvecFigureApigeom()

describe(`Labels des figures apiGeom en sortie Typst (${cibles.length} exercice(s))`, () => {
  for (const [uuid, chemin] of cibles) {
    it(`${chemin} (${uuid})`, async () => {
      const exercice: IExercice = await mathaleaLoadExerciceFromUuid(uuid)
      if (
        exercice.titre?.startsWith('Erreur -') ||
        exercice.titre?.startsWith("L'exercice n'existe pas")
      ) {
        return
      }
      exercice.uuid = uuid
      exercice.interactif = false
      exercice.numeroExercice = 1
      exercice.nbQuestions = exercice.nbQuestionsModifiable === false ? 1 : 3
      exercice.seed = GRAINE
      try {
        if (exercice.typeExercice === 'simple') {
          mathaleaHandleExerciceSimple(exercice, false)
        } else {
          exercice.nouvelleVersionWrapper()
        }
      } catch {
        // Un tirage qui plante est déjà signalé par d'autres suites
        // (stability, all_exercises) : on ne contrôle que ce qui a été produit.
      }

      const figures = exercice.figuresApiGeom ?? []
      for (const figure of figures) {
        const svg = apigeomFigureToSvg(figure as never)
        const labels = [...svg.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)].map(
          (m) => m[1],
        )
        for (const label of labels) {
          expect(
            label,
            `${chemin} (${uuid}) : commande LaTeX non convertie dans un label ` +
              `de figure apiGeom : "${label}".\nAjouter la conversion dans ` +
              'cleanLatexLabel() (src/lib/apigeom/apigeom-figure.ts).',
          ).not.toMatch(COMMANDE_LATEX_RESIDUELLE)
        }
      }
      exercice.destroy?.()
    })
  }
})
