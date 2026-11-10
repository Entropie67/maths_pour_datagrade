import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import { MathaleaCouteauSuisseElement } from '../../src/lib/customElements/MathaleaCouteauSuisse'
import {
  addSchemaEnBarre,
  CLES_PAR_TYPE,
  clesNombresVerifies,
  comparerSchemas,
  geometrieAvecReste,
  MARQUE_CHAMP_SCHEMA,
  parseSchemaEnBarreState,
  SchemaEnBarreElement,
  schemaEnBarreFige,
  schemaHtml,
  schemaLatex,
  schemaTypst,
  nombreBienPlace,
  textesVides,
  TYPES_SCHEMA_EN_BARRE,
  TYPES_SCHEMA_EN_BARRE_ETAPES,
  type SchemaEnBarreAttendu,
  type SchemaEnBarreState,
} from '../../src/lib/customElements/SchemaEnBarreElement'
import {
  famillesArchive6N4A5,
  nbRectanglesPour,
  problemesSchemasEnBarre,
  texCalcul,
  texConclusion,
} from '../../src/lib/problems/problemesSchemasEnBarre'
import {
  context,
  setOutputHtml,
  setOutputLatex,
} from '../../src/modules/context'

function etat(partial: Partial<SchemaEnBarreState>): SchemaEnBarreState {
  return {
    type: null,
    textes: { ...textesVides(), ...partial.textes },
    nbRectangles: partial.nbRectangles ?? 3,
    ...(partial.type !== undefined ? { type: partial.type } : {}),
  }
}

describe('nombreBienPlace', () => {
  it("retrouve le nombre attendu quel que soit l'habillage du texte", () => {
    expect(nombreBienPlace('12', ' 12 km ')).toBe(true)
    expect(nombreBienPlace('Matin\n12 pages', 'Isabelle 12 timbres')).toBe(true)
    expect(nombreBienPlace('3,5', '3.5 €')).toBe(true)
    expect(nombreBienPlace('1 200', '1200')).toBe(true)
    expect(nombreBienPlace('12', '13')).toBe(false)
    expect(nombreBienPlace('12', '')).toBe(false)
  })
  it('ne vérifie pas les textes sans nombre (valeur cherchée, étiquette)', () => {
    expect(nombreBienPlace('?', '?')).toBe(true)
    expect(nombreBienPlace('Tulipes\n? fleurs', '30 timbres')).toBe(true)
    expect(nombreBienPlace('Léa', 'Tom')).toBe(true)
  })
})

describe('comparerSchemas', () => {
  const attendu: SchemaEnBarreAttendu = {
    type: 'additif-parties-tout',
    textes: { partieA: '12', partieB: '5', tout: '?' },
  }
  it('accepte le schéma attendu et les parties échangées', () => {
    const juste = comparerSchemas(
      attendu,
      etat({
        type: 'additif-parties-tout',
        textes: { partieA: '12', partieB: '5', tout: '?' },
      }),
    )
    expect(juste.isOk).toBe(true)
    expect(juste.echangeAB).toBe(false)
    const echange = comparerSchemas(
      attendu,
      etat({
        type: 'additif-parties-tout',
        textes: { partieA: '5 billes', partieB: '12', tout: '71' },
      }),
    )
    expect(echange.isOk).toBe(true)
    expect(echange.echangeAB).toBe(true)
  })
  it("n'échange pas les parties d'une comparaison", () => {
    const comparaison: SchemaEnBarreAttendu = {
      type: 'additif-comparaison',
      textes: { partieA: '12', partieB: '?', difference: '5' },
    }
    const resultat = comparerSchemas(
      comparaison,
      etat({
        type: 'additif-comparaison',
        textes: { partieA: '?', partieB: '12', difference: '5' },
      }),
    )
    expect(resultat.isOk).toBe(false)
    // Seul le nombre attendu (12 en A) est vérifié, pas le « ? » de B.
    expect(resultat.clesFausses).toEqual(['partieA'])
  })
  it('signale le mauvais type et les textes faux', () => {
    const resultat = comparerSchemas(
      attendu,
      etat({
        type: 'additif-comparaison',
        textes: { partieA: '12', partieB: '7', tout: '?' },
      }),
    )
    expect(resultat.typeOk).toBe(false)
    expect(resultat.clesFausses).toEqual(['partieB'])
    expect(resultat.isOk).toBe(false)
  })
  it('vérifie le nombre de rectangles seulement quand il est attendu', () => {
    const multiplicatif: SchemaEnBarreAttendu = {
      type: 'multiplicatif-parties-tout',
      textes: { part: '6', nombreDeParts: '4', tout: '?' },
      nbRectangles: 4,
    }
    const textes = { part: '6', nombreDeParts: '4', tout: '?' }
    expect(
      comparerSchemas(
        multiplicatif,
        etat({ type: 'multiplicatif-parties-tout', textes, nbRectangles: 4 }),
      ).isOk,
    ).toBe(true)
    expect(
      comparerSchemas(
        multiplicatif,
        etat({ type: 'multiplicatif-parties-tout', textes, nbRectangles: 3 }),
      ).nbRectanglesOk,
    ).toBe(false)
    expect(
      comparerSchemas(
        { ...multiplicatif, nbRectangles: undefined },
        etat({ type: 'multiplicatif-parties-tout', textes, nbRectangles: 2 }),
      ).isOk,
    ).toBe(true)
  })
  it("ne vérifie pas les textes vides de l'attendu", () => {
    const resultat = comparerSchemas(
      attendu,
      etat({
        type: 'additif-parties-tout',
        textes: { partieA: '12', partieB: '5', tout: '?', difference: 'x' },
      }),
    )
    expect(resultat.isOk).toBe(true)
  })
  it.each([
    ['additif-comparaison', 'additif-comparaison-total'],
    ['multiplicatif-comparaison', 'multiplicatif-comparaison-total'],
  ] as const)('distingue %s de %s', (simple, avecTotal) => {
    const textes = { part: '5', partieA: '12' }
    expect(
      comparerSchemas(
        { type: simple, textes },
        etat({ type: avecTotal, textes }),
      ).typeOk,
    ).toBe(false)
    expect(
      comparerSchemas(
        { type: avecTotal, textes },
        etat({ type: simple, textes }),
      ).typeOk,
    ).toBe(false)
  })
})

