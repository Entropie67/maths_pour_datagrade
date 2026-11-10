import seedrandom from 'seedrandom'
import { afterEach, describe, expect, it } from 'vitest'
import { orangeMathalea } from '../../src/lib/colors'
import {
  contoursDeLaCage,
  KillerSudokuGrilleElement,
  renderLatexGrille,
  renderTypstGrille,
} from '../../src/lib/customElements/KillerSudokuGrilleElement'
import {
  blocDe,
  combinaisonsPossibles,
  compteSolutions,
  evalueDifficulte,
  genereKillerSudoku,
  nbCagesSimples,
  solutionAleatoire,
  tailleKiller,
  unites,
  type CageKiller,
  type GrilleKiller,
  type NiveauKiller,
} from '../../src/lib/outils/killerSudoku'
import {
  context,
  setOutputHtml,
  setOutputLatex,
} from '../../src/modules/context'

const TAILLES = [4, 6, 9]
const NIVEAUX: NiveauKiller[] = [1, 2, 3]

/** Vrai si chaque ligne, colonne et bloc contient une fois chaque chiffre. */
function estUnSudokuValide(solution: number[][]): boolean {
  const taille = solution.length
  const attendu = Array.from({ length: taille }, (_, i) => i + 1).join()
  const plat = solution.flat()
  return unites(taille).every(
    (unite) =>
      unite
        .map((index) => plat[index])
        .sort((a, b) => a - b)
        .join() === attendu,
  )
}

/** Vrai si les cases d'une cage se touchent toutes de proche en proche. */
function estContigue(cage: CageKiller, taille: number): boolean {
  const restantes = new Set(cage.cases)
  const aVisiter = [cage.cases[0]]
  restantes.delete(cage.cases[0])
  while (aVisiter.length > 0) {
    const index = aVisiter.pop() as number
    const ligne = Math.floor(index / taille)
    const colonne = index % taille
    for (const voisine of [
      ligne > 0 ? index - taille : -1,
      ligne < taille - 1 ? index + taille : -1,
      colonne > 0 ? index - 1 : -1,
      colonne < taille - 1 ? index + 1 : -1,
    ]) {
      if (restantes.delete(voisine)) aVisiter.push(voisine)
    }
  }
  return restantes.size === 0
}

/** Une grille écrite à la main : 4 × 4, quatre cages de quatre cases. */
function grilleDeReference(): GrilleKiller {
  const solution = [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 1, 4, 3],
    [4, 3, 2, 1],
  ]
  const cages: CageKiller[] = [
    { cases: [0, 1, 4], somme: 6 },
    { cases: [2, 3], somme: 7 },
    { cases: [5, 6, 7], somme: 7 },
    { cases: [8, 12], somme: 6 },
    { cases: [9, 10, 11], somme: 8 },
    { cases: [13, 14, 15], somme: 6 },
  ]
  return { taille: 4, solution, cages }
}

afterEach(() => {
  setOutputHtml()
  context.isTypst = false
  document.body.innerHTML = ''
  seedrandom(undefined, { global: true })
})

