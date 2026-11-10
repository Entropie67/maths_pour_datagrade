import seedrandom from 'seedrandom'
import { afterEach, describe, expect, it } from 'vitest'
import { orangeMathalea } from '../../src/lib/colors'
import {
  GrimukuGrilleElement,
  renderLatexGrille,
  renderTypstGrille,
  serialiseGrises,
} from '../../src/lib/customElements/GrimukuGrilleElement'
import {
  casesAChercher,
  casesBlanches,
  compteSolutions,
  evalueDifficulte,
  genereGrimuku,
  motifDesCasesGrises,
  repartitionsPossibles,
  type FlecheGrimuku,
  type GrilleGrimuku,
  type NiveauGrimuku,
} from '../../src/lib/outils/grimuku'
import Grimuku from '../../src/exercices/enigmes-jeux/EN-grimuku'
import {
  context,
  setOutputHtml,
  setOutputLatex,
} from '../../src/modules/context'

/**
 * Une grille écrite à la main : 3 × 3, deux flèches qui se croisent sur la case
 * centrale, le reste en cases grises ou données.
 *
 *   G  [4↓] G
 *  [6→] .   .
 *   G   G   G
 */
function grilleDeReference(): GrilleGrimuku {
  const grises = [true, true, true, true, false, false, true, false, true]
  const solution = [0, 0, 0, 0, 2, 3, 0, 2, 0]
  const fleches: FlecheGrimuku[] = [
    { indice: 3, direction: 'droite', cases: [4, 5], produit: 6 },
    { indice: 1, direction: 'bas', cases: [4, 7], produit: 4 },
  ]
  return { lignes: 3, colonnes: 3, grises, solution, fleches, donnees: [] }
}

/** L'état d'affichage attendu par les rendus imprimables. */
function etatDeReference(avecSolution: boolean) {
  const grille = grilleDeReference()
  return {
    lignes: grille.lignes,
    colonnes: grille.colonnes,
    grises: grille.grises,
    fleches: grille.fleches,
    donnees: new Map<number, number>(),
    solution: avecSolution ? grille.solution : null,
  }
}

afterEach(() => {
  setOutputHtml()
  context.isTypst = false
  document.body.innerHTML = ''
  seedrandom(undefined, { global: true })
})

describe('Exercice Grimuku', () => {
  it('génère une grille et une correction pour chaque question demandée', () => {
    const exercice = new Grimuku()
    exercice.numeroExercice = 0
    exercice.nbQuestions = 2

    exercice.nouvelleVersion()

    expect(exercice.nbQuestionsModifiable).toBe(true)
    expect(exercice.listeQuestions).toHaveLength(2)
    expect(exercice.listeCorrections).toHaveLength(2)
    expect(exercice.listeQuestions[0]).toContain('Q0')
    expect(exercice.listeQuestions[1]).toContain('Q1')
    expect(exercice.autoCorrection).toHaveLength(2)
  })
})

