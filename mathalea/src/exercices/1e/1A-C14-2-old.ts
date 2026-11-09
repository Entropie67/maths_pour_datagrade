// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid fdf27 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import {
  tableauDeVariation,
  tableauSignesFonction,
} from '../../lib/mathFonctions/etudeFonction'

import { reduireAxPlusB } from '../../lib/outils/ecritures'

import { texNombre } from '../../lib/outils/texNombre'
import type FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

/**
 * @author Gilles Mora
 *
 */
export const uuid = 'fdf27'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Retrouver le tableau de signes d'un produit de fonctions"
export const dateDePublication = '26/07/2025'

export default class Auto1AC16bOld extends ExerciceQcmA {
  versionOriginale: () => void = () => {
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
    L'équation $x+2=0$ a pour solution $x=2$.<br>
    Le tableau de signe du produit $(3x+15)(x+2)$ est : <br>` +
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

    this.enonce = `La fonction $f$ définie sur $\\mathbb{R}$ par $f(x)=(${reduireAxPlusB(a, b)})(${reduireAxPlusB(m, p)})$ admet pour tableau de signes :   `

    const tableauReponse = `${tableauSignesFonction(f, -20, 20, {
      step: 1,
      tolerance: 0.1,
      substituts: [
        { antVal: -20, antTex: '-\\infty' },
        { antVal: 20, antTex: '+\\infty' },
      ],
    })}`
    this.reponses = [
      tableauReponse,
      `${tableauSignesFonction(f1, -20, 20, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -20, antTex: '-\\infty' },
          { antVal: 20, antTex: '+\\infty' },
        ],
      })}`,

      `${tableauSignesFonction(f2, -20, 20, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -20, antTex: '-\\infty' },
          { antVal: 20, antTex: '+\\infty' },
        ],
      })}`,
      `${tableauSignesFonction(f3, -20, 20, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -20, antTex: '-\\infty' },
          { antVal: 20, antTex: '+\\infty' },
        ],
      })}`,
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
          [
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

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()
    this.options.vertical = true
    this.versionAleatoire()
  }
}
