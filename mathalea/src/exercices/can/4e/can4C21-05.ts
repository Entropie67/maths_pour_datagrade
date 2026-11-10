import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Décomposer une fraction'
export const interactifReady = true

export const amcReady = true
export const dateDePublication = '09/09/2023'
export const dateDeModifImportante = '08/11/2026'

/**
 * @author Gilles Mora

 */

export const uuid = '97008'

export const refs = {
  'fr-fr': [
    'can4C21-05',
    '5N3autoG-flash1',
    'CM1N2B-flash1',
    'CM2N2B-flash1',
    '2N30-flash2',
  ],
  'fr-ch': [],
}
export default class DecomposerFraction extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatInteractif = 'fillInTheBlank'
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    const listeFractions = [
      [8, 7],
      [10, 3],
      [20, 3],
      [11, 4],
      [31, 4],
      [29, 5],
      [27, 5],
      [38, 5],
      [41, 5],
      [11, 6],
      [57, 7],
      [19, 7],
      [29, 7],
      [30, 7],
      [40, 7],
      [50, 7],
      [60, 7],
      [13, 8],
      [35, 8],
      [51, 8],
      [79, 8],
      [7, 2],
      [10, 9],
      [20, 9],
      [49, 9],
      [91, 9],
      [70, 9],
      [80, 9],
      [19, 10],
      [27, 10],
      [73, 10],
      [97, 10],
      [51, 10],
      [13, 11],
      [9, 4],
      [41, 7],
      [61, 8],
      [15, 7],
      [15, 4],
      [7, 4],
      [29, 4],
      [79, 9],
      [11, 3],
      [32, 9],
      [11, 2],
    ]
    const fraction1 = this.quotaChoice('fraction1', listeFractions)
    const n = fraction1[0]
    const d = fraction1[1]
    const entier = Math.trunc(n / d)
    const reste = n - entier * d
    const frac = new FractionEtendue(reste, d)
    this.consigne = "Écrire chaque fraction sous la forme de la somme d'un nombre entier et d'une fraction inférieure à $1$."
    this.question = `\\dfrac{${n}}{${d}} = %{champ1} + %{champ2}`
    this.correction = `Le plus grand multiple de $${d}$ inférieur à $${n}$ est $${entier * d}$. <br>
    Ainsi, $\\dfrac{${n}}{${d}}=\\dfrac{${entier * d}}{${d}}+\\dfrac{${reste}}{${d}}=${miseEnEvidence(`${entier}+${frac.texFractionSimplifiee}`)}$.`
    // Pour la sortie « course aux nombres » (PDF) : la consigne dans la
    // colonne énoncé, la somme à trous (toujours en pointillés, quel que
    // soit context.isHtml) dans la colonne réponse.
    this.canEnonce = `Écrire $\\dfrac{${n}}{${d}}$ sous la forme de la somme d'un nombre entier et d'une fraction inférieure à $1$.`
    this.canReponseACompleter = `$\\dfrac{${n}}{${d}} = \\ldots + \\ldots$`

    const bareme = (listePoints: number[]): [number, number] => [
      Math.min(listePoints[0], listePoints[1]),
      1,
    ]
    this.reponse = {
      bareme,
      champ1: { value: String(entier) },
      champ2: { value: frac.texFraction, options: { fractionEgale: true } },
    }
  }
}
