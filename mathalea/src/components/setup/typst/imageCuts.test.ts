import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  applyImageCuts,
  harvestImageCuts,
  IMAGE_SLICE_HELPER,
  normalizeImageCuts,
} from './imageCuts'
import {
  buildTypstDocument,
  defaultTypstDocumentOptions,
  harvestCarryOver,
  type TypstExerciseInput,
} from './buildTypstDocument'
import { setStaticImagePaths } from './latexToTypst'

const input: TypstExerciseInput = {
  ref: 'annale',
  intro: '',
  questions: ['<img src="scan.png" />'],
  introCorrection: '',
  corrections: ['<img src="scan.png" />'],
  numbered: false,
  isStaticImage: true,
  isStaticCorrectionImage: true,
}
afterEach(() => setStaticImagePaths(new Map()))

describe('découpage des annales', () => {
  it('ignore les coupures invalides et ordonne les coupures sans doublons', () => {
    expect(
      normalizeImageCuts([[0, 1, -1, NaN, 0.75, 0.25, 0.25, '0.5'], null]),
    ).toEqual([[0.25, 0.75], []])
    expect(
      harvestImageCuts('// mathalea:image-cuts(1,enonce) invalide'),
    ).toEqual({})
  })

  it('couvre chaque image de haut en bas sans trou, avec le même zoom', () => {
    const code = applyImageCuts(
      '#mathalea-fit(fig-1, zoom: exo-1-zoom)\n#mathalea-fit(fig-2, zoom: exo-1-zoom)',
      [[0.4, 0.7], []],
      1,
      'enonce',
    )
    expect(code).toContain(
      '#mathalea-image-slice(fig-1, 0, 0.4, zoom: exo-1-zoom)',
    )
    expect(code).toContain(
      '#mathalea-image-slice(fig-1, 0.4, 0.7, zoom: exo-1-zoom)',
    )
    expect(code).toContain(
      '#mathalea-image-slice(fig-1, 0.7, 1, zoom: exo-1-zoom)',
    )
    expect(code).toContain('#mathalea-fit(fig-2, zoom: exo-1-zoom)')
  })

  it('ne décale pas les coupures quand une image manque', () => {
    const code = applyImageCuts(
      '[image non convertie]\n#mathalea-fit(fig-1)',
      [[0.25], [0.7]],
      1,
      'enonce',
    )
    expect(code).toContain('#mathalea-image-slice(fig-1, 0, 0.7)')
    expect(code).not.toContain('#mathalea-image-slice(fig-1, 0, 0.25)')
  })

  it('conserve les coupures indépendantes par sujet et par partie après régénération et export', () => {
    setStaticImagePaths(new Map([['scan.png', '/scan.png']]))
    const options = { ...defaultTypstDocumentOptions, nbVersions: 2 }
    const carry = {
      imageCuts: { 1: { enonce: [[0.4]], correction: [[0.3, 0.6]] } },
      versions: { 1: { imageCuts: { 1: { enonce: [[0.5]] } } } },
    }
    const code = buildTypstDocument([input], options, carry, [[input]])
    const harvested = harvestCarryOver(code)
    expect(harvested.imageCuts).toEqual(carry.imageCuts)
    expect(harvested.versions?.[1].imageCuts).toEqual(
      carry.versions[1].imageCuts,
    )
    const rebuilt = buildTypstDocument([input], options, harvested, [[input]])
    expect(harvestCarryOver(rebuilt).imageCuts).toEqual(carry.imageCuts)
    expect(rebuilt).toContain(IMAGE_SLICE_HELPER)
    const exported = buildTypstDocument(
      [input],
      options,
      harvested,
      [[input]],
      { exportMode: true },
    )
    expect(exported).toContain(
      '#mathalea-image-slice(fig-1, 0, 0.4, zoom: exo-1-zoom)',
    )
    expect(exported).toContain(IMAGE_SLICE_HELPER)
    const removed = buildTypstDocument([input], options, {}, [[input]])
    expect(removed).not.toContain('// mathalea:image-cuts(')
    expect(removed).toContain('#mathalea-fit(fig-1, zoom: exo-1-zoom)')
  })

  it.runIf(process.env.CI == null || process.env.TYPST_CLI_TESTS === '1')(
    'compile les fragments sur plusieurs pages sans les réduire',
    () => {
      if (spawnSync('typst', ['--version']).status !== 0) return
      const dir = mkdtempSync(join(tmpdir(), 'mathalea-image-cuts-'))
      try {
        // Une image de 100 × 240 pt, découpée en trois fragments de 80 pt,
        // sur des pages dont la hauteur utile est de 110 pt.
        writeFileSync(
          join(dir, 'scan.svg'),
          '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="240"><rect width="100" height="80" fill="red"/><rect y="80" width="100" height="80" fill="green"/><rect y="160" width="100" height="80" fill="blue"/></svg>',
        )
        writeFileSync(
          join(dir, 'main.typ'),
          `#set page(width: 120pt, height: 130pt, margin: 10pt)\n${IMAGE_SLICE_HELPER}\n#let fig-1 = image("scan.svg", width: 100pt)\n${applyImageCuts('#mathalea-fit(fig-1)', [[1 / 3, 2 / 3]], 1, 'enonce')}`,
        )
        const result = spawnSync(
          'typst',
          ['compile', 'main.typ', 'page-{p}.svg'],
          { cwd: dir, encoding: 'utf8' },
        )
        expect(result.status, result.stderr).toBe(0)
        for (const page of [1, 2, 3]) {
          const svg = readFileSync(join(dir, `page-${page}.svg`), 'utf8')
          expect(svg.match(/<clipPath\b/g)).toHaveLength(1)
          expect(svg).toContain('width="100"')
        }
      } finally {
        rmSync(dir, { recursive: true, force: true })
      }
    },
  )
})
