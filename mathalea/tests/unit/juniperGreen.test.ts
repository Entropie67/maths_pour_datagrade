import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  coupsPossibles,
  estimeCoupsRestants,
  JuniperGreenElement,
  raisonDuRefus,
  type ReglesJuniperGreen,
} from '../../src/lib/customElements/JuniperGreenElement'
import { bleuMathalea, orangeMathalea } from '../../src/lib/colors'
import JuniperGreen from '../../src/exercices/enigmes-jeux/EN-juniper-green'
import {
  context,
  setOutputHtml,
  setOutputLatex,
} from '../../src/modules/context'

/** jsdom normalise les couleurs posées via `style.xxx` : on compare deux couleurs en les faisant passer par la même normalisation. */
function normaliseCouleur(couleur: string): string {
  const sonde = document.createElement('div')
  sonde.style.backgroundColor = couleur
  return sonde.style.backgroundColor
}

const reglesLibres: ReglesJuniperGreen = {
  max: 40,
  modeDepart: 'libre',
}
const reglesSansPremierAuDepart: ReglesJuniperGreen = {
  max: 40,
  modeDepart: 'libreSansPremier',
}

afterEach(() => {
  setOutputHtml()
  context.isTypst = false
})

describe('règles du Juniper Green', () => {
  it('accepte n’importe quel nombre au premier coup', () => {
    expect(raisonDuRefus([], 23, reglesLibres)).toBeNull()
  })

  it('refuse un nombre premier au premier coup quand c’est interdit', () => {
    expect(raisonDuRefus([], 23, reglesSansPremierAuDepart)).toContain(
      'nombre premier',
    )
    // 1 n'est pas premier, il reste donc jouable.
    expect(raisonDuRefus([], 1, reglesSansPremierAuDepart)).toBeNull()
    expect(raisonDuRefus([], 24, reglesSansPremierAuDepart)).toBeNull()
  })

  it('n’accepte ensuite qu’un multiple ou un diviseur du dernier nombre', () => {
    expect(raisonDuRefus([12], 24, reglesLibres)).toBeNull()
    expect(raisonDuRefus([12], 4, reglesLibres)).toBeNull()
    expect(raisonDuRefus([12], 5, reglesLibres)).toContain(
      'ni un multiple ni un diviseur de 12',
    )
  })

  it('refuse un nombre déjà utilisé ou hors de la grille', () => {
    expect(raisonDuRefus([12, 24], 12, reglesLibres)).toContain(
      'déjà été utilisé',
    )
    expect(raisonDuRefus([12], 48, reglesLibres)).toContain(
      'pas dans la grille',
    )
  })

  it('ne laisse aucun coup après un grand nombre premier suivant le 1', () => {
    // 23 n'a que 1 pour diviseur et 46 sort de la grille.
    expect(coupsPossibles([1, 23], reglesLibres)).toEqual([])
    expect(coupsPossibles([23], reglesLibres)).toEqual([1])
  })

  it('exclut les nombres premiers des premiers coups possibles', () => {
    expect(coupsPossibles([], reglesSansPremierAuDepart)).not.toContain(7)
    expect(coupsPossibles([], reglesSansPremierAuDepart)).toContain(8)
  })

  it('calcule exactement le nombre de coups restants sur un petit état', () => {
    expect(
      estimeCoupsRestants([1, 3], { max: 6, modeDepart: 'libre' }),
    ).toEqual({ nombre: 3, exacte: true })
    expect(
      estimeCoupsRestants([1, 11], { max: 12, modeDepart: 'libre' }),
    ).toEqual({ nombre: 0, exacte: true })
  })

  it('rend une borne inférieure quand la recherche bornée est interrompue', () => {
    const estimation = estimeCoupsRestants([23], reglesLibres)
    expect(estimation.nombre).toBeGreaterThan(0)
    expect(estimation.exacte).toBe(false)
  })
})

