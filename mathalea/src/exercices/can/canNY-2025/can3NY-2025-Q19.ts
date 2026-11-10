import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { sp } from '../../../lib/outils/outilString'
export const titre = ''
export const interactifReady = true

export const uuid = '77432'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class canQ19 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    const choix = this.quotaRandint('choix', 1, 2)
    const a = this.quotaRandint('a', 5, 10)
    const c = 2025 - a
    const b = 2025 + a
    const listeNombre1 = [2025, b, c]
    const Nombre1 = shuffle(listeNombre1)
    const listeNombre2 = [2025, 2025 - a, 2025 - 2 * a]
    const Nombre2 = shuffle(listeNombre2)
    if (choix === 1) {
      this.question = `On donne la série de nombres : $${texNombre(Nombre1[0])}$${sp(2)} ; ${sp(2)} $${texNombre(Nombre1[1])}$ ${sp(2)} ; ${sp(2)}$${texNombre(Nombre1[2])}$.<br>
              Quelle est la moyenne de cette série ?`
      this.correction = `On remarque que $${texNombre(c)}=${texNombre(2025, 0)}-${a}$ et $${texNombre(b)}=${texNombre(2025)}+${a}$, donc la moyenne est $${miseEnEvidence(`${texNombre(2025)}`)}$.`
      this.reponse = 2025
    } else {
      this.question = `On donne la série de nombres : $${texNombre(Nombre2[0], 0)}$${sp(2)} ; ${sp(2)} $${texNombre(Nombre2[1], 0)}$ ${sp(2)} ; ${sp(2)}$${texNombre(Nombre2[2], 0)}$.<br>
            Quelle est la moyenne de cette série ?`
      this.correction = `On remarque que $${texNombre(2025, 0)}=${texNombre(2025 - a)}+${a}$ et $${texNombre(2025 - 2 * a, 0)}=${texNombre(2025 - a, 0)}-${a}$, donc la moyenne est $${miseEnEvidence(`${texNombre(2025 - a)}`)}$.`
      this.reponse = 2025 - a
    }
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
