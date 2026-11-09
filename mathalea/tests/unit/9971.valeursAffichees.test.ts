import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Vocabulaire from '../../src/exercices/3e/3A10'
import Primalite from '../../src/exercices/5e/5N1L'
import Message from '../../src/exercices/6e/6N3autoD-5'
import CanCM2 from '../../src/exercices/can/c3/canc3a-2023'
import Produit from '../../src/exercices/can/can6a-2025/can6a-2025-Q25'
import Encodeur from '../../src/exercices/profs/P020'
import EncodeurHistorique from '../../src/exercices/profs/P020-old'
import { context } from '../../src/modules/context'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

const valeursInvalides = /undefined|NaN|\[object Object\]/

describe('Ticket 9971 : valeurs affichées', () => {
  beforeEach(() => {
    window.notify = vi.fn()
    window.notifyLocal = vi.fn()
    context.isHtml = true
    context.isAmc = false
  })

  it('3A10 : répéter le vocabulaire lorsque des questions sont rejetées', () => {
    const ex = new Vocabulaire()
    Object.assign(ex, { sup: '1', sup2: '1', sup3: 1, sup4: 11 })
    seedrandom('revue-39-a', { global: true })
    ex.nouvelleVersion()
    expect(ex.listeQuestions).toHaveLength(5)
    expect(ex.listeQuestions.join('')).not.toMatch(valeursInvalides)
    expect(ex.listeCorrections.join('')).not.toMatch(valeursInvalides)
    expect(ex.listeQuestions.every((q) => q.includes('reste'))).toBe(true)
  })

  it('5N1L : expliquer aussi la primalité de 2 et de 3 sans liste vide', () => {
    const petitsPremiers = new Set<string>()
    for (let i = 0; i < 40; i++) {
      const ex = new Primalite()
      seedrandom(`revue-${i}-a`, { global: true })
      ex.nouvelleVersion()
      expect(ex.listeCorrections.join('')).not.toMatch(valeursInvalides)
      ex.listeQuestions.forEach((q, j) => {
        if (/^\s*\$?[23]\$?(?:<|$)/.test(q)) {
          petitsPremiers.add(q.replaceAll('$', '').trim()[0])
          expect(ex.listeCorrections[j]).toContain('exactement deux diviseurs')
        }
      })
    }
    expect([...petitsPremiers].sort()).toEqual(['2', '3'])
  })

  for (const Classe of [Encodeur, EncodeurHistorique]) {
    for (const sup2 of [false, true]) {
      it(`${Classe.name} : coder les chiffres et conserver la grille (sup2=${sup2})`, () => {
        const ex = new Classe()
        Object.assign(ex, {
          sup: '1-2/mathématiques/1-2',
          sup2,
          numeroExercice: 0,
        })
        seedrandom('revue-14-a', { global: true })
        ex.nouvelleVersion()
        expect(ex.listeQuestions).toHaveLength(3)
        expect(ex.listeQuestions.join('')).not.toMatch(valeursInvalides)
        const codes = ex.listeQuestions.map((q) =>
          [...q.split('suivant :<br>')[1].matchAll(/\$(\d+)\$/g)].map(
            (m) => m[1],
          ),
        )
        expect(codes[0]).toHaveLength(3)
        expect(codes[1]).toHaveLength(13)
        if (!sup2) expect(codes[2]).toEqual(codes[0])
      })
    }
  }

  for (const sup3 of [1, 2, 3]) {
    it(`6N3autoD-5 : coder tous les caractères des phrases (s3=${sup3})`, () => {
      for (let i = 0; i < 35; i++) {
        const ex = new Message()
        Object.assign(ex, { sup3, numeroExercice: 0 })
        seedrandom(`revue-${i}-a`, { global: true })
        ex.nouvelleVersion()
        expect(ex.listeQuestions.join('')).not.toMatch(valeursInvalides)
      }
    })
  }

  it('b5324 : initialiser la question et permettre une nouvelle version', () => {
    const ex = new Produit()
    ex.numeroExercice = 0
    seedrandom('9971', { global: true })
    for (let i = 0; i < 2; i++) {
      ex.nouvelleVersion()
      expect(ex.question).not.toMatch(valeursInvalides)
      expect(ex.question).toContain('Cocher le résultat du calcul')
      expect(ex.question.match(/Cocher le résultat/g)).toHaveLength(1)
    }
  })

  for (const interactif of [false, true]) {
    it(`canc3a-2023 : afficher le suffixe de la question 11 (interactif=${interactif})`, () => {
      for (let i = 0; i < 10; i++) {
        const ex = new CanCM2()
        Object.assign(ex, {
          sup: '11',
          sup2: false,
          nbQuestions: 1,
          interactif,
          numeroExercice: 0,
        })
        seedrandom(`9971-${i}`, { global: true })
        ex.nouvelleVersion()
        expect(ex.listeQuestions).toHaveLength(1)
        expect(ex.listeQuestions.join('')).not.toMatch(valeursInvalides)
      }
    })
  }
})
