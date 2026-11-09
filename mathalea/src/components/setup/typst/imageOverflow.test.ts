import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  overflowingImages,
  parseImageGeometries,
  withImageGeometry,
} from './imageOverflow'

describe('débordement des images d’annales', () => {
  it('ignore les métadonnées invalides et les pages absentes', () => {
    expect(
      parseImageGeometries([null, {}, { part: 'enonce', height: NaN }]),
    ).toEqual([])
    expect(
      overflowingImages(
        [
          {
            num: 1,
            part: 'enonce',
            page: 2,
            x: 0,
            y: 0,
            width: 20,
            height: 200,
          },
        ],
        [{ width: 100, height: 100, y: 0 }],
      ),
    ).toEqual([])
  })

  it('mesure le rendu final, déduplique les fragments et tolère les arrondis', () => {
    const image = {
      num: 1,
      part: 'enonce' as const,
      page: 1,
      x: 10,
      y: 10,
      width: 80,
      height: 90,
    }
    const pages = [{ width: 100, height: 100, y: 0 }]
    expect(
      overflowingImages([image, { ...image, height: 90.4 }], pages),
    ).toEqual([])
    expect(
      overflowingImages(
        [
          { ...image, height: 100 },
          { ...image, height: 110 },
          { ...image, part: 'correction', width: 100 },
        ],
        pages,
      ),
    ).toEqual([
      { num: 1, part: 'enonce' },
      { num: 1, part: 'correction' },
    ])
  })

  it('ne modifie pas les exemples, commentaires ou figures ordinaires', () => {
    const code =
      '// #mathalea-fit(fig-1, zoom: exo-1-zoom)\n`#mathalea-fit(fig-1, zoom: exo-1-zoom)`\n#mathalea-fit(fig-2)'
    expect(withImageGeometry(code)).toBe(code)
  })

  it.runIf(process.env.CI == null || process.env.TYPST_CLI_TESTS === '1')(
    'mesure une image trop haute puis ses fragments sans changer la pagination',
    () => {
      if (spawnSync('typst', ['--version']).status !== 0) return
      const dir = mkdtempSync(join(tmpdir(), 'mathalea-image-overflow-'))
      try {
        const preamble =
          '#set page(width: 120pt, height: 130pt, margin: 10pt)\n#let fig-1 = rect(width: 100pt, height: 240pt)\n#let exo-1-zoom = 1\n'
        for (const [body, expectedCount, expectedOverflow] of [
          ['#mathalea-fit(fig-1, zoom: exo-1-zoom)', 1, true],
          [
            '#let exo-1-zoom = 0.4\n#mathalea-fit(fig-1, zoom: exo-1-zoom)',
            1,
            false,
          ],
          [
            '#mathalea-image-slice(fig-1, 0, 0.3333, zoom: exo-1-zoom)\n\n#mathalea-image-slice(fig-1, 0.3333, 0.6667, zoom: exo-1-zoom)\n\n#mathalea-image-slice(fig-1, 0.6667, 1, zoom: exo-1-zoom)',
            3,
            false,
          ],
        ] as const) {
          const code = preamble + body
          expect(withImageGeometry(code).split('\n')).toHaveLength(
            code.split('\n').length,
          )
          writeFileSync(join(dir, 'main.typ'), withImageGeometry(code))
          const result = spawnSync(
            'typst',
            [
              'query',
              'main.typ',
              '<mathalea-image-geometry>',
              '--field',
              'value',
            ],
            { cwd: dir, encoding: 'utf8' },
          )
          expect(result.status, result.stderr).toBe(0)
          const images = parseImageGeometries(JSON.parse(result.stdout))
          expect(images).toHaveLength(expectedCount)
          expect(
            overflowingImages(
              images,
              Array.from({ length: expectedCount }, (_, i) => ({
                width: 120,
                height: 130,
                y: i * 146,
              })),
            ).length > 0,
          ).toBe(expectedOverflow)
          if (expectedCount === 3)
            expect(images.map((image) => image.page)).toEqual([1, 2, 3])
        }
      } finally {
        rmSync(dir, { recursive: true, force: true })
      }
    },
  )
})
