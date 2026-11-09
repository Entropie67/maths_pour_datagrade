import { afterEach, describe, expect, it } from 'vitest'
import { setOutputHtml, setOutputLatex } from '../../src/modules/context'
import FractionEtendue from '../../src/modules/FractionEtendue'
import {
  tableauSignesFonction,
  tableauSignesFacteurs,
  creerTableauHtml,
} from '../../src/lib/mathFonctions/etudeFonction'

describe('tableauSignesFacteurs', () => {
  afterEach(() => {
    setOutputHtml()
  })

  it('affiche les bornes et accepte des libelles directs', () => {
    setOutputLatex()

    const tableau = tableauSignesFacteurs(
      [
        {
          nom: 'x-1',
          fonction: (x: number) => x - 1,
          zero: 1,
        },
      ],
      -99,
      99,
      {
        borneInf: '-\\infty',
        borneSup: '+\\infty',
      },
    )

    expect(tableau).toContain('$-\\infty$')
    expect(tableau).toContain('$+\\infty$')
    expect(tableau).toContain('$1$')
    expect(tableau).not.toContain('$-99$')
    expect(tableau).not.toContain('$99$')
  })

  it("peut conserver l'ancien affichage sans bornes", () => {
    setOutputLatex()

    const tableau = tableauSignesFacteurs(
      [
        {
          nom: 'x',
          fonction: (x: number) => x,
          zero: 0,
        },
      ],
      -10,
      10,
      { afficherBornes: false },
    )

    expect(tableau).toContain('$0$')
    expect(tableau).not.toContain('$-10$')
    expect(tableau).not.toContain('$10$')
  })

  it('applique des libelles directs sur des bornes fractionnaires', () => {
    setOutputLatex()

    const tableau = tableauSignesFacteurs(
      [
        {
          nom: 'x',
          fonction: (x: number) => x,
          zero: 0,
        },
      ],
      new FractionEtendue(-1, 2),
      new FractionEtendue(1, 2),
      {
        fractionTex: true,
        borneInf: 'a',
        borneSup: 'b',
      },
    )

    expect(tableau).toContain('$a$')
    expect(tableau).toContain('$b$')
    expect(tableau).toContain('$0$')
  })

  it("augmente la hauteur de l'entete quand une fraction est affichee", () => {
    setOutputLatex()

    const tableau = tableauSignesFacteurs(
      [
        {
          nom: '5x-1',
          fonction: (x: number) => 5 * x - 1,
          zero: new FractionEtendue(1, 5),
        },
      ],
      -1,
      1,
      { fractionTex: true },
    )

    expect(tableau).toMatch(/\$x\$\s*\/\s*2/)
    expect(tableau).toContain('\\dfrac{1}{5}')
  })

  it('elargit automatiquement la premiere colonne pour les libelles longs', () => {
    setOutputLatex()

    const tableau = tableauSignesFacteurs(
      [
        {
          nom: '-10x+2',
          fonction: (x: number) => -10 * x + 2,
          zero: new FractionEtendue(1, 5),
        },
      ],
      -1,
      1,
      { fractionTex: true },
    )
    const lgt = Number(tableau.match(/\\tkzTabInit\[lgt=([0-9.]+)/)?.[1])

    expect(lgt).toBeGreaterThan(3)
  })
})

describe('hauteur des tableaux de signes de fonctions', () => {
  afterEach(() => setOutputHtml())

  it.each(['\\frac', '\\dfrac'])(
    'laisse de la place aux fractions %s introduites par les substituts',
    (commande) => {
      setOutputLatex()
      const tableau = tableauSignesFonction((x) => 4 * x + 9, -99, 99, {
        zeros: [new FractionEtendue(-9, 4)],
        substituts: [
          { antVal: -99, antTex: '-\\infty' },
          { antVal: 99, antTex: '+\\infty' },
          { antVal: -2.25, antTex: `-${commande}{9}{4}` },
        ],
      })

      expect(tableau).toMatch(/\$x\$\s*\/\s*2,/)
      expect(tableau).toContain(`-${commande}{9}{4}`)
    },
  )

  it('adapte aussi la hauteur aux fractions exactes sans substituts', () => {
    setOutputLatex()
    const tableau = tableauSignesFonction((x) => 4 * x + 9, -99, 99, {
      zeros: [new FractionEtendue(-9, 4)],
      fractionTex: true,
    })

    expect(tableau).toMatch(/\$x\$\s*\/\s*2,/)
    expect(tableau).toContain('\\dfrac{9}{4}')
  })

  it('conserve la hauteur habituelle pour les entiers', () => {
    setOutputLatex()
    const tableau = tableauSignesFonction((x) => x - 1, -99, 99, {
      zeros: [new FractionEtendue(1, 1)],
      fractionTex: true,
    })

    expect(tableau).toMatch(/\$x\$\s*\/\s*1\.5,/)
  })

  it('augmente aussi la hauteur du tableau HTML avec une fraction', () => {
    setOutputHtml()
    const tableau = (antTex: string) =>
      tableauSignesFonction((x) => 4 * x + 9, -99, 99, {
        zeros: [new FractionEtendue(-9, 4)],
        substituts: [{ antVal: -2.25, antTex }],
      })
    const hauteur = (html: string) => {
      const element = document.createElement('div')
      element.innerHTML = html
      return Number(element.querySelector('svg')?.getAttribute('height'))
    }

    expect(hauteur(tableau('-\\dfrac{9}{4}'))).toBeGreaterThan(
      hauteur(tableau('-2{,}25')),
    )
  })
})

describe('couleur des tableaux de signes', () => {
  afterEach(() => setOutputHtml())

  it('colore les traits et les textes HTML', () => {
    setOutputHtml()
    const objets = creerTableauHtml({
      tabInit: [
        [
          ['x', 1.5, 10],
          ['f(x)', 1.5, 10],
        ],
        [-1, 10, 1, 10],
      ],
      tabLines: [['Line', 30, '', 10, '+', 10, '', 10]],
      espcl: 2.1,
      deltacl: 0.8,
      lgt: 3,
      couleur: '#F15929',
    })
    expect(objets.length).toBeGreaterThan(0)
    for (const objet of objets) {
      expect(Array.isArray(objet)).toBe(false)
      if (Array.isArray(objet)) continue
      if ('col' in objet) expect(objet.col).toBe('#F15929')
      else expect(objet.color[0]).toBe('#F15929')
    }
  })

  it('transmet la couleur au tableau LaTeX sans changer les valeurs', () => {
    setOutputLatex()
    const normal = tableauSignesFonction((x) => x, -1, 1, {})
    const orange = tableauSignesFonction((x) => x, -1, 1, {
      couleur: '#F15929',
    })
    expect(orange).toContain(normal)
    expect(orange).toContain('\\color')
    expect(orange).toContain('red,241;green,89;blue,41')
  })
})
