import { ComputeEngine } from '@cortex-js/compute-engine'
import { describe, expect, it } from 'vitest'
import { pythagoreCompare } from '../../src/exercices/4e/4G20'
import TrouverSolutionMathador, {
  TrouverSolutionMathadorOrdreDeLecture,
} from '../../src/exercices/5e/_TrouverSolutionMathador'
import {
  fonctionComparaison,
  handleLeCompteEstBon,
} from '../../src/lib/interactif/comparisonFunctions'
import { texNombre } from '../../src/lib/outils/texNombre'

describe('fonctionComparaison', () => {
  it('Accepte une variable romaine ou un × collé à une lettre (1AL10-1)', () => {
    const reponse = '1.05\\times c_{n}-22'
    for (const saisie of [
      '1,05\\times c_\\mathrm{n}-22',
      '1{,}05\\times c_{\\mathrm{n}}-22',
      '1,05\\times\\mathrm{c}_n-22',
      '1,05×c_n-22',
    ]) {
      expect(fonctionComparaison(saisie, reponse).isOk).toBe(true)
      expect(
        fonctionComparaison(saisie, reponse, { calculFormel: true }).isOk,
      ).toBe(true)
    }
    expect(fonctionComparaison('1,05×c_n-23', reponse).isOk).toBe(false)
  })

  it('Refuse une réponse fausse face à une fonction inconnue comme V(X)', () => {
    const reponse = 'a^2V(X)'
    for (const saisie of [
      'a^2V(X)',
      'V(X)a^2',
      'a^2\\times V(X)',
      'a^{2}V\\left(X\\right)',
    ]) {
      expect(fonctionComparaison(saisie, reponse).isOk).toBe(true)
    }
    for (const saisie of ['zzz', '2a', 'a^3V(X)', 'a^2V(Y)']) {
      expect(fonctionComparaison(saisie, reponse).isOk).toBe(false)
    }
  })

  it('Refuse une réponse fausse face à une dérivée comme u′ ou f′(x) (afd39)', () => {
    for (const [reponse, justes, fausses] of [
      ["u'v + uv'", ["uv'+u'v"], ['0', 'x', "2\\left(u'v + uv'\\right)"]],
      ["k u'", ["u' k", "ku'"], ['0', 'x', 'm', "2ku'"]],
      ["f'(x)", ["f'(x)"], ['0', "-f'(x)", "2f'(x)"]],
      [
        "\\dfrac{u'v - uv'}{v^2}",
        ["\\frac{u'v-uv'}{v^2}"],
        ["-\\frac{u'v-uv'}{v^2}", "\\frac{u'v+uv'}{v^2}"],
      ],
    ] as const) {
      for (const saisie of justes)
        expect(fonctionComparaison(saisie, reponse).isOk).toBe(true)
      for (const saisie of fausses)
        expect(fonctionComparaison(saisie, reponse).isOk).toBe(false)
    }
  })

  it("N'accepte que la même écriture quand la réponse attendue est illisible", () => {
    const reponse = ']-\\infty; \\alpha['
    expect(fonctionComparaison(']-\\infty;\\alpha[', reponse).isOk).toBe(true)
    for (const saisie of [
      ']-\\infty;\\beta[',
      ']\\alpha;+\\infty[',
      ']-\\infty; \\alpha[+1',
    ])
      expect(fonctionComparaison(saisie, reponse).isOk).toBe(false)
  })

  it('Doit retourner true for si saisie et answer sont identiques', () => {
    let result = fonctionComparaison('test', 'test', { texteAvecCasse: true })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('3\\times2', '6')
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\sqrt{36}', '6')
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('2\\times (3^2-\\dfrac{24}{4})', '6')
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('5+\\cos(2\\pi)', '6')
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('-0.07\\times n+18', '-0.07n+18')
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('-2-(6-2)', '-6')
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('0', '\\cos((2^30+0.49999999999)\\pi)', {})
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('0.25', '\\frac14')
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('m', 'm')
    expect(result.isOk).toBe(true)
  })

  it('Doit retourner false si saisie et answer sont différents', () => {
    const result = fonctionComparaison('2^{-30}-2^{-31}', '0', {}) // On teste les calculs très petits différents de 0
    expect(result.isOk).toBe(false)
    const result3 = fonctionComparaison('0.33333333333333', '\\frac{1}{3}', {}) // un seul 3 de plus et c'est true !
    expect(result3.isOk).toBe(false)
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ███████ ██   ██ ██████  ██████  ███████ ███████ ███████ ██  ██████  ███    ██ ███████
  //    ██       ██ ██  ██   ██ ██   ██ ██      ██      ██      ██ ██    ██ ████   ██ ██
  //    █████     ███   ██████  ██████  █████   ███████ ███████ ██ ██    ██ ██ ██  ██ ███████
  //    ██       ██ ██  ██      ██   ██ ██           ██      ██ ██ ██    ██ ██  ██ ██      ██
  //    ███████ ██   ██ ██      ██   ██ ███████ ███████ ███████ ██  ██████  ██   ████ ███████
  //
  //
  //    ███████  ██████  ██████   ██████ ███████ ███    ███ ███████ ███    ██ ████████
  //    ██      ██    ██ ██   ██ ██      ██      ████  ████ ██      ████   ██    ██
  //    █████   ██    ██ ██████  ██      █████   ██ ████ ██ █████   ██ ██  ██    ██
  //    ██      ██    ██ ██   ██ ██      ██      ██  ██  ██ ██      ██  ██ ██    ██
  //    ██       ██████  ██   ██  ██████ ███████ ██      ██ ███████ ██   ████    ██
  //
  //
  //    ██████  ███████ ██████  ██    ██ ██ ████████ ███████ ███████
  //    ██   ██ ██      ██   ██ ██    ██ ██    ██    ██      ██
  //    ██████  █████   ██   ██ ██    ██ ██    ██    █████   ███████
  //    ██   ██ ██      ██   ██ ██    ██ ██    ██    ██           ██
  //    ██   ██ ███████ ██████   ██████  ██    ██    ███████ ███████
  //
  //

  it("Vérifie le fonctionnement de l'option expressionsForcementReduites", () => {
    let result = fonctionComparaison('2x', 'x+x', {
      expressionsForcementReduites: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('2x', '2x', {
      expressionsForcementReduites: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('x', 'x', {
      expressionsForcementReduites: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\dfrac23 x', '\\dfrac23 x', {
      expressionsForcementReduites: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      '\\dfrac{15}{28} t^2 x^2 z',
      '\\dfrac{15}{28} t^2 x^2 z',
      {
        expressionsForcementReduites: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('x', '2x-x', {
      expressionsForcementReduites: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('-\\dfrac{9}{35} t', '-\\dfrac{9}{35} t', {
      expressionsForcementReduites: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('-72', '-72', {
      expressionsForcementReduites: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('-\\dfrac{35}{12}', '-\\dfrac{35}{12}', {
      expressionsForcementReduites: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('2x+2x^2+4', '2x^2+2x+4', {
      expressionsForcementReduites: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('-12x+3', '-12x+3', {
      expressionsForcementReduites: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('3-12x', '-12x+3', {
      expressionsForcementReduites: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('2x+2x^2-4', '2x^2+2x-4', {
      expressionsForcementReduites: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('2x+x^2+1', '(x+1)^2', {
      expressionsForcementReduites: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('3-12x', '-12x+3', {
      expressionsForcementReduites: true,
    })

    expect(result.isOk).toBe(true)

    result = fonctionComparaison('3-12x', '3-12x', {
      expressionsForcementReduites: true,
    })

    expect(result.isOk).toBe(true)

    result = fonctionComparaison('36a^2+3a-18', '36a^2+3a-18', {
      expressionsForcementReduites: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('3.1x+12', '3.1x+12', {
      expressionsForcementReduites: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('3x^2+12x', '3x^2+12x', {
      expressionsForcementReduites: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      '-\\dfrac{40}{8}x^2-\\dfrac{35}{8}x',
      '-\\dfrac{40}{8}x^2-\\dfrac{35}{8}x',
      {
        expressionsForcementReduites: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      '-\\dfrac{54}{7}x+\\dfrac{30}{56}',
      '-\\dfrac{54}{7}x+\\dfrac{30}{56}',
      {
        expressionsForcementReduites: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('-2\\times x-2\\times (-4)', '-2(x-4)', {
      expressionsForcementReduites: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Cette expression est bien égale à celle attendue mais n'est pas assez réduite (présence d'un signe $\\times$).",
    )

    result = fonctionComparaison('-5\\times x-5\\times (-3)', '-5x+15', {
      expressionsForcementReduites: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Cette expression est bien égale à celle attendue mais n'est pas assez réduite (présence d'un signe $\\times$).",
    )

    result = fonctionComparaison('x + x', '2x', {
      expressionsForcementReduites: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Cette expression est bien égale à celle attendue mais n'est pas assez réduite.",
    )

    result = fonctionComparaison('x+2x^2+2+x+2', '2x^2+2x+4', {
      expressionsForcementReduites: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Cette expression est bien égale à celle attendue mais n'est pas assez réduite.",
    )
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //     █████  ██████  ██████  ██ ████████ ██  ██████  ███    ██
  //    ██   ██ ██   ██ ██   ██ ██    ██    ██ ██    ██ ████   ██
  //    ███████ ██   ██ ██   ██ ██    ██    ██ ██    ██ ██ ██  ██
  //    ██   ██ ██   ██ ██   ██ ██    ██    ██ ██    ██ ██  ██ ██
  //    ██   ██ ██████  ██████  ██    ██    ██  ██████  ██   ████
  //
  //
  //    ███████ ███████ ██    ██ ██      ███████ ███    ███ ███████ ███    ██ ████████
  //    ██      ██      ██    ██ ██      ██      ████  ████ ██      ████   ██    ██
  //    ███████ █████   ██    ██ ██      █████   ██ ████ ██ █████   ██ ██  ██    ██
  //         ██ ██      ██    ██ ██      ██      ██  ██  ██ ██      ██  ██ ██    ██
  //    ███████ ███████  ██████  ███████ ███████ ██      ██ ███████ ██   ████    ██
  //
  //
  //    ███████ ████████ ███    ██  ██████  ███    ██ ██████  ███████ ███████ ██    ██ ██      ████████  █████  ████████
  //    ██         ██    ████   ██ ██    ██ ████   ██ ██   ██ ██      ██      ██    ██ ██         ██    ██   ██    ██
  //    █████      ██    ██ ██  ██ ██    ██ ██ ██  ██ ██████  █████   ███████ ██    ██ ██         ██    ███████    ██
  //    ██         ██    ██  ██ ██ ██    ██ ██  ██ ██ ██   ██ ██           ██ ██    ██ ██         ██    ██   ██    ██
  //    ███████    ██    ██   ████  ██████  ██   ████ ██   ██ ███████ ███████  ██████  ███████    ██    ██   ██    ██
  //
  //

  it("Vérifie le fonctionnement de l'option additionSeulementEtNonResultat", () => {
    let result = fonctionComparaison('2 + 4', '6', {
      additionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(true)
    expect(result.feedback).toBe('')
    result = fonctionComparaison('7+1', '12-4', {
      additionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(true)
    result = fonctionComparaison('8+(-1)', '7', {
      additionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(true)
    expect(result.feedback).toBe('')
    result = fonctionComparaison('6+0', '6', {
      additionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car la somme par 0 est inutile.',
    )
    result = fonctionComparaison('4', '3+1', {
      additionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car un calcul est attendu.',
    )
    result = fonctionComparaison('2 \\times 3', '6', {
      additionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Résultat incorrect car c'est une somme qui est attendue.",
    )
    result = fonctionComparaison('12 \\div 2', '6', {
      additionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Résultat incorrect car c'est une somme qui est attendue.",
    )
    result = fonctionComparaison('7-1', '6', {
      additionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Résultat incorrect car c'est une somme qui est attendue.",
    )
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ███████  ██████  ██    ██ ███████ ████████ ██████   █████   ██████ ████████ ██  ██████  ███    ██
  //    ██      ██    ██ ██    ██ ██         ██    ██   ██ ██   ██ ██         ██    ██ ██    ██ ████   ██
  //    ███████ ██    ██ ██    ██ ███████    ██    ██████  ███████ ██         ██    ██ ██    ██ ██ ██  ██
  //         ██ ██    ██ ██    ██      ██    ██    ██   ██ ██   ██ ██         ██    ██ ██    ██ ██  ██ ██
  //    ███████  ██████   ██████  ███████    ██    ██   ██ ██   ██  ██████    ██    ██  ██████  ██   ████
  //
  //
  //    ███████ ███████ ██    ██ ██      ███████ ███    ███ ███████ ███    ██ ████████
  //    ██      ██      ██    ██ ██      ██      ████  ████ ██      ████   ██    ██
  //    ███████ █████   ██    ██ ██      █████   ██ ████ ██ █████   ██ ██  ██    ██
  //         ██ ██      ██    ██ ██      ██      ██  ██  ██ ██      ██  ██ ██    ██
  //    ███████ ███████  ██████  ███████ ███████ ██      ██ ███████ ██   ████    ██
  //
  //
  //    ███████ ████████ ███    ██  ██████  ███    ██ ██████  ███████ ███████ ██    ██ ██      ████████  █████  ████████
  //    ██         ██    ████   ██ ██    ██ ████   ██ ██   ██ ██      ██      ██    ██ ██         ██    ██   ██    ██
  //    █████      ██    ██ ██  ██ ██    ██ ██ ██  ██ ██████  █████   ███████ ██    ██ ██         ██    ███████    ██
  //    ██         ██    ██  ██ ██ ██    ██ ██  ██ ██ ██   ██ ██           ██ ██    ██ ██         ██    ██   ██    ██
  //    ███████    ██    ██   ████  ██████  ██   ████ ██   ██ ███████ ███████  ██████  ███████    ██    ██   ██    ██
  //
  //

  it("Vérifie le fonctionnement de l'option soustractionSeulementEtNonResultat", () => {
    let result = fonctionComparaison('2 - 4', '-2', {
      soustractionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(true)
    expect(result.feedback).toBe('')

    result = fonctionComparaison('4-2', '2', {
      soustractionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(true)
    expect(result.feedback).toBe('')

    result = fonctionComparaison('7-1', '12-6', {
      soustractionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('8-(-1)', '9', {
      soustractionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(true)
    expect(result.feedback).toBe('')

    result = fonctionComparaison('6-0', '6', {
      soustractionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car la différence par 0 est inutile.',
    )

    result = fonctionComparaison('2', '3-1', {
      soustractionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car un calcul est attendu.',
    )

    result = fonctionComparaison('2 \\times 3', '6', {
      soustractionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Résultat incorrect car c'est une différence qui est attendue.",
    )

    result = fonctionComparaison('12 \\div 2', '6', {
      soustractionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Résultat incorrect car c'est une différence qui est attendue.",
    )

    result = fonctionComparaison('7+1', '8', {
      soustractionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Résultat incorrect car c'est une différence qui est attendue.",
    )
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ███    ███ ██    ██ ██      ████████ ██ ██████  ██      ██  ██████  █████  ████████ ██  ██████  ███    ██
  //    ████  ████ ██    ██ ██         ██    ██ ██   ██ ██      ██ ██      ██   ██    ██    ██ ██    ██ ████   ██
  //    ██ ████ ██ ██    ██ ██         ██    ██ ██████  ██      ██ ██      ███████    ██    ██ ██    ██ ██ ██  ██
  //    ██  ██  ██ ██    ██ ██         ██    ██ ██      ██      ██ ██      ██   ██    ██    ██ ██    ██ ██  ██ ██
  //    ██      ██  ██████  ███████    ██    ██ ██      ███████ ██  ██████ ██   ██    ██    ██  ██████  ██   ████
  //
  //
  //    ███████ ███████ ██    ██ ██      ███████ ███    ███ ███████ ███    ██ ████████
  //    ██      ██      ██    ██ ██      ██      ████  ████ ██      ████   ██    ██
  //    ███████ █████   ██    ██ ██      █████   ██ ████ ██ █████   ██ ██  ██    ██
  //         ██ ██      ██    ██ ██      ██      ██  ██  ██ ██      ██  ██ ██    ██
  //    ███████ ███████  ██████  ███████ ███████ ██      ██ ███████ ██   ████    ██
  //
  //
  //    ███████ ████████ ███    ██  ██████  ███    ██ ██████  ███████ ███████ ██    ██ ██      ████████  █████  ████████
  //    ██         ██    ████   ██ ██    ██ ████   ██ ██   ██ ██      ██      ██    ██ ██         ██    ██   ██    ██
  //    █████      ██    ██ ██  ██ ██    ██ ██ ██  ██ ██████  █████   ███████ ██    ██ ██         ██    ███████    ██
  //    ██         ██    ██  ██ ██ ██    ██ ██  ██ ██ ██   ██ ██           ██ ██    ██ ██         ██    ██   ██    ██
  //    ███████    ██    ██   ████  ██████  ██   ████ ██   ██ ███████ ███████  ██████  ███████    ██    ██   ██    ██
  //
  //

  it("Vérifie le fonctionnement de l'option multiplicationSeulementEtNonResultat", () => {
    let result = fonctionComparaison('2 \\times 4', '8', {
      multiplicationSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(true)
    expect(result.feedback).toBe('')
    result = fonctionComparaison('4\\times3', '2\\times6', {
      multiplicationSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(true)
    expect(result.feedback).toBe('')
    result = fonctionComparaison('7\\times(-1)', '-7', {
      multiplicationSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(true)
    result = fonctionComparaison('-7\\times(-1)', '7', {
      multiplicationSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(true)
    expect(result.feedback).toBe('')
    result = fonctionComparaison('6\\times1', '6', {
      multiplicationSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car la multiplication par 1 est inutile.',
    )
    result = fonctionComparaison('12', '3\\times4', {
      multiplicationSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car un calcul est attendu.',
    )
    result = fonctionComparaison('2 + 3', '5', {
      multiplicationSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Résultat incorrect car c'est une multiplication qui est attendue.",
    )
    result = fonctionComparaison('12 \\div 2', '6', {
      multiplicationSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Résultat incorrect car c'est une multiplication qui est attendue.",
    )
    result = fonctionComparaison('7+1', '8', {
      multiplicationSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Résultat incorrect car c'est une multiplication qui est attendue.",
    )
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ██████  ██ ██    ██ ██ ███████ ██  ██████  ███    ██
  //    ██   ██ ██ ██    ██ ██ ██      ██ ██    ██ ████   ██
  //    ██   ██ ██ ██    ██ ██ ███████ ██ ██    ██ ██ ██  ██
  //    ██   ██ ██  ██  ██  ██      ██ ██ ██    ██ ██  ██ ██
  //    ██████  ██   ████   ██ ███████ ██  ██████  ██   ████
  //
  //
  //    ███████ ███████ ██    ██ ██      ███████ ███    ███ ███████ ███    ██ ████████
  //    ██      ██      ██    ██ ██      ██      ████  ████ ██      ████   ██    ██
  //    ███████ █████   ██    ██ ██      █████   ██ ████ ██ █████   ██ ██  ██    ██
  //         ██ ██      ██    ██ ██      ██      ██  ██  ██ ██      ██  ██ ██    ██
  //    ███████ ███████  ██████  ███████ ███████ ██      ██ ███████ ██   ████    ██
  //
  //
  //    ███████ ████████ ███    ██  ██████  ███    ██ ██████  ███████ ███████ ██    ██ ██      ████████  █████  ████████
  //    ██         ██    ████   ██ ██    ██ ████   ██ ██   ██ ██      ██      ██    ██ ██         ██    ██   ██    ██
  //    █████      ██    ██ ██  ██ ██    ██ ██ ██  ██ ██████  █████   ███████ ██    ██ ██         ██    ███████    ██
  //    ██         ██    ██  ██ ██ ██    ██ ██  ██ ██ ██   ██ ██           ██ ██    ██ ██         ██    ██   ██    ██
  //    ███████    ██    ██   ████  ██████  ██   ████ ██   ██ ███████ ███████  ██████  ███████    ██    ██   ██    ██
  //
  //

  it("Vérifie le fonctionnement de l'option divisionSeulementEtNonResultat", () => {
    let result = fonctionComparaison('6 \\div 2', '3', {
      divisionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(true)
    expect(result.feedback).toBe('')
    result = fonctionComparaison('5\\div2', '2.5', {
      divisionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(true)
    expect(result.feedback).toBe('')
    result = fonctionComparaison('6 \\div (-2)', '-3', {
      divisionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(true)
    result = fonctionComparaison('-6 \\div2', '-3', {
      divisionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(true)
    expect(result.feedback).toBe('')
    result = fonctionComparaison('-6 \\div (-2)', '3', {
      divisionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(true)
    expect(result.feedback).toBe('')
    result = fonctionComparaison('6\\div1', '6', {
      divisionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car la division par 1 est inutile.',
    )
    result = fonctionComparaison('12', '48\\div4', {
      divisionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car un calcul est attendu.',
    )
    result = fonctionComparaison('2 + 3', '5', {
      divisionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Résultat incorrect car c'est une division qui est attendue.",
    )
    result = fonctionComparaison('12 \\times 2', '24', {
      divisionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Résultat incorrect car c'est une division qui est attendue.",
    )
    result = fonctionComparaison('7+1', '8', {
      divisionSeulementEtNonResultat: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Résultat incorrect car c'est une division qui est attendue.",
    )
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ███████ ██████   █████   ██████ ████████ ██  ██████  ███    ██
  //    ██      ██   ██ ██   ██ ██         ██    ██ ██    ██ ████   ██
  //    █████   ██████  ███████ ██         ██    ██ ██    ██ ██ ██  ██
  //    ██      ██   ██ ██   ██ ██         ██    ██ ██    ██ ██  ██ ██
  //    ██      ██   ██ ██   ██  ██████    ██    ██  ██████  ██   ████
  //
  //
  //    ██ ██████  ██████  ███████ ██████  ██    ██  ██████ ████████ ██ ██████  ██      ███████
  //    ██ ██   ██ ██   ██ ██      ██   ██ ██    ██ ██         ██    ██ ██   ██ ██      ██
  //    ██ ██████  ██████  █████   ██   ██ ██    ██ ██         ██    ██ ██████  ██      █████
  //    ██ ██   ██ ██   ██ ██      ██   ██ ██    ██ ██         ██    ██ ██   ██ ██      ██
  //    ██ ██   ██ ██   ██ ███████ ██████   ██████   ██████    ██    ██ ██████  ███████ ███████
  //
  //

  it("Vérifie le fonctionnement de l'option fractionIrreductible", () => {
    let result = fonctionComparaison('\\dfrac{1}{2}', '\\dfrac{2}{4}', {
      fractionIrreductible: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\dfrac{4}{8}', '\\dfrac{1}{2}', {
      fractionIrreductible: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car une fraction irréductible est attendue.',
    )

    result = fonctionComparaison('\\dfrac{8}{16}', '\\dfrac{8}{16}', {
      fractionIrreductible: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car une fraction irréductible est attendue.',
    )

    result = fonctionComparaison('\\dfrac{2}{4}', '\\dfrac{2}{4}', {
      fractionIrreductible: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car une fraction irréductible est attendue.',
    )

    result = fonctionComparaison('0.5', '\\dfrac{1}{2}', {
      fractionIrreductible: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car une fraction est attendue.',
    )

    result = fonctionComparaison('1\\div2', '\\dfrac{10}{20}', {
      fractionIrreductible: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car une fraction est attendue.',
    )

    result = fonctionComparaison('\\dfrac13', '\\dfrac{1}{2}', {
      fractionIrreductible: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `C'est bien une fraction irréductible mais pas égale à celle attendue.`,
    )

    result = fonctionComparaison('\\dfrac{1}{1+1}', '\\dfrac{1}{2}', {
      fractionIrreductible: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Résultat incorrect car le dénominateur est un calcul : il doit être un nombre entier.`,
    )
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ███████ ██████   █████   ██████ ████████ ██  ██████  ███    ██
  //    ██      ██   ██ ██   ██ ██         ██    ██ ██    ██ ████   ██
  //    █████   ██████  ███████ ██         ██    ██ ██    ██ ██ ██  ██
  //    ██      ██   ██ ██   ██ ██         ██    ██ ██    ██ ██  ██ ██
  //    ██      ██   ██ ██   ██  ██████    ██    ██  ██████  ██   ████
  //
  //
  //    ███████ ██ ███    ███ ██████  ██      ██ ███████ ██ ███████ ███████
  //    ██      ██ ████  ████ ██   ██ ██      ██ ██      ██ ██      ██
  //    ███████ ██ ██ ████ ██ ██████  ██      ██ █████   ██ █████   █████
  //         ██ ██ ██  ██  ██ ██      ██      ██ ██      ██ ██      ██
  //    ███████ ██ ██      ██ ██      ███████ ██ ██      ██ ███████ ███████
  //
  //

  it("Vérifie le fonctionnement de l'option fractionSimplifiee", () => {
    let result = fonctionComparaison('\\dfrac{4}{8}', '\\dfrac{8}{16}', {
      fractionSimplifiee: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\dfrac{1}{2}', '\\dfrac{8}{16}', {
      fractionSimplifiee: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('0.5', '\\dfrac{8}{16}', {
      fractionSimplifiee: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car une fraction est attendue.',
    )

    result = fonctionComparaison('\\dfrac{0.8}{1.6}', '\\dfrac{8}{16}', {
      fractionSimplifiee: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car dénominateur et numérateur doivent être entiers.',
    )

    result = fonctionComparaison('\\dfrac{10}{21}', '\\dfrac{10}{20}', {
      fractionSimplifiee: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Cette fraction n'est pas égale à celle attendue.`,
    )

    result = fonctionComparaison('\\dfrac{3}{6}', '\\dfrac{8}{16}', {
      fractionSimplifiee: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Cette fraction est bien égale à celle attendue mais n'est pas simplifiée.`,
    )

    result = fonctionComparaison('\\dfrac{1}{1+1}', '\\dfrac{8}{16}', {
      fractionSimplifiee: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Résultat incorrect car le dénominateur est un calcul : il doit être un nombre entier.`,
    )
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ███████ ██████   █████   ██████ ████████ ██  ██████  ███    ██
  //    ██      ██   ██ ██   ██ ██         ██    ██ ██    ██ ████   ██
  //    █████   ██████  ███████ ██         ██    ██ ██    ██ ██ ██  ██
  //    ██      ██   ██ ██   ██ ██         ██    ██ ██    ██ ██  ██ ██
  //    ██      ██   ██ ██   ██  ██████    ██    ██  ██████  ██   ████
  //
  //
  //    ██████  ███████ ██████  ██    ██ ██ ████████ ███████
  //    ██   ██ ██      ██   ██ ██    ██ ██    ██    ██
  //    ██████  █████   ██   ██ ██    ██ ██    ██    █████
  //    ██   ██ ██      ██   ██ ██    ██ ██    ██    ██
  //    ██   ██ ███████ ██████   ██████  ██    ██    ███████
  //
  //

  it("Vérifie le fonctionnement de l'option fractionReduite", () => {
    let result = fonctionComparaison('\\dfrac{4}{8}', '\\dfrac{8}{16}', {
      fractionReduite: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\dfrac{3}{6}', '\\dfrac{8}{16}', {
      fractionReduite: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\dfrac{-3}{6}', '\\dfrac{-8}{16}', {
      fractionReduite: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\dfrac{3}{-6}', '\\dfrac{-8}{16}', {
      fractionReduite: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('-\\dfrac{3}{6}', '\\dfrac{-8}{16}', {
      fractionReduite: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('-\\dfrac{-3}{-6}', '\\dfrac{-8}{16}', {
      fractionReduite: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\dfrac{-3}{6}', '\\dfrac{8}{-16}', {
      fractionReduite: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\dfrac{-3}{6}', '-\\dfrac{8}{16}', {
      fractionReduite: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      '\\dfrac{1}{9}',
      '\\dfrac{1\\,156}{10\\,404}',
      {
        fractionReduite: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\dfrac{16}{32}', '\\dfrac{8}{16}', {
      fractionReduite: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Cette fraction est bien égale à celle attendue mais n'est pas réduite.`,
    )

    result = fonctionComparaison('\\dfrac{8}{16}', '\\dfrac{8}{16}', {
      fractionReduite: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Cette fraction est bien égale à celle attendue mais n'est pas réduite.`,
    )

    result = fonctionComparaison('\\dfrac{1}{1+1}', '\\dfrac{8}{16}', {
      fractionReduite: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Résultat incorrect car le dénominateur est un calcul : il doit être un nombre entier.`,
    )
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ███████ ██████   █████   ██████ ████████ ██  ██████  ███    ██
  //    ██      ██   ██ ██   ██ ██         ██    ██ ██    ██ ████   ██
  //    █████   ██████  ███████ ██         ██    ██ ██    ██ ██ ██  ██
  //    ██      ██   ██ ██   ██ ██         ██    ██ ██    ██ ██  ██ ██
  //    ██      ██   ██ ██   ██  ██████    ██    ██  ██████  ██   ████
  //
  //
  //    ██████  ███████  ██████ ██ ███    ███  █████  ██      ███████
  //    ██   ██ ██      ██      ██ ████  ████ ██   ██ ██      ██
  //    ██   ██ █████   ██      ██ ██ ████ ██ ███████ ██      █████
  //    ██   ██ ██      ██      ██ ██  ██  ██ ██   ██ ██      ██
  //    ██████  ███████  ██████ ██ ██      ██ ██   ██ ███████ ███████
  //
  //

  it("Vérifie le fonctionnement de l'option fractionDecimale", () => {
    let result = fonctionComparaison('\\dfrac{5}{10}', '0.5', {
      fractionDecimale: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\dfrac{5}{10}', '\\dfrac{5}{10}', {
      fractionDecimale: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\dfrac{5}{10}', '\\dfrac12', {
      fractionDecimale: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\dfrac{6}{12}', '0.5', {
      fractionDecimale: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car une fraction décimale est attendue.',
    )

    result = fonctionComparaison('0.5', '0.5', {
      fractionDecimale: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car une fraction est attendue.',
    )

    result = fonctionComparaison('\\frac{4}{2\\times5}', '0.4', {
      fractionDecimale: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car le dénominateur est un calcul : il doit être un nombre entier.',
    )
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ███████ ██████   █████   ██████ ████████ ██  ██████  ███    ██
  //    ██      ██   ██ ██   ██ ██         ██    ██ ██    ██ ████   ██
  //    █████   ██████  ███████ ██         ██    ██ ██    ██ ██ ██  ██
  //    ██      ██   ██ ██   ██ ██         ██    ██ ██    ██ ██  ██ ██
  //    ██      ██   ██ ██   ██  ██████    ██    ██  ██████  ██   ████
  //
  //
  //    ███████  █████  ███    ██ ███████
  //    ██      ██   ██ ████   ██ ██
  //    ███████ ███████ ██ ██  ██ ███████
  //         ██ ██   ██ ██  ██ ██      ██
  //    ███████ ██   ██ ██   ████ ███████
  //
  //
  //    ██████   █████   ██████ ██ ███    ██ ███████ ███████
  //    ██   ██ ██   ██ ██      ██ ████   ██ ██      ██
  //    ██████  ███████ ██      ██ ██ ██  ██ █████   ███████
  //    ██   ██ ██   ██ ██      ██ ██  ██ ██ ██           ██
  //    ██   ██ ██   ██  ██████ ██ ██   ████ ███████ ███████
  //
  //
  //     ██████  █████  ██████  ██████  ███████ ███████ ███████
  //    ██      ██   ██ ██   ██ ██   ██ ██      ██      ██
  //    ██      ███████ ██████  ██████  █████   █████   ███████
  //    ██      ██   ██ ██   ██ ██   ██ ██      ██           ██
  //     ██████ ██   ██ ██   ██ ██   ██ ███████ ███████ ███████
  //
  //

  it("Vérifie le fonctionnement de l'option fractionSansRacineCarree", () => {
    let result = fonctionComparaison(
      '\\dfrac{\\sqrt{2}}{2}',
      '\\dfrac{1}{\\sqrt{2}}',
      {
        fractionSansRacineCarree: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      '-\\dfrac{\\sqrt{2}}{2}',
      '\\dfrac{-1}{\\sqrt{2}}',
      {
        fractionSansRacineCarree: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      '\\dfrac{-\\sqrt{2}}{2}',
      '\\dfrac{-1}{\\sqrt{2}}',
      {
        fractionSansRacineCarree: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      '\\dfrac{-1}{\\sqrt{2}}',
      '\\dfrac{-1}{\\sqrt{2}}',
      {
        fractionSansRacineCarree: true,
      },
    )
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Incorrect car la fraction possède une racine carrée au dénominateur.',
    )

    result = fonctionComparaison(
      '-1\\times\\dfrac{1}{\\sqrt{2}}',
      '\\dfrac{-1}{\\sqrt{2}}',
      {
        fractionSansRacineCarree: true,
      },
    )
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Incorrect car la réponse attendue est une fraction.',
    )

    result = fonctionComparaison(
      '-\\frac{\\sqrt[1+1}}{2}',
      '\\dfrac{-1}{\\sqrt{2}}',
      {
        fractionSansRacineCarree: true,
      },
    )
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Incorrect car la réponse attendue est une fraction.',
    )
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ███████ ██████   █████   ██████ ████████ ██  ██████  ███    ██
  //    ██      ██   ██ ██   ██ ██         ██    ██ ██    ██ ████   ██
  //    █████   ██████  ███████ ██         ██    ██ ██    ██ ██ ██  ██
  //    ██      ██   ██ ██   ██ ██         ██    ██ ██    ██ ██  ██ ██
  //    ██      ██   ██ ██   ██  ██████    ██    ██  ██████  ██   ████
  //
  //
  //    ███████  ██████   █████  ██      ███████
  //    ██      ██       ██   ██ ██      ██
  //    █████   ██   ███ ███████ ██      █████
  //    ██      ██    ██ ██   ██ ██      ██
  //    ███████  ██████  ██   ██ ███████ ███████
  //
  //

  it("Vérifie le fonctionnement de l'option fractionEgale", () => {
    let result = fonctionComparaison('\\dfrac{32}{64}', '\\dfrac{8}{16}', {
      fractionEgale: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\dfrac{1}{2}', '\\dfrac{4}{8}', {
      fractionEgale: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\dfrac{7}{14}', '\\dfrac{4}{8}', {
      fractionEgale: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('0.5', '\\dfrac{4}{8}', {
      fractionEgale: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car une fraction est attendue.',
    )

    result = fonctionComparaison('\\dfrac{-3}{4}', '-\\dfrac{3}{4}', {
      fractionEgale: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\dfrac{-3}{4}', '-\\dfrac{30}{40}', {
      fractionEgale: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\dfrac{-3*10}{40}', '-\\dfrac{30}{40}', {
      fractionEgale: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car le numérateur est un calcul : il doit être un nombre entier.',
    )

    result = fonctionComparaison('-\\dfrac{20+10}{40}', '-\\dfrac{30}{40}', {
      fractionEgale: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car le numérateur est un calcul : il doit être un nombre entier.',
    )

    result = fonctionComparaison('\\dfrac{10-40}{40}', '-\\dfrac{30}{40}', {
      fractionEgale: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car le numérateur est un calcul : il doit être un nombre entier.',
    )
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ███████ ██████   █████   ██████ ████████ ██  ██████  ███    ██
  //    ██      ██   ██ ██   ██ ██         ██    ██ ██    ██ ████   ██
  //    █████   ██████  ███████ ██         ██    ██ ██    ██ ██ ██  ██
  //    ██      ██   ██ ██   ██ ██         ██    ██ ██    ██ ██  ██ ██
  //    ██      ██   ██ ██   ██  ██████    ██    ██  ██████  ██   ████
  //
  //
  //    ██ ██████  ███████ ███    ██ ████████ ██  ██████  ██    ██ ███████
  //    ██ ██   ██ ██      ████   ██    ██    ██ ██    ██ ██    ██ ██
  //    ██ ██   ██ █████   ██ ██  ██    ██    ██ ██    ██ ██    ██ █████
  //    ██ ██   ██ ██      ██  ██ ██    ██    ██ ██ ▄▄ ██ ██    ██ ██
  //    ██ ██████  ███████ ██   ████    ██    ██  ██████   ██████  ███████
  //                                                 ▀▀
  //

  it("Vérifie le fonctionnement de l'option fractionIdentique", () => {
    let result = fonctionComparaison('\\dfrac{8}{16}', '\\dfrac{8}{16}', {
      fractionIdentique: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('2', '\\dfrac{16}{8}', {
      fractionIdentique: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('0.5', '\\dfrac{8}{16}', {
      fractionIdentique: true,
    })
    expect(result.isOk).toBe(false)

    result = fonctionComparaison(
      '-\\dfrac{2026}{10^{5}}',
      '-\\dfrac{2026}{10^{5}}',
      {
        fractionIdentique: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\dfrac{32}{64}', '\\dfrac{8}{16}', {
      fractionIdentique: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Résultat incorrect car la fraction n'est pas identique à celle attendue.`,
    )

    result = fonctionComparaison('\\dfrac{1}{1+1}', '\\dfrac{1}{2}', {
      fractionIdentique: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Résultat incorrect car le dénominateur est un calcul : il doit être un nombre entier.`,
    )
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ███    ██  ██████  ███    ███ ██████  ██████  ███████
  //    ████   ██ ██    ██ ████  ████ ██   ██ ██   ██ ██
  //    ██ ██  ██ ██    ██ ██ ████ ██ ██████  ██████  █████
  //    ██  ██ ██ ██    ██ ██  ██  ██ ██   ██ ██   ██ ██
  //    ██   ████  ██████  ██      ██ ██████  ██   ██ ███████
  //
  //
  //    ██████  ███████  ██████ ██ ███    ███  █████  ██
  //    ██   ██ ██      ██      ██ ████  ████ ██   ██ ██
  //    ██   ██ █████   ██      ██ ██ ████ ██ ███████ ██
  //    ██   ██ ██      ██      ██ ██  ██  ██ ██   ██ ██
  //    ██████  ███████  ██████ ██ ██      ██ ██   ██ ███████
  //
  //
  //    ███████ ███████ ██    ██ ██      ███████ ███    ███ ███████ ███    ██ ████████
  //    ██      ██      ██    ██ ██      ██      ████  ████ ██      ████   ██    ██
  //    ███████ █████   ██    ██ ██      █████   ██ ████ ██ █████   ██ ██  ██    ██
  //         ██ ██      ██    ██ ██      ██      ██  ██  ██ ██      ██  ██ ██    ██
  //    ███████ ███████  ██████  ███████ ███████ ██      ██ ███████ ██   ████    ██
  //
  //

  it("Vérifie le fonctionnement de l'option nombreDecimalSeulement", () => {
    let result = fonctionComparaison('0.5', '0.5', {
      nombreDecimalSeulement: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('0,5', '0.5', {
      nombreDecimalSeulement: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\frac{1}{2}', '0.5', {
      nombreDecimalSeulement: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car une valeur décimale (ou entière) est attendue.',
    )

    result = fonctionComparaison('1/2', '0.5', {
      nombreDecimalSeulement: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car une valeur décimale (ou entière) est attendue.',
    )
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ███████ ██   ██ ██████  ██████  ███████ ███████ ███████ ██  ██████  ███    ██
  //    ██       ██ ██  ██   ██ ██   ██ ██      ██      ██      ██ ██    ██ ████   ██
  //    █████     ███   ██████  ██████  █████   ███████ ███████ ██ ██    ██ ██ ██  ██
  //    ██       ██ ██  ██      ██   ██ ██           ██      ██ ██ ██    ██ ██  ██ ██
  //    ███████ ██   ██ ██      ██   ██ ███████ ███████ ███████ ██  ██████  ██   ████
  //
  //
  //    ███    ██ ██    ██ ███    ███ ███████ ██████  ██  ██████  ██    ██ ███████
  //    ████   ██ ██    ██ ████  ████ ██      ██   ██ ██ ██    ██ ██    ██ ██
  //    ██ ██  ██ ██    ██ ██ ████ ██ █████   ██████  ██ ██    ██ ██    ██ █████
  //    ██  ██ ██ ██    ██ ██  ██  ██ ██      ██   ██ ██ ██ ▄▄ ██ ██    ██ ██
  //    ██   ████  ██████  ██      ██ ███████ ██   ██ ██  ██████   ██████  ███████
  //                                                         ▀▀
  //

  it("Vérifie le fonctionnement de l'option expressionNumerique", () => {
    let result = fonctionComparaison('2\\times3+1', '1+3\\times2', {
      expressionNumerique: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('3\\times2+1', '1+3\\times2', {
      expressionNumerique: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('(3\\times2)+1', '1+3\\times2', {
      expressionNumerique: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('3\\times(2+1)-2', '1+3\\times2', {
      expressionNumerique: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Ce résultat pourrait être correct mais ce n'est pas ce calcul qui est attendu.",
    )

    result = fonctionComparaison('4', '2+2', {
      expressionNumerique: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Ce résultat pourrait être correct mais un calcul est attendu.',
    )
  })

  it("Vérifie que l'option expressionNumerique contrôle la structure du calcul", () => {
    const attendu = '3\\times\\left(4+9-8\\div8\\right)'
    const options = { expressionNumerique: true }
    // Même calcul : ordre, parenthèses inutiles, fraction ou ÷
    for (const saisie of [
      '3\\times(4+9-8\\div8)',
      '(9+4-\\dfrac{8}{8})\\times3',
      '3\\times((4+9)-8\\div8)',
      '3\\times(9-8\\div8+4)',
    ]) {
      expect(fonctionComparaison(saisie, attendu, options).isOk, saisie).toBe(
        true,
      )
    }
    // Même valeur et mêmes nombres, mais autre calcul
    for (const saisie of [
      '3\\times4+9-8\\div8',
      '(3\\times4+9)-8\\div8',
      '3\\times(4+9)-8\\div8',
      '3\\times(4+9-8)\\div8',
      '3\\times(4+9+8\\div8)',
    ]) {
      expect(fonctionComparaison(saisie, attendu, options).isOk, saisie).toBe(
        false,
      )
    }
    expect(fonctionComparaison('8-(3-2)', '8-3-2', options).isOk).toBe(false)
    expect(fonctionComparaison('8-3-2', '8-2-3', options).isOk).toBe(true)
    expect(fonctionComparaison('8-3+2', '8-(3-2)', options).isOk).toBe(false)
    expect(fonctionComparaison('8-(3+2)', '8-3-2', options).isOk).toBe(false)
  })

  it("Vérifie le fonctionnement de l'option HMS", () => {
    let result = fonctionComparaison('1h30m', '1h30m', { HMS: true })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('1h30m27s', '1h30m27s', { HMS: true })
    expect(result.isOk).toBe(true)
    // On attend l'heure exacte, au format fourni.

    result = fonctionComparaison('1h30m', '90m', { HMS: true })
    expect(result.isOk).toBe(false)

    result = fonctionComparaison('1h1827s', '1h30m27s', { HMS: true })
    expect(result.isOk).toBe(false)

    result = fonctionComparaison('1m', '60s', { HMS: true })
    expect(result.isOk).toBe(false)
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ██ ███    ██ ████████ ███████ ██████  ██    ██  █████  ██      ██      ███████
  //    ██ ████   ██    ██    ██      ██   ██ ██    ██ ██   ██ ██      ██      ██
  //    ██ ██ ██  ██    ██    █████   ██████  ██    ██ ███████ ██      ██      █████
  //    ██ ██  ██ ██    ██    ██      ██   ██  ██  ██  ██   ██ ██      ██      ██
  //    ██ ██   ████    ██    ███████ ██   ██   ████   ██   ██ ███████ ███████ ███████
  //
  //

  it("Vérifie le fonctionnement de l'option intervalle", () => {
    // Traitement des true
    let result = fonctionComparaison('[1;2]', '[1;2]', { intervalle: true })
    expect(result.isOk).toBe(true)
    expect(result.feedback).toBe('')

    result = fonctionComparaison('\\emptyset', '\\emptyset', {
      intervalle: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\{\\}', '\\emptyset', {
      intervalle: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('∅', '\\emptyset', {
      intervalle: true,
    })
    expect(result.isOk).toBe(true)
    const ensembles = [
      ['ℕ', '\\mathbb{N}'],
      ['ℤ', '\\mathbb{Z}'],
      ['𝔻', '\\mathbb{D}'],
      ['ℚ', '\\mathbb{Q}'],
      ['ℝ', '\\mathbb{R}'],
      ['ℂ', '\\mathbb{C}'],
    ]

    for (const [saisie, answer] of ensembles) {
      result = fonctionComparaison(saisie, answer, { intervalle: true })
      expect(result.isOk).toBe(true)
    }
    result = fonctionComparaison(
      `\\mathbb{R}\\\\{7\\}`,
      `\\mathbb{R}\\\\{7\\}`,
      {
        intervalle: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(`\\{7\\}`, `\\{7\\}`, {
      intervalle: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(`\\{7\\}`, `\\{7\\}`, {
      intervalle: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      `\\{{\\dfrac{10^{-9}+4}{4}\\}`,
      `\\{{\\dfrac{10^{-9}+4}{4}\\}`,
      {
        intervalle: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      `]-8;\\,13[ \\cap ]5\\,;\\,+\\infty[`,
      `]-8;13[ \\cap ]5;+\\infty[`,
      {
        intervalle: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      `]5;+\\infty[ \\cup ]-8;13[`,
      `]-8;13[ \\cup ]5;+\\infty[`,
      {
        intervalle: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      `]-\\infty\\,;\\,-\\sqrt{3}[ \\cup ]\\sqrt{3}\\,;\\,+\\infty[`,
      `]-\\infty\\,;\\,-\\sqrt{3}[ \\cup ]\\sqrt{3}\\,;\\,+\\infty[`,
      {
        intervalle: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      `]-\\infty\\,;\\,-\\sqrt{3}[ \\cap ]\\sqrt{3}\\,;\\,+\\infty[`,
      `]-\\infty\\,;\\,-\\sqrt{3}[ \\cap ]\\sqrt{3}\\,;\\,+\\infty[`,
      {
        intervalle: true,
      },
    )
    expect(result.isOk).toBe(true)

    // Traitement des false

    result = fonctionComparaison(']1;2]', '[1;2]', { intervalle: true })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Le crochet placé en position 1 est mal orienté.<br>',
    )

    result = fonctionComparaison('vide', '\\emptyset', {
      intervalle: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "La bonne réponse était l'ensemble vide : $\\emptyset$.",
    )

    result = fonctionComparaison('C', '\\mathbb{R}', {
      intervalle: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `La bonne réponse était cet ensemble : $\\mathbb{R}$.`,
    )

    for (const [, answer] of ensembles) {
      const lettre = answer.match(/\\mathbb\{([^}]+)\}/)?.[1] ?? ''
      result = fonctionComparaison(lettre, answer, { intervalle: true })
      expect(result.isOk).toBe(false)
      expect(result.feedback).toBe(
        `La bonne réponse était $${answer}$ et non ${lettre}.`,
      )
    }

    for (const [, answer] of ensembles) {
      const lettre = answer.match(/\\mathbb\{([^}]+)\}/)?.[1] ?? ''
      const mauvaisesLettres = ensembles
        .map(([, a]) => a.match(/\\mathbb\{([^}]+)\}/)?.[1] ?? '')
        .filter((l) => l !== lettre)

      for (const mauvaisLettre of mauvaisesLettres) {
        result = fonctionComparaison(mauvaisLettre, answer, {
          intervalle: true,
        })
        expect(result.isOk).toBe(false)
        expect(result.feedback).toBe(
          `La bonne réponse était cet ensemble : $${answer}$.`,
        )
      }
    }

    result = fonctionComparaison(`\\{7\\}`, `{7}`, {
      intervalle: true,
    })
    expect(result.isOk).toBe(false)

    result = fonctionComparaison(`{7}`, `\\{7\\}`, {
      intervalle: true,
    })
    expect(result.isOk).toBe(false)

    result = fonctionComparaison(
      `]-8;5[ \\cup ]5;+\\infty[`,
      `]-8;5[ \\cap ]5;+\\infty[`,
      {
        intervalle: true,
      },
    )
    expect(result.isOk).toBe(false)
    expect(result.feedback).toContain(
      `Il y a une erreur avec l'opérateur : $\\cup$.<br>`,
    )

    result = fonctionComparaison(
      `]-8;5[ \\cap ]5;+\\infty[`,
      `]-8;5[ \\cup ]5;+\\infty[`,
      {
        intervalle: true,
      },
    )
    expect(result.isOk).toBe(false)
    expect(result.feedback).toContain(
      `Il y a une erreur avec l'opérateur : $\\cap$.<br>`,
    )

    result = fonctionComparaison(
      `]-7;5[ \\cup ]5;+\\infty[`,
      `]-8;5[ \\cup ]5;+\\infty[`,
      {
        intervalle: true,
      },
    )
    expect(result.isOk).toBe(false)
    expect(result.feedback).toContain(
      `Il y a une erreur avec la valeur : $-7$.<br>`,
    )

    result = fonctionComparaison(
      `]-8;4[ \\cup ]5;+\\infty[`,
      `]-8;5[ \\cup ]5;+\\infty[`,
      {
        intervalle: true,
      },
    )
    expect(result.isOk).toBe(false)
    expect(result.feedback).toContain(
      `Il y a une erreur avec la valeur : $4$.<br>`,
    )

    result = fonctionComparaison(
      `]-8;5[ \\cup ]5;+\\infty[`,
      `]-8;5[ \\cup ]5;7[`,
      {
        intervalle: true,
      },
    )
    expect(result.isOk).toBe(false)
    expect(result.feedback).toContain(
      `Il y a une erreur avec la valeur : $+\\infty$.<br>`,
    )

    result = fonctionComparaison(`[-8;5`, `]-8;5[`, {
      intervalle: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe('Il y a une erreur avec les crochets.')

    result = fonctionComparaison(`-8;5]`, `]-8;5[`, {
      intervalle: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe('Il y a une erreur avec les crochets.')

    result = fonctionComparaison(`-8;5`, `]-8;5[`, {
      intervalle: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Il faut donner un intervalle ou une réunion d'intervalles.",
    )
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ███████ ███████ ████████     ██████   █████  ███    ██ ███████
  //    ██      ██         ██        ██   ██ ██   ██ ████   ██ ██
  //    █████   ███████    ██        ██   ██ ███████ ██ ██  ██ ███████
  //    ██           ██    ██        ██   ██ ██   ██ ██  ██ ██      ██
  //    ███████ ███████    ██        ██████  ██   ██ ██   ████ ███████
  //
  //
  //    ██ ███    ██ ████████ ███████ ██████  ██    ██  █████  ██      ██      ███████
  //    ██ ████   ██    ██    ██      ██   ██ ██    ██ ██   ██ ██      ██      ██
  //    ██ ██ ██  ██    ██    █████   ██████  ██    ██ ███████ ██      ██      █████
  //    ██ ██  ██ ██    ██    ██      ██   ██  ██  ██  ██   ██ ██      ██      ██
  //    ██ ██   ████    ██    ███████ ██   ██   ████   ██   ██ ███████ ███████ ███████
  //
  //

  it("Vérifie le fonctionnement de l'option estDansIntervalle", () => {
    let result = fonctionComparaison('1.5', '[1;2]', {
      estDansIntervalle: true,
    })
    expect(result.isOk).toBe(true)
    result = fonctionComparaison('\\dfrac{3}{2}', '[1;2]', {
      estDansIntervalle: true,
    })
    expect(result.isOk).toBe(true)
    result = fonctionComparaison('\\sqrt{3}', '[1;2]', {
      estDansIntervalle: true,
    })
    expect(result.isOk).toBe(true)
    result = fonctionComparaison('\\sqrt{3}', '[\\sqrt{3};2]', {
      estDansIntervalle: true,
    })
    expect(result.isOk).toBe(true)
    result = fonctionComparaison('2x', '[-1;2]', {
      estDansIntervalle: true,
    })
    expect(result.isOk).toBe(false)
    result = fonctionComparaison('\\sqrt{3}', ']\\sqrt{3};2]', {
      estDansIntervalle: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe("$\\sqrt{3}$ est hors de l'intervalle.")
    result = fonctionComparaison('2', ']\\sqrt{3};2[', {
      estDansIntervalle: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe("$2$ est hors de l'intervalle.")
    result = fonctionComparaison('-12', ']-3;2[', {
      estDansIntervalle: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe("$-12$ est hors de l'intervalle.")
  })

  it("Vérifie le fonctionnement de l'option estDecimalDansIntervalle", () => {
    const options = { estDecimalDansIntervalle: true }
    for (const saisie of ['18', '17,5', '16', '20']) {
      expect(fonctionComparaison(saisie, '[16;20]', options).isOk, saisie).toBe(
        true,
      )
    }
    expect(fonctionComparaison('7,25', ']7;8[', options).isOk).toBe(true)
    let result = fonctionComparaison('21', '[16;20]', options)
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe("$21$ est hors de l'intervalle.")
    expect(fonctionComparaison('7', ']7;8[', options).isOk).toBe(false)
    // Un calcul, une fraction ou une racine ne sont pas un nombre écrit en chiffres
    for (const saisie of [
      '10+8',
      '\\frac{36}{2}',
      '\\sqrt{300}',
      '3\\times6',
    ]) {
      result = fonctionComparaison(saisie, '[16;20]', options)
      expect(result.isOk, saisie).toBe(false)
      expect(result.feedback).toBe(
        'Résultat incorrect car une valeur décimale (ou entière) est attendue.',
      )
    }
    for (const saisie of ['1/0', '0/0']) {
      expect(fonctionComparaison(saisie, '[16;20]', options).isOk, saisie).toBe(
        false,
      )
    }
    // estDansIntervalle, elle, accepte tout nombre de l'intervalle
    expect(
      fonctionComparaison('10+8', '[16;20]', { estDansIntervalle: true }).isOk,
    ).toBe(true)
  })

  it("Refuse une somme de nombres dans une suite avec l'option suiteDeNombres", () => {
    const message =
      'Résultat incorrect car chaque valeur doit être écrite sous la forme d’un nombre, pas d’un calcul.'
    for (const option of [
      { suiteDeNombres: true },
      { suiteRangeeDeNombres: true },
    ]) {
      expect(fonctionComparaison('4', '4', option).isOk).toBe(true)
      for (const saisie of ['3+1', '5-1', '2;3+1', '1+1+2']) {
        const result = fonctionComparaison(saisie, '4', option)
        expect(result.isOk, saisie).toBe(false)
        expect(result.feedback, saisie).toBe(message)
      }
    }
    expect(
      fonctionComparaison('2;4', '2;4', { suiteDeNombres: true }).isOk,
    ).toBe(true)
    expect(
      fonctionComparaison('4;2', '2;4', { suiteDeNombres: true }).isOk,
    ).toBe(true)
    // Les valeurs écrites avec une racine, une fraction ou une puissance restent admises
    expect(
      fonctionComparaison('1+\\sqrt{2}', '1+\\sqrt{2}', {
        suiteDeNombres: true,
      }).isOk,
    ).toBe(true)
    expect(
      fonctionComparaison('\\frac{1}{2};3', '\\frac{1}{2};3', {
        suiteDeNombres: true,
      }).isOk,
    ).toBe(true)
    // Une somme attendue telle quelle reste acceptée
    expect(
      fonctionComparaison('3+1', '3+1', { suiteDeNombres: true }).isOk,
    ).toBe(true)
  })

  it('Nomme le terme de la fraction qui n’est pas un entier écrit en chiffres', () => {
    const attendu = '\\dfrac{2}{3}'
    const cas: [string, string][] = [
      [
        '\\frac{36-7-11-9}{18}',
        'Résultat incorrect car le numérateur est un calcul : il doit être un nombre entier.',
      ],
      [
        '\\frac{2}{1+2}',
        'Résultat incorrect car le dénominateur est un calcul : il doit être un nombre entier.',
      ],
      [
        '\\frac{1+1}{1+2}',
        'Résultat incorrect car dénominateur et numérateur doivent être entiers.',
      ],
      [
        '\\frac{2,5}{3}',
        'Résultat incorrect car le numérateur doit être un nombre entier.',
      ],
      [
        '\\frac{2}{3,5}',
        'Résultat incorrect car le dénominateur doit être un nombre entier.',
      ],
    ]
    for (const options of [
      { fractionEgale: true },
      { fractionIrreductible: true },
      { fractionEgale: true, nombreDecimalSeulement: true },
    ]) {
      for (const [saisie, message] of cas) {
        const result = fonctionComparaison(saisie, attendu, options)
        expect(result.isOk, saisie).toBe(false)
        expect(result.feedback, `${saisie} ${JSON.stringify(options)}`).toBe(
          message,
        )
      }
    }
    for (const options of [
      { fractionSimplifiee: true },
      { fractionReduite: true },
    ]) {
      expect(
        fonctionComparaison('\\frac{36-7-11-9}{18}', '\\dfrac{9}{18}', options)
          .feedback,
      ).toBe(
        'Résultat incorrect car le numérateur est un calcul : il doit être un nombre entier.',
      )
    }
  })

  it('Refuse un calcul à valeur entière avec une option sur les fractions', () => {
    for (const options of [
      { fractionIrreductible: true },
      { fractionEgale: true },
      { fractionEgale: true, nombreDecimalSeulement: true },
    ]) {
      for (const saisie of ['21', '21,0']) {
        expect(fonctionComparaison(saisie, '21', options).isOk, saisie).toBe(
          true,
        )
      }
      for (const saisie of ['20+1', '3\\times7', '42/2']) {
        expect(fonctionComparaison(saisie, '21', options).isOk, saisie).toBe(
          false,
        )
      }
    }
    expect(
      fonctionComparaison('\\frac{42}{2}', '21', { fractionIrreductible: true })
        .isOk,
    ).toBe(false)
  })

  it('fractionEgale avec nombreDecimalSeulement : fraction égale ou décimal, pas un calcul', () => {
    const options = { fractionEgale: true, nombreDecimalSeulement: true }
    const attendu = '\\dfrac{11}{5}'
    for (const saisie of ['\\frac{11}{5}', '\\frac{22}{10}', '2,2', '2.2']) {
      expect(fonctionComparaison(saisie, attendu, options).isOk, saisie).toBe(
        true,
      )
    }
    for (const saisie of [
      '\\frac{3/4}{5/8}+1',
      '\\frac{3}{4}\\div\\frac{5}{8}+1',
      '1+\\frac{6}{5}',
      '\\frac{6}{5}+\\frac{5}{5}',
    ]) {
      const result = fonctionComparaison(saisie, attendu, options)
      expect(result.isOk, saisie).toBe(false)
    }
    expect(
      fonctionComparaison('1+\\frac{6}{5}', attendu, options).feedback,
    ).toBe(
      'Résultat incorrect car une fraction ou une valeur décimale (ou entière) est attendue.',
    )
  })

  it("Refuse une saisie infinie ou indéfinie avec l'option estDansIntervalle", () => {
    for (const saisie of ['1/0', '3/0', '\\dfrac{1}{0}', '0/0', '-1/0']) {
      for (const intervalle of ['[0;6]', ']11;12[', ']-3;2[', ']-\\infty;0[']) {
        const result = fonctionComparaison(saisie, intervalle, {
          estDansIntervalle: true,
        })
        expect(result.isOk, `${saisie} dans ${intervalle}`).toBe(false)
      }
    }
    // Les valeurs finies de l'intervalle restent acceptées, y compris avec une borne infinie
    expect(
      fonctionComparaison('-5', ']-\\infty;0[', { estDansIntervalle: true })
        .isOk,
    ).toBe(true)
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ███████  ██████ ██████  ██ ████████ ██    ██ ██████  ███████ ███████  ██████ ██ ███████ ███    ██ ████████ ██ ███████ ██  ██████  ██    ██ ███████
  //    ██      ██      ██   ██ ██    ██    ██    ██ ██   ██ ██      ██      ██      ██ ██      ████   ██    ██    ██ ██      ██ ██    ██ ██    ██ ██
  //    █████   ██      ██████  ██    ██    ██    ██ ██████  █████   ███████ ██      ██ █████   ██ ██  ██    ██    ██ █████   ██ ██    ██ ██    ██ █████
  //    ██      ██      ██   ██ ██    ██    ██    ██ ██   ██ ██           ██ ██      ██ ██      ██  ██ ██    ██    ██ ██      ██ ██ ▄▄ ██ ██    ██ ██
  //    ███████  ██████ ██   ██ ██    ██     ██████  ██   ██ ███████ ███████  ██████ ██ ███████ ██   ████    ██    ██ ██      ██  ██████   ██████  ███████
  //                                                                                                                                 ▀▀
  //

  it.each([
    ['1.2345\\times10^3', '1234.5'],
    ['3,340\\,739\\times10^{10}', '3.340739\\times10^{10}'],
    ['1.234567890123\\times10^{30}', '1.234567890123\\times10^{30}'],
    ['-1,234567\\times10^{-8}', '-1.234567\\times10^{-8}'],
    ['10^{-8}\\times1,234567', '1.234567\\times10^{-8}'],
    ['1,2345000\\cdot10^{+3}', '1234.5'],
    ['1,234567\\times10^0', '1.234567'],
    ['1,234567', '1.234567'],
  ])(
    'Accepte une mantisse longue sans arrondi : %s face à %s',
    (saisie, answer) => {
      expect(
        fonctionComparaison(saisie, answer, { ecritureScientifique: true })
          .isOk,
      ).toBe(true)
    },
  )

  it.each([
    ['1.2346\\times10^3', '1234.5'],
    ['3.340738\\times10^{10}', '3.340739\\times10^{10}'],
    ['1.234567890124\\times10^{30}', '1.234567890123\\times10^{30}'],
    ['1.2345\\times10^4', '1234.5'],
    ['-1.2345\\times10^3', '1234.5'],
    ['12.345\\times10^2', '1234.5'],
    ['0.12345\\times10^4', '1234.5'],
    ['1234.5', '1234.5'],
    ['1.2345\\times10^{2+1}', '1234.5'],
    ['0\\times10^3', '0'],
    ['10\\times10^3', '10000'],
  ])(
    'Refuse toujours une valeur fausse ou une forme non scientifique : %s face à %s',
    (saisie, answer) => {
      expect(
        fonctionComparaison(saisie, answer, { ecritureScientifique: true })
          .isOk,
      ).toBe(false)
    },
  )

  it("Vérifie le fonctionnement de l'option ecritureScientifique", () => {
    let result = fonctionComparaison('1,357\\times 10^3', '1357', {
      ecritureScientifique: true,
    })
    expect(result.isOk).toBe(true)
    result = fonctionComparaison('1,357\\cdot 10^3', '1357', {
      ecritureScientifique: true,
    })
    expect(result.isOk).toBe(true)
    result = fonctionComparaison('1,350\\cdot 10^3', '1350', {
      ecritureScientifique: true,
    })
    expect(result.isOk).toBe(true)
    result = fonctionComparaison('1,35\\cdot 10^3', '1350', {
      ecritureScientifique: true,
    })
    expect(result.isOk).toBe(true)
    result = fonctionComparaison('10^3 \\times 1,357', '1357', {
      ecritureScientifique: true,
    })
    expect(result.isOk).toBe(true)
    result = fonctionComparaison('1,357\\times 10^{3}', '1357', {
      ecritureScientifique: true,
    })
    expect(result.isOk).toBe(true)
    result = fonctionComparaison('1,357\\times 10^{+3}', '1357', {
      ecritureScientifique: true,
    })
    expect(result.isOk).toBe(true)
    result = fonctionComparaison('1 \\times 10^{3}', '1000', {
      ecritureScientifique: true,
    })
    expect(result.isOk).toBe(true)
    result = fonctionComparaison('1,357\\times 1000', '1357', {
      ecritureScientifique: true,
    })
    expect(result.isOk).toBe(false)
    result = fonctionComparaison('1,357\\times 10^0', '1.357', {
      ecritureScientifique: true,
    })
    expect(result.isOk).toBe(true)
    result = fonctionComparaison('1,357', '1.357', {
      ecritureScientifique: true,
    })
    expect(result.isOk).toBe(true)
    result = fonctionComparaison('1357', '1357', {
      ecritureScientifique: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "La réponse fournie est bien égale à celle attendue mais la réponse fournie n'est pas en notation scientifique.",
    )
    result = fonctionComparaison('13,57\\times 10^{2}', '1357', {
      ecritureScientifique: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "La réponse fournie est bien égale à celle attendue mais la réponse fournie n'est pas en notation scientifique.",
    )
    result = fonctionComparaison('1,357\\times 10^{4}', '1357', {
      ecritureScientifique: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "La réponse fournie est bien en notation scientifique mais la réponse fournie n'est pas égale à celle attendue.",
    )
    result = fonctionComparaison('13,75\\times 10^{2}', '1357', {
      ecritureScientifique: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe('La mantisse doit être inférieure à 10.')
    result = fonctionComparaison('0,75\\times 10^{2}', '1357', {
      ecritureScientifique: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'La mantisse doit être supérieure ou égale à 1.',
    )
    result = fonctionComparaison('x\\times 10^{2}', '1357', {
      ecritureScientifique: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Format incorrect : utilisez $a\\times10^b$ ou $10^b\\times a$ où $a$ et $b$ sont des décimaux.',
    )
    result = fonctionComparaison('\\dfrac12\\times 10^{2}', '1357', {
      ecritureScientifique: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Format incorrect : utilisez $a\\times10^b$ ou $10^b\\times a$ où $a$ et $b$ sont des décimaux.',
    )
    result = fonctionComparaison('\\dfrac12\\times 10^{2}', '1357', {
      ecritureScientifique: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Format incorrect : utilisez $a\\times10^b$ ou $10^b\\times a$ où $a$ et $b$ sont des décimaux.',
    )
    result = fonctionComparaison('\\dfrac12\\times 10^{2}', '1357', {
      ecritureScientifique: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Format incorrect : utilisez $a\\times10^b$ ou $10^b\\times a$ où $a$ et $b$ sont des décimaux.',
    )
    result = fonctionComparaison('1.2\\times 10^{x}', '1357', {
      ecritureScientifique: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Format incorrect : utilisez $a\\times10^b$ ou $10^b\\times a$ où $a$ et $b$ sont des décimaux.',
    )
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ██    ██ ███    ██ ██ ████████ ███████
  //    ██    ██ ████   ██ ██    ██    ██
  //    ██    ██ ██ ██  ██ ██    ██    █████
  //    ██    ██ ██  ██ ██ ██    ██    ██
  //     ██████  ██   ████ ██    ██    ███████
  //
  //
  //    ██████  ██████  ███████  ██████ ██ ███████ ██  ██████  ███    ██
  //    ██   ██ ██   ██ ██      ██      ██ ██      ██ ██    ██ ████   ██
  //    ██████  ██████  █████   ██      ██ ███████ ██ ██    ██ ██ ██  ██
  //    ██      ██   ██ ██      ██      ██      ██ ██ ██    ██ ██  ██ ██
  //    ██      ██   ██ ███████  ██████ ██ ███████ ██  ██████  ██   ████
  //
  //
  //    ██    ██ ███    ██ ██ ████████ ███████
  //    ██    ██ ████   ██ ██    ██    ██
  //    ██    ██ ██ ██  ██ ██    ██    █████
  //    ██    ██ ██  ██ ██ ██    ██    ██
  //     ██████  ██   ████ ██    ██    ███████
  //
  //

  it('Vérifie le fonctionnement des options unite et precisionUnite', () => {
    let result = fonctionComparaison(
      '3,5\\operatorname{\\mathrm{cm}}',
      '3,5cm',
      { unite: true },
    )
    expect(result.isOk).toBe(true)
    result = fonctionComparaison('0,035\\operatorname{\\mathrm{m}}', '3,5cm', {
      unite: true,
    })
    expect(result.isOk).toBe(true)
    result = fonctionComparaison('0,035\\operatorname{\\mathrm{g}}', '32cm', {
      unite: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(`L'unité choisie n'est, déjà, pas correcte.`)

    // Sans precisionUnite, la grandeur doit être exacte.
    result = fonctionComparaison('31\\operatorname{\\mathrm{cm}}', '32cm', {
      unite: true,
    })
    expect(result.isOk).toBe(false)
    result = fonctionComparaison('0,5\\operatorname{\\mathrm{m}}', '1m', {
      unite: true,
    })
    expect(result.isOk).toBe(false)
    result = fonctionComparaison('0,3\\operatorname{\\mathrm{dm}}', '0.03m', {
      unite: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('3,5', '3,5cm', { unite: true })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "La réponse pourrait être correcte si l'unité avait été précisée.",
    )

    result = fonctionComparaison('35', '3,5cm', { unite: true })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "La réponse pourrait être correcte si l'unité avait été précisée.",
    )

    result = fonctionComparaison('0.35', '3,5cm', { unite: true })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "La réponse pourrait être correcte si l'unité avait été précisée.",
    )

    result = fonctionComparaison('2,5', '3,5cm', { unite: true })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "La réponse est fausse et il faut saisir l'unité.",
    )

    result = fonctionComparaison('3,47\\operatorname{\\mathrm{m}}', '347cm', {
      unite: true,
      precisionUnite: 0,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('3,5\\operatorname{\\mathrm{m}}', '3.47m', {
      unite: true,
      precisionUnite: 0.1,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('3,4\\operatorname{\\mathrm{m}}', '3.47m', {
      unite: true,
      precisionUnite: 0.05,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Incorrect car la réponse n'est pas arrondie comme il faut.`,
    )

    result = fonctionComparaison('3\\operatorname{\\mathrm{m}}', '3.4m', {
      unite: true,
      precisionUnite: 0.1,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Incorrect car la réponse n'est pas arrondie comme il faut.`,
    )
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ██████  ██    ██ ██ ███████ ███████  █████  ███    ██  ██████ ███████
  //    ██   ██ ██    ██ ██ ██      ██      ██   ██ ████   ██ ██      ██
  //    ██████  ██    ██ ██ ███████ ███████ ███████ ██ ██  ██ ██      █████
  //    ██      ██    ██ ██      ██      ██ ██   ██ ██  ██ ██ ██      ██
  //    ██       ██████  ██ ███████ ███████ ██   ██ ██   ████  ██████ ███████
  //
  //
  //    ███████  █████  ███    ██ ███████ ███████ ██   ██ ██████   ██████  ███████  █████  ███    ██ ████████ ██    ██ ███    ██
  //    ██      ██   ██ ████   ██ ██      ██       ██ ██  ██   ██ ██    ██ ██      ██   ██ ████   ██    ██    ██    ██ ████   ██
  //    ███████ ███████ ██ ██  ██ ███████ █████     ███   ██████  ██    ██ ███████ ███████ ██ ██  ██    ██    ██    ██ ██ ██  ██
  //         ██ ██   ██ ██  ██ ██      ██ ██       ██ ██  ██      ██    ██      ██ ██   ██ ██  ██ ██    ██    ██    ██ ██  ██ ██
  //    ███████ ██   ██ ██   ████ ███████ ███████ ██   ██ ██       ██████  ███████ ██   ██ ██   ████    ██     ██████  ██   ████
  //
  //
  //    ███████ ███████ ██    ██ ██      ███████ ███    ███ ███████ ███    ██ ████████  ██████ ███████ ██████  ████████  █████  ██ ███    ██ ███████ ███████ ██████  ██    ██ ██ ███████ ███████  █████  ███    ██  ██████ ███████ ███████
  //    ██      ██      ██    ██ ██      ██      ████  ████ ██      ████   ██    ██    ██      ██      ██   ██    ██    ██   ██ ██ ████   ██ ██      ██      ██   ██ ██    ██ ██ ██      ██      ██   ██ ████   ██ ██      ██      ██
  //    ███████ █████   ██    ██ ██      █████   ██ ████ ██ █████   ██ ██  ██    ██    ██      █████   ██████     ██    ███████ ██ ██ ██  ██ █████   ███████ ██████  ██    ██ ██ ███████ ███████ ███████ ██ ██  ██ ██      █████   ███████
  //         ██ ██      ██    ██ ██      ██      ██  ██  ██ ██      ██  ██ ██    ██    ██      ██      ██   ██    ██    ██   ██ ██ ██  ██ ██ ██           ██ ██      ██    ██ ██      ██      ██ ██   ██ ██  ██ ██ ██      ██           ██
  //    ███████ ███████  ██████  ███████ ███████ ██      ██ ███████ ██   ████    ██     ██████ ███████ ██   ██    ██    ██   ██ ██ ██   ████ ███████ ███████ ██       ██████  ██ ███████ ███████ ██   ██ ██   ████  ██████ ███████ ███████
  //
  //

  it("Vérifie le fonctionnement de l'option puissance, sansExposantUn et seulementCertainesPuissances", () => {
    let result = fonctionComparaison('2^35', '2^35', { puissance: true })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('2^12', '4096', { puissance: true })
    expect(result.isOk).toBe(false)

    result = fonctionComparaison('2^{12}', '4096', { puissance: true })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('4^6', '2^12', { puissance: true })
    expect(result.isOk).toBe(false)

    result = fonctionComparaison('4^6', '2^{12}', { puissance: true })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('2^4', '16', { puissance: true })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('4^2', '2^4', { puissance: true })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('16^1', '16', { puissance: true })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('16', '16', { puissance: true })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('16', '2^4', { puissance: true })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe('Une puissance est attendue.')

    result = fonctionComparaison('2^5', '2^4', { puissance: true })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "La puissance n'est pas égale au résultat attendu.",
    )

    result = fonctionComparaison('a^5', 'a^5', { puissance: true })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('2\\times2^3', '2^4', { puissance: true })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Avant l'exposant, on n'attend qu'un nombre et rien d'autre.",
    )

    result = fonctionComparaison('2^{3+1}', '2^4', { puissance: true })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe('On attend un nombre unique comme exposant.')

    result = fonctionComparaison('16^1', '16', { sansExposantUn: true })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe('On attend un exposant différent de 1.')

    result = fonctionComparaison('2^2^2', '2^4', {
      seulementCertainesPuissances: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe('Un seul exposant est attendu.')

    result = fonctionComparaison('4^2', '2^4', {
      seulementCertainesPuissances: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "La puissance est égale au résultat attendu mais ne correspond pas à l'énoncé.",
    )

    result = fonctionComparaison('4^3', '2^4', {
      seulementCertainesPuissances: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "La puissance n'est pas égale au résultat attendu.",
    )

    // Exposant pair : le signe de la base n'est pas discriminant, ni dans un sens
    result = fonctionComparaison('\\lparen-6\\rparen^{4}', '6^{4}', {
      seulementCertainesPuissances: true,
    })
    expect(result.isOk).toBe(true)

    // ni dans l'autre
    result = fonctionComparaison('6^{4}', '(-6)^{4}', {
      seulementCertainesPuissances: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('(-6)^{-4}', '6^{-4}', {
      seulementCertainesPuissances: true,
    })
    expect(result.isOk).toBe(true)

    // Exposant impair : (-6)^3 et 6^3 sont opposés
    result = fonctionComparaison('(-6)^{3}', '6^{3}', {
      seulementCertainesPuissances: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "La puissance n'est pas égale au résultat attendu.",
    )

    // Une autre base reste refusée même avec un exposant pair
    result = fonctionComparaison('(-6)^{4}', '(-12)^{4}', {
      seulementCertainesPuissances: true,
    })
    expect(result.isOk).toBe(false)
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ████████ ███████ ██   ██ ████████ ███████
  //       ██    ██       ██ ██     ██    ██
  //       ██    █████     ███      ██    █████
  //       ██    ██       ██ ██     ██    ██
  //       ██    ███████ ██   ██    ██    ███████
  //
  //
  //     █████  ██    ██ ███████  ██████      ██████  ██    ██     ███████  █████  ███    ██ ███████
  //    ██   ██ ██    ██ ██      ██          ██    ██ ██    ██     ██      ██   ██ ████   ██ ██
  //    ███████ ██    ██ █████   ██          ██    ██ ██    ██     ███████ ███████ ██ ██  ██ ███████
  //    ██   ██  ██  ██  ██      ██          ██    ██ ██    ██          ██ ██   ██ ██  ██ ██      ██
  //    ██   ██   ████   ███████  ██████      ██████   ██████      ███████ ██   ██ ██   ████ ███████
  //
  //
  //     ██████  █████  ███████ ███████ ███████
  //    ██      ██   ██ ██      ██      ██
  //    ██      ███████ ███████ ███████ █████
  //    ██      ██   ██      ██      ██ ██
  //     ██████ ██   ██ ███████ ███████ ███████
  //
  //

  it('Vérifie le fonctionnement des options texteAvecCasse et texteSansCasse', () => {
    let result = fonctionComparaison('Test2.#?/%', 'Test2.#?/%', {
      texteAvecCasse: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('[AB]', '[AB]', {
      texteAvecCasse: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('(B,F)', '(B,F)', {
      texteAvecCasse: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('Test', 'test', { texteSansCasse: true })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('TEST', 'test', { texteSansCasse: true })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('TeSt', 'test', { texteSansCasse: true })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('Test', 'test', { texteAvecCasse: true })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car majuscules ou minuscules non respectées.',
    )

    result = fonctionComparaison('(b,F)', '(B,F)', {
      texteAvecCasse: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car majuscules ou minuscules non respectées.',
    )

    result = fonctionComparaison('[ab]', '[AB]', {
      texteAvecCasse: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car majuscules ou minuscules non respectées.',
    )

    result = fonctionComparaison('autre', 'test', { texteAvecCasse: true })
    expect(result.isOk).toBe(false)
    expect(result.feedback).not.toContain('majuscules ou minuscules')
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ████████ ███████ ██   ██ ████████ ███████ ███████  █████  ███    ██ ███████  ██████  █████  ███████ ███████ ███████
  //       ██    ██       ██ ██     ██    ██      ██      ██   ██ ████   ██ ██      ██      ██   ██ ██      ██      ██
  //       ██    █████     ███      ██    █████   ███████ ███████ ██ ██  ██ ███████ ██      ███████ ███████ ███████ █████
  //       ██    ██       ██ ██     ██    ██           ██ ██   ██ ██  ██ ██      ██ ██      ██   ██      ██      ██ ██
  //       ██    ███████ ██   ██    ██    ███████ ███████ ██   ██ ██   ████ ███████  ██████ ██   ██ ███████ ███████ ███████
  //
  //

  it("Vérifie le fonctionnement de l'option texteSansCasse", () => {
    let result = fonctionComparaison('Test', 'test', { texteSansCasse: true })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('oui', 'Oui', { texteSansCasse: true })
    expect(result.isOk).toBe(true)
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ███    ██  ██████  ███    ███ ██████  ██████  ███████  █████  ██    ██ ███████  ██████ ███████ ███████ ██████   █████   ██████ ███████
  //    ████   ██ ██    ██ ████  ████ ██   ██ ██   ██ ██      ██   ██ ██    ██ ██      ██      ██      ██      ██   ██ ██   ██ ██      ██
  //    ██ ██  ██ ██    ██ ██ ████ ██ ██████  ██████  █████   ███████ ██    ██ █████   ██      █████   ███████ ██████  ███████ ██      █████
  //    ██  ██ ██ ██    ██ ██  ██  ██ ██   ██ ██   ██ ██      ██   ██  ██  ██  ██      ██      ██           ██ ██      ██   ██ ██      ██
  //    ██   ████  ██████  ██      ██ ██████  ██   ██ ███████ ██   ██   ████   ███████  ██████ ███████ ███████ ██      ██   ██  ██████ ███████
  //
  //

  it("Vérifie le fonctionnement de l'option nombreAvecEspace", () => {
    let result = fonctionComparaison('1000', '1 000', {
      nombreAvecEspace: true,
    })
    expect(result.isOk).toBe(false)
    result = fonctionComparaison('1 000', '1000', {
      nombreAvecEspace: true,
    })
    expect(result.isOk).toBe(true)
    result = fonctionComparaison('1 000,3', texNombre(1000.3), {
      nombreAvecEspace: true,
    })
    expect(result.isOk).toBe(true)
    result = fonctionComparaison('1 000,123 4', texNombre(1000.1234), {
      nombreAvecEspace: true,
    })
    expect(result.isOk).toBe(true)
    result = fonctionComparaison('123', texNombre(123), {
      nombreAvecEspace: true,
    })
    expect(result.isOk).toBe(true)
    result = fonctionComparaison('0,123', texNombre(0.123), {
      nombreAvecEspace: true,
    })
    expect(result.isOk).toBe(true)
    result = fonctionComparaison('1000', '1000', {
      nombreAvecEspace: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Le nombre est mal écrit, il faut faire attention aux espaces.',
    )
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ███████  ██████   █████  ██      ██ ████████ ███████
  //    ██      ██       ██   ██ ██      ██    ██    ██
  //    █████   ██   ███ ███████ ██      ██    ██    █████
  //    ██      ██    ██ ██   ██ ██      ██    ██    ██
  //    ███████  ██████  ██   ██ ███████ ██    ██    ███████
  //
  //
  //    ███████ ██   ██ ██████  ██████  ███████ ███████ ███████ ██  ██████  ███    ██
  //    ██       ██ ██  ██   ██ ██   ██ ██      ██      ██      ██ ██    ██ ████   ██
  //    █████     ███   ██████  ██████  █████   ███████ ███████ ██ ██    ██ ██ ██  ██
  //    ██       ██ ██  ██      ██   ██ ██           ██      ██ ██ ██    ██ ██  ██ ██
  //    ███████ ██   ██ ██      ██   ██ ███████ ███████ ███████ ██  ██████  ██   ████
  //
  //

  it("Vérifie le fonctionnement de l'option egaliteExpression", () => {
    let result = fonctionComparaison('2x+x=y', 'y=x+2x', {
      egaliteExpression: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('2x+x=y', 'y=3x', {
      egaliteExpression: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('y=x+x+x', 'y=x+2x', {
      egaliteExpression: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('y=3x', 'y=x+2x', {
      egaliteExpression: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('t=3a', 't=a+2a', {
      egaliteExpression: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('y=\\dfrac62x', 'y=3x', {
      egaliteExpression: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('y=\\frac{-3}{2}x', 'y=-\\frac{3}{2}x', {
      egaliteExpression: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('2x+x', 'y=x+2x', {
      egaliteExpression: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe('Incorrect car une égalité est attendue.')
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ███████  █████   ██████ ████████  ██████  ██████  ██ ███████  █████  ████████ ██  ██████  ███    ██
  //    ██      ██   ██ ██         ██    ██    ██ ██   ██ ██ ██      ██   ██    ██    ██ ██    ██ ████   ██
  //    █████   ███████ ██         ██    ██    ██ ██████  ██ ███████ ███████    ██    ██ ██    ██ ██ ██  ██
  //    ██      ██   ██ ██         ██    ██    ██ ██   ██ ██      ██ ██   ██    ██    ██ ██    ██ ██  ██ ██
  //    ██      ██   ██  ██████    ██     ██████  ██   ██ ██ ███████ ██   ██    ██    ██  ██████  ██   ████
  //
  //

  it("Vérifie le fonctionnement de l'option factorisation.", () => {
    let result = fonctionComparaison('(2a-2)(2a-5)', '(2a-2)(2a-5)', {
      factorisation: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('(2a-5)(-2+2a)', '(2a-2)(2a-5)', {
      factorisation: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('(a+3)(2a-5)(-2+2a)', '(2a-2)(2a-5)(a+3)', {
      factorisation: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('-(2a-5)(-2a+2)', '(2a-2)(2a-5)', {
      factorisation: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      '(2\\times a-5)\\times(-2+2a)',
      '(2a-2)(2a-5)',
      { factorisation: true },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('2(2a-5)(-1+a)', '(2a-2)(2a-5)', {
      factorisation: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('(2a-5)(2-2a)', '-(2a-2)(2a-5)', {
      factorisation: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('-(2a-5)(2-2a)', '(2a-2)(2a-5)', {
      factorisation: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('3(x+2)(x+2)', '3(x+2)^2', {
      factorisation: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('(x+2)^2', '(x+2)(x+2)', {
      factorisation: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('3(x+2)^2', '(3x+6)(x+2)', {
      factorisation: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('2(2a^2-7a+5)', '(2a-2)(2a-5)', {
      factorisation: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('x(5x+7)', 'x(5x+7)', {
      factorisation: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('x(5x+7)', 'x\\times(5x+7)', {
      factorisation: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('x(5x+7)', '5x^2+7x', {
      factorisation: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('(2a-5)(-2-2a)', '(2a-2)(2a-5)', {
      factorisation: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe('Seulement 1 facteur est correct.')

    result = fonctionComparaison('(a-3)(2a-5)(-2+2a)', '(2a-2)(2a-5)(a+3)', {
      factorisation: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe('Seulement 2 facteurs sont corrects.')

    result = fonctionComparaison('(2a-5)(2-2a)', '(2a-2)(2a-5)', {
      factorisation: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "L'expression saisie est l'opposé de l'expression attendue.",
    )

    result = fonctionComparaison('(2a+5)(2a+2)', '(2a-2)(2a-5)', {
      factorisation: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe("Aucun facteur n'est correct.")

    result = fonctionComparaison('1\\times(2a-5)(2a-2)', '(2a-2)(2a-5)', {
      factorisation: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe("Une factorisation par 1 a peu d'intérêt.")

    result = fonctionComparaison('-1\\times(2a-5)(2a-2)', '(2a-2)(5-2a)', {
      factorisation: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe("Une factorisation par -1 a peu d'intérêt.")

    result = fonctionComparaison('4a^2-14a+10', '(2a-2)(2a-5)', {
      factorisation: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "L'expression saisie n'est pas factorisée bien qu'elle soit égale à l'expression attendue.",
    )

    result = fonctionComparaison('a^2+10', '(2a-2)(2a-5)', {
      factorisation: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe("L'expression saisie n'est pas factorisée.")
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ███████ ██   ██  ██████ ██      ██    ██ ███████ ██ ███████
  //    ██       ██ ██  ██      ██      ██    ██ ██      ██ ██
  //    █████     ███   ██      ██      ██    ██ ███████ ██ █████
  //    ██       ██ ██  ██      ██      ██    ██      ██ ██ ██
  //    ███████ ██   ██  ██████ ███████  ██████  ███████ ██ ██
  //
  //
  //    ███████  █████   ██████ ████████  ██████  ██████  ██ ███████  █████  ████████ ██  ██████  ███    ██
  //    ██      ██   ██ ██         ██    ██    ██ ██   ██ ██ ██      ██   ██    ██    ██ ██    ██ ████   ██
  //    █████   ███████ ██         ██    ██    ██ ██████  ██ ███████ ███████    ██    ██ ██    ██ ██ ██  ██
  //    ██      ██   ██ ██         ██    ██    ██ ██   ██ ██      ██ ██   ██    ██    ██ ██    ██ ██  ██ ██
  //    ██      ██   ██  ██████    ██     ██████  ██   ██ ██ ███████ ██   ██    ██    ██  ██████  ██   ████
  //
  //

  it("Vérifie le fonctionnement de l'option exclusifFactorisation.", () => {
    let result = fonctionComparaison('(2a-2)(2a-5)', '(2a-2)(2a-5)', {
      exclusifFactorisation: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('(2a-5)(-2+2a)', '(2a-2)(2a-5)', {
      exclusifFactorisation: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      '(2\\times a-5)\\times(-2+2a)',
      '(2a-2)(2a-5)',
      { exclusifFactorisation: true },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('-(2a-5)(-2a+2)', '(2a-2)(2a-5)', {
      exclusifFactorisation: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('(x+2)^2', '(x+2)(x+2)', {
      exclusifFactorisation: true,
    })
    expect(result.isOk).toBe(true)

    // Tests communs à factorisation et à exclusifFactorisation

    result = fonctionComparaison('(2a-5)(-2-2a)', '(2a-2)(2a-5)', {
      exclusifFactorisation: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe('Seulement 1 facteur est correct.')

    result = fonctionComparaison('(a-3)(2a-5)(-2+2a)', '(2a-2)(2a-5)(a+3)', {
      factorisation: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe('Seulement 2 facteurs sont corrects.')

    result = fonctionComparaison('(2a-5)(2-2a)', '(2a-2)(2a-5)', {
      exclusifFactorisation: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "L'expression saisie est l'opposé de l'expression attendue.",
    )

    result = fonctionComparaison('(2a+5)(2a+2)', '(2a-2)(2a-5)', {
      exclusifFactorisation: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe("Aucun facteur n'est correct.")

    result = fonctionComparaison('1\\times(2a-5)(2a-2)', '(2a-2)(2a-5)', {
      exclusifFactorisation: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe("Une factorisation par 1 a peu d'intérêt.")

    result = fonctionComparaison('4a^2-14a+10', '(2a-2)(2a-5)', {
      exclusifFactorisation: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "L'expression saisie n'est pas factorisée bien qu'elle soit égale à l'expression attendue.",
    )

    result = fonctionComparaison('a^2+10', '(2a-2)(2a-5)', {
      exclusifFactorisation: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe("L'expression saisie n'est pas factorisée.")

    // Fin des tests communs à factorisation

    result = fonctionComparaison('2(2a-5)(-1+a)', '(2a-2)(2a-5)', {
      exclusifFactorisation: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe("L'expression saisie a trop de facteurs.")

    result = fonctionComparaison('3(x+2)^2', '(3x+6)(x+2)', {
      exclusifFactorisation: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe("L'expression saisie a trop de facteurs.")

    result = fonctionComparaison('(3x+6)(x+2)', '3(x+2)^2', {
      exclusifFactorisation: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "L'expression saisie peut être davantage factorisée.",
    )

    result = fonctionComparaison('(2a-4-1)(-2+a+a)', '(2a-2)(2a-5)', {
      exclusifFactorisation: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      '2 facteurs ne sont pas sous la forme attendue.',
    )

    result = fonctionComparaison('(2a-5)(-2+a+a)', '(2a-2)(2a-5)', {
      exclusifFactorisation: true,
    })
    expect(result.isOk).toBe(false) // Je voudrais que ce soit false
    expect(result.feedback).toBe("1 facteur n'est pas sous la forme attendue.")
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ███    ██ ██████  ███████  █████   ██████ ████████ ███████ ██    ██ ██████  ███████
  //    ████   ██ ██   ██ ██      ██   ██ ██         ██    ██      ██    ██ ██   ██ ██
  //    ██ ██  ██ ██████  █████   ███████ ██         ██    █████   ██    ██ ██████  ███████
  //    ██  ██ ██ ██   ██ ██      ██   ██ ██         ██    ██      ██    ██ ██   ██      ██
  //    ██   ████ ██████  ██      ██   ██  ██████    ██    ███████  ██████  ██   ██ ███████
  //
  //
  //    ██ ██████  ███████ ███    ██ ████████ ██  ██████  ██    ██ ███████ ███████
  //    ██ ██   ██ ██      ████   ██    ██    ██ ██    ██ ██    ██ ██      ██
  //    ██ ██   ██ █████   ██ ██  ██    ██    ██ ██    ██ ██    ██ █████   ███████
  //    ██ ██   ██ ██      ██  ██ ██    ██    ██ ██ ▄▄ ██ ██    ██ ██           ██
  //    ██ ██████  ███████ ██   ████    ██    ██  ██████   ██████  ███████ ███████
  //                                                 ▀▀
  //
  //    ███████  █████   ██████ ████████  ██████  ██████  ██ ███████  █████  ████████ ██  ██████  ███    ██
  //    ██      ██   ██ ██         ██    ██    ██ ██   ██ ██ ██      ██   ██    ██    ██ ██    ██ ████   ██
  //    █████   ███████ ██         ██    ██    ██ ██████  ██ ███████ ███████    ██    ██ ██    ██ ██ ██  ██
  //    ██      ██   ██ ██         ██    ██    ██ ██   ██ ██      ██ ██   ██    ██    ██ ██    ██ ██  ██ ██
  //    ██      ██   ██  ██████    ██     ██████  ██   ██ ██ ███████ ██   ██    ██    ██  ██████  ██   ████
  //
  //

  it("Vérifie le fonctionnement de l'option nbFacteursIdentiquesFactorisation.", () => {
    let result = fonctionComparaison('(2a-2)(2a-5)', '(2a-2)(2a-5)', {
      nbFacteursIdentiquesFactorisation: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('(2a-5)(-2+2a)', '(2a-2)(2a-5)', {
      nbFacteursIdentiquesFactorisation: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('-(2a-5)(-2a+2)', '(2a-2)(2a-5)', {
      nbFacteursIdentiquesFactorisation: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      '(2\\times a-5)\\times(-2+2a)',
      '(2a-2)(2a-5)',
      { nbFacteursIdentiquesFactorisation: true },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('3(x+2)(x+2)', '3(x+2)^2', {
      nbFacteursIdentiquesFactorisation: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('(x+2)^2', '(x+2)(x+2)', {
      nbFacteursIdentiquesFactorisation: true,
    })
    expect(result.isOk).toBe(true)

    // Avoir les mêmes tests communs FALSE à factorisation et à exclusifFactorisation ?

    result = fonctionComparaison('2(2a-5)(-1+a)', '(2a-2)(2a-5)', {
      nbFacteursIdentiquesFactorisation: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe("L'expression saisie a trop de facteurs.")

    result = fonctionComparaison('(3x+6)(x+2)', '3(x+2)^2', {
      nbFacteursIdentiquesFactorisation: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "L'expression saisie peut être davantage factorisée.",
    )
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ██    ██ ███    ██ ███████ ███████ ██    ██ ██      ███████  █████   ██████ ████████ ███████ ██    ██ ██████
  //    ██    ██ ████   ██ ██      ██      ██    ██ ██      ██      ██   ██ ██         ██    ██      ██    ██ ██   ██
  //    ██    ██ ██ ██  ██ ███████ █████   ██    ██ ██      █████   ███████ ██         ██    █████   ██    ██ ██████
  //    ██    ██ ██  ██ ██      ██ ██      ██    ██ ██      ██      ██   ██ ██         ██    ██      ██    ██ ██   ██
  //     ██████  ██   ████ ███████ ███████  ██████  ███████ ██      ██   ██  ██████    ██    ███████  ██████  ██   ██
  //
  //
  //    ██      ██ ████████ ████████ ███████ ██████   █████  ██
  //    ██      ██    ██       ██    ██      ██   ██ ██   ██ ██
  //    ██      ██    ██       ██    █████   ██████  ███████ ██
  //    ██      ██    ██       ██    ██      ██   ██ ██   ██ ██
  //    ███████ ██    ██       ██    ███████ ██   ██ ██   ██ ███████
  //
  //

  it("Vérifie le fonctionnement de l'option unSeulFacteurLitteral.", () => {
    let result = fonctionComparaison('(2a-2)(2a-5)', '(2a-2)(2a-5)', {
      unSeulFacteurLitteral: true,
    })
    expect(result.isOk).toBe(true)
    result = fonctionComparaison('2(2a^2-7a+5)', '(2a-2)(2a-5)', {
      unSeulFacteurLitteral: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "On n'attend pas une factorisation par un entier.",
    )
  })

  it("Vérifie le fonctionnement de l'option facteursPremierDegre.", () => {
    for (const saisie of [
      '(2x+4)^2',
      '(2x+4)(2x+4)',
      '4(x+2)^2',
      '(-2x-4)^2',
    ]) {
      const result = fonctionComparaison(saisie, '(2x+4)^2', {
        facteursPremierDegre: true,
      })
      expect(result.isOk).toBe(true)
    }
    let result = fonctionComparaison('4(x^2+4x+4)', '(2x+4)^2', {
      facteursPremierDegre: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe('Chaque facteur doit être du premier degré.')
    result = fonctionComparaison('4x^2+16x+16', '(2x+4)^2', {
      facteursPremierDegre: true,
    })
    expect(result.isOk).toBe(false)
    result = fonctionComparaison('(2x-3)(2x-3)', '(2x-3)(2x+3)', {
      facteursPremierDegre: true,
    })
    expect(result.isOk).toBe(false)
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ███    ██  ██████  ███    ██
  //    ████   ██ ██    ██ ████   ██
  //    ██ ██  ██ ██    ██ ██ ██  ██
  //    ██  ██ ██ ██    ██ ██  ██ ██
  //    ██   ████  ██████  ██   ████
  //
  //
  //    ██████  ███████ ██████   ██████  ███    ██ ███████ ███████
  //    ██   ██ ██      ██   ██ ██    ██ ████   ██ ██      ██
  //    ██████  █████   ██████  ██    ██ ██ ██  ██ ███████ █████
  //    ██   ██ ██      ██      ██    ██ ██  ██ ██      ██ ██
  //    ██   ██ ███████ ██       ██████  ██   ████ ███████ ███████
  //
  //
  //     █████   ██████  ██████ ███████ ██████  ████████ ███████ ███████
  //    ██   ██ ██      ██      ██      ██   ██    ██    ██      ██
  //    ███████ ██      ██      █████   ██████     ██    █████   █████
  //    ██   ██ ██      ██      ██      ██         ██    ██      ██
  //    ██   ██  ██████  ██████ ███████ ██         ██    ███████ ███████
  //
  //

  it("Vérifie le fonctionnement de l'option nonReponseAcceptee", () => {
    const result = fonctionComparaison('', '', { nonReponseAcceptee: true })
    expect(result.isOk).toBe(true)
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ██████  ███████ ██    ██ ███████ ██       ██████  ██████  ██████  ███████ ███    ███ ███████ ███    ██ ████████
  //    ██   ██ ██      ██    ██ ██      ██      ██    ██ ██   ██ ██   ██ ██      ████  ████ ██      ████   ██    ██
  //    ██   ██ █████   ██    ██ █████   ██      ██    ██ ██████  ██████  █████   ██ ████ ██ █████   ██ ██  ██    ██
  //    ██   ██ ██       ██  ██  ██      ██      ██    ██ ██      ██      ██      ██  ██  ██ ██      ██  ██ ██    ██
  //    ██████  ███████   ████   ███████ ███████  ██████  ██      ██      ███████ ██      ██ ███████ ██   ████    ██
  //
  //
  //    ███████  ██████   █████  ██
  //    ██      ██       ██   ██ ██
  //    █████   ██   ███ ███████ ██
  //    ██      ██    ██ ██   ██ ██
  //    ███████  ██████  ██   ██ ███████
  //
  //

  it("Vérifie le fonctionnement de l'option developpementEgal", () => {
    let result = fonctionComparaison('25x^2-40x+16', '5x*5x-2*4*5x+4*4', {
      developpementEgal: true,
    }) // Développement de (5x-4)^2
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('25x^2-40x+16', '(5x-4)^2', {
      developpementEgal: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      '5x\\times5x-2\\times 5x\\times 4 + 4\\times4',
      '(5x-4)^2',
      {
        developpementEgal: true,
      },
    )
    expect(result.isOk).toBe(true) // if this one is too complicate, we forget it

    result = fonctionComparaison(
      '(5x)^2-2\\times 5x\\times 4 + 4^2',
      '(5x-4)^2',
      {
        developpementEgal: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('25x^2-40x+16', '4*4+5x*5x-2*20x', {
      developpementEgal: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      '(5x)^2-8\\times 5x+4^2',
      '4*4+5x*5x-20x-20x',
      {
        developpementEgal: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('25x^4-40x^2+16+3', '(5x^2-4)^2+3', {
      developpementEgal: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('25x^2-40x+16+3', '(5x-4)^2+3', {
      developpementEgal: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('3x', '(3x-2)^2', {
      developpementEgal: true,
    })
    expect(result.isOk).toBe(false)

    result = fonctionComparaison('(5x-4)^2', '(5x-4)^2', {
      developpementEgal: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Incorrect car cette expression n'est pas développée.",
    )

    result = fonctionComparaison('(5x-4)^2', '4*4+5x*5x-20x-20x', {
      developpementEgal: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Incorrect car cette expression n'est pas développée.",
    )

    result = fonctionComparaison('-9+10x+(5x-5)^2', '4*4+5x*5x-20x-20x', {
      developpementEgal: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Incorrect car cette expression n'est pas développée.",
    )
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //     ██████  █████  ██       ██████ ██    ██ ██
  //    ██      ██   ██ ██      ██      ██    ██ ██
  //    ██      ███████ ██      ██      ██    ██ ██
  //    ██      ██   ██ ██      ██      ██    ██ ██
  //     ██████ ██   ██ ███████  ██████  ██████  ███████
  //
  //
  //    ███████  ██████  ██████  ███    ███ ███████ ██
  //    ██      ██    ██ ██   ██ ████  ████ ██      ██
  //    █████   ██    ██ ██████  ██ ████ ██ █████   ██
  //    ██      ██    ██ ██   ██ ██  ██  ██ ██      ██
  //    ██       ██████  ██   ██ ██      ██ ███████ ███████
  //
  //

  it("Vérifie le fonctionnement de l'option calculFormel", () => {
    let result = fonctionComparaison('25x^2-40x+16', '5x*5x-2*4*5x+4*4', {
      calculFormel: true,
    }) // Développement de (5x-4)^2
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('25x^2-40x+16', '(5x-4)^2', {
      calculFormel: true,
    }) // Développement de (5x-4)^2
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('25x^2-40x+16', '4*4+5x*5x-2*20x', {
      calculFormel: true,
    }) // Développement de (5x-4)^2
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      '(5x)^2-8\\times 5x+4^2',
      '4*4+5x*5x-20x-20x',
      {
        calculFormel: true,
      },
    ) // Développement de (5x-4)^2
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('25x^2-40x+16+3', '(5x-4)^2+3', {
      calculFormel: true,
    }) // Développement de (5x-4)^2
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('(5x-4)^2', '(5x-4)^2', {
      calculFormel: true,
    }) // Développement de (5x-4)^2
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('(5x-4)^2', '4*4+5x*5x-20x-20x', {
      calculFormel: true,
    }) // Développement de (5x-4)^2
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('-9+10x+(5x-5)^2', '4*4+5x*5x-20x-20x', {
      calculFormel: true,
    }) // Développement de (5x-4)^2
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('20+5\\times c_{n}', '5\\times c_{n}+20', {
      calculFormel: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('13+5\\times c_{n}+7', '5\\times c_{n}+20', {
      calculFormel: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      '20+2c_{n}+2\\times c_{n}+c_{n}+7',
      '5\\times c_{n}+27',
      {
        calculFormel: true,
      },
    )

    expect(result.isOk).toBe(true)
    result = fonctionComparaison('20+c_{n}+c_{n}+7', '2\\times c_{n}+27', {
      calculFormel: true,
    })
    expect(result.isOk).toBe(true)

    expect(result.isOk).toBe(true)
    result = fonctionComparaison(
      '-2\\times\\dfrac{1}{x^2}',
      '\\dfrac{-2}{x^2}',
      {
        calculFormel: true,
      },
    )
    expect(result.isOk).toBe(true)
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ███████ ██   ██ ██████   █████  ███    ██ ██████  ███████ ██████
  //    ██       ██ ██  ██   ██ ██   ██ ████   ██ ██   ██ ██      ██   ██
  //    █████     ███   ██████  ███████ ██ ██  ██ ██   ██ █████   ██   ██
  //    ██       ██ ██  ██      ██   ██ ██  ██ ██ ██   ██ ██      ██   ██
  //    ███████ ██   ██ ██      ██   ██ ██   ████ ██████  ███████ ██████
  //
  //

  it("Vérifie le fonctionnement de l'option expanded", () => {
    let result = fonctionComparaison('6 \\times x \\times x -8', '6x^2-8', {
      expanded: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      '-8+6 \\times x \\times x',
      '6 \\times x \\times x -8',
      {
        expanded: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('-8+6 \\times x \\times x', '6x^2-8', {
      expanded: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('x \\times 6 \\times x-8', '6x^2-8', {
      expanded: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('x \\times x \\times x', 'x^3', {
      expanded: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('8 \\times (6 \\times x+5)', '8(6x+5)', {
      expanded: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('(6 \\times x+5) \\times 8', '8(6x+5)', {
      expanded: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('6x^2-8', '6x^2-8', {
      expanded: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'La réponse fournie est bien égale à celle attendue mais il manque au moins un signe $\\times$.',
    )

    result = fonctionComparaison('6 \\times x^2-8', '6x^2-8', {
      expanded: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'La réponse fournie est bien égale à celle attendue mais il manque au moins un signe $\\times$.',
    )

    result = fonctionComparaison('x \\times x^2', 'x^3', {
      expanded: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'La réponse fournie est bien égale à celle attendue mais il manque au moins un signe $\\times$.',
    )

    result = fonctionComparaison('(6x+5) \\times 8', '8(6x+5)', {
      expanded: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'La réponse fournie est bien égale à celle attendue mais il manque au moins un signe $\\times$.',
    )

    result = fonctionComparaison('8(6 \\times x+5)', '8(6x+5)', {
      expanded: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'La réponse fournie est bien égale à celle attendue mais il manque au moins un signe $\\times$.',
    )

    result = fonctionComparaison('8(6 \\times x+4)', '8(6x+5)', {
      expanded: true,
    })
    expect(result.isOk).toBe(false)
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ███████  █████  ███    ██ ███████ ████████ ██ ███    ███ ███████ ███████
  //    ██      ██   ██ ████   ██ ██         ██    ██ ████  ████ ██      ██
  //    ███████ ███████ ██ ██  ██ ███████    ██    ██ ██ ████ ██ █████   ███████
  //         ██ ██   ██ ██  ██ ██      ██    ██    ██ ██  ██  ██ ██           ██
  //    ███████ ██   ██ ██   ████ ███████    ██    ██ ██      ██ ███████ ███████
  //
  //

  it("Vérifie le fonctionnement de l'option sansTimes", () => {
    let result = fonctionComparaison('6(x^2-8)', '6 \\times (x \\times x -8)', {
      sansTimes: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('6(x^2-8)', '6 \\times(-8+ x \\times x)', {
      sansTimes: true,
    })
    expect(result.isOk).toBe(true)
  })

  it('sansTimes : refuse un nombre écrit après une lettre (x3 au lieu de 3x)', () => {
    let result = fonctionComparaison('7+x3', '7+3x', { sansTimes: true })
    expect(result.isOk).toBe(false)

    result = fonctionComparaison('7+3x', '7+3x', { sansTimes: true })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('x7', '7x', { sansTimes: true })
    expect(result.isOk).toBe(false)
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ███████  ██████  ███    ██  ██████ ████████ ██  ██████  ███    ██
  //    ██      ██    ██ ████   ██ ██         ██    ██ ██    ██ ████   ██
  //    █████   ██    ██ ██ ██  ██ ██         ██    ██ ██    ██ ██ ██  ██
  //    ██      ██    ██ ██  ██ ██ ██         ██    ██ ██    ██ ██  ██ ██
  //    ██       ██████  ██   ████  ██████    ██    ██  ██████  ██   ████
  //
  //

  it("Vérifie le fonctionnement de l'option fonction", () => {
    let result = fonctionComparaison('x+x', '2x', {
      fonction: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\dfrac{2x^2}{x}', '2x', {
      fonction: true,
      domaine: [3, 25],
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\lvert x \\rvert', 'x', {
      fonction: true,
      domaine: [3, 25],
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\lfloor x \\rfloor', 'x', {
      // partie entière de x
      fonction: true,
      domaine: [3, 25],
      entier: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('-t+t+\\dfrac{2t^2}{t}', '2t', {
      fonction: true,
      variable: 't',
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\lvert x \\rvert', 'x', {
      // valeur absolue de x
      fonction: true,
      domaine: [-33, -25],
    })
    expect(result.isOk).toBe(false) // Mauvais domaine pour que la valeur absolue de x soit égale à x.

    result = fonctionComparaison('\\lfloor x \\rfloor', 'x', {
      // partie entière de x
      fonction: true,
      domaine: [3, 25],
      entier: false,
    })
    expect(result.isOk).toBe(false)
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ███████ ███    ██ ███████ ███████ ███    ███ ██████  ██      ███████
  //    ██      ████   ██ ██      ██      ████  ████ ██   ██ ██      ██
  //    █████   ██ ██  ██ ███████ █████   ██ ████ ██ ██████  ██      █████
  //    ██      ██  ██ ██      ██ ██      ██  ██  ██ ██   ██ ██      ██
  //    ███████ ██   ████ ███████ ███████ ██      ██ ██████  ███████ ███████
  //
  //
  //    ██████  ███████
  //    ██   ██ ██
  //    ██   ██ █████
  //    ██   ██ ██
  //    ██████  ███████
  //
  //
  //    ███    ██  ██████  ███    ███ ██████  ██████  ███████ ███████
  //    ████   ██ ██    ██ ████  ████ ██   ██ ██   ██ ██      ██
  //    ██ ██  ██ ██    ██ ██ ████ ██ ██████  ██████  █████   ███████
  //    ██  ██ ██ ██    ██ ██  ██  ██ ██   ██ ██   ██ ██           ██
  //    ██   ████  ██████  ██      ██ ██████  ██   ██ ███████ ███████
  //
  //

  it("Vérifie le fonctionnement de l'option ensembleDeNombres", () => {
    expect(
      fonctionComparaison(
        '-\\sqrt{\\frac{1}{24}};\\sqrt{\\frac{1}{24}}',
        '-\\frac{1}{12}\\sqrt{6};\\frac{1}{12}\\sqrt{6}',
        { suiteDeNombres: true },
      ).isOk,
    ).toBe(true)
    for (const options of [
      { ensembleDeNombres: true },
      { suiteDeNombres: true },
      { kUplet: true },
    ]) {
      const wrapped = !options.suiteDeNombres
      const format = (s: string) => (wrapped ? `{${s}}` : s)
      for (const value of [
        '\\pi',
        '2\\pi',
        '-\\pi',
        '-\\frac43\\sqrt3',
        '\\frac{4}{3}\\sqrt{3}',
      ]) {
        expect(
          fonctionComparaison(format(value), format(value), options).isOk,
        ).toBe(true)
      }
      expect(
        fonctionComparaison(format('\\pi;;2'), format('\\pi;2'), options).isOk,
      ).toBe(false)
      expect(
        fonctionComparaison(format('\\pi'), format('2\\pi'), options).isOk,
      ).toBe(false)
    }
    let result = fonctionComparaison('{-5;4;10.2}', '{-5;4;10.2}', {
      ensembleDeNombres: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\{-5;4;10.2\\}', '{-5;4;10.2}', {
      ensembleDeNombres: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('{4;-5;10.2}', '{-5;4;10.2}', {
      ensembleDeNombres: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      '{\\sqrt7;\\dfrac23;10^2}',
      '{\\sqrt7;\\dfrac23;10^{2}}',
      {
        ensembleDeNombres: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      '\\{-\\sqrt{\\dfrac{7}{4}};\\sqrt{\\dfrac{7}{4}}\\}',
      '\\{-\\sqrt{\\dfrac{7}{4}};\\sqrt{\\dfrac{7}{4}}\\}',
      {
        ensembleDeNombres: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      '\\{3^{\\dfrac{1}{7}}\\}',
      '\\{3^{\\dfrac{1}{7}}\\}',
      {
        ensembleDeNombres: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\{\\sqrt[9]{8}\\}', '\\{\\sqrt[9]{8}\\}', {
      ensembleDeNombres: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      '\\{-2+\\sqrt{2};-2-\\sqrt{2}\\}',
      '\\{-2+\\sqrt{2};-2-\\sqrt{2}\\}',
      {
        ensembleDeNombres: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      '\\{-2+\\sqrt2;-2-\\sqrt2\\}',
      '\\{-2+\\sqrt{2};-2-\\sqrt{2}\\}',
      {
        ensembleDeNombres: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      '\\{-2+\\sqrt{2};-2-\\sqrt{2}\\}',
      '\\{-2+\\sqrt2;-2-\\sqrt2\\}',
      {
        ensembleDeNombres: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      '\\{-2-\\sqrt{2};-2+\\sqrt{2}\\}',
      '\\{-2+\\sqrt2;-2-\\sqrt2\\}',
      {
        ensembleDeNombres: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      '\\{-2-3\\sqrt{2};-2+3\\sqrt{2}\\}',
      '\\{-2+3\\sqrt2;-2-3\\sqrt2\\}',
      {
        ensembleDeNombres: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('4;-5;10.2}', '{-5;4;10.2}', {
      ensembleDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Résultat incorrect car cet ensemble doit commencer par une accolade ou bien être l'ensemble vide.",
    )

    result = fonctionComparaison('{4;-5;10.2', '{-5;4;10.2}', {
      ensembleDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Résultat incorrect car cet ensemble doit se terminer par une accolade ou bien être l'ensemble vide.",
    )

    result = fonctionComparaison('{4,-5,10.2}', '{-5;4;10.2}', {
      ensembleDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Les nombres doivent tous être séparés par un point-virgule.',
    )

    result = fonctionComparaison('{4;-5;10.2;}', '{-5;4;10.2}', {
      ensembleDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Une suite de nombres ne doit pas se terminer par un point-virgule.',
    )

    result = fonctionComparaison('{;4;-5;10.2}', '{-5;4;10.2}', {
      ensembleDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Une suite de nombres ne doit pas commencer par un point-virgule.',
    )

    result = fonctionComparaison('{4;-5;;10.2}', '{-5;4;10.2}', {
      ensembleDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Il ne peut pas y avoir deux points-virgules consécutifs.',
    )

    result = fonctionComparaison('{4;-5;10.2;-5}', '{-5;4;10.2}', {
      ensembleDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car cet ensemble contient des valeurs qui se répètent.',
    )

    result = fonctionComparaison('{}', '{-5;4;10.2}', {
      ensembleDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe("L'ensemble est vide.")

    result = fonctionComparaison('{4}', '{-5;4;10.2}', {
      ensembleDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(`La valeur est correcte mais il en manque 2.`)

    result = fonctionComparaison('{4;-5}', '{-5;4;10.2}', {
      ensembleDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Toutes les valeurs sont correctes mais il en manque 1.`,
    )

    result = fonctionComparaison('{4;-5}', '{-5}', {
      ensembleDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `La bonne valeur est présente mais il y a 1 valeur en trop.`,
    )

    result = fonctionComparaison('{4;-5;2;3;1}', '{-5;2}', {
      ensembleDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Toutes les bonnes valeurs sont présentes mais il y a 3 valeurs en trop.`,
    )

    result = fonctionComparaison('{4;-5;3;1}', '{-5;2}', {
      ensembleDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Il y a 1 valeur correcte et 3 valeurs incorrectes.`,
    )

    result = fonctionComparaison('{4;3;1}', '{-5;2}', {
      ensembleDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Aucune valeur correcte. 3 valeurs incorrectes.`,
    )
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ██   ██ ██    ██ ██████  ██      ███████ ████████
  //    ██  ██  ██    ██ ██   ██ ██      ██         ██
  //    █████   ██    ██ ██████  ██      █████      ██
  //    ██  ██  ██    ██ ██      ██      ██         ██
  //    ██   ██  ██████  ██      ███████ ███████    ██
  //
  //

  it("Vérifie le fonctionnement de l'option kUplet", () => {
    let result = fonctionComparaison('\\{4;-5;10.2\\}', '{4;-5;10.2}', {
      kUplet: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('{4;-5;10.2}', '{4;-5;10.2}', {
      kUplet: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      '{\\sqrt7;\\dfrac23;10^2}',
      '{\\sqrt7;\\dfrac23;10^{2}}',
      {
        kUplet: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('{-5;4;10.2}', '{4;-5;10.2}', {
      kUplet: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car les nombres ne sont pas rangés dans le bon ordre.',
    )

    result = fonctionComparaison('\\{-5;4;10.2\\}', '{4;-5;10.2}', {
      kUplet: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car les nombres ne sont pas rangés dans le bon ordre.',
    )

    result = fonctionComparaison('{4;-5;10.2}', '{-5;4;10.2}', {
      kUplet: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car les nombres ne sont pas rangés dans le bon ordre.',
    )

    result = fonctionComparaison('4;-5;10.2}', '{-5;4;10.2}', {
      kUplet: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Résultat incorrect car cet ensemble doit commencer par une accolade ou bien être l'ensemble vide.",
    )

    result = fonctionComparaison('{4;-5;10.2', '{-5;4;10.2}', {
      kUplet: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Résultat incorrect car cet ensemble doit se terminer par une accolade ou bien être l'ensemble vide.",
    )

    result = fonctionComparaison('{4,-5,10.2}', '{-5;4;10.2}', {
      kUplet: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Les nombres doivent tous être séparés par un point-virgule.',
    )

    result = fonctionComparaison('{4;-5;10.2;}', '{-5;4;10.2}', {
      kUplet: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Une suite de nombres ne doit pas se terminer par un point-virgule.',
    )

    result = fonctionComparaison('{;4;-5;10.2}', '{-5;4;10.2}', {
      kUplet: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Une suite de nombres ne doit pas commencer par un point-virgule.',
    )

    result = fonctionComparaison('{4;-5;10.2;-5}', '{-5;4;10.2}', {
      kUplet: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car cet ensemble contient des valeurs qui se répètent.',
    )

    result = fonctionComparaison('{}', '{-5;4;10.2}', {
      kUplet: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe("L'ensemble est vide.")

    result = fonctionComparaison('{4}', '{-5;4;10.2}', {
      kUplet: true,
    })
    expect(result.isOk).toBe(false)

    result = fonctionComparaison('{4;-5}', '{-5;4;10.2}', {
      ensembleDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Toutes les valeurs sont correctes mais il en manque 1.`,
    )

    result = fonctionComparaison('{4;-5}', '{-5}', {
      ensembleDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `La bonne valeur est présente mais il y a 1 valeur en trop.`,
    )

    result = fonctionComparaison('{4;-5;2;3;1}', '{-5;2}', {
      ensembleDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Toutes les bonnes valeurs sont présentes mais il y a 3 valeurs en trop.`,
    )

    result = fonctionComparaison('{4;-5;3;1}', '{-5;2}', {
      ensembleDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Il y a 1 valeur correcte et 3 valeurs incorrectes.`,
    )

    result = fonctionComparaison('{4;3;1}', '{-5;2}', {
      ensembleDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Aucune valeur correcte. 3 valeurs incorrectes.`,
    )
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ███████ ██    ██ ██ ████████ ███████
  //    ██      ██    ██ ██    ██    ██
  //    ███████ ██    ██ ██    ██    █████
  //         ██ ██    ██ ██    ██    ██
  //    ███████  ██████  ██    ██    ███████
  //
  //
  //    ██████  ███████
  //    ██   ██ ██
  //    ██   ██ █████
  //    ██   ██ ██
  //    ██████  ███████
  //
  //
  //    ███    ██  ██████  ███    ███ ██████  ██████  ███████ ███████
  //    ████   ██ ██    ██ ████  ████ ██   ██ ██   ██ ██      ██
  //    ██ ██  ██ ██    ██ ██ ████ ██ ██████  ██████  █████   ███████
  //    ██  ██ ██ ██    ██ ██  ██  ██ ██   ██ ██   ██ ██           ██
  //    ██   ████  ██████  ██      ██ ██████  ██   ██ ███████ ███████
  //
  //

  it("Vérifie le fonctionnement de l'option suiteDeNombres", () => {
    let result = fonctionComparaison('-5;4;10.2', '4;-5;10.2', {
      suiteDeNombres: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('4;-5;10.2', '-5;4;10.2', {
      suiteDeNombres: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      '\\sqrt7;\\dfrac23;10^2',
      '\\sqrt7;\\dfrac23;10^{2}',
      {
        suiteDeNombres: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('4,-5,10.2', '-5;4;10.2', {
      suiteDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Les nombres doivent tous être séparés par un point-virgule.',
    )

    result = fonctionComparaison('4;-5;10.2;', '-5;4;10.2', {
      suiteDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Une suite de nombres ne doit pas se terminer par un point-virgule.',
    )

    result = fonctionComparaison(';4;-5;10.2', '-5;4;10.2', {
      suiteDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Une suite de nombres ne doit pas commencer par un point-virgule.',
    )

    result = fonctionComparaison('4;-5;10.2;-5', '-5;4;10.2', {
      suiteDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car cet ensemble contient des valeurs qui se répètent.',
    )

    result = fonctionComparaison('4', '-5;4;10.2', {
      suiteDeNombres: true,
    })
    expect(result.isOk).toBe(false)

    result = fonctionComparaison('4;-5', '-5;4;10.2', {
      suiteDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Toutes les valeurs sont correctes mais il en manque 1.`,
    )

    result = fonctionComparaison('4;-5', '-5', {
      suiteDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `La bonne valeur est présente mais il y a 1 valeur en trop.`,
    )

    result = fonctionComparaison('4;-5;2;3;1', '-5;2', {
      suiteDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Toutes les bonnes valeurs sont présentes mais il y a 3 valeurs en trop.`,
    )

    result = fonctionComparaison('4;-5;3;1', '-5;2', {
      suiteDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Il y a 1 valeur correcte et 3 valeurs incorrectes.`,
    )

    result = fonctionComparaison('4;3;1', '-5;2', {
      suiteDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Aucune valeur correcte. 3 valeurs incorrectes.`,
    )
  })

  //     ██████  ██████  ████████ ██  ██████  ███    ██
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██
  //     ██████  ██         ██    ██  ██████  ██   ████
  //
  //
  //    ███████ ██    ██ ██ ████████ ███████
  //    ██      ██    ██ ██    ██    ██
  //    ███████ ██    ██ ██    ██    █████
  //         ██ ██    ██ ██    ██    ██
  //    ███████  ██████  ██    ██    ███████
  //
  //
  //    ██████   █████  ███    ██  ██████  ███████ ███████
  //    ██   ██ ██   ██ ████   ██ ██       ██      ██
  //    ██████  ███████ ██ ██  ██ ██   ███ █████   █████
  //    ██   ██ ██   ██ ██  ██ ██ ██    ██ ██      ██
  //    ██   ██ ██   ██ ██   ████  ██████  ███████ ███████
  //
  //
  //    ██████  ███████
  //    ██   ██ ██
  //    ██   ██ █████
  //    ██   ██ ██
  //    ██████  ███████
  //
  //
  //    ███    ██  ██████  ███    ███ ██████  ██████  ███████ ███████
  //    ████   ██ ██    ██ ████  ████ ██   ██ ██   ██ ██      ██
  //    ██ ██  ██ ██    ██ ██ ████ ██ ██████  ██████  █████   ███████
  //    ██  ██ ██ ██    ██ ██  ██  ██ ██   ██ ██   ██ ██           ██
  //    ██   ████  ██████  ██      ██ ██████  ██   ██ ███████ ███████
  //
  //

  it("Vérifie le fonctionnement de l'option suiteRangeeDeNombres", () => {
    let result = fonctionComparaison('4;-5;10.2', '4;-5;10.2', {
      suiteRangeeDeNombres: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('4;-5;10,2', '4;-5;10.2', {
      suiteRangeeDeNombres: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('3;3', '3;3', {
      suiteRangeeDeNombres: true,
    })
    expect(result.isOk).toBe(false)

    result = fonctionComparaison('1;\\sqrt7', '1;\\sqrt7', {
      suiteRangeeDeNombres: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('7;\\dfrac23', '7;\\dfrac23', {
      suiteRangeeDeNombres: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('2;10^2', '2;10^{2}', {
      suiteRangeeDeNombres: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison(
      '\\sqrt7;\\dfrac23;10^2',
      '\\sqrt7;\\dfrac23;10^{2}',
      {
        suiteRangeeDeNombres: true,
      },
    )
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('4;-5;10.2', '-5;4;10.2', {
      suiteRangeeDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car les nombres ne sont pas rangés dans le bon ordre.',
    )

    result = fonctionComparaison('4,-5,10.2', '-5;4;10.2', {
      suiteRangeeDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Les nombres doivent tous être séparés par un point-virgule.',
    )

    result = fonctionComparaison('4;-5;10.2;', '-5;4;10.2', {
      suiteRangeeDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Une suite de nombres ne doit pas se terminer par un point-virgule.',
    )

    result = fonctionComparaison(';4;-5;10.2', '-5;4;10.2', {
      suiteRangeeDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Une suite de nombres ne doit pas commencer par un point-virgule.',
    )

    result = fonctionComparaison('4;-5;10.2;-5', '-5;4;10.2', {
      suiteRangeeDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Résultat incorrect car cet ensemble contient des valeurs qui se répètent.',
    )

    result = fonctionComparaison('4', '-5;4;10.2', {
      suiteRangeeDeNombres: true,
    })
    expect(result.isOk).toBe(false)

    result = fonctionComparaison('4;-5', '-5;4;10.2', {
      suiteRangeeDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Toutes les valeurs sont correctes mais il en manque 1.`,
    )

    result = fonctionComparaison('4;-5', '-5', {
      suiteRangeeDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `La bonne valeur est présente mais il y a 1 valeur en trop.`,
    )

    result = fonctionComparaison('4;-5;2;3;1', '-5;2', {
      suiteRangeeDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Toutes les bonnes valeurs sont présentes mais il y a 3 valeurs en trop.`,
    )

    result = fonctionComparaison('4;-5;3;1', '-5;2', {
      suiteRangeeDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Il y a 1 valeur correcte et 3 valeurs incorrectes.`,
    )

    result = fonctionComparaison('4;3;1', '-5;2', {
      suiteRangeeDeNombres: true,
    })
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      `Aucune valeur correcte. 3 valeurs incorrectes.`,
    )
  })

  it('Vérifie le fonctionnement de la fonction pythagoreCompare', () => {
    let result = pythagoreCompare(
      '\\mathrm{HI}^2-\\mathrm{GI}^2',
      '\\mathrm{HI}^2-\\mathrm{GI}^2',
    )
    expect(result.isOk).toBe(true)

    result = pythagoreCompare('IH^2-IG^2', '\\mathrm{HI}^2-\\mathrm{GI}^2')
    expect(result.isOk).toBe(true)

    result = pythagoreCompare('GI^2-HI^2', '\\mathrm{HI}^2-\\mathrm{GI}^2')
    expect(result).toEqual({
      isOk: false,
      feedback:
        'Les deux carrés sont dans le mauvais ordre dans la soustraction.',
    })

    result = pythagoreCompare('AB^2-GI^2', '\\mathrm{HI}^2-\\mathrm{GI}^2')
    expect(result).toEqual({
      isOk: false,
      feedback: "Ce n'est pas la soustraction attendue.",
    })

    // Égalité de Pythagore attendue, avec somme
    result = pythagoreCompare(
      'AB^2+AC^2=BC^2',
      '\\mathrm{AB}^2+\\mathrm{AC}^2=\\mathrm{BC}^2',
    )
    expect(result.isOk).toBe(true)

    // Égalité équivalente (vraie) mais écrite avec une soustraction pour isoler un côté :
    // refusée avec un feedback dédié, car ce n'est pas l'égalité de Pythagore attendue
    result = pythagoreCompare(
      'AB^2=BC^2-AC^2',
      '\\mathrm{AB}^2+\\mathrm{AC}^2=\\mathrm{BC}^2',
    )
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "Cette égalité est vraie, mais ce n'est pas l'égalité attendue : le carré de la longueur de l'hypoténuse est égal à la somme des carrés des longueurs des deux autres côtés.",
    )

    // Soustraction fausse (l'hypoténuse n'est pas égale à la différence des deux côtés) :
    // refusée sans laisser croire que l'égalité saisie est vraie
    result = pythagoreCompare(
      'BC^2=AB^2-AC^2',
      '\\mathrm{AB}^2+\\mathrm{AC}^2=\\mathrm{BC}^2',
    )
    expect(result.isOk).toBe(false)
    expect(result.feedback).not.toMatch(/vraie, mais/)

    result = fonctionComparaison(
      '\\sqrt7;\\dfrac23;10^2',
      '\\sqrt7;\\dfrac23;10^{2}',
      {
        suiteRangeeDeNombres: true,
      },
    )
    expect(result.isOk).toBe(true)
  })

  //    ███    ███ ██    ██ ██      ████████ ██ ██████  ██      ███████ ███████
  //    ████  ████ ██    ██ ██         ██    ██ ██   ██ ██      ██      ██
  //    ██ ████ ██ ██    ██ ██         ██    ██ ██████  ██      █████   ███████
  //    ██  ██  ██ ██    ██ ██         ██    ██ ██      ██      ██           ██
  //    ██      ██  ██████  ███████    ██    ██ ██      ███████ ███████ ███████
  //
  //
  //     ██████  ██████  ████████ ██  ██████  ███    ██ ███████
  //    ██    ██ ██   ██    ██    ██ ██    ██ ████   ██ ██
  //    ██    ██ ██████     ██    ██ ██    ██ ██ ██  ██ ███████
  //    ██    ██ ██         ██    ██ ██    ██ ██  ██ ██      ██
  //     ██████  ██         ██    ██  ██████  ██   ████ ███████
  //
  //
  // from https://patorjk.com/software/taag/ // Style : ANSI Regular // C++ style Comment

  it('Vérifie le fonctionnement des options cumulées fractionEgale et nombreDecimalSeulement', () => {
    let result = fonctionComparaison('2', '\\dfrac63', {
      fractionEgale: true,
      nombreDecimalSeulement: true,
    })
    expect(result.isOk).toBe(true)

    fonctionComparaison('\\dfrac63', '\\dfrac63', {
      fractionEgale: true,
      nombreDecimalSeulement: true,
    })
    expect(result.isOk).toBe(true)

    fonctionComparaison('\\dfrac63', '2', {
      fractionEgale: true,
      nombreDecimalSeulement: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('\\dfrac{12}{10}', '\\dfrac65', {
      fractionEgale: true,
      nombreDecimalSeulement: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('1.2', '\\dfrac65', {
      fractionEgale: true,
      nombreDecimalSeulement: true,
    })
    expect(result.isOk).toBe(true)
  })

  it('Vérifie le fonctionnement des options cumulées expressionNumerique et nombreDecimalSeulement', () => {
    let result = fonctionComparaison('0', '3-3', {
      expressionNumerique: true,
      nombreDecimalSeulement: true,
    })
    expect(result.isOk).toBe(true)

    result = fonctionComparaison('3-3', '0', {
      expressionNumerique: true,
      nombreDecimalSeulement: true,
    })
    expect(result.isOk).toBe(false) // On attend un nombre si la réponse est un nombre.
  })
})

it('Vérifie la disparition du bug de 0.27.0', () => {
  // Bug 1
  const result = fonctionComparaison('(2+x)^2', '(2+x)(2+x)')
  expect(result.isOk).toBe(true)
  /* En fait, c'est parce que console.info(engine.parse('(2+x)^2').isEqual(engine.parse('(2+x)(2+x)'))) renvoie undefined (prévu par ArnoG, mais pas vraiment compris la raison)
     Dans ce cas (undefined), il faut faire un nouveau test
    console.info(
      engine
        .parse('(2+x)^2')
        .expand()
        .simplify()
        .isSame(engine.parse('(2+x)(2+x)').expand().simplify())
    ) */

  // Bug 2 : Résolu avec la version 0.28
  // result = fonctionComparaison('-0.07\\times n+18', '-0.07n+18')
  // expect(result.isOk).toBe(false)
  /* Actuellement les JSON sont différents alors qu'ils ne devraient pas
        console.info(engine.parse('-0.07\\times n+18').json.toString()) // -> Add,Multiply,-0.07,n,18
        console.info(engine.parse('-0.07\n+18').json.toString()) // -> Add,Negate,Multiply,0.07,n,18
        */

  // Bug 3
  const engine = new ComputeEngine()
  const ecritureScientifique1000 = engine
    .parse('1000')
    .toLatex({ notation: 'scientific', avoidExponentsInRange: [0, 0] }) // 10^{3} and why it is not 1\cdot10^{3}
  expect(ecritureScientifique1000 === '1\\cdot10^{1}').toBe(false)
})

describe('5N1E-1 : handleLeCompteEstBon', () => {
  it('accepte les expressions attendues (calculs cachés)', () => {
    for (let k = 0; k < 100; k++) {
      const [tirage, cible, , fractions, divisions] = TrouverSolutionMathador(
        30,
        90,
      )
      for (const saisie of [...fractions, ...divisions]) {
        const { isOk, feedback } = handleLeCompteEstBon(
          saisie,
          tirage,
          cible,
          false,
        )
        expect(isOk, `${saisie} | ${tirage} → ${cible} : ${feedback}`).toBe(
          true,
        )
      }
    }
  })

  it("accepte les expressions écrites dans l'ordre de lecture", () => {
    for (let k = 0; k < 100; k++) {
      const [tirage, cible, calculs, fractions, divisions] =
        TrouverSolutionMathadorOrdreDeLecture(30, 90)
      for (const saisie of [...fractions, ...divisions]) {
        const { isOk, feedback } = handleLeCompteEstBon(
          saisie,
          tirage,
          cible,
          true,
        )
        expect(isOk, `${saisie} | ${tirage} → ${cible} : ${feedback}`).toBe(
          true,
        )
      }
      // chaque calcul est juste et le dernier donne la cible
      for (const calcul of calculs) {
        const [membreGauche, resultat] = calcul.split('=')
        const [x, op, y] = membreGauche
          .replace('\\times', '*')
          .replace('\\div', '/')
          .match(/^(\d+)([-+*/])(\d+)$/)!
          .slice(1)
        const attendu = {
          '+': +x + +y,
          '-': +x - +y,
          '*': +x * +y,
          '/': +x / +y,
        }[op]
        expect(attendu, calcul).toBe(Number(resultat))
      }
      expect(Number(calculs[calculs.length - 1].split('=')[1])).toBe(cible)
    }
  })

  const tirage = [2, 3, 4, 5, 6]
  it('ne donne pas de feedback quand le champ est vide', () => {
    expect(handleLeCompteEstBon('', tirage, 30, false)).toEqual({
      isOk: false,
      feedback: '',
    })
  })
  it("n'écrit pas de parenthèses inutiles autour d'une division", () => {
    for (let k = 0; k < 200; k++) {
      const [, , , , divisions] = TrouverSolutionMathadorOrdreDeLecture(30, 90)
      for (const expression of divisions) {
        expect(expression).not.toMatch(
          /[-+]\\left\([^()]*\\div[^()]*\\right\)(?![\\^])/,
        )
        expect(expression).not.toMatch(/\\left\([^()]*\\div[^()]*\\right\)[-+]/)
        // la division en tête d'une multiplication se lit de gauche à droite
        expect(expression).not.toMatch(
          /\\left\(\d+\\div(\d+|\\left\([^()]*\\right\))\\right\)\\times/,
        )
      }
    }
  })
  it('refuse une mauvaise valeur', () => {
    const r = handleLeCompteEstBon('2+3+4+5+6', tirage, 30, false)
    expect(r.isOk).toBe(false)
    expect(r.feedback).toContain('vaut 20')
  })
  it('refuse un nombre en trop, en doublon ou non autorisé', () => {
    expect(handleLeCompteEstBon('2+3+4+5+6+1', tirage, 21, false).isOk).toBe(
      false,
    )
    expect(handleLeCompteEstBon('2+2+3+4+5+6', tirage, 22, false).isOk).toBe(
      false,
    )
    expect(handleLeCompteEstBon('2+3+4+5+7', tirage, 21, false).isOk).toBe(
      false,
    )
  })
  it('exige les quatre opérations quand demandé', () => {
    // 2×3 + 6÷3 − 4 = 4
    expect(
      handleLeCompteEstBon('2\\times3+6\\div3-4', [2, 3, 3, 4, 6], 4, true)
        .isOk,
    ).toBe(true)
    // pas de division
    expect(
      handleLeCompteEstBon('2\\times3+6-3-4', [2, 3, 3, 4, 6], 5, true).isOk,
    ).toBe(false)
    expect(
      handleLeCompteEstBon('2\\times3+6-3-4', [2, 3, 3, 4, 6], 5, true)
        .feedback,
    ).toContain('vaut bien 5 mais')
  })
  it('refuse une expression sans tous les nombres, sauf si autorisé', () => {
    // 2×3×5 = 30 sans le 4 ni le 6
    const saisie = '2\\times3\\times5'
    const r = handleLeCompteEstBon(saisie, tirage, 30, false)
    expect(r.isOk).toBe(false)
    expect(r.feedback).toContain('vaut bien 30')
    expect(r.feedback).toContain('tous les nombres')
    expect(handleLeCompteEstBon(saisie, tirage, 30, false, false).isOk).toBe(
      true,
    )
    // un nombre inconnu ou en doublon reste refusé
    expect(
      handleLeCompteEstBon('2\\times3\\times5', [2, 3, 4], 30, false, false)
        .isOk,
    ).toBe(false)
    expect(
      handleLeCompteEstBon('5\\times6', [2, 3, 5], 30, false, false).isOk,
    ).toBe(false)
  })
})
