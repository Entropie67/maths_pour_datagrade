import { afterEach, describe, expect, it } from 'vitest'
import {
  annuleDerniereSaisie,
  corrigeLesEtapes,
  DecompositionFacteursPremiersElement,
  etapesAlgorithme,
  etatVide,
  facteursPremiers,
  nombreAvant,
  parseEntier,
  parseEtat,
  phase,
  renderLatexDecomposition,
  renderTypstDecomposition,
  resumeEtapes,
  valideSaisie,
  verdictDiviseur,
  type EtatDecomposition,
} from '../../src/lib/customElements/DecompositionFacteursPremiersElement'
import { context, setOutputHtml } from '../../src/modules/context'

/** Valide une suite de saisies et retourne l'état final. */
function saisis(
  nombre: number,
  saisies: string[],
  corrige: boolean,
): EtatDecomposition {
  let etat = etatVide()
  for (const saisie of saisies) {
    etat = valideSaisie(etat, nombre, saisie, corrige).etat
  }
  return etat
}

describe('algorithme de décomposition', () => {
  it('donne les lignes de 132', () => {
    expect(etapesAlgorithme(132)).toEqual([
      { diviseur: 2, quotient: 66 },
      { diviseur: 2, quotient: 33 },
      { diviseur: 3, quotient: 11 },
      { diviseur: 11, quotient: 1 },
    ])
    expect(facteursPremiers(132)).toEqual([2, 2, 3, 11])
    expect(etapesAlgorithme(13)).toEqual([{ diviseur: 13, quotient: 1 }])
  })

  it('lit les entiers saisis', () => {
    expect(parseEntier('1320')).toBe(1320)
    expect(parseEntier('1\\,320')).toBe(1320)
    expect(parseEntier('')).toBeNull()
    expect(parseEntier('2+3')).toBeNull()
    expect(parseEntier('\\frac{1}{2}')).toBeNull()
  })

  it('juge un diviseur : premier et diviseur du nombre', () => {
    expect(verdictDiviseur(132, '2')).toBe('ok')
    expect(verdictDiviseur(132, '11')).toBe('ok')
    expect(verdictDiviseur(132, '4')).toBe('nonPremier')
    expect(verdictDiviseur(132, '1')).toBe('nonPremier')
    expect(verdictDiviseur(132, '5')).toBe('neDivisePas')
    expect(verdictDiviseur(132, 'x')).toBe('invalide')
  })
})

describe('vérification à chaque étape', () => {
  it('suit la chaîne jusqu’à 1 sans erreur', () => {
    const etat = saisis(132, ['2', '66', '2', '33', '3', '11', '11', '1'], true)
    expect(phase(etat, true)).toEqual({ type: 'termine' })
    expect(resumeEtapes(etat)).toEqual({
      complet: true,
      nbDiviseursFaux: 0,
      nbQuotientsFaux: 0,
    })
  })

  it('accepte les facteurs dans un autre ordre', () => {
    const etat = saisis(132, ['11', '12', '3', '4', '2', '2', '2', '1'], true)
    expect(phase(etat, true)).toEqual({ type: 'termine' })
    expect(resumeEtapes(etat).nbDiviseursFaux).toBe(0)
  })

  it('barre un diviseur faux et attend une correction sur la même ligne', () => {
    let { etat, message } = valideSaisie(etatVide(), 132, '4', true)
    expect(message).toBe("$4$ n'est pas un nombre premier.")
    expect(etat.etapes[0].diviseurs).toEqual([{ v: '4', ok: false }])
    expect(phase(etat, true)).toEqual({ type: 'diviseur', etape: 0 })
    ;({ etat, message } = valideSaisie(etat, 132, '5', true))
    expect(message).toBe('$5$ ne divise pas $132$.')
    ;({ etat } = valideSaisie(etat, 132, '2', true))
    expect(etat.etapes[0].diviseurs.map((t) => t.ok)).toEqual([
      false,
      false,
      true,
    ])
    expect(phase(etat, true)).toEqual({ type: 'quotient', etape: 0 })
  })

  it('barre un quotient faux sans révéler la bonne valeur', () => {
    let etat = saisis(132, ['2'], true)
    let message: string
    ;({ etat, message } = valideSaisie(etat, 132, '65', true))
    expect(message).toBe("Le quotient de $132$ par $2$ n'est pas $65$.")
    expect(phase(etat, true)).toEqual({ type: 'quotient', etape: 0 })
    etat = valideSaisie(etat, 132, '66', true).etat
    expect(etat.etapes[0].quotients.map((t) => t.ok)).toEqual([false, true])
    expect(nombreAvant(etat, 132, 1)).toBe(66)
    expect(phase(etat, true)).toEqual({ type: 'diviseur', etape: 1 })
    expect(resumeEtapes(etat).nbQuotientsFaux).toBe(1)
  })

  it('ignore une saisie vide ou après la fin', () => {
    const etat = etatVide()
    expect(valideSaisie(etat, 132, '  ', true).etat).toBe(etat)
    const fini = saisis(13, ['13', '1'], true)
    expect(valideSaisie(fini, 13, '2', true).etat).toBe(fini)
  })
})

