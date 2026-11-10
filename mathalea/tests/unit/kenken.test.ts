import seedrandom from 'seedrandom'
import { afterEach, describe, expect, it } from 'vitest'
import { orangeMathalea } from '../../src/lib/colors'
import {
  KenKenGrilleElement,
  renderLatexGrille,
  renderTypstGrille,
} from '../../src/lib/customElements/KenKenGrilleElement'
import {
  carreLatinAleatoire,
  compteSolutions,
  etiquetteCage,
  evalueDifficulte,
  genereKenKen,
  operationsPossibles,
  resultatCage,
  type CageKenKen,
  type GrilleKenKen,
  type NiveauKenKen,
  type OperationKenKen,
} from '../../src/lib/outils/kenken'
import {
  context,
  setOutputHtml,
  setOutputLatex,
} from '../../src/modules/context'

const TOUTES_LES_OPERATIONS: OperationKenKen[] = ['+', '-', '×', '÷']

/** Vrai si chaque valeur figure une fois par ligne et une fois par colonne. */
function estUnCarreLatin(carre: number[][]): boolean {
  const taille = carre.length
  const attendu = Array.from({ length: taille }, (_, index) => index + 1)
  return carre.every((ligne, indexLigne) => {
    const colonne = carre.map((autre) => autre[indexLigne])
    return (
      [...ligne].sort((a, b) => a - b).join() === attendu.join() &&
      [...colonne].sort((a, b) => a - b).join() === attendu.join()
    )
  })
}

/** Vrai si les cases d'une cage se touchent toutes de proche en proche. */
function estContigue(cage: CageKenKen, taille: number): boolean {
  const restantes = new Set(cage.cases)
  const aVisiter = [cage.cases[0]]
  restantes.delete(cage.cases[0])
  while (aVisiter.length > 0) {
    const index = aVisiter.pop() as number
    const ligne = Math.floor(index / taille)
    const colonne = index % taille
    const voisines = [
      ligne > 0 ? index - taille : -1,
      ligne < taille - 1 ? index + taille : -1,
      colonne > 0 ? index - 1 : -1,
      colonne < taille - 1 ? index + 1 : -1,
    ]
    for (const voisine of voisines) {
      if (restantes.delete(voisine)) aVisiter.push(voisine)
    }
  }
  return restantes.size === 0
}

/** Une grille écrite à la main : 4 × 4, deux cages, le reste en valeurs données. */
function grilleDeReference(): GrilleKenKen {
  const solution = [
    [1, 2, 3, 4],
    [2, 3, 4, 1],
    [3, 4, 1, 2],
    [4, 1, 2, 3],
  ]
  const cages: CageKenKen[] = [
    { cases: [0, 1], operation: '+', resultat: 3 },
    { cases: [2, 3], operation: '+', resultat: 7 },
  ]
  for (let index = 4; index < 16; index++) {
    cages.push({
      cases: [index],
      operation: '=',
      resultat: solution[Math.floor(index / 4)][index % 4],
    })
  }
  return { taille: 4, solution, cages }
}

afterEach(() => {
  setOutputHtml()
  context.isTypst = false
  document.body.innerHTML = ''
  seedrandom(undefined, { global: true })
})