describe('parseSchemaEnBarreState', () => {
  it('tolère les champs manquants et rejette les valeurs invalides', () => {
    expect(parseSchemaEnBarreState('')).toBeNull()
    expect(parseSchemaEnBarreState('pas du json')).toBeNull()
    const state = parseSchemaEnBarreState(
      JSON.stringify({
        type: 'inconnu',
        textes: { tout: 12 },
        nbRectangles: 9,
      }),
    )
    expect(state).toEqual({
      type: null,
      textes: { ...textesVides(), tout: '12' },
      nbRectangles: 3,
    })
  })
  it.each([
    ['additif-comparaison', 'additif-comparaison-total'],
    ['multiplicatif-comparaison', 'multiplicatif-comparaison-total'],
  ] as const)(
    'reprend le tout des anciennes copies %s avec le schéma %s',
    (simple, avecTotal) => {
      const affiche = parseSchemaEnBarreState({
        type: simple,
        textes: {},
        toutVisible: true,
      })!
      expect(affiche.type).toBe(avecTotal)
      const renseigne = parseSchemaEnBarreState({
        type: simple,
        textes: { tout: '25' },
        toutVisible: false,
      })!
      expect(renseigne.type).toBe(avecTotal)
      expect(renseigne.textes.tout).toBe('25')
      expect(renseigne).not.toHaveProperty('toutVisible')
      const sansTout = parseSchemaEnBarreState({
        type: simple,
        textes: { partieA: '5' },
        toutVisible: false,
      })!
      expect(sansTout.type).toBe(simple)
    },
  )
  it('garde le tout des schémas parties-tout', () => {
    expect(
      parseSchemaEnBarreState({
        type: 'additif-parties-tout',
        textes: { tout: '25' },
      })!.type,
    ).toBe('additif-parties-tout')
  })
})

describe('rendus imprimés', () => {
  const textes = { ...textesVides(), part: '3', tout: '?', partieA: '5 €' }
  it('produisent du TikZ et du Typst pour chaque type et chaque nombre de rectangles', () => {
    for (const type of TYPES_SCHEMA_EN_BARRE) {
      for (const nb of [2, 5, 'plus'] as const) {
        const latex = schemaLatex(type, textes, nb)
        expect(latex).toContain('\\begin{tikzpicture}')
        expect(latex.includes('decoration={brace')).toBe(
          CLES_PAR_TYPE[type].includes('tout'),
        )
        expect(latex).not.toContain('filldraw')
        expect(latex).not.toContain('draw=white')
        const typst = schemaTypst(type, textes, nb)
        expect(typst).toContain('fill: none, stroke:')
        expect(typst).not.toContain('text(fill: white')
      }
    }
    expect(schemaLatex('multiplicatif-parties-tout', textes, 'plus')).toContain(
      '\\cdots',
    )
    expect(schemaLatex(null, textes, 3)).toBe('')
    expect(schemaTypst(null, textes, 3)).toBe('')
  })
  it.each([
    ['additif-comparaison', 'additif-comparaison-total'],
    ['multiplicatif-comparaison', 'multiplicatif-comparaison-total'],
  ] as const)(
    "n'imprime le tout que dans le schéma avec total : %s, %s",
    (simple, avecTotal) => {
      const sansTout = { ...textes, tout: '' }
      expect(schemaLatex(simple, textes, 3)).not.toContain('decoration={brace')
      expect(schemaTypst(simple, textes, 3)).not.toContain('stretch(brace.r')
      // Le gabarit vide imposé dessine l'accolade avant d'être complété.
      expect(schemaLatex(avecTotal, sansTout, 3)).toContain('decoration={brace')
      expect(schemaTypst(avecTotal, sansTout, 3)).toContain('stretch(brace.r')
    },
  )
  it("gardent les deux lignes d'une étiquette de rangée", () => {
    const deuxLignes = { ...textesVides(), etiquetteB: 'Boîte\n12 €' }
    expect(schemaLatex('multiplicatif-comparaison', deuxLignes, 3)).toContain(
      '{Boîte\\\\12 €}',
    )
    expect(schemaTypst('multiplicatif-comparaison', deuxLignes, 3)).toContain(
      'Boîte #linebreak() 12 €',
    )
  })
  it('protègent les caractères spéciaux des textes saisis', () => {
    const special = { ...textesVides(), partieA: '50 % & #1', partieB: '$x_1$' }
    const latex = schemaLatex('additif-parties-tout', special, 3)
    expect(latex).toContain('50 \\% \\& \\#1')
    expect(latex).toContain('\\$x\\_1\\$')
    const typst = schemaTypst('additif-parties-tout', special, 3)
    expect(typst).toContain('\\$x\\_1\\$')
  })
})

