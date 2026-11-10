// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 90460 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { repere } from '../../lib/2d/reperes'
import { latex2d } from '../../lib/2d/textes'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'

import { courbe } from '../../lib/2d/Courbe'
import { bleuMathalea } from '../../lib/colors'
import { deuxColonnes } from '../../lib/format/miseEnPage'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '04/10/2025'
export const uuid = '90460'
/**
 *
 * @author Gilles Mora
 */
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Résoudre graphiquement une inéquation du type $f(x)<g(x)$ (2)'
export default class auto1AF4eOld extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    const o = latex2d('\\text{O}', -0.3, -0.3, { letterSize: 'scriptsize' })
    const symbole: string = '>' // Ajouter une valeur par défaut
    let texteSolution: string = '' // Ajouter une valeur par défaut
    let solutionCorrecte: string = '' // Ajouter une valeur par défaut
    let solutionFauxCrochets: string = ''
    let solutionInverse1: string = ''
    let solutionInverse2: string = ''
    const a = -2
    const b = 3
    const f = function (x: number) {
      return x ** 2 - 4
    }
    const m = (f(b) - f(a)) / (b - a)
    const p = f(a) - m * a

    const g = function (x: number) {
      return m * x + p
    }
    const C = latex2d('C_f', 6.5, 9, { color: bleuMathalea })
    const D = latex2d('C_g', 8, g(4) - 1, { color: 'red' })
    const r = repere({
      yUnite: 1,
      xUnite: 2,
      xMin: -5,
      yMin: -5,
      yMax: 10,
      xMax: 5,
      thickHauteur: 0.2,
      xThickMin: -5,
      xLabelMin: -4,
      xLabelMax: 4,
      yLabelMax: 9,
      yLabelMin: -4,
      grilleXDistance: 2,
      grilleSecondaire: true,
      grilleSecondaireOpacite: 1,
      grilleSecondaireYDistance: 1,
      grilleSecondaireXDistance: 2,
      yThickMin: -5,
      axesEpaisseur: 2,
      grilleSecondaireYMin: -10.1,
      grilleSecondaireYMax: 10.1,
      grilleSecondaireXMin: -5.1,
      grilleSecondaireXMax: 10.1,
      xLabelEcart: 0.6,
      yLabelEcart: 0.6,
    })

    // Définition des symboles et crochets selon le type d'inéquation

    solutionCorrecte = `$[-4\\,;\\,-2[\\cup ]${b}\\,;\\,4]$`
    solutionFauxCrochets = `$]${a}\\,;\\,${b}[$`
    solutionInverse1 = `$[${a}\\,;\\,${b}]$`
    solutionInverse2 = `$]-4\\,;\\,${a}[\\cup ]${b}\\,;\\,4[$`
    texteSolution = `au-dessus de $C_g$, soit $${miseEnEvidence(`[-4\\,;\\,${a}[\\cup ]${b}\\,;\\,4]`)}$`

    this.enonce = `${deuxColonnes(
      `Sur la figure ci-contre, $C_f$ et $C_g$ représentent respectivement les fonctions $f$ et $g$ définies sur $[-4\\,;\\,4]$.<br>`,
      mathalea2d(
        {
          xmin: -10,
          xmax: 10,
          ymin: -5,
          ymax: 10,
          pixelsParCm: 20,
          scale: 0.45,
          center: !context.isHtml,
        },
        r,
        o,
        C,
        D,
        courbe(f, {
          repere: r,
          xMin: -5,
          xMax: 5,
          color: bleuMathalea,
          epaisseur: 2,
        }),
        courbe(g, { repere: r, xMin: -4, xMax: 4, color: 'red', epaisseur: 2 }),
      ),
    )}`
    this.enonce += `L'ensemble des solutions de l'inéquation $f(x)${symbole} g(x)$ est : `

    this.reponses = [
      solutionCorrecte,
      solutionFauxCrochets,
      solutionInverse1,
      solutionInverse2,
    ]
    this.correction = `Les solutions de l'inéquation sont les abscisses respectives des points de $C_f$ qui se situent ${texteSolution}.`
  }

  versionAleatoire = () => {
    let f: (x: number) => number
    let g: (x: number) => number
    let symbole: string = '<' // Ajouter une valeur par défaut
    let texteSolution: string = '' // Ajouter une valeur par défaut
    let solutionCorrecte: string = '' // Ajouter une valeur par défaut
    let solutionFauxCrochets: string = ''
    let solutionInverse1: string = ''
    let solutionInverse2: string = ''
    const a = randint(-3, -1)
    const b = randint(1, 3, -a)
    const cas = randint(1, 2) // 4 cas maintenant
    const typeInequation = randint(1, 4) // 1: <, 2: >, 3: <=, 4: >=
    const o = latex2d('\\text{O}', -0.3, -0.3, { letterSize: 'scriptsize' })

    switch (cas) {
      // ========== CAS 1 : Parabole avec bras vers le haut ==========
      case 1: {
        f = function (x: number) {
          return x ** 2 - 4
        }
        const m = (f(b) - f(a)) / (b - a)
        const p = f(a) - m * a

        g = function (x) {
          return m * x + p
        }

        const C = latex2d('C_f', 6.5, 9, { color: bleuMathalea })
        const D =
          g(4) < -4
            ? latex2d('C_g', -8, g(-4) - 1, { color: 'red' })
            : latex2d('C_g', 8, g(4) - 1, { color: 'red' })
        const r = repere({
          yUnite: 1,
          xUnite: 2,
          xMin: -5,
          yMin: -5,
          yMax: 10,
          xMax: 5,
          thickHauteur: 0.2,
          xThickMin: -5,
          xLabelMin: -4,
          xLabelMax: 4,
          yLabelMax: 9,
          yLabelMin: -4,
          grilleXDistance: 2,
          grilleSecondaire: true,
          grilleSecondaireOpacite: 1,
          grilleSecondaireYDistance: 1,
          grilleSecondaireXDistance: 2,
          yThickMin: -5,
          axesEpaisseur: 2,
          grilleSecondaireYMin: -10.1,
          grilleSecondaireYMax: 10.1,
          grilleSecondaireXMin: -5.1,
          grilleSecondaireXMax: 10.1,
          xLabelEcart: 0.6,
          yLabelEcart: 0.6,
        })

        // Définition des symboles et crochets selon le type d'inéquation
        if (typeInequation === 1) {
          // f(x) < g(x)
          symbole = '<'
          solutionCorrecte = `$]${a}\\,;\\,${b}[$`
          solutionFauxCrochets = `$[-4\\,;\\,${a}]\\cup [${b}\\,;\\,4]$`
          solutionInverse1 = `$[-4\\,;\\,${a}[\\cup ]${b}\\,;\\,4]$`
          solutionInverse2 = `$[${a}\\,;\\,${b}]$`
          texteSolution = `en dessous de $C_g$, soit $${miseEnEvidence(`]${a}\\,;\\,${b}[`)}$`
        } else if (typeInequation === 2) {
          // f(x) > g(x)
          symbole = '>'
          solutionCorrecte = `$[-4\\,;\\,${a}[\\cup ]${b}\\,;\\,4]$`
          solutionFauxCrochets = `$[${a}\\,;\\,${b}]$`
          solutionInverse1 = `$]${a}\\,;\\,${b}[$`
          solutionInverse2 = `$[-4\\,;\\,${a}]\\cup [${b}\\,;\\,4]$`
          texteSolution = `au-dessus de $C_g$, soit $${miseEnEvidence(`[-4\\,;\\,${a}[\\cup ]${b}\\,;\\,4]`)}$`
        } else if (typeInequation === 3) {
          // f(x) <= g(x)
          symbole = '\\leqslant'
          solutionCorrecte = `$[${a}\\,;\\,${b}]$`
          solutionFauxCrochets = `$[-4\\,;\\,${a}[\\cup ]${b}\\,;\\,4]$`
          solutionInverse1 = `$[-4\\,;\\,${a}]\\cup [${b}\\,;\\,4]$`
          solutionInverse2 = `$]${a}\\,;\\,${b}[$`
          texteSolution = `en dessous ou sur $C_g$, soit $${miseEnEvidence(`[${a}\\,;\\,${b}]`)}$`
        } else {
          // f(x) >= g(x)
          symbole = '\\geqslant'
          solutionCorrecte = `$[-4\\,;\\,${a}]\\cup [${b}\\,;\\,4]$`
          solutionFauxCrochets = `$]${a}\\,;\\,${b}[$`
          solutionInverse1 = `$[${a}\\,;\\,${b}]$`
          solutionInverse2 = `$[-4\\,;\\,${a}[\\cup ]${b}\\,;\\,4]$`
          texteSolution = `au-dessus ou sur $C_g$, soit $${miseEnEvidence(`[-4\\,;\\,${a}]\\cup [${b}\\,;\\,4]`)}$`
        }

        this.enonce = `${deuxColonnes(
          `Sur la figure ci-contre, $C_f$ et $C_g$ représentent respectivement les fonctions $f$ et $g$ définies sur $[-4\\,;\\,4]$.<br>`,
          mathalea2d(
            {
              xmin: -10,
              xmax: 10,
              ymin: -5,
              ymax: 10,
              pixelsParCm: 20,
              scale: 0.45,
              center: !context.isHtml,
            },
            r,
            o,
            C,
            D,
            courbe(f, {
              repere: r,
              xMin: -5,
              xMax: 5,
              color: bleuMathalea,
              epaisseur: 2,
            }),
            courbe(g, {
              repere: r,
              xMin: -4,
              xMax: 4,
              color: 'red',
              epaisseur: 2,
            }),
          ),
        )}`
        break
      }

      // ========== CAS 2 : Parabole avec bras vers le bas ==========
      case 2: {
        f = function (x: number) {
          return -1 * x ** 2 + 4
        }
        const m = (f(b) - f(a)) / (b - a)
        const p = f(a) - m * a

        g = function (x) {
          return m * x + p
        }

        const C = latex2d('C_f', 8, -8, { color: bleuMathalea })
        const D =
          g(3) > 4
            ? latex2d('C_g', -8, g(-4) - 1, { color: 'red' })
            : latex2d('C_g', 8.5, g(3) - 1, { color: 'red' })
        const r = repere({
          yUnite: 1,
          xUnite: 2,
          xMin: -5,
          yMin: -10,
          yMax: 5,
          xMax: 5,
          thickHauteur: 0.2,
          xThickMin: -5,
          xLabelMin: -4,
          xLabelMax: 4,
          yLabelMax: 4,
          yLabelMin: -9,
          grilleXDistance: 2,
          grilleSecondaire: true,
          grilleSecondaireOpacite: 1,
          grilleSecondaireYDistance: 1,
          grilleSecondaireXDistance: 2,
          yThickMin: -10,
          axesEpaisseur: 2,
          grilleSecondaireYMin: -10.1,
          grilleSecondaireYMax: 10.1,
          grilleSecondaireXMin: -10.1,
          grilleSecondaireXMax: 10.1,
          xLabelEcart: 0.6,
          yLabelEcart: 0.6,
        })

        if (typeInequation === 1) {
          // f(x) < g(x)
          symbole = '<'
          solutionCorrecte = `$[-4\\,;\\,${a}[\\cup ]${b}\\,;\\,4]$`
          solutionFauxCrochets = `$[${a}\\,;\\,${b}]$`
          solutionInverse1 = `$]${a}\\,;\\,${b}[$`
          solutionInverse2 = `$[-4\\,;\\,${a}]\\cup [${b}\\,;\\,4]$`
          texteSolution = `en dessous de $C_g$, soit $${miseEnEvidence(`[-4\\,;\\,${a}[\\cup ]${b}\\,;\\,4]`)}$`
        } else if (typeInequation === 2) {
          // f(x) > g(x)
          symbole = '>'
          solutionCorrecte = `$]${a}\\,;\\,${b}[$`
          solutionFauxCrochets = `$[-4\\,;\\,${a}]\\cup [${b}\\,;\\,4]$`
          solutionInverse1 = `$[-4\\,;\\,${a}[\\cup ]${b}\\,;\\,4]$`
          solutionInverse2 = `$[${a}\\,;\\,${b}]$`
          texteSolution = `au-dessus de $C_g$, soit $${miseEnEvidence(`]${a}\\,;\\,${b}[`)}$`
        } else if (typeInequation === 3) {
          // f(x) <= g(x)
          symbole = '\\leqslant'
          solutionCorrecte = `$[-4\\,;\\,${a}]\\cup [${b}\\,;\\,4]$`
          solutionFauxCrochets = `$]${a}\\,;\\,${b}[$`
          solutionInverse1 = `$[${a}\\,;\\,${b}]$`
          solutionInverse2 = `$[-4\\,;\\,${a}[\\cup ]${b}\\,;\\,4]$`
          texteSolution = `en dessous ou sur $C_g$, soit $${miseEnEvidence(`[-4\\,;\\,${a}]\\cup [${b}\\,;\\,4]`)}$`
        } else {
          // f(x) >= g(x)
          symbole = '\\geqslant'
          solutionCorrecte = `$[${a}\\,;\\,${b}]$`
          solutionFauxCrochets = `$[-4\\,;\\,${a}[\\cup ]${b}\\,;\\,4]$`
          solutionInverse1 = `$[-4\\,;\\,${a}]\\cup [${b}\\,;\\,4]$`
          solutionInverse2 = `$]${a}\\,;\\,${b}[$`
          texteSolution = `au-dessus ou sur $C_g$, soit $${miseEnEvidence(`[${a}\\,;\\,${b}]`)}$`
        }

        this.enonce = `${deuxColonnes(
          `Sur la figure ci-contre, $C_f$ et $C_g$ représentent respectivement les fonctions $f$ et $g$ définies sur $[-4\\,;\\,4]$.<br>`,
          mathalea2d(
            {
              xmin: -10,
              xmax: 10,
              ymin: -10,
              ymax: 5,
              pixelsParCm: 20,
              scale: 0.45,
              center: !context.isHtml,
            },
            r,
            o,
            C,
            D,
            courbe(f, {
              repere: r,
              xMin: -5,
              xMax: 5,
              color: bleuMathalea,
              epaisseur: 2,
            }),
            courbe(g, {
              repere: r,
              xMin: -4,
              xMax: 4,
              color: 'red',
              epaisseur: 2,
            }),
          ),
        )}`
        break
      }
    }

    this.enonce += `L'ensemble des solutions de l'inéquation $f(x)${symbole} g(x)$ est : `

    this.reponses = [
      solutionCorrecte,
      solutionFauxCrochets,
      solutionInverse1,
      solutionInverse2,
    ]
    this.correction = `Les solutions de l'inéquation sont les abscisses respectives des points de $C_f$ qui se situent ${texteSolution}.`
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
