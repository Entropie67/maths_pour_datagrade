import { describe, expect, it } from 'vitest'
import { execFileSync, spawnSync } from 'node:child_process'
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { cleanTypstExport, corrigeCode, enonceCode } from './typstExport'
import {
  buildTypstDocument,
  defaultTypstDocumentOptions,
  MATHALEA_ANCHOR_HELPER,
  type TypstExerciseInput,
} from './buildTypstDocument'
import { MATHALEA_FIGURE_BLOCK_HELPER } from './latexToTypst'

const input: TypstExerciseInput = {
  ref: 'test',
  intro: '',
  introCorrection: '',
  numbered: true,
  questions: ['$1+1$', '$2+2$'],
  corrections: ['$2$', '$4$'],
  url: 'https://coopmaths.fr/alea/?uuid=98294',
}

describe('PDF Typst séparés', () => {
  const modes = [
    { name: 'banque', mergeExercises: false, canMode: false },
    { name: 'fusion', mergeExercises: true, canMode: false },
    { name: 'CAN', mergeExercises: false, canMode: true },
  ]

  it.each(modes)(
    'sépare le code en mode $name en conservant les retouches',
    (mode) => {
      const source = buildTypstDocument(
        [
          {
            ...input,
            questions: ['QUESTIONUNIQUE'],
            corrections: ['REPONSEUNIQUE'],
          },
        ],
        { ...defaultTypstDocumentOptions, ...mode, showCorrections: false },
      ).replace('REPONSEUNIQUE', 'CORRECTIONRETOUCHEE')
      expect(enonceCode(source)).toContain('#let corrige = false')
      const correction = corrigeCode(source)
      expect(correction).toContain('CORRECTIONRETOUCHEE')
      expect(correction).toContain('#let entete = ""')
      if (mode.mergeExercises || mode.canMode) {
        expect(correction).not.toContain('QUESTIONUNIQUE')
        expect(correction).toContain('#let corrige = true')
      } else {
        expect(correction).toContain('display: "sol"')
      }
    },
  )

  it('protège les délimiteurs des chaînes et des commentaires dans les énoncés', () => {
    const source = buildTypstDocument([input], {
      ...defaultTypstDocumentOptions,
      mergeExercises: true,
    }).replace('$1 + 1$', '#text("Crochet ]") /* ] */')
    const correction = corrigeCode(source)
    expect(correction).not.toContain('Crochet')
    expect(correction).toContain('// ----- Corrections -----')
  })

  const cliAvailable =
    process.env.TYPST_CLI_TESTS === '1' ||
    (process.env.CI == null &&
      spawnSync('typst', ['--version']).status === 0 &&
      spawnSync('pdftotext', ['-v']).status === 0)
  it
    .skipIf(!cliAvailable)
    .each(
      modes.flatMap((mode) =>
        [false, true].map((chained) => ({ ...mode, chained })),
      ),
    )(
    'compile deux PDF distincts en mode $name (enchaînement : $chained)',
    (mode) => {
      const primary = {
        ...input,
        questions: ['QUESTIONALPHA'],
        corrections: ['REPONSEALPHA'],
      }
      const secondary = {
        ...input,
        questions: ['QUESTIONBETA'],
        corrections: ['REPONSEBETA'],
      }
      const source = buildTypstDocument(
        [primary],
        {
          ...defaultTypstDocumentOptions,
          ...mode,
          nbVersions: 2,
          chainSubjects: mode.chained,
          copiesPerPage: mode.chained ? 2 : 1,
          showCorrections: false,
        },
        {},
        [[secondary]],
      )
      const dir = mkdtempSync(join(tmpdir(), 'typst-separate-pdf-'))
      try {
        const render = (name: string, code: string) => {
          const file = join(dir, `${name}.typ`)
          const pdf = join(dir, `${name}.pdf`)
          writeFileSync(file, code)
          execFileSync('typst', ['compile', file, pdf], { stdio: 'pipe' })
          return execFileSync('pdftotext', [pdf, '-'], { encoding: 'utf8' })
        }
        const statement = render('statement', enonceCode(source))
        const correction = render('correction', corrigeCode(source))
        for (const suffix of ['ALPHA', 'BETA']) {
          expect(statement).toContain(`QUESTION${suffix}`)
          expect(statement).not.toContain(`REPONSE${suffix}`)
          expect(correction).toContain(`REPONSE${suffix}`)
          expect(correction).not.toContain(`QUESTION${suffix}`)
        }
      } finally {
        rmSync(dir, { recursive: true, force: true })
      }
    },
  )
})