describe('génération des grilles de KenKen', () => {
  it('tire un carré latin pour chaque taille proposée', () => {
    for (const taille of [3, 4, 5, 6]) {
      expect(estUnCarreLatin(carreLatinAleatoire(taille))).toBe(true)
    }
  })

  it('découpe la grille en cages contiguës qui la recouvrent exactement', () => {
    for (const taille of [3, 4, 5, 6]) {
      for (const niveau of [1, 2, 3] as NiveauKenKen[]) {
        const grille = genereKenKen({
          taille,
          operations: TOUTES_LES_OPERATIONS,
          niveau,
        })
        const cases = grille.cages.flatMap((cage) => cage.cases)
        expect(new Set(cases).size).toBe(taille * taille)
        expect(cases).toHaveLength(taille * taille)
        for (const cage of grille.cages) {
          expect(estContigue(cage, taille)).toBe(true)
        }
      }
    }
  })

  it('n’utilise la soustraction et la division que sur deux cases, division juste', () => {
    for (let essai = 0; essai < 20; essai++) {
      const grille = genereKenKen({
        taille: 5,
        operations: TOUTES_LES_OPERATIONS,
        niveau: 3,
      })
      for (const cage of grille.cages) {
        if (cage.operation === '-' || cage.operation === '÷') {
          expect(cage.cases).toHaveLength(2)
        }
        expect(Number.isInteger(cage.resultat)).toBe(true)
        expect(cage.resultat).toBeGreaterThan(0)
      }
    }
  })

  it('n’emploie que les opérations demandées par le professeur', () => {
    const grille = genereKenKen({
      taille: 5,
      operations: ['+', '×'],
      niveau: 2,
    })
    for (const cage of grille.cages) {
      expect(['+', '×', '=']).toContain(cage.operation)
    }
  })

  it('annonce dans chaque cage le résultat de la solution', () => {
    const grille = genereKenKen({
      taille: 5,
      operations: TOUTES_LES_OPERATIONS,
      niveau: 2,
    })
    for (const cage of grille.cages) {
      const valeurs = cage.cases.map(
        (index) => grille.solution[Math.floor(index / 5)][index % 5],
      )
      expect(resultatCage(valeurs, cage.operation)).toBe(cage.resultat)
    }
  })

  it('ne produit que des grilles à solution unique', () => {
    for (const taille of [3, 4, 5, 6]) {
      for (const niveau of [1, 2, 3] as NiveauKenKen[]) {
        const grille = genereKenKen({
          taille,
          operations: TOUTES_LES_OPERATIONS,
          niveau,
        })
        expect(compteSolutions(grille, 2)).toBe(1)
      }
    }
  })

  it('produit des grilles qui se résolvent par déduction, au niveau demandé', () => {
    // Les tirages sont seedés comme ceux d'un exercice : une grille trop petite
    // pour exiger le niveau demandé se rabat sur le niveau le plus proche, ce
    // qui n'arrive pas à partir du 5 × 5.
    for (const taille of [5, 6]) {
      for (const niveau of [1, 2, 3] as NiveauKenKen[]) {
        seedrandom(`kenken${taille}${niveau}`, { global: true })
        const evaluation = evalueDifficulte(
          genereKenKen({ taille, operations: TOUTES_LES_OPERATIONS, niveau }),
        )
        expect(evaluation.resolue).toBe(true)
        expect(evaluation.niveauMax).toBe(niveau)
      }
    }
  })

  it('donne d’autant plus de valeurs que le niveau est facile', () => {
    const compteLesDonnees = (niveau: NiveauKenKen): number => {
      seedrandom(`kenkenDonnees${niveau}`, { global: true })
      return genereKenKen({
        taille: 6,
        operations: TOUTES_LES_OPERATIONS,
        niveau,
      }).cages.filter((cage) => cage.operation === '=').length
    }
    expect(compteLesDonnees(1)).toBeGreaterThan(compteLesDonnees(3))
  })

  it('écarte les opérations qui ne renseignent sur rien', () => {
    // Une différence nulle et un quotient égal à 1 ne disent rien de la cage.
    expect(operationsPossibles([3, 3], TOUTES_LES_OPERATIONS)).toEqual([
      '+',
      '×',
    ])
    expect(operationsPossibles([2, 3], TOUTES_LES_OPERATIONS)).toEqual([
      '+',
      '×',
      '-',
    ])
    expect(operationsPossibles([2, 6], TOUTES_LES_OPERATIONS)).toEqual([
      '+',
      '×',
      '-',
      '÷',
    ])
    // Au delà de deux cases, seules l'addition et la multiplication ont un sens.
    expect(operationsPossibles([1, 2, 3], TOUTES_LES_OPERATIONS)).toEqual([
      '+',
      '×',
    ])
  })
})

