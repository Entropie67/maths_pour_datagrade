import seedrandom from 'seedrandom'
import { afterEach, describe, expect, it } from 'vitest'
import { orangeMathalea } from '../../src/lib/colors'
import {
  renderLatexGrilleTables,
  renderTypstGrilleTables,
  TablesEffaceesGrilleElement,
} from '../../src/lib/customElements/TablesEffaceesGrilleElement'
import {
  amorceCorrection,
  compteSolutionsTables,
  estResoluble,
  genereTablesEffacees,
  nbCasesVides,
  solutionComplete,
  toutesLesCases,
  valeurCase,
  type GrilleTables,
} from '../../src/lib/outils/tablesEffacees'
import {
  context,
  setOutputHtml,
  setOutputLatex,
} from '../../src/modules/context'

/** Une grille 3 × 3 écrite à la main : facteurs de lignes 3, 6, 2 ; colonnes 7, 3, 2. */
function grilleDeReference(): GrilleTables {
  const grille: GrilleTables = {
    taille: 3,
    lignes: [3, 6, 2],
    colonnes: [7, 3, 2],
    donnees: [],
  }
  // On révèle de quoi rendre la solution unique et déductible : le facteur 3
  // en haut de la 2ᵉ colonne, et les produits 21, 18, 6, 4.
  grille.donnees = [
    2, // (ligne 0, colonne 2) → facteur de colonne 3
    5, // (ligne 1, colonne 1) → 21
    10, // (ligne 2, colonne 2) → 18
    14, // (ligne 3, colonne 2) → 6
    15, // (ligne 3, colonne 3) → 4
  ]
  return grille
}

afterEach(() => {
  setOutputHtml()
  context.isTypst = false
  document.body.innerHTML = ''
  seedrandom(undefined, { global: true })
})

describe('géométrie de la grille', () => {
  it('lit les facteurs sur les bords et les produits à l’intérieur', () => {
    const grille = grilleDeReference()
    expect(valeurCase(grille, 0)).toBeNull()
    expect(valeurCase(grille, 1)).toBe(7) // en-tête de la 1ʳᵉ colonne
    expect(valeurCase(grille, 3)).toBe(2) // en-tête de la 3ᵉ colonne
    expect(valeurCase(grille, 4)).toBe(3) // en-tête de la 1ʳᵉ ligne
    expect(valeurCase(grille, 5)).toBe(21) // 3 × 7
    expect(valeurCase(grille, 15)).toBe(4) // 2 × 2
  })

  it('sérialise la solution complète avec un coin nul', () => {
    const solution = solutionComplete(grilleDeReference())
    expect(solution).toHaveLength(16)
    expect(solution[0]).toBe(0)
    expect(solution[5]).toBe(21)
  })

  it('énumère toutes les cases sauf le coin', () => {
    expect(toutesLesCases(3)).toHaveLength(15)
    expect(toutesLesCases(3)).not.toContain(0)
  })
})

describe('analyse des grilles', () => {
  it('reconnaît une grille de référence à solution unique et déductible', () => {
    const grille = grilleDeReference()
    expect(compteSolutionsTables(grille, grille.donnees, 2)).toBe(1)
    expect(estResoluble(grille, grille.donnees)).toBe(true)
  })

  it('compte plusieurs solutions quand une colonne n’a aucune case donnée', () => {
    const grille = grilleDeReference()
    // On retire les deux seules cases qui renseignent la 1ʳᵉ colonne (index 5).
    const donnees = grille.donnees.filter((index) => index !== 5)
    expect(compteSolutionsTables(grille, donnees, 2)).toBeGreaterThan(1)
    expect(estResoluble(grille, donnees)).toBe(false)
  })

  it('ne se laisse pas berner par une case donnée en trop', () => {
    const grille = grilleDeReference()
    const donnees = [...grille.donnees, 6] // ajoute le produit 6 (ligne 1, colonne 2)
    expect(compteSolutionsTables(grille, donnees, 2)).toBe(1)
  })
})

