import { distracteursDistincts } from '../../../lib/interactif/qcmDistractors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

import { texNombre } from '../../../lib/outils/texNombre'

import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../../lib/outils/ecritures'
export const titre =
  "Calculer l'ordonnée d'un point sur une droite (non définie explicitement)"
export const interactifReady = true

export const dateDePublication = '06/08/2025'
export const dateDeModifImportante = '30/10/2026'
export const uuid = '2bef5'
export const refs = {
  'fr-fr': ['can2G30-06', '2G31-flash3'],
  'fr-ch': [''],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class ordonneePointDroite extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.versionQcmDisponible = true
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.spacingCorr = 1.5
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    const coeff = this.quotaRandint('coeff', -9, 9, [0]) / 10
    const a = this.quotaRandint('a', -10, 10, [0])
    const absB = this.quotaRandint('absB', 1, 3)

    this.question = ` Dans un repère du plan, on considère la droite $D$ de coefficient directeur $${texNombre(coeff, 1)}$, passant par le point $A(0\\,;\\,${a})$.<br>
      On note $B$ le point de la droite $D$ dont l'abscisse est égale à $${absB}$.<br>
      `

    if (this.versionQcm) {
      this.question += '  L’ordonnée du point $B$ est égale à : '
    } else {
      this.question += "Quelle est l'ordonnée du point $B$  ?"
    }

    this.correction = `Le point $A$ est le point d'intersection entre la droite $D$ et l'axe des ordonnées, donc l'ordonnée à l'origine de la droite $D$ est $${a}$.<br>
    Comme le coefficient directeur de la droite $D$ est $${texNombre(coeff, 1)}$, l'équation réduite de la droite $D$ est $y=${texNombre(coeff, 1)}x${ecritureAlgebrique(a)}$.<br>
     L'ordonnée du point $B$ est donnée par $y=${texNombre(coeff, 1)}\\times ${ecritureParentheseSiNegatif(absB)}${ecritureAlgebrique(a)}=${miseEnEvidence(texNombre(coeff * absB + a, 1))}$.
`
    this.reponse = this.versionQcm
      ? `$${texNombre(coeff * absB + a, 1)}$`
      : texNombre(coeff * absB + a, 1)
    this.distracteurs = [
      `$${a + 1}$`,
      `$${texNombre(coeff + 1, 1)}$`,
      `$${texNombre(coeff * absB - a, 1)}$`,
      `$${texNombre(coeff * a, 1)}$`,
    ]

    this.canReponseACompleter = '$B(1\\,;\\,\\ldots)$'
    if (this.versionQcm) {
      // Secours : Oublier le terme constant, le produit ou changer le signe.
      this.distracteurs = distracteursDistincts(
        String(this.reponse),
        this.distracteurs,
        [a, coeff * absB, -coeff * absB - a, coeff + a, absB + a, absB - a].map(
          (n) => `$${texNombre(n, 1)}$`,
        ),
        Math.max(3, this.distracteurs.length),
      )
    }
  }
}