describe('export du texte actuel de l’éditeur Typst', () => {
  it('conserve les retouches libres du préambule, des énoncés et du rendu', () => {
    const source =
      buildTypstDocument([input])
        .replace('#let taille-texte = 11pt', '#let taille-texte = 13pt')
        .replace('$1 + 1$', '$7 + 8$') +
      '\n#let ma-note = "À relire"\n#align(right)[#ma-note]\n'
    const code = cleanTypstExport(source)
    expect(code).toContain('#let taille-texte = 13pt')
    expect(code).toContain('$7 + 8$')
    expect(code).toContain('#align(right)[#ma-note]')
    expect(code).toContain('#let ex1-colonnes')
    expect(code).not.toContain('mathalea-anchor')
    expect(code).not.toContain('mathalea:')
    expect(cleanTypstExport(code)).toBe(code)
  })

  it('retire les appels imbriqués et accolés au contenu sans créer de ligne vide', () => {
    const source = `${MATHALEA_ANCHOR_HELPER}\n#mathalea-anchor("exo", calc.max(1, 2))\n#text[Question]\n#box[#mathalea-anchor("header", 0)#text[Titre]]`
    expect(cleanTypstExport(source)).toBe('#text[Question]\n#box[#text[Titre]]')
    expect(cleanTypstExport(MATHALEA_FIGURE_BLOCK_HELPER)).not.toContain(
      'mathalea-anchor',
    )
  })

  it('préserve les chaînes, les exemples de code et les commentaires personnels', () => {
    const literals =
      '#let texte = "#mathalea-anchor(\\"exo\\", 1) // mathalea:insertion"\n```typ\n#mathalea-anchor("exo", 1)\n// mathalea:insertion\n```\n/* commentaire /* imbriqué */ #mathalea-anchor("exo", 1) */\n// Garder cette note.\n'
    const source = `${literals}// mathalea:override(1)\n#text[Ma question] // mathalea:insertion\n// mathalea:override-end\n`
    expect(cleanTypstExport(source)).toBe(`${literals}#text[Ma question] \n`)
  })

  it('conserve tous les sujets, les insertions et les QR-codes', () => {
    const source = buildTypstDocument(
      [input],
      {
        ...defaultTypstDocumentOptions,
        nbVersions: 2,
        showQrCodeFiche: true,
      },
      { insertions: { 0: ['#section[Fractions]'] } },
      [{ ...input, questions: ['$3+3$'] }].map((ex) => [ex]),
    )
    const code = cleanTypstExport(source)
    expect(code).not.toContain('mathalea-anchor')
    expect(code).not.toContain('mathalea:')
    expect(code).toContain('Sujet B')
    expect(code).toContain('#section[Fractions]')
    expect(code).toContain('$3 + 3$')
    expect(code).toContain('#qrcode(qr-code-global-url-1')
  })

  it.skipIf(
    process.env.TYPST_CLI_TESTS !== '1' &&
      (process.env.CI != null ||
        spawnSync('typst', ['--version']).status !== 0),
  )(
    'compile et conserve le rendu SVG de tous les sujets après des retouches libres',
    () => {
      const source =
        buildTypstDocument(
          [input],
          {
            ...defaultTypstDocumentOptions,
            nbVersions: 2,
            showQrCodeFiche: true,
            autoVerticalSpacing: false,
          },
          {},
          [[input]],
        )
          .replace('#let taille-texte = 11pt', '#let taille-texte = 13pt')
          .replace('$1 + 1$', '$7 + 8$') +
        '\n#text[Une note ajoutée directement dans l’éditeur.]'
      const dir = mkdtempSync(join(tmpdir(), 'typst-export-source-'))
      try {
        const render = (name: string, code: string) => {
          const file = join(dir, `${name}.typ`)
          writeFileSync(file, code)
          execFileSync(
            'typst',
            ['compile', file, join(dir, `${name}-{p}.svg`)],
            { stdio: 'pipe' },
          )
          return readdirSync(dir)
            .filter(
              (path) => path.startsWith(`${name}-`) && path.endsWith('.svg'),
            )
            .sort()
            .map((path) => readFileSync(join(dir, path), 'utf8'))
        }
        const before = render('before', source)
        expect(before.length).toBeGreaterThan(1)
        expect(render('after', cleanTypstExport(source))).toEqual(before)
      } finally {
        rmSync(dir, { recursive: true, force: true })
      }
    },
  )
})
