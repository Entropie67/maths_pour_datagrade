import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'

import Decimal from 'decimal.js' // ici j'importe la classe Decimal qui va me permettre de créer de tels nombres et d'utiliser leur méthodes de calcul exactes.
import { bleuMathalea } from '../../../lib/colors'
import ExerciceSimple from '../../ExerciceSimple'
import { sp } from '../../../lib/outils/outilString'
export const titre = 'Calculer la somme de deux décimaux'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021 modifié le 21/05/2022 (support de la classe Decimal)
 */
export const uuid = 'c3e17'

export const refs = {
  'fr-fr': ['can6C3-02', '6N2A-flash1', '5N1autoF-2', '5N2autoA-11'],
  'fr-ch': ['NR'],
}
export default class FSomme2Decimaux extends ExerciceSimple {
  constructor() {
    super()
    this.consigne = `Calculer${sp()}:`
    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.nbQuestions = 1
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.besoinFormulaire2CaseACocher = ['Pas de retenues', false]
    this.sup2 = false
  }

  nouvelleVersion() {
    let a, b, c, d, e
    const sansRetenue = this.sup2
    if (this.quotaChoice('typeDeQuestions', [true, false])) {
      a = randint(3, 9)
      b = sansRetenue ? randint(1, 9 - a) : randint(1, 9, a)
      c = randint(1, 9, [a, b])
      d = randint(1, 9, [a, b, c])
      e = randint(10, 13)
      const n1 = new Decimal(b).div(10)
      const n2 = n1.plus(a)
      this.reponse = n1.plus(e)

      this.question = `$${texNombre(n2, 1)}+${texNombre(e - a, 0)}$`
      this.correction = `$${texNombre(n2, 1)}+${texNombre(e - a, 0)}=${miseEnEvidence(texNombre(Number(this.reponse), 1))}$<br>`
      this.correction += texteEnCouleur(
        `Mentalement${sp()}: <br>
      On fait la somme des parties entières des deux nombres${sp()}: $${a}+${e - a}=${e}$, puis on ajoute les dixièmes. On obtient${sp()}:<br>
      $${e}+${texNombre(n1, 1)}=${texNombre(Number(this.reponse), 1)}$`,
        bleuMathalea,
      )
    } else {
      a = randint(1, 9)
      b = sansRetenue ? randint(1, 4) : randint(3, 5)
      c = randint(1, 9)
      d = sansRetenue ? randint(1, 4) : randint(7, 9)
      const n1 = new Decimal(b).div(10)
      const n2 = new Decimal(d).div(10)
      const n3 = n1.plus(n2)

      this.reponse = n3.plus(a + c)
      this.question = `$${texNombre(n1.plus(a), 1)}+${texNombre(n2.plus(c), 1)}$`
      this.correction = `$${texNombre(n1.plus(a), 1)}+${texNombre(n2.plus(c), 1)}=${miseEnEvidence(texNombre(Number(this.reponse), 1))}$<br>`
      this.correction += texteEnCouleur(
        `Mentalement${sp()}: <br>
    On fait la somme des parties entières des deux nombres${sp()}: $${a}+${c}=${a + c}$.<br>
    On fait la somme des parties décimales${sp()}: $${texNombre(n1, 1)}+${texNombre(n2, 1)}=${texNombre(n3, 1)}$.<br>
    Le résultat est donc donné par${sp()}:
    $${a + c}+${texNombre(n3, 1)}=${texNombre(Number(this.reponse), 1)}$.
        `,
        bleuMathalea,
      )
    }
  }
}