describe('génération des grilles de grimuku', () => {
  it('pose les cases grises en diagonale, une sur la période', () => {
    const grises = motifDesCasesGrises(4, 4, 3, 0, true)
    // (ligne + colonne) multiple de 3 : (0,0), (1,2), (2,1), (3,0), (3,3)...
    expect(grises[0]).toBe(true)
    expect(grises[1]).toBe(false)
    expect(grises[2]).toBe(false)
    expect(grises[3]).toBe(true)
    expect(grises[1 * 4 + 2]).toBe(true)
    // Chaque suite de cases blanches compte au plus période - 1 cases.
    for (let ligne = 0; ligne < 4; ligne++) {
      let suite = 0
      for (let colonne = 0; colonne < 4; colonne++) {
        suite = grises[ligne * 4 + colonne] ? 0 : suite + 1
        expect(suite).toBeLessThanOrEqual(2)
      }
    }
  })

  it('accroche chaque flèche à une case grise voisine de sa première case', () => {
    for (const niveau of [1, 2, 3] as NiveauGrimuku[]) {
      const grille = genereGrimuku({ lignes: 6, colonnes: 6, niveau })
      for (const fleche of grille.fleches) {
        expect(grille.grises[fleche.indice]).toBe(true)
        expect(fleche.cases.length).toBeGreaterThanOrEqual(2)
        const pas = { droite: 1, gauche: -1, bas: 6, haut: -6 }[
          fleche.direction
        ]
        // Les cases se suivent depuis la case grise, dans le sens de la flèche.
        expect(fleche.cases[0]).toBe(fleche.indice + pas)
        fleche.cases.forEach((index, rang) => {
          expect(index).toBe(fleche.cases[0] + rang * pas)
          expect(grille.grises[index]).toBe(false)
        })
      }
    }
  })

  it('annonce dans chaque flèche le produit des chiffres de la solution', () => {
    const grille = genereGrimuku({ lignes: 6, colonnes: 6, niveau: 2 })
    for (const fleche of grille.fleches) {
      const produit = fleche.cases.reduce(
        (total, index) => total * grille.solution[index],
        1,
      )
      expect(produit).toBe(fleche.produit)
      expect(grille.solution[fleche.cases[0]]).toBeGreaterThanOrEqual(1)
      expect(grille.solution[fleche.cases[0]]).toBeLessThanOrEqual(9)
    }
  })

  it('ne laisse aucune case blanche sans flèche ni chiffre donné', () => {
    for (const niveau of [1, 2, 3] as NiveauGrimuku[]) {
      const grille = genereGrimuku({ lignes: 6, colonnes: 6, niveau })
      const couvertes = new Set([
        ...grille.fleches.flatMap((fleche) => fleche.cases),
        ...grille.donnees,
      ])
      for (const index of casesBlanches(grille)) {
        expect(couvertes.has(index)).toBe(true)
      }
    }
  })

  it('allonge les flèches avec le niveau de difficulté', () => {
    const plusLongue = (niveau: NiveauGrimuku): number => {
      seedrandom(`grimukuLongueur${niveau}`, { global: true })
      const grille = genereGrimuku({ lignes: 6, colonnes: 6, niveau })
      return Math.max(...grille.fleches.map((fleche) => fleche.cases.length))
    }
    expect(plusLongue(1)).toBe(2)
    expect(plusLongue(2)).toBe(3)
    expect(plusLongue(3)).toBe(4)
  })

  it('ne produit que des grilles à solution unique', () => {
    for (const niveau of [1, 2, 3] as NiveauGrimuku[]) {
      seedrandom(`grimukuUnicite${niveau}`, { global: true })
      const grille = genereGrimuku({ lignes: 5, colonnes: 5, niveau })
      expect(compteSolutions(grille, 2)).toBe(1)
    }
  })

  it('produit des grilles qui se résolvent par déduction, au niveau demandé', () => {
    for (const [lignes, colonnes] of [
      [5, 5],
      [6, 6],
    ]) {
      for (const niveau of [1, 2, 3] as NiveauGrimuku[]) {
        seedrandom(`grimuku${lignes}${colonnes}${niveau}`, { global: true })
        const evaluation = evalueDifficulte(
          genereGrimuku({ lignes, colonnes, niveau }),
        )
        expect(evaluation.resolue).toBe(true)
        expect(evaluation.niveauMax).toBe(niveau)
      }
    }
  })

  it('garde des produits calculables de tête', () => {
    for (const niveau of [1, 2, 3] as NiveauGrimuku[]) {
      const grille = genereGrimuku({ lignes: 6, colonnes: 6, niveau })
      for (const fleche of grille.fleches) {
        expect(fleche.produit).toBeLessThanOrEqual(250)
      }
    }
  })

  it('énumère les répartitions possibles d’une flèche', () => {
    const grille = grilleDeReference()
    // 6 sur deux cases : 1 × 6, 2 × 3, 3 × 2 et 6 × 1.
    expect(repartitionsPossibles(grille, grille.fleches[0])).toEqual([
      [1, 6],
      [2, 3],
      [3, 2],
      [6, 1],
    ])
    // 4 sur deux cases : 1 × 4, 2 × 2 et 4 × 1 — le chiffre peut se répéter.
    expect(repartitionsPossibles(grille, grille.fleches[1])).toEqual([
      [1, 4],
      [2, 2],
      [4, 1],
    ])
  })
})