describe('génération', () => {
  it('produit pour chaque taille une grille unique et déductible', () => {
    for (const taille of [2, 3, 4, 5, 6]) {
      seedrandom(`tables${taille}`, { global: true })
      const grille = genereTablesEffacees({ taille })
      expect(grille.taille).toBe(taille)
      expect(new Set(grille.lignes).size).toBe(taille)
      expect(new Set(grille.colonnes).size).toBe(taille)
      expect(grille.lignes.every((facteur) => facteur >= 2)).toBe(true)
      expect(grille.colonnes.every((facteur) => facteur >= 2)).toBe(true)
      expect(compteSolutionsTables(grille, grille.donnees, 2)).toBe(1)
      expect(estResoluble(grille, grille.donnees)).toBe(true)
    }
  })

  it('laisse au moins une case à trouver', () => {
    for (const taille of [3, 4, 5]) {
      seedrandom(`tablesTrous${taille}`, { global: true })
      const grille = genereTablesEffacees({ taille })
      expect(grille.donnees.length).toBeLessThan(toutesLesCases(taille).length)
    }
  })

  it('laisse toujours le même nombre de cases vides pour une taille donnée', () => {
    for (const taille of [2, 3, 4, 5, 6]) {
      for (let graine = 0; graine < 40; graine++) {
        seedrandom(`tablesVides${taille}-${graine}`, { global: true })
        const grille = genereTablesEffacees({
          taille,
          casesVidesFixes: true,
        })
        expect(
          toutesLesCases(taille).length - grille.donnees.length,
          `taille ${taille}, graine ${graine}`,
        ).toBe(nbCasesVides(taille))
        expect(compteSolutionsTables(grille, grille.donnees, 2)).toBe(1)
        expect(estResoluble(grille, grille.donnees)).toBe(true)
      }
    }
  })

  it('ne dépend que de la graine, pas de l’horloge', () => {
    seedrandom('tablesStable', { global: true })
    const premiere = genereTablesEffacees({ taille: 4 })
    seedrandom('tablesStable', { global: true })
    const seconde = genereTablesEffacees({ taille: 4 })
    expect(seconde).toEqual(premiere)
  })
})