describe('paramétrage de l’exercice Juniper Green', () => {
  it('regroupe les six réglages dans un formulaire complexe', () => {
    const exercice = new JuniperGreen()
    expect(exercice.besoinFormulaireComplexe).not.toBe(false)
    expect(String(exercice.sup).split('*')).toHaveLength(6)
    expect(exercice.besoinFormulaireNumerique).toBe(false)
    expect(exercice.besoinFormulaire5CaseACocher).toBe(false)
  })

  it('transmet au composant l’activation du décompte', () => {
    const exercice = new JuniperGreen()
    exercice.sup = '6*5*libre*1*0*1'
    exercice.nouvelleVersion()
    expect(exercice.listeQuestions[0]).toContain(
      'decompte-coups-restants="true"',
    )
  })
})

describe('rendus du composant juniper-green', () => {
  it('indique une borne sur le nombre de coups restants après un choix', () => {
    setOutputHtml()
    document.body.innerHTML = JuniperGreenElement.create({
      max: 6,
      decompteCoupsRestants: true,
    })
    ;(document.querySelector('[data-nombre="1"]') as HTMLButtonElement).click()
    ;(document.querySelector('[data-nombre="3"]') as HTMLButtonElement).click()
    const element = document.querySelector(
      'juniper-green',
    ) as JuniperGreenElement
    expect(element.textContent).toContain(
      'Au maximum, 3 coups sont encore possibles.',
    )
  })

  it('masque par défaut le décompte des coups restants', () => {
    setOutputHtml()
    document.body.innerHTML = JuniperGreenElement.create({ max: 6 })
    ;(document.querySelector('[data-nombre="1"]') as HTMLButtonElement).click()
    const element = document.querySelector(
      'juniper-green',
    ) as JuniperGreenElement
    expect(element.textContent).not.toContain('coups sont encore possibles')
  })

  it('rejoue la partie reçue et colorie les nombres utilisés en HTML', () => {
    setOutputHtml()
    document.body.innerHTML = JuniperGreenElement.create({
      max: 12,
      nombresParLigne: 5,
      suite: [4, 8, 1, 5],
      interactivityOn: false,
    })
    const element = document.querySelector(
      'juniper-green',
    ) as JuniperGreenElement
    expect(element.value).toEqual([4, 8, 1, 5])
    expect(element.textContent).toContain(
      'Suite des nombres choisis : 4 → 8 → 1 → 5.',
    )
    const nombresDeLaSuite =
      element.querySelectorAll<HTMLElement>('[data-index-coup]')
    expect(nombresDeLaSuite).toHaveLength(4)
    expect(nombresDeLaSuite[0].style.color).toBe(normaliseCouleur(bleuMathalea))
    expect(nombresDeLaSuite[1].style.color).toBe(
      normaliseCouleur(orangeMathalea),
    )
  })

  it('conserve les couleurs de la suite quand la partie se termine', () => {
    setOutputHtml()
    document.body.innerHTML = JuniperGreenElement.create({ max: 24 })
    const element = document.querySelector(
      'juniper-green',
    ) as JuniperGreenElement
    ;(element.querySelector('[data-nombre="1"]') as HTMLButtonElement).click()
    ;(element.querySelector('[data-nombre="23"]') as HTMLButtonElement).click()

    expect(element.textContent).toContain('Partie terminée')
    const nombresDeLaSuite =
      element.querySelectorAll<HTMLElement>('[data-index-coup]')
    expect(nombresDeLaSuite).toHaveLength(2)
    expect(nombresDeLaSuite[0].style.color).toBe(normaliseCouleur(bleuMathalea))
    expect(nombresDeLaSuite[1].style.color).toBe(
      normaliseCouleur(orangeMathalea),
    )
  })

  it('dévoile la partie une seconde par nombre quand l’animation est demandée', () => {
    vi.useFakeTimers()
    try {
      setOutputHtml()
      document.body.innerHTML = JuniperGreenElement.create({
        max: 12,
        nombresParLigne: 5,
        suite: [4, 8, 1, 5],
        animation: true,
        interactivityOn: false,
      })
      const element = document.querySelector(
        'juniper-green',
      ) as JuniperGreenElement
      // La partie complète reste l'état métier, seul l'affichage progresse.
      expect(element.value).toEqual([4, 8, 1, 5])
      expect(element.textContent).toContain('Suite des nombres choisis : 4.')
      vi.advanceTimersByTime(1000)
      expect(element.textContent).toContain(
        'Suite des nombres choisis : 4 → 8.',
      )
      vi.advanceTimersByTime(2000)
      expect(element.textContent).toContain(
        'Suite des nombres choisis : 4 → 8 → 1 → 5.',
      )
    } finally {
      vi.useRealTimers()
    }
  })

  it('dimensionne la grille en em pour suivre le zoom des vues', () => {
    setOutputHtml()
    document.body.innerHTML = JuniperGreenElement.create({
      max: 10,
      nombresParLigne: 5,
    })
    const element = document.querySelector(
      'juniper-green',
    ) as JuniperGreenElement
    const grille = element.querySelector('div > div') as HTMLElement
    // Le zoom pose une font-size en rem sur le conteneur de l'énoncé : une
    // taille en rem ou en pixels ne la suivrait pas.
    expect(grille.style.gridTemplateColumns).toBe('repeat(5, 2.25em)')
    expect(grille.style.gap).toBe('0.25em')
    const cellule = element.querySelector(
      '[data-nombre="1"]',
    ) as HTMLButtonElement
    expect(cellule.style.fontSize).toBe('1em')
    expect(cellule.style.width).toBe('2.25em')
    expect(cellule.style.height).toBe('2.25em')
  })

  it('tronque une partie reçue au premier coup illicite', () => {
    setOutputHtml()
    document.body.innerHTML = JuniperGreenElement.create({
      max: 12,
      nombresParLigne: 5,
      suite: [4, 8, 5],
    })
    const element = document.querySelector(
      'juniper-green',
    ) as JuniperGreenElement
    expect(element.value).toEqual([4, 8])
  })

  it('imprime une grille vide en LaTeX pour l’énoncé', () => {
    setOutputLatex()
    const latex = JuniperGreenElement.create({ max: 10, nombresParLigne: 5 })
    expect(latex).toContain('\\begin{tabular}{|c|c|c|c|c|}')
    expect(latex).not.toContain('color')
    expect(latex).not.toContain('Suite des nombres choisis')
  })

  it('met en évidence la partie exemple en LaTeX pour la correction', () => {
    setOutputLatex()
    const latex = JuniperGreenElement.create({
      max: 10,
      nombresParLigne: 5,
      suite: [4, 8, 1],
    })
    expect(latex).toContain('\\boldsymbol{4}')
    expect(latex).toContain(
      `Suite des nombres choisis : $${[
        `{\\color[HTML]{${bleuMathalea.slice(1)}}\\boldsymbol{4}}`,
        `{\\color[HTML]{${orangeMathalea.slice(1)}}\\boldsymbol{8}}`,
        `{\\color[HTML]{${bleuMathalea.slice(1)}}\\boldsymbol{1}}`,
      ].join(' \\to ')}$.`,
    )
  })

  it('produit une table Typst encadrée par le marqueur mathalea-typst', () => {
    setOutputHtml()
    context.isTypst = true
    const typst = JuniperGreenElement.create({
      max: 10,
      nombresParLigne: 5,
      suite: [4, 8],
    })
    expect(typst.startsWith('<mathalea-typst>')).toBe(true)
    expect(typst).toContain('table(columns: 5')
    expect(typst).toContain('Suite des nombres choisis : 4 → 8.')
  })

  it('alterne les couleurs bleu/orange à chaque coup dans la grille', () => {
    setOutputHtml()
    document.body.innerHTML = JuniperGreenElement.create({
      max: 12,
      nombresParLigne: 5,
      suite: [4, 8, 1],
      interactivityOn: false,
    })
    const cellule4 = document.querySelector(
      '[data-nombre="4"]',
    ) as HTMLButtonElement
    const cellule8 = document.querySelector(
      '[data-nombre="8"]',
    ) as HTMLButtonElement
    const cellule1 = document.querySelector(
      '[data-nombre="1"]',
    ) as HTMLButtonElement
    expect(cellule4.style.backgroundColor).toBe(normaliseCouleur(bleuMathalea))
    expect(cellule8.style.backgroundColor).toBe(
      normaliseCouleur(orangeMathalea),
    )
    expect(cellule1.style.backgroundColor).toBe(normaliseCouleur(bleuMathalea))
  })
})