describe('rendus du composant grimuku-grille', () => {
  it('construit une case par cellule et un champ par chiffre à trouver', () => {
    setOutputHtml()
    const grille = grilleDeReference()
    document.body.innerHTML = GrimukuGrilleElement.create({
      lignes: 3,
      colonnes: 3,
      grises: grille.grises,
      fleches: grille.fleches,
    })
    const element = document.querySelector(
      'grimuku-grille',
    ) as GrimukuGrilleElement
    expect(element.querySelectorAll('div[data-case]')).toHaveLength(9)
    // Trois cases blanches, aucun chiffre donné.
    expect(element.querySelectorAll('input')).toHaveLength(3)
    expect(Object.keys(element.value).sort()).toEqual(['L2C2', 'L2C3', 'L3C2'])
  })

  it('dimensionne la grille en em pour suivre le zoom des vues', () => {
    setOutputHtml()
    const grille = grilleDeReference()
    document.body.innerHTML = GrimukuGrilleElement.create({
      lignes: 3,
      colonnes: 3,
      grises: grille.grises,
      fleches: grille.fleches,
    })
    const element = document.querySelector(
      'grimuku-grille',
    ) as GrimukuGrilleElement
    const damier = element.querySelector('div > div') as HTMLElement
    expect(damier.style.gridTemplateColumns).toBe('repeat(3, 2.8em)')
    const premiere = element.querySelector('div[data-case="0"]') as HTMLElement
    expect(premiere.style.width).toBe('2.8em')
    expect(premiere.style.height).toBe('2.8em')
  })

  it('écrit chaque flèche dans la moitié de case grise qui lui revient', () => {
    setOutputHtml()
    const grille = grilleDeReference()
    document.body.innerHTML = GrimukuGrilleElement.create({
      lignes: 3,
      colonnes: 3,
      grises: grille.grises,
      fleches: grille.fleches,
    })
    // La flèche horizontale occupe la moitié haute, la verticale la moitié basse.
    const horizontale = document.querySelector(
      'div[data-case="3"] [data-moitie="haut"]',
    ) as HTMLElement
    expect(horizontale.textContent).toBe('6→')
    const verticale = document.querySelector(
      'div[data-case="1"] [data-moitie="bas"]',
    ) as HTMLElement
    expect(verticale.textContent).toBe('4↓')
    // Une case grise sans flèche reste unie.
    const vide = document.querySelector('div[data-case="0"]') as HTMLElement
    expect(vide.textContent).toBe('')
  })

  it('place la flèche avant son nombre quand elle se lit vers la gauche', () => {
    setOutputHtml()
    const grises = [true, false, false, true, true, true, true, true, true]
    document.body.innerHTML = GrimukuGrilleElement.create({
      lignes: 3,
      colonnes: 3,
      grises,
      fleches: [{ indice: 3, direction: 'gauche', cases: [2, 1], produit: 12 }],
    })
    const moitie = document.querySelector(
      'div[data-case="3"] [data-moitie="haut"]',
    ) as HTMLElement
    expect(moitie.textContent).toBe('12←')
    // Le nombre est écrit après la flèche : c'est l'ordre d'affichage qui change.
    expect(moitie.style.flexDirection).toBe('row-reverse')
  })

  it('n’écrit jamais la solution dans l’énoncé', () => {
    setOutputHtml()
    const grille = grilleDeReference()
    document.body.innerHTML = GrimukuGrilleElement.create({
      lignes: 3,
      colonnes: 3,
      grises: grille.grises,
      fleches: grille.fleches,
      solution: grille.solution,
      interactivityOn: true,
    })
    const element = document.querySelector(
      'grimuku-grille',
    ) as GrimukuGrilleElement
    expect(element.getAttribute('solution')).toBeNull()
    expect(element.querySelectorAll('input')).toHaveLength(3)
  })

  it('affiche la solution en évidence dans la correction', () => {
    setOutputHtml()
    const grille = grilleDeReference()
    document.body.innerHTML = GrimukuGrilleElement.create({
      lignes: 3,
      colonnes: 3,
      grises: grille.grises,
      fleches: grille.fleches,
      solution: grille.solution,
      interactivityOn: false,
    })
    const element = document.querySelector(
      'grimuku-grille',
    ) as GrimukuGrilleElement
    expect(element.querySelectorAll('input')).toHaveLength(0)
    const centrale = element.querySelector(
      'div[data-case="4"] span',
    ) as HTMLElement
    expect(centrale.textContent).toBe('2')
    const sonde = document.createElement('div')
    sonde.style.color = orangeMathalea
    expect(centrale.style.color).toBe(sonde.style.color)
  })

  it('écrit d’avance les chiffres donnés, sans champ de saisie', () => {
    setOutputHtml()
    const grille = grilleDeReference()
    document.body.innerHTML = GrimukuGrilleElement.create({
      lignes: 3,
      colonnes: 3,
      grises: grille.grises,
      fleches: grille.fleches,
      donnees: [[4, 2]],
    })
    const element = document.querySelector(
      'grimuku-grille',
    ) as GrimukuGrilleElement
    expect(element.querySelectorAll('input')).toHaveLength(2)
    const donnee = element.querySelector(
      'div[data-case="4"] span',
    ) as HTMLElement
    expect(donnee.textContent).toBe('2')
    // Un chiffre donné est écrit en noir : il n'est pas à trouver.
    expect(donnee.style.color).toBe('')
  })

  it('restitue et relit les saisies de l’élève', () => {
    setOutputHtml()
    const grille = grilleDeReference()
    document.body.innerHTML = GrimukuGrilleElement.create({
      lignes: 3,
      colonnes: 3,
      grises: grille.grises,
      fleches: grille.fleches,
    })
    const element = document.querySelector(
      'grimuku-grille',
    ) as GrimukuGrilleElement
    element.value = { L2C2: '2', L2C3: '3' }
    expect(element.value).toEqual({ L2C2: '2', L2C3: '3', L3C2: '' })
    element.value = JSON.stringify({ L3C2: '2' })
    expect(element.value.L3C2).toBe('2')
  })

  it('sérialise les cases grises en une suite de 0 et de 1', () => {
    expect(serialiseGrises([true, false, true])).toBe('101')
  })

  it('produit un tracé tikz sans solution pour l’énoncé', () => {
    setOutputLatex()
    const grille = grilleDeReference()
    const latex = GrimukuGrilleElement.create({
      lignes: 3,
      colonnes: 3,
      grises: grille.grises,
      fleches: grille.fleches,
      solution: grille.solution,
      interactivityOn: true,
    })
    expect(latex).toContain('\\begin{tikzpicture}')
    expect(latex).toContain('\\fill[black!15]')
    expect(latex).toContain('{6 $\\rightarrow$}')
    expect(latex).toContain('{4 $\\downarrow$}')
    expect(latex).not.toContain('\\color')
  })

  it('remplit le tracé tikz dans la correction', () => {
    setOutputLatex()
    const latex = renderLatexGrille(etatDeReference(true))
    expect(latex).toContain('\\color')
    // Trois cases blanches remplies.
    expect((latex.match(/\\node\[font=\\large\]/g) ?? []).length).toBe(3)
  })

  it('produit un tableau Typst encapsulé dans le marqueur attendu', () => {
    setOutputHtml()
    context.isTypst = true
    const grille = grilleDeReference()
    const typst = GrimukuGrilleElement.create({
      lignes: 3,
      colonnes: 3,
      grises: grille.grises,
      fleches: grille.fleches,
    })
    expect(typst.startsWith('<mathalea-typst>')).toBe(true)
    expect(typst.endsWith('</mathalea-typst>')).toBe(true)
    expect(typst).toContain('table.cell(fill: luma(220))')
    expect(typst).toContain('6 #sym.arrow.r')
    expect(typst).toContain('4 #sym.arrow.b')
    expect(typst).toContain('columns: (1cm,) * 3')
  })

  it('écrit la solution dans le Typst de la correction', () => {
    const typst = renderTypstGrille(etatDeReference(true))
    expect(typst).toContain(`fill: rgb("${orangeMathalea}")`)
  })
})

