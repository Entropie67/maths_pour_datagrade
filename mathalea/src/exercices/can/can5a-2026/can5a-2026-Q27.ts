import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre =
  'Calculer le double de la somme ou du produit de deux nombres'
export const interactifReady = true

export const uuid = 'udtsm'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can52026Q27 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(typeQuestion?: string, a?: number, b?: number) {
    if (typeQuestion == null || a == null || b == null) {
      // Génération aléatoire
      typeQuestion = choice(['somme', 'produit'])
      a = randint(2, 9)
      b = randint(2, 9, a)
    }

    let calcul: number
    let reponse: number

    if (typeQuestion === 'somme') {
      // Le double de la somme
      calcul = a + b
      reponse = 2 * calcul

      this.question = `Le double de la somme de $${a}$ et de $${b}$`

      this.correction = `La somme de $${a}$ et de $${b}$ est égale à : $${a}+${b}=${calcul}$.<br>
Le double de la somme de $${a}$ et de $${b}$ est donc égal à : $2\\times ${calcul}=${miseEnEvidence(reponse)}$.`
    } else {
      // Le double du produit
      calcul = a * b
      reponse = 2 * calcul

      this.question = `Le double du produit de $${a}$ par $${b}$`

      this.correction = `Le produit de $${a}$ par $${b}$ est égal à : $${a}\\times ${b}=${calcul}$.<br>
Le double du produit de $${a}$ par $${b}$ est donc égal à : $2\\times ${calcul}=${miseEnEvidence(reponse)}$.`
    }

    this.reponse = reponse

    this.question += '<br>'

    if (!this.interactif) {
      this.question += '<br>$\\ldots$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce('somme', 2, 8)
    else this.enonce()
  }
}
