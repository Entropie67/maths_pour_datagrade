import { context } from '../../modules/context'

import { repere } from '../../lib/2d/reperes'
import { latex2d, texteParPosition } from '../../lib/2d/textes'
import {
  tableauDeVariation,
  tableauSignesFonction,
} from '../../lib/mathFonctions/etudeFonction'
import { spline } from '../../lib/mathFonctions/Spline'
import { choice } from '../../lib/outils/arrayOutils'

// import { reduireAxPlusB } from '../../lib/outils/ecritures'

import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { creerTableauSignesVariations } from '../../lib/customElements/TableauSignesVariationsElement'
import { configCorrige } from '../../lib/interactif/tableauSignesVariations/helpers'
import type { TableauSVConfig } from '../../lib/interactif/tableauSignesVariations/types'
import { texNombre } from '../../lib/outils/texNombre'
import type FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmACourt, { genereTableauxDeSignes } from '../ExerciceQcmACourt'
/**
 * @author Gilles Mora
 *
 */
export const dateDeModifImportante = '30/10/2026'

export const uuid = '097ab'
export const refs = {
  'fr-fr': ['1A-F05-2', 'BP1F2D07'],
  'fr-ch': ['1mQCM-59', '2mQCM-18'],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre =
  'Déterminer par lecture graphique un tableau de signes ou de variations'
export const dateDePublication = '02/02/2026'

/**
 * Tableau de signes ou de variations à compléter à partir d'une courbe simple,
 * QCM en option.
 * @author Gilles Mora
 */

export default class TableauxGraphiques extends ExerciceQcmACourt {
  // Données du tirage en cours, relues par le tableau à compléter
  private typeTableau: 'signes' | 'variations' = 'signes'
  // Nœuds de la courbe triés par abscisse : bornes (0, 4), zéros (1, 3), extremum (2)
  private noeuds: { x: number; y: number }[] = []
  // Identifiant unique des tableaux corrigés (distinct de celui de la question)
  private compteurTableauxCorriges = 0

  /** Tableau à compléter : toutes les abscisses, puis les signes ou les images et les flèches. */
  configTableauSignes(): TableauSVConfig {
    const n = this.noeuds
    if (this.typeTableau === 'signes') {
      const colonnes = [n[0], n[1], n[3], n[4]]
      const signe = (y: number) => (y > 0 ? '+' : '-')
      return {
        variableName: 'x',
        colonnes: colonnes.map(({ x }) => ({
          valeur: '',
          editable: true,
          expected: texNombre(x),
        })),
        lignes: [
          {
            type: 'signe',
            label: 'f(x)',
            cellules: [
              { symbole: '' },
              { symbole: '', editable: true, expected: signe(n[0].y) },
              { symbole: '|0' },
              { symbole: '', editable: true, expected: signe(n[2].y) },
              { symbole: '|0' },
              { symbole: '', editable: true, expected: signe(n[4].y) },
              { symbole: '' },
            ],
          },
        ],
      }
    }
    const colonnes = [n[0], n[2], n[4]]
    return {
      variableName: 'x',
      colonnes: colonnes.map(({ x }) => ({
        valeur: '',
        editable: true,
        expected: texNombre(x),
      })),
      lignes: [
        {
          type: 'variation',
          label: 'f(x)',
          valeurs: colonnes.map(({ y }) => ({
            latex: '',
            editable: true,
            expected: texNombre(y),
          })),
          fleches: [0, 1].map((index) => ({
            sens: '',
            editable: true,
            expected:
              colonnes[index + 1].y > colonnes[index].y ? 'haut' : 'bas',
          })),
        },
      ],
    }
  }

  nouvelleVersion(): void {
    this.reponseCourteDisponible = true
    if (this.sup3) super.nouvelleVersion()
    else genereTableauxDeSignes(this)
  }

  versionOriginale: () => void = () => {
    // Courbe fixe pour la version originale
    const noeuds = [
      { x: -5, y: 2, deriveeGauche: -1, deriveeDroit: -1, isVisible: false },
      { x: -2, y: 0, deriveeGauche: -1, deriveeDroit: -1, isVisible: false },
      { x: 0, y: -2, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
      { x: 2, y: 0, deriveeGauche: 1, deriveeDroit: 1, isVisible: false },
      { x: 4, y: 3, deriveeGauche: 1, deriveeDroit: 1, isVisible: false },
    ]

    const maSpline = spline(noeuds)
    const o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)

    const bornes = maSpline.trouveMaxes()
    const repere1 = repere({
      xMin: bornes.xMin - 1,
      xMax: bornes.xMax + 1,
      yMin: bornes.yMin - 1,
      yMax: bornes.yMax + 1,
      grilleX: false,
      grilleY: false,
      grilleSecondaire: true,
      grilleSecondaireYDistance: 1,
      grilleSecondaireXDistance: 1,
    })

    const courbe1 = maSpline.courbe({
      epaisseur: 1.5,
      ajouteNoeuds: false,
      color: bleuMathalea,
    })

    // Nom de la courbe, à droite de son extrémité
    const nomCourbe = latex2d(
      '\\mathscr{C}_f',
      maSpline.x[4] + 0.5,
      maSpline.y[4] + 0.6,
      { color: bleuMathalea },
    )
    const objetsEnonce = [repere1, courbe1, nomCourbe]

    const figure = mathalea2d(
      Object.assign(
        { pixelsParCm: 30, scale: 0.6, center: !context.isHtml },
        {
          xmin: bornes.xMin - 1,
          ymin: bornes.yMin - 1,
          xmax: bornes.xMax + 1,
          ymax: bornes.yMax + 1,
        },
      ),
      objetsEnonce,
      o,
    )

    const x0 = maSpline.x[0]
    const xExtremum = maSpline.x[2]
    const x2 = maSpline.x[4]
    const y0 = maSpline.y[0]
    const yExtremum = maSpline.y[2]
    const y2 = maSpline.y[4]
    this.typeTableau = 'signes'
    this.noeuds = maSpline.x.map((x, index) => ({ x, y: maSpline.y[index] }))

    this.enonce = `Soit la fonction $f$ représentée ci-dessous par la courbe $\\mathscr{C}_f$.<br>${figure}<br><br>`
    this.enonce += 'Le tableau de signes de la fonction $f$ est :'

    // Tableau de signes correct
    const tableauSignesCorrect = (couleur?: string) =>
      tableauSignesFonction(
        ((x: number) => maSpline.fonction(x)) as (
          x: number | FractionEtendue,
        ) => number,
        bornes.xMin,
        bornes.xMax,
        { step: 0.5, tolerance: 0.1, couleur },
      )
    const tableauSignes1 = tableauSignesCorrect()

    // Tableau de signes faux : confond signe et variation
    // Utilise la dérivée pour obtenir le sens de variation
    const tableauSignes2 = tableauSignesFonction(
      ((x: number) => maSpline.derivee(x)) as (
        x: number | FractionEtendue,
      ) => number,
      bornes.xMin,
      bornes.xMax,
      { step: 0.5, tolerance: 0.1 },
    )

    // Construction du tableau de variations
    let ligneVar, ligneVarInverse
    if (y0 < yExtremum && yExtremum > y2) {
      // Croissant puis décroissant (maximum)
      ligneVar = [
        'Var',
        10,
        `-/$${texNombre(y0)}$`,
        10,
        `+/$${texNombre(yExtremum)}$`,
        10,
        `-/$${texNombre(y2)}$`,
        10,
      ]
      ligneVarInverse = [
        'Var',
        10,
        `-/$${texNombre(x0)}$`,
        10,
        `+/$${texNombre(xExtremum)}$`,
        10,
        `-/$${texNombre(x2)}$`,
        10,
      ]
    } else {
      // Décroissant puis croissant (minimum)
      ligneVar = [
        'Var',
        10,
        `+/$${texNombre(y0)}$`,
        10,
        `-/$${texNombre(yExtremum)}$`,
        10,
        `+/$${texNombre(y2)}$`,
        10,
      ]
      ligneVarInverse = [
        'Var',
        10,
        `+/$${texNombre(x0)}$`,
        10,
        `-/$${texNombre(xExtremum)}$`,
        10,
        `+/$${texNombre(x2)}$`,
        10,
      ]
    }

    const tableauVar1 = tableauDeVariation({
      tabInit: [
        [
          ['$x$', 1.5, 10],
          ['$f(x)$', 4, 30],
        ],
        [
          `$${texNombre(x0)}$`,
          10,
          `$${texNombre(xExtremum)}$`,
          10,
          `$${texNombre(x2)}$`,
          10,
        ],
      ],
      tabLines: [ligneVar],
      espcl: 2.5,
      deltacl: 1,
      lgt: 2,
      hauteurLignes: [15, 15],
    })

    // Distracteur : images et antécédents inversés
    const tableauVar2 = tableauDeVariation({
      tabInit: [
        [
          ['$x$', 1.5, 10],
          ['$f(x)$', 4, 30],
        ],
        [
          `$${texNombre(y0)}$`,
          10,
          `$${texNombre(yExtremum)}$`,
          10,
          `$${texNombre(y2)}$`,
          10,
        ],
      ],
      tabLines: [ligneVarInverse],
      espcl: 2.5,
      deltacl: 1,
      lgt: 2,
      hauteurLignes: [15, 15],
    })

    this.reponses = [tableauSignes1, tableauSignes2, tableauVar1, tableauVar2]

    this.reponseCourteExplicite = tableauSignesCorrect(orangeMathalea)
    this.correction = `La fonction $f$ est définie sur $[${texNombre(x0)}\\,;\\,${texNombre(x2)}]$.<br>
Les images $f(x)$ sont positives lorsque la courbe est au-dessus de l'axe des abscisses et elles sont négatives lorsque la courbe est en dessous de l'axe des abscisses.<br>
${this.reponseCourteExplicite}`
  }

  versionAleatoire: () => void = () => {
    const typeTableau = randint(0, 1) // 0: signes, 1: variations

    const courbeBase = [
      { x: -5, y: 2, deriveeGauche: -1, deriveeDroit: -1 },
      { x: -2, y: 0, deriveeGauche: -1, deriveeDroit: -1 },
      { x: 0, y: -2, deriveeGauche: 0, deriveeDroit: 0 },
      { x: 2, y: 0, deriveeGauche: 1, deriveeDroit: 1 },
      { x: 4, y: 3, deriveeGauche: 1, deriveeDroit: 1 },
    ]

    const coeffX = choice([-1, 1])
    const coeffY = choice([-1, 1])
    const deltaX = choice([-1, 0, 1])

    const noeuds = courbeBase.map((noeud) => ({
      x: noeud.x * coeffX + deltaX,
      y: noeud.y * coeffY,
      deriveeGauche: noeud.deriveeGauche * coeffX * coeffY,
      deriveeDroit: noeud.deriveeDroit * coeffX * coeffY,
      isVisible: false,
    }))

    const maSpline = spline(noeuds)
    const o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)

    const bornes = maSpline.trouveMaxes()
    const repere1 = repere({
      xMin: bornes.xMin - 1,
      xMax: bornes.xMax + 1,
      yMin: bornes.yMin - 1,
      yMax: bornes.yMax + 1,
      grilleX: false,
      grilleY: false,
      grilleSecondaire: true,
      grilleSecondaireYDistance: 1,
      grilleSecondaireXDistance: 1,
    })

    const courbe1 = maSpline.courbe({
      epaisseur: 1.5,
      ajouteNoeuds: false,
      color: bleuMathalea,
    })

    // Nom de la courbe, à droite de son extrémité
    const nomCourbe = latex2d(
      '\\mathscr{C}_f',
      maSpline.x[4] + 0.5,
      maSpline.y[4] + 0.6,
      { color: bleuMathalea },
    )
    const objetsEnonce = [repere1, courbe1, nomCourbe]

    const figure = mathalea2d(
      Object.assign(
        { pixelsParCm: 30, scale: 0.6, center: !context.isHtml },
        {
          xmin: bornes.xMin - 1,
          ymin: bornes.yMin - 1,
          xmax: bornes.xMax + 1,
          ymax: bornes.yMax + 1,
        },
      ),
      objetsEnonce,
      o,
    )

    const x0 = maSpline.x[0]
    const xExtremum = maSpline.x[2]
    const x2 = maSpline.x[4]
    const y0 = maSpline.y[0]
    const yExtremum = maSpline.y[2]
    const y2 = maSpline.y[4]
    this.typeTableau = typeTableau === 0 ? 'signes' : 'variations'
    this.noeuds = maSpline.x.map((x, index) => ({ x, y: maSpline.y[index] }))

    // Tableau de signes correct
    const tableauSignesCorrect = (couleur?: string) =>
      tableauSignesFonction(
        ((x: number) => maSpline.fonction(x)) as (
          x: number | FractionEtendue,
        ) => number,
        bornes.xMin,
        bornes.xMax,
        { step: 0.5, tolerance: 0.1, couleur },
      )
    const tableauSignes1 = tableauSignesCorrect()

    // Tableau de signes faux : confond signe et variation
    // Utilise la dérivée pour obtenir le sens de variation
    const tableauSignes2 = tableauSignesFonction(
      ((x: number) => maSpline.derivee(x)) as (
        x: number | FractionEtendue,
      ) => number,
      bornes.xMin,
      bornes.xMax,
      { step: 0.5, tolerance: 0.1 },
    )

    // Construction du tableau de variations
    let sensVar, extremumType, ligneVar, ligneVarInverse

    if (y0 < yExtremum && yExtremum > y2) {
      // Croissant puis décroissant (maximum)
      sensVar = 'croissante puis décroissante'
      extremumType = 'maximum'
      ligneVar = [
        'Var',
        10,
        `-/$${texNombre(y0)}$`,
        10,
        `+/$${texNombre(yExtremum)}$`,
        10,
        `-/$${texNombre(y2)}$`,
        10,
      ]
      ligneVarInverse = [
        'Var',
        10,
        `-/$${texNombre(x0)}$`,
        10,
        `+/$${texNombre(xExtremum)}$`,
        10,
        `-/$${texNombre(x2)}$`,
        10,
      ]
    } else {
      // Décroissant puis croissant (minimum)
      sensVar = 'décroissante puis croissante'
      extremumType = 'minimum'
      ligneVar = [
        'Var',
        10,
        `+/$${texNombre(y0)}$`,
        10,
        `-/$${texNombre(yExtremum)}$`,
        10,
        `+/$${texNombre(y2)}$`,
        10,
      ]
      ligneVarInverse = [
        'Var',
        10,
        `+/$${texNombre(x0)}$`,
        10,
        `-/$${texNombre(xExtremum)}$`,
        10,
        `+/$${texNombre(x2)}$`,
        10,
      ]
    }

    // Tableau de variations correct
    const tableauVarCorrect = (couleur?: string) =>
      tableauDeVariation({
        tabInit: [
          [
            ['$x$', 1.5, 10],
            ['$f(x)$', 4, 30],
          ],
          [
            `$${texNombre(x0)}$`,
            10,
            `$${texNombre(xExtremum)}$`,
            10,
            `$${texNombre(x2)}$`,
            10,
          ],
        ],
        tabLines: [ligneVar],
        espcl: 2.5,
        deltacl: 1,
        lgt: 2,
        hauteurLignes: [15, 15],
        couleur,
      })
    const tableauVar1Correct = tableauVarCorrect()

    // Distracteur : images et antécédents inversés
    const tableauVarInverse = tableauDeVariation({
      tabInit: [
        [
          ['$x$', 1.5, 10],
          ['$f(x)$', 4, 30],
        ],
        [
          `$${texNombre(y0)}$`,
          10,
          `$${texNombre(yExtremum)}$`,
          10,
          `$${texNombre(y2)}$`,
          10,
        ],
      ],
      tabLines: [ligneVarInverse],
      espcl: 2.5,
      deltacl: 1,
      lgt: 2,
      hauteurLignes: [15, 15],
    })

    if (typeTableau === 0) {
      // Question sur tableau de signes
      this.enonce = `Soit la fonction $f$ représentée ci-dessous par la courbe $\\mathscr{C}_f$.<br>${figure}<br><br>`
      this.enonce += 'Le tableau de signes de la fonction $f$ est :'

      this.reponses = [
        tableauSignes1,
        tableauSignes2,
        tableauVar1Correct,
        tableauVarInverse,
      ]

      this.reponseCourteExplicite = tableauSignesCorrect(orangeMathalea)
      let tableauFinal = this.reponseCourteExplicite
      if (this.interactif) {
        this.compteurTableauxCorriges++
        tableauFinal = creerTableauSignesVariations(
          configCorrige(this.configTableauSignes(), { enEvidence: true }),
          {
            readonly: true,
            id: `tableauCorrigeEx${this.numeroExercice}N${this.compteurTableauxCorriges}`,
          },
        )
      }
      this.correction = `La fonction $f$ est définie sur $[${texNombre(x0)}\\,;\\,${texNombre(x2)}]$.<br>
Les images $f(x)$ sont positives lorsque la courbe est au-dessus de l'axe des abscisses et elles sont négatives lorsque la courbe est en dessous de l'axe des abscisses.<br>
${tableauFinal}`
    } else {
      // Question sur tableau de variations
      this.enonce = `Soit la fonction $f$ représentée ci-dessous par la courbe $\\mathscr{C}_f$.<br>${figure}<br><br>`
      this.enonce += 'Le tableau de variations de la fonction $f$ est :'

      this.reponses = [
        tableauVar1Correct,
        tableauVarInverse,
        tableauSignes1,
        tableauSignes2,
      ]

      this.reponseCourteExplicite = tableauVarCorrect(orangeMathalea)
      let tableauFinal = this.reponseCourteExplicite
      if (this.interactif) {
        this.compteurTableauxCorriges++
        tableauFinal = creerTableauSignesVariations(
          configCorrige(this.configTableauSignes(), { enEvidence: true }),
          {
            readonly: true,
            id: `tableauCorrigeEx${this.numeroExercice}N${this.compteurTableauxCorriges}`,
          },
        )
      }
      this.correction = `La fonction $f$ est définie sur $[${texNombre(x0)}\\,;\\,${texNombre(x2)}]$.<br>
La fonction est ${sensVar}.<br>
Elle atteint un ${extremumType} en $x=${texNombre(xExtremum)}$.<br>
${tableauFinal}`
    }
  }

  constructor() {
    super()
    this.enonceCourt = () =>
      this.enonce.replace(
        /Le tableau de (signes|variations) de la fonction \$f\$ est :/,
        `${this.interactif ? 'Compléter' : 'Déterminer'} le tableau de $1 de la fonction $$f$$.`,
      )
    this.versionAleatoire()
    this.options.vertical = true
  }
}
