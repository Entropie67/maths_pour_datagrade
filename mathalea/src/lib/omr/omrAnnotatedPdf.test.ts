import { describe, expect, it } from 'vitest'
import { deflateSync } from 'node:zlib'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { construirePageAnnotee, sourcePagesAnnotees } from './omrAnnotatedPdf'
import type { OmrEvaluation } from './omrTypes'
import type { ResultatAnalyse } from './analyseScan'
import { construireFeedback } from './omrFeedback'

const evaluation: OmrEvaluation = {
  version: 1,
  sujet: { titre: 'Test', checkSum: '', exercicesParams: [] },
  page: { widthPt: 595, heightPt: 842 },
  reperes: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ],
  copies: [
    {
      copieId: 'c',
      eleve: { id: 'e', nom: 'A <B>' },
      layoutId: 'l',
      pages: [1],
    },
  ],
  questions: [
    { qid: 'q1', exercice: 0, question: 0, type: 'qcmMono', points: 2 },
    { qid: 'q2', exercice: 1, question: 0, type: 'qcmMono', points: 3 },
  ],
  layouts: {
    l: ['q1', 'q2'].map((qid, i) => ({
      id: qid + '.0',
      qid,
      page: 1,
      x: 0.2,
      y: 0.2 + 0.2 * i,
      w: 0.02,
      h: 0.02,
      correct: true,
    })),
  },
}
const resultat: ResultatAnalyse = {
  pages: [{ rang: 2, copieId: 'c', page: 1, statut: 'ok', mesures: [] }],
  copies: [
    {
      copieId: 'c',
      eleve: { id: 'e', nom: 'A <B>' },
      points: 2,
      pointsMax: 5,
      aArbitrer: 0,
      pagesManquantes: [],
      questions: [
        { qid: 'q1', points: 2, pointsMax: 2, statut: 'lu', reponse: 'A' },
        {
          qid: 'q2',
          points: 0,
          pointsMax: 3,
          statut: 'sansReponse',
          reponse: '',
        },
      ],
    },
  ],
  seuils: {},
  copiesAbsentes: [],
  revision: { cases: {}, questions: {}, validees: ['c'] },
}
const projection = new Float64Array([1000, 0, 0, 0, 1400, 0, 0, 0, 1])
const image = { width: 1000, height: 1400, url: 'data:image/png;base64,' }

describe('copies OMR annotées', () => {
  it('place des libellés explicites hors du scan et résume les notes par exercice', () => {
    const svg = construirePageAnnotee(
      evaluation,
      resultat,
      resultat.pages[0],
      image,
      projection,
    )
    expect(svg).toContain('A &lt;B&gt; — Note : 2 / 5')
    expect(svg).toContain('Exercice 1 : 2 / 2')
    expect(svg).toContain('Exercice 2 : 0 / 3')
    expect(svg).toContain('stroke="#15803d"')
    expect(svg).toContain('stroke="#b91c1c"')
    expect(svg).toContain('Correct · 2 / 2')
    expect(svg).toContain('Incorrect · 0 / 3')
    expect(svg).not.toContain('Page 1')
    expect(svg).not.toContain('<path')
    const document = new DOMParser().parseFromString(svg, 'image/svg+xml')
    for (const rect of document.querySelectorAll('[data-feedback] rect')) {
      expect(Number(rect.getAttribute('x'))).toBeGreaterThan(image.width)
    }
  })
  it('conserve les libellés en marge et le statut provisoire sans recalage', () => {
    const r = structuredClone(resultat)
    r.copies[0].pagesManquantes = [2]
    const svg = construirePageAnnotee(evaluation, r, r.pages[0], image, null)
    expect(svg).toContain('Note provisoire')
    expect(svg).toContain('Pages absentes : 2')
    expect(svg).toContain('Correct · 2 / 2')
    expect(svg).not.toContain('<path')
  })
  it('sépare les badges des questions horizontales au même niveau', () => {
    const e = structuredClone(evaluation)
    e.layouts.l[1].y = e.layouts.l[0].y
    e.layouts.l[1].x = 0.5
    const svg = construirePageAnnotee(
      e,
      resultat,
      resultat.pages[0],
      image,
      projection,
    )
    const document = new DOMParser().parseFromString(svg, 'image/svg+xml')
    const badges = [...document.querySelectorAll('[data-feedback] rect')]
    expect(badges).toHaveLength(2)
    expect(Number(badges[1].getAttribute('y'))).toBeGreaterThan(
      Number(badges[0].getAttribute('y')) +
        Number(badges[0].getAttribute('height')),
    )
    for (const badge of badges)
      expect(Number(badge.getAttribute('x'))).toBeGreaterThan(image.width)
  })

  it('ne présente pas un arbitrage comme une réponse fausse', () => {
    const r = structuredClone(resultat)
    r.copies[0].questions[0].statut = 'ambigu'
    const svg = construirePageAnnotee(
      evaluation,
      r,
      r.pages[0],
      image,
      projection,
    )
    expect(svg).toContain('À vérifier · 2 / 2')
  })
})