describe('génération des grilles de Killer Sudoku', () => {
  it('tire une solution de sudoku valide pour chaque taille', () => {
    for (const taille of TAILLES) {
      for (let essai = 0; essai < 10; essai++) {
        expect(estUnSudokuValide(solutionAleatoire(taille))).toBe(true)
      }
    }
  })

  it('numérote les blocs de 2×2, 2×3 et 3×3', () => {
    // 6 × 6 : deux lignes sur trois colonnes.
    expect(blocDe(0, 6)).toBe(0)
    expect(blocDe(2, 6)).toBe(0)
    expect(blocDe(3, 6)).toBe(1)
    expect(blocDe(6, 6)).toBe(0)
    expect(blocDe(12, 6)).toBe(2)
    expect(
      unites(6)
        .slice(12)
        .every((bloc) => bloc.length === 6),
    ).toBe(true)
  })

  it('découpe la grille en cages contiguës qui la recouvrent exactement', () => {
    for (const taille of TAILLES) {
      for (const niveau of NIVEAUX) {
        const grille = genereKillerSudoku({ taille, niveau })
        const cases = grille.cages.flatMap((cage) => cage.cases)
        expect(new Set(cases).size).toBe(taille * taille)
        expect(cases).toHaveLength(taille * taille)
        for (const cage of grille.cages) {
          expect(estContigue(cage, taille)).toBe(true)
        }
      }
    }
  })

  it('annonce la somme de la solution et n’y répète aucun chiffre', () => {
    for (const taille of TAILLES) {
      const grille = genereKillerSudoku({ taille, niveau: 2 })
      expect(estUnSudokuValide(grille.solution)).toBe(true)
      for (const cage of grille.cages) {
        const chiffres = cage.cases.map(
          (index) =>
            grille.solution[Math.floor(index / taille)][index % taille],
        )
        expect(chiffres.reduce((a, b) => a + b, 0)).toBe(cage.somme)
        expect(new Set(chiffres).size).toBe(chiffres.length)
      }
    }
  })

  it('ne produit que des grilles à solution unique', () => {
    for (const taille of TAILLES) {
      for (const niveau of NIVEAUX) {
        seedrandom(`killerUnique${taille}${niveau}`, { global: true })
        const grille = genereKillerSudoku({ taille, niveau })
        expect(compteSolutions(grille, 2)).toBe(1)
      }
    }
  })

  it('compte plusieurs solutions quand les cages ne suffisent pas', () => {
    // Un seul gros morceau : la grille de référence sans ses petites cages.
    const grille = grilleDeReference()
    const lache: GrilleKiller = {
      ...grille,
      cages: [
        { cases: [0, 1], somme: 3 },
        ...grille.cages.slice(1, 2),
        ...grille.cages.slice(3, 4),
        { cases: [4, 5, 6, 7], somme: 10 },
        { cases: [9, 10, 11], somme: 8 },
        { cases: [13, 14, 15], somme: 6 },
      ],
    }
    expect(compteSolutions(lache, 5)).toBeGreaterThan(1)
  })

  it('produit des grilles qui se résolvent par déduction, au niveau demandé', () => {
    // Les tirages sont seedés comme ceux d'un exercice : une petite grille se
    // rabat sur le niveau le plus proche si elle n'exige pas le niveau demandé.
    for (const taille of [6, 9]) {
      for (const niveau of [1, 2] as NiveauKiller[]) {
        seedrandom(`killer${taille}${niveau}`, { global: true })
        const evaluation = evalueDifficulte(
          genereKillerSudoku({ taille, niveau }),
        )
        expect(evaluation.resolue).toBe(true)
        expect(evaluation.niveauMax).toBe(niveau)
      }
    }
    seedrandom('killer93', { global: true })
    const difficile = evalueDifficulte(
      genereKillerSudoku({ taille: 9, niveau: 3 }),
    )
    expect(difficile.resolue).toBe(true)
    expect(difficile.niveauMax).toBe(3)
  })

  it('garde peu de cages d’une seule case, d’autant moins que le niveau est difficile', () => {
    const moyenne = (niveau: NiveauKiller): number => {
      let total = 0
      for (let essai = 0; essai < 5; essai++) {
        seedrandom(`killerSimples${niveau}${essai}`, { global: true })
        total += nbCagesSimples(genereKillerSudoku({ taille: 9, niveau }))
      }
      return total / 5
    }
    expect(moyenne(1)).toBeLessThanOrEqual(10)
    expect(moyenne(3)).toBeLessThan(moyenne(1))
  })

  it('énumère les décompositions d’une somme en nombres différents', () => {
    expect(combinaisonsPossibles(2, 3, 9)).toEqual([[1, 2]])
    expect(combinaisonsPossibles(2, 17, 9)).toEqual([[8, 9]])
    expect(combinaisonsPossibles(3, 6, 9)).toEqual([[1, 2, 3]])
    expect(combinaisonsPossibles(2, 5, 4)).toEqual([
      [1, 4],
      [2, 3],
    ])
    // En 4 × 4, 8 n'est pas la somme de deux nombres de 1 à 4 différents.
    expect(combinaisonsPossibles(2, 8, 4)).toEqual([])
  })

  it('associe la taille du formulaire au côté de la grille', () => {
    expect(tailleKiller(1)).toBe(4)
    expect(tailleKiller(2)).toBe(6)
    expect(tailleKiller(3)).toBe(9)
    expect(tailleKiller(undefined)).toBe(6)
  })
})

