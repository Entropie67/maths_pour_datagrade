import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { sp } from '../../../lib/outils/outilString'
export const titre = ''
export const interactifReady = true

export const uuid = 'jj1hp'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class canQ192026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    const annee = 2026
    const choix = this.canOfficielle ? 1 : this.quotaRandint('choix', 1, 2)
    const a = this.canOfficielle ? 6 : this.quotaRandint('a', 5, 10)
    const c = annee - a
    const b = annee + a
    const listeNombre1 = [annee, b, c]
    const Nombre1 = shuffle(listeNombre1)
    const listeNombre2 = [annee, annee - a, annee - 2 * a]
    const Nombre2 = shuffle(listeNombre2)
    if (choix === 1) {
      this.question = `On donne la série de nombres : $${texNombre(Nombre1[0])}$${sp(2)} ; ${sp(2)} $${texNombre(Nombre1[1])}$ ${sp(2)} ; ${sp(2)}$${texNombre(Nombre1[2])}$.<br>
              Quelle est la moyenne de cette série ?`
      this.correction = `On remarque que $${texNombre(c)}=${texNombre(annee, 0)}-${a}$ et $${texNombre(b)}=${texNombre(annee)}+${a}$, donc la moyenne est $${miseEnEvidence(`${texNombre(annee)}`)}$.`
      this.reponse = annee
    } else {
      this.question = `On donne la série de nombres : $${texNombre(Nombre2[0], 0)}$${sp(2)} ; ${sp(2)} $${texNombre(Nombre2[1], 0)}$ ${sp(2)} ; ${sp(2)}$${texNombre(Nombre2[2], 0)}$.<br>
            Quelle est la moyenne de cette série ?`
      this.correction = `On remarque que $${texNombre(annee, 0)}=${texNombre(annee - a)}+${a}$ et $${texNombre(annee - 2 * a, 0)}=${texNombre(annee - a, 0)}-${a}$, donc la moyenne est $${miseEnEvidence(`${texNombre(annee - a)}`)}$.`
      this.reponse = annee - a
    }
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
