import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Trouver un entier dans un intervalle'
export const interactifReady = true

export const uuid = '0es14'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class entierDansIntervalle2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const annee = 2026
    const crochet1 = this.canOfficielle ? ']' : choice([']', '['])
    const crochet2 = this.canOfficielle ? ']' : choice([']', '['])
    if (this.quotaChoice('choix', [true, false])) {
      this.question = `Quel est le plus grand entier relatif appartenant à l'intervalle $${crochet1} ${texNombre(-annee, 0)}\\,;\\,${texNombre(annee, 0)}${crochet2}$ ? `
      this.correction = `Le second crochet étant ${crochet2 === ']' ? 'fermé' : 'ouvert'}, c'est $${miseEnEvidence(`${texNombre(crochet2 === ']' ? annee : annee - 1, 0)}`)}$.`
      this.reponse = `${crochet2 === ']' ? annee : annee - 1}`
    } else {
      this.question = `Quel est le plus petit entier relatif appartenant à l'intervalle $${crochet1} ${texNombre(-annee, 0)}\\,;\\,${texNombre(annee, 0)}${crochet2}$ ? `
      this.correction = `Le premier crochet étant ${crochet1 === '[' ? 'fermé' : 'ouvert'}, c'est $${miseEnEvidence(`${texNombre(crochet1 === '[' ? -annee : -annee + 1, 0)}`)}$.`
      this.reponse = `${crochet1 === '[' ? -annee : -annee + 1}`
    }
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