describe('contours pointillés des cages', () => {
  it('rentre le contour d’une case unique vers l’intérieur', () => {
    const contours = contoursDeLaCage({ cases: [0], somme: 1 }, 4, 0.1)
    expect(contours).toHaveLength(1)
    expect(contours[0]).toHaveLength(4)
    for (const [x, y] of contours[0]) {
      expect(x === 0.1 || x === 0.9).toBe(true)
      expect(y === 0.1 || y === 0.9).toBe(true)
    }
  })

  it('ne garde que les sommets d’une cage rectangulaire', () => {
    const [contour] = contoursDeLaCage({ cases: [0, 1, 4, 5], somme: 10 }, 4)
    expect(contour).toHaveLength(4)
  })

  it('suit les coins rentrants d’une cage en L', () => {
    // Cases 0, 4 et 5 : un L dont le coin rentrant est en (1, 1).
    const [contour] = contoursDeLaCage({ cases: [0, 4, 5], somme: 6 }, 4, 0.1)
    expect(contour).toHaveLength(6)
    expect(contour).toContainEqual([0.1, 0.1])
    expect(contour).toContainEqual([0.9, 0.1])
    expect(contour).toContainEqual([0.9, 1.1])
    expect(contour).toContainEqual([1.9, 1.1])
    expect(contour).toContainEqual([1.9, 1.9])
    expect(contour).toContainEqual([0.1, 1.9])
  })

  it('donne un contour par cage et de l’aire attendue', () => {
    const aire = (contour: [number, number][]): number =>
      Math.abs(
        contour.reduce((somme, [x, y], rang) => {
          const [xs, ys] = contour[(rang + 1) % contour.length]
          return somme + (x * ys - xs * y)
        }, 0) / 2,
      )
    const grille = genereKillerSudoku({ taille: 6, niveau: 2 })
    for (const cage of grille.cages) {
      const contours = contoursDeLaCage(cage, 6, 0)
      // Sans retrait, la somme des aires est le nombre de cases de la cage.
      const total = contours.reduce(
        (somme, contour) => somme + aire(contour as [number, number][]),
        0,
      )
      expect(total).toBeCloseTo(cage.cases.length, 6)
    }
  })
})

