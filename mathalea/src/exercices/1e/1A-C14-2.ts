import {
  tableauDeVariation,
  tableauSignesFonction,
} from '../../lib/mathFonctions/etudeFonction'

import { reduireAxPlusB } from '../../lib/outils/ecritures'
import type {
  CelluleSigne,
  LigneSigne,
  TableauSVConfig,
} from '../../lib/interactif/tableauSignesVariations/types'

import { texNombre } from '../../lib/outils/texNombre'
import type FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceQcmACourt, { genereTableauxDeSignes } from '../ExerciceQcmACourt'

/**
 * @author Gilles Mora
 *
 */
export const dateDeModifImportante = '21/10/2026'

export const uuid = '3846a'
export const refs = {
  'fr-fr': ['1A-C14-2'],
  'fr-ch': ['2mQCM-9'],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre = "Retrouver le tableau de signes d'un produit de fonctions"
export const dateDePublication = '26/07/2025'

export default class Auto1AC16b extends ExerciceQcmACourt {
  private racines: [number, number] = [0, 0]
  private produitPositifAuxBornes = true

  versionOriginale: () => void = () => {
    this.racines = [-2, 5]
    this.produitPositifAuxBornes = true
    const f = (x: number | FractionEtendue) =>
      (3 * Number(x) - 15) * (Number(x) + 2)
    const f1 = (x: number | FractionEtendue) =>
      (3 * Number(x) - 15) * (Number(x) + 2) * -1
    const f2 = (x: number | FractionEtendue) =>
      (3 * Number(x) + 15) * (Number(x) + 2)
    const f3 = (x: number | FractionEtendue) =>
      (3 * Number(x) + 15) * (Number(x) - 2)
    const ligneMPP = [
      'Line',
      30,
      '',
      0,
      '-',
      20,
      'z',
      20,
      '+',
      20,
      't',
      5,
      '+',
      20,
    ]
    const ligneMMP = [
      'Line',
      30,
      '',
      0,
      '-',
      20,
      't',
      5,
      '-',
      20,
      'z',
      20,
      '+',
      20,
    ]
    const lignePMP = [
      'Line',
      30,
      '',
      0,
      '+',
      20,
      'z',
      20,
      '-',
      20,
      'z',
      5,
      '+',
      20,
    ]
    const ligne1 = ligneMMP
    const ligne2 = ligneMPP
    const ligne3 = lignePMP
    this.enonce =
      'La fonction $f$ définie sur $\\mathbb{R}$ par $f(x)=(3x-15)(x+2)$ admet pour tableau de signes :   '
    const tableauReponse = `${tableauSignesFonction(f, -10, 10, {
      step: 1,
      tolerance: 0.1,
      substituts: [
        { antVal: -10, antTex: '-\\infty' },
        { antVal: 10, antTex: '+\\infty' },
      ],
    })}`
    this.reponses = [
      tableauReponse,
      `${tableauSignesFonction(f1, -10, 10, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -10, antTex: '-\\infty' },
          { antVal: 10, antTex: '+\\infty' },
        ],
      })}`,

      `${tableauSignesFonction(f2, -10, 10, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -10, antTex: '-\\infty' },
          { antVal: 10, antTex: '+\\infty' },
        ],
      })}`,
      `${tableauSignesFonction(f3, -10, 10, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -10, antTex: '-\\infty' },
          { antVal: 10, antTex: '+\\infty' },
        ],
      })}`,
    ]
    this.correction =
      `L'équation $3x-15=0$ a pour solution $x=5$.<br>
    L'équation $x+2=0$ a pour solution $x=-2$.<br>
    Le tableau de signe du produit $(3x-15)(x+2)$ est : <br>` +
      tableauDeVariation({
        tabInit: [
          [
            ['$x$', 2, 30],
            ['$3x-15$', 2, 50],
            ['$x+2$', 2, 50],
            ['$(3x-15)(x+2)$', 2, 100],
          ],
          ['$-\\infty$', 30, '$-2$', 20, '$5$', 20, '$+\\infty$', 30],
        ],
        tabLines: [ligne1, ligne2, ligne3],
        espcl: 4,
        deltacl: 1.5, // valeur par défaut, à ajuster si besoin
        lgt: 3,
      }) +
      `<br>Le tableau de signe de $f(x)$ est donc : <br>${tableauReponse}`
  }

  versionAleatoire: () => void = () => {
    const a = randint(-5, 8, 0)
    const b = a * randint(-10, 10, 0)
    const m = randint(-5, 8, 0)
    const p = m * randint(-10, 10, 0)

    // Calcul des racines
    const racine1 = -b / a // racine de ax + b = 0
    const racine2 = -p / m // racine de mx + p = 0

    // Tri des racines par ordre croissant
    const racines = [racine1, racine2].sort((x, y) => x - y)
    const rMin = racines[0]
    const rMax = racines[1]
    this.racines = [rMin, rMax]
    this.produitPositifAuxBornes = a * m > 0

    const f = (x: number | FractionEtendue) =>
      (a * Number(x) + b) * (m * Number(x) + p)
    const f1 = (x: number | FractionEtendue) =>
      (a * Number(x) + b) * (m * Number(x) + p) * -1
    const f2 = (x: number | FractionEtendue) =>
      (a * Number(x) - b) * (m * Number(x) + p)
    const f3 = (x: number | FractionEtendue) =>
      (a * Number(x) - b) * (m * Number(x) - p)

    // Définition des lignes possibles
    const lignePPM = [
      'Line',
      30,
      '',
      0,
      '+',
      20,
      't',
      5,
      '+',
      20,
      'z',
      20,
      '-',
      20,
    ]
    const lignePMM = [
      'Line',
      30,
      '',
      0,
      '+',
      20,
      'z',
      20,
      '-',
      20,
      't',
      5,
      '-',
      20,
    ]
    const ligneMPP = [
      'Line',
      30,
      '',
      0,
      '-',
      20,
      'z',
      20,
      '+',
      20,
      't',
      5,
      '+',
      20,
    ]
    const ligneMMP = [
      'Line',
      30,
      '',
      0,
      '-',
      20,
      't',
      5,
      '-',
      20,
      'z',
      20,
      '+',
      20,
    ]
    const lignePMP = [
      'Line',
      30,
      '',
      0,
      '+',
      20,
      'z',
      20,
      '-',
      20,
      'z',
      5,
      '+',
      20,
    ]
    const ligneMPM = [
      'Line',
      30,
      '',
      0,
      '-',
      20,
      'z',
      5,
      '+',
      20,
      'z',
      20,
      '-',
      20,
    ]

    // Détermination des signes sur chaque intervalle
    // Pour ax + b : signe de a à gauche de -b/a, opposé à droite
    // Pour mx + p : signe de m à gauche de -p/m, opposé à droite

    let ligne1, ligne2, ligne3

    // Signe de (ax + b) : négatif si x < -b/a, positif si x > -b/a (quand a > 0)
    // Si a < 0, c'est l'inverse
    if (racine1 === rMin) {
      // racine1 (-b/a) est la plus petite
      if (a > 0) {
        ligne1 = ligneMPP // (ax + b) : - puis +
      } else {
        ligne1 = lignePMM // (ax + b) : + puis -
      }
    } else {
      // racine1 (-b/a) est la plus grande
      if (a > 0) {
        ligne1 = ligneMMP // (ax + b) : - puis - puis +
      } else {
        ligne1 = lignePPM // (ax + b) : + puis + puis -
      }
    }

    // Signe de (mx + p)
    if (racine2 === rMin) {
      // racine2 (-p/m) est la plus petite
      if (m > 0) {
        ligne2 = ligneMPP // (mx + p) : - puis +
      } else {
        ligne2 = lignePMM // (mx + p) : + puis -
      }
    } else {
      // racine2 (-p/m) est la plus grande
      if (m > 0) {
        ligne2 = ligneMMP // (mx + p) : - puis - puis +
      } else {
        ligne2 = lignePPM // (mx + p) : + puis + puis -
      }
    }

    // Pour le produit : signe = signe1 × signe2
    // Si a*m > 0 : même comportement général (+ aux extrêmes)
    // Si a*m < 0 : comportement opposé (- aux extrêmes)
    if (a * m > 0) {
      ligne3 = lignePMP // + puis - puis +
    } else {
      ligne3 = ligneMPM // - puis + puis -
    }

    // Racine double : une seule valeur dans le tableau, le produit garde son signe
    const racineDouble = rMin === rMax
    if (racineDouble) {
      const ligneSimple = (avant: string, apres: string) => [
        'Line',
        30,
        '',
        0,
        avant,
        20,
        'z',
        20,
        apres,
        20,
      ]
      ligne1 = a > 0 ? ligneSimple('-', '+') : ligneSimple('+', '-')
      ligne2 = m > 0 ? ligneSimple('-', '+') : ligneSimple('+', '-')
      ligne3 = a * m > 0 ? ligneSimple('+', '+') : ligneSimple('-', '-')
    }

    this.enonce = `La fonction $f$ définie sur $\\mathbb{R}$ par $f(x)=(${reduireAxPlusB(a, b)})(${reduireAxPlusB(m, p)})$ admet pour tableau de signes :   `

    const tableauSignes = (fonction: (x: number) => number) =>
      tableauSignesFonction(fonction, -20, 20, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -20, antTex: '-\\infty' },
          { antVal: 20, antTex: '+\\infty' },
        ],
      })
    // tableauSignesFonction ne repère que les changements de signe :
    // une racine double (signe identique de part et d'autre) est ajoutée à la main.
    const tableauRacineDouble = (racine: number, signe: '+' | '-') =>
      tableauDeVariation({
        tabInit: [
          [
            ['x', 1.5, 10],
            ['f(x)', 1.5, 10],
          ],
          ['-\\infty', 10, texNombre(racine), 10, '+\\infty', 10],
        ],
        tabLines: [['Line', 30, '', 10, signe, 10, 'z', 10, signe, 10]],
        espcl: 2.1,
        deltacl: 0.8,
        lgt: 3,
      })
    const signeAuxBornes = a * m > 0 ? '+' : '-'
    const signeOppose = a * m > 0 ? '-' : '+'

    const tableauReponse = racineDouble
      ? tableauRacineDouble(rMin, signeAuxBornes)
      : tableauSignes(f)
    this.reponses = [
      tableauReponse,
      racineDouble ? tableauRacineDouble(rMin, signeOppose) : tableauSignes(f1),
      tableauSignes(f2),
      // f3 a pour racine double l'opposé de celle de f
      racineDouble
        ? tableauRacineDouble(-rMin, signeAuxBornes)
        : tableauSignes(f3),
    ]

    // Construction de la correction dynamique
    this.correction =
      `L'équation $${reduireAxPlusB(a, b)}=0$ a pour solution $x=${texNombre(-b / a)}$.<br>
  L'équation $${reduireAxPlusB(m, p)}=0$ a pour solution $x=${texNombre(-p / m)}$.<br>
  Le tableau de signes du produit $(${reduireAxPlusB(a, b)})(${reduireAxPlusB(m, p)})$ est : <br>` +
      tableauDeVariation({
        tabInit: [
          [
            ['$x$', 2, 30],
            [`$${reduireAxPlusB(a, b)}$`, 2, 50],
            [`$${reduireAxPlusB(m, p)}$`, 2, 50],
            [`$(${reduireAxPlusB(a, b)})(${reduireAxPlusB(m, p)})$`, 2, 100],
          ],
          racineDouble
            ? ['$-\\infty$', 30, `$${texNombre(rMin)}$`, 20, '$+\\infty$', 30]
            : [
                '$-\\infty$',
                30,
                `$${texNombre(rMin)}$`,
                20,
                `$${texNombre(rMax)}$`,
                20,
                '$+\\infty$',
                30,
              ],
        ],
        tabLines: [ligne1, ligne2, ligne3],
        espcl: 3,
        deltacl: 1,
        lgt: 8,
      }) +
      `Le tableau de signes de $f$ est donc : <br>${tableauReponse}`
  }

  /** Tableau de signes de f(x) à compléter : les racines et les signes. */
  configTableauSignes(): TableauSVConfig {
    const [rMin, rMax] = this.racines
    const exterieur = this.produitPositifAuxBornes ? '+' : '-'
    const interieur = this.produitPositifAuxBornes ? '-' : '+'
    const ligne = (signes: CelluleSigne['symbole'][]): LigneSigne => ({
      type: 'signe',
      label: 'f(x)',
      cellules: [
        { symbole: '' },
        ...signes.flatMap((signe, k): CelluleSigne[] => [
          ...(k > 0 ? [{ symbole: '|0' } as CelluleSigne] : []),
          { symbole: '', editable: true, expected: signe },
        ]),
        { symbole: '' },
      ],
    })
    if (rMin === rMax) {
      return {
        variableName: 'x',
        colonnes: [
          { valeur: '-\\infty' },
          { valeur: '', editable: true, expected: texNombre(rMin, 2) },
          { valeur: '+\\infty' },
        ],
        lignes: [ligne([exterieur, exterieur])],
      }
    }
    return {
      variableName: 'x',
      colonnes: [
        { valeur: '-\\infty' },
        { valeur: '', editable: true, expected: texNombre(rMin, 2) },
        { valeur: '', editable: true, expected: texNombre(rMax, 2) },
        { valeur: '+\\infty' },
      ],
      lignes: [ligne([exterieur, interieur, exterieur])],
    }
  }

  nouvelleVersion() {
    if (this.sup3) super.nouvelleVersion()
    else genereTableauxDeSignes(this)
  }

  constructor() {
    super()
    this.enonceCourt = () =>
      this.enonce
        .replace(/^La fonction/, 'On considère la fonction')
        .replace(
          / admet pour tableau de signes\s*:\s*$/,
          '.<br>Déterminer le tableau de signes de $f$.',
        )
    this.reponseCourteDisponible = false // La réponse est un tableau de signes.
    this.options.vertical = true
    this.versionAleatoire()
  }
}