describe('vérification à la fin', () => {
  it('ne corrige rien pendant la saisie puis corrige chaque ligne depuis la précédente', () => {
    // 132 ÷ 2 = 65 (faux), puis 65 ÷ 5 = 13 (juste par rapport à 65).
    const saisi = saisis(132, ['2', '65', '5', '13', '13', '1'], false)
    expect(
      saisi.etapes.flatMap((e) => e.diviseurs).every((t) => t.ok === null),
    ).toBe(true)
    expect(phase(saisi, false)).toEqual({ type: 'termine' })

    const corrige = corrigeLesEtapes(saisi, 132)
    expect(corrige.etapes.map((e) => e.quotients[0].ok)).toEqual([
      false,
      true,
      true,
    ])
    expect(corrige.etapes.map((e) => e.diviseurs[0].ok)).toEqual([
      true,
      true,
      true,
    ])
    // La chaîne va jusqu'à 1 : seule la ligne fausse est signalée.
    expect(resumeEtapes(corrige)).toEqual({
      complet: true,
      nbDiviseursFaux: 0,
      nbQuotientsFaux: 1,
    })
  })

  it('signale un algorithme inachevé', () => {
    const corrige = corrigeLesEtapes(saisis(132, ['2', '66'], false), 132)
    expect(resumeEtapes(corrige).complet).toBe(false)
  })

  it('annule la dernière saisie', () => {
    const etat = saisis(132, ['2', '66', '2'], false)
    const sans = annuleDerniereSaisie(etat)
    expect(sans.etapes).toHaveLength(1)
    expect(phase(sans, false)).toEqual({ type: 'diviseur', etape: 1 })
    expect(annuleDerniereSaisie(sans).etapes[0].quotients).toHaveLength(0)
    expect(annuleDerniereSaisie(annuleDerniereSaisie(sans)).etapes).toEqual([])
  })
})

describe('sérialisation', () => {
  it('relit un état sérialisé et rejette le reste', () => {
    const etat = saisis(132, ['4', '2', '65', '66'], true)
    const complet = { ...etat, final: '2\\times2' }
    expect(parseEtat(JSON.stringify(complet))).toEqual(complet)
    expect(parseEtat(etatVide())).toEqual(etatVide())
    expect(parseEtat('')).toBeNull()
    expect(parseEtat('{"etapes": 3, "final": ""}')).toBeNull()
    expect(
      parseEtat(
        '{"etapes": [{"diviseurs": [1], "quotients": []}], "final": ""}',
      ),
    ).toBeNull()
  })

  it('restitue la valeur d’un élément non connecté (rejeu)', () => {
    const element = new DecompositionFacteursPremiersElement()
    const avant = JSON.stringify(element.value)
    element.value = avant
    expect(JSON.stringify(element.value)).toBe(avant)
    const etat = { ...saisis(132, ['2', '66'], true), final: '' }
    element.value = JSON.stringify(etat)
    expect(element.value).toEqual(etat)
    element.value = 'pas du json'
    expect(element.value).toEqual(etat)
  })
})

describe('sorties imprimées', () => {
  afterEach(() => setOutputHtml())

  it('LaTeX : tableau vide puis solution', () => {
    const vide = renderLatexDecomposition(132, 'vide')
    expect(vide).toContain('\\begin{array}{l|l}132 & \\phantom{000}')
    // 4 facteurs : 5 lignes
    expect(vide.match(/\\phantom\{000\}/g)).toHaveLength(5)
    expect(vide).toContain('\\ldots')

    const solution = renderLatexDecomposition(132, 'solution')
    expect(solution).toContain('\\boldsymbol{2}')
    expect(solution).toContain('66')
    expect(solution).toContain('\\boldsymbol{2\\times 2\\times 3\\times 11}')
  })

  it('Typst : table à deux colonnes', () => {
    const solution = renderTypstDecomposition(132, 'solution')
    expect(solution).toContain('#table(columns: (auto, auto)')
    expect(solution).toContain('[$132$]')
    expect(solution).toContain('$2 times 2 times 3 times 11$')
    expect(renderTypstDecomposition(1320, 'vide')).toContain('$1 thin 320$')
  })

  it('create choisit la sortie selon le contexte', () => {
    setOutputHtml()
    expect(
      DecompositionFacteursPremiersElement.create({ nombre: 132 }),
    ).toContain('<decomposition-facteurs-premiers')
    context.isTypst = true
    expect(
      DecompositionFacteursPremiersElement.create({ nombre: 132 }),
    ).toMatch(/^<mathalea-typst>.*#table/s)
    context.isTypst = false
    context.isHtml = false
    expect(
      DecompositionFacteursPremiersElement.create({ nombre: 132 }),
    ).toContain('\\begin{array}')
  })
})