describe('rendus du composant killer-sudoku-grille', () => {
  it('construit une case et un champ de saisie par case de la grille', () => {
    setOutputHtml()
    document.body.innerHTML = KillerSudokuGrilleElement.create({
      taille: 4,
      cages: grilleDeReference().cages,
    })
    const element = document.querySelector(
      'killer-sudoku-grille',
    ) as KillerSudokuGrilleElement
    expect(element.querySelectorAll('[data-case]')).toHaveLength(32)
    // Aucun chiffre n'est donné : toutes les cases attendent une saisie.
    expect(element.querySelectorAll('input')).toHaveLength(16)
    expect(Object.keys(element.value)).toHaveLength(16)
  })

  it('dimensionne la grille en em pour suivre le zoom des vues', () => {
    setOutputHtml()
    document.body.innerHTML = KillerSudokuGrilleElement.create({
      taille: 4,
      cages: grilleDeReference().cages,
    })
    const element = document.querySelector(
      'killer-sudoku-grille',
    ) as KillerSudokuGrilleElement
    const grille = element.querySelector('div > div') as HTMLElement
    expect(grille.style.gridTemplateColumns).toBe('repeat(4, 2.6em)')
    const premiereCase = element.querySelector(
      'div[data-case="0"]',
    ) as HTMLElement
    expect(premiereCase.style.width).toBe('2.6em')
    expect(premiereCase.style.height).toBe('2.6em')
  })

  it('épaissit les traits aux frontières des blocs seulement', () => {
    setOutputHtml()
    document.body.innerHTML = KillerSudokuGrilleElement.create({
      taille: 4,
      cages: grilleDeReference().cages,
    })
    const premiere = document.querySelector('div[data-case="0"]') as HTMLElement
    expect(premiere.style.borderTopWidth).toBe('0.22em')
    expect(premiere.style.borderLeftWidth).toBe('0.22em')
    expect(premiere.style.borderRightWidth).toBe('0px')
    // Les cases 0 et 1 sont dans le même bloc : le trait qui les sépare est fin.
    const seconde = document.querySelector('div[data-case="1"]') as HTMLElement
    expect(seconde.style.borderLeftWidth).toBe('0.08em')
    // La case 2 ouvre le second bloc, même si elle partage la cage de la case 3.
    const troisieme = document.querySelector(
      'div[data-case="2"]',
    ) as HTMLElement
    expect(troisieme.style.borderLeftWidth).toBe('0.22em')
    // La case 4 est sous la case 0 dans la même cage : trait fin entre elles.
    const cinquieme = document.querySelector(
      'div[data-case="4"]',
    ) as HTMLElement
    expect(cinquieme.style.borderTopWidth).toBe('0.08em')
    // La frontière entre les deux blocs du haut et du bas est épaisse.
    const neuvieme = document.querySelector('div[data-case="8"]') as HTMLElement
    expect(neuvieme.style.borderTopWidth).toBe('0.22em')
  })

  it('dessine un contour pointillé par cage', () => {
    setOutputHtml()
    const grille = grilleDeReference()
    document.body.innerHTML = KillerSudokuGrilleElement.create({
      taille: 4,
      cages: grille.cages,
    })
    const polygones = document.querySelectorAll('polygon')
    expect(polygones).toHaveLength(grille.cages.length)
    expect(polygones[0].getAttribute('stroke-dasharray')).not.toBeNull()
  })

  it('écrit la somme dans le coin supérieur gauche de la cage', () => {
    setOutputHtml()
    document.body.innerHTML = KillerSudokuGrilleElement.create({
      taille: 4,
      cages: grilleDeReference().cages,
    })
    const premiere = document.querySelector('div[data-case="0"]') as HTMLElement
    expect(premiere.querySelector('span')?.textContent).toBe('6')
    // La deuxième case de la cage ne répète pas la somme.
    const seconde = document.querySelector('div[data-case="1"]') as HTMLElement
    expect(seconde.querySelector('span')).toBeNull()
  })

  it('n’écrit jamais la solution dans l’énoncé', () => {
    setOutputHtml()
    const grille = grilleDeReference()
    document.body.innerHTML = KillerSudokuGrilleElement.create({
      taille: 4,
      cages: grille.cages,
      solution: grille.solution,
      interactivityOn: true,
    })
    const element = document.querySelector(
      'killer-sudoku-grille',
    ) as KillerSudokuGrilleElement
    expect(element.getAttribute('solution')).toBeNull()
    expect(element.querySelectorAll('input')).toHaveLength(16)
  })

  it('affiche la solution en évidence dans la correction', () => {
    setOutputHtml()
    const grille = grilleDeReference()
    document.body.innerHTML = KillerSudokuGrilleElement.create({
      taille: 4,
      cages: grille.cages,
      solution: grille.solution,
      interactivityOn: false,
    })
    const element = document.querySelector(
      'killer-sudoku-grille',
    ) as KillerSudokuGrilleElement
    expect(element.querySelectorAll('input')).toHaveLength(0)
    const premiere = element.querySelector('div[data-case="0"]') as HTMLElement
    const valeur = premiere.querySelectorAll('span')[1]
    expect(valeur.textContent).toBe('1')
    const sonde = document.createElement('div')
    sonde.style.color = orangeMathalea
    expect(valeur.style.color).toBe(sonde.style.color)
  })

  it('restitue et relit les saisies de l’élève', () => {
    setOutputHtml()
    document.body.innerHTML = KillerSudokuGrilleElement.create({
      taille: 4,
      cages: grilleDeReference().cages,
    })
    const element = document.querySelector(
      'killer-sudoku-grille',
    ) as KillerSudokuGrilleElement
    element.value = { L1C1: '1', L1C2: '2' }
    expect(element.value.L1C1).toBe('1')
    expect(element.value.L1C2).toBe('2')
    expect(element.value.L1C3).toBe('')
    // La reprise de session transmet la valeur sérialisée.
    element.value = JSON.stringify({ L1C3: '3' })
    expect(element.value.L1C3).toBe('3')
  })

  it('refuse les chiffres hors de la grille', () => {
    setOutputHtml()
    document.body.innerHTML = KillerSudokuGrilleElement.create({
      taille: 4,
      cages: grilleDeReference().cages,
    })
    const champ = document.querySelector('input') as HTMLInputElement
    champ.value = '7'
    champ.dispatchEvent(new Event('input', { bubbles: true }))
    expect(champ.value).toBe('')
    champ.value = '3'
    champ.dispatchEvent(new Event('input', { bubbles: true }))
    expect(champ.value).toBe('3')
  })

  it('garde le focus sur la case saisie, les flèches le déplacent', () => {
    setOutputHtml()
    document.body.innerHTML = KillerSudokuGrilleElement.create({
      taille: 4,
      cages: grilleDeReference().cages,
    })
    const champs = [...document.querySelectorAll<HTMLInputElement>('input')]
    champs[0].focus()
    champs[0].value = '3'
    champs[0].dispatchEvent(new Event('input', { bubbles: true }))
    expect(document.activeElement).toBe(champs[0])
    champs[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    )
    expect(document.activeElement).toBe(champs[1])
  })

  it('produit un tracé tikz sans solution pour l’énoncé', () => {
    setOutputLatex()
    const grille = grilleDeReference()
    const latex = KillerSudokuGrilleElement.create({
      taille: 4,
      cages: grille.cages,
      solution: grille.solution,
      interactivityOn: true,
    })
    expect(latex).toContain('\\begin{tikzpicture}')
    expect(latex).toContain('line width=1.6pt')
    expect(latex).toContain('dash pattern=on')
    expect(latex).toContain('{6}')
    expect(latex).not.toContain('color')
    expect((latex.match(/-- cycle;/g) ?? []).length).toBe(grille.cages.length)
  })

  it('remplit le tracé tikz dans la correction', () => {
    setOutputLatex()
    const grille = grilleDeReference()
    const latex = renderLatexGrille(4, grille.cages, grille.solution)
    expect(latex).toContain('\\color')
    expect((latex.match(/\\node\[font=\\large\]/g) ?? []).length).toBe(16)
  })

  it('produit un tableau Typst encapsulé dans le marqueur attendu', () => {
    setOutputHtml()
    context.isTypst = true
    const typst = KillerSudokuGrilleElement.create({
      taille: 4,
      cages: grilleDeReference().cages,
    })
    expect(typst.startsWith('<mathalea-typst>')).toBe(true)
    expect(typst.endsWith('</mathalea-typst>')).toBe(true)
    expect(typst).toContain('table.cell(stroke: (top: 1.6pt')
    expect(typst).toContain('columns: (1cm,) * 4')
    expect(typst).toContain('dash: "dashed"')
    expect((typst.match(/polygon\(/g) ?? []).length).toBe(
      grilleDeReference().cages.length,
    )
  })

  it('écrit la solution dans le Typst de la correction', () => {
    const grille = grilleDeReference()
    const typst = renderTypstGrille(4, grille.cages, grille.solution)
    expect(typst).toContain(`fill: rgb("${orangeMathalea}")`)
  })
})

describe('interactivité et score', () => {
  /** Un exercice minimal portant les réponses attendues de la première ligne. */
  function exerciceDeTest(): {
    numeroExercice: number
    sup: number
    answers: Record<string, string>
    autoCorrection: { valeur: Record<string, { value: string }> }[]
  } {
    const grille = grilleDeReference()
    const valeur: Record<string, { value: string }> = {}
    for (let ligne = 0; ligne < 4; ligne++) {
      for (let colonne = 0; colonne < 4; colonne++) {
        valeur[`L${ligne + 1}C${colonne + 1}`] = {
          value: String(grille.solution[ligne][colonne]),
        }
      }
    }
    return {
      numeroExercice: 3,
      sup: 1,
      answers: {},
      autoCorrection: [{ valeur }],
    }
  }

  type Exercice = Parameters<typeof KillerSudokuGrilleElement.verifQuestion>[0]

  it('note la grille sur le barème de sa taille', () => {
    for (const [sup, points] of [
      [1, 4],
      [2, 6],
      [3, 9],
    ]) {
      expect(
        KillerSudokuGrilleElement.pointsMaxQuestion(
          { sup } as unknown as Exercice,
          0,
        ),
      ).toBe(points)
    }
  })

  it('note la proportion de cases correctement remplies et fige la grille', () => {
    setOutputHtml()
    document.body.innerHTML = KillerSudokuGrilleElement.create({
      taille: 4,
      cages: grilleDeReference().cages,
      numeroExercice: 3,
      questionIndex: 0,
    })
    const element = document.getElementById(
      'killer-sudoku-grilleEx3Q0',
    ) as KillerSudokuGrilleElement
    // Quatre cases justes sur seize : un point sur quatre.
    element.value = { L1C1: '1', L1C2: '2', L1C3: '3', L1C4: '4' }
    const resultat = KillerSudokuGrilleElement.verifQuestion(
      exerciceDeTest() as unknown as Exercice,
      0,
    )
    expect(resultat).toEqual({
      isOk: false,
      feedback: '',
      score: { nbBonnesReponses: 1, nbReponses: 4 },
    })
    expect(element.interactivityOn).toBe(false)
    expect(element.textContent).toContain(
      '4 cases correctement remplies sur 16.',
    )
    expect((element.querySelector('input') as HTMLInputElement).readOnly).toBe(
      true,
    )
  })

  it('reconnaît une grille entièrement juste', () => {
    setOutputHtml()
    const grille = grilleDeReference()
    document.body.innerHTML = KillerSudokuGrilleElement.create({
      taille: 4,
      cages: grille.cages,
      numeroExercice: 3,
      questionIndex: 0,
    })
    const element = document.getElementById(
      'killer-sudoku-grilleEx3Q0',
    ) as KillerSudokuGrilleElement
    const saisies: Record<string, string> = {}
    grille.solution.forEach((ligne, i) =>
      ligne.forEach((chiffre, j) => {
        saisies[`L${i + 1}C${j + 1}`] = String(chiffre)
      }),
    )
    element.value = saisies
    const resultat = KillerSudokuGrilleElement.verifQuestion(
      exerciceDeTest() as unknown as Exercice,
      0,
    )
    expect(resultat.isOk).toBe(true)
    expect(resultat.score).toEqual({ nbBonnesReponses: 4, nbReponses: 4 })
  })
})
