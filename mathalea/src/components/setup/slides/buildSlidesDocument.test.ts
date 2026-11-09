import { describe, expect, it } from 'vitest'
import {
  buildSlidesDocument,
  defaultSlidesDocumentOptions,
  harvestSlidesCarryOver,
} from './buildSlidesDocument'
import { typstPackageSpec } from '../typst/typstPackages'

const slides = [
  { question: '$2+2$', correction: '$4$' },
  { question: '$3\\times 4$', correction: '$12$' },
  { question: 'Le double de 8', correction: '16' },
]

describe('buildSlidesDocument', () => {
  it('utilise la réponse explicite dans le récapitulatif, sans modifier la correction', () => {
    const code = buildSlidesDocument([
      { question: 'Calculer.', correction: 'Calcul détaillé.', shortAnswer: '$42$' },
    ], { ...defaultSlidesDocumentOptions, recapAnswers: true })
    expect(code).toContain('Calcul détaillé.')
    expect(code).toContain('$42$')
  })

  it('génère une page 16/9 par question, puis les corrections', () => {
    const code = buildSlidesDocument(slides)
    expect(code).toContain('#set page(paper: "presentation-16-9"')
    expect(code).toContain('#let diapo-1-question = [\n  $2 + 2$\n]')
    expect(code).toContain('#let diapo-1-correction = [\n  $4$\n]')
    expect(code).toContain('#let diapo-3-question = [\n  Le double de 8\n]')
    // toutes les questions dans l'ordre, puis toutes les corrections
    const pages = [...code.matchAll(/^#diapo\((\d+), diapo-\d+-(\w+),/gm)].map(
      (match) => `${match[1]}-${match[2]}`,
    )
    expect(pages).toEqual([
      '1-question',
      '2-question',
      '3-question',
      '1-correction',
      '2-correction',
      '3-correction',
    ])
    // une page par diapositive, précédées de la page de garde
    expect(code.match(/^#pagebreak\(\)$/gm)).toHaveLength(6)
  })

  it('intercale les corrections ou les supprime selon le contenu choisi', () => {
    const readPages = (code: string) =>
      [...code.matchAll(/^#diapo\((\d+), diapo-\d+-(\w+),/gm)].map(
        (match) => `${match[1]}-${match[2]}`,
      )
    expect(
      readPages(
        buildSlidesDocument(slides.slice(0, 2), {
          ...defaultSlidesDocumentOptions,
          content: 'alternees',
        }),
      ),
    ).toEqual(['1-question', '1-correction', '2-question', '2-correction'])
    expect(
      readPages(
        buildSlidesDocument(slides.slice(0, 2), {
          ...defaultSlidesDocumentOptions,
          content: 'questions',
        }),
      ),
    ).toEqual(['1-question', '2-question'])
    expect(
      readPages(
        buildSlidesDocument(slides.slice(0, 2), {
          ...defaultSlidesDocumentOptions,
          content: 'corrections',
        }),
      ),
    ).toEqual(['1-correction', '2-correction'])
  })

  it('émet le paquet breather et le pied de page selon les réglages', () => {
    const code = buildSlidesDocument(slides.slice(0, 1))
    expect(code).toContain(`#import "${typstPackageSpec('breather')}": breathe`)
    expect(code).toContain('#show: breathe')
    expect(code).toContain('#let pied-de-page = "MathALÉA - CC BY-SA"')
    const bare = buildSlidesDocument(slides.slice(0, 1), {
      ...defaultSlidesDocumentOptions,
      autoVerticalSpacing: false,
      footer: '',
    })
    expect(bare).not.toContain('breathe')
    expect(bare).toContain('#let pied-de-page = ""')
  })

  it('déplace le numéro quand le titre occupe le coin haut-gauche', () => {
    const code = buildSlidesDocument(slides.slice(0, 1))
    expect(code).toContain(
      '#let numero-en-haut = not (titre-en-haut and titre-position == "top-left")',
    )
    expect(code).toContain('place((if numero-en-haut { top } else { bottom }) + left')
  })

  it('réserve un bandeau pour le numéro et le titre, et ajuste le texte', () => {
    const code = buildSlidesDocument(slides.slice(0, 1))
    expect(code).toContain('#let ajustement-auto = true')
    expect(code).toContain(
      'inset: (top: bandeau(true), bottom: bandeau(false)),',
    )
    expect(code).toContain('align(aligne(alignement), ajuster(corps, taille-texte)))')
    const noFit = buildSlidesDocument(slides.slice(0, 1), {
      ...defaultSlidesDocumentOptions,
      autoFit: false,
    })
    expect(noFit).toContain('#let ajustement-auto = false')
  })

  it('ouvre toujours le diaporama par sa page de garde', () => {
    const code = buildSlidesDocument(slides.slice(0, 1))
    expect(code).toContain('#let garde-titre = "Calcul mental"')
    expect(code).toContain('#let garde-sous-titre = ""')
    // le sous-titre ne s'affiche que s'il est renseigné
    expect(code).toContain('#if garde-sous-titre.trim() != "" {')
    // la garde est bien la première page
    expect(
      code.indexOf('#garde(page-de-garde)') < code.indexOf('#diapo(1,'),
    ).toBe(true)
    expect(code).toContain('#garde(page-de-garde)\n#pagebreak()')

    const withSubtitle = buildSlidesDocument(slides.slice(0, 1), {
      ...defaultSlidesDocumentOptions,
      coverTitle: 'Course aux nombres',
      coverSubtitle: '6e B — vendredi',
    })
    expect(withSubtitle).toContain('#let garde-titre = "Course aux nombres"')
    expect(withSubtitle).toContain('#let garde-sous-titre = "6e B — vendredi"')
  })

  it('aligne le titre du bas et le pied de page sur une même ligne', () => {
    const code = buildSlidesDocument(slides.slice(0, 1), {
      ...defaultSlidesDocumentOptions,
      slideTitle: 'Thème',
      titlePosition: 'bottom-left',
      titleSize: 12,
    })
    // une seule taille pour les deux, et une seule ligne (grille du pied)
    expect(code).toContain('#let titre-taille = 12pt')
    expect(code).toContain('text(size: titre-taille, grid(columns: (1fr, 1fr, 1fr),')
    expect(code).toContain(
      '#let colonne-pied = if titre-en-bas and colonne-titre == 2 { 0 } else { 2 }',
    )
    // le titre ancré en bas n'est plus posé dans la diapositive
    expect(code).toContain('#if titre-en-haut {')
    expect(code).toContain('      top + (if titre-position.ends-with("left") { left }')
  })

  it('sépare la taille du texte des questions et des corrections', () => {
    const code = buildSlidesDocument(slides, {
      ...defaultSlidesDocumentOptions,
      questionFontSize: 44,
      correctionFontSize: 28,
    })
    expect(code).toContain('#let taille-questions = 44pt')
    expect(code).toContain('#let taille-corrections = 28pt')
    expect(code).toContain(
      '#let taille-texte = (if correction { taille-corrections } else { taille-questions }) * taille',
    )
  })

  it('réémet taille, alignement et zoom des figures relus dans le code', () => {
    const first = buildSlidesDocument(slides.slice(0, 2))
    expect(first).toContain('#let diapo-2-correction-taille = 1')
    expect(first).toContain('#let diapo-1-question-align = "center"')
    const edited = first
      .replace(
        '#let diapo-2-correction-taille = 1',
        '#let diapo-2-correction-taille = 0.8',
      )
      .replace(
        '#let diapo-1-question-align = "center"',
        '#let diapo-1-question-align = "top"',
      )
    const carryOver = harvestSlidesCarryOver(edited)
    expect(carryOver.slideScales).toEqual({ '2-correction': 0.8 })
    expect(carryOver.slideAligns).toMatchObject({ '1-question': 'top' })
    const regenerated = buildSlidesDocument(
      slides.slice(0, 2),
      defaultSlidesDocumentOptions,
      carryOver,
    )
    expect(regenerated).toContain('#let diapo-2-correction-taille = 0.8')
    expect(regenerated).toContain('#let diapo-1-question-align = "top"')
    expect(regenerated).toContain('#let diapo-1-question-taille = 1')
  })

  it("change d'alignement global même après une première génération (pas de figement par défaut)", () => {
    // aucune diapositive n'a été retouchée à la main : tout est encore à
    // l'alignement par défaut de cette première génération (« center »)
    const first = buildSlidesDocument(slides.slice(0, 2))
    expect(first).toContain('#let diapo-align-defaut = "center"')
    // en relisant ce code pour une régénération avec un nouveau défaut, ces
    // valeurs qui ne faisaient que reprendre l'ancien défaut ne doivent pas
    // être vues comme des surcharges à figer, sans quoi le nouveau réglage
    // global n'aurait plus aucun effet
    const carryOver = harvestSlidesCarryOver(first)
    expect(carryOver.slideAligns).toBeUndefined()
    const regenerated = buildSlidesDocument(
      slides.slice(0, 2),
      { ...defaultSlidesDocumentOptions, align: 'top' },
      carryOver,
    )
    expect(regenerated).toContain('#let diapo-1-question-align = "top"')
    expect(regenerated).toContain('#let diapo-2-correction-align = "top"')
    expect(regenerated).toContain('#let diapo-align-defaut = "top"')

    // une diapositive réglée à la main, elle, doit survivre au changement
    // du réglage global suivant
    const edited = regenerated.replace(
      '#let diapo-2-correction-align = "top"',
      '#let diapo-2-correction-align = "bottom"',
    )
    const carryOverWithOverride = harvestSlidesCarryOver(edited)
    expect(carryOverWithOverride.slideAligns).toEqual({
      '2-correction': 'bottom',
    })
    const regeneratedAgain = buildSlidesDocument(
      slides.slice(0, 2),
      { ...defaultSlidesDocumentOptions, align: 'center' },
      carryOverWithOverride,
    )
    // tout suit le nouveau défaut, sauf la diapositive réglée à la main
    expect(regeneratedAgain).toContain('#let diapo-1-question-align = "center"')
    expect(regeneratedAgain).toContain('#let diapo-2-correction-align = "bottom"')
  })

  it('respecte l’ordre et les diapositives masquées, et ajoute les nouvelles', () => {
    const code = buildSlidesDocument(slides, defaultSlidesDocumentOptions, {
      order: [3, 1],
      hidden: [2],
    })
    expect(code).toContain('#let diapos-masquees = (2,)')
    const pages = [...code.matchAll(/^#diapo\((\d+), diapo-\d+-question,/gm)]
    expect(pages.map((match) => match[1])).toEqual(['3', '1'])
    // la diapositive masquée reste déclarée : elle peut être réaffichée
    expect(code).toContain('#let diapo-2-question = [')

    // une question apparue depuis (nouvel exercice) est ajoutée à la fin
    const withNewSlide = buildSlidesDocument(
      [...slides, { question: 'Nouvelle', correction: '?' }],
      defaultSlidesDocumentOptions,
      harvestSlidesCarryOver(code),
    )
    const newPages = [
      ...withNewSlide.matchAll(/^#diapo\((\d+), diapo-\d+-question,/gm),
    ]
    expect(newPages.map((match) => match[1])).toEqual(['3', '1', '4'])
  })

  it("n'émet les helpers de figures que lorsqu'une figure est présente", () => {
    const plain = buildSlidesDocument([
      { question: 'Texte', correction: 'Rien' },
    ])
    expect(plain).not.toContain('mathalea-fit')
    expect(plain).not.toContain('#let fig-1')
    // le repère des boutons de l'aperçu est toujours défini
    expect(plain).toContain('#let mathalea-anchor(')
    const withFigure = buildSlidesDocument(
      [
        {
          question:
            '<div class="svgContainer"><svg width="100" height="50"><line x1="0" y1="0" x2="10" y2="10" /></svg></div>',
          correction: 'Rien',
        },
      ],
      { ...defaultSlidesDocumentOptions, figureZoom: 1.5 },
    )
    expect(withFigure).toContain('#let fig-1 = ')
    expect(withFigure).toContain('#let fig-1-zoom = 1.5')
    expect(withFigure).toContain('mathalea-fit')
  })

  it("place toutes les questions, puis chaque question suivie de sa correction", () => {
    const readPages = (code: string) =>
      [...code.matchAll(/^#diapo\((\d+), diapo-\d+-(\w+),/gm)].map(
        (match) => `${match[1]}-${match[2]}`,
      )
    expect(
      readPages(
        buildSlidesDocument(slides, {
          ...defaultSlidesDocumentOptions,
          content: 'toutes-questions-puis-alternees',
        }),
      ),
    ).toEqual([
      '1-question',
      '2-question',
      '3-question',
      '1-question',
      '1-correction',
      '2-question',
      '2-correction',
      '3-question',
      '3-correction',
    ])
  })

  it('affiche deux versions côte à côte quand le multivue est activé', () => {
    const code = buildSlidesDocument(
      [
        {
          question: '$2+2$',
          correction: '$4$',
          extraVersions: [{ question: '$3+3$', correction: '$6$' }],
        },
        { question: '$5+5$', correction: '$10$' },
      ],
      { ...defaultSlidesDocumentOptions, multivue: true },
    )
    // la diapositive multivue déclare une deuxième version...
    expect(code).toContain('#let diapo-1-question-v2 = [\n  $3 + 3$\n]')
    expect(code).toContain('#let diapo-1-correction-v2 = [\n  $6$\n]')
    // ...et sa page appelle diapo-multi avec les deux versions
    expect(code).toContain(
      '#diapo-multi(1, (diapo-1-question, diapo-1-question-v2), taille: diapo-1-question-taille, alignement: diapo-1-question-align)',
    )
    expect(code).toContain('#let diapo-multi(num, corps-liste')
    // la ligne du multivue occupe toute la hauteur (rows: (1fr,)) : sans
    // cela chaque cellule ne mesurerait que son contenu et l'alignement
    // vertical (haut/centre/bas) n'aurait rien à ajuster
    expect(code).toContain(
      'grid(columns: (1fr,) * corps-liste.len(), rows: (1fr,), gutter: 16pt,',
    )
    // la diapositive sans version supplémentaire reste une page simple
    expect(code).toContain(
      '#diapo(2, diapo-2-question, taille: diapo-2-question-taille, alignement: diapo-2-question-align)',
    )
  })

  it("n'émet pas diapo-multi quand aucune diapositive n'a de version supplémentaire", () => {
    const code = buildSlidesDocument(slides)
    expect(code).not.toContain('diapo-multi')
  })

  it("n'ajoute aucun récapitulatif par défaut", () => {
    const code = buildSlidesDocument(slides)
    expect(code).not.toContain('#recap(')
    expect(code).not.toContain('recap-taille')
  })

  it('ajoute en fin de document le récapitulatif de toutes les questions', () => {
    const code = buildSlidesDocument(slides, {
      ...defaultSlidesDocumentOptions,
      content: 'questions',
      recapQuestions: true,
      recapFontSize: 14,
      recapColumns: 3,
    })
    expect(code).toContain('#let recap-taille = 14pt')
    expect(code).toContain('#let recap-colonnes = 3')
    expect(code).toContain('#let recap-titre-questions = "Toutes les questions"')
    // le récapitulatif reprend les diapositives, dans leur ordre, et vient
    // après la dernière d'entre elles
    expect(code).toContain(
      '#recap(recap-titre-questions, (\n  (1, diapo-1-question),\n  (2, diapo-2-question),\n  (3, diapo-3-question),\n))',
    )
    expect(code.indexOf('#recap(')).toBeGreaterThan(
      code.indexOf('#diapo(3, diapo-3-question'),
    )
    // pas de récapitulatif des réponses tant qu'il n'est pas demandé
    expect(code).not.toContain('recap-titre-reponses')
    expect(code).not.toContain('recap-1-reponse')
  })

  it('réduit les réponses du récapitulatif à ce qui est mis en évidence', () => {
    const code = buildSlidesDocument(
      [
        {
          question: '$2+2$',
          correction:
            'On calcule : $2 + 2 = {\\color{#f15929}\\boldsymbol{4}}$.',
        },
        { question: 'Le double de 8', correction: 'Le double de 8 est 16.' },
      ],
      {
        ...defaultSlidesDocumentOptions,
        recapAnswers: true,
      },
    )
    // la correction mise en évidence est réduite à sa réponse...
    expect(code).toContain('#let recap-1-reponse = [')
    expect(code).not.toContain('#let recap-1-reponse = diapo-1-correction')
    expect(code).toMatch(
      /#let recap-1-reponse = \[\n {2}\$[^\n]*4[^\n]*\$\n\]/,
    )
    // ...celle qui n'en a aucune est reprise telle quelle, sans être
    // convertie une seconde fois
    expect(code).toContain(
      '#let recap-2-reponse = diapo-2-correction // aucune réponse mise en évidence',
    )
    expect(code).toContain(
      '#recap(recap-titre-reponses, (\n' +
        '  (1, recap-question-reponse(diapo-1-question, recap-1-reponse)),\n' +
        '  (2, recap-question-reponse(diapo-2-question, recap-2-reponse)),\n' +
        '))',
    )
    expect(code).toContain('#let recap-question-reponse(question, reponse) = [')
  })

  it('ne récapitule que les diapositives visibles, dans leur ordre', () => {
    const code = buildSlidesDocument(
      slides,
      { ...defaultSlidesDocumentOptions, recapQuestions: true },
      { order: [3, 1], hidden: [2] },
    )
    expect(code).toContain(
      '#recap(recap-titre-questions, (\n  (3, diapo-3-question),\n  (1, diapo-1-question),\n))',
    )
  })
})