// Un vrai PNG minimal vérifie l’embarquement des scans dans le SVG de Typst.
function pngBlanc(): string {
  function crc(data: Buffer): number {
    let c = 0xffffffff
    for (const byte of data) {
      c ^= byte
      for (let i = 0; i < 8; i++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    return (c ^ 0xffffffff) >>> 0
  }
  function chunk(type: string, data: Buffer): Buffer {
    const size = Buffer.alloc(4)
    size.writeUInt32BE(data.length)
    const body = Buffer.concat([Buffer.from(type), data])
    const checksum = Buffer.alloc(4)
    checksum.writeUInt32BE(crc(body))
    return Buffer.concat([size, body, checksum])
  }
  const header = Buffer.alloc(13)
  header.writeUInt32BE(1, 0)
  header.writeUInt32BE(1, 4)
  header[8] = 8
  header[9] = 2
  return (
    'data:image/png;base64,' +
    Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk('IHDR', header),
      chunk('IDAT', deflateSync(Buffer.from([0, 255, 255, 255]))),
      chunk('IEND', Buffer.alloc(0)),
    ]).toString('base64')
  )
}
it.skipIf(spawnSync('typst', ['--version']).status !== 0)(
  'compile réellement le scan PNG et ses annotations en deux pages PDF',
  () => {
    const dossier = mkdtempSync(join(tmpdir(), 'omr-annote-'))
    try {
      const svg = construirePageAnnotee(
        evaluation,
        resultat,
        resultat.pages[0],
        { ...image, url: pngBlanc() },
        projection,
      )
      writeFileSync(
        join(dossier, 'copies.typ'),
        sourcePagesAnnotees(evaluation, [svg, svg]),
      )
      const compile = spawnSync(
        'typst',
        ['compile', join(dossier, 'copies.typ'), join(dossier, 'copies.pdf')],
        { encoding: 'utf8' },
      )
      expect(compile.stderr).toBe('')
      expect(compile.status).toBe(0)
      writeFileSync(
        join(dossier, 'fiche.typ'),
        construireFeedback(evaluation, resultat),
      )
      const fiche = spawnSync(
        'typst',
        [
          'compile',
          '--font-path',
          'public/fonts/typst',
          join(dossier, 'fiche.typ'),
          join(dossier, 'fiche.pdf'),
        ],
        { encoding: 'utf8' },
      )
      expect(fiche.status, fiche.stderr).toBe(0)
      const infos = spawnSync('pdfinfo', [join(dossier, 'copies.pdf')], {
        encoding: 'utf8',
      })
      if (!infos.error) expect(infos.stdout).toMatch(/Pages:\s+2/)
      const images = spawnSync(
        'pdfimages',
        ['-list', join(dossier, 'copies.pdf')],
        { encoding: 'utf8' },
      )
      if (!images.error) expect(images.stdout).toMatch(/\bimage\s+1\s+1\b/)

      expect(
        readFileSync(join(dossier, 'copies.pdf')).subarray(0, 4).toString(),
      ).toBe('%PDF')
    } finally {
      rmSync(dossier, { recursive: true, force: true })
    }
  },
)
