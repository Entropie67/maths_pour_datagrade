import { describe, expect, it } from 'vitest'
import seedrandom from 'seedrandom'
import TSA541 from '../../src/exercices/TSpe/TSA5-41'
import {
  progressiveCorrection,
  revealNextCorrection,
} from '../../src/components/shared/exercice/exerciceMathalea/exerciceMathaleaVueEleve/presentationalComponents/progressiveCorrection'
import { createList } from '../../src/lib/format/lists'
import { setOutputHtml } from '../../src/modules/context'

function parse(html: string) {
  const template = document.createElement('template')
  template.innerHTML = html
  return template.content
}

function list(items: string[]) {
  setOutputHtml()
  return createList({ style: 'alpha', items })
}

describe('Corrections progressives hors interactivité', () => {
  it('associe chaque correction à sa sous-question en conservant les listes imbriquées', () => {
    const question = 'Introduction.' + list(['Limites.', 'Dérivée.'])
    const correction = list([
      '<ul><li>En zéro.</li><li>À l’infini.</li></ul>',
      'Calcul de la dérivée.',
    ])
    const html = parse(progressiveCorrection(question, correction))
    const items = html.querySelectorAll('ol.alpha > li')
    expect(items).toHaveLength(2)
    expect(items[0].querySelector('details ul')?.children).toHaveLength(2)
    expect(items[0].textContent).not.toContain('Calcul de la dérivée.')
    expect(items[1].querySelector('details')?.textContent).toContain(
      'Calcul de la dérivée.',
    )
    expect(html.textContent).toContain('Introduction.')
    expect(html.querySelectorAll('details[open]')).toHaveLength(0)
    expect(html.querySelectorAll('details[hidden]')).toHaveLength(2)
    expect(html.querySelectorAll('summary .correction-ouvrir')).toHaveLength(0)
  })

  it('conserve les explications communes et la conclusion', () => {
    const html = parse(
      progressiveCorrection(
        list(['A.', 'B.']),
        'Explication.' + list(['Réponse A.', 'Réponse B.']) + 'Conclusion.',
        'Consigne de correction.',
      ),
    )
    const details = html.querySelectorAll('details')
    for (const item of details) {
      expect(item.textContent).toContain('Explication.')
      expect(item.textContent).toContain('Consigne de correction.')
    }
    expect(details[0].textContent).not.toContain('Conclusion.')
    expect(details[1].textContent).toContain('Conclusion.')
  })

  it.each([
    ['Question.', 'Réponse.'],
    [list(['A.', 'B.']), list(['Une seule réponse.'])],
    [list(['A.', 'B.']), '<ol class="roman"><li>A.</li><li>B.</li></ol>'],
    [list(['A.', 'B.']), '<div>' + list(['A.', 'B.']) + '</div>'],
  ])(
    'garde un volet unique quand le découpage est ambigu : %s',
    (question, correction) => {
      const html = parse(progressiveCorrection(question, correction))
      expect(html.querySelectorAll('details')).toHaveLength(1)
      const expected = document.createElement('div')
      expected.innerHTML = correction
      expect(html.querySelector('details > div')?.innerHTML).toBe(
        expected.innerHTML,
      )
    },
  )

  it('découpe les six sous-questions de TSA5-41 sans modifier son contenu', () => {
    setOutputHtml()
    const random = Math.random
    Math.random = seedrandom('corrections-progressives')
    try {
      const exercice = new TSA541()
      exercice.nouvelleVersion()
      const question = exercice.listeQuestions[0]
      const correction = exercice.listeCorrections[0]
      const html = parse(progressiveCorrection(question, correction))
      expect(html.querySelectorAll('ol.alpha > li > details')).toHaveLength(6)
      expect(exercice.listeQuestions[0]).toBe(question)
      expect(exercice.listeCorrections[0]).toBe(correction)
    } finally {
      Math.random = random
    }
  })

  it('avance dans l’ordre, garde les corrections repliées et signale la fin', () => {
    const root = document.createElement('div')
    root.innerHTML = progressiveCorrection(
      list(['A.', 'B.']),
      list(['Réponse A.', 'Réponse B.']),
    )
    const details = root.querySelectorAll('details')
    expect(revealNextCorrection(root)).toBe(true)
    expect(details[0].hidden).toBe(false)
    expect(details[0].open).toBe(true)
    expect(details[1].hidden).toBe(true)
    details[0].open = false
    expect(revealNextCorrection(root)).toBe(false)
    expect(details[0].open).toBe(false)
    expect(details[1].hidden).toBe(false)
    expect(details[1].open).toBe(true)
    expect(revealNextCorrection(root)).toBe(false)
  })

  it('ne crée pas de volet pour une correction vide', () => {
    expect(
      parse(progressiveCorrection('Question.', '')).querySelector('details'),
    ).toBeNull()
  })
})