describe('rendus du composant tables-effacees-grille', () => {
  it('construit une case par valeur et un champ par case à trouver', () => {
    setOutputHtml()
    const grille = grilleDeReference()
    const donnees = grille.donnees.map(
      (index) => [index, valeurCase(grille, index) as number] as [number, number],
    )
    document.body.innerHTML = TablesEffaceesGrilleElement.create({
      taille: 3,
      donnees,
    })
    const element = document.querySelector(
      'tables-effacees-grille',
    ) as TablesEffaceesGrilleElement
    // 16 cases dans une grille 4 × 4, le coin sans champ, 5 valeurs données :
    // il reste 10 champs de saisie.
    expect(element.querySelectorAll('[data-case]')).toHaveLength(16 + 10)
    expect(element.querySelectorAll('input')).toHaveLength(10)
    expect(element.querySelector('div[data-case="0"]')?.textContent).toBe('×')
  })

  it('n’écrit jamais la solution dans l’énoncé', () => {
    setOutputHtml()
    const grille = grilleDeReference()
    const donnees = grille.donnees.map(
      (index) => [index, valeurCase(grille, index) as number] as [number, number],
    )
    document.body.innerHTML = TablesEffaceesGrilleElement.create({
      taille: 3,
      donnees,
      solution: solutionComplete(grille),
      interactivityOn: true,
    })
    const element = document.querySelector(
      'tables-effacees-grille',
    ) as TablesEffaceesGrilleElement
    expect(element.getAttribute('solution')).toBeNull()
    expect(element.querySelectorAll('input')).toHaveLength(10)
  })

  it('laisse les cases à trouver vides hors interactivité, sans solution', () => {
    setOutputHtml()
    const grille = grilleDeReference()
    const donnees = grille.donnees.map(
      (index) => [index, valeurCase(grille, index) as number] as [number, number],
    )
    // L'énoncé non interactif ne reçoit pas de solution : les cases à trouver
    // restent des champs vides (en lecture seule), aucune valeur n'est révélée.
    document.body.innerHTML = TablesEffaceesGrilleElement.create({
      taille: 3,
      donnees,
      interactivityOn: false,
    })
    const element = document.querySelector(
      'tables-effacees-grille',
    ) as TablesEffaceesGrilleElement
    const champs = [...element.querySelectorAll('input')]
    expect(champs).toHaveLength(10)
    expect(champs.every((champ) => champ.value === '' && champ.readOnly)).toBe(
      true,
    )
    // Seules les 5 valeurs données (plus le signe ×) sont écrites.
    const ecrites = [...element.querySelectorAll('span')].map((s) =>
      s.textContent?.trim(),
    )
    expect(ecrites.filter((t) => t && t !== '×')).toHaveLength(5)
  })

  it('affiche la solution en évidence dans la correction', () => {
    setOutputHtml()
    const grille = grilleDeReference()
    const donnees = grille.donnees.map(
      (index) => [index, valeurCase(grille, index) as number] as [number, number],
    )
    document.body.innerHTML = TablesEffaceesGrilleElement.create({
      taille: 3,
      donnees,
      solution: solutionComplete(grille),
      interactivityOn: false,
    })
    const element = document.querySelector(
      'tables-effacees-grille',
    ) as TablesEffaceesGrilleElement
    expect(element.querySelectorAll('input')).toHaveLength(0)
    // La case (ligne 0, colonne 1) porte le facteur 7 : non donnée, elle est
    // affichée en évidence dans la correction.
    const caseTrouvee = element.querySelector(
      'div[data-case="1"]',
    ) as HTMLElement
    const sonde = document.createElement('div')
    sonde.style.color = orangeMathalea
    expect(caseTrouvee.querySelector('span')?.style.color).toBe(
      sonde.style.color,
    )
    expect(caseTrouvee.querySelector('span')?.textContent).toBe('7')
  })

  it('restitue et relit les saisies de l’élève', () => {
    setOutputHtml()
    const grille = grilleDeReference()
    const donnees = grille.donnees.map(
      (index) => [index, valeurCase(grille, index) as number] as [number, number],
    )
    document.body.innerHTML = TablesEffaceesGrilleElement.create({
      taille: 3,
      donnees,
    })
    const element = document.querySelector(
      'tables-effacees-grille',
    ) as TablesEffaceesGrilleElement
    element.value = { L1C2: '7', L2C4: '6' }
    expect(element.value.L1C2).toBe('7')
    expect(element.value.L2C4).toBe('6')
    element.value = JSON.stringify({ L2C3: '9' })
    expect(element.value.L2C3).toBe('9')
  })

  it('refuse les caractères non numériques', () => {
    setOutputHtml()
    const grille = grilleDeReference()
    const donnees = grille.donnees.map(
      (index) => [index, valeurCase(grille, index) as number] as [number, number],
    )
    document.body.innerHTML = TablesEffaceesGrilleElement.create({
      taille: 3,
      donnees,
    })
    const champ = document.querySelector('input') as HTMLInputElement
    champ.value = '2a1'
    champ.dispatchEvent(new Event('input', { bubbles: true }))
    expect(champ.value).toBe('21')
  })

  it('produit un tracé tikz sans solution pour l’énoncé', () => {
    setOutputLatex()
    const grille = grilleDeReference()
    const donnees = grille.donnees.map(
      (index) => [index, valeurCase(grille, index) as number] as [number, number],
    )
    const latex = TablesEffaceesGrilleElement.create({
      taille: 3,
      donnees,
      solution: solutionComplete(grille),
      interactivityOn: true,
    })
    expect(latex).toContain('\\begin{tikzpicture}')
    expect(latex).toContain('{$\\times$}')
    expect(latex).toContain('{$21$}')
    expect(latex).not.toContain('\\color')
  })

  it('remplit et met en évidence le tracé tikz de la correction', () => {
    setOutputLatex()
    const grille = grilleDeReference()
    const latex = renderLatexGrilleTables({
      taille: 3,
      donnees: new Map(),
      solution: solutionComplete(grille),
    })
    expect(latex).toContain('\\color')
    expect((latex.match(/\\node\[font=\\large\]/g) ?? []).length).toBe(16)
  })

  it('produit un tableau Typst encapsulé dans le marqueur attendu', () => {
    setOutputHtml()
    context.isTypst = true
    const grille = grilleDeReference()
    const donnees = grille.donnees.map(
      (index) => [index, valeurCase(grille, index) as number] as [number, number],
    )
    const typst = TablesEffaceesGrilleElement.create({ taille: 3, donnees })
    expect(typst.startsWith('<mathalea-typst>')).toBe(true)
    expect(typst.endsWith('</mathalea-typst>')).toBe(true)
    expect(typst).toContain('columns: (1cm,) * 4')
    expect(typst).toContain('$times$')
  })

  it('met la solution en évidence dans le Typst de la correction', () => {
    const grille = grilleDeReference()
    const typst = renderTypstGrilleTables({
      taille: 3,
      donnees: new Map(),
      solution: solutionComplete(grille),
    })
    expect(typst).toContain(`fill: rgb("${orangeMathalea}")`)
  })
})

