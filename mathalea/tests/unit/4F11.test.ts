import { describe, expect, it } from 'vitest'
import RepresenterGrandeurParGraphique from '../../src/exercices/4e/4F11'
import { context } from '../../src/modules/context'

describe('4F11', () => {
  it.each([1, 2, 3, 4, 5, 6])(
    'génère la situation %s avec le traceur de courbe',
    (type) => {
      const exercice = new RepresenterGrandeurParGraphique()
      exercice.numeroExercice = 0
      exercice.nbQuestions = 1
      exercice.sup = String(type)
      exercice.interactif = true

      exercice.nouvelleVersion()

      expect(exercice.listeQuestions).toHaveLength(1)
      expect(exercice.listeQuestions[0]).toContain('<traceur-de-courbe')
      expect(exercice.listeQuestions[0]).toContain('join-points="true"')
      expect(exercice.listeQuestions[0]).toContain('comprises entre')
      expect(exercice.listeQuestions[0]).toContain('resultatCheckEx0Q0')
      expect(exercice.listeQuestions[0]).toContain('feedbackEx0Q0')
      expect(exercice.listeCorrections[0]).toContain('show-expected="true"')
      expect(exercice.listeCorrections[0]).toContain(
        'animate-correction="true"',
      )
      expect(exercice.listeCorrections[0]).toContain(
        'action="traceur-de-courbe-correction-animee"',
      )
      expect(exercice.listeCorrections[0]).toContain(
        'animate-correction="true"',
      )
      expect(exercice.listeCorrections[0]).toContain('<mathalea-dom-ready')
      expect(exercice.listeCorrections[0]).toContain(
        'traceur-de-courbe-correction-animee',
      )
      expect(exercice.autoCorrection[0]?.formatInteractif).toBe(
        'traceur-de-courbe',
      )
      expect(typeof exercice.autoCorrection[0]?.valeur?.reponse?.value).toBe(
        'function',
      )
    },
  )

  it('préremplit le tableau de la correction sans champs interactifs', () => {
    const exercice = new RepresenterGrandeurParGraphique()
    exercice.numeroExercice = 0
    exercice.nbQuestions = 1
    exercice.sup = '1'
    exercice.interactif = true
    exercice.nouvelleVersion()

    document.body.innerHTML = exercice.listeCorrections[0]

    const correction = document.querySelector(
      'traceur-de-courbe[show-expected="true"]',
    )
    expect(correction?.querySelectorAll('math-field')).toHaveLength(0)
    expect(correction?.querySelectorAll('circle')).toHaveLength(0)
    expect(correction?.querySelectorAll('g.curve-tracer-point')).toHaveLength(6)
    expect(
      correction?.querySelectorAll('line.curve-tracer-grid').length,
    ).toBeGreaterThan(4)
    expect(
      correction?.querySelectorAll('text.curve-tracer-label').length,
    ).toBeGreaterThan(4)
    expect(correction?.querySelector('svg')?.getAttribute('viewBox')).toBe(
      '0 0 500 350',
    )
    expect(
      correction?.querySelector('tableau-mathlive')?.textContent,
    ).toContain('36')
    expect(correction?.querySelector('.katex')).not.toBeNull()
    expect(correction?.innerHTML).not.toContain('$1,2$')
    expect(
      correction?.querySelector('annotation[encoding="application/x-tex"]')
        ?.textContent,
    ).not.toContain('1.2')
    correction?.setAttribute('join-points', 'false')
    expect(correction?.querySelector('.curve-tracer-student')).toBeNull()
  })

  it('arrondit au centième les valeurs liées à pi dans la correction', () => {
    const exercice = new RepresenterGrandeurParGraphique()
    exercice.numeroExercice = 0
    exercice.nbQuestions = 1
    exercice.sup = '3'
    exercice.interactif = true
    exercice.nouvelleVersion()

    document.body.innerHTML = exercice.listeCorrections[0]

    const table = document.querySelector(
      'traceur-de-courbe[show-expected="true"] tableau-mathlive',
    )
    const latexSources = Array.from(
      table?.querySelectorAll('annotation[encoding="application/x-tex"]') ?? [],
      (annotation) => annotation.textContent,
    )
    expect(latexSources).toContain('{9,42}')
    expect(latexSources).not.toContain('{9,424}')
  })

  it('laisse au professeur le choix de tracer la ligne brisée', () => {
    const exercice = new RepresenterGrandeurParGraphique()
    exercice.numeroExercice = 0
    exercice.nbQuestions = 1
    exercice.sup = '1'
    exercice.sup2 = false
    exercice.nouvelleVersion()

    expect(exercice.listeQuestions[0]).toContain('join-points="false"')
    expect(exercice.listeQuestions[0]).not.toContain('Tracer la ligne brisée')
  })

  it('ne produit pas de HTML et élargit les cellules en sortie LaTeX', () => {
    const previousIsHtml = context.isHtml
    const previousIsTypst = context.isTypst
    try {
      context.isHtml = false
      context.isTypst = false
      const exercice = new RepresenterGrandeurParGraphique()
      exercice.numeroExercice = 0
      exercice.nbQuestions = 1
      exercice.sup = '5'
      exercice.nouvelleVersion()

      expect(exercice.listeQuestions[0]).not.toContain('<span')
      expect(exercice.listeQuestions[0]).not.toContain('<div')
      expect(exercice.listeQuestions[0]).not.toContain('feedbackEx')
      expect(exercice.listeQuestions[0]).toContain('\\rule{1.4cm}{0pt}')
      expect(exercice.listeCorrections[0]).toContain('ytick distance=10')
      expect(exercice.listeCorrections[0]).toContain('minor y tick num=1')
    } finally {
      context.isHtml = previousIsHtml
      context.isTypst = previousIsTypst
    }
  })

  it('produit en Typst une table large et le même repère SVG statique', () => {
    const previousIsHtml = context.isHtml
    const previousIsTypst = context.isTypst
    try {
      context.isHtml = true
      context.isTypst = true
      const exercice = new RepresenterGrandeurParGraphique()
      exercice.numeroExercice = 0
      exercice.nbQuestions = 1
      exercice.sup = '1'
      exercice.nouvelleVersion()

      const output = exercice.listeQuestions[0]
      expect(output).toContain(
        '#table(columns: (auto, 1.4cm, 1.4cm, 1.4cm, 1.4cm, 1.4cm, 1.4cm)',
      )
      expect(output).toContain('#image(bytes("<svg')
      expect(output).toContain('curve-tracer-grid')
      expect(output).toContain('curve-tracer-axis')
      expect(output).not.toContain('Repère :')
      expect(output).not.toContain('<span')
      expect(output).not.toContain('feedbackEx')
      expect(exercice.listeCorrections[0]).toContain('curve-tracer-expected')
    } finally {
      context.isHtml = previousIsHtml
      context.isTypst = previousIsTypst
    }
  })
})
