import { describe, expect, it } from 'vitest'
import {
  buildFlashcardsDocument,
  defaultFlashcardsDocumentOptions,
  harvestFlashcardsCarryOver,
} from './buildFlashcardsDocument'

describe('buildFlashcardsDocument', () => {
  it('génère une planche de questions puis une planche de réponses en miroir', () => {
    const code = buildFlashcardsDocument(
      [
        { front: '$2+2$', back: '$4$' },
        { front: '$3\\times 4$', back: '$12$' },
        { front: 'Le double de 8', back: '16' },
      ],
      { ...defaultFlashcardsDocumentOptions, columns: 2, rows: 2 },
    )
    expect(code).toContain('#set page(paper: "a4"')
    expect(code).toContain('#let cartes-par-ligne = 2')
    expect(code).toContain('#let lignes-par-page = 2')
    expect(code).toContain('#let carte-1-recto = [\n  $2 + 2$\n]')
    expect(code).toContain('#let carte-1-verso = [\n  $4$\n]')
    expect(code).toContain('#let carte-3-recto = [\n  Le double de 8\n]')
    // planche des questions : cartes dans l'ordre de lecture
    expect(code).toContain(
      '#planche(\n  carte(1, carte-1-recto, taille: carte-1-recto-taille),\n  carte(2, carte-2-recto, taille: carte-2-recto-taille),\n  carte(3, carte-3-recto, taille: carte-3-recto-taille),\n  carte(none, []),\n)',
    )
    // planche des réponses : chaque ligne en ordre inverse (miroir)
    expect(code).toContain(
      '#planche(\n  carte(2, carte-2-verso, taille: carte-2-verso-taille, verso: true),\n  carte(1, carte-1-verso, taille: carte-1-verso-taille, verso: true),\n  carte(none, []),\n  carte(3, carte-3-verso, taille: carte-3-verso-taille, verso: true),\n)',
    )
  })

  it('décale les numéros affichés en conservant les repères des cartes', () => {
    const code = buildFlashcardsDocument(
      [{ front: 'Question', back: 'Réponse' }],
      { ...defaultFlashcardsDocumentOptions, startNumber: 21 },
      { cardScales: { '1-recto': 1.2 } },
    )
    expect(code).toContain('#let premier-numero = 21')
    expect(code).toContain('str(num + premier-numero - 1)')
    expect(code).toContain('#let carte-1-recto-taille = 1.2')
    expect(code).toContain('carte(1, carte-1-recto,')
    expect(code).toContain('carte(1, carte-1-verso,')
  })

  it.each([undefined, NaN, Infinity, 0, -3])(
    'utilise 1 pour un premier numéro invalide (%s)',
    (startNumber) => {
      const code = buildFlashcardsDocument([], {
        ...defaultFlashcardsDocumentOptions,
        startNumber: startNumber as number,
      })
      expect(code).toContain('#let premier-numero = 1')
    },
  )

  it('répartit les cartes sur plusieurs planches quand la page est pleine', () => {
    const cards = Array.from({ length: 5 }, (_, i) => ({
      front: `Question ${i + 1}`,
      back: `Réponse ${i + 1}`,
    }))
    const code = buildFlashcardsDocument(cards, {
      ...defaultFlashcardsDocumentOptions,
      columns: 2,
      rows: 2,
    })
    expect(code).toContain('// ----- Planche 1 : questions -----')
    expect(code).toContain('// ----- Planche 2 : questions -----')
    expect(code).toContain('carte(5, carte-5-recto, taille: carte-5-recto-taille)')
    // la 2e planche de réponses complète sa ligne avec une carte vide
    expect(code).toContain(
      '#planche(\n  carte(none, []),\n  carte(5, carte-5-verso, taille: carte-5-verso-taille, verso: true),',
    )
  })

  it('active breather et applique l’interligne réglé', () => {
    const code = buildFlashcardsDocument([{ front: '$1/2$', back: '$3/4$' }], {
      ...defaultFlashcardsDocumentOptions,
      lineSpacing: 1.1,
    })
    // le paquet breather écarte les lignes aux fractions « display »
    expect(code).toContain('@preview/breather')
    expect(code).toContain('#show: breathe')
    expect(code).toContain('#let interligne = 1.1em')
    expect(code).toContain('#set par(leading: interligne)')
  })

  it('sépare la taille du texte des questions et des réponses', () => {
    const code = buildFlashcardsDocument([{ front: 'Q', back: 'R' }], {
      ...defaultFlashcardsDocumentOptions,
      questionFontSize: 16,
      answerFontSize: 11,
    })
    expect(code).toContain('#let taille-questions = 16pt')
    expect(code).toContain('#let taille-reponses = 11pt')
    expect(code).toContain(
      '#set text(size: (if verso { taille-reponses } else { taille-questions }) * taille)',
    )
  })

  it('règle l’épaisseur des traits de découpe entre les cartes', () => {
    const code = buildFlashcardsDocument([{ front: 'Q', back: 'R' }], {
      ...defaultFlashcardsDocumentOptions,
      separatorThickness: 1.5,
    })
    expect(code).toContain('#let epaisseur-traits = 1.5pt')
    expect(code).toContain(
      'stroke: (thickness: epaisseur-traits, paint: luma(40%), dash: "dashed")',
    )
  })

  it('réémet les facteurs de taille par carte relus dans le code (carry-over)', () => {
    const first = buildFlashcardsDocument([
      { front: 'Q1', back: 'R1' },
      { front: 'Q2', back: 'R2' },
    ])
    expect(first).toContain('#let carte-2-verso-taille = 1')
    const edited = first.replace(
      '#let carte-2-verso-taille = 1',
      '#let carte-2-verso-taille = 0.8',
    )
    const carryOver = harvestFlashcardsCarryOver(edited)
    expect(carryOver).toEqual({ cardScales: { '2-verso': 0.8 } })
    const regenerated = buildFlashcardsDocument(
      [
        { front: 'Q1', back: 'R1' },
        { front: 'Q2', back: 'R2' },
      ],
      defaultFlashcardsDocumentOptions,
      carryOver,
    )
    expect(regenerated).toContain('#let carte-2-verso-taille = 0.8')
    expect(regenerated).toContain('#let carte-1-recto-taille = 1')
  })

  it('réémet le zoom des figures relu dans le code (carry-over)', () => {
    const cardWithFigure = {
      front:
        '<div class="svgContainer"><svg width="100" height="50"><line x1="0" y1="0" x2="10" y2="10" /></svg></div>',
      back: 'Rien',
    }
    const first = buildFlashcardsDocument([cardWithFigure])
    expect(first).toContain('#let fig-1-zoom = 1')
    const edited = first.replace(
      '#let fig-1-zoom = 1',
      '#let fig-1-zoom = 1.5',
    )
    const carryOver = harvestFlashcardsCarryOver(edited)
    expect(carryOver).toEqual({ figureZooms: { 1: 1.5 } })
    const regenerated = buildFlashcardsDocument(
      [cardWithFigure],
      defaultFlashcardsDocumentOptions,
      carryOver,
    )
    expect(regenerated).toContain('#let fig-1-zoom = 1.5')
  })

  it("n'émet les helpers de figures que lorsqu'une figure est présente", () => {
    const plain = buildFlashcardsDocument([{ front: 'Texte', back: 'Rien' }])
    expect(plain).not.toContain('mathalea-fit')
    expect(plain).not.toContain('#let fig-1')
    // le repère des boutons +/− de l'aperçu est toujours défini
    expect(plain).toContain('#let mathalea-anchor(')
    const withFigure = buildFlashcardsDocument([
      {
        front:
          '<div class="svgContainer"><svg width="100" height="50"><line x1="0" y1="0" x2="10" y2="10" /></svg></div>',
        back: 'Rien',
      },
    ])
    expect(withFigure).toContain('#let fig-1 = ')
    expect(withFigure).toContain('mathalea-fit')
  })
})
