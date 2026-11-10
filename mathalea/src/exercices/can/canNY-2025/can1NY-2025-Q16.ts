import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { choice } from '../../../lib/outils/arrayOutils'
export const titre = "Trouver une intersection d'intervalles"
export const interactifReady = true

export const uuid = '0244d'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class intersectionIntervalles extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierEnsemble
  }

  nouvelleVersion() {
    const a = -2024
    const b = this.quotaRandint('b', -10, 5)
    const c = a + this.quotaRandint('c', 1, 9)
    const d = 2025
    const choix = choice([true, false])
    const crochet1 = choice([']', '['])
    const crochet2 = choice([']', '['])
    const crochet3 = choice([']', '['])
    const crochet4 = choice([']', '['])
    this.reponse = `${crochet3}${c};${b}${crochet2}`
    this.question = `Donner une écriture simplifiée de
          ${choix ? `$${crochet1} ${texNombre(a)}\\,;\\,${texNombre(b)}${crochet2}\\,\\cap \\,${crochet3}${texNombre(c)}\\,;\\,${texNombre(d)}${crochet4}$` : `$${crochet3}${texNombre(c)}\\,;\\,${texNombre(d)}${crochet4}\\,\\cap \\,${crochet1} ${texNombre(a)}\\,;\\,${texNombre(b)}${crochet2}$`}`
    this.correction =
      'L’intersection de deux intervalles $I$ et $J$ (notée $I\\cap J$) est l’ensemble qui contient les nombres appartenant à $I$ et à $J$.<br>' +
      `Ainsi, ${choix ? `$${crochet1} ${a}\\,;\\,${b}${crochet2}\\,\\cap \\,${crochet3}${c}\\,;\\,${d}${crochet4}$` : `$${crochet3}${c}\\,;\\,${d}${crochet4}\\,\\cap \\,${crochet1} ${a}\\,;\\,${b}${crochet2}$`} $= ${miseEnEvidence(`${crochet3}${c}\\,;\\,${b}${crochet2}`)}$.<br>
          Les nombres de l'intervalle $${crochet3}${texNombre(c)}\\,;\\,${texNombre(b)}${crochet2}$ appartiennent à l'intervalle $${crochet1} ${texNombre(a)}\\,;\\,${texNombre(b)}${crochet2}$ et à l'intervalle $${crochet3}${texNombre(c)}\\,;\\,${texNombre(d)}${crochet4}$.`

    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
