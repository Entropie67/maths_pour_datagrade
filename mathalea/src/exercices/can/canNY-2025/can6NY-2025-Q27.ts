import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { shuffle } from '../../../lib/outils/arrayOutils'
import { sp } from '../../../lib/outils/outilString'
export const titre = ''
export const interactifReady = true

export const uuid = 'e3045'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class CalculDivers extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const d = this.quotaRandint('d', 3, 6)
    const u = this.quotaRandint('u', 1, 9)
    const a = d * 10 + u
    const listeResultat = [2025 * a, 2025 * a + 1, 2025 * a - 1]
    const Resultat = shuffle(listeResultat)
    this.question = `Recopier le résultat du calcul $${texNombre(2025)}\\times ${a}$ parmi les trois propositions suivantes : <br>
      $${texNombre(Resultat[0])}$${sp(2)} ; ${sp(2)} $${texNombre(Resultat[1])}$ ${sp(2)} ; ${sp(2)}$${texNombre(Resultat[2])}$.`
    this.correction = `Le chiffre des unités de ce produit est donné par le chiffre des unités de $5\\times ${u}$, soit $${(5 * u) % 10}$.<br>
      Ainsi,  $${texNombre(2025)}\\times ${a}=${miseEnEvidence(`${texNombre(2025 * a)}`)}$.
           `
    this.reponse = `${2025 * a}`
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
