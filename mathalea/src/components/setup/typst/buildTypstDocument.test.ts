import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import {
  buildStandaloneExerciseCode,
  buildTypstDocument,
  COLUMN_BREAK_SNIPPET,
  COVER_TEMPLATE_DEFAULTS,
  defaultTypstDocumentOptions,
  exercisePoints,
  exerciseTitleLine,
  getGeneratedCanRowCode,
  getGeneratedExerciseCode,
  harvestCarryOver,
  normalizeTypstLayoutOptions,
  PAGE_BREAK_SNIPPET,
  sharedFigureNumber,
  subjectEditorCode,
  type TypstDocumentOptions,
  type TypstExerciseInput,
} from './buildTypstDocument'
import { setGroupedExercisePoints } from './coverBareme'
import { typstPackageSpec } from './typstPackages'

const exercise = (
  overrides: Partial<TypstExerciseInput> = {},
): TypstExerciseInput => ({
  ref: '6e23-1',
  intro: '',
  questions: [],
  introCorrection: '',
  corrections: [],
  numbered: false,
  ...overrides,
})

const hasTypstCli = () => {
  const result = spawnSync('typst', ['--version'], { stdio: 'ignore' })
  return result.status === 0
}

const shouldRunTypstCliTests = () =>
  process.env.TYPST_CLI_TESTS === '1' ||
  (process.env.CI == null && hasTypstCli())