describe('nombres mis en évidence', () => {
  const textes = {
    ...textesVides(),
    partieA: 'Matin\n1 200,5 km',
    partieB: 'Soir\n? km',
    tout: '12',
  }
  it('repère les textes dont le nombre est vérifié', () => {
    expect(
      clesNombresVerifies({
        partieA: 'Matin\n12 pages',
        partieB: '?',
        tout: '3 + 4',
      }),
    ).toEqual(['partieA'])
  })
  it('colorent en orange le seul nombre des textes demandés (LaTeX et Typst)', () => {
    const latex = schemaLatex('additif-parties-tout', textes, 3, [
      'partieA',
      'tout',
    ])
    expect(latex).toContain('{\\bfseries\\color[HTML]{F15929}1 200,5} km')
    expect(latex).toContain('{\\bfseries\\color[HTML]{F15929}12}')
    expect(latex).not.toContain('color[HTML]{F15929}?')
    const typst = schemaTypst('additif-parties-tout', textes, 3, ['partieA'])
    expect(typst).toContain(
      '#text(fill: rgb("#F15929"), weight: "bold")[1 200,5] km',
    )
    expect(schemaLatex('additif-parties-tout', textes, 3)).not.toContain(
      'F15929',
    )
  })
  it('colorent aussi le schéma figé en HTML, sans toucher à la valeur', () => {
    setOutputHtml()
    document.body.innerHTML = SchemaEnBarreElement.create({
      initialState: { type: 'additif-parties-tout', textes },
      nombresEnEvidence: ['partieA'],
      interactivityOn: false,
    })
    const element = document.querySelector(
      'schema-en-barre',
    ) as SchemaEnBarreElement
    const rect = element.querySelector('[data-cle="partieA"]')!
    expect(rect.innerHTML).toContain(
      '<span style="color:#F15929;font-weight:bold">1 200,5</span> km',
    )
    expect(element.querySelector('[data-cle="tout"]')!.innerHTML).toBe('12')
    expect(JSON.parse(element.value).textes.partieA).toBe('Matin\n1 200,5 km')
  })
})