describe('interactivité et score', () => {
  function exerciceDeTest(): {
    numeroExercice: number
    answers: Record<string, string>
    autoCorrection: { valeur: Record<string, { value: string }> }[]
  } {
    const grille = grilleDeReference()
    const donnees = new Set(grille.donnees)
    const cote = grille.taille + 1
    const valeur: Record<string, { value: string }> = {}
    for (const index of toutesLesCases(grille.taille)) {
      if (donnees.has(index)) continue
      const ligne = Math.floor(index / cote)
      const colonne = index % cote
      valeur[`L${ligne + 1}C${colonne + 1}`] = {
        value: String(valeurCase(grille, index)),
      }
    }
    return { numeroExercice: 7, answers: {}, autoCorrection: [{ valeur }] }
  }

  type Exercice = Parameters<typeof TablesEffaceesGrilleElement.verifQuestion>[0]

  it('compte un point par case à remplir', () => {
    const exercice = exerciceDeTest()
    expect(
      TablesEffaceesGrilleElement.pointsMaxQuestion(
        exercice as unknown as Exercice,
        0,
      ),
    ).toBe(10)
  })

  it('attribue un point par case correctement remplie et fige la grille', () => {
    setOutputHtml()
    const grille = grilleDeReference()
    const donnees = grille.donnees.map(
      (index) => [index, valeurCase(grille, index) as number] as [number, number],
    )
    document.body.innerHTML = TablesEffaceesGrilleElement.create({
      taille: 3,
      donnees,
      numeroExercice: 7,
      questionIndex: 0,
    })
    const element = document.getElementById(
      'tables-effacees-grilleEx7Q0',
    ) as TablesEffaceesGrilleElement
    // Deux bonnes réponses : le facteur 7 en (L1C2) et le produit 42 en (L3C2).
    element.value = { L1C2: '7', L3C2: '42' }
    const exercice = exerciceDeTest()
    const resultat = TablesEffaceesGrilleElement.verifQuestion(
      exercice as unknown as Exercice,
      0,
    )
    expect(resultat.isOk).toBe(false)
    expect(resultat.score).toEqual({ nbBonnesReponses: 2, nbReponses: 10 })
    expect(element.interactivityOn).toBe(false)
    expect(element.textContent).toContain(
      '2 cases correctement complétées sur 10.',
    )
    expect((element.querySelector('input') as HTMLInputElement).readOnly).toBe(
      true,
    )
  })

  it('reconnaît une grille entièrement juste', () => {
    setOutputHtml()
    const grille = grilleDeReference()
    const donnees = grille.donnees.map(
      (index) => [index, valeurCase(grille, index) as number] as [number, number],
    )
    document.body.innerHTML = TablesEffaceesGrilleElement.create({
      taille: 3,
      donnees,
      numeroExercice: 7,
      questionIndex: 0,
    })
    const element = document.getElementById(
      'tables-effacees-grilleEx7Q0',
    ) as TablesEffaceesGrilleElement
    const cote = grille.taille + 1
    const attendues: Record<string, string> = {}
    for (const index of toutesLesCases(grille.taille)) {
      if (new Set(grille.donnees).has(index)) continue
      const ligne = Math.floor(index / cote)
      const colonne = index % cote
      attendues[`L${ligne + 1}C${colonne + 1}`] = String(
        valeurCase(grille, index),
      )
    }
    element.value = attendues
    const resultat = TablesEffaceesGrilleElement.verifQuestion(
      exerciceDeTest() as unknown as Exercice,
      0,
    )
    expect(resultat.isOk).toBe(true)
    expect(resultat.score).toEqual({ nbBonnesReponses: 10, nbReponses: 10 })
  })
})

describe('amorce de correction', () => {
  it('désigne une case dont un facteur de bord est connu', () => {
    const texte = amorceCorrection(grilleDeReference())
    expect(texte).toContain('Commencer par la case')
    // Le facteur 3 en haut de la colonne du 18 est connu : 18 ÷ 3 = 6.
    expect(texte).toContain('18 \\div 3 = 6')
  })
})
