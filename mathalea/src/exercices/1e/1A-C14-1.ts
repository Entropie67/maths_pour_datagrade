import type { TableauSVConfig } from '../../lib/interactif/tableauSignesVariations/types'
import { tableauSignesFonction } from '../../lib/mathFonctions/etudeFonction'
import { choice } from '../../lib/outils/arrayOutils'
import { reduireAxPlusB } from '../../lib/outils/ecritures'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'

import ExerciceQcmACourt, { genereTableauxDeSignes } from '../ExerciceQcmACourt'
import { sp } from '../../lib/outils/outilString'
/**
 * @author Gilles Mora
 *
 */
export const dateDeModifImportante = '21/10/2026'

export const uuid = 'b8dd2'
export const refs = {
  'fr-fr': ['1A-C14-1'],
  'fr-ch': ['1mQCM-35', '2mQCM-8'],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre = "Déterminer le tableau de signes d'une fonction affine"
export const dateDePublication = '27/08/2025'

export default class Auto1AC16a extends ExerciceQcmACourt {
  private coefA = 0
  private coefB = 0

  versionOriginale: () => void = () => {
    const a = -3
    const b = 6
    this.coefA = a
    this.coefB = b

    this.enonce = `On considère la fonction $f$ définie sur $\\mathbb{R}$ par $f(x) = ${reduireAxPlusB(a, b)}$.<br><br>
        Parmi les quatre tableaux de signes proposés, lequel correspond à cette fonction${sp()}?`

    // Fonction correcte
    const fCorrecte = (x: number | FractionEtendue) => -3 * Number(x) + 6

    // Distracteur 1: mauvaise racine (décalage de la fonction)
    const fDistracteur1 = (x: number | FractionEtendue) => -3 * Number(x) - 6

    // Distracteur 2: signes inversés (coefficient directeur opposé)
    const fDistracteur2 = (x: number | FractionEtendue) => 3 * Number(x) - 6

    // Distracteur 3: autre fonction affine
    const fDistracteur3 = (x: number | FractionEtendue) => 2 * Number(x) + 4

    this.reponses = [
      tableauSignesFonction(fCorrecte, -10, 10, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -10, antTex: '-\\infty' },
          { antVal: 10, antTex: '+\\infty' },
        ],
      }),
      tableauSignesFonction(fDistracteur1, -10, 10, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -10, antTex: '-\\infty' },
          { antVal: 10, antTex: '+\\infty' },
        ],
      }),
      tableauSignesFonction(fDistracteur2, -10, 10, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -10, antTex: '-\\infty' },
          { antVal: 10, antTex: '+\\infty' },
        ],
      }),
      tableauSignesFonction(fDistracteur3, -10, 10, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -10, antTex: '-\\infty' },
          { antVal: 10, antTex: '+\\infty' },
        ],
      }),
    ]

    this.correction = `La fonction $f(x) = ${reduireAxPlusB(a, b)}$ est une fonction affine de coefficient directeur $a = ${a}$ et d'ordonnée à l'origine $b = ${texNombre(b, 2)}$.<br>
    • La fonction s'annule quand $${reduireAxPlusB(a, b)} = 0$, soit $x = ${texNombre(-b / a, 2)}$.<br>
    • Comme $a = ${a} < 0$, la fonction est décroissante${sp()}: elle est positive avant la racine et négative après.<br>Le tableau de signes de la fonction $f$ est donc le suivant${sp()}:<br>
    ${tableauSignesFonction(fCorrecte, -20, 20, {
      step: 1,
      tolerance: 0.1,
      substituts: [
        { antVal: -20, antTex: '-\\infty' },
        { antVal: 20, antTex: '+\\infty' },
      ],
    })}`
  }

  versionAleatoire: () => void = () => {
    const a = randint(1, 6) * choice([-1, 1]) // coefficient a de la fonction affine
    const k1 = randint(1, 100) / 10
    const k2 = randint(1, 10)
    const k = choice([k1, k2, k2, k2])
    const b = a * k // coefficient b de la fonction affine
    this.coefA = a
    this.coefB = b

    this.enonce = `On considère la fonction $f$ définie sur $\\mathbb{R}$ par $f(x) = ${reduireAxPlusB(a, b)}$.<br>
        Parmi les quatre tableaux de signes proposés, lequel correspond à cette fonction${sp()}?`

    // Fonction correcte
    const fCorrecte = (x: number | FractionEtendue) => a * Number(x) + b

    // Distracteur 1: coefficient directeur opposé (signes inversés)
    const fDistracteur1 = (x: number | FractionEtendue) => -a * Number(x) + b

    // Distracteur 2: ordonnée à l'origine opposée (racine déplacée)
    const fDistracteur2 = (x: number | FractionEtendue) => a * Number(x) + -b

    // Distracteur 3: les deux opposés
    const fDistracteur3 = (x: number | FractionEtendue) => -a * Number(x) + -b

    this.reponses = [
      tableauSignesFonction(fCorrecte, -20, 20, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -20, antTex: '-\\infty' },
          { antVal: 20, antTex: '+\\infty' },
        ],
      }),
      tableauSignesFonction(fDistracteur1, -20, 20, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -20, antTex: '-\\infty' },
          { antVal: 20, antTex: '+\\infty' },
        ],
      }),
      tableauSignesFonction(fDistracteur2, -20, 20, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -20, antTex: '-\\infty' },
          { antVal: 20, antTex: '+\\infty' },
        ],
      }),
      tableauSignesFonction(fDistracteur3, -20, 20, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -20, antTex: '-\\infty' },
          { antVal: 20, antTex: '+\\infty' },
        ],
      }),
    ]

    const sensVariation = a > 0 ? 'croissante' : 'décroissante'
    const explicationSignes =
      a > 0
        ? 'elle est négative avant la racine et positive après'
        : 'elle est positive avant la racine et négative après'

    this.correction = `La fonction $f(x) = ${reduireAxPlusB(a, b)}$ est une fonction affine de coefficient directeur $a = ${a}$ et d'ordonnée à l'origine $b = ${texNombre(b, 2)}$.<br>
    • La fonction s'annule quand $${reduireAxPlusB(a, b)} = 0$, soit $x = ${texNombre(-b / a, 2)}$.<br>
    • Comme $a = ${a} ${a > 0 ? '> 0' : '< 0'}$, la fonction est ${sensVariation}${sp()}: ${explicationSignes}.<br>
    Le tableau de signes de la fonction $f$ est donc le suivant${sp()}:<br>
    ${tableauSignesFonction(fCorrecte, -20, 20, {
      step: 1,
      tolerance: 0.1,
      substituts: [
        { antVal: -20, antTex: '-\\infty' },
        { antVal: 20, antTex: '+\\infty' },
      ],
    })}`
  }

  /** Tableau de signes à compléter : la racine et les deux signes. */
  configTableauSignes(): TableauSVConfig {
    const a = this.coefA
    const b = this.coefB
    return {
      variableName: 'x',
      colonnes: [
        { valeur: '-\\infty' },
        { valeur: '', editable: true, expected: texNombre(-b / a, 2) },
        { valeur: '+\\infty' },
      ],
      lignes: [
        {
          type: 'signe',
          label: 'f(x)',
          cellules: [
            { symbole: '' },
            { symbole: '', editable: true, expected: a > 0 ? '-' : '+' },
            { symbole: '|0' },
            { symbole: '', editable: true, expected: a > 0 ? '+' : '-' },
            { symbole: '' },
          ],
        },
      ],
    }
  }

  nouvelleVersion() {
    if (this.sup3) super.nouvelleVersion()
    else genereTableauxDeSignes(this)
  }

  constructor() {
    super()
    this.enonceCourt = () =>
      this.enonce.replace(
        /Parmi les quatre tableaux de signes proposés, lequel correspond à cette fonction[^?]*\?/,
        'Déterminer le tableau de signes de $f$.',
      )
    this.versionAleatoire()
    this.reponseCourteDisponible = false // La réponse est un tableau de signes.
    this.options.vertical = true
  }
}
