import { addMultiMathfield } from '../../../lib/customElements/MultiMathfield'
import { createList } from '../../../lib/format/lists'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import ce from '../../../lib/interactif/comparisonFunctions'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import {
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  reduireAxPlusByPlusC,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { numAlpha } from '../../../lib/outils/outilString'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Déterminer des points avec des vecteurs orthogonaux'
export const dateDePublication = '05/05/2026'
export const interactifReady = true

/**
 * Déterminer un point D puis l'ensemble des points D tels que deux vecteurs soient orthogonaux.
 * @author Nathan Scheinmann
 */
export const uuid = '6f93a'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['3G95-16'],
}

function coord(x: number, y: number): string {
  return `(${x}\\;;\\;${y})`
}

export default class PointsVecteursOrthogonaux extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const xA = randint(-6, 6)
      const yA = randint(-6, 6)
      const ux = randint(-5, 5, 0)
      const uy = randint(-5, 5, 0)
      const xB = xA + ux
      const yB = yA + uy
      const xC = randint(-6, 6, [xA, xB])
      const yC = randint(-6, 6, [yA, yB])
      const xD = xC - uy
      const yD = yC + ux
      const constanteEquation = -ux * xC - uy * yC
      const produitScalaire = ux * (xD - xC) + uy * (yD - yC)
      const coefficientDirecteur = new FractionEtendue(-ux, uy).simplifie()
      const ordonneeOrigine = new FractionEtendue(
        -constanteEquation,
        uy,
      ).simplifie()
      const equationReduite = reduireAxPlusB(
        coefficientDirecteur,
        ordonneeOrigine,
      )
      const equationCartesienne = reduireAxPlusByPlusC(
        ux,
        uy,
        constanteEquation,
      )
      const sousQuestions = [
        `Trouver un point $D$ tel que $\\overrightarrow{AB}\\perp\\overrightarrow{CD}$`,
        `Déterminer l'équation de la droite $d$ perpendiculaire à $(AB)$ et passant par $C$`,
      ]

      let texte = `Dans un repère orthonormé, on considère les points $A${coord(xA, yA)}$, $B${coord(xB, yB)}$ et $C${coord(xC, yC)}$.<br>`
      const avecChamps = this.interactif && context.isHtml

      if (avecChamps) {
        texte += addMultiMathfield(this, i, {
          dataTemplate: `a) ${sousQuestions[0]} : $D($%{champ1}$\\;;\\;$%{champ2}$)$.<br>
b) ${sousQuestions[1]} : $d\\;:\\;y=$%{champ3}.`,
          dataOptions: {
            champ1: {
              keyboard: KeyboardType.clavierDeBaseAvecFraction,
              minWidth: 40,
            },
            champ2: {
              keyboard: KeyboardType.clavierDeBaseAvecFraction,
              minWidth: 40,
            },
            champ3: {
              keyboard: KeyboardType.clavierDeBaseAvecVariable,
              minWidth: 100,
            },
          },
        })
      } else {
        texte += createList({
          items: [
            `${sousQuestions[0]} : $D(\\ldots\\;;\\;\\ldots)$.`,
            `${sousQuestions[1]} : $d\\;:\\;y=\\ldots$.`,
          ],
          style: 'alpha',
        })
      }

      const texteCorr = `On commence par calculer les coordonnées du vecteur $\\overrightarrow{AB}$ :<br>
      $\\overrightarrow{AB}\\begin{pmatrix}${xB}-${ecritureParentheseSiNegatif(xA)}\\\\${yB}-${ecritureParentheseSiNegatif(yA)}\\end{pmatrix}
      =\\begin{pmatrix}${ux}\\\\${uy}\\end{pmatrix}$.<br><br>
      ${numAlpha(0)} Un vecteur orthogonal à $\\overrightarrow{AB}\\begin{pmatrix}${ux}\\\\${uy}\\end{pmatrix}$ est
      $\\begin{pmatrix}${-uy}\\\\${ux}\\end{pmatrix}$, car
      $${ux}\\times ${ecritureParentheseSiNegatif(-uy)}+${ecritureParentheseSiNegatif(uy)}\\times ${ecritureParentheseSiNegatif(ux)}=${produitScalaire}$.<br>
      On peut donc choisir $D(d_1\\;;\\;d_2)$ tel que $\\overrightarrow{CD}\\begin{pmatrix}${-uy}\\\\${ux}\\end{pmatrix}$.<br>
      Puisque $\\overrightarrow{CD}\\begin{pmatrix}d_1-${ecritureParentheseSiNegatif(xC)}\\\\d_2-${ecritureParentheseSiNegatif(yC)}\\end{pmatrix}=\\begin{pmatrix}${-uy}\\\\${ux}\\end{pmatrix}$, on obtient $d_1=${xC}${-uy >= 0 ? '+' : ''}${-uy}=${xC - uy}$ et $d_2=${yC}${ux >= 0 ? '+' : ''}${ux}=${yC + ux}$, soit $D${miseEnEvidence(coord(xC - uy, yC + ux))}$.<br><br>
      ${numAlpha(1)} Soit $M(x\\;;\\;y)$ un point de $d$. Alors
      $\\overrightarrow{CM}\\begin{pmatrix}x-${ecritureParentheseSiNegatif(xC)}\\\\y-${ecritureParentheseSiNegatif(yC)}\\end{pmatrix}$.<br>
      La condition $d\\perp(AB)$ équivaut à $\\overrightarrow{AB}\\perp\\overrightarrow{CM}$, soit
      $\\overrightarrow{AB}\\cdot\\overrightarrow{CM}=0$, donc :<br>
      $${ux}(x-${ecritureParentheseSiNegatif(xC)})+${ecritureParentheseSiNegatif(uy)}(y-${ecritureParentheseSiNegatif(yC)})=0$.<br>
      On obtient l'équation $${equationCartesienne}=0$.<br>
      Comme $${uy}\\neq0$, cette équation peut aussi s'écrire $y=${equationReduite}$.<br>
      La droite $d$ a donc pour équation $d\\;:\\;y=${miseEnEvidence(equationReduite)}$.`

      const champX: { value?: number } = {}
      handleAnswers(
        this,
        i,
        {
          bareme: (listePoints: number[]) => [
            Math.min(listePoints[0], listePoints[1]) + listePoints[2],
            2,
          ],
          champ1: {
            value: String(xD),
            compare: (input) => {
              const parsed = ce.parse(input).re
              champX.value = parsed ?? NaN
              return { isOk: parsed != null && isFinite(parsed) }
            },
          },
          champ2: {
            value: String(yD),
            compare: (input) => {
              const y = ce.parse(input).re
              const x = champX.value
              if (x === undefined || !isFinite(x) || y == null || !isFinite(y))
                return { isOk: false }
              return { isOk: Math.abs(ux * (x - xC) + uy * (y - yC)) < 1e-9 }
            },
          },
          champ3: {
            value: equationReduite,
            options: { fonction: true, variable: 'x' },
          },
        },
        { formatInteractif: 'multi-mathfield' },
      )

      if (this.questionJamaisPosee(i, xA, yA, xB, yB, xC, yC)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
