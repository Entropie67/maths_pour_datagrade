import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

import { texNombre } from '../../../lib/outils/texNombre'
export const titre = "Déterminer p dans l'équation réduite d'une droite"
export const interactifReady = true

export const dateDePublication = '30/11/2024'
export const uuid = 'fddc6'
export const refs = {
  'fr-fr': ['can2G30-04'],
  'fr-ch': ['1mF2-21'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class TrouverpDroite extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const nom = ['A', 'B', 'C']
    const nomP = choice(nom)
    const a = this.quotaRandint('a', -10, 10, [0])
    const b = this.quotaRandint('b', -10, 10, [0])
    const m = this.quotaRandint('m', -10, 10, [0])
    const p = b - m * a
    this.reponse = texNombre(p, 0)
    this.question = `$d$ est la droite d'équation $y=${rienSi1(m)}x+p$.<br>
    Déterminer la valeur de $p$ sachant qu'elle passe par le point $${nomP}(${a}\\,;\\,${b})$.`
    this.correction = `Comme $${nomP}(\\underbrace{${a}}_{x}\\,;\\,\\underbrace{${b}}_{y})$ est sur la droite, ses coordonnées vérifient l'équation de la droite : <br>
    $\\begin{aligned}
    ${b}&=${m}\\times ${ecritureParentheseSiNegatif(a)}+p\\\\
    ${b}&= ${m * a}+p\\\\
    p&=${miseEnEvidence(this.reponse)}
    \\end{aligned}$`
    if (this.interactif) {
      this.question += '<br>$p=$'
    }

    this.canReponseACompleter = '$p=\\ldots$'
  }
}