describe('SchemaEnBarreElement', () => {
  beforeEach(() => {
    setOutputHtml()
    document.body.innerHTML = ''
  })

  function monteElement(options: Parameters<typeof addSchemaEnBarre>[2] = {}): {
    exercice: Exercice
    element: SchemaEnBarreElement
  } {
    const exercice = new Exercice()
    exercice.numeroExercice = 0
    document.body.innerHTML = addSchemaEnBarre(exercice, 0, options)
    const element = document.querySelector(
      'schema-en-barre',
    ) as SchemaEnBarreElement
    return { exercice, element }
  }

  function clique(element: SchemaEnBarreElement, selecteur: string) {
    element.querySelector<HTMLButtonElement>(selecteur)!.click()
  }

  function saisit(element: SchemaEnBarreElement, cle: string, texte: string) {
    const champ = element.querySelector<HTMLTextAreaElement>(
      `textarea[data-cle="${cle}"]`,
    )!
    champ.value = texte
    champ.dispatchEvent(new Event('input', { bubbles: true }))
  }

  it('propose les six schémas puis rend éditables les textes du schéma choisi', () => {
    const { element } = monteElement()
    const choix = element.querySelector<HTMLElement>('.schema-en-barre__choix')!
    const zone = element.querySelector<HTMLElement>('.schema-en-barre__zone')!
    const vignettes = choix.querySelectorAll('.schema-en-barre__vignette')
    expect(vignettes).toHaveLength(6)
    expect(
      [...vignettes].map(
        (vignette) =>
          vignette.querySelector('.schema-en-barre__vignette-titre')
            ?.textContent,
      ),
    ).toEqual([
      'Additif de parties-tout',
      'Additif de comparaison',
      'Additif de comparaison avec total',
      'Multiplicatif de parties-tout',
      'Multiplicatif de comparaison',
      'Multiplicatif de comparaison avec total',
    ])
    expect(
      [...vignettes].map(
        (vignette) => vignette.querySelector('[data-cle="tout"]') != null,
      ),
    ).toEqual([true, false, true, true, false, true])
    expect(choix.hidden).toBe(false)
    expect(zone.hidden).toBe(true)
    expect(element.querySelector('textarea')).toBeNull()
    clique(element, '[data-type="multiplicatif-parties-tout"]')
    // Le choix et le schéma ne sont jamais visibles ensemble.
    expect(choix.hidden).toBe(true)
    expect(zone.hidden).toBe(false)
    expect(
      element.querySelector('textarea')!.getAttribute('placeholder'),
    ).toBeNull()
    expect(element.querySelectorAll('textarea[data-cle="part"]')).toHaveLength(
      3,
    )
    clique(element, '[data-nb="plus"]')
    expect(element.querySelectorAll('textarea[data-cle="part"]')).toHaveLength(
      4,
    )
    expect(element.querySelector('.schema-en-barre__pointilles')).not.toBeNull()
    saisit(element, 'part', '6')
    const parts = [
      ...element.querySelectorAll<HTMLTextAreaElement>(
        'textarea[data-cle="part"]',
      ),
    ]
    expect(parts.every((champ) => champ.value === '6')).toBe(true)
    const state = parseSchemaEnBarreState(element.value)!
    expect(state.type).toBe('multiplicatif-parties-tout')
    expect(state.nbRectangles).toBe('plus')
    expect(state.textes.part).toBe('6')
    clique(element, '.schema-en-barre__changer')
    expect(choix.hidden).toBe(false)
    expect(zone.hidden).toBe(true)
    clique(element, '[data-type="multiplicatif-parties-tout"]')
    expect(zone.hidden).toBe(false)
    expect(parseSchemaEnBarreState(element.value)!.textes.part).toBe('6')
  })

  it.each([
    ['additif-comparaison', 'additif-comparaison-total'],
    ['multiplicatif-comparaison', 'multiplicatif-comparaison-total'],
  ] as const)(
    "porte l'accolade « Tout » par le type : %s, %s",
    (simple, avecTotal) => {
      const { element } = monteElement({ typeImpose: simple })
      expect(element.querySelector('[data-cle="tout"]')).toBeNull()
      expect(element.querySelector('.schema-en-barre__tout')).toBeNull()
      const total = monteElement({ typeImpose: avecTotal }).element
      expect(total.querySelector('textarea[data-cle="tout"]')).not.toBeNull()
    },
  )

  it("efface le tout en passant d'un schéma avec total à un schéma sans total", () => {
    const { element } = monteElement()
    clique(element, '[data-type="additif-comparaison-total"]')
    saisit(element, 'tout', '110')
    saisit(element, 'partieA', '60')
    clique(element, '.schema-en-barre__changer')
    clique(element, '[data-type="additif-comparaison"]')
    const state = JSON.parse(element.value)
    expect(state.textes.tout).toBe('')
    expect(state.textes.partieA).toBe('60')
    // Sinon le rejeu de la copie reviendrait au schéma avec total.
    expect(parseSchemaEnBarreState(element.value)!.type).toBe(
      'additif-comparaison',
    )
  })

  it('impose le type quand il est donné', () => {
    const { element } = monteElement({ typeImpose: 'additif-comparaison' })
    expect(element.querySelector('.schema-en-barre__vignette')).toBeNull()
    expect(
      element.querySelector('textarea[data-cle="difference"]'),
    ).not.toBeNull()
    expect(
      element.querySelector<HTMLElement>('.schema-en-barre__nb-rectangles')!
        .hidden,
    ).toBe(true)
  })

  it('restaure un état par value et le fige sans interactivité', () => {
    const { element } = monteElement()
    element.value = JSON.stringify({
      type: 'additif-parties-tout',
      textes: { partieA: '12', partieB: '5', tout: '?' },
    })
    expect(
      element.querySelector<HTMLTextAreaElement>(
        'textarea[data-cle="partieA"]',
      )!.value,
    ).toBe('12')
    element.interactivityOn = false
    expect(element.querySelector('textarea')).toBeNull()
    expect(element.querySelector('.schema-en-barre__vignette')).toBeNull()
    expect(element.querySelector('[data-cle="tout"]')!.textContent).toBe('?')
    expect(JSON.parse(element.value).textes.partieB).toBe('5')
  })

  it('corrige la question avec verifQuestion', () => {
    const attendu: SchemaEnBarreAttendu = {
      type: 'additif-parties-tout',
      textes: { partieA: '12', partieB: '5', tout: '?' },
    }
    const { exercice, element } = monteElement({ attendu })
    expect(exercice.autoCorrection[0].formatInteractif).toBe('schema-en-barre')
    clique(element, '[data-type="additif-parties-tout"]')
    saisit(element, 'partieA', '5')
    saisit(element, 'partieB', '12 pages')
    saisit(element, 'tout', '?')
    const resultat = SchemaEnBarreElement.verifQuestion(exercice, 0)
    expect(resultat.isOk).toBe(true)
    expect(resultat.score).toEqual({ nbBonnesReponses: 1, nbReponses: 1 })
    expect(exercice.answers?.['schema-en-barreEx0Q0']).toBe(element.value)
    expect(element.interactivityOn).toBe(false)
    expect(document.querySelector('#resultatCheckEx0Q0')!.innerHTML).toBe('😎')
  })

  it('explique le mauvais type et marque les textes faux', () => {
    const attendu: SchemaEnBarreAttendu = {
      type: 'additif-comparaison',
      textes: { partieA: '12', partieB: '?', difference: '5' },
    }
    const { exercice, element } = monteElement({ attendu })
    clique(element, '[data-type="additif-comparaison"]')
    saisit(element, 'partieA', '7')
    saisit(element, 'partieB', '12')
    saisit(element, 'difference', '5')
    const resultat = SchemaEnBarreElement.verifQuestion(exercice, 0)
    expect(resultat.isOk).toBe(false)
    expect(resultat.feedback).toContain("un nombre n'est pas à la bonne place")
    expect(
      element
        .querySelector('[data-cle="partieA"]')!
        .classList.contains('is-faux'),
    ).toBe(true)
    expect(
      element
        .querySelector('[data-cle="difference"]')!
        .classList.contains('is-faux'),
    ).toBe(false)
  })

  it.each([true, false])('adapte le feedback au type imposé : %s', (impose) => {
    const attendu: SchemaEnBarreAttendu = {
      type: 'additif-comparaison',
      textes: { partieA: '12', difference: '5' },
    }
    const { exercice, element } = monteElement({
      attendu,
      typeImpose: impose ? attendu.type : undefined,
      initialState: { type: attendu.type },
    })
    const resultat = SchemaEnBarreElement.verifQuestion(exercice, 0)
    expect(resultat.isOk).toBe(false)
    expect(resultat.feedback.includes('du bon type')).toBe(!impose)
    expect(resultat.feedback).toContain('nombres ne sont pas à la bonne place')
    expect(resultat.score.nbReponses).toBe(1)
    expect(element.querySelector('.is-faux')).not.toBeNull()
  })

  it('résume la réponse pour les corrections de la CAN', () => {
    expect(
      SchemaEnBarreElement.formatStudentAnswer(
        JSON.stringify({
          type: 'additif-parties-tout',
          textes: { partieA: '12', partieB: '5', tout: '?' },
        }),
      ),
    ).toBe('Additif de parties-tout ; Tout : ? ; Partie A : 12 ; Partie B : 5')
  })

  it("en LaTeX, n'imprime le gabarit que si le type est imposé, et le schéma complet en correction", () => {
    setOutputLatex()
    try {
      const exercice = new Exercice()
      exercice.numeroExercice = 0
      expect(addSchemaEnBarre(exercice, 0, {})).toBe('')
      expect(
        addSchemaEnBarre(exercice, 0, { typeImpose: 'additif-parties-tout' }),
      ).toContain('tikzpicture')
      expect(
        addSchemaEnBarre(exercice, 0, {
          initialState: {
            type: 'additif-parties-tout',
            textes: { ...textesVides(), partieA: '12' },
          },
          interactivityOn: false,
        }),
      ).toContain('{12}')
    } finally {
      setOutputHtml()
      expect(context.isHtml).toBe(true)
    }
  })
})

