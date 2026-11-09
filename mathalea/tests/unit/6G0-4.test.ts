import { beforeEach, describe, expect, it } from 'vitest'
import CliqueFigure from '../../src/exercices/6e/6G0-4'
import { setOutputHtml } from '../../src/modules/context'

describe('6G0-4 — activation des figures cliquables', () => {
  beforeEach(() => {
    setOutputHtml()
    document.body.innerHTML = ''
  })

  it('active les clics dès l’affichage de chaque question interactive', () => {
    const exercice = new CliqueFigure()
    exercice.numeroExercice = 0
    exercice.interactif = true
    exercice.nouvelleVersion()
    document.body.innerHTML = exercice.listeQuestions.join('')

    expect(document.querySelectorAll('clique-figure')).toHaveLength(
      exercice.nbQuestions,
    )
    for (let i = 0; i < exercice.nbQuestions; i++) {
      const host = document.getElementById(`clique-figureEx0Q${i}`)!
      expect(JSON.parse(host.getAttribute('figures')!)).toEqual(
        exercice.cliqueFiguresArray![i],
      )
      for (const figure of exercice.cliqueFiguresArray![i]) {
        expect(document.getElementById(figure.id)?.style.cursor).toBe('pointer')
      }
    }
  })

  it('conserve des figures non interactives hors du mode interactif', () => {
    const exercice = new CliqueFigure()
    exercice.numeroExercice = 0
    exercice.interactif = false
    exercice.nouvelleVersion()
    document.body.innerHTML = exercice.listeQuestions.join('')

    expect(document.querySelector('clique-figure')).toBeNull()
    for (const figures of exercice.cliqueFiguresArray!) {
      for (const figure of figures) {
        expect(document.getElementById(figure.id)?.style.cursor).toBe('')
      }
    }
  })
})
