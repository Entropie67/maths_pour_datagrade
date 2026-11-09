import seedrandom from 'seedrandom'
import { afterEach, describe, expect, it } from 'vitest'
import {
  PyramideNombresElement,
  renderLatexPyramide,
  renderTypstPyramide,
} from '../../src/lib/customElements/PyramideNombresElement'
import {
  appliqueOperation,
  bornesValeurMax,
  deduitDroite,
  deduitGauche,
  generePyramide,
  nbCasesDeLEtage,
  operationsPossibles,
  resoutPyramide,
  type ModePyramide,
  type OperationPyramide,
  type PyramideNombres,
} from '../../src/lib/outils/pyramideNombres'
import { context, setOutputHtml } from '../../src/modules/context'

/** Une pyramide écrite à la main : 3 étages, valeurs de 2 à 12. */
function pyramideDeReference(): PyramideNombres {
  return {
    nbEtages: 3,
    valeurs: [[2, 3, 4], [6, 12], [72]],
    operations: [['×', '×'], ['×'], []],
    donnees: [[true, true, true], [false, false], [false]],
  }
}

/** Vrai quand chaque case est bien le résultat de l'opération du dessous. */
function estCoherente(pyramide: PyramideNombres): boolean {
  const { nbEtages, valeurs, operations } = pyramide
  for (let etage = 0; etage < nbEtages - 1; etage++) {
    for (let index = 0; index < nbCasesDeLEtage(etage, nbEtages) - 1; index++) {
      const attendu = appliqueOperation(
        valeurs[etage][index],
        valeurs[etage][index + 1],
        operations[etage][index],
      )
      if (attendu !== valeurs[etage + 1][index]) return false
    }
  }
  return true
}

function toutesLesValeurs(pyramide: PyramideNombres): number[] {
  return pyramide.valeurs.flat()
}

afterEach(() => {
  setOutputHtml()
  context.isTypst = false
  document.body.innerHTML = ''
  seedrandom(undefined, { global: true })
})

describe('opérations d’une pyramide de nombres', () => {
  it('n’accepte une division que lorsqu’elle tombe juste', () => {
    expect(appliqueOperation(12, 3, '÷')).toBe(4)
    expect(appliqueOperation(12, 5, '÷')).toBeNull()
    expect(appliqueOperation(12, 0, '÷')).toBeNull()
  })

  it('écarte les opérations qui sortent des nombres attendus', () => {
    // Sans nombres négatifs, une différence négative est refusée.
    expect(operationsPossibles(2, 6, false)).toEqual(['+', '×'])
    expect(operationsPossibles(2, 6, true)).toEqual(['+', '-', '×'])
    // Diviser par 1 recopierait la case de gauche : la division est écartée.
    expect(operationsPossibles(7, 1, true)).toEqual(['+', '-', '×'])
    expect(operationsPossibles(12, 4, true)).toEqual(['+', '-', '×', '÷'])
    // Un résultat au-delà du plafond demandé est écarté.
    expect(operationsPossibles(20, 9, true, 99)).not.toContain('×')
    expect(operationsPossibles(20, 9, true, 300)).toContain('×')
  })

  it('remonte l’opération quand la case est déterminée', () => {
    const operations: OperationPyramide[] = ['+', '-', '×', '÷']
    for (const operation of operations) {
      const sommet = appliqueOperation(12, 3, operation)
      expect(sommet).not.toBeNull()
      expect(deduitGauche(sommet as number, 3, operation)).toBe(12)
      expect(deduitDroite(sommet as number, 12, operation)).toBe(3)
    }
  })

  it('refuse de déduire une case que rien ne détermine', () => {
    // 0 × b = 0 quelle que soit la case de droite.
    expect(deduitDroite(0, 0, '×')).toBeNull()
    expect(deduitGauche(0, 0, '×')).toBeNull()
    // a ÷ b = 0 n'impose rien à la case de droite.
    expect(deduitDroite(0, 0, '÷')).toBeNull()
    // Un quotient qui ne tomberait pas juste n'est pas une déduction.
    expect(deduitGauche(7, 2, '×')).toBeNull()
  })
})

