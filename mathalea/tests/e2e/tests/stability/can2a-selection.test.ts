import { describe, expect, it } from 'vitest'
import SujetCAN2023Seconde from '../../../../src/exercices/can/2e/can2a-2023'
import { context } from '../../../../src/modules/context'
import { htmlToTypst } from '../../../../src/components/setup/typst/latexToTypst'

describe('CAN Seconde 2023 : choix des questions', () => {
  it('respecte les numéros et leur ordre', () => {
    const exercice = new SujetCAN2023Seconde()
    exercice.sup2 = true
    exercice.sup = '2-1'
    exercice.nouvelleVersion()
    expect(exercice.nbQuestions).toBe(2)
    expect(exercice.listeQuestions).toHaveLength(2)
    expect(exercice.listeQuestions[0]).toContain('Écriture décimale')
    expect(exercice.listeQuestions[1]).toContain('\\times')
  })

  it('affiche le graphique pour la question 27 seule', () => {
    const exercice = new SujetCAN2023Seconde()
    exercice.sup2 = true
    exercice.sup = '27'
    exercice.nouvelleVersion()
    expect(exercice.listeQuestions).toHaveLength(1)
    expect(exercice.listeQuestions[0]).toContain('mathalea2d')
    expect(exercice.listeQuestions[0]).toContain('sur la droite')
    expect(exercice.listeCanEnonces[0]).toContain('mathalea2d')
  })

  it('affiche le script Python de la question 10 en Typst', () => {
    const previousContext = { isHtml: context.isHtml, isTypst: context.isTypst }
    context.isHtml = true
    context.isTypst = true
    try {
      const exercice = new SujetCAN2023Seconde()
      exercice.sup2 = true
      exercice.sup = '10'
      exercice.nouvelleVersion()
      const question = htmlToTypst(exercice.listeQuestions[0])
      expect(question).toContain('#box(stroke:')
      expect(question).toMatch(
        /#raw\("def calcul\(a(?:,b)?\) :\\n    return a[*,a-z0-9-]+"/,
      )
      expect(question).toContain('block: true, lang: "python"')
      expect(question).not.toContain('\\begin{array}')
    } finally {
      context.isHtml = previousContext.isHtml
      context.isTypst = previousContext.isTypst
    }
  })
})