describe('interactivité et score', () => {
  /**
   * Un exercice minimal portant les réponses attendues de la grille de
   * référence. `sup: 1` sélectionne le format 5 × 5, noté sur 5 points.
   */
  function exerciceDeTest(): {
    numeroExercice: number
    sup: number
    answers: Record<string, string>
    autoCorrection: { valeur: Record<string, { value: string }> }[]
  } {
    return {
      numeroExercice: 3,
      sup: 1,
      answers: {},
      autoCorrection: [
        {
          valeur: {
            L2C2: { value: '2' },
            L2C3: { value: '3' },
            L3C2: { value: '2' },
          },
        },
      ],
    }
  }

  type Exercice = Parameters<typeof GrimukuGrilleElement.verifQuestion>[0]

  function monteLaGrille(): GrimukuGrilleElement {
    setOutputHtml()
    const grille = grilleDeReference()
    document.body.innerHTML = GrimukuGrilleElement.create({
      lignes: 3,
      colonnes: 3,
      grises: grille.grises,
      fleches: grille.fleches,
      numeroExercice: 3,
      questionIndex: 0,
    })
    return document.getElementById(
      'grimuku-grilleEx3Q0',
    ) as GrimukuGrilleElement
  }

  it('note la grille sur le barème de son format', () => {
    expect(
      GrimukuGrilleElement.pointsMaxQuestion(
        exerciceDeTest() as unknown as Exercice,
        0,
      ),
    ).toBe(5)
  })

  it('note la proportion de cases correctement remplies et fige la grille', () => {
    const element = monteLaGrille()
    element.value = { L2C2: '2', L2C3: '9', L3C2: '' }
    const exercice = exerciceDeTest()
    const resultat = GrimukuGrilleElement.verifQuestion(
      exercice as unknown as Exercice,
      0,
    )
    // 1 case juste sur 3, avec un barème sur 5 : floor(1 / 3 * 5) = 1.
    expect(resultat).toEqual({
      isOk: false,
      feedback: '',
      score: { nbBonnesReponses: 1, nbReponses: 5 },
    })
    expect(exercice.answers['grimuku-grilleEx3Q0']).toBe(
      JSON.stringify({ L2C2: '2', L2C3: '9', L3C2: '' }),
    )
    expect(element.interactivityOn).toBe(false)
    expect(element.textContent).toContain('1 case correctement remplie sur 3.')
    expect((element.querySelector('input') as HTMLInputElement).readOnly).toBe(
      true,
    )
  })

  it('reconnaît une grille entièrement juste', () => {
    const element = monteLaGrille()
    element.value = { L2C2: '2', L2C3: '3', L3C2: '2' }
    const resultat = GrimukuGrilleElement.verifQuestion(
      exerciceDeTest() as unknown as Exercice,
      0,
    )
    expect(resultat.isOk).toBe(true)
    expect(resultat.score).toEqual({ nbBonnesReponses: 5, nbReponses: 5 })
  })

  it('garde le focus sur la case saisie et se déplace aux flèches', () => {
    const element = monteLaGrille()
    const champs = [...element.querySelectorAll('input')]
    champs[0].focus()
    champs[0].value = '2'
    champs[0].dispatchEvent(new Event('input', { bubbles: true }))
    expect(document.activeElement).toBe(champs[0])
    champs[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    )
    expect(document.activeElement).toBe(champs[1])
  })

  it('refuse un chiffre hors de la grille', () => {
    const element = monteLaGrille()
    const champ = element.querySelector('input') as HTMLInputElement
    champ.value = '0'
    champ.dispatchEvent(new Event('input', { bubbles: true }))
    expect(champ.value).toBe('')
    champ.value = '7'
    champ.dispatchEvent(new Event('input', { bubbles: true }))
    expect(champ.value).toBe('7')
  })

  it('laisse une grille sans réponse attendue sans planter', () => {
    monteLaGrille()
    const resultat = GrimukuGrilleElement.verifQuestion(
      {
        numeroExercice: 3,
        sup: 1,
        answers: {},
        autoCorrection: [],
      } as unknown as Exercice,
      0,
    )
    expect(resultat.score).toEqual({ nbBonnesReponses: 0, nbReponses: 5 })
  })

  it('compte les cases à chercher sans les chiffres donnés', () => {
    const grille = grilleDeReference()
    grille.donnees = [4]
    expect(casesBlanches(grille)).toEqual([4, 5, 7])
    expect(casesAChercher(grille)).toEqual([5, 7])
  })
})