describe('résolution d’une pyramide de nombres', () => {
  it('remplit la pyramide de bas en haut quand l’étage du bas est donné', () => {
    const resolution = resoutPyramide(
      pyramideDeReference(),
      pyramideDeReference().donnees,
    )
    expect(resolution.resolue).toBe(true)
    expect(resolution.etapes.map((etape) => etape.trouvee)).toEqual([
      'sommet',
      'sommet',
      'sommet',
    ])
  })

  it('redescend la pyramide en remontant l’opération écrite', () => {
    const pyramide = pyramideDeReference()
    // Seuls le sommet, une case du milieu et une case du bas sont donnés.
    pyramide.donnees = [[true, false, false], [false, true], [true]]
    const resolution = resoutPyramide(pyramide, pyramide.donnees)
    expect(resolution.resolue).toBe(true)
    expect(resolution.etapes.map((etape) => etape.trouvee)).toContain('gauche')
  })

  it('ne conclut pas quand les valeurs données ne suffisent pas', () => {
    const pyramide = pyramideDeReference()
    pyramide.donnees = [[true, false, false], [false, false], [false]]
    expect(resoutPyramide(pyramide, pyramide.donnees).resolue).toBe(false)
  })
})

describe('génération d’une pyramide de nombres', () => {
  it('produit des pyramides cohérentes et entièrement déductibles', () => {
    for (const mode of ['base', 'trous'] as ModePyramide[]) {
      for (const nombresNegatifs of [false, true]) {
        for (let essai = 0; essai < 10; essai++) {
          seedrandom(`pyramide${mode}${nombresNegatifs}${essai}`, {
            global: true,
          })
          const pyramide = generePyramide({
            nbEtages: 5,
            mode,
            nombresNegatifs,
            valeurMax: 99,
          })
          expect(pyramide.valeurs).toHaveLength(5)
          expect(toutesLesValeurs(pyramide).every(Number.isInteger)).toBe(true)
          expect(estCoherente(pyramide)).toBe(true)
          expect(resoutPyramide(pyramide, pyramide.donnees).resolue).toBe(true)
        }
      }
    }
  })

  it('ne donne que l’étage du bas dans le mode « ligne du bas donnée »', () => {
    seedrandom('pyramideBase', { global: true })
    const pyramide = generePyramide({
      nbEtages: 5,
      mode: 'base',
      nombresNegatifs: false,
      valeurMax: 99,
    })
    expect(pyramide.donnees[0].every(Boolean)).toBe(true)
    expect(pyramide.donnees.slice(1).flat().some(Boolean)).toBe(false)
  })

  it('éparpille les valeurs données dans le mode « calculs à trous »', () => {
    seedrandom('pyramideTrous', { global: true })
    const pyramide = generePyramide({
      nbEtages: 5,
      mode: 'trous',
      nombresNegatifs: false,
      valeurMax: 99,
    })
    const donnees = pyramide.donnees.flat()
    expect(donnees.filter(Boolean).length).toBeGreaterThan(0)
    expect(donnees.filter((donnee) => !donnee).length).toBeGreaterThan(0)
    // Chaque valeur donnée est indispensable : la retirer rend la pyramide
    // impossible à terminer.
    for (let etage = 0; etage < pyramide.nbEtages; etage++) {
      for (let index = 0; index < nbCasesDeLEtage(etage, 5); index++) {
        if (!pyramide.donnees[etage][index]) continue
        const sansCelleCi = pyramide.donnees.map((ligne) => [...ligne])
        sansCelleCi[etage][index] = false
        expect(resoutPyramide(pyramide, sansCelleCi).resolue).toBe(false)
      }
    }
  })

  it('n’écrit aucun nombre négatif quand le professeur n’en veut pas', () => {
    for (const mode of ['base', 'trous'] as ModePyramide[]) {
      for (let essai = 0; essai < 10; essai++) {
        seedrandom(`pyramidePositive${mode}${essai}`, { global: true })
        const pyramide = generePyramide({
          nbEtages: 5,
          mode,
          nombresNegatifs: false,
          valeurMax: 99,
        })
        expect(toutesLesValeurs(pyramide).every((valeur) => valeur >= 0)).toBe(
          true,
        )
      }
    }
  })

  it('écrit au moins un nombre négatif quand le professeur en demande', () => {
    for (let essai = 0; essai < 10; essai++) {
      seedrandom(`pyramideNegative${essai}`, { global: true })
      const pyramide = generePyramide({
        nbEtages: 5,
        mode: 'base',
        nombresNegatifs: true,
        valeurMax: 99,
      })
      expect(toutesLesValeurs(pyramide).some((valeur) => valeur < 0)).toBe(true)
    }
  })

  it('ne dépasse jamais le plus grand nombre demandé', () => {
    for (const valeurMax of [10, 20, 99, 999]) {
      for (const nombresNegatifs of [false, true]) {
        for (let essai = 0; essai < 10; essai++) {
          seedrandom(`plafond${valeurMax}${nombresNegatifs}${essai}`, {
            global: true,
          })
          const pyramide = generePyramide({
            nbEtages: 5,
            mode: 'trous',
            nombresNegatifs,
            valeurMax,
          })
          for (const valeur of toutesLesValeurs(pyramide)) {
            expect(Math.abs(valeur)).toBeLessThanOrEqual(valeurMax)
          }
          // Un plafond serré ne doit pas dégrader la pyramide en cases
          // toutes identiques : le tirage resserre l'étage du bas plutôt
          // que de tomber sur la pyramide de secours.
          expect(new Set(toutesLesValeurs(pyramide)).size).toBeGreaterThan(1)
          expect(resoutPyramide(pyramide, pyramide.donnees).resolue).toBe(true)
        }
      }
    }
  })

  it('ramène un plafond aberrant dans les bornes', () => {
    expect(bornesValeurMax(0)).toBe(10)
    expect(bornesValeurMax(Number.NaN)).toBe(99)
    expect(bornesValeurMax(1000000)).toBe(9999)
    expect(bornesValeurMax(250)).toBe(250)
  })
})

