// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid a6341 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { courbe } from '../../lib/2d/Courbe'
import { repere } from '../../lib/2d/reperes'
import { latex2d } from '../../lib/2d/textes'
import {
  tableauDeVariation,
  tableauSignesFonction,
} from '../../lib/mathFonctions/etudeFonction'

// import { reduireAxPlusB } from '../../lib/outils/ecritures'

import { bleuMathalea } from '../../lib/colors'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import type FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
/**
 * @author Gilles Mora
 *
 */
export const uuid = 'a6341'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Retrouver le tableau de signes d'un produit de fonctions (graphique)"
export const dateDePublication = '03/07/2025'

export default class Auto1AF5Old extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    // Version originale avec g(x) = 2x + 6 et h(x) = -x + 1
    const a = 2
    const b = 6
    const m = -1
    const p = 1

    // Calcul des racines
    const racine1 = -b / a // racine de 2x + 6 = 0 → x = -3
    const racine2 = -p / m // racine de -x + 1 = 0 → x = 1

    // Tri des racines par ordre croissant
    const racines = [racine1, racine2].sort((x, y) => x - y)
    const rMin = racines[0] // -3
    const rMax = racines[1] // 1

    const f1 = (x: number | FractionEtendue) => a * Number(x) + b // g(x) = 2x + 6
    const f2 = (x: number | FractionEtendue) => m * Number(x) + p // h(x) = -x + 1
    const fProduit = (x: number | FractionEtendue) =>
      (a * Number(x) + b) * (m * Number(x) + p)
    const fDist1 = (x: number | FractionEtendue) =>
      (a * Number(x) - b) * (m * Number(x) - p) * -1
    const fDist2 = (x: number | FractionEtendue) =>
      (a * Number(x) + b) * (m * Number(x) + p) * -1
    const fDist3 = (x: number | FractionEtendue) =>
      (a * Number(x) - b) * (m * Number(x) - p)

    // Définition des lignes pour le tableau de signes
    /* const lignePPM = [
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
    ] */
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
    /* const ligneMMP = [
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
    ] */
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

    // let ligne1, ligne2, ligne3

    // Pour g(x) = 2x + 6 : s'annule en x = -3, a = 2 > 0
    // donc négative pour x < -3, positive pour x > -3
    const ligne1 = ligneMPP // - puis +

    // Pour h(x) = -x + 1 : s'annule en x = 1, m = -1 < 0
    // donc positive pour x < 1, négative pour x > 1
    const ligne2 = lignePMM // + puis -

    // Pour le produit f(x) = g(x) × h(x)
    // a * m = 2 * (-1) = -2 < 0
    const ligne3 = ligneMPM // - puis + puis -

    const o = latex2d('\\text{O}', -0.3, -0.3, { letterSize: 'scriptsize' })
    const xmin = -5
    const ymin = -5
    const xmax = 5
    const ymax = 5
    const r = repere({
      xMin: xmin,
      xMax: xmax,
      xUnite: 1,
      yMin: ymin,
      yMax: ymax,
      yUnite: 1,
      thickHauteur: 0.1,
      xThickMin: xmin - 1,
      yThickMin: ymin - 1,
      yThickMax: ymax + 1,
      xLabelMin: xmin,
      yLabelMin: ymin,
      yLabelMax: ymax,
      xLabelMax: xmax,
      xThickMax: xmax + 1,
      yLabelDistance: 1,
      yLabelEcart: 0.5,
      axesEpaisseur: 1.5,
      grilleSecondaireOpacite: 1,
      grilleSecondaire: true,
      grilleSecondaireYDistance: 1,
      grilleSecondaireXDistance: 1,
      grilleSecondaireYMin: ymin - 0.1,
      grilleSecondaireYMax: ymax + 0.1,
      grilleSecondaireXMin: xmin - 0.1,
      grilleSecondaireXMax: xmax + 0.1,
    })
    const objet = mathalea2d(
      {
        xmin,
        xmax,
        ymin: ymin - 0.25,
        ymax: ymax + 0.25,
        pixelsParCm: 30,
        scale: 0.6,
        center: !context.isHtml,
      },
      courbe(f1, {
        repere: r,
        color: bleuMathalea,
        epaisseur: 2,
      }),
      courbe(f2, {
        repere: r,
        color: 'red',
        epaisseur: 2,
      }),
      r,
      o,
    )

    this.enonce = `On donne les représentations graphiques de deux fonctions affines, $g$ (en bleu) et $h$ (en rouge), définies sur $\\mathbb{R}$.<br>
    ${objet}<br><br>`
    this.enonce +=
      'Le tableau de signes de la fonction $f$ définie par $f(x)=g(x)\\times h(x)$ sur $\\mathbb{R}$ est  : '

    this.reponses = [
      `${tableauSignesFonction(fProduit, -10, 10, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -10, antTex: '-\\infty' },
          { antVal: 10, antTex: '+\\infty' },
        ],
      })}`,
      `${tableauSignesFonction(fDist1, -10, 10, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -10, antTex: '-\\infty' },
          { antVal: 10, antTex: '+\\infty' },
        ],
      })}`,

      `${tableauSignesFonction(fDist2, -10, 10, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -10, antTex: '-\\infty' },
          { antVal: 10, antTex: '+\\infty' },
        ],
      })}`,
      `${tableauSignesFonction(fDist3, -10, 10, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -10, antTex: '-\\infty' },
          { antVal: 10, antTex: '+\\infty' },
        ],
      })}`,
    ]

    // Construction de la correction
    this.correction =
      `La fonction $g$ s'annule en $x = -3$ et la fonction $h$ s'annule en $x = 1$.<br>
    Quand la droite est en dessous de l'axe des abscisses, la fonction est négative et quand elle est au-dessus, la fonction est positive.<br>
    On en déduit le tableau de signes de leur produit :` +
      tableauDeVariation({
        tabInit: [
          [
            ['$x$', 2, 30],
            ['$g(x)$', 2, 50],
            ['$h(x)$', 2, 50],
            ['$f(x)$', 2, 100],
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
        lgt: 5,
      })

    this.correction += `Le tableau de signes de $f$ est donc : ${tableauSignesFonction(
      fProduit,
      -10,
      10,
      {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -10, antTex: '-\\infty' },
          { antVal: 10, antTex: '+\\infty' },
        ],
      },
    )}`
  }

  versionAleatoire: () => void = () => {
    let a, b, m, p, racine1, racine2

    // Générer des coefficients jusqu'à obtenir des racines différentes
    do {
      a = randint(-4, 4, 0)
      b = a * randint(-4, 4)
      m = randint(-4, 4, [a, 0])
      p = m * randint(-3, 3, 0)

      // Calcul des racines
      racine1 = -b / a // racine de ax + b = 0
      racine2 = -p / m // racine de mx + p = 0
    } while (
      Math.abs(racine1 - racine2) < 0.1 ||
      racine1 === racine2 ||
      racine1 === -racine2
    ) // S'assurer que les racines sont suffisamment différentes

    // Tri des racines par ordre croissant
    const racines = [racine1, racine2].sort((x, y) => x - y)
    const rMin = racines[0]
    const rMax = racines[1]

    const f1 = (x: number | FractionEtendue) => a * Number(x) + b
    const f2 = (x: number | FractionEtendue) => m * Number(x) + p
    const fProduit = (x: number | FractionEtendue) =>
      (a * Number(x) + b) * (m * Number(x) + p)
    const fDist1 = (x: number | FractionEtendue) =>
      (a * Number(x) - b) * (m * Number(x) - p) * -1
    const fDist2 = (x: number | FractionEtendue) =>
      (a * Number(x) + b) * (m * Number(x) + p) * -1
    const fDist3 = (x: number | FractionEtendue) =>
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
    let ligne1, ligne2, ligne3

    // Signe de (ax + b)
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
    if (a * m > 0) {
      ligne3 = lignePMP // + puis - puis +
    } else {
      ligne3 = ligneMPM // - puis + puis -
    }

    const o = latex2d('\\text{O}', -0.3, -0.3, { letterSize: 'scriptsize' })
    const xmin = -5
    const ymin = -5
    const xmax = 5
    const ymax = 5
    const r = repere({
      xMin: xmin,
      xMax: xmax,
      xUnite: 1,
      yMin: ymin,
      yMax: ymax,
      yUnite: 1,
      thickHauteur: 0.1,
      xThickMin: xmin - 1,
      yThickMin: ymin - 1,
      yThickMax: ymax + 1,
      xLabelMin: xmin + 1,
      yLabelMin: ymin + 1,
      yLabelMax: ymax - 1,
      xLabelMax: xmax - 1,
      xThickMax: xmax,
      yLabelDistance: 1,
      yLabelEcart: 0.5,
      axesEpaisseur: 1.5,
      grilleSecondaireOpacite: 1,
      grilleSecondaire: true,
      grilleSecondaireYDistance: 1,
      grilleSecondaireXDistance: 1,
      grilleSecondaireYMin: ymin - 0.05,
      grilleSecondaireYMax: ymax + 0.05,
      grilleSecondaireXMin: xmin - 0.05,
      grilleSecondaireXMax: xmax + 0.05,
    })
    const objet = mathalea2d(
      {
        xmin,
        xmax,
        ymin: ymin - 0.05,
        ymax: ymax + 0.05,
        pixelsParCm: 30,
        scale: 0.6,
        center: !context.isHtml,
      },
      courbe(f1, {
        repere: r,
        color: bleuMathalea,
        epaisseur: 2,
      }),
      courbe(f2, {
        repere: r,
        color: 'red',
        epaisseur: 2,
      }),
      r,
      o,
    )

    this.enonce = `On donne les représentations graphiques de deux fonctions affines, $g$ (en bleu) et $h$ (en rouge), définies sur $\\mathbb{R}$.<br>
    ${objet}<br><br>`
    this.enonce +=
      'Le tableau de signes de la fonction $f$ définie par $f(x)=g(x)\\times h(x)$ sur $\\mathbb{R}$ est  : '

    this.reponses = [
      `${tableauSignesFonction(fProduit, -10, 10, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -10, antTex: '-\\infty' },
          { antVal: 10, antTex: '+\\infty' },
        ],
      })}`,
      `${tableauSignesFonction(fDist1, -10, 10, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -10, antTex: '-\\infty' },
          { antVal: 10, antTex: '+\\infty' },
        ],
      })}`,

      `${tableauSignesFonction(fDist2, -10, 10, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -10, antTex: '-\\infty' },
          { antVal: 10, antTex: '+\\infty' },
        ],
      })}`,
      `${tableauSignesFonction(fDist3, -10, 10, {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -10, antTex: '-\\infty' },
          { antVal: 10, antTex: '+\\infty' },
        ],
      })}`,
    ]

    // Construction de la correction dynamique
    this.correction =
      `La fonction $g$ s'annule en $${texNombre(racine1)}$ et la fonction $h$ s'annule en $${texNombre(racine2)}$.<br>
    Quand la droite est en dessous de l'axe des abscisses, la fonction est négative et quand elle est au-dessus, la fonction est positive.<br>
    On en déduit le tableau de signes de leur produit :` +
      tableauDeVariation({
        tabInit: [
          [
            ['$x$', 2, 30],
            ['$g(x)$', 2, 50],
            ['$h(x)$', 2, 50],
            ['$f(x)$', 2, 100],
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
        lgt: 5,
      })
    this.correction += `Le tableau de signes de $f$ est donc : ${tableauSignesFonction(
      fProduit,
      -10,
      10,
      {
        step: 1,
        tolerance: 0.1,
        substituts: [
          { antVal: -10, antTex: '-\\infty' },
          { antVal: 10, antTex: '+\\infty' },
        ],
      },
    )}`
  }

  constructor() {
    super()
    // Appel de la version originale par défaut, ou de la version aléatoire selon les besoins
    this.versionOriginale()
    this.options.vertical = true
  }
}
