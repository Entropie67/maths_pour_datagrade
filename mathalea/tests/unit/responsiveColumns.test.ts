import { afterEach, describe, expect, it } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import MetaExercice from '../../src/exercices/MetaExerciceCan'
import Geometry from '../../src/exercices/6e/6G0-5'
import { deuxColonnesResp } from '../../src/lib/format/miseEnPage'
import {
  context,
  setOutputHtml,
  setOutputLatex,
} from '../../src/modules/context'

function generate(Source: typeof Exercice, numero = 3) {
  setOutputHtml()
  const meta = new MetaExercice([Source, Source])
  meta.numeroExercice = numero
  meta.seed = 'colonnes'
  meta.sup2 = '1-2'
  meta.nouvelleVersion()
  return meta
}

afterEach(() => setOutputHtml())

describe('colonnes responsives', () => {
  it('ne génère ni identifiant ambigu ni style dans les énoncés sans eleId', () => {
    setOutputHtml()
    for (const options of [undefined, 60, {}, { eleId: '' }]) {
      const html = deuxColonnesResp('Gauche', 'Droite', options)
      expect(html).not.toContain('undefined')
      expect(html).not.toContain('id=')
      expect(html).not.toContain('<style>')
      expect(html).toContain("class='cols-responsive'")
    }
  })

  it('conserve les identifiants explicites et les largeurs HTML et LaTeX', () => {
    setOutputHtml()
    const options = { eleId: 's-3_1', largeur1: 60, widthmincol1: '500px' }
    const html = deuxColonnesResp('Gauche', 'Droite', options)
    expect(html).toContain("id='cols-responsive1-s-3_1'")
    expect(html).toContain("id='cols-responsive2-s-3_1'")
    expect(html).toContain('min-width:500px')
    expect(html).toContain("data-largeur1='60'")
    setOutputLatex()
    const latex = deuxColonnesResp('Gauche', 'Droite', options)
    expect(latex).toContain('{0.6\\linewidth}')
    expect(latex).toContain('{0.4\\linewidth}')
    expect(latex).not.toContain('<div')
  })

  it('transmet le numéro hôte aux arguments de génération des sous-exercices', () => {
    class WithNumber extends Exercice {
      nouvelleVersion(numeroExercice?: number) {
        this.listeQuestions[0] = `Exercice ${numeroExercice}.`
        this.listeCorrections[0] = 'Correction.'
      }
    }
    expect(generate(WithNumber).listeQuestions).toEqual([
      'Exercice 3.',
      'Exercice 3.',
    ])
  })

  it('distingue les colonnes et cible le bon élément dans chaque callback hébergé', () => {
    const first = generate(Geometry)
    const second = generate(Geometry, 4)
    const root = document.createElement('div')
    root.innerHTML = [
      ...first.listeQuestions,
      ...first.listeCorrections,
      ...second.listeQuestions,
      ...second.listeCorrections,
    ].join('')
    const ids = [...root.querySelectorAll('[id^="cols-responsive"]')].map(
      (el) => el.id,
    )
    expect(ids).toHaveLength(16)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.join(' ')).not.toContain('undefined')
    for (const numero of [3, 4]) {
      for (const index of [0, 1]) {
        for (const prefix of ['', 's-']) {
          const id = `cols-responsive1-${prefix}${numero}_${index}`
          expect(root.querySelector(`[id="${id}"]`)).not.toBeNull()
          expect(root.innerHTML).toContain(
            `&quot;targetId&quot;:&quot;${id}&quot;`,
          )
        }
      }
    }
    expect(context.isHtml).toBe(true)
  })
})