describe('schémas à étapes', () => {
  const textes = {
    ...textesVides(),
    tout: '50 €',
    partieA: 'Sac\n10 €',
    partieB: 'Trousse\n15 €',
    partieC: 'Pierre\n25 €',
    difference: '5 € de plus',
    nombreDeParts: '6 sachets',
    part: '14 bonbons',
    partPartage: '16 bonbons',
    reste: 'Reste\n4 bonbons',
    nombrePartages: '5 amis',
  }

  it('ne sont pas proposés dans le choix des six schémas', () => {
    expect(TYPES_SCHEMA_EN_BARRE).toHaveLength(6)
    for (const type of TYPES_SCHEMA_EN_BARRE_ETAPES) {
      expect(TYPES_SCHEMA_EN_BARRE as readonly string[]).not.toContain(type)
      expect(parseSchemaEnBarreState({ type, textes })?.type).toBe(type)
    }
  })

  it.each(TYPES_SCHEMA_EN_BARRE_ETAPES)(
    '%s affiche tous ses textes dans les trois rendus',
    (type) => {
      const html = schemaHtml(type, textes, 3, { editable: false })
      const latex = schemaLatex(type, textes, 3)
      const typst = schemaTypst(type, textes, 3)
      expect(latex).toContain('\\begin{tikzpicture}')
      expect(typst).toContain('fill: none, stroke:')
      for (const cle of CLES_PAR_TYPE[type]) {
        const derniereLigne = textes[cle].split('\n').at(-1) as string
        expect(html).toContain(`data-cle="${cle}"`)
        expect(latex).toContain(derniereLigne)
        expect(typst).toContain(derniereLigne)
      }
    },
  )

  it('agrandit les rectangles imprimés pour une étiquette longue', () => {
    const longue = { ...textes, partieB: 'Ordinateur portable\n500 €' }
    const hauteur = (latex: string) =>
      latex.match(/rectangle \(([\d.]+),([\d.]+)\)/)?.[2]
    expect(
      Number(hauteur(schemaLatex('additif-trois-parties', longue, 3))),
    ).toBeGreaterThan(
      Number(hauteur(schemaLatex('additif-trois-parties', textes, 3))),
    )
  })

  describe('schéma avec reste', () => {
    const LARGEUR_MIN = 5.75
    const ECART = 0.25
    const rectVides = (html: string) =>
      html.match(/schema-en-barre__rect--a" style="width:[\d.]+em"><\/div>/g)
        ?.length ?? 0
    const repartitions = () => {
      const liste: {
        nbHaut: number
        partHaut: number
        nbBas: number
        partBas: number
        reste: number
      }[] = []
      for (let nbHaut = 2; nbHaut <= 12; nbHaut++) {
        for (let partHaut = 2; partHaut <= 40; partHaut += 3) {
          for (let partBas = 2; partBas <= 45; partBas += 3) {
            const nbBas = Math.floor((nbHaut * partHaut) / partBas)
            const reste = nbHaut * partHaut - nbBas * partBas
            if (nbBas >= 1 && reste > 0) {
              liste.push({ nbHaut, partHaut, nbBas, partBas, reste })
            }
          }
        }
      }
      return liste
    }

    it('garde les rangées alignées et la plus grande part la plus large', () => {
      const liste = repartitions()
      expect(liste.length).toBeGreaterThan(500)
      for (const repartition of liste) {
        const g = geometrieAvecReste(repartition, LARGEUR_MIN)
        const { nbHaut, partHaut, nbBas, partBas } = repartition
        const contexte = JSON.stringify(repartition)
        const dessinHaut = nbHaut > 5 ? 3 : nbHaut
        const dessinBas = nbBas > 5 ? 3 : nbBas
        const finHaut =
          dessinHaut * (g.largeurPartHaut + ECART) +
          (nbHaut > 5 ? g.pointillesHaut + ECART : 0) -
          ECART
        const finBas =
          dessinBas * (g.largeurPartBas + ECART) +
          (nbBas > 5 ? g.pointillesBas + ECART : 0) +
          g.largeurReste
        expect(finHaut, contexte).toBeCloseTo(g.largeurTotale, 6)
        expect(finBas, contexte).toBeCloseTo(g.largeurTotale, 6)
        expect(g.largeurPartHaut, contexte).toBeGreaterThanOrEqual(
          LARGEUR_MIN - 1e-9,
        )
        expect(g.largeurPartBas, contexte).toBeGreaterThanOrEqual(
          LARGEUR_MIN - 1e-9,
        )
        if (partHaut > partBas) {
          expect(g.largeurPartHaut, contexte).toBeGreaterThan(g.largeurPartBas)
        }
        if (partHaut < partBas) {
          expect(g.largeurPartHaut, contexte).toBeLessThan(g.largeurPartBas)
        }
      }
    })

    it('dessine toutes les parts de 2 à 5, sans pointillés', () => {
      const html = schemaHtml('multiplicatif-avec-reste', textes, 3, {
        editable: false,
        repartition: {
          nbHaut: 5,
          partHaut: 14,
          nbBas: 4,
          partBas: 16,
          reste: 6,
        },
      })
      expect(html).not.toContain('schema-en-barre__pointilles-reste')
      // Cinq parts en haut, quatre en bas : la première de chaque rangée a son texte.
      expect(rectVides(html)).toBe(4 + 3)
    })

    it('au-delà de 5 parts : deux rectangles, des pointillés et le dernier', () => {
      const repartition = {
        nbHaut: 7,
        partHaut: 14,
        nbBas: 6,
        partBas: 16,
        reste: 2,
      }
      const html = schemaHtml('multiplicatif-avec-reste', textes, 3, {
        editable: false,
        repartition,
      })
      expect(html.match(/schema-en-barre__pointilles-reste/g)).toHaveLength(2)
      expect(rectVides(html)).toBe(2 + 2)
      const latex = schemaLatex(
        'multiplicatif-avec-reste',
        textes,
        3,
        [],
        repartition,
      )
      expect(latex.match(/\\draw\[dotted/g)).toHaveLength(2)
      const typst = schemaTypst(
        'multiplicatif-avec-reste',
        textes,
        3,
        [],
        repartition,
      )
      expect(typst.match(/dash: "dotted"/g)).toHaveLength(2)
    })
  })

  describe('schemaEnBarreFige', () => {
    afterEach(() => {
      setOutputHtml()
    })

    it('place les champs de saisie et garde les nombres dans le texte', () => {
      const html = schemaEnBarreFige({
        type: 'additif-trois-parties',
        textes: {
          tout: `${MARQUE_CHAMP_SCHEMA} €`,
          partieA: 'Sac\n10 €',
          partieB: 'Trousse\n15 €',
          partieC: 'Stylo\n25 €',
        },
        champs: { tout: '<math-field id="champ"></math-field>' },
      })
      expect(html).toContain('<math-field id="champ"></math-field> €')
      expect(html).not.toContain(MARQUE_CHAMP_SCHEMA)
      expect(html).toContain('10 €')
      expect(html).not.toContain('<schema-en-barre')
    })

    it('met en évidence les seuls nombres demandés', () => {
      const html = schemaEnBarreFige({
        type: 'additif-somme-comparaison',
        textes: { partieA: 'Sac\n10 €', partieB: 'Vélo\n20 €' },
        nombresEnEvidence: ['partieB'],
      })
      expect(html.split('font-weight:bold')).toHaveLength(2)
      expect(html).toMatch(/font-weight:bold">20</)
    })

    it('produit du TikZ hors du HTML', () => {
      setOutputLatex()
      expect(
        schemaEnBarreFige({
          type: 'multiplicatif-avec-reste',
          textes: { part: '14 bonbons' },
        }),
      ).toContain('\\begin{tikzpicture}')
    })
  })
})

describe('problemesSchemasEnBarre', () => {
  it('fournit des problèmes cohérents avec leur schéma attendu', () => {
    for (const type of TYPES_SCHEMA_EN_BARRE) {
      for (const fabrique of problemesSchemasEnBarre[type]) {
        const probleme = fabrique()
        expect(probleme.attendu.type).toBe(type)
        expect(
          Object.values(probleme.attendu.textes).some((texte) =>
            texte.includes('?'),
          ),
        ).toBe(true)
        expect(probleme.enonce.length).toBeGreaterThan(20)
        expect(probleme.calculs.length).toBeGreaterThan(0)
        expect(probleme.conclusion.unite).not.toBe('')
      }
    }
    const calcul = {
      termes: [
        { valeur: 12, unite: 'tulipes' },
        { valeur: 6, unite: 'tulipes' },
      ],
      operateur: '-' as const,
      resultat: { valeur: 6, unite: 'tulipes' },
    }
    expect(texCalcul(calcul, false, false)).toBe('$12-6=6$')
    expect(texCalcul(calcul, true, false)).toBe(
      '$12\\text{ tulipes}-6\\text{ tulipes}=6\\text{ tulipes}$',
    )
    expect(texCalcul(calcul, false, true)).toContain('\\color')
    expect(
      texConclusion({
        avant: 'Il y a',
        reponse: 6,
        unite: 'tulipes',
        apres: 'dans ce bouquet.',
      }),
    ).toMatch(/^Il y a \$.*6.*\$ tulipes dans ce bouquet\.$/)
    expect(nbRectanglesPour(4)).toBe(4)
    expect(nbRectanglesPour(12)).toBe('plus')
    expect(nbRectanglesPour(1)).toBe('plus')
  })
})

describe('banque de 6N4A-5', () => {
  it('ne place le total que dans les problèmes de comparaison avec total', () => {
    for (const type of TYPES_SCHEMA_EN_BARRE) {
      for (const fabrique of problemesSchemasEnBarre[type]) {
        const { attendu } = fabrique()
        expect(attendu.textes.tout != null).toBe(
          CLES_PAR_TYPE[type].includes('tout'),
        )
      }
    }
  })
  it('ne donne aucun nombre dans la phrase de réponse', () => {
    for (const type of TYPES_SCHEMA_EN_BARRE) {
      for (const fabrique of problemesSchemasEnBarre[type]) {
        const { avant, apres, suite } = fabrique().conclusion
        expect(`${avant} ${apres} ${suite?.avant ?? ''}`).not.toMatch(/\d/)
      }
    }
  })
  it("garde la composition et l'ordre des familles de l'archive", () => {
    expect(famillesArchive6N4A5.map((famille) => famille.length)).toEqual([
      4, 6, 4, 4,
    ])
    expect(
      famillesArchive6N4A5.map((famille) =>
        famille.map((fabrique) => fabrique.name),
      ),
    ).toEqual([
      ['lectureTout', 'billesPartie', 'carTout', 'bouquetPartie'],
      [
        'cartesGrande',
        'billesPetite',
        'taillesDifference',
        'timbresTout',
        'billesReunies',
        'bouchonBouteille',
      ],
      ['oeufsTout', 'bonbonsPart', 'boitesNombreDeParts', 'coureurTout'],
      ['chocolatsTout', 'chocolatsPart', 'billesTout', 'billesPart'],
    ])
  })
})

describe('6N4A-5', () => {
  beforeEach(() => {
    setOutputHtml()
    document.body.innerHTML = ''
  })

  it('associe le schéma et le champ de conclusion dans un couteau suisse à deux points', async () => {
    const { default: Exercice6N4A5 } =
      await import('../../src/exercices/6e/6N4A-5')
    const exercice = new Exercice6N4A5()
    exercice.numeroExercice = 0
    exercice.interactif = true
    exercice.nouvelleVersion()
    expect(exercice.listeQuestions).toHaveLength(4)
    expect(exercice.autoCorrection[0].formatInteractif).toBe(
      'mathalea-couteau-suisse',
    )
    // Le champ MathLive n'est pas monté dans jsdom : on lit le HTML produit.
    const html = exercice.listeQuestions[0]
    expect(html).toContain('id="schema-en-barreEx0Q0"')
    expect(html).toContain('mathfield-id="champTexteEx0Q100"')
    expect(html.match(/id="resultatCheckEx0Q0"/g)).toHaveLength(1)
    expect(MathaleaCouteauSuisseElement.pointsMaxQuestion(exercice, 0)).toBe(2)
    // La correction montre le schéma attendu figé, sans champ.
    expect(exercice.listeCorrections[0]).toContain('interactivity-on="false"')
    expect(exercice.listeCorrections[0]).not.toContain('resultatCheck')
  })

  it.each([
    ['1', 'additif-parties-tout'],
    ['2', 'additif-comparaison'],
    ['3', 'additif-comparaison-total'],
    ['4', 'multiplicatif-parties-tout'],
    ['5', 'multiplicatif-comparaison'],
    ['6', 'multiplicatif-comparaison-total'],
  ] as const)(
    'le paramètre %s ne pose que des problèmes %s',
    async (sup, type) => {
      const { default: Exercice6N4A5 } =
        await import('../../src/exercices/6e/6N4A-5')
      const exercice = new Exercice6N4A5()
      exercice.numeroExercice = 0
      exercice.interactif = true
      exercice.sup = sup
      exercice.nouvelleVersion()
      expect(exercice.listeQuestions).toHaveLength(4)
      for (let i = 0; i < 4; i++) {
        const { elements } = exercice.autoCorrection[i] as unknown as {
          elements: {
            autoCorrection: { valeur: { reponse: { value: string } } }
          }[]
        }
        expect(
          JSON.parse(elements[0].autoCorrection.valeur.reponse.value).type,
        ).toBe(type)
      }
    },
  )

  it.each([
    [2, 2],
    [1, 1],
  ])(
    'demande les billes de chaque enfant pour un seul point (sup4 = %i : %i points)',
    async (sup4, points) => {
      const { default: Exercice6N4A5 } =
        await import('../../src/exercices/6e/6N4A-5')
      const exercice = new Exercice6N4A5()
      exercice.numeroExercice = 0
      exercice.interactif = true
      exercice.nbQuestions = 6
      exercice.sup = '3'
      exercice.sup4 = sup4
      exercice.nouvelleVersion()
      const avecDeuxChamps: number[] = []
      for (let i = 0; i < exercice.nbQuestions; i++) {
        expect(
          MathaleaCouteauSuisseElement.pointsMaxQuestion(exercice, i),
        ).toBe(points)
        if (exercice.listeQuestions[i].includes('chaque enfant')) {
          avecDeuxChamps.push(i)
          expect(exercice.listeQuestions[i]).toContain(
            `id="multi-mathfieldEx0Q${i + 100}"`,
          )
        }
      }
      expect(avecDeuxChamps.length).toBeGreaterThan(0)
      const { elements } = exercice.autoCorrection[
        avecDeuxChamps[0]
      ] as unknown as {
        elements: {
          formatInteractif: string
          autoCorrection: {
            valeur: {
              champ1: { value: string }
              champ2: { value: string }
              bareme: (points: number[]) => [number, number]
            }
          }
        }[]
      }
      const champs = elements[elements.length - 1]
      expect(champs.formatInteractif).toBe('multi-mathfield')
      expect(Number(champs.autoCorrection.valeur.champ1.value)).toBeGreaterThan(
        Number(champs.autoCorrection.valeur.champ2.value),
      )
      expect(champs.autoCorrection.valeur.bareme([1, 0])).toEqual([0, 1])
      expect(champs.autoCorrection.valeur.bareme([1, 1])).toEqual([1, 1])
    },
  )

  it("l'archive garde un seul champ de réponse", async () => {
    const { default: Archive } =
      await import('../../src/exercices/6e/6N4A-5-old')
    const exercice = new Archive()
    exercice.numeroExercice = 0
    exercice.interactif = true
    exercice.nbQuestions = 6
    exercice.sup = '2'
    exercice.nouvelleVersion()
    expect(exercice.listeQuestions.join('')).not.toContain('multi-mathfield')
  })

  it("écrit les calculs avec les unités quand l'option est cochée", async () => {
    const { default: Exercice6N4A5 } =
      await import('../../src/exercices/6e/6N4A-5')
    const exercice = new Exercice6N4A5()
    exercice.numeroExercice = 0
    exercice.sup = '1'
    exercice.sup3 = true
    exercice.nouvelleVersion()
    expect(exercice.listeCorrections[0]).toContain('\\text{ ')
    exercice.sup3 = false
    exercice.nouvelleVersion()
    expect(exercice.listeCorrections[0]).not.toContain('\\text{ ')
  })
})