describe('rendus du composant pyramide-nombres', () => {
  const operations: OperationPyramide[][] = [['×', '×'], ['×'], []]
  const donnees: (number | null)[][] = [[2, 3, 4], [null, null], [null]]
  const solution = [[2, 3, 4], [6, 12], [72]]

  it('construit une case par valeur et un champ par valeur à trouver', () => {
    setOutputHtml()
    document.body.innerHTML = PyramideNombresElement.create({
      nbEtages: 3,
      operations,
      donnees,
    })
    const element = document.querySelector(
      'pyramide-nombres',
    ) as PyramideNombresElement
    expect(element.querySelectorAll('[data-case]')).toHaveLength(6)
    expect(element.querySelectorAll('[data-operation]')).toHaveLength(3)
    // 6 cases, dont 3 valeurs données : il reste 3 champs de saisie.
    expect(element.querySelectorAll('input')).toHaveLength(3)
    // La ligne 1 est le sommet de la pyramide.
    expect(Object.keys(element.value)).toEqual(['L2C1', 'L2C2', 'L1C1'])
  })

  it('dimensionne la pyramide en em pour suivre le zoom des vues', () => {
    setOutputHtml()
    document.body.innerHTML = PyramideNombresElement.create({
      nbEtages: 3,
      operations,
      donnees,
    })
    const element = document.querySelector(
      'pyramide-nombres',
    ) as PyramideNombresElement
    const premiere = element.querySelector('[data-case="0-0"]') as HTMLElement
    expect(premiere.style.width).toBe('3.2em')
    expect(premiere.style.height).toBe('3.2em')
    // L'étage du bas occupe toute la largeur, le sommet est centré.
    expect(premiere.style.left).toBe('0em')
    const sommet = element.querySelector('[data-case="2-0"]') as HTMLElement
    expect(sommet.style.left).toBe('3.2em')
    expect(sommet.style.top).toBe('0em')
  })

  it('écrit l’opération dans une pastille posée entre deux cases', () => {
    setOutputHtml()
    document.body.innerHTML = PyramideNombresElement.create({
      nbEtages: 3,
      operations,
      donnees,
    })
    const pastille = document.querySelector(
      '[data-operation="0-0"]',
    ) as HTMLElement
    expect(pastille.textContent).toBe('×')
    // La pastille se dimensionne en em : sa propre taille de police
    // changerait la valeur de cet em, le symbole porte donc la sienne.
    expect(pastille.style.fontSize).toBe('')
    expect(pastille.style.width).toBe('1.024em')
    expect((pastille.firstElementChild as HTMLElement).style.fontSize).toBe(
      '0.9em',
    )
  })

  it('rétrécit un nombre long pour qu’il tienne dans sa case', () => {
    setOutputHtml()
    document.body.innerHTML = PyramideNombresElement.create({
      nbEtages: 3,
      operations,
      donnees: [[7, -12, 1234], [null, null], [null]],
    })
    const element = document.querySelector(
      'pyramide-nombres',
    ) as PyramideNombresElement
    const taille = (cle: string): string =>
      (element.querySelector(`[data-case="${cle}"] span`) as HTMLElement).style
        .fontSize
    expect(taille('0-0')).toBe('1.1em')
    expect(taille('0-1')).toBe('1.1em')
    expect(taille('0-2')).toBe('0.95em')
    // Un champ de saisie suit la même règle au fil de la frappe.
    const champ = element.querySelector('input') as HTMLInputElement
    expect(champ.style.width).toBe('88%')
    expect(champ.style.fontSize).toBe('1.1em')
    champ.value = '-1234'
    champ.dispatchEvent(new Event('input', { bubbles: true }))
    expect(champ.value).toBe('-1234')
    expect(champ.style.fontSize).toBe('0.8em')
  })

  it('n’écrit jamais la solution dans l’énoncé', () => {
    setOutputHtml()
    document.body.innerHTML = PyramideNombresElement.create({
      nbEtages: 3,
      operations,
      donnees,
      solution,
      interactivityOn: true,
    })
    const element = document.querySelector(
      'pyramide-nombres',
    ) as PyramideNombresElement
    expect(element.getAttribute('solution')).toBeNull()
    expect(element.textContent).not.toContain('72')
    expect(element.querySelectorAll('input')).toHaveLength(3)
  })

  it('écrit la solution dans la correction, sans champ de saisie', () => {
    setOutputHtml()
    document.body.innerHTML = PyramideNombresElement.create({
      nbEtages: 3,
      operations,
      donnees,
      solution,
      interactivityOn: false,
    })
    const element = document.querySelector(
      'pyramide-nombres',
    ) as PyramideNombresElement
    expect(element.querySelectorAll('input')).toHaveLength(0)
    expect(element.textContent).toContain('72')
  })

  it('trace une pyramide en tikz pour l’impression', () => {
    const latex = renderLatexPyramide(3, operations, donnees, solution)
    expect(latex).toContain('\\begin{tikzpicture}')
    // Une case par valeur, et une pastille par opération.
    expect(latex.match(/\\draw\[line width=0.6pt\]/g)).toHaveLength(6)
    expect(latex.match(/\\filldraw/g)).toHaveLength(3)
    expect(latex).toContain('{$\\times$}')
    // Les valeurs trouvées sont mises en évidence, les données restent noires.
    expect(latex).toContain('{$2$}')
    expect(latex).toContain('72')
  })

  it('trace une pyramide en Typst pour l’impression', () => {
    const typst = renderTypstPyramide(3, operations, donnees, solution)
    expect(typst).toContain('#align(center)[#block(')
    expect(typst.match(/circle\(radius: /g)).toHaveLength(9)
    expect(typst).toContain('$times$')
    expect(typst).toContain('$72$')
  })

  it('ne rend que du Typst dans la vue Typst', () => {
    setOutputHtml()
    context.isTypst = true
    const rendu = PyramideNombresElement.create({
      nbEtages: 3,
      operations,
      donnees,
    })
    expect(rendu.startsWith('<mathalea-typst>')).toBe(true)
    expect(rendu).toContain('#place(top + left')
  })
})