describe('buildTypstDocument', () => {
  it('réserve une colonne aux démonstrations en plusieurs paragraphes en mode automatique', () => {
    const exercises = [
      exercise({
        questions: ['$1+1$.', '$2+2$.'],
        corrections: [
          'Premier paragraphe.<br><br>Conclusion.',
          'Justification.',
        ],
        numbered: true,
      }),
    ]
    const source = buildTypstDocument(exercises)
    expect(source).toContain('#let ex1-colonnes = colonnes-questions')
    expect(source).toContain('#let ex1-corr-colonnes = 1')
    expect(
      harvestCarryOver(source).tasksLayout?.['ex1-corr']?.columns,
    ).toBeUndefined()
    const manual = buildTypstDocument(exercises, {
      ...defaultTypstDocumentOptions,
      questionsColumns: 2,
    })
    expect(manual).toContain('#let ex1-corr-colonnes = colonnes-questions')
    const exported = buildTypstDocument(exercises, undefined, {}, [], {
      exportMode: true,
    })
    expect(exported).toContain('#tasks(columns: 1,')
  })

  it.each([null, undefined, NaN, Infinity, -1, '0,8'])(
    'remplace les réglages de mise en page invalides (%s) avant génération',
    (value) => {
      const options = {
        ...defaultTypstDocumentOptions,
        fontSize: value,
        lineSpacing: value,
        wordSpacing: value,
        exerciseSpacing: value,
        questionsGutter: value,
      } as TypstDocumentOptions
      const inputs = [
        exercise({ questions: ['$1+1$', '$2+2$'], numbered: true }),
      ]
      expect(buildTypstDocument(inputs, options)).toBe(
        buildTypstDocument(inputs),
      )
      expect(
        buildTypstDocument(inputs, options, {}, [], { exportMode: true }),
      ).toBe(
        buildTypstDocument(inputs, defaultTypstDocumentOptions, {}, [], {
          exportMode: true,
        }),
      )
      expect(buildStandaloneExerciseCode(inputs, 1, options)).toBe(
        buildStandaloneExerciseCode(inputs, 1),
      )
      // Le chargement ne modifie pas les options reçues par l'appelant.
      expect(options.exerciseSpacing).toBe(value)
    },
  )

  it('conserve les espacements nuls et les valeurs décimales valides', () => {
    const options = {
      ...defaultTypstDocumentOptions,
      fontSize: 12.5,
      lineSpacing: 0.8,
      wordSpacing: 105,
      exerciseSpacing: 0,
      questionsGutter: 0,
    }
    expect(normalizeTypstLayoutOptions(options)).toEqual(options)
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$', '$2+2$'], numbered: true })],
      options,
    )
    expect(code).toContain('#let taille-texte = 12.5pt')
    expect(code).toContain('#set par(leading: 0.8em)')
    expect(code).toContain('spacing: 105%')
    expect(code).toContain('exercise-above: 0em')
    expect(code).toContain('#let interligne-questions = 0em')
    expect(
      normalizeTypstLayoutOptions({ ...options, fontSize: 0 }).fontSize,
    ).toBe(defaultTypstDocumentOptions.fontSize)
  })

  it('génère un document avec en-tête, exercice et correction', () => {
    const code = buildTypstDocument(
      [
        exercise({
          intro: 'Calculer.',
          questions: ['$2+2$', '$3\\times 4$'],
          corrections: ['$2+2=4$', '$3\\times 4=12$'],
          numbered: true,
        }),
      ],
      {
        ...defaultTypstDocumentOptions,
        boldQuestionNumbers: false,
        showExerciseRefs: true,
      },
    )
    expect(code).toContain('#set page(paper: "a4"')
    expect(code).toContain("Fiche d'exercices")
    // banque exercise-bank : énoncé et correction regroupés
    expect(code).toContain(`#import "${typstPackageSpec('exercise-bank')}"`)
    expect(code).toContain('#let ex1 = exo.with(')
    expect(code).toContain('id: "6e23-1",')
    expect(code).toContain('exercise: [')
    expect(code).toContain('#ex1()')
    // la correction est imprimée directement (exo-solution-box), pas via
    // exo-print-solutions : elle garde ainsi un point d'insertion (palette)
    // juste avant son badge, voir buildVersionContent
    expect(code).toContain('#exo-solution-box(')
    expect(code).toContain('exercise-id: "6e23-1",')
    expect(code).toContain(
      `#import "${typstPackageSpec('taskize')}": tasks as taskize-tasks`,
    )
    // l'enrobage qui aligne le numéro sur la première ligne de l'énoncé
    expect(code).toContain('#let mathalea-question-numerotee(')
    expect(code).toContain(
      '#tasks-setup(columns: "auto-fit", auto-fit-mode: "uniform", max-columns: 4)',
    )
    expect(code).toContain('#let colonnes-questions = "auto-fit"')
    expect(code).toContain('#let interligne-questions = 1.2em')
    expect(code).toContain('#let numerotation-questions = "1)"')
    expect(code).toContain('#let ex1-colonnes = colonnes-questions')
    expect(code).toContain('#let ex1-gutter = interligne-questions')
    expect(code).toContain('#let ex1-numerotation = numerotation-questions')
    // la correction a ses propres réglages, indépendants de l'énoncé
    expect(code).toContain('#let ex1-corr-colonnes = colonnes-questions')
    expect(code).toContain('#let ex1-corr-gutter = interligne-questions')
    expect(code).toContain(
      '#let ex1-corr-numerotation = numerotation-questions',
    )
    expect(code).toContain('#tasks(columns: ex1-corr-colonnes')
    expect(code).toContain('#mathalea-anchor("tasks-corr", 1)')
    expect(code).toContain(
      '#tasks(columns: ex1-colonnes, label: ex1-numerotation, row-gutter: ex1-gutter, above: 1.2em, below: 0.8em, start: 1)[\n      + $2 + 2$\n      + $3 times 4$\n    ]',
    )
    expect(code).toContain('#if corrige [')
    // les corrections démarrent sur une page impaire (réglage par défaut)
    expect(code).toContain(
      '#{ set page(header: none, footer: none); pagebreak(to: "odd", weak: true) }',
    )
    expect(code).toContain('$3 times 4 = 12$')
  })

  it('enchaîne sans page impaire quand le réglage est décoché', () => {
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$'], corrections: ['$2$'] })],
      { ...defaultTypstDocumentOptions, oddPageStarts: false },
    )
    expect(code).toContain('#pagebreak(weak: true)')
    expect(code).not.toContain('to: "odd"')
  })

  it('espace les boîtes de correction successives', () => {
    const code = buildTypstDocument([
      exercise({ questions: ['$1+1$'], corrections: ['$2$'] }),
      exercise({ questions: ['$2+2$'], corrections: ['$4$'] }),
    ])

    expect(code).toContain('#exo-solution-box(\n      number: 1,')
    expect(code).toContain(
      '#mathalea-needspace()\n    #exo-solution-box(\n      number: 2,',
    )
    expect(code).toContain('solution-above: 1.8em,')
  })

  it('titre les corrections « Exercice N »', () => {
    const code = buildTypstDocument([
      exercise({ questions: ['$1+1$'], corrections: ['$2$'] }),
    ])

    expect(code).toContain('solution-label: "Exercice",')
    expect(code).not.toContain('solution-label: "Correction"')
  })

  it('resserre le filet des corrections du style souligné seulement', () => {
    const exercises = [exercise({ questions: ['$1+1$'], corrections: ['$2$'] })]
    const underline = buildTypstDocument(exercises, {
      ...defaultTypstDocumentOptions,
      badgeStyle: 'underline',
    })
    expect(underline).toContain('exo-solution-box as exo-solution-box-pkg')
    expect(underline).toContain('#let exo-solution-box(corps, ..args)')

    const box = buildTypstDocument(exercises, {
      ...defaultTypstDocumentOptions,
      badgeStyle: 'box',
    })
    expect(box).not.toContain('exo-solution-box-pkg')
    expect(box).not.toContain('#let exo-solution-box(')
  })

  it('fait commencer chaque sujet sur une page impaire', () => {
    const options = { ...defaultTypstDocumentOptions, nbVersions: 2 }
    const versions = [[exercise({ questions: ['$5+5$'] })]]
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$'] })],
      options,
      {},
      versions,
    )
    // saut vers la page impaire, puis remise à 1 du compteur de pages : la
    // parité du compteur reste celle des pages physiques
    expect(code).toContain(
      '#{ set page(header: none, footer: none); pagebreak(to: "odd", weak: true) }\n#counter(page).update(1)',
    )
    const sansParite = buildTypstDocument(
      [exercise({ questions: ['$1+1$'] })],
      { ...options, oddPageStarts: false },
      {},
      versions,
    )
    expect(sansParite).toContain(
      '#pagebreak(weak: true)\n#counter(page).update(1)',
    )
  })

  it('ne déclare pas de réglages de questions pour un exercice à question unique', () => {
    const code = buildTypstDocument([exercise({ questions: ['$1+1$'] })])
    expect(code).not.toContain('#tasks(')
    expect(code).not.toContain('ex1-colonnes')
    expect(code).not.toContain('taskize')
  })

  it('découpe une question unique à repères numAlpha en liste de sous-questions', () => {
    const marker = (letter: string) =>
      `<span style="color:#f15929; font-weight:bold">${letter})&nbsp;</span>`
    const code = buildTypstDocument(
      [
        exercise({
          questions: [
            `Voici la figure.<br>${marker('a')}Question une.<br><br>${marker('b')}Question deux.<br>`,
          ],
          numbered: false,
        }),
      ],
      { ...defaultTypstDocumentOptions, boldQuestionNumbers: false },
    )
    expect(code).toContain(
      '#tasks(columns: ex1-colonnes, label: "a)", row-gutter: ex1-gutter, above: 1.2em, below: 0.8em, start: 1)[\n      + Question une.\n      + Question deux.\n    ]',
    )
    expect(code).toContain('Voici la figure.')
    expect(code).toContain('#let ex1-colonnes = colonnes-questions')
  })

  it('applique le réglage gras aux sous-questions alpha de l’énoncé et du corrigé', () => {
    const item = exercise({
      questions: [
        "<ol class='alpha alpha-parenthesis'><li>un</li><li>deux</li></ol>",
      ],
      corrections: [
        "<ol class='alpha alpha-parenthesis'><li>un</li><li>deux</li></ol>",
      ],
    })
    const bold = buildTypstDocument([item], {
      ...defaultTypstDocumentOptions,
      boldQuestionNumbers: true,
    })
    const normal = buildTypstDocument([item], {
      ...defaultTypstDocumentOptions,
      boldQuestionNumbers: false,
    })

    expect(
      bold.match(/#tasks\(columns: 1, label: "a\)", label-weight: "bold"\)\[/g)
        ?.length,
    ).toBeGreaterThanOrEqual(2)
    expect(
      normal.match(/#tasks\(columns: 1, label: "a\)"\)\[/g)?.length,
    ).toBeGreaterThanOrEqual(2)
  })

  it.skipIf(!shouldRunTypstCliTests())(
    'compile les sous-questions alpha en gras',
    async () => {
      const { execFileSync } = await import('node:child_process')
      const { writeFileSync, mkdtempSync } = await import('node:fs')
      const { tmpdir } = await import('node:os')
      const { join } = await import('node:path')
      const dir = mkdtempSync(join(tmpdir(), 'typst-alpha-bold-'))
      const file = join(dir, 'doc.typ')
      writeFileSync(
        file,
        buildTypstDocument(
          [
            exercise({
              questions: [
                "<ol class='alpha alpha-parenthesis'><li>un</li><li>deux</li></ol>",
              ],
              corrections: [
                "<ol class='alpha alpha-parenthesis'><li>un</li><li>deux</li></ol>",
              ],
            }),
          ],
          { ...defaultTypstDocumentOptions, boldQuestionNumbers: true },
        ),
        'utf-8',
      )
      expect(() =>
        execFileSync('typst', ['compile', file, join(dir, 'doc.pdf')], {
          stdio: 'pipe',
        }),
      ).not.toThrow()
    },
  )

  it('découpe aussi les repères stylizeItems (multiMathfield) en sous-questions', () => {
    // stylizeItems ajoute des propriétés de style après font-weight:bold
    const marker = (letter: string) =>
      `<span style="color:#216d9a; font-weight:bold; display:inline-block; margin-left:0.75em">${letter})</span>`
    const code = buildTypstDocument(
      [
        exercise({
          questions: [
            `À l'aide du graphique :<br>${marker('a')} Première question ?<br>${marker('b')} Deuxième question ?`,
          ],
          numbered: false,
        }),
      ],
      { ...defaultTypstDocumentOptions, boldQuestionNumbers: false },
    )
    expect(code).toContain(
      '#tasks(columns: ex1-colonnes, label: "a)", row-gutter: ex1-gutter, above: 1.2em, below: 0.8em, start: 1)[',
    )
    expect(code).toContain('+ Première question ?')
    expect(code).toContain('+ Deuxième question ?')
    expect(code).toContain("À l'aide du graphique :")
  })

  it('ne découpe pas sur les repères a)/b) cités au fil d’une phrase (renvoi à d’autres questions)', () => {
    // 3A11 : les questions c) et d) renvoient aux décompositions des questions
    // a) et b) au milieu d'une phrase — ces repères ne doivent pas créer de
    // sous-questions ni décaler la numérotation.
    const marker = (letter: string, nbsp = true) =>
      `<span style="color:#216d9a; font-weight:bold">${letter})${nbsp ? '&nbsp;' : ''}</span>`
    const code = buildTypstDocument(
      [
        exercise({
          questions: [
            `${marker('a')}Décomposer $A$.` +
              `<br>${marker('b')}Décomposer $B$.` +
              `<br>${marker('c')}Rendre $A/B$ irréductible à l'aide des décompositions obtenues au ${marker('a')}et au ${marker('b', false)}.` +
              `<br>${marker('d')}Rendre $B/A$ irréductible à l'aide des décompositions obtenues au ${marker('a')}et au ${marker('b', false)}.`,
          ],
          numbered: false,
        }),
      ],
      { ...defaultTypstDocumentOptions, boldQuestionNumbers: false },
    )
    expect(code).toContain(
      '#tasks(columns: ex1-colonnes, label: "a)", row-gutter: ex1-gutter, above: 1.2em, below: 0.8em, start: 1)[',
    )
    // exactement 4 items dans la liste
    expect(code.match(/^\s*\+ /gm)?.length).toBe(4)
    // le renvoi reste inline dans le texte de l'item, pas un nouvel item
    expect(code).toContain("à l'aide des décompositions obtenues au")
  })

  it('met les questions non numérotées dans un environnement tasks sans étiquette', () => {
    const code = buildTypstDocument([
      exercise({ questions: ['a) $1+1$', 'b) $2+2$'], numbered: false }),
    ])
    expect(code).toContain(
      '#tasks(columns: ex1-colonnes, label: none, row-gutter: ex1-gutter, above: 1.2em, below: 0.8em, start: 1)[\n      + a) $1 + 1$\n      + b) $2 + 2$\n    ]',
    )
    expect(code).toContain('#let ex1-colonnes = colonnes-questions')
  })

  it("n'ajoute pas de section corrections quand il n'y en a pas", () => {
    const code = buildTypstDocument([exercise({ questions: ['$1+1$'] })])
    expect(code).not.toContain('#if corrige [')
  })

  it('numérote les exercices dans leur ordre via la banque', () => {
    const code = buildTypstDocument([
      exercise({ questions: ['a'] }),
      exercise({ questions: ['b'], ref: '' }),
    ])
    expect(code).toContain('#let ex1 = exo.with(')
    expect(code).toContain('#let ex2 = exo.with(')
    expect(code).toContain('#ex1()')
    expect(code).toContain('#ex2()')
  })

  it('déclare les figures SVG en tête et les référence dans le corps', () => {
    const code = buildTypstDocument([
      exercise({
        questions: ['Figure : <svg width="96"><rect/></svg>'],
        corrections: ['Corrigé : <svg><circle/></svg>'],
      }),
    ])
    expect(code).toContain('// ----- Figures (SVG embarqués) -----')
    expect(code).toContain('#let fig-1 = image(bytes(')
    expect(code).toContain('#let fig-2 = image(bytes(')
    // tout SVG autonome passe par mathalea-figure-block : contrôles de
    // zoom/alignement de la palette de l'aperçu, comme les figures mathalea2d
    expect(code).toContain(
      'Figure : #mathalea-figure-block(1, fig-1-align, fig-1-zoom, fig-1)',
    )
    expect(code).toContain(
      'Corrigé : #mathalea-figure-block(2, fig-2-align, fig-2-zoom, fig-2)',
    )
    expect(code).toContain('#let fig-1-zoom = 1')
    expect(code).toContain('#let mathalea-figure-block(')
    // les définitions doivent précéder les références
    expect(code.indexOf('#let fig-1')).toBeLessThan(
      code.indexOf('Figure : #mathalea-figure-block(1'),
    )
  })

  it('ajoute les helpers mathalea2d quand une figure contient des labels Typst', () => {
    const code = buildTypstDocument([
      exercise({
        questions: [
          '<div class="svgContainer"><div><svg class="mathalea2d" width="96" height="48"></svg><div class="divLatex" style="top: 10px; left: 20px; transform: rotate(0deg);" data-top=10 data-left=20><span class="katex"><span class="katex-mathml"><math><semantics><annotation encoding="application/x-tex">1</annotation></semantics></math></span></span></div></div></div>',
        ],
      }),
    ])
    expect(code).toContain('// ----- Figures mathalea2d -----')
    expect(code).toContain('#let mathalea-figure')
    expect(code).toContain('#mathalea-figure-block(1, fig-1-align, fig-1-zoom,')
    expect(code).toContain('mathalea-figure(72.0pt, 36.0pt, fig-1, labels: (')
    expect(code).toContain('mathalea-label(15.0pt, 7.5pt, [$1$])')
  })

  it('importe ctz-euclide (et pas le cetz autonome) quand une annale l’utilise', () => {
    const code = buildTypstDocument([
      exercise({
        intro:
          '#ctz-canvas(length: 0.75cm, {\n' +
          '  import cetz.draw: *\n' +
          '  ctz-init()\n' +
          '  ctz-def-points(A: (0, 0), B: (6.4, 0))\n' +
          '  ctz-draw(segment: ("A", "B"), stroke: black + 1pt)\n' +
          '  ctz-draw-labels("A", "B", A: (pos: "below left"))\n' +
          '})',
      }),
    ])
    expect(code).toContain(`#import "${typstPackageSpec('ctz-euclide')}": *`)
    // ctz-euclide réexporte cetz : pas de second import cetz (versions différentes)
    expect(code).not.toContain(`#import "${typstPackageSpec('cetz')}"`)
  })

  it('marque le début de chaque sujet quand la fiche en a plusieurs', () => {
    // l'aperçu ne compile qu'un sujet à la fois (`previewCode`) : il lui faut
    // un repère pour découper le document. Ce sont des commentaires, le rendu
    // et l'export ne changent pas.
    const exercises = [exercise({ questions: ['$1+1$'] })]
    const code = buildTypstDocument(
      exercises,
      defaultTypstDocumentOptions,
      {},
      [exercises],
    )
    expect(code).toContain('// mathalea:sujet(0)')
    expect(code).toContain('// mathalea:sujet(1)')
    // le repère du sujet A précède son en-tête, celui du sujet B son saut de page
    expect(code.indexOf('// mathalea:sujet(0)')).toBeLessThan(
      code.indexOf('// mathalea:sujet(1)'),
    )
    // sur une fiche à un seul sujet, aucun repère : rien à découper
    expect(buildTypstDocument(exercises)).not.toContain('// mathalea:sujet(')
  })

  it('ajoute les repères de régénération individuels aux sujets dérivés', () => {
    const exercises = [exercise({ questions: ['$1+1$'] })]
    const code = buildTypstDocument(
      exercises,
      defaultTypstDocumentOptions,
      {},
      [exercises],
    )
    expect(code).toContain('#mathalea-anchor("exo", 1)')
    expect(code.match(/#mathalea-anchor\("exo", 1\)/g)).toHaveLength(2)
    expect(subjectEditorCode(code, 1)).toContain('#mathalea-anchor("gap", 0)')
  })

  it('conserve les éditions propres à chacun des quatre sujets après régénération', () => {
    const inputs = [exercise({ questions: ['$1+1$'], corrections: ['$2$'] })]
    const carry = {
      codeOverrides: { 1: 'Énoncé A.' },
      versions: Object.fromEntries(
        [1, 2, 3].map((v) => [
          v,
          {
            codeOverrides: { 1: `Énoncé ${v}.` },
            codeOverridesCorrection: { 1: `Correction ${v}.` },
            insertions: { 0: [`Texte ${v}.`] },
          },
        ]),
      ),
    }
    const build = (
      settings: typeof carry | ReturnType<typeof harvestCarryOver>,
    ) =>
      buildTypstDocument(inputs, defaultTypstDocumentOptions, settings, [
        inputs,
        inputs,
        inputs,
      ])
    const first = build(carry)
    const harvested = harvestCarryOver(first)
    const second = build(harvested)
    for (const v of [1, 2, 3]) {
      const selected = subjectEditorCode(second, v)
      expect(selected.length).toBe(second.length)
      expect(selected.split('\n')).toHaveLength(second.split('\n').length)
      expect(selected).toContain(`Énoncé ${v}.`)
      expect(selected).toContain(`Correction ${v}.`)
      expect(selected).toContain(`Texte ${v}.`)
      expect(selected).not.toContain('Énoncé A.')
      expect(harvested.versions?.[v].codeOverrides).toEqual(
        carry.versions[v].codeOverrides,
      )
    }
    expect(harvested.codeOverrides).toEqual(carry.codeOverrides)
  })

  it('garde les figures du sujet édité après plusieurs régénérations', () => {
    const inputs = [
      exercise({
        questions: [
          '<svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="5" /></svg>',
        ],
      }),
    ]
    const carry = { versions: { 1: { codeOverrides: { 1: '#fig-1' } } } }
    const build = (settings: ReturnType<typeof harvestCarryOver>) =>
      buildTypstDocument(inputs, defaultTypstDocumentOptions, settings, [
        inputs,
      ])
    const first = build(carry)
    expect(subjectEditorCode(first, 1)).toContain('#fig-2')
    const restored = harvestCarryOver(first)
    expect(restored.versions?.[1].codeOverrides?.[1]).toBe('#fig-1')
    expect(subjectEditorCode(build(restored), 1)).toContain('#fig-2')
  })

  it('nomme le sujet sur la première page de sa section Corrections quand la fiche en a plusieurs', () => {
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$'], corrections: ['$2$'] })],
      defaultTypstDocumentOptions,
      {},
      [[exercise({ questions: ['$5+5$'], corrections: ['$10$'] })]],
    )
    // une étiquette « Sujet A »/« Sujet B » par section Corrections, en plus
    // de celle déjà affichée dans l'en-tête de chaque sujet
    expect(
      code.match(/#align\(center, text\(weight: "bold".*\)\[Sujet [AB]\]\)/g)
        ?.length,
    ).toBe(2)
    const corrIndex = code.indexOf('// ----- Corrections -----')
    expect(code.slice(corrIndex, corrIndex + 400)).toContain('Sujet A')
    const corrIndex2 = code.indexOf('// ----- Corrections -----', corrIndex + 1)
    expect(code.slice(corrIndex2, corrIndex2 + 400)).toContain('Sujet B')
    // sur une fiche à un seul sujet, pas d'étiquette (rien à distinguer)
    const single = buildTypstDocument([
      exercise({ questions: ['$1+1$'], corrections: ['$2$'] }),
    ])
    expect(single).not.toContain('Sujet A')
  })

  it.each(['epure', 'cartouche', 'cadre'] as const)(
    'libère la ligne de version masquée dans l’en-tête %s',
    (headerStyle) => {
      const build = (hideVersionLabel: boolean, headerLine = '') =>
        buildTypstDocument(
          [exercise()],
          {
            ...defaultTypstDocumentOptions,
            headerStyle,
            headerLine,
            hideVersionLabel,
          },
          {},
          [[exercise()]],
        )
      const visible = build(false)
      const hidden = build(true)
      expect(visible).toContain('#if true [')
      expect(visible).toContain('#mathalea-anchor("version-label", 0)#text(')
      expect(hidden).toContain('#if entete != "" [')
      expect(hidden).toContain(
        '#place(top + right)[#mathalea-anchor("version-label", 0)]',
      )
      expect(hidden).not.toContain('hide(text(weight: "bold"')
      expect(hidden).not.toContain('grid(columns: (1fr, auto)')
      expect(build(true, 'Nom et prénom')).toContain(
        '#let entete = "Nom et prénom"',
      )
    },
  )

  describe('étiquette de version sur la page de garde', () => {
    const build = (
      headerStyle: 'aucun' | 'epure',
      template: 'recitation' | 'evaluation' | 'can',
      hideVersionLabel = false,
    ) =>
      buildTypstDocument(
        [exercise()],
        {
          ...defaultTypstDocumentOptions,
          headerStyle,
          hideVersionLabel,
          coverPage: {
            ...defaultTypstDocumentOptions.coverPage,
            template,
          },
        },
        {},
        [[exercise()]],
      )

    it.each(['recitation', 'evaluation', 'can'] as const)(
      'affiche « Sujet A/B » sur la page de garde %s sans bloc de titre',
      (template) => {
        const code = build('aucun', template)
        expect(code).toContain(
          '  version: [#mathalea-anchor("version-label", 0)Sujet A],',
        )
        expect(code).toContain(
          '  version: [#mathalea-anchor("version-label", 0)Sujet B],',
        )
      },
    )

    it('garde le repère de l’icône quand l’étiquette est masquée', () => {
      const code = build('aucun', 'recitation', true)
      expect(code).not.toContain('Sujet A],')
      expect(code).toContain(
        '#place(top + right)[#mathalea-anchor("version-label", 0)]',
      )
    })

    it('laisse l’en-tête de fiche porter l’étiquette quand il existe', () => {
      expect(build('epure', 'recitation')).not.toContain('  version: [')
    })
  })

  it('n’importe pas ctz-euclide quand aucune annale ne l’utilise', () => {
    const code = buildTypstDocument([exercise({ questions: ['$1+1$'] })])
    expect(code).not.toContain('ctz-euclide')
  })

  it('génère un tableau natif sans dépendance externe', () => {
    const code = buildTypstDocument([
      exercise({
        questions: [
          '$\\def\\arraystretch{1.5}\\begin{array}{|l|c|}\\hline x & 1 \\\\ \\hline\\end{array}$',
        ],
      }),
    ])
    expect(code).not.toContain('@preview/tblr')
    expect(code).toContain('#table(')
  })

  it('importe taskize et règle les colonnes quand un QCM est présent', () => {
    const code = buildTypstDocument([
      exercise({
        questions: [
          '<div class="my-3">' +
            '<div class="ex1 inline-block"><input type="checkbox" disabled><label id="labelEx1Q0R0">$1$</label></div>' +
            '<div class="ex1 inline-block"><input type="checkbox" disabled><label id="labelEx1Q0R1">$2$</label></div>' +
            '</div>',
        ],
      }),
    ])
    expect(code).toContain(
      `#import "${typstPackageSpec('taskize')}": tasks as taskize-tasks`,
    )
    // l'enrobage qui aligne le numéro sur la première ligne de l'énoncé
    expect(code).toContain('#let mathalea-question-numerotee(')
    expect(code).toContain('#let qcm-bonne(')
    // colonnes des propositions réglables par exercice depuis la palette,
    // en `auto-fit` par défaut (taskize choisit 1 à 4 colonnes uniformes
    // selon la largeur réelle des propositions)
    expect(code).toContain('#let ex1-qcm-colonnes = "auto-fit"')
    expect(code).toContain('#tasks(columns: ex1-qcm-colonnes')
    // les propositions n'ont pas de `row-gutter` : pas de variable inutile
    expect(code).not.toContain('#let ex1-qcm-gutter')
    // un exercice à question unique n'a pas de liste `tasks`, mais son QCM
    // a quand même besoin d'un repère où la palette pose ses contrôles
    expect(code).toContain('#mathalea-anchor("tasks", 1)')
  })

  it('reprend les colonnes de QCM réglées par exercice (round-trip)', () => {
    const qcmQuestion = (num: number) =>
      '<div class="my-3">' +
      `<div class="ex${num} inline-block"><input type="checkbox" disabled><label id="labelEx${num}Q0R0">$1$</label></div>` +
      `<div class="ex${num} inline-block"><input type="checkbox" disabled><label id="labelEx${num}Q0R1">$2$</label></div>` +
      '</div>'
    const exercises = [
      exercise({ questions: [qcmQuestion(1)] }),
      exercise({
        questions: [qcmQuestion(2)],
        corrections: [qcmQuestion(2)],
        ref: '',
      }),
    ]
    const code = buildTypstDocument(exercises, defaultTypstDocumentOptions, {
      tasksLayout: {
        'ex2-qcm': { columns: '1' },
        'ex2-corr-qcm': { columns: '4' },
      },
    })
    expect(code).toContain('#let ex1-qcm-colonnes = "auto-fit"')
    expect(code).toContain('#let ex2-qcm-colonnes = 1')
    expect(code).toContain('#let ex2-corr-qcm-colonnes = 4')
    // l'énoncé et la correction du même exercice se règlent indépendamment
    expect(harvestCarryOver(code).tasksLayout).toEqual({
      'ex2-qcm': { columns: '1' },
      'ex2-corr-qcm': { columns: '4' },
    })
  })

  it('donne une colonne aux QCM dont les propositions sont des figures', () => {
    // `mathalea-fit` réduit une figure à la largeur qu'on lui donne : elle
    // « tient » donc dans n'importe quelle colonne, et `auto-fit` en
    // choisirait quatre, illisibles. Le contenu des propositions décide donc
    // de la valeur par défaut.
    const figure = '<svg width="600" height="60"><rect/></svg>'
    const code = buildTypstDocument([
      exercise({
        questions: [
          'Sur quelle droite graduée ?<div class="my-3">' +
            `<div class="ex1 inline-block"><input type="checkbox" disabled><label id="labelEx1Q0R0">${figure}</label></div>` +
            `<div class="ex1 inline-block"><input type="checkbox" disabled><label id="labelEx1Q0R1">${figure}</label></div>` +
            '</div>',
        ],
      }),
    ])
    expect(code).toContain('#let ex1-qcm-colonnes = 1')
    expect(code).toContain(
      '#tasks(columns: ex1-qcm-colonnes, label: none, above: 0.4em, below: 0.4em, equilibre: true)[ // mathalea:qcm-figures',
    )
    // ce 1 est un défaut lié au contenu, pas un réglage du professeur : le
    // figer dans le carry-over rendrait le choix insensible aux régénérations
    expect(harvestCarryOver(code).tasksLayout ?? {}).toEqual({})
  })

  it("applique le nombre de colonnes demandé par l'exercice, même pour des figures", () => {
    const figure = '<svg width="600" height="60"><rect/></svg>'
    const code = buildTypstDocument([
      exercise({
        questions: [
          'Quelle courbe ?<div class="my-3" data-typst-colonnes="2">' +
            `<div class="ex1 inline-block"><label id="labelEx1Q0R0">${figure}</label></div>` +
            `<div class="ex1 inline-block"><label id="labelEx1Q0R1">${figure}</label></div>` +
            '</div>',
        ],
      }),
    ])
    expect(code).toContain('#let ex1-qcm-colonnes = 2')
    expect(code).toContain('// mathalea:qcm-colonnes(2)')
    // c'est un défaut de l'exercice, pas un réglage du professeur
    expect(harvestCarryOver(code).tasksLayout ?? {}).toEqual({})
  })

  it("applique l'alignement des figures demandé par l'exercice", () => {
    const figure = '<svg width="600" height="60"><rect/></svg>'
    const code = buildTypstDocument([
      exercise({
        questions: [
          'Quelle courbe ?<div class="my-3" data-typst-align="left">' +
            `<div class="ex1 inline-block"><label id="labelEx1Q0R0">${figure}</label></div>` +
            `<div class="ex1 inline-block"><label id="labelEx1Q0R1">${figure}</label></div>` +
            '</div>',
        ],
      }),
    ])
    expect(code).toContain('#let fig-1-align = left')
    expect(code).toContain('#let fig-2-align = left')
    // un défaut de l'exercice n'est pas un réglage du professeur…
    expect(harvestCarryOver(code).figureAlign ?? {}).toEqual({})
    // …mais recentrer une figure depuis la palette est un réglage à conserver
    const recentered = code.replace(
      '#let fig-2-align = left',
      '#let fig-2-align = center',
    )
    expect(harvestCarryOver(recentered).figureAlign).toEqual({ 2: 'center' })
  })

  it('écrit les colonnes de QCM en valeur littérale en mode export', () => {
    const code = buildTypstDocument(
      [
        exercise({
          questions: [
            '<div class="my-3">' +
              '<div class="ex1 inline-block"><input type="checkbox" disabled><label id="labelEx1Q0R0">$1$</label></div>' +
              '<div class="ex1 inline-block"><input type="checkbox" disabled><label id="labelEx1Q0R1">$2$</label></div>' +
              '</div>',
          ],
        }),
      ],
      defaultTypstDocumentOptions,
      { tasksLayout: { 'ex1-qcm': { columns: '3' } } },
      [],
      { exportMode: true },
    )
    // hors de l'éditeur intégré, les variables de la palette n'ont pas de sens
    expect(code).toContain('#tasks(columns: 3, label: none')
    expect(code).not.toContain('ex1-qcm-colonnes')
  })

  describe('figures `vraieGrandeur` (construction/mesure)', () => {
    // figure mathalea2d posée avec `vraieGrandeur: true` (voir mathalea2d.ts) :
    // elle ne se réduit jamais pour tenir dans une colonne, contrairement à
    // une figure illustrative ordinaire (`mathalea-figure-block` reçoit
    // `force-true-size: true`) — voir `latexToTypst.test.ts` pour ce niveau-là
    const vraieGrandeurFigure = (widthCm: number) =>
      '<div class="svgContainer"><div>' +
      `<svg class="mathalea2d" data-width-cm="${widthCm}" data-height-cm="5" data-vraie-grandeur="1" width="${widthCm * 30}" height="150">` +
      '<line x1="0" y1="0" x2="10" y2="10"/></svg></div></div>'

    it('déclare la liste à une seule colonne quand une question contient une figure vraieGrandeur', () => {
      const code = buildTypstDocument([
        exercise({
          questions: [vraieGrandeurFigure(10), vraieGrandeurFigure(12)],
          numbered: true,
        }),
      ])
      expect(code).toContain('#let ex1-colonnes = 1')
      expect(code).toContain('#tasks(columns: ex1-colonnes, label:')
      expect(code).toContain('[ // mathalea:vraie-grandeur')
      // ce 1 est un défaut lié au contenu, pas un réglage du professeur : le
      // figer dans le carry-over l'empêcherait de redevenir "colonnes-questions"
      // si la figure vraieGrandeur est retirée à une régénération suivante
      expect(harvestCarryOver(code).tasksLayout?.ex1?.columns).toBeUndefined()
    })

    it('respecte le nombre de colonnes choisi dans la palette malgré une figure vraieGrandeur', () => {
      const code = buildTypstDocument(
        [
          exercise({
            questions: [vraieGrandeurFigure(10), vraieGrandeurFigure(12)],
            numbered: true,
          }),
        ],
        defaultTypstDocumentOptions,
        { tasksLayout: { ex1: { columns: '4' } } },
      )
      expect(code).toContain('#let ex1-colonnes = 4')
    })

    it('écrit une seule colonne en mode export pour une figure vraieGrandeur, sauf réglage explicite', () => {
      const code = buildTypstDocument(
        [
          exercise({
            questions: [vraieGrandeurFigure(10), vraieGrandeurFigure(12)],
            numbered: true,
          }),
        ],
        defaultTypstDocumentOptions,
        {},
        [],
        { exportMode: true },
      )
      expect(code).toContain('#tasks(columns: 1, label:')
      expect(code).not.toContain('mathalea:vraie-grandeur')
    })
  })

  describe('numérotation alignée sur la première ligne de l’énoncé', () => {
    // un QCM fait de l'énoncé un contenu mixte (texte puis bloc de
    // propositions) : taskize alignerait alors le numéro sur le haut de la
    // cellule, donc au-dessus de la ligne de base du texte dès qu'une
    // fraction (en display) creuse la première ligne
    const qcm = (enonce: string) =>
      `${enonce}<div class="my-3">` +
      '<div class="ex1 inline-block"><input type="checkbox" disabled><label id="labelEx1Q0R0">$\\dfrac{-4}{3}$</label></div>' +
      '<div class="ex1 inline-block"><input type="checkbox" disabled><label id="labelEx1Q0R1">$12$</label></div>' +
      '</div>'

    const qcmDocument = () =>
      buildTypstDocument([
        exercise({
          questions: [
            qcm('La solution de $\\dfrac{4}{x} = -3$ est : '),
            qcm('La solution de $\\dfrac{x}{5} = 1$ est : '),
          ],
          numbered: true,
        }),
      ])

    it('importe taskize sous un alias et déclare l’enrobage', () => {
      const code = qcmDocument()
      expect(code).toContain(
        `#import "${typstPackageSpec('taskize')}": tasks as taskize-tasks, tasks-setup, is-inline-content, format-label`,
      )
      expect(code).toContain('#let tasks(')
      expect(code).toContain('#let mathalea-question-numerotee(')
      // les listes de questions restent écrites de la même façon : c'est
      // l'enrobage qui décide, à la compilation, du rendu de chaque item
      expect(code).toContain('#tasks(columns: ex1-colonnes')
    })

    it('numérote lui-même les listes purement en ligne (numéro de largeur nulle)', () => {
      const code = buildTypstDocument([
        exercise({ questions: ['$1+1$', '$2+2$'], numbered: true }),
      ])
      // une formule en ligne est enrobée dans une boîte insécable : le numéro
      // ne doit pas occuper de place dans la ligne, sinon une formule large
      // passe sous un numéro resté seul
      expect(code).not.toContain('items.all(is-inline-content) {')
      expect(code).toContain('let en-ligne = items.all(is-inline-content)')
    })

    it('ne déclare pas l’enrobage sans liste de questions ni QCM', () => {
      const code = buildTypstDocument([exercise({ questions: ['$1+1$'] })])
      expect(code).not.toContain('mathalea-question-numerotee')
    })

    it.skipIf(!shouldRunTypstCliTests())(
      'compile avec typst : QCM à fractions',
      async () => {
        const { execFileSync } = await import('node:child_process')
        const { writeFileSync, mkdtempSync } = await import('node:fs')
        const { tmpdir } = await import('node:os')
        const { join } = await import('node:path')
        const dir = mkdtempSync(join(tmpdir(), 'typst-qcm-'))
        const file = join(dir, 'doc.typ')
        writeFileSync(file, qcmDocument(), 'utf-8')
        expect(() =>
          execFileSync('typst', ['compile', file, join(dir, 'doc.pdf')], {
            stdio: 'pipe',
          }),
        ).not.toThrow()
      },
    )

    it.skipIf(!shouldRunTypstCliTests())(
      'compile avec typst : deux QCM à cinq propositions',
      async () => {
        const qcmFiveChoices = (question: number) =>
          '<div class="my-3">' +
          Array.from(
            { length: 5 },
            (_, choice) =>
              `<div class="ex1 inline-block"><input type="checkbox" disabled><label id="labelEx1Q${question}R${choice}">$\\mathbb{${['N', 'Z', 'D', 'Q', 'R'][choice]}$</label></div>`,
          ).join('') +
          '</div>'
        const code = buildTypstDocument([
          exercise({
            questions: [qcmFiveChoices(0), qcmFiveChoices(1)],
            numbered: true,
          }),
        ])
        const { execFileSync } = await import('node:child_process')
        const { writeFileSync, mkdtempSync } = await import('node:fs')
        const { tmpdir } = await import('node:os')
        const { join } = await import('node:path')
        const dir = mkdtempSync(join(tmpdir(), 'typst-qcm-five-'))
        const file = join(dir, 'doc.typ')
        writeFileSync(file, code, 'utf-8')
        expect(() =>
          execFileSync('typst', ['compile', file, join(dir, 'doc.pdf')], {
            stdio: 'pipe',
          }),
        ).not.toThrow()
      },
    )
  })

  it("n'ajoute pas de section figures sans figure", () => {
    const code = buildTypstDocument([exercise({ questions: ['$1+1$'] })])
    expect(code).not.toContain('----- Figures')
    expect(code).not.toContain('mathalea-figure')
  })

  it('affiche un avertissement pour un exercice non exportable', () => {
    const code = buildTypstDocument([
      exercise({ warning: 'Exercice interactif uniquement.' }),
    ])
    expect(code).toContain('Exercice interactif uniquement.')
  })

  it('fusionne les exercices : pas de banque et numérotation continue', () => {
    const code = buildTypstDocument(
      [
        exercise({ questions: ['$1+1$', '$2+2$'], numbered: true }),
        exercise({ questions: ['$3+3$', '$4+4$'], numbered: true, ref: '' }),
      ],
      { ...defaultTypstDocumentOptions, mergeExercises: true },
    )
    expect(code).not.toContain('exo.with(')
    expect(code).not.toContain('exercise-bank')
    expect(code).toContain('start: 1)')
    expect(code).toContain('start: 3)')
  })

  it('mode fusionné : recopie la consigne en tête de chaque question', () => {
    const code = buildTypstDocument(
      [
        exercise({
          intro: 'Calculer.',
          consigne: 'Calculer.',
          questions: ['$4+3$', '$7\\times 8$'],
          numbered: true,
        }),
        exercise({
          intro: 'Justifier.',
          consigne: 'Justifier.',
          questions: ['12 est-il divisible par 2 ?'],
          numbered: true,
          ref: '',
        }),
      ],
      { ...defaultTypstDocumentOptions, mergeExercises: true },
    )
    const enonces = code.slice(code.indexOf('// ----- Énoncés -----'))
    // la consigne précède chaque énoncé, sur sa propre ligne (`\`)
    expect(enonces).toContain('+ Calculer. \\\n      $4 + 3$')
    expect(enonces).toContain('+ Calculer. \\\n      $7 times 8$')
    expect(enonces).toContain(
      '+ Justifier. \\\n      12 est-il divisible par 2 ?',
    )
    // et n'est plus affichée une seule fois avant la liste
    expect(enonces).not.toMatch(/\n {2}Calculer\.\n/)
  })

  it('hors mode fusionné : la consigne reste affichée une fois avant la liste', () => {
    const code = buildTypstDocument([
      exercise({
        intro: 'Calculer.',
        consigne: 'Calculer.',
        questions: ['$4+3$', '$7\\times 8$'],
        numbered: true,
      }),
    ])
    expect(code).toContain('Calculer.')
    expect(code).not.toContain('+ Calculer. \\')
  })

  it('mode fusionné : garde l’introduction avant la liste, la consigne dans les items', () => {
    const code = buildTypstDocument(
      [
        exercise({
          intro: 'Calculer.<br>On donne le tableau suivant.',
          consigne: 'Calculer.',
          introduction: 'On donne le tableau suivant.',
          questions: ['$4+3$', '$7\\times 8$'],
          numbered: true,
        }),
      ],
      { ...defaultTypstDocumentOptions, mergeExercises: true },
    )
    const enonces = code.slice(code.indexOf('// ----- Énoncés -----'))
    expect(enonces).toContain('On donne le tableau suivant.')
    expect(enonces).toContain('+ Calculer. \\\n      $4 + 3$')
    expect(enonces).not.toMatch(/\n {2}Calculer\.\n/)
  })

  it('règle le nombre de colonnes du document', () => {
    const code = buildTypstDocument([exercise({ questions: ['$1+1$'] })], {
      ...defaultTypstDocumentOptions,
      columns: 2,
    })
    expect(code).toContain(
      '#let colonnes = 2 // nombre de colonnes (1, 2 ou 3)',
    )
  })

  it('règle le format et l’orientation de la page', () => {
    const code = buildTypstDocument([exercise({ questions: ['$1+1$'] })], {
      ...defaultTypstDocumentOptions,
      pageFormat: 'a5',
      orientation: 'landscape',
    })
    expect(code).toContain('#set page(paper: "a5", flipped: true,')
  })

  it('utilise des badges soulignés noirs par défaut', () => {
    const code = buildTypstDocument([
      exercise({ questions: ['$1+1$', '$2+2$'] }),
    ])
    expect(code).toContain('#let couleur = black')
    expect(code).toContain('badge-style: "underline",')
  })

  it('choisit le style de badge et compacte la colonne des styles en marge', () => {
    const borderAccent = buildTypstDocument(
      [exercise({ questions: ['$1+1$'] })],
      { ...defaultTypstDocumentOptions, badgeStyle: 'border-accent' },
    )
    expect(borderAccent).toContain('badge-style: "border-accent",')
    expect(borderAccent).toContain('margin: (x: 10mm, y: 15mm)')
    // style pleine largeur : pas de réglage de colonne
    expect(borderAccent).not.toContain('margin-position:')

    const box = buildTypstDocument([exercise({ questions: ['$1+1$'] })], {
      ...defaultTypstDocumentOptions,
      badgeStyle: 'box',
    })
    expect(box).toContain('badge-style: "box",')
    // marge de page inchangée, colonne du badge compacte
    expect(box).toContain('margin: (x: 15mm, y: 15mm)')
    expect(box).toContain('label-extra: 0pt,')
    // énoncés : colonne compacte
    expect(box).toContain('margin-position: 2.2cm,')

    // corrections (plus larges) : colonne élargie avant leur affichage
    const boxWithCorr = buildTypstDocument(
      [exercise({ questions: ['$1+1$'], corrections: ['$2$'] })],
      { ...defaultTypstDocumentOptions, badgeStyle: 'box' },
    )
    expect(boxWithCorr).toContain('#exo-setup(margin-position: 2.9cm)')
  })

  it('place le badge au-dessus de l’énoncé et supprime la colonne de badge', () => {
    const enMarge = buildTypstDocument([exercise({ questions: ['$1+1$'] })], {
      ...defaultTypstDocumentOptions,
      badgeStyle: 'pill',
    })
    expect(enMarge).toContain('margin-position: 2.5cm,')
    expect(enMarge).not.toContain('badge-position:')

    const auDessus = buildTypstDocument([exercise({ questions: ['$1+1$'] })], {
      ...defaultTypstDocumentOptions,
      badgeStyle: 'pill',
      badgePosition: 'above',
    })
    expect(auDessus).toContain('badge-position: "above",')
    // plus de colonne de badge : ni largeur imposée, ni marge de page élargie
    expect(auDessus).not.toContain('margin-position:')
    expect(auDessus).not.toContain('label-extra:')
    expect(auDessus).toContain('margin: (x: 10mm, y: 15mm)')

    // style pleine largeur : le réglage reste mémorisé mais n'est pas émis
    const pleineLargeur = buildTypstDocument(
      [exercise({ questions: ['$1+1$'] })],
      {
        ...defaultTypstDocumentOptions,
        badgeStyle: 'underline',
        badgePosition: 'above',
      },
    )
    expect(pleineLargeur).not.toContain('badge-position:')
  })

  it('propose les styles ajoutés par exercise-bank (rect, filled-rect, margin)', () => {
    // badges au seul numéro : même colonne compacte que les styles cerclés
    for (const style of ['rect', 'filled-rect'] as const) {
      const code = buildTypstDocument([exercise({ questions: ['$1+1$'] })], {
        ...defaultTypstDocumentOptions,
        badgeStyle: style,
      })
      expect(code).toContain(`badge-style: "${style}",`)
      expect(code).toContain('margin-position: 1.4cm,')
    }
    // `margin` gère lui-même sa colonne latérale (et la replie en dessous de
    // `margin-fold-below`) : pas de `margin-position` imposé
    const margin = buildTypstDocument([exercise({ questions: ['$1+1$'] })], {
      ...defaultTypstDocumentOptions,
      badgeStyle: 'margin',
    })
    expect(margin).toContain('badge-style: "margin",')
    expect(margin).not.toContain('margin-position:')
  })

  it('génère les trois habillages d’en-tête et le sous-titre', () => {
    const epure = buildTypstDocument([exercise({ questions: ['$1+1$'] })], {
      ...defaultTypstDocumentOptions,
      subtitle: 'Sixième',
    })
    expect(epure).toContain('#let titre = "Fiche d\'exercices"')
    expect(epure).toContain('#let sous-titre = "Sixième"')
    // épuré : filet sous le titre + pied avec crédit
    expect(epure).toContain('#line(length: 100%, stroke: 1.2pt + couleur)')
    // texte du pied de page : variable éditable, partagée entre les trois
    // habillages (voir le groupe de tests « en-tête et pied de page »)
    expect(epure).toContain('#let pied-page = "MathALÉA — coopmaths.fr"')
    expect(epure).toContain('#align(left)[#pied-page]')

    const cartouche = buildTypstDocument([exercise({ questions: ['$1+1$'] })], {
      ...defaultTypstDocumentOptions,
      headerStyle: 'cartouche',
    })
    expect(cartouche).toContain('#block(width: 100%, fill: couleur')

    const cadre = buildTypstDocument([exercise({ questions: ['$1+1$'] })], {
      ...defaultTypstDocumentOptions,
      headerStyle: 'cadre',
    })
    expect(cadre).toContain(
      'stroke: (top: 1pt + couleur, bottom: 1pt + couleur)',
    )
    expect(cadre).toContain('#align(left)[#pied-page]')
  })

  it.each(['epure', 'cartouche', 'cadre'] as const)(
    'supprime la pagination et le rappel du titre du pied de page (%s)',
    (headerStyle) => {
      const code = buildTypstDocument([exercise()], {
        ...defaultTypstDocumentOptions,
        headerStyle,
      })
      const footer = code.slice(
        code.indexOf('footer: context ['),
        code.indexOf('#set text(font:'),
      )
      expect(footer).toContain('#align(left)[#pied-page]')
      expect(footer).not.toContain('counter(page)')
      expect(footer).not.toContain('align(right)')
    },
  )

  it('règle la police, la police des maths et la taille du texte', () => {
    const code = buildTypstDocument([exercise({ questions: ['$1+1$'] })], {
      ...defaultTypstDocumentOptions,
      font: 'Noto Sans',
      mathFont: 'Noto Sans Math',
      fontSize: 12.5,
    })
    expect(code).toContain('#let police-texte = "Noto Sans"')
    expect(code).toContain('#let police-maths = "Noto Sans Math"')
    expect(code).toContain('#let taille-texte = 12.5pt')
    expect(code).toContain('#set text(font: police-texte, size: taille-texte')
    expect(code).toContain('#show math.equation: set text(font: police-maths)')
    expect(code).toContain('#let txt(corps) = text(font: police-texte, corps)')
  })

  it('met les formules en ligne dans une boîte sans perdre leur ligne de base', () => {
    const code = buildTypstDocument([exercise({ questions: ['$1+1$'] })])
    // la formule est émise nue : c'est la règle d'affichage du préambule qui
    // l'enferme dans une boîte (voir MATHALEA_INLINE_FORMULA_RULE)
    expect(code).toContain('$1 + 1$')
    expect(code).not.toContain('#box($1 + 1$)')
    expect(code).toContain('#show math.equation.where(block: false):')
    expect(code).toContain('box(baseline: measure(')
  })

  it('règle la couleur des badges', () => {
    const code = buildTypstDocument([exercise({ questions: ['$1+1$'] })], {
      ...defaultTypstDocumentOptions,
      badgeColor: 'rgb("#f15929")',
    })
    expect(code).toContain('#let couleur = rgb("#f15929")')
  })

  it('émet les repères de la palette de mise en page', () => {
    const code = buildTypstDocument([
      exercise({ questions: ['$1+1$', '$2+2$'], numbered: true }),
      exercise({ questions: ['$3+3$'], ref: '' }),
    ])
    expect(code).toContain('#let mathalea-anchor(kind, num, dx: 0pt)')
    // un repère devant chaque environnement tasks
    expect(code).toContain('#mathalea-anchor("tasks", 1)\n    #tasks(')
    // un repère de gap avant le premier exercice et après chacun, et un
    // repère "exo" (contrôles de l'exercice) devant chaque exercice
    expect(code).toContain(
      '#mathalea-anchor("gap", 0)\n  #mathalea-needspace()\n  #mathalea-anchor("exo", 1)\n  #ex1()',
    )
    expect(code).toContain('#ex1()\n  #mathalea-anchor("gap", 1)')
    expect(code).toContain('#ex2()\n  #mathalea-anchor("gap", 2)')
    // le helper est défini avant la banque (exo.with évalue son contenu)
    expect(code.indexOf('#let mathalea-anchor')).toBeLessThan(
      code.indexOf('#let ex1 = exo.with('),
    )
    // titre de section insérable entre les exercices
    expect(code).toContain('#let section(titre)')
    // repère du bloc de titre (édition du titre/en-tête depuis l'aperçu)
    expect(code).toContain('#mathalea-anchor("header", 0)')
  })

  it('émet les repères de gap aussi en mode fusionné', () => {
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$', '$2+2$'], numbered: true })],
      { ...defaultTypstDocumentOptions, mergeExercises: true },
    )
    expect(code).toContain('#let mathalea-anchor(kind, num, dx: 0pt)')
    expect(code).toContain('#mathalea-anchor("gap", 1)')
  })

  it('reprend les réglages de la palette (carry-over) à la régénération', () => {
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$', '$2+2$'], numbered: true })],
      defaultTypstDocumentOptions,
      {
        tasksLayout: { ex1: { columns: '2', gutter: '1.5em' } },
        insertions: {
          0: ['Consignes générales.'],
          1: ['#section[Monômes]', 'Un texte libre'],
        },
      },
    )
    expect(code).toContain('#let ex1-colonnes = 2')
    expect(code).toContain('#let ex1-gutter = 1.5em')
    expect(code).toContain('  #section[Monômes] // mathalea:insertion')
    expect(code).toContain('  Un texte libre // mathalea:insertion')
    // l'insertion « avant le premier exercice » précède l'exercice 1
    expect(code.indexOf('Consignes générales.')).toBeLessThan(
      code.indexOf('#ex1()'),
    )
    // les insertions suivent le repère de gap de leur exercice
    expect(code.indexOf('#mathalea-anchor("gap", 1)')).toBeLessThan(
      code.indexOf('#section[Monômes]'),
    )
  })

  it('reprend le réglage de numérotation par exercice (carry-over) à la régénération', () => {
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$', '$2+2$'], numbered: true })],
      defaultTypstDocumentOptions,
      { tasksLayout: { ex1: { numbering: '"a)"' } } },
    )
    expect(code).toContain('#let ex1-numerotation = "a)"')
    // le style est réglable par exercice, mais le gras (par défaut ici) reste
    // un réglage global : la valeur de la variable n'est connue qu'à la
    // compilation Typst (elle peut valoir `none`), d'où la garde if/else
    // plutôt qu'une résolution en JS comme en mode export.
    expect(code).toContain(
      'label: if ex1-numerotation == none { none } else { (..n) => strong(numbering(ex1-numerotation, ..n)) }',
    )
  })

  it('harvestCarryOver relit la numérotation réglée par exercice', () => {
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$', '$2+2$'], numbered: true })],
      defaultTypstDocumentOptions,
      { tasksLayout: { ex1: { numbering: 'none' } } },
    )
    expect(harvestCarryOver(code).tasksLayout).toEqual({
      ex1: { numbering: 'none' },
    })
  })

  it('harvestCarryOver relit colonnes, espacement et insertions du code', () => {
    const code = buildTypstDocument(
      [
        exercise({
          questions: ['$1+1$', '$2+2$'],
          corrections: ['$2$', '$4$'],
          numbered: true,
        }),
        exercise({ questions: ['$3+3$', '$4+4$'], numbered: true, ref: '' }),
      ],
      defaultTypstDocumentOptions,
      {
        tasksLayout: { ex2: { columns: '3' }, 'ex1-corr': { gutter: '0.5em' } },
        insertions: { 0: ['Consignes générales.'], 1: ['#section[Monômes]'] },
      },
    )
    const harvested = harvestCarryOver(code)
    // les valeurs par défaut (1 colonne, interligne-questions) ne sont pas
    // reprises ; la correction (ex1-corr) est indépendante de l'énoncé
    expect(harvested.tasksLayout).toEqual({
      ex2: { columns: '3' },
      'ex1-corr': { gutter: '0.5em' },
    })
    expect(harvested.insertions).toEqual({
      0: ['Consignes générales.'],
      1: ['#section[Monômes]'],
    })
  })

  it('stabilise les insertions quand plusieurs sujets sont générés', () => {
    const exercises = [
      exercise({ questions: ['$1+1$'], corrections: ['$2$'] }),
      exercise({ questions: ['$2+2$'], corrections: ['$4$'] }),
    ]
    const options = { ...defaultTypstDocumentOptions, columns: 2 }
    const carryOver = {
      insertions: { 1: [PAGE_BREAK_SNIPPET] },
      insertionsCorrection: { 1: ['#section[Correction intermédiaire]'] },
    }
    const build = (
      carry: NonNullable<Parameters<typeof buildTypstDocument>[2]>,
    ) => buildTypstDocument(exercises, options, carry, [exercises])

    const firstCode = build(carryOver)
    const firstHarvest = harvestCarryOver(firstCode)

    // Chaque sujet porte ses marqueurs, relus séparément à la régénération.
    expect(firstCode.split(PAGE_BREAK_SNIPPET)).toHaveLength(3)
    expect(firstCode.match(/\/\/ mathalea:insertion$/gm) ?? []).toHaveLength(2)
    expect(
      firstCode.match(/\/\/ mathalea:insertion-corr$/gm) ?? [],
    ).toHaveLength(2)
    expect(firstHarvest.insertions).toEqual(carryOver.insertions)
    expect(firstHarvest.insertionsCorrection).toEqual(
      carryOver.insertionsCorrection,
    )

    const secondHarvest = harvestCarryOver(build(firstHarvest))
    expect(secondHarvest.insertions).toEqual(firstHarvest.insertions)
    expect(secondHarvest.insertionsCorrection).toEqual(
      firstHarvest.insertionsCorrection,
    )
  })

  it('nettoie les sauts structurels dupliqués sans dédupliquer les textes', () => {
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$'] }), exercise({ questions: ['$2+2$'] })],
      { ...defaultTypstDocumentOptions, columns: 2 },
      {
        insertions: {
          1: [
            PAGE_BREAK_SNIPPET,
            PAGE_BREAK_SNIPPET,
            COLUMN_BREAK_SNIPPET,
            COLUMN_BREAK_SNIPPET,
            'Même texte.',
            'Même texte.',
          ],
          2: Array(31).fill(PAGE_BREAK_SNIPPET),
        },
      },
    )

    expect(harvestCarryOver(code).insertions).toEqual({
      1: [
        PAGE_BREAK_SNIPPET,
        COLUMN_BREAK_SNIPPET,
        'Même texte.',
        'Même texte.',
      ],
    })
  })

  it('conserve un saut de colonne avant une correction', () => {
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$'], corrections: ['$2$'] })],
      { ...defaultTypstDocumentOptions, columns: 2 },
      {
        insertionsCorrection: {
          1: [COLUMN_BREAK_SNIPPET, COLUMN_BREAK_SNIPPET],
        },
      },
    )
    expect(harvestCarryOver(code).insertionsCorrection).toEqual({
      1: [COLUMN_BREAK_SNIPPET],
    })
  })

  it('affiche la référence (show-id) des exercices seulement si demandé', () => {
    const withRef = buildTypstDocument(
      [exercise({ ref: '6e23-1', questions: ['$1+1$'] })],
      { ...defaultTypstDocumentOptions, showExerciseRefs: true },
    )
    expect(withRef).toContain('id: "6e23-1",')
    expect(withRef).toContain('show-id: true,')

    // masquée par défaut
    const withoutRef = buildTypstDocument([
      exercise({ ref: '6e23-1', questions: ['$1+1$'] }),
    ])
    expect(withoutRef).toContain('show-id: false,')
  })

  it('ajoute un QR-code vers chaque exercice quand demandé', () => {
    const url = 'https://coopmaths.fr/alea?uuid=abc&alea=xyz&v=eleve&es=0211'
    const withQr = buildTypstDocument(
      [exercise({ url, questions: ['$1+1$'] })],
      { ...defaultTypstDocumentOptions, showQrCode: true },
    )
    // depuis exercise-bank 0.6.0, le QR-code est un paramètre de exo.with(...)
    // (le paquet le place lui-même, plus besoin de tiaoma) ; il est fourni en
    // image SVG pré-rendue (fond blanc explicite) plutôt qu'en URL brute, car
    // tiaoma (utilisé en interne par exercise-bank pour une URL) ignore toute
    // option de fond et produit un QR-code transparent
    // enveloppé dans un link(...) : le QR-code du PDF est cliquable
    expect(withQr).toContain(`  qr: link("${url}")[#image(bytes(`)
    expect(withQr).toContain('format: "svg", width: 100%)],')
    expect(withQr).toContain('#ffffff')
    expect(withQr).not.toContain(`  qr: "${url}",`)
    expect(withQr).toContain(`  qr-size: 1.8cm,`)
    expect(withQr).not.toContain('tiaoma')
    expect(withQr).not.toContain('#place(')

    // absent par défaut
    const withoutQr = buildTypstDocument([
      exercise({ url, questions: ['$1+1$'] }),
    ])
    expect(withoutQr).not.toContain('qr:')
    expect(withoutQr).not.toContain('qr-size')

    // en mode fusionné, il n'y a pas de bloc par exercice : pas de QR-code
    const merged = buildTypstDocument(
      [exercise({ url, questions: ['$1+1$'] })],
      {
        ...defaultTypstDocumentOptions,
        showQrCode: true,
        mergeExercises: true,
      },
    )
    expect(merged).not.toContain('qr:')
  })

  it('ajoute un QR-code vers la fiche entière en vue élève quand demandé', () => {
    const url1 = 'https://coopmaths.fr/alea?uuid=abc&alea=xyz&v=eleve&es=0211'
    const url2 = 'https://coopmaths.fr/alea?uuid=def&alea=uvw&v=eleve&es=0211'
    const withQr = buildTypstDocument(
      [
        exercise({ url: url1, questions: ['$1+1$'] }),
        exercise({ url: url2, questions: ['$2+2$'] }),
      ],
      { ...defaultTypstDocumentOptions, showQrCodeFiche: true },
    )
    // `exo-corner` (exercise-bank) le place à droite du bloc de titre, que
    // le bloc de titre et les exercices évitent (`exo-corner-fit`)
    expect(withQr).toContain('#exo-corner(box(width: 2cm)[')
    expect(withQr.indexOf('#exo-corner(')).toBeLessThan(
      withQr.indexOf('#exo-corner-fit['),
    )
    expect(withQr).toContain('#import "@preview/tiaoma:0.3.0": qrcode')
    // L'URL reste une variable Typst lisible et modifiable dans le source,
    // puis tiaoma génère le QR-code pendant la compilation.
    expect(withQr).toContain('#let qr-code-global-url = "')
    expect(withQr).toContain(
      '#link(qr-code-global-url)[#qrcode(qr-code-global-url, width: 100%)]',
    )
    expect(withQr).toContain('#mathalea-anchor("qr-code", 0)')
    // les deux exercices sont regroupés dans une seule URL, avec les mêmes
    // graines que celles imprimées, un exercice par page (1), non interactif
    // (0) mais modifiable par l'élève (1)
    const qrUrlMatch = withQr.match(/#let qr-code-global-url = "([^"]+)"/)
    expect(qrUrlMatch).not.toBeNull()
    const qrUrl = new URL(qrUrlMatch![1])
    expect(qrUrl.searchParams.getAll('uuid')).toEqual(['abc', 'def'])
    expect(qrUrl.searchParams.getAll('alea')).toEqual(['xyz', 'uvw'])
    expect(qrUrl.searchParams.get('v')).toBe('eleve')
    expect(qrUrl.searchParams.get('es')).toBe('1011')

    // absent par défaut
    const withoutQr = buildTypstDocument([
      exercise({ url: url1, questions: ['$1+1$'] }),
    ])
    expect(withoutQr).not.toContain('#exo-corner(')

    // aucun exercice imprimable n'a d'URL : pas de QR-code de fiche
    const noUrl = buildTypstDocument([exercise({ questions: ['$1+1$'] })], {
      ...defaultTypstDocumentOptions,
      showQrCodeFiche: true,
    })
    expect(noUrl).not.toContain('#exo-corner(')
  })

  it('ajoute et repère un QR-code propre à chaque sujet', () => {
    const sujetA = [
      exercise({
        url: 'https://coopmaths.fr/alea?uuid=a&alea=graines-a&v=eleve&es=0211',
        questions: ['$1+1$'],
      }),
    ]
    const sujetB = [
      exercise({
        url: 'https://coopmaths.fr/alea?uuid=b&alea=graines-b&v=eleve&es=0211',
        questions: ['$2+2$'],
      }),
    ]
    const code = buildTypstDocument(
      sujetA,
      { ...defaultTypstDocumentOptions, showQrCodeFiche: true },
      {},
      [sujetB],
    )

    expect(code).toContain('#let qr-code-global-url = "')
    expect(code).toContain('#let qr-code-global-url-1 = "')
    expect(code).toContain('#mathalea-anchor("qr-code", 0)')
    expect(code).toContain('#mathalea-anchor("qr-code", 1)')
    expect(code).toContain(
      '#link(qr-code-global-url)[#qrcode(qr-code-global-url, width: 100%)]',
    )
    expect(code).toContain(
      '#link(qr-code-global-url-1)[#qrcode(qr-code-global-url-1, width: 100%)]',
    )

    const urls = [
      ...code.matchAll(/#let qr-code-global-url(?:-(\d+))? = "([^"]+)"/g),
    ].map((match) => new URL(match[2]))
    expect(urls).toHaveLength(2)
    expect(urls[0].searchParams.get('uuid')).toBe('a')
    expect(urls[1].searchParams.get('uuid')).toBe('b')
  })

  it('active breather (espaces verticaux automatiques) par défaut', () => {
    const code = buildTypstDocument([exercise({ questions: ['$1+1$'] })])
    expect(code).toContain(`#import "${typstPackageSpec('breather')}": breathe`)
    expect(code).toContain('#show: breathe')

    const without = buildTypstDocument([exercise({ questions: ['$1+1$'] })], {
      ...defaultTypstDocumentOptions,
      autoVerticalSpacing: false,
    })
    expect(without).not.toContain('breather')
    expect(without).not.toContain('#show: breathe')
  })

  describe('lignes en pointillés (writingLines, réglage par exercice)', () => {
    it("n'ajoute rien par défaut", () => {
      const code = buildTypstDocument([
        exercise({ questions: ['$1+1$', '$2+2$'], numbered: true }),
      ])
      expect(code).not.toContain('mathalea-lignes')
    })

    it('ajoute le bloc de lignes après cet exercice (endOfExercise)', () => {
      const code = buildTypstDocument(
        [exercise({ questions: ['$1+1$', '$2+2$'], numbered: true })],
        defaultTypstDocumentOptions,
        {
          writingLines: {
            1: {
              position: 'endOfExercise',
              count: 4,
              spacing: 1.5,
              style: 'pointilles',
            },
          },
        },
      )
      expect(code).toContain(
        '#let mathalea-lignes(n, gutter: 2em, style: "pointilles")',
      )
      expect(code).toContain(
        '#mathalea-lignes(4, gutter: 1.5em, style: "pointilles") // mathalea:lignes-fin(1)',
      )
      // une seule occurrence : le bloc suit l'environnement tasks, pas chaque question
      expect(code.match(/#mathalea-lignes\(/g)).toHaveLength(1)
    })

    it('reporte les lignes du sujet A sur les autres sujets', () => {
      const setting = {
        position: 'endOfExercise' as const,
        count: 7,
        spacing: 2,
        style: 'pointilles' as const,
      }
      const input = [exercise({ questions: ['$1+1$'], numbered: true })]
      const code = buildTypstDocument(
        input,
        defaultTypstDocumentOptions,
        { writingLines: { 1: setting }, versions: { 1: { writingLines: {} } } },
        [input],
      )
      expect(code.match(/#mathalea-lignes\(7,/g)).toHaveLength(2)
      expect(harvestCarryOver(code).versions?.[1]?.writingLines).toEqual({
        1: setting,
      })
    })

    it("émet l'appel sans rendu visuel quand le compteur est à 0 (valeur de départ de la palette)", () => {
      const code = buildTypstDocument(
        [exercise({ questions: ['$1+1$', '$2+2$'], numbered: true })],
        defaultTypstDocumentOptions,
        {
          writingLines: {
            1: {
              position: 'endOfExercise',
              count: 0,
              spacing: 2,
              style: 'pointilles',
            },
          },
        },
      )
      // le marqueur est émis (position retenue par la palette au round-trip)
      // mais le helper n'affiche rien tant que n vaut 0
      expect(code).toContain(
        '#mathalea-lignes(0, gutter: 2em, style: "pointilles") // mathalea:lignes-fin(1)',
      )
      expect(code).toContain('if n > 0 { block(')
      expect(harvestCarryOver(code).writingLines).toEqual({
        1: {
          position: 'endOfExercise',
          count: 0,
          spacing: 2,
          style: 'pointilles',
        },
      })
    })

    it('ajoute le bloc de lignes après chaque question (afterEachQuestion), y compris la dernière', () => {
      const code = buildTypstDocument(
        [
          exercise({
            questions: ['$1+1$', '$2+2$', '$3+3$'],
            numbered: true,
          }),
        ],
        defaultTypstDocumentOptions,
        {
          writingLines: {
            1: {
              position: 'afterEachQuestion',
              count: 2,
              spacing: 0.8,
              style: 'pointilles',
            },
          },
        },
      )
      // 3 questions -> 3 blocs de lignes, y compris après la 3e
      expect(
        code.match(
          /#mathalea-lignes\(2, gutter: 0\.8em, style: "pointilles"\) \/\/ mathalea:lignes-apres\(1\)/g,
        ),
      ).toHaveLength(3)
      const lastLinesIndex = code.lastIndexOf('#mathalea-lignes(')
      const lastQuestionIndex = code.lastIndexOf('$3 + 3$')
      expect(lastLinesIndex).toBeGreaterThan(lastQuestionIndex)
    })

    it("n'ajoute pas de lignes dans la correction", () => {
      const code = buildTypstDocument(
        [
          exercise({
            questions: ['$1+1$', '$2+2$'],
            corrections: ['$1+1=2$', '$2+2=4$'],
            numbered: true,
          }),
        ],
        defaultTypstDocumentOptions,
        {
          writingLines: {
            1: {
              position: 'endOfExercise',
              count: 3,
              spacing: 1,
              style: 'pointilles',
            },
          },
        },
      )
      const correctionSection = code.slice(code.indexOf('solution: ['))
      expect(correctionSection).not.toContain('mathalea-lignes(')
    })

    it("pose les lignes en fin de corps quand l'exercice n'a pas de liste où les intercaler", () => {
      // question unique : pas d'environnement `tasks`, mais le réglage (souvent
      // celui du document, donc valable pour toute la fiche) doit tout de même
      // donner de la place pour répondre
      const code = buildTypstDocument(
        [exercise({ questions: ['$1+1$'] })],
        defaultTypstDocumentOptions,
        {
          writingLines: {
            1: {
              position: 'afterEachQuestion',
              count: 3,
              spacing: 1,
              style: 'pointilles',
            },
          },
        },
      )
      expect(
        code.match(/#mathalea-lignes\(3, gutter: 1em, style: "pointilles"\)/g),
      ).toHaveLength(1)
      // l'emplacement choisi est conservé tel quel pour la palette
      expect(harvestCarryOver(code).writingLines?.[1]?.position).toBe(
        'afterEachQuestion',
      )
    })

    it('déclare la liste à une colonne quand les lignes suivent chaque question', () => {
      // réparties sur plusieurs colonnes, les lignes deviendraient des
      // tronçons de un ou deux centimètres
      const code = buildTypstDocument(
        [exercise({ questions: ['$1+1$', '$2+2$', '$3+3$'], numbered: true })],
        defaultTypstDocumentOptions,
        {
          writingLines: {
            1: {
              position: 'afterEachQuestion',
              count: 2,
              spacing: 2,
              style: 'pointilles',
            },
          },
        },
      )
      expect(code).toContain('#let ex1-colonnes = 1')
      // ce défaut n'est pas un choix du professeur : il ne doit pas être figé
      // dans le carry-over, sinon la liste resterait à une colonne après le
      // retrait des lignes
      expect(harvestCarryOver(code).tasksLayout?.ex1?.columns).toBeUndefined()
    })

    it('respecte le nombre de colonnes choisi dans la palette malgré les lignes', () => {
      const code = buildTypstDocument(
        [exercise({ questions: ['$1+1$', '$2+2$', '$3+3$'], numbered: true })],
        defaultTypstDocumentOptions,
        {
          tasksLayout: { ex1: { columns: '2' } },
          writingLines: {
            1: {
              position: 'afterEachQuestion',
              count: 2,
              spacing: 2,
              style: 'pointilles',
            },
          },
        },
      )
      expect(code).toContain('#let ex1-colonnes = 2')
      expect(harvestCarryOver(code).tasksLayout?.ex1?.columns).toBe('2')
    })

    it('règle chaque exercice indépendamment', () => {
      const code = buildTypstDocument(
        [
          exercise({ questions: ['$1+1$', '$2+2$'], numbered: true }),
          exercise({ questions: ['$3+3$', '$4+4$'], numbered: true }),
        ],
        defaultTypstDocumentOptions,
        {
          writingLines: {
            2: {
              position: 'endOfExercise',
              count: 5,
              spacing: 2,
              style: 'pointilles',
            },
          },
        },
      )
      expect(
        code.match(
          /#mathalea-lignes\(5, gutter: 2em, style: "pointilles"\) \/\/ mathalea:lignes-fin\(2\)/g,
        ),
      ).toHaveLength(1)
      expect(code).not.toContain('mathalea:lignes-fin(1)')
    })

    it('émet le style « points » choisi dans la palette (round-trip)', () => {
      const code = buildTypstDocument(
        [exercise({ questions: ['$1+1$', '$2+2$'], numbered: true })],
        defaultTypstDocumentOptions,
        {
          writingLines: {
            1: {
              position: 'afterEachQuestion',
              count: 2,
              spacing: 1,
              style: 'points',
            },
          },
        },
      )
      expect(code).toContain(
        '#mathalea-lignes(2, gutter: 1em, style: "points") // mathalea:lignes-apres(1)',
      )
      // le helper porte les trois traits, le choix se fait à l'appel
      expect(code).toContain(
        'if style == "points" { box(width: 100%, text(fill: luma(120), repeat(gap: 2pt)[.])) }',
      )
      expect(harvestCarryOver(code).writingLines).toEqual({
        1: {
          position: 'afterEachQuestion',
          count: 2,
          spacing: 1,
          style: 'points',
        },
      })
    })

    it('émet le style « plein » (filet continu)', () => {
      const code = buildTypstDocument(
        [exercise({ questions: ['$1+1$', '$2+2$'], numbered: true })],
        defaultTypstDocumentOptions,
        {
          writingLines: {
            1: {
              position: 'endOfExercise',
              count: 2,
              spacing: 2,
              style: 'plein',
            },
          },
        },
      )
      expect(code).toContain(
        '#mathalea-lignes(2, gutter: 2em, style: "plein") // mathalea:lignes-fin(1)',
      )
      expect(code).toContain('if style == "plein" { none } else { "dotted" }')
    })

    it('émet et relit le style « vide » sans dessiner de trait', () => {
      const setting = {
        position: 'endOfExercise' as const,
        count: 3,
        spacing: 1.5,
        style: 'vide' as const,
      }
      const code = buildTypstDocument(
        [exercise({ questions: ['$1+1$'] })],
        defaultTypstDocumentOptions,
        { writingLines: { 1: setting } },
      )
      expect(code).toContain(
        '#mathalea-lignes(3, gutter: 1.5em, style: "vide") // mathalea:lignes-fin(1)',
      )
      expect(code).toContain(
        'if style == "vide" { box(width: 100%, height: 0.6pt) }',
      )
      expect(harvestCarryOver(code).writingLines).toEqual({ 1: setting })
    })

    it('relit un appel sans style (code émis avant le réglage) comme un filet pointillé', () => {
      const code = [
        '#mathalea-lignes(3, gutter: 1.5em) // mathalea:lignes-fin(1)',
      ].join('\n')
      expect(harvestCarryOver(code).writingLines).toEqual({
        1: {
          position: 'endOfExercise',
          count: 3,
          spacing: 1.5,
          style: 'pointilles',
        },
      })
    })

    it('harvestCarryOver relit les réglages par exercice (round-trip)', () => {
      const code = buildTypstDocument(
        [
          exercise({ questions: ['$1+1$', '$2+2$'], numbered: true }),
          exercise({ questions: ['$3+3$', '$4+4$', '$5+5$'], numbered: true }),
        ],
        defaultTypstDocumentOptions,
        {
          writingLines: {
            1: {
              position: 'endOfExercise',
              count: 4,
              spacing: 1.5,
              style: 'pointilles',
            },
            2: {
              position: 'afterEachQuestion',
              count: 2,
              spacing: 0.8,
              style: 'pointilles',
            },
          },
        },
      )
      const harvested = harvestCarryOver(code)
      expect(harvested.writingLines).toEqual({
        1: {
          position: 'endOfExercise',
          count: 4,
          spacing: 1.5,
          style: 'pointilles',
        },
        2: {
          position: 'afterEachQuestion',
          count: 2,
          spacing: 0.8,
          style: 'pointilles',
        },
      })
    })

    it("reste posé après une surcharge de code de l'exercice (régression : la surcharge remplace tout l'énoncé, dont l'appel de lignes)", () => {
      const code = buildTypstDocument(
        [exercise({ questions: ['$1+1$', '$2+2$'], numbered: true })],
        defaultTypstDocumentOptions,
        {
          writingLines: {
            1: {
              position: 'endOfExercise',
              count: 4,
              spacing: 1.5,
              style: 'pointilles',
            },
          },
          codeOverrides: { 1: '#text[Contenu personnalisé]' },
        },
      )
      expect(code).toContain('#text[Contenu personnalisé]')
      expect(code).toContain(
        '#mathalea-lignes(4, gutter: 1.5em, style: "pointilles") // mathalea:lignes-fin(1)',
      )
      // le marqueur suit la surcharge (hors de ses repères mathalea:override) :
      // un nouveau round-trip retrouve le réglage sans le confondre avec le
      // texte de la surcharge
      expect(harvestCarryOver(code).writingLines).toEqual({
        1: {
          position: 'endOfExercise',
          count: 4,
          spacing: 1.5,
          style: 'pointilles',
        },
      })
      expect(harvestCarryOver(code).codeOverrides).toEqual({
        1: '#text[Contenu personnalisé]',
      })
    })

    it("« après chaque question » retombe en fin d'exercice sur une surcharge de code (pas de questions où l'intercaler)", () => {
      const code = buildTypstDocument(
        [
          exercise({
            questions: ['$1+1$', '$2+2$', '$3+3$'],
            numbered: true,
          }),
        ],
        defaultTypstDocumentOptions,
        {
          writingLines: {
            1: {
              position: 'afterEachQuestion',
              count: 2,
              spacing: 0.8,
              style: 'pointilles',
            },
          },
          codeOverrides: { 1: '#text[Contenu personnalisé]' },
        },
      )
      expect(code.match(/#mathalea-lignes\(/g)).toHaveLength(1)
      expect(code).toContain(
        '#mathalea-lignes(2, gutter: 0.8em, style: "pointilles") // mathalea:lignes-apres(1)',
      )
    })
  })

  describe('fusion locale (bouton de la palette)', () => {
    it("fusionne l'exercice 2 avec le précédent : un seul exo.with, numérotation continue", () => {
      const code = buildTypstDocument(
        [
          exercise({ questions: ['$1+1$', '$2+2$'], numbered: true }),
          exercise({
            questions: ['$3+3$', '$4+4$'],
            numbered: true,
            ref: '6e23-2',
          }),
        ],
        defaultTypstDocumentOptions,
        { merges: [2] },
      )
      // un seul #let ex1 = exo.with(...), pas de ex2
      expect(code).toContain('#let ex1 = exo.with(')
      expect(code).not.toContain('#let ex2 = exo.with(')
      expect(code).toContain('#ex1()')
      expect(code).not.toContain('#ex2()')
      // marqueurs de section pour les deux exercices dans le même groupe
      expect(code).toContain('// ----- Exercice 1 -----')
      expect(code).toContain(
        '// ----- Exercice 2 (fusionné avec le précédent) -----',
      )
      // numérotation continue : questions 1-2 puis 3-4
      expect(code).toContain('start: 1)')
      expect(code).toContain('start: 3)')
      // pas de référence affichée pour le groupe fusionné
      expect(code).not.toContain('id: "6e23-2"')
      // repère "exo" du membre fusionné, à l'intérieur du contenu
      expect(code).toContain('#mathalea-anchor("exo", 2)')
      // le repère de gap du groupe reste au niveau du document, après ex1()
      expect(code).toContain('#ex1()\n  #mathalea-anchor("gap", 2)')
    })

    it('numérote deux exercices à question unique une fois fusionnés', () => {
      const code = buildTypstDocument(
        [
          exercise({ questions: ['$1+1$'], numbered: true }),
          exercise({ questions: ['$2+2$'], numbered: true }),
        ],
        defaultTypstDocumentOptions,
        { merges: [2] },
      )
      // sans fusion, un exercice à question unique n'est jamais dans un
      // environnement tasks ; fusionné, il doit y participer pour être
      // numéroté à la suite du groupe
      expect(code).toContain('#tasks(')
      expect(code).toContain('start: 1)')
      expect(code).toContain('start: 2)')
    })

    it('ne numérote pas une question unique restée seule dans son exercice', () => {
      const code = buildTypstDocument([
        exercise({ questions: ['$1+1$'], numbered: true }),
        exercise({ questions: ['$2+2$', '$3+3$'], numbered: true }),
      ])
      expect(code).not.toContain('#let ex1-colonnes')
    })

    it("numérote une question unique fusionnée avec l'option globale mergeExercises", () => {
      const code = buildTypstDocument(
        [
          exercise({ questions: ['$1+1$'], numbered: true }),
          exercise({ questions: ['$2+2$'], numbered: true }),
        ],
        { ...defaultTypstDocumentOptions, mergeExercises: true },
      )
      expect(code).toContain('start: 1)')
      expect(code).toContain('start: 2)')
    })

    it('numérote aussi les questions habituellement non numérotées en mode fusionné', () => {
      const code = buildTypstDocument(
        [
          exercise({ questions: ['$1+1$'], numbered: true }),
          // Certains exercices utilisent des repères dans leur propre énoncé
          // et demandent normalement `label: none`. En fusion, leur position
          // est néanmoins comptée : ils doivent donc afficher le numéro suivant.
          exercise({ questions: ['$A=2+2$'], numbered: false }),
          exercise({ questions: ['$3+3$'], numbered: true }),
        ],
        { ...defaultTypstDocumentOptions, mergeExercises: true },
      )
      const enonces = code.slice(code.indexOf('// ----- Énoncés -----'))
      expect(enonces).toContain('start: 1)')
      expect(enonces).toContain('start: 2)')
      expect(enonces).toContain('start: 3)')
      expect(enonces).not.toContain('label: none')
    })

    it('reprend la fusion locale au round-trip (harvestCarryOver)', () => {
      const code = buildTypstDocument(
        [
          exercise({ questions: ['$1+1$', '$2+2$'], numbered: true }),
          exercise({ questions: ['$3+3$', '$4+4$'], numbered: true }),
        ],
        defaultTypstDocumentOptions,
        { merges: [2] },
      )
      expect(harvestCarryOver(code).merges).toEqual([2])
    })

    it('met deux groupes voisins en colonnes et relit le réglage', () => {
      const code = buildTypstDocument(
        [
          exercise({ questions: ['$1+1$'], numbered: true }),
          exercise({ questions: ['$2+2$'], numbered: true }),
          exercise({ questions: ['$3+3$'], numbered: true }),
        ],
        defaultTypstDocumentOptions,
        { multicolGroups: [1] },
      )
      const enonces = code.slice(code.indexOf('// ----- Énoncés -----'))
      expect(enonces).toContain('// mathalea:multicol(1)\n  #grid(')
      expect(enonces).toContain(
        '      #ex1()\n    ],\n    [\n      #mathalea-anchor("exo", 2)\n      #ex2()',
      )
      expect(enonces).toContain('#mathalea-anchor("gap", 2)')
      expect(enonces).toContain('#ex3()')
      expect(harvestCarryOver(code).multicolGroups).toEqual([1])
    })

    it('ignore la mise en colonnes locale si la fiche a plusieurs colonnes', () => {
      const code = buildTypstDocument(
        [
          exercise({ questions: ['$1+1$'], numbered: true }),
          exercise({ questions: ['$2+2$'], numbered: true }),
        ],
        { ...defaultTypstDocumentOptions, columns: 2 },
        { multicolGroups: [1] },
      )
      const enonces = code.slice(code.indexOf('// ----- Énoncés -----'))
      expect(enonces).not.toContain('mathalea:multicol(')
      expect(enonces).toContain('#ex1()')
      expect(enonces).toContain('#ex2()')
    })

    it("l'option globale mergeExercises prime sur la fusion locale", () => {
      const code = buildTypstDocument(
        [
          exercise({ questions: ['$1+1$', '$2+2$'], numbered: true }),
          exercise({ questions: ['$3+3$', '$4+4$'], numbered: true }),
        ],
        { ...defaultTypstDocumentOptions, mergeExercises: true },
        { merges: [2] },
      )
      expect(code).not.toContain('exo.with(')
      expect(code).not.toContain('fusionné avec le précédent')
    })

    it('fusionne trois exercices à la suite (groupe de 3)', () => {
      const code = buildTypstDocument(
        [
          exercise({ questions: ['$1$', '$2$'], numbered: true }),
          exercise({ questions: ['$3$', '$4$'], numbered: true }),
          exercise({ questions: ['$5$', '$6$'], numbered: true }),
        ],
        defaultTypstDocumentOptions,
        { merges: [2, 3] },
      )
      expect(code).toContain('#let ex1 = exo.with(')
      expect(code).not.toContain('#let ex2 = exo.with(')
      expect(code).not.toContain('#let ex3 = exo.with(')
      expect(code).toContain('#ex1()')
      // un seul appel au groupe, un seul repère de gap final (num 3)
      expect(code).toContain('#ex1()\n  #mathalea-anchor("gap", 3)')
      expect(code).toContain('start: 1)')
      expect(code).toContain('start: 3)')
      expect(code).toContain('start: 5)')
    })

    it('sans corrections dans le groupe : pas de champ solution', () => {
      const code = buildTypstDocument(
        [
          exercise({ questions: ['$1+1$', '$2+2$'], numbered: true }),
          exercise({ questions: ['$3+3$'], numbered: true }),
        ],
        defaultTypstDocumentOptions,
        { merges: [2] },
      )
      expect(code).not.toContain('solution: [')
    })

    it.skipIf(!shouldRunTypstCliTests())(
      'compile avec typst : groupe fusionné valide',
      async () => {
        const code = buildTypstDocument(
          [
            exercise({
              questions: ['$1+1$', '$2+2$'],
              corrections: ['$2$', '$4$'],
              numbered: true,
            }),
            exercise({
              questions: ['$3+3$', '$4+4$'],
              corrections: ['$6$', '$8$'],
              numbered: true,
            }),
          ],
          defaultTypstDocumentOptions,
          { merges: [2] },
        )
        const { execFileSync } = await import('node:child_process')
        const { writeFileSync, mkdtempSync } = await import('node:fs')
        const { tmpdir } = await import('node:os')
        const { join } = await import('node:path')
        const dir = mkdtempSync(join(tmpdir(), 'typst-merge-'))
        const file = join(dir, 'doc.typ')
        writeFileSync(file, code, 'utf-8')
        expect(() =>
          execFileSync('typst', ['compile', file, join(dir, 'doc.pdf')], {
            stdio: 'pipe',
          }),
        ).not.toThrow()
      },
    )
  })
})

describe('en-tête et pied de page', () => {
  it('« aucun » n’émet aucun bloc de titre mais garde le pied de page', () => {
    const code = buildTypstDocument([exercise({ questions: ['$1+1$'] })], {
      ...defaultTypstDocumentOptions,
      headerStyle: 'aucun',
    })
    // `titre` reste déclarée : le pied de page la référence toujours
    expect(code).toContain(`#let titre = "Fiche d'exercices"`)
    // mais aucun des trois blocs de titre (épuré/cartouche/cadre) n'est émis
    expect(code).not.toContain('#block(width: 100%, inset: (y: 4pt))[')
    expect(code).not.toContain('#block(width: 100%, fill: couleur')
    expect(code).not.toContain(
      'stroke: (top: 1pt + couleur, bottom: 1pt + couleur)',
    )
    expect(code).toContain('footer: context [')
    // sans bloc de titre affiché, rien à éditer depuis l'aperçu à cet endroit
    expect(code).not.toContain('#mathalea-anchor("header"')
  })

  it('émet le repère d’édition du titre seulement si un bloc de titre est affiché', () => {
    const shown = buildTypstDocument([exercise({ questions: ['$1+1$'] })], {
      ...defaultTypstDocumentOptions,
      headerStyle: 'epure',
    })
    expect(shown).toContain('#mathalea-anchor("header", 0)')
    const hidden = buildTypstDocument([exercise({ questions: ['$1+1$'] })], {
      ...defaultTypstDocumentOptions,
      headerStyle: 'aucun',
    })
    expect(hidden).not.toContain('#mathalea-anchor("header"')
  })

  it('n’émet pas le repère d’édition du pied de page en mode export', () => {
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$'] })],
      defaultTypstDocumentOptions,
      {},
      [],
      { exportMode: true },
    )
    expect(code).toContain('footer: context [')
    expect(code).not.toContain('#mathalea-anchor("footer"')
  })

  it('limite le repère d’édition du pied de page à la première page physique', () => {
    const code = buildTypstDocument([exercise({ questions: ['$1+1$'] })], {
      ...defaultTypstDocumentOptions,
      showFooter: true,
    })
    expect(code).toContain(
      '#if here().page() == 1 [#mathalea-anchor("footer", 0)]',
    )
    // pas `counter(page)`, qui repart de 1 à chaque nouveau sujet
    expect(code).not.toContain('counter(page).get()')
  })

  it('masque le pied de page quand il est décoché', () => {
    const code = buildTypstDocument([exercise({ questions: ['$1+1$'] })], {
      ...defaultTypstDocumentOptions,
      showFooter: false,
    })
    expect(code).toContain('footer: none,')
    expect(code).not.toContain('footer: context [')
  })

  it('reprend le texte personnalisé du pied de page', () => {
    const code = buildTypstDocument([exercise({ questions: ['$1+1$'] })], {
      ...defaultTypstDocumentOptions,
      footerText: 'Lycée Test — 2026',
    })
    expect(code).toContain('#let pied-page = "Lycée Test — 2026"')
    expect(code).toContain('align(left)[#pied-page]')
  })

  it.runIf(shouldRunTypstCliTests())(
    'compile avec typst (en-tête « aucun », pied de page masqué)',
    async () => {
      const code = buildTypstDocument(
        [
          exercise({
            questions: ['$1+1$'],
            corrections: ['$2$'],
            numbered: true,
          }),
        ],
        {
          ...defaultTypstDocumentOptions,
          headerStyle: 'aucun',
          showFooter: false,
        },
      )
      const { execFileSync } = await import('node:child_process')
      const { writeFileSync, mkdtempSync } = await import('node:fs')
      const { tmpdir } = await import('node:os')
      const { join } = await import('node:path')
      const dir = mkdtempSync(join(tmpdir(), 'typst-no-header-footer-'))
      const file = join(dir, 'doc.typ')
      writeFileSync(file, code, 'utf-8')
      expect(() =>
        execFileSync('typst', ['compile', file, join(dir, 'doc.pdf')], {
          stdio: 'pipe',
        }),
      ).not.toThrow()
    },
  )

  it.runIf(shouldRunTypstCliTests())(
    'compile avec typst (page de garde, pied de page visible avec son repère)',
    async () => {
      const code = buildTypstDocument(
        [
          exercise({
            questions: ['$1+1$'],
            corrections: ['$2$'],
            numbered: true,
          }),
        ],
        {
          ...defaultTypstDocumentOptions,
          headerStyle: 'aucun',
          showFooter: true,
          coverPage: {
            ...defaultTypstDocumentOptions.coverPage,
            template: 'brevet',
            titre: 'Brevet des collèges',
            session: 'Juin 2026',
            matiere: 'MATHÉMATIQUES',
            duree: '2 heures',
            consignes: ['L’usage de la calculatrice est autorisé.'],
            noteFin: 'Tournez la page S.V.P.',
            bareme: [20],
          },
        },
      )
      const { execFileSync } = await import('node:child_process')
      const { writeFileSync, mkdtempSync } = await import('node:fs')
      const { tmpdir } = await import('node:os')
      const { join } = await import('node:path')
      const dir = mkdtempSync(join(tmpdir(), 'typst-cover-footer-anchor-'))
      const file = join(dir, 'doc.typ')
      writeFileSync(file, code, 'utf-8')
      expect(() =>
        execFileSync('typst', ['compile', file, join(dir, 'doc.pdf')], {
          stdio: 'pipe',
        }),
      ).not.toThrow()
    },
  )
})

describe('mode « Course aux nombres » (canMode)', () => {
  const canOptions = { ...defaultTypstDocumentOptions, canMode: true }

  it('rassemble toutes les questions dans un seul tableau', () => {
    const code = buildTypstDocument(
      [
        exercise({
          questions: ['$7\\times 5$', '$37+29$'],
          canAnswers: ['', '$\\ldots$ €'],
          corrections: ['$35$', '$66$'],
        }),
        exercise({
          questions: ['Combien de boules ?'],
          canAnswers: ['$\\ldots$ boules'],
          corrections: ['$12$ boules'],
        }),
      ],
      canOptions,
      {},
      [],
      { exportMode: true },
    )
    // l'aide n'est déclarée que si elle sert, comme les autres
    expect(code).toContain('#let can-tableau(')
    expect(code).toContain('#can-tableau(')
    // les questions des deux exercices se suivent dans le même tableau
    expect(code).toContain('[$7 times 5$],')
    expect(code).toContain('[Combien de boules ?],')
    expect(code).toContain('[$#box(width: 5em, repeat(gap: 2pt)[.])$ boules],')
    // corrections numérotées à la suite, dans l'ordre des lignes, et
    // réparties en colonnes (les réponses tiennent en quelques caractères)
    expect(code).toContain('#if corrige [')
    expect(code).toContain(
      '#tasks(columns: "auto-fit", label: (..n) => strong(numbering("1)", ..n))',
    )
    expect(code).toContain('      + $35$\n      + $66$\n      + $12$ boules')
    // ni banque d'exercices ni badges : il n'y a plus de titre d'exercice
    expect(code).not.toContain('exercise-bank')
    expect(code).not.toContain('#let ex1 = exo.with(')
  })

  it('place le QR-code global dans la page de garde', () => {
    const code = buildTypstDocument(
      [exercise({ url: 'https://coopmaths.fr/alea?uuid=can&alea=seed' })],
      {
        ...canOptions,
        showQrCodeFiche: true,
        coverPage: {
          ...defaultTypstDocumentOptions.coverPage,
          template: 'can',
        },
      },
    )
    expect(code).toContain('#let qr-code-global-url = "')
    expect(code).toContain('#import "@preview/tiaoma:0.3.0": qrcode')
    expect(code).toContain(
      'qr-code: [#mathalea-anchor("qr-code", 0)#box(width: 2cm',
    )
    // La couverture provoque un saut de page : le QR doit être émis avant,
    // et non dans le bloc d'en-tête qui suit.
    expect(code).not.toContain('#exo-corner(')
  })

  it('préfère les énoncés CAN (canQuestions) aux questions ordinaires', () => {
    const code = buildTypstDocument(
      [
        exercise({
          questions: ['Calculer $7\\times 5$.'],
          canQuestions: ['$7\\times 5$'],
          canAnswers: [''],
        }),
      ],
      canOptions,
      {},
      [],
      { exportMode: true },
    )
    expect(code).toContain('[$7 times 5$],')
    expect(code).not.toContain('Calculer')
  })

  it('laisse la cellule réponse vide quand il n’y a pas de canAnswers', () => {
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$', '$2+2$'] })],
      canOptions,
      {},
      [],
      { exportMode: true },
    )
    expect(code).toContain(
      '#can-tableau(\n    (\n      [$1 + 1$],\n      [$2 + 2$],\n    ),\n    (\n      [],\n      [],\n    ),\n  )',
    )
  })

  it('ne produit pas de section Corrections sans correction', () => {
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$'] })],
      canOptions,
    )
    expect(code).not.toContain('Corrections')
  })

  it('garde les repères de la palette qui ont un sens dans un tableau', () => {
    const code = buildTypstDocument(
      [
        exercise({
          questions: ['$1+1$', '$2+2$'],
          corrections: ['$2$', '$4$'],
        }),
        exercise({ questions: ['$3+3$'], corrections: ['$6$'] }),
      ],
      canOptions,
      { insertions: { 0: ['#section[Calcul mental]'], 1: ['#colbreak()'] } },
    )
    // la liste des corrections est commune à la fiche : ses colonnes se
    // règlent depuis la palette, via un repère et des variables au numéro 0
    expect(code).toContain('#mathalea-anchor("tasks-corr", 0)')
    expect(code).toContain('#tasks(columns: ex0-corr-colonnes')
    expect(code).toContain('#let ex0-corr-colonnes = colonnes-questions')
    expect(code).toContain('#let ex0-corr-gutter = interligne-questions')
    // un repère « exo » par exercice, dans sa première cellule, et un repère
    // « can-row » dans chaque cellule (édition d'une ligne du tableau)
    expect(code).toContain(
      '[#mathalea-anchor("exo", 1)\n      #mathalea-anchor("can-row", 1)\n      $1 + 1$],',
    )
    expect(code).toContain('[#mathalea-anchor("can-row", 2)\n      $2 + 2$],')
    expect(code).toContain(
      '[#mathalea-anchor("exo", 2)\n      #mathalea-anchor("can-row", 3)\n      $3 + 3$],',
    )
    // seuls les deux gaps qui encadrent le tableau existent
    expect(code).toContain('#mathalea-anchor("gap", 0)')
    expect(code).toContain('#mathalea-anchor("gap", 2)')
    expect(code).not.toContain('#mathalea-anchor("gap", 1)')
    // les insertions des gaps intermédiaires sont réémises après le tableau
    // plutôt que perdues
    expect(code).toContain('#section[Calcul mental] // mathalea:insertion')
    expect(code).toContain('#colbreak() // mathalea:insertion')
  })

  it('regroupe les questions liées derrière un seul énoncé', () => {
    const code = buildTypstDocument(
      [
        exercise({
          questions: ['Courbe de $f$', 'Courbe de $f$', '$1+1$'],
          canAnswers: ['$f(0) = \\ldots$', '$S = \\ldots$', '$\\ldots$'],
          // la question 1 se numérote 13 et déclare 14 comme liée ; la
          // question 2 se numérote 14 et cite 13 en retour
          canLinkNumbers: [13, 14, 0],
          canLinkedTo: [[14], [13], []],
        }),
      ],
      canOptions,
    )
    // un seul énoncé, dont la cellule couvre les deux lignes
    expect(code).toContain('table.cell(rowspan: 2, breakable: false, [')
    expect(code.match(/Courbe de \$f\$/g)).toHaveLength(1)
    // la deuxième question n'a plus de cellule d'énoncé, seulement sa réponse
    expect(code).toContain('none,')
    expect(code).toContain('$S = #box(width: 5em, repeat(gap: 2pt)[.])$')
    // la modale d'édition de cette ligne ne propose donc pas d'énoncé
    expect(
      getGeneratedCanRowCode(
        [
          exercise({
            questions: ['Courbe de $f$', 'Courbe de $f$'],
            canLinkNumbers: [13, 14],
            canLinkedTo: [[14], [13]],
          }),
        ],
        2,
        canOptions,
      ).sharesPreviousEnonce,
    ).toBe(true)
  })

  it('plafonne la largeur des figures du tableau', () => {
    const svg =
      '<svg width="600" height="300"><circle cx="24" cy="24" r="8"/></svg>'
    const code = buildTypstDocument(
      [exercise({ questions: [`Lire le graphique<br>${svg}`] })],
      canOptions,
    )
    // 600 px valent 450 pt : sans plafond propre au tableau, la figure
    // occuperait toute la cellule (voir CAN_FIGURE_MAX_WIDTH_PT)
    expect(code).toContain('width: 120.0pt)')
    expect(code).not.toContain('width: 450.0pt)')
  })

  it('rabaisse la police du tableau en A5 (rapport texte/figure)', () => {
    const a5 = buildTypstDocument([exercise({ questions: ['$7\\times 5$'] })], {
      ...canOptions,
      pageFormat: 'a5',
    })
    // le tableau reçoit une taille de police relative réduite ; les figures,
    // plafonnées en pt absolus, ne suivent pas
    expect(a5).toContain('    taille: 0.85em,')
    // en A4, le tableau garde la police du document (pas d'argument taille)
    const a4 = buildTypstDocument(
      [exercise({ questions: ['$7\\times 5$'] })],
      canOptions,
    )
    expect(a4).not.toContain('taille: 0.85em')
  })

  it('règle la largeur de la colonne Réponse par une variable de la palette', () => {
    const code = buildTypstDocument(
      [exercise({ questions: ['$7\\times 5$'] })],
      canOptions,
      { canAnswerWidth: 20 },
    )
    expect(code).toContain('#let can-reponse = 20')
    expect(code).toContain('reponse: can-reponse,')
    expect(code).toContain(
      'repere: dx => mathalea-anchor("can-table", 0, dx: dx),',
    )
    // relue telle quelle lors d'une régénération
    expect(harvestCarryOver(code).canAnswerWidth).toBe(20)
    // la valeur par défaut n'est pas figée dans le carry-over
    const defaut = buildTypstDocument(
      [exercise({ questions: ['$7\\times 5$'] })],
      canOptions,
    )
    expect(defaut).toContain('#let can-reponse = 28')
    expect(harvestCarryOver(defaut).canAnswerWidth).toBeUndefined()
  })

  it('émet les repères de lignes sur chaque version', () => {
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$'] })],
      { ...canOptions, nbVersions: 2 },
      {},
      [[exercise({ questions: ['$5+5$'] })]],
    )
    expect(code).toContain('Sujet A')
    expect(code).toContain('$5 + 5$')
    expect(subjectEditorCode(code, 1)).toContain(
      '#mathalea-anchor("can-row", 1)',
    )
    // le compteur du paquet exercise-bank n'existe pas dans ce mode
    expect(code).not.toContain('#exo-counter.update(0)')
  })

  it.skipIf(!shouldRunTypstCliTests())(
    'compile avec typst : tableau, figure et corrections',
    async () => {
      const code = buildTypstDocument(
        [
          exercise({
            questions: [
              '$7\\times 5$',
              'Combien y a-t-il de boules noires ?<br><svg width="96" height="48"><circle cx="24" cy="24" r="8"/></svg>',
            ],
            canAnswers: ['', '$\\ldots$ boules'],
            corrections: ['$35$', '$12$ boules'],
          }),
        ],
        canOptions,
      )
      const { execFileSync } = await import('node:child_process')
      const { writeFileSync, mkdtempSync } = await import('node:fs')
      const { tmpdir } = await import('node:os')
      const { join } = await import('node:path')
      const dir = mkdtempSync(join(tmpdir(), 'typst-can-'))
      const file = join(dir, 'doc.typ')
      writeFileSync(file, code, 'utf-8')
      expect(() =>
        execFileSync('typst', ['compile', file, join(dir, 'doc.pdf')], {
          stdio: 'pipe',
        }),
      ).not.toThrow()
    },
  )

  describe('surcharge d’une ligne (modale d’édition)', () => {
    const inputs = [
      exercise({ questions: ['$1+1$', '$2+2$'], canAnswers: ['$2$', '$4$'] }),
      exercise({ questions: ['$3+3$'], canAnswers: ['$6$'] }),
    ]

    it('getGeneratedCanRowCode renvoie l’énoncé et la réponse générés de la ligne', () => {
      expect(getGeneratedCanRowCode(inputs, 1, canOptions)).toEqual({
        enonce: '$1 + 1$',
        reponse: '$2$',
        sharesPreviousEnonce: false,
      })
      expect(getGeneratedCanRowCode(inputs, 3, canOptions)).toEqual({
        enonce: '$3 + 3$',
        reponse: '$6$',
        sharesPreviousEnonce: false,
      })
    })

    it('remplace l’énoncé et/ou la réponse générés de la ligne surchargée, sans toucher aux autres', () => {
      const code = buildTypstDocument(inputs, canOptions, {
        codeOverridesCan: { 2: '#strong[Deux plus deux ?]' },
        codeOverridesCanReponse: { 2: '#strong[4]' },
      })
      expect(code).toContain('#strong[Deux plus deux ?]')
      expect(code).toContain('#strong[4]')
      // les lignes non surchargées gardent leur contenu généré
      expect(code).toContain('$1 + 1$')
      expect(code).toContain('$3 + 3$')
      expect(code).not.toContain('$2 + 2$')
    })

    it('harvestCarryOver relit les surcharges depuis le code généré (aller-retour)', () => {
      const code = buildTypstDocument(inputs, canOptions, {
        codeOverridesCan: { 2: '#strong[Deux plus deux ?]' },
        codeOverridesCanReponse: { 2: '#strong[4]' },
      })
      const harvested = harvestCarryOver(code)
      expect(harvested.codeOverridesCan).toEqual({
        2: '#strong[Deux plus deux ?]',
      })
      expect(harvested.codeOverridesCanReponse).toEqual({ 2: '#strong[4]' })
    })

    it('exportMode : la surcharge sort telle quelle, sans repère ni marqueur de relecture', () => {
      const code = buildTypstDocument(
        inputs,
        canOptions,
        { codeOverridesCan: { 1: '#strong[Un plus un ?]' } },
        [],
        { exportMode: true },
      )
      expect(code).toContain('#strong[Un plus un ?]')
      expect(code).not.toContain('mathalea:override-can')
      expect(code).not.toContain('mathalea-anchor')
    })

    it.skipIf(!shouldRunTypstCliTests())(
      'compile avec typst : le repère de fin de surcharge ne masque pas le `],` qui le suit',
      async () => {
        // régression : `// mathalea:override-can(-rep)-end` est un
        // commentaire Typst ; s'il n'est pas suivi d'un saut de ligne avant
        // le `],` collé par `typstContentArrayArgument`, ce `],` est avalé
        // par le commentaire et l'élément du tableau ne se referme jamais.
        const code = buildTypstDocument(inputs, canOptions, {
          codeOverridesCan: { 1: 'Un plus un ?' },
          codeOverridesCanReponse: { 2: '$4$' },
        })
        const { execFileSync } = await import('node:child_process')
        const { writeFileSync, mkdtempSync } = await import('node:fs')
        const { tmpdir } = await import('node:os')
        const { join } = await import('node:path')
        const dir = mkdtempSync(join(tmpdir(), 'typst-can-row-'))
        const file = join(dir, 'doc.typ')
        writeFileSync(file, code, 'utf-8')
        expect(() =>
          execFileSync('typst', ['compile', file, join(dir, 'doc.pdf')], {
            stdio: 'pipe',
          }),
        ).not.toThrow()
      },
    )
  })
})

describe('correction minimale (minimalCorrections)', () => {
  const highlight = (contenu: string) =>
    `{\\color{#F15929}\\boldsymbol{${contenu}}}`
  const minimalOptions = {
    ...defaultTypstDocumentOptions,
    minimalCorrections: true,
  }

  it('utilise les réponses explicites et respecte les questions sans réponse courte', () => {
    const code = buildTypstDocument(
      [
        exercise({
          questions: ['Calculer.', 'Construire.'],
          corrections: [
            'Calcul détaillé.',
            `Construction complète $${highlight('étape')}$`,
          ],
          shortAnswers: ['$42$', null],
        }),
      ],
      minimalOptions,
    )
    expect(code).toContain('$42$')
    expect(code).not.toContain('Calcul détaillé')
    expect(code).toContain('Construction complète')
  })

  it('ne garde que la réponse mise en évidence', () => {
    const code = buildTypstDocument(
      [
        exercise({
          questions: ['Calculer $3\\times 5$.'],
          corrections: [`On sait que $3\\times 5 = ${highlight('15')}$.`],
        }),
      ],
      minimalOptions,
    )
    expect(code).toContain('15')
    expect(code).not.toContain('On sait que')
  })

  it('sépare plusieurs réponses d’une même correction', () => {
    const code = buildTypstDocument(
      [
        exercise({
          questions: ['PGCD et PPCM de $12$ et $30$ ?'],
          corrections: [
            `Le PGCD est $${highlight('6')}$ et le PPCM est $${highlight('60')}$.`,
          ],
        }),
      ],
      minimalOptions,
    )
    expect(code).not.toContain('Le PGCD est')
    // les deux réponses se suivent, séparées par un cadratin
    expect(code).toContain('$evidence(6)$\u2003$evidence(60)$')
  })

  it('laisse intacte une correction sans mise en évidence orange', () => {
    const detaillee = 'On applique la formule, donc $A = 12$.'
    const code = buildTypstDocument(
      [exercise({ questions: ['Calculer $A$.'], corrections: [detaillee] })],
      minimalOptions,
    )
    expect(code).toContain('On applique la formule')
  })

  it('ignore une mise en évidence d’une autre couleur', () => {
    const code = buildTypstDocument(
      [
        exercise({
          questions: ['Calculer.'],
          corrections: [
            'Le signe est $ {\\color{#1d4ed8}\\boldsymbol{+}} $ donc $A = 12$.',
          ],
        }),
      ],
      minimalOptions,
    )
    expect(code).toContain('Le signe est')
  })

  it('s’applique aussi au tableau « Course aux nombres »', () => {
    const code = buildTypstDocument(
      [
        exercise({
          questions: ['$3\\times 5$'],
          corrections: [`On a $3\\times 5 = ${highlight('15')}$.`],
        }),
      ],
      { ...minimalOptions, canMode: true },
    )
    expect(code).toContain('#can-tableau(')
    expect(code).not.toContain('On a')
  })

  it('garde la réponse d’un texteEnCouleurEtGras (QCM)', () => {
    const code = buildTypstDocument(
      [
        exercise({
          questions: ['Coche la bonne réponse.'],
          corrections: [
            'A) six B) sept<br>$68=6\\times 10+8$, donc $68$ c’est ' +
              '<span style="color:#F15929;font-weight: bold;">$6$ fois $10$ et j’ajoute $8$</span>.',
          ],
        }),
      ],
      minimalOptions,
    )
    expect(code).not.toContain('A) six')
    expect(code).not.toContain('donc')
    expect(code).toContain('fois')
  })

  it('ignore les repères de sous-question (numAlpha), orange et gras eux aussi', () => {
    const marker = (letter: string) =>
      `<span style="color:#f15929; font-weight:bold">${letter})&nbsp;</span>`
    const detaillee = `${marker('a')}On développe.<br>${marker('b')}On factorise.`
    const code = buildTypstDocument(
      [exercise({ questions: ['Calculer.'], corrections: [detaillee] })],
      minimalOptions,
    )
    expect(code).toContain('On développe')
    expect(code).toContain('On factorise')
  })

  it('reste sans effet quand le réglage est désactivé', () => {
    const code = buildTypstDocument(
      [
        exercise({
          questions: ['Calculer $3\\times 5$.'],
          corrections: [`On sait que $3\\times 5 = ${highlight('15')}$.`],
        }),
      ],
      defaultTypstDocumentOptions,
    )
    expect(code).toContain('On sait que')
  })
})

describe('sourceUrl (URL de régénération en commentaire)', () => {
  it("n'ajoute pas de ligne quand aucune URL n'est fournie", () => {
    const code = buildTypstDocument([exercise({ questions: ['$1+1$'] })])
    expect(code).not.toContain('Ce code est modifiable')
    expect(code).not.toContain('Pour régénérer cette fiche')
  })

  it('inscrit l’URL fournie en commentaire, à la place de la mention modifiable', () => {
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$'] })],
      defaultTypstDocumentOptions,
      {},
      [],
      { sourceUrl: 'https://coopmaths.fr/alea/?uuid=abc12&v=typst' },
    )
    expect(code).not.toContain('Ce code est modifiable')
    expect(code).toContain(
      '// Pour régénérer cette fiche : https://coopmaths.fr/alea/?uuid=abc12&v=typst',
    )
  })
})

describe('préambule d’une banque externe (extraPreamble)', () => {
  it('ne réécrit pas la numérotation des listes réglée par le préambule', () => {
    const preambule = '#set enum(numbering: n => strong[#n.])'
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$'] })],
      defaultTypstDocumentOptions,
      {},
      [],
      { extraPreamble: preambule },
    )
    expect(code).toContain(preambule)
    const apres = code.slice(code.indexOf(preambule) + preambule.length)
    expect(apres).not.toMatch(/#set enum\([^)]*numbering/)
  })
})

describe('exportMode (génération autonome depuis les exercices)', () => {
  it('retire aussi les repères du QR-code global et des sujets supplémentaires', () => {
    const inputs = [
      exercise({
        questions: ['$1+1$'],
        url: 'https://coopmaths.fr/alea/?uuid=19ca2',
      }),
    ]
    const code = buildTypstDocument(
      inputs,
      { ...defaultTypstDocumentOptions, showQrCodeFiche: true, nbVersions: 2 },
      {},
      [inputs],
      { exportMode: true },
    )
    expect(code).not.toContain('mathalea-anchor')
    expect(code).not.toContain('mathalea:')
    expect(code).toContain('#qrcode(qr-code-global-url')
    expect(code).toContain('Sujet B')
  })

  it('inline les colonnes/espacement des tasks, sans variables exN-colonnes/exN-gutter', () => {
    const code = buildTypstDocument(
      [
        exercise({
          questions: ['$1+1$', '$2+2$'],
          corrections: ['$2$', '$4$'],
          numbered: true,
        }),
      ],
      defaultTypstDocumentOptions,
      { tasksLayout: { ex1: { columns: '2', gutter: '0.8em' } } },
      [],
      { exportMode: true },
    )
    expect(code).toContain('#tasks(columns: 2,')
    expect(code).toContain('row-gutter: 0.8em,')
    expect(code).not.toContain('ex1-colonnes')
    expect(code).not.toContain('ex1-gutter')
    expect(code).not.toContain('interligne-questions')
    // la correction (ex1-corr), sans réglage de la palette, reprend les
    // valeurs par défaut en littéral
    expect(code).toContain('#tasks(columns: "auto-fit",')
    expect(code).toContain('row-gutter: 1.2em,')
  })

  it('ne contient ni repère mathalea-anchor ni marqueur interne (insertion/surcharge)', () => {
    const code = buildTypstDocument(
      [
        exercise({ questions: ['$1+1$', '$2+2$'], numbered: true }),
        exercise({ questions: ['$3+3$'] }),
      ],
      defaultTypstDocumentOptions,
      {
        insertions: { 0: ['#section[Fractions]'] },
        codeOverrides: { 2: '#text[Contenu personnalisé]' },
      },
      [],
      { exportMode: true },
    )
    expect(code).not.toContain('mathalea-anchor')
    expect(code).not.toContain('mathalea:insertion')
    expect(code).not.toContain('mathalea:override')
    // le contenu inséré/surchargé reste bien présent, sans son marqueur
    expect(code).toContain('#section[Fractions]')
    expect(code).toContain('#text[Contenu personnalisé]')
  })

  it.skipIf(!shouldRunTypstCliTests())(
    'compile avec typst : document export (tasks + figure avec labels + insertion)',
    async () => {
      const code = buildTypstDocument(
        [
          exercise({
            questions: [
              '<div class="svgContainer"><div><svg class="mathalea2d" width="96" height="48"></svg><div class="divLatex" style="top: 10px; left: 20px; transform: rotate(0deg);" data-top=10 data-left=20><span class="katex"><span class="katex-mathml"><math><semantics><annotation encoding="application/x-tex">1</annotation></semantics></math></span></span></div></div></div>',
              '$2+2$',
            ],
            numbered: true,
          }),
        ],
        defaultTypstDocumentOptions,
        { insertions: { 0: ['#section[Fractions]'] } },
        [],
        { exportMode: true },
      )
      const { execFileSync } = await import('node:child_process')
      const { writeFileSync, mkdtempSync } = await import('node:fs')
      const { tmpdir } = await import('node:os')
      const { join } = await import('node:path')
      const dir = mkdtempSync(join(tmpdir(), 'typst-export-'))
      const file = join(dir, 'doc.typ')
      writeFileSync(file, code, 'utf-8')
      expect(() =>
        execFileSync('typst', ['compile', file, join(dir, 'doc.pdf')], {
          stdio: 'pipe',
        }),
      ).not.toThrow()
    },
  )
})

describe('getGeneratedExerciseCode', () => {
  it('utilise des colonnes/espacement littéraux (préremplissage de la modale d’édition)', () => {
    const code = getGeneratedExerciseCode(
      [exercise({ questions: ['$1+1$', '$2+2$'], numbered: true })],
      1,
    )
    expect(code).toContain('#tasks(columns: "auto-fit",')
    expect(code).toContain('row-gutter: 1.2em,')
    expect(code).not.toContain('ex1-colonnes')
    expect(code).not.toContain('mathalea-anchor')
  })
})

describe('buildStandaloneExerciseCode', () => {
  it("n'inclut que les aides utilisées et aucun repère/variable interne", () => {
    const inputs = [exercise({ questions: ['$1+1$', '$2+2$'], numbered: true })]
    const code = buildStandaloneExerciseCode(inputs, 1)
    expect(code).toContain(`#import "${typstPackageSpec('taskize')}"`)
    expect(code).toContain('#let couleur =')
    expect(code).not.toContain('mathalea-anchor')
    expect(code).not.toContain('exercise-bank')
    expect(code).not.toContain('ex1-colonnes')
  })

  it.skipIf(!shouldRunTypstCliTests())(
    'compile seul avec typst (exercice avec figure mathalea2d à labels)',
    async () => {
      const inputs = [
        exercise({
          questions: [
            '<div class="svgContainer"><div><svg class="mathalea2d" width="96" height="48"></svg><div class="divLatex" style="top: 10px; left: 20px; transform: rotate(0deg);" data-top=10 data-left=20><span class="katex"><span class="katex-mathml"><math><semantics><annotation encoding="application/x-tex">1</annotation></semantics></math></span></span></div></div></div>',
          ],
        }),
      ]
      const code = buildStandaloneExerciseCode(inputs, 1)
      const { execFileSync } = await import('node:child_process')
      const { writeFileSync, mkdtempSync } = await import('node:fs')
      const { tmpdir } = await import('node:os')
      const { join } = await import('node:path')
      const dir = mkdtempSync(join(tmpdir(), 'typst-standalone-'))
      const file = join(dir, 'doc.typ')
      writeFileSync(file, code, 'utf-8')
      expect(() =>
        execFileSync('typst', ['compile', file, join(dir, 'doc.pdf')], {
          stdio: 'pipe',
        }),
      ).not.toThrow()
    },
  )
})

describe('lignes de réponse (réglage global)', () => {
  it('ajoute les lignes en fin de chaque exercice', () => {
    const code = buildTypstDocument([exercise({ questions: ['$1+1$'] })], {
      ...defaultTypstDocumentOptions,
      answerLines: 2,
    })
    expect(code).toContain(
      '#mathalea-lignes(2, gutter: 2em, style: "pointilles")',
    )
  })

  it('n’ajoute rien par défaut', () => {
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$'] })],
      defaultTypstDocumentOptions,
    )
    expect(code).not.toContain('#mathalea-lignes(')
  })

  it('applique le trait choisi pour le document (answerLinesStyle)', () => {
    const code = buildTypstDocument([exercise({ questions: ['$1+1$'] })], {
      ...defaultTypstDocumentOptions,
      answerLines: 3,
      answerLinesStyle: 'points',
    })
    expect(code).toContain(
      '#mathalea-lignes(3, gutter: 2em, style: "points") // mathalea:lignes-fin(1)',
    )
  })

  it('place les lignes après chaque question quand le document le demande', () => {
    const code = buildTypstDocument(
      [
        exercise({ questions: ['$1+1$', '$2+2$', '$3+3$'], numbered: true }),
        exercise({ questions: ['$4+4$', '$5+5$'], numbered: true }),
      ],
      {
        ...defaultTypstDocumentOptions,
        answerLines: 2,
        answerLinesPosition: 'afterEachQuestion',
      },
    )
    // une occurrence par question de chaque exercice, pas une par exercice
    expect(code.match(/\/\/ mathalea:lignes-apres\(1\)/g)).toHaveLength(3)
    expect(code.match(/\/\/ mathalea:lignes-apres\(2\)/g)).toHaveLength(2)
    expect(code).not.toContain('mathalea:lignes-fin(')
  })

  it('réémet le trait du document quand les réglages par exercice sont oubliés', () => {
    // le réglage global écrit des appels `#mathalea-lignes` dans le code ;
    // relus par `harvestCarryOver`, ils l'emporteraient sur lui (c'est le
    // rôle du `dropWritingLines` de la vue) — sans eux, le nouveau trait
    // s'applique bien à tous les exercices
    const options = {
      ...defaultTypstDocumentOptions,
      answerLines: 2,
      answerLinesStyle: 'plein' as const,
    }
    const premier = buildTypstDocument(
      [exercise({ questions: ['$1+1$'] })],
      options,
    )
    const carryOver = harvestCarryOver(premier)
    expect(carryOver.writingLines?.[1]?.style).toBe('plein')
    const regenere = buildTypstDocument(
      [exercise({ questions: ['$1+1$'] })],
      { ...options, answerLinesStyle: 'points' },
      { ...carryOver, writingLines: undefined },
    )
    expect(regenere).toContain('style: "points"')
    expect(regenere).not.toContain('style: "plein"')
  })

  it('laisse la palette régler un exercice à part', () => {
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$'] }), exercise({ questions: ['$2+2$'] })],
      { ...defaultTypstDocumentOptions, answerLines: 2 },
      {
        writingLines: {
          1: {
            position: 'endOfExercise',
            count: 5,
            spacing: 2,
            style: 'pointilles',
          },
        },
      },
    )
    // l'exercice réglé garde ses 5 lignes, l'autre suit le réglage global
    expect(code).toContain(
      '#mathalea-lignes(5, gutter: 2em, style: "pointilles")',
    )
    expect(code).toContain(
      '#mathalea-lignes(2, gutter: 2em, style: "pointilles")',
    )
  })
})