describe('modes d’erreur du composant juniper-green', () => {
  it('en mode indication, un coup invalide affiche un message sans arrêter la partie', () => {
    setOutputHtml()
    document.body.innerHTML = JuniperGreenElement.create({
      max: 12,
      nombresParLigne: 5,
      modeErreur: 'indication',
    })
    const element = document.querySelector(
      'juniper-green',
    ) as JuniperGreenElement
    ;(document.querySelector('[data-nombre="5"]') as HTMLButtonElement).click()
    expect(element.value).toEqual([5])
    // 7 n'est ni un multiple ni un diviseur de 5 : coup refusé, mais la partie continue.
    ;(document.querySelector('[data-nombre="7"]') as HTMLButtonElement).click()
    expect(element.value).toEqual([5])
    expect(element.textContent).toContain(
      "7 n'est ni un multiple ni un diviseur de 5",
    )
    ;(document.querySelector('[data-nombre="10"]') as HTMLButtonElement).click()
    expect(element.value).toEqual([5, 10])
  })

  it('en mode arrêt, un coup invalide arrête la partie et détaille les possibilités restantes', () => {
    setOutputHtml()
    document.body.innerHTML = JuniperGreenElement.create({
      max: 12,
      nombresParLigne: 5,
      modeErreur: 'arret',
    })
    const element = document.querySelector(
      'juniper-green',
    ) as JuniperGreenElement
    ;(document.querySelector('[data-nombre="6"]') as HTMLButtonElement).click()
    expect(element.value).toEqual([6])
    // 7 n'est ni un multiple ni un diviseur de 6 : la partie s'arrête.
    ;(document.querySelector('[data-nombre="7"]') as HTMLButtonElement).click()
    expect(element.value).toEqual([6])
    expect(element.textContent).toContain('Partie arrêtée')
    expect(element.textContent).toContain('1, 2, 3, 12')
    expect(element.textContent).toContain('La suite compte 1 nombre.')
    // La partie est arrêtée : les coups suivants sont ignorés.
    ;(document.querySelector('[data-nombre="1"]') as HTMLButtonElement).click()
    expect(element.value).toEqual([6])
  })
})