describe('rendus du composant kenken-grille', () => {
  it('construit une case par valeur et un champ par valeur à trouver', () => {
    setOutputHtml()
    const grille = grilleDeReference()
    document.body.innerHTML = KenKenGrilleElement.create({
      taille: 4,
      cages: grille.cages,
    })
    const element = document.querySelector(
      'kenken-grille',
    ) as KenKenGrilleElement
    expect(element.querySelectorAll('[data-case]')).toHaveLength(20)
    // 16 cases, dont 12 valeurs données : il reste 4 champs de saisie.
    expect(element.querySelectorAll('input')).toHaveLength(4)
    expect(Object.keys(element.value)).toEqual(['L1C1', 'L1C2', 'L1C3', 'L1C4'])
  })

  it('dimensionne la grille en em pour suivre le zoom des vues', () => {
    setOutputHtml()
    document.body.innerHTML = KenKenGrilleElement.create({
      taille: 4,
      cages: grilleDeReference().cages,
    })
    const element = document.querySelector(
      'kenken-grille',
    ) as KenKenGrilleElement
    const grille = element.querySelector('div > div') as HTMLElement
    expect(grille.style.gridTemplateColumns).toBe('repeat(4, 2.6em)')
    const premiereCase = element.querySelector(
      'div[data-case="0"]',
    ) as HTMLElement
    expect(premiereCase.style.width).toBe('2.6em')
    expect(premiereCase.style.height).toBe('2.6em')
  })

  it('épaissit les traits aux frontières des cages', () => {
    setOutputHtml()
    document.body.innerHTML = KenKenGrilleElement.create({
      taille: 4,
      cages: grilleDeReference().cages,
    })
    const premiere = document.querySelector('div[data-case="0"]') as HTMLElement
    // Le bord de la grille est un trait épais.
    expect(premiere.style.borderTopWidth).toBe('0.22em')
    expect(premiere.style.borderLeftWidth).toBe('0.22em')
    // Une case ne trace ni son bord bas ni son bord droit : ils appartiennent
    // à ses voisines, sans quoi le trait intérieur serait deux fois trop épais.
    expect(premiere.style.borderRightWidth).toBe('0px')
    expect(premiere.style.borderBottomWidth).toBe('0px')
    // Les cases 0 et 1 sont dans la même cage : le trait qui les sépare est fin.
    const seconde = document.querySelector('div[data-case="1"]') as HTMLElement
    expect(seconde.style.borderLeftWidth).toBe('0.08em')
    // La case 2 ouvre une autre cage : sa frontière gauche est épaisse.
    const troisieme = document.querySelector(
      'div[data-case="2"]',
    ) as HTMLElement
    expect(troisieme.style.borderLeftWidth).toBe('0.22em')
    // La dernière case ferme la grille en bas et à droite.
    const derniere = document.querySelector(
      'div[data-case="15"]',
    ) as HTMLElement
    expect(derniere.style.borderBottomWidth).toBe('0.22em')
    expect(derniere.style.borderRightWidth).toBe('0.22em')
  })

  it('écrit l’étiquette dans le coin supérieur gauche de la cage', () => {
    setOutputHtml()
    document.body.innerHTML = KenKenGrilleElement.create({
      taille: 4,
      cages: grilleDeReference().cages,
    })
    const premiere = document.querySelector('div[data-case="0"]') as HTMLElement
    expect(premiere.querySelector('span')?.textContent).toBe('3+')
    // La deuxième case de la cage ne répète pas l'étiquette.
    const seconde = document.querySelector('div[data-case="1"]') as HTMLElement
    expect(seconde.querySelector('span')).toBeNull()
  })

  it('n’écrit jamais la solution dans l’énoncé', () => {
    setOutputHtml()
    const grille = grilleDeReference()
    document.body.innerHTML = KenKenGrilleElement.create({
      taille: 4,
      cages: grille.cages,
      solution: grille.solution,
      interactivityOn: true,
    })
    const element = document.querySelector(
      'kenken-grille',
    ) as KenKenGrilleElement
    expect(element.getAttribute('solution')).toBeNull()
    expect(element.querySelectorAll('input')).toHaveLength(4)
  })

  it('affiche la solution en évidence dans la correction', () => {
    setOutputHtml()
    const grille = grilleDeReference()
    document.body.innerHTML = KenKenGrilleElement.create({
      taille: 4,
      cages: grille.cages,
      solution: grille.solution,
      interactivityOn: false,
    })
    const element = document.querySelector(
      'kenken-grille',
    ) as KenKenGrilleElement
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
    document.body.innerHTML = KenKenGrilleElement.create({
      taille: 4,
      cages: grilleDeReference().cages,
    })
    const element = document.querySelector(
      'kenken-grille',
    ) as KenKenGrilleElement
    element.value = { L1C1: '1', L1C2: '2' }
    expect(element.value).toEqual({
      L1C1: '1',
      L1C2: '2',
      L1C3: '',
      L1C4: '',
    })
    // La reprise de session transmet la valeur sérialisée.
    element.value = JSON.stringify({ L1C3: '3' })
    expect(element.value.L1C3).toBe('3')
  })

  it('refuse les chiffres hors de la grille', () => {
    setOutputHtml()
    document.body.innerHTML = KenKenGrilleElement.create({
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

  it('garde le focus sur la case saisie', () => {
    setOutputHtml()
    document.body.innerHTML = KenKenGrilleElement.create({
      taille: 4,
      cages: grilleDeReference().cages,
    })
    const champs = [...document.querySelectorAll<HTMLInputElement>('input')]
    champs[0].focus()
    champs[0].value = '3'
    champs[0].dispatchEvent(new Event('input', { bubbles: true }))
    // Une grille de KenKen ne se remplit pas dans l'ordre de lecture : le
    // focus ne saute pas à la case suivante.
    expect(document.activeElement).toBe(champs[0])
    // Les flèches, elles, déplacent bien le focus.
    champs[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    )
    expect(document.activeElement).toBe(champs[1])
  })

  it('produit un tracé tikz sans solution pour l’énoncé', () => {
    setOutputLatex()
    const grille = grilleDeReference()
    const latex = KenKenGrilleElement.create({
      taille: 4,
      cages: grille.cages,
      solution: grille.solution,
      interactivityOn: true,
    })
    expect(latex).toContain('\\begin{tikzpicture}')
    expect(latex).toContain('line width=1.6pt')
    expect(latex).toContain('line width=0.4pt')
    expect(latex).toContain('{3+}')
    // Les valeurs données figurent, les valeurs à trouver non.
    expect(latex).toContain('{$2$}')
    expect(latex).not.toContain('color')
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
    const grille = grilleDeReference()
    const typst = KenKenGrilleElement.create({
      taille: 4,
      cages: grille.cages,
    })
    expect(typst.startsWith('<mathalea-typst>')).toBe(true)
    expect(typst.endsWith('</mathalea-typst>')).toBe(true)
    expect(typst).toContain('table.cell(stroke: (top: 1.6pt')
    expect(typst).toContain('columns: (1cm,) * 4')
  })

  it('écrit la solution dans le Typst de la correction', () => {
    const grille = grilleDeReference()
    const typst = renderTypstGrille(4, grille.cages, grille.solution)
    expect(typst).toContain(`fill: rgb("${orangeMathalea}")`)
  })
})

describe('interactivité et score', () => {
  /**
   * Un exercice minimal portant les réponses attendues d'une grille de
   * référence. `sup: 2` sélectionne le format 4 × 4, noté sur 4 points.
   */
  function exerciceDeTest(): {
    numeroExercice: number
    sup: number
    answers: Record<string, string>
    autoCorrection: { valeur: Record<string, { value: string }> }[]
  } {
    const grille = grilleDeReference()
    const valeur: Record<string, { value: string }> = {}
    for (let colonne = 0; colonne < 4; colonne++) {
      valeur[`L1C${colonne + 1}`] = {
        value: String(grille.solution[0][colonne]),
      }
    }
    return {
      numeroExercice: 3,
      sup: 2,
      answers: {},
      autoCorrection: [{ valeur }],
    }
  }

  type Exercice = Parameters<typeof KenKenGrilleElement.verifQuestion>[0]

  it('note la grille sur le barème de sa taille', () => {
    const exercice = exerciceDeTest()
    expect(
      KenKenGrilleElement.pointsMaxQuestion(exercice as unknown as Exercice, 0),
    ).toBe(4)
  })

  it('note la proportion de cases correctement remplies et fige la grille', () => {
    setOutputHtml()
    document.body.innerHTML = KenKenGrilleElement.create({
      taille: 4,
      cages: grilleDeReference().cages,
      numeroExercice: 3,
      questionIndex: 0,
    })
    const element = document.getElementById(
      'kenken-grilleEx3Q0',
    ) as KenKenGrilleElement
    // La première ligne attendue est 1, 2, 3, 4 : deux réponses justes.
    element.value = { L1C1: '1', L1C2: '2', L1C3: '4', L1C4: '' }
    const exercice = exerciceDeTest()
    const resultat = KenKenGrilleElement.verifQuestion(
      exercice as unknown as Exercice,
      0,
    )
    expect(resultat).toEqual({
      isOk: false,
      feedback: '',
      score: { nbBonnesReponses: 2, nbReponses: 4 },
    })
    expect(exercice.answers['kenken-grilleEx3Q0']).toBe(
      JSON.stringify({ L1C1: '1', L1C2: '2', L1C3: '4', L1C4: '' }),
    )
    expect(element.interactivityOn).toBe(false)
    expect(element.textContent).toContain(
      '2 cases correctement remplies sur 4.',
    )
    // La grille figée n'accepte plus de saisie.
    expect((element.querySelector('input') as HTMLInputElement).readOnly).toBe(
      true,
    )
  })

  it('reconnaît une grille entièrement juste', () => {
    setOutputHtml()
    document.body.innerHTML = KenKenGrilleElement.create({
      taille: 4,
      cages: grilleDeReference().cages,
      numeroExercice: 3,
      questionIndex: 0,
    })
    const element = document.getElementById(
      'kenken-grilleEx3Q0',
    ) as KenKenGrilleElement
    element.value = { L1C1: '1', L1C2: '2', L1C3: '3', L1C4: '4' }
    const resultat = KenKenGrilleElement.verifQuestion(
      exerciceDeTest() as unknown as Exercice,
      0,
    )
    expect(resultat.isOk).toBe(true)
    expect(resultat.score).toEqual({ nbBonnesReponses: 4, nbReponses: 4 })
  })

  it('arrondit la note à l’entier inférieur quand la taille diffère du nombre de cases', () => {
    setOutputHtml()
    document.body.innerHTML = KenKenGrilleElement.create({
      taille: 4,
      cages: grilleDeReference().cages,
      numeroExercice: 3,
      questionIndex: 0,
    })
    const element = document.getElementById(
      'kenken-grilleEx3Q0',
    ) as KenKenGrilleElement
    element.value = { L1C1: '1', L1C2: '2', L1C3: '4', L1C4: '' }
    // sup: 3 sélectionne le format 5 × 5, noté sur 5 points.
    const exercice = { ...exerciceDeTest(), sup: 3 }
    const resultat = KenKenGrilleElement.verifQuestion(
      exercice as unknown as Exercice,
      0,
    )
    // 2 cases justes sur 4, avec un barème sur 5 : floor(2 / 4 * 5) = 2.
    expect(resultat.score).toEqual({ nbBonnesReponses: 2, nbReponses: 5 })
  })

  it('étiquette les cages comme le veut le jeu', () => {
    expect(etiquetteCage({ cases: [0, 1], operation: '+', resultat: 7 })).toBe(
      '7+',
    )
    expect(etiquetteCage({ cases: [0, 1], operation: '÷', resultat: 3 })).toBe(
      '3÷',
    )
    expect(etiquetteCage({ cases: [0], operation: '=', resultat: 2 })).toBe('2')
  })
})