describe('page de garde', () => {
  const cover = (
    overrides: Partial<TypstDocumentOptions['coverPage']> = {},
  ): TypstDocumentOptions => ({
    ...defaultTypstDocumentOptions,
    coverPage: {
      ...defaultTypstDocumentOptions.coverPage,
      titre: 'Brevet des collèges',
      session: 'Juin 2026',
      matiere: 'MATHÉMATIQUES',
      duree: '2 heures',
      consignes: ['L’usage de la calculatrice est autorisé.'],
      noteFin: 'Tournez la page S.V.P.',
      bareme: [6, 14],
      ...overrides,
    },
  })

  it('n’émet rien tant qu’aucun modèle n’est choisi', () => {
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$'] })],
      defaultTypstDocumentOptions,
    )
    expect(code).not.toContain('mathalea-couverture')
    expect(code).not.toContain('Page de garde')
  })

  it('place l’appel avant l’en-tête de la fiche', () => {
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$'] })],
      cover({ template: 'brevet' }),
    )
    expect(code).toContain('#let mathalea-couverture(')
    expect(code.indexOf('#mathalea-couverture(')).toBeLessThan(
      code.indexOf('// ----- En-tête -----'),
    )
  })

  it('déclare les textes en variables et l’appel les référence (édition sur l’aperçu)', () => {
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$'] })],
      cover({ template: 'brevet' }),
    )
    // déclarées près de `titre`/`sous-titre`/`entete`, comme eux modifiables
    // par une édition ciblée depuis l'icône de l'aperçu (pas de régénération)
    expect(code).toContain('#let couverture-titre = "Brevet des collèges"')
    expect(code).toContain('#let couverture-session = "Juin 2026"')
    expect(code).toContain('#let couverture-matiere = "MATHÉMATIQUES"')
    expect(code).toContain('#let couverture-duree = "2 heures"')
    // une consigne unique : le tableau Typst exige la virgule finale
    expect(code).toContain(
      '#let couverture-consignes = ("L’usage de la calculatrice est autorisé.",)',
    )
    expect(code).toContain(
      '#let couverture-note-fin = "Tournez la page S.V.P."',
    )
    // l'appel référence les variables, pas les valeurs en dur
    expect(code).toContain('  titre: couverture-titre,')
    expect(code).toContain('  session: couverture-session,')
    expect(code).toContain('  matiere: couverture-matiere,')
    expect(code).toContain('  duree: couverture-duree,')
    expect(code).toContain('  consignes: couverture-consignes,')
    expect(code).toContain('  note-fin: couverture-note-fin,')
    // le barème, lui, reste en dur (réglé dans le volet, pas sur l'aperçu)
    expect(code).toContain('  bareme: (6, 14),')
    expect(code).not.toContain('identite: true')
  })

  it('n’affiche pas la mention de bas de page pour une évaluation (mais la déclare)', () => {
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$'] })],
      cover({ template: 'evaluation' }),
    )
    // toujours déclarée (même variables quel que soit le modèle), mais
    // l'argument n'est pas passé : l'aide garde sa valeur par défaut `none`
    expect(code).toContain(
      '#let couverture-note-fin = "Tournez la page S.V.P."',
    )
    expect(code).not.toContain('note-fin: couverture-note-fin')
  })

  it('place un repère unique avant le premier appel, absent en mode export', () => {
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$'] })],
      cover({ template: 'brevet' }),
    )
    expect(code.match(/#mathalea-anchor\("cover", 0\)/g)).toHaveLength(1)
    expect(code.indexOf('#mathalea-anchor("cover", 0)')).toBeLessThan(
      code.indexOf('#mathalea-couverture('),
    )
    const exportCode = buildTypstDocument(
      [exercise({ questions: ['$1+1$'] })],
      cover({ template: 'brevet' }),
      {},
      [],
      { exportMode: true },
    )
    expect(exportCode).not.toContain('#mathalea-anchor("cover"')
    // les variables restent déclarées et l'appel les référence toujours :
    // le code exporté reste autonome et éditable comme celui de l'aperçu
    expect(exportCode).toContain(
      '#let couverture-titre = "Brevet des collèges"',
    )
    expect(exportCode).toContain('  titre: couverture-titre,')
  })

  it('ajoute l’identité et la colonne de note pour une évaluation', () => {
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$'] })],
      cover({ template: 'evaluation' }),
    )
    expect(code).toContain('  identite: true,')
    expect(code).toContain('  colonne-note: true,')
    // « Tournez la page » n'a pas de sens sur une évaluation d'une page :
    // l'argument n'est pas passé (l'aide garde sa valeur par défaut `none`)
    expect(code).not.toContain('note-fin: "')
  })

  it('masque le barème quand il est désactivé', () => {
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$'] })],
      cover({ template: 'brevet', showBareme: false }),
    )
    expect(code).toContain('  bareme: (),')
  })

  describe('modèle « Récitation »', () => {
    const recitation = (
      overrides: Partial<TypstDocumentOptions['coverPage']> = {},
    ) =>
      cover({
        template: 'recitation',
        titre: 'Récitation – S2',
        matiere: 'Mathématiques 11ème CT',
        etablissement: 'CO des Coudriers',
        duree: '20 minutes',
        session: '02.09.24',
        consignes: ['Justifie chaque réponse.'],
        signatureLabel: 'Signature d’un responsable légal',
        bareme: [4, 6, 6],
        showBareme: false,
        ...overrides,
      })

    it('propose des consignes à l’infinitif et un intitulé de signature neutre', () => {
      expect(COVER_TEMPLATE_DEFAULTS.recitation.consignes).toEqual([
        'Justifier chaque réponse ;',
        'Écrire lisiblement au crayon ou au stylo (noir ou bleu) ;',
        'Ne pas utiliser la calculatrice.',
      ])
      expect(COVER_TEMPLATE_DEFAULTS.recitation.signatureLabel).toBe(
        'Signature d’un responsable légal',
      )
    })

    it('émet le bandeau, l’établissement et la date, sans page de garde pleine', () => {
      const code = buildTypstDocument(
        [exercise({ questions: ['$1+1$'] })],
        recitation(),
      )
      expect(code).toContain('#let mathalea-couverture-recitation(')
      expect(code).toContain('#mathalea-couverture-recitation(')
      expect(code).toContain(
        '#let couverture-etablissement = "CO des Coudriers"',
      )
      // la session tient la date, à droite sous la durée
      expect(code).toContain('  date: couverture-session,')
      // les modèles pleine page n'ont rien à faire dans ce document
      expect(code).not.toContain('#let mathalea-couverture(')
      // le bandeau enchaîne sur les exercices : pas de saut de page
      expect(code).not.toContain('pagebreak()\n}')
    })

    it('ajoute le champ de signature et sait le retirer', () => {
      const avec = buildTypstDocument(
        [exercise({ questions: ['$1+1$'] })],
        recitation(),
      )
      expect(avec).toContain('  signature: true,')
      expect(avec).toContain(
        '#let couverture-signature = "Signature d’un responsable légal"',
      )
      expect(avec).toContain('  signature-label: couverture-signature,')
      const sans = buildTypstDocument(
        [exercise({ questions: ['$1+1$'] })],
        recitation({ showSignature: false }),
      )
      expect(sans).toContain('  signature: false,')
    })

    it('ajoute la case de la note, décochable', () => {
      const avec = buildTypstDocument(
        [exercise({ questions: ['$1+1$'] })],
        recitation(),
      )
      expect(avec).toContain('  note: true,')
      const sans = buildTypstDocument(
        [exercise({ questions: ['$1+1$'] })],
        recitation({ showNote: false }),
      )
      expect(sans).toContain('  note: false,')
    })

    it('émet des booléens même pour une fiche enregistrée avant ces réglages', () => {
      // une fiche partagée avant l'ajout de ces réglages n'a pas les champs :
      // `undefined` dans le code ferait « Variable ou fonction inconnue »
      const options = recitation()
      const { showSignature, showNote, signatureLabel, ...sansSignature } =
        options.coverPage
      const code = buildTypstDocument([exercise({ questions: ['$1+1$'] })], {
        ...options,
        coverPage: sansSignature as typeof options.coverPage,
      })
      expect(code).not.toContain('undefined')
      expect(code).toContain(
        '#let couverture-signature = "Signature d’un responsable légal"',
      )
      expect(code).toContain('  signature: true,')
      expect(code).toContain('  note: true,')
    })

    it('passe toujours le barème (total de la ligne des points) et bascule la grille', () => {
      const sansGrille = buildTypstDocument(
        [exercise({ questions: ['$1+1$'] })],
        recitation(),
      )
      expect(sansGrille).toContain('  bareme: (4, 6, 6),')
      expect(sansGrille).toContain('  grille: false,')
      const avecGrille = buildTypstDocument(
        [exercise({ questions: ['$1+1$'] })],
        recitation({ showBareme: true }),
      )
      expect(avecGrille).toContain('  grille: true,')
    })

    it.runIf(shouldRunTypstCliTests())(
      'compile avec typst (bandeau seul, avec la grille, et grille large)',
      async () => {
        const { execFileSync } = await import('node:child_process')
        const { writeFileSync, mkdtempSync } = await import('node:fs')
        const { tmpdir } = await import('node:os')
        const { join } = await import('node:path')
        for (const [showBareme, nbExercices, showSignature] of [
          [false, 1, true],
          [true, 1, true],
          // sans signature, une grille et une note qui tiennent ensemble
          // partagent la même ligne
          [true, 6, false],
          // sinon la note passe à droite des consignes sous la grille
          [true, 11, false],
          // avec signature, la note reste exclusivement à côté de celle-ci
          [true, 11, true],
          // beaucoup d'exercices : la grille passe sous les champs plutôt que
          // de les écraser (bascule mesurée dans le code Typst)
          [true, 8, true],
          // au-delà, elle est réduite pour tenir dans la largeur du texte
          [true, 16, true],
        ] as const) {
          const code = buildTypstDocument(
            Array.from({ length: nbExercices }, () =>
              exercise({ questions: ['$1+1$'] }),
            ),
            recitation({
              showBareme,
              showSignature,
              bareme: Array.from({ length: nbExercices }, () => 2),
            }),
          )
          const dir = mkdtempSync(join(tmpdir(), 'typst-recitation-'))
          const file = join(dir, 'doc.typ')
          writeFileSync(file, code, 'utf-8')
          expect(() =>
            execFileSync('typst', ['compile', file, join(dir, 'doc.pdf')], {
              stdio: 'pipe',
            }),
          ).not.toThrow()
        }
      },
    )
  })

  it('compte les questions et embarque le logo en « Course aux nombres »', () => {
    const code = buildTypstDocument(
      [
        exercise({ questions: ['$1+1$', '$2+2$'] }),
        exercise({ questions: ['$3+3$'] }),
      ],
      cover({ template: 'can', titre: 'Course aux nombres' }),
    )
    expect(code).toContain('#mathalea-couverture-can(')
    // pas de titre texte dans la page de garde « can » : le logo porte déjà
    // le nom du sujet (voir MATHALEA_COVER_CAN_HELPER)
    expect(code).not.toContain('  titre: couverture-titre,')
    expect(code).toContain('  nb-questions: 3,')
    // référencé par chemin virtuel (chargé par `Typst.svelte`), pas embarqué
    expect(code).toContain(
      '#let mathalea-logo = image("/images/logoCan.png", width: 100%)',
    )
    // la page de garde des examens n'a rien à faire dans ce document
    expect(code).not.toContain('#let mathalea-couverture(')
  })

  it('compte les énoncés du tableau plutôt que les questions, le cas échéant', () => {
    const code = buildTypstDocument(
      [
        exercise({
          questions: ['$1+1$'],
          canQuestions: ['$1+1$', '$2+2$', '$3+3$'],
        }),
      ],
      { ...cover({ template: 'can' }), canMode: true },
    )
    expect(code).toContain('  nb-questions: 3,')
  })

  it('n’impose pas de largeur fixe au champ « Classe » (chevauchement en A5)', () => {
    // `largeur: 7cm` ignorait la colonne `1fr` du grid et débordait sur la
    // case du score en A5 (page plus étroite) : le champ doit occuper toute
    // la colonne qui lui est réservée, comme Nom/Prénom.
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$'] })],
      cover({ template: 'can' }),
    )
    expect(code).not.toContain('mathalea-champ("Classe", largeur:')
    expect(code).toContain('mathalea-champ("Classe")')
  })

  it('espace les pointillés des champs à compléter', () => {
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$'] })],
      cover({ template: 'evaluation' }),
    )
    expect(code).toContain('repeat(gap: 2pt)[.]')
    expect(code).not.toContain('repeat[.]')
  })

  it('ouvre chaque sujet quand plusieurs versions sont générées', () => {
    const code = buildTypstDocument(
      [exercise({ questions: ['$1+1$'] })],
      cover({ template: 'brevet' }),
      {},
      [[exercise({ questions: ['$2+2$'] })]],
    )
    const appels = code.match(/#mathalea-couverture\(/g) ?? []
    expect(appels).toHaveLength(2)
    // ... mais l'aide n'est déclarée qu'une fois
    expect(code.match(/#let mathalea-couverture\(/g) ?? []).toHaveLength(1)
    // La page de garde est éditable depuis chaque sujet.
    expect(code.match(/#mathalea-anchor\("cover", 0\)/g) ?? []).toHaveLength(2)
  })

  it.runIf(shouldRunTypstCliTests())(
    'compile avec typst (chaque modèle de page de garde)',
    async () => {
      const { execFileSync } = await import('node:child_process')
      const { writeFileSync, mkdtempSync, mkdirSync, copyFileSync } =
        await import('node:fs')
      const { tmpdir } = await import('node:os')
      const { join, dirname } = await import('node:path')
      const { fileURLToPath } = await import('node:url')
      const testDir = dirname(fileURLToPath(import.meta.url))
      for (const template of ['evaluation', 'brevet', 'bac', 'can'] as const) {
        const code = buildTypstDocument(
          [
            exercise({
              questions: ['$1+1$', '$2+2$'],
              corrections: ['$2$', '$4$'],
              numbered: true,
            }),
          ],
          {
            ...cover({ template }),
            canMode: template === 'can',
          },
        )
        const dir = mkdtempSync(join(tmpdir(), `typst-cover-${template}-`))
        const file = join(dir, 'doc.typ')
        writeFileSync(file, code, 'utf-8')
        if (template === 'can') {
          // le logo « can » est référencé par chemin (voir mathaleaLogo.ts),
          // pas embarqué : il faut le fournir à côté du .typ pour compiler,
          // comme le fera le .zip téléchargé (voir downloadTyp)
          mkdirSync(join(dir, 'images'), { recursive: true })
          copyFileSync(
            join(testDir, '../../../../public/images/logoCan.png'),
            join(dir, 'images', 'logoCan.png'),
          )
        }
        expect(() =>
          execFileSync('typst', ['compile', file, join(dir, 'doc.pdf')], {
            stdio: 'pipe',
          }),
        ).not.toThrow()
      }
    },
  )
})

describe('zoom des figures commun aux sujets', () => {
  it('fait correspondre les figures de même rang quand les sujets en ont autant', () => {
    // sujet A : figures 1-2, sujet B : 3-4, sujet C : 5-6
    expect(sharedFigureNumber(1, [2, 4], 6)).toBeUndefined()
    expect(sharedFigureNumber(3, [2, 4], 6)).toBe(1)
    expect(sharedFigureNumber(4, [2, 4], 6)).toBe(2)
    expect(sharedFigureNumber(6, [2, 4], 6)).toBe(2)
    // sujet B avec trois figures (tirage différent) : réglages propres
    expect(sharedFigureNumber(4, [2], 5)).toBeUndefined()
    // un seul sujet
    expect(sharedFigureNumber(1, [], 2)).toBeUndefined()
  })

  it('reprend le zoom et l’alignement du sujet A pour le sujet B', () => {
    const svg =
      '<svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="5" /></svg>'
    const inputs = [exercise({ questions: [svg, svg] })]
    const code = buildTypstDocument(
      inputs,
      { ...defaultTypstDocumentOptions, nbVersions: 2 },
      { figureZoom: { 1: 0.5, 2: 0.4 }, figureAlign: { 1: 'left' } },
      [inputs],
    )
    expect(code).toContain('#let fig-1-zoom = 0.5')
    expect(code).toContain('#let fig-1-align = left')
    expect(code).toContain('#let fig-3-zoom = fig-1-zoom')
    expect(code).toContain('#let fig-4-zoom = fig-2-zoom')
    expect(code).toContain('#let fig-4-align = fig-2-align')
    // les alias ne sont pas relus comme des réglages propres au sujet B
    expect(harvestCarryOver(code).figureZoom).toEqual({ 1: 0.5, 2: 0.4 })
  })

  it('garde le réglage propre à une figure du sujet B', () => {
    const svg =
      '<svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="5" /></svg>'
    const inputs = [exercise({ questions: [svg, svg] })]
    const options = { ...defaultTypstDocumentOptions, nbVersions: 2 }
    const code = buildTypstDocument(
      inputs,
      options,
      { figureZoom: { 1: 0.5, 3: 0.8 }, figureAlign: { 4: 'right' } },
      [inputs],
    )
    expect(code).toContain('#let fig-3-zoom = 0.8')
    expect(code).toContain('#let fig-4-zoom = fig-2-zoom')
    expect(code).toContain('#let fig-3-align = fig-1-align')
    expect(code).toContain('#let fig-4-align = right')
    // ramené à 1 alors que le sujet A est à 0.5 : reste détaché
    const reset = code.replace('#let fig-3-zoom = 0.8', '#let fig-3-zoom = 1')
    const rebuilt = buildTypstDocument(
      inputs,
      options,
      harvestCarryOver(reset),
      [inputs],
    )
    expect(rebuilt).toContain('#let fig-3-zoom = 1')
    expect(rebuilt).toContain('#let fig-1-zoom = 0.5')
  })
})

describe('points des exercices', () => {
  const inputs = [
    exercise({ questions: ['$1+1$', '$2+2$'] }),
    exercise({ questions: ['$3+3$'] }),
  ]
  const options = { ...defaultTypstDocumentOptions, showExercisePoints: true }

  it('reprend le barème, ou un point par question à défaut', () => {
    expect(exercisePoints([2, 1], options)).toEqual([2, 1])
    const withBareme = {
      ...options,
      coverPage: { ...options.coverPage, bareme: [5, 3.5] },
    }
    expect(exercisePoints([2, 1], withBareme)).toEqual([5, 3.5])
    // barème raccourci (exercices groupés) : il ne suit plus la fiche
    expect(
      exercisePoints([2, 1], {
        ...withBareme,
        coverPage: { ...options.coverPage, bareme: [8] },
      }),
    ).toEqual([2, 1])
    expect(exercisePoints([2, 1], defaultTypstDocumentOptions)).toBeNull()
    expect(exercisePoints([2, 1], { ...options, canMode: true })).toBeNull()
  })

  it('déclare les points, les passe aux exercices et met la note en en-tête', () => {
    const code = buildTypstDocument(inputs, {
      ...options,
      coverPage: { ...options.coverPage, bareme: [5, 3] },
    })
    expect(code).toContain('#let exo-1-points = 5')
    expect(code).toContain('#let exo-2-points = 3')
    expect(code).toContain(
      '#let exo-points-total = exo-1-points + exo-2-points',
    )
    expect(code).toContain('  points: exo-1-points,')
    expect(code).toContain('  points-position: "right",')
    expect(code).toContain('  points-format: "score",')
    expect(code).toContain(
      'Note : #box(width: 2.5em, repeat[.]) / #exo-points-total',
    )
  })

  it('applique le total saisi au groupe fusionné et au total de la fiche', () => {
    const bareme = setGroupedExercisePoints([5, 3], [2], 1, 4)
    const code = buildTypstDocument(
      inputs,
      {
        ...options,
        coverPage: { ...options.coverPage, bareme },
      },
      { merges: [2] },
    )
    expect(code).toContain('#let exo-1-points = 2.5')
    expect(code).toContain('#let exo-2-points = 1.5')
    expect(code).toContain('  points: exo-1-points + exo-2-points,')
    expect(code).toContain(
      '#let exo-points-total = exo-1-points + exo-2-points',
    )
  })

  it('place les points sous le titre sur demande', () => {
    const code = buildTypstDocument(inputs, {
      ...options,
      exercisePointsPosition: 'below',
    })
    expect(code).toContain('  points-position: "below",')
  })

  it("n'ajoute rien quand les points ne sont pas affichés", () => {
    const code = buildTypstDocument(inputs, defaultTypstDocumentOptions)
    expect(code).not.toContain('points')
  })

  it('laisse la note à la page de garde quand il y en a une', () => {
    const code = buildTypstDocument(inputs, {
      ...options,
      coverPage: { ...options.coverPage, template: 'evaluation' },
    })
    expect(code).toContain('  points: exo-1-points,')
    expect(code).not.toContain('Note : #box')
  })
})

describe('titres des exercices', () => {
  const options = { ...defaultTypstDocumentOptions, showExerciseTitles: true }
  const inputs = [
    exercise({ title: 'Calculer une somme', questions: ['$1+1$'] }),
    exercise({ title: 'Calculer un produit', questions: ['$2 \\times 3$'] }),
  ]

  it('déclare le titre MathALÉA de chaque exercice dans le préambule', () => {
    const code = buildTypstDocument(inputs, options)
    expect(code).toContain('#let exo-1-titre = [Calculer une somme]')
    expect(code).toContain('title: exo-1-titre,')
    expect(code).toContain('#let exo-2-titre = [Calculer un produit]')
  })

  it('laisse le titre du groupe vide par défaut et restaure les titres après séparation', () => {
    const code = buildTypstDocument(inputs, options, { merges: [2] })
    expect(code).toContain('#let exo-1-titre = none')
    expect(code).toContain('title: exo-1-titre,')
    const carryOver = harvestCarryOver(code)
    expect(buildTypstDocument(inputs, options, carryOver)).toBe(code)
    carryOver.merges = []
    expect(buildTypstDocument(inputs, options, carryOver)).toContain(
      '#let exo-1-titre = [Calculer une somme]',
    )
  })

  it('conserve un titre personnalisé pour le groupe fusionné', () => {
    const code = buildTypstDocument(inputs, options, {
      merges: [2],
      exerciseTitles: { 1: 'Calculer' },
    })
    expect(code).toContain(
      '#let exo-1-titre = "Calculer" // mathalea:titre-perso',
    )
    expect(buildTypstDocument(inputs, options, harvestCarryOver(code))).toBe(
      code,
    )
  })

  it("n'ajoute rien quand les titres ne sont pas affichés", () => {
    const code = buildTypstDocument(inputs, defaultTypstDocumentOptions)
    expect(code).not.toContain('exo-1-titre')
  })

  it('garde un titre modifié ou retiré après une régénération', () => {
    const first = buildTypstDocument(inputs, options, {
      exerciseTitles: { 1: 'Mon "titre"', 2: '' },
    })
    expect(first).toContain(
      '#let exo-1-titre = "Mon \\"titre\\"" // mathalea:titre-perso',
    )
    expect(first).toContain('#let exo-2-titre = none // mathalea:titre-perso')
    const harvested = harvestCarryOver(first)
    expect(harvested.exerciseTitles).toEqual({ 1: 'Mon "titre"', 2: '' })
    expect(buildTypstDocument(inputs, options, harvested)).toBe(first)
  })

  it('ne garde pas un titre MathALÉA comme titre modifié', () => {
    const code = buildTypstDocument(inputs, options)
    expect(harvestCarryOver(code).exerciseTitles).toEqual({})
  })

  it('écrit la ligne de titre attendue pour la palette', () => {
    expect(exerciseTitleLine(3, 'Titre')).toBe('#let exo-3-titre = [Titre]')
    expect(exerciseTitleLine(3, '')).toBe('#let exo-3-titre = none')
    expect(exerciseTitleLine(3, 'Titre', '')).toBe(
      '#let exo-3-titre = none // mathalea:titre-perso',
    )
  })
})

describe('plusieurs sujets sur une page', () => {
  const inputs = [
    exercise({ questions: ['$1+1$'], corrections: ['$2$'] }),
    exercise({ questions: ['$2+2$'], corrections: ['$4$'] }),
  ]
  const options = { ...defaultTypstDocumentOptions, showCorrections: true }

  it('repère le début et la fin des énoncés de chaque sujet pour mesurer sa hauteur', () => {
    const code = buildTypstDocument(inputs, { ...options, nbVersions: 2 }, {}, [
      inputs,
    ])
    for (const n of [0, 1]) {
      expect(code).toContain(`#mathalea-anchor("subject-start", ${n})`)
      expect(code).toContain(`#mathalea-anchor("subject-end", ${n})`)
    }
    expect(code).not.toContain('mathalea-enchainement(')
  })

  it("n'émet aucun repère de sujet en mode export", () => {
    const code = buildTypstDocument(
      inputs,
      { ...options, nbVersions: 2 },
      {},
      [inputs],
      {
        exportMode: true,
      },
    )
    expect(code).not.toContain('subject-start')
    expect(code).not.toContain('subject-end')
  })

  it('enchaîne les sujets et regroupe les corrections à la fin', () => {
    const code = buildTypstDocument(
      inputs,
      { ...options, nbVersions: 2, chainSubjects: true },
      {},
      [inputs],
    )
    expect(code).toContain('#let mathalea-sujet-0 = [')
    expect(code).toContain('#let mathalea-sujet-1 = [')
    expect(code).toContain(
      '#mathalea-enchainement(((mathalea-sujet-0, false), (mathalea-sujet-1, false),), corps: (190mm, 267mm))',
    )
    // pas de repère de sujet : l'aperçu montre la fiche entière
    expect(code).not.toContain('// mathalea:sujet(')
    // les corrections suivent l'appel, dans l'ordre des sujets
    const call = code.indexOf('#mathalea-enchainement(')
    const corrections = [...code.matchAll(/\/\/ ----- Corrections -----/g)]
    expect(corrections).toHaveLength(2)
    expect(corrections.every((match) => (match.index ?? 0) > call)).toBe(true)
    // repère de début des corrections de chaque sujet (palette de l'aperçu)
    expect(code).toContain('#mathalea-anchor("subject-corr", 0)')
    expect(code).toContain('#mathalea-anchor("subject-corr", 1)')
  })

  it('répète un sujet sans repère de la palette sur les exemplaires', () => {
    const code = buildTypstDocument(inputs, { ...options, copiesPerPage: 3 })
    expect(code).toContain(
      '#mathalea-enchainement(((mathalea-sujet-0, false), (mathalea-sujet-0-copie, true), (mathalea-sujet-0-copie, true),), corps: (190mm, 267mm))',
    )
    const copy = code.slice(
      code.indexOf('#let mathalea-sujet-0-copie = ['),
      code.indexOf('#mathalea-enchainement('),
    )
    expect(copy).not.toContain('mathalea-anchor(')
    // la ligne d'en-tête (Nom, Prénom, Classe) reste, sans son repère
    expect(copy).toContain('#entete')
  })

  it('ne fait rien avec un seul sujet et un seul exemplaire, ni avec une page de garde', () => {
    expect(
      buildTypstDocument(inputs, { ...options, chainSubjects: true }),
    ).not.toContain('mathalea-enchainement(')
    expect(
      buildTypstDocument(inputs, {
        ...options,
        copiesPerPage: 2,
        coverPage: {
          ...defaultTypstDocumentOptions.coverPage,
          template: 'evaluation',
        },
      }),
    ).not.toContain('mathalea-enchainement(')
  })
})

describe('plusieurs sujets sur une page avec le bandeau compact', () => {
  it('place le bandeau en tête de chaque sujet enchaîné', () => {
    const inputs = [exercise({ questions: ['$1+1$'] })]
    const code = buildTypstDocument(
      inputs,
      {
        ...defaultTypstDocumentOptions,
        nbVersions: 2,
        chainSubjects: true,
        coverPage: {
          ...defaultTypstDocumentOptions.coverPage,
          template: 'recitation',
        },
      },
      {},
      [inputs],
    )
    expect(code).toContain('#mathalea-enchainement(')
    for (const n of [0, 1]) {
      const start = code.indexOf(`#let mathalea-sujet-${n} = [`)
      const subject = code.slice(start, code.indexOf('\n]\n', start))
      expect(subject).toContain('mathalea-couverture-recitation(')
      expect(subject).toContain(`#mathalea-anchor("subject-start", ${n})`)
      expect(subject).toContain('#mathalea-anchor("cover", 0)')
    }
  })
})