describe('interactivité et score du composant juniper-green', () => {
  it('expose un score maximal de 2 points', () => {
    expect(JuniperGreenElement.pointsMaxQuestion()).toBe(2)
  })

  it('déclenche automatiquement le bouton "Vérifier" à la fin de la partie, même avec peu de coups', () => {
    setOutputHtml()
    document.body.innerHTML =
      '<button id="buttonScoreEx0"></button>' +
      JuniperGreenElement.create({
        max: 24,
        nombresParLigne: 5,
        numeroExercice: 0,
      })
    const bouton = document.getElementById(
      'buttonScoreEx0',
    ) as HTMLButtonElement
    const clic = vi.fn()
    bouton.addEventListener('click', clic)
    ;(document.querySelector('[data-nombre="1"]') as HTMLButtonElement).click()
    expect(clic).not.toHaveBeenCalled()
    // 23 est premier : après 1 → 23, plus aucun coup n'est possible.
    ;(document.querySelector('[data-nombre="23"]') as HTMLButtonElement).click()
    expect(clic).toHaveBeenCalledTimes(1)
  })

  it('déclenche automatiquement le bouton "Vérifier" quand une erreur arrête la partie', () => {
    setOutputHtml()
    document.body.innerHTML =
      '<button id="buttonScoreEx0"></button>' +
      JuniperGreenElement.create({
        max: 12,
        nombresParLigne: 5,
        numeroExercice: 0,
        modeErreur: 'arret',
      })
    const bouton = document.getElementById(
      'buttonScoreEx0',
    ) as HTMLButtonElement
    const clic = vi.fn()
    bouton.addEventListener('click', clic)
    ;(document.querySelector('[data-nombre="6"]') as HTMLButtonElement).click()
    expect(clic).not.toHaveBeenCalled()
    ;(document.querySelector('[data-nombre="7"]') as HTMLButtonElement).click()
    expect(clic).toHaveBeenCalledTimes(1)
  })

  it('finalise() attribue 2/2 pour une partie terminée, même avec moins de 4 nombres choisis', () => {
    setOutputHtml()
    document.body.innerHTML = JuniperGreenElement.create({
      max: 24,
      nombresParLigne: 5,
    })
    const element = document.querySelector(
      'juniper-green',
    ) as JuniperGreenElement
    ;(document.querySelector('[data-nombre="1"]') as HTMLButtonElement).click()
    ;(document.querySelector('[data-nombre="23"]') as HTMLButtonElement).click()
    expect(element.value).toEqual([1, 23])
    expect(element.finalise()).toBe(2)
    expect(element.textContent).toContain('Bravo')
    expect(element.textContent).not.toContain('Score :')
  })

  it('finalise() attribue 1/2 si au moins 4 nombres ont été choisis mais la partie n’est pas finie', () => {
    setOutputHtml()
    document.body.innerHTML = JuniperGreenElement.create({
      max: 40,
      nombresParLigne: 10,
    })
    const element = document.querySelector(
      'juniper-green',
    ) as JuniperGreenElement
    for (const nombre of [2, 4, 8, 16]) {
      ;(
        document.querySelector(`[data-nombre="${nombre}"]`) as HTMLButtonElement
      ).click()
    }
    expect(element.value).toEqual([2, 4, 8, 16])
    expect(element.finalise()).toBe(1)
    expect(element.textContent).not.toContain('Score :')
  })

  it('finalise() attribue 0/2 si moins de 4 nombres ont été choisis et la partie n’est pas finie', () => {
    setOutputHtml()
    document.body.innerHTML = JuniperGreenElement.create({
      max: 40,
      nombresParLigne: 10,
    })
    const element = document.querySelector(
      'juniper-green',
    ) as JuniperGreenElement
    ;(document.querySelector('[data-nombre="2"]') as HTMLButtonElement).click()
    expect(element.finalise()).toBe(0)
    expect(element.textContent).not.toContain('Score :')
  })

  it('verifQuestion() fige la partie, calcule le score et enregistre la réponse', () => {
    setOutputHtml()
    document.body.innerHTML = JuniperGreenElement.create({
      max: 24,
      nombresParLigne: 5,
      numeroExercice: 3,
      questionIndex: 0,
    })
    const element = document.getElementById(
      'juniper-greenEx3Q0',
    ) as JuniperGreenElement
    ;(document.querySelector('[data-nombre="1"]') as HTMLButtonElement).click()
    ;(document.querySelector('[data-nombre="23"]') as HTMLButtonElement).click()
    const exercice = { numeroExercice: 3, answers: {} }
    const resultat = JuniperGreenElement.verifQuestion(
      exercice as Parameters<typeof JuniperGreenElement.verifQuestion>[0],
      0,
    )
    expect(resultat).toEqual({
      isOk: true,
      feedback: '',
      score: { nbBonnesReponses: 2, nbReponses: 2 },
    })
    expect(exercice.answers['juniper-greenEx3Q0']).toBe(JSON.stringify([1, 23]))
    expect(element.interactivityOn).toBe(false)
    // Une deuxième vérification ne recalcule pas le score.
    expect(
      JuniperGreenElement.verifQuestion(
        exercice as Parameters<typeof JuniperGreenElement.verifQuestion>[0],
        0,
      ).score.nbBonnesReponses,
    ).toBe(2)
  })
})
