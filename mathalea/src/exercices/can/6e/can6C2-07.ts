import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'

import { bleuMathalea } from '../../../lib/colors'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer avec +/-99 ou +/-999'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 * Créé pendant l'été 2021
 */
export const uuid = 'ad0ee'

export const refs = {
  'fr-fr': ['can6C2-07', 'CM2N4J-flash3'],
  'fr-ch': [],
}
export default class CalculAvec99 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    let a
    switch (
      this.quotaChoice('typeDeQuestions', ['a', 'b', 'c', 'd', 'e']) //
    ) {
      case 'a':
        a = randint(1, 9) * 100 + randint(1, 9) * 10 + randint(1, 9)
        this.question = `Calculer $${texNombre(a)}+99$.`
        this.correction = `$${texNombre(a)}+99=${miseEnEvidence(texNombre(a + 99))}$<br>`
        this.correction += texteEnCouleur(
          `<br> Mentalement : <br>
       Pour ajouter $99$, on ajoute $100$ et on retranche $1$<br>
       $${texNombre(a)}+99=${texNombre(a)}+\\underbrace{100-1}_{99}=${texNombre(a + 100)}-1=${texNombre(a + 99)}$.
          `,
          bleuMathalea,
        )
        this.reponse = a + 99
        break
      case 'b':
        a =
          randint(1, 9) * 1000 +
          randint(1, 9) * 100 +
          randint(1, 9) * 10 +
          randint(1, 9)
        this.question = `Calculer $${texNombre(a)}+999$.`
        this.correction = `$${texNombre(a)}+999=${miseEnEvidence(texNombre(a + 999))}$<br>`
        this.reponse = a + 999
        this.correction += texteEnCouleur(
          `<br> Mentalement : <br>
       Pour ajouter $999$, on ajoute $${texNombre(1000)}$ et on retranche $1$<br>
       $${texNombre(a)}+999=${texNombre(a)}+\\underbrace{${texNombre(1000)}-1}_{999}=${texNombre(a + 1000)}-1=${texNombre(a + 999)}$.
          `,
          bleuMathalea,
        )
        break

      case 'c':
        a =
          randint(1, 9) * 1000 +
          randint(1, 9) * 100 +
          randint(1, 9) * 10 +
          randint(1, 9)
        this.question = `Calculer $${texNombre(a)}-999$.`
        this.correction = `$${texNombre(a)}-999=${miseEnEvidence(texNombre(a - 999))}$<br>`
        this.reponse = a - 999
        this.correction += texteEnCouleur(
          `<br> Mentalement : <br>
       Pour retrancher $999$, on retranche $${texNombre(1000)}$ et on ajoute $1$<br>
       $${texNombre(a)}-999=${texNombre(a)}\\underbrace{-${texNombre(1000)}+1}_{-999}=${texNombre(a - 1000)}+1=${texNombre(a - 999)}$.
          `,
          bleuMathalea,
        )
        break
      case 'd':
        a = randint(1, 9) * 100 + randint(1, 9) * 10 + randint(1, 9)
        this.question = `Calculer $${texNombre(a)}-99$.`
        this.correction = `$${texNombre(a)}-99=${miseEnEvidence(texNombre(a - 99))}$<br>`
        this.reponse = a - 99
        this.correction += texteEnCouleur(
          `<br> Mentalement : <br>
       Pour retrancher $99$, on retranche $100$ et on ajoute $1$<br>
       $${texNombre(a)}-99=${texNombre(a)}\\underbrace{-100+1}_{-99}=${texNombre(a - 100)}+1=${texNombre(a - 99)}$.
          `,
          bleuMathalea,
        )
        break
      case 'e':
        a =
          randint(1, 9) * 1000 +
          randint(1, 9) * 100 +
          randint(1, 9) * 10 +
          randint(1, 9)
        this.question = `Calculer $${texNombre(a)}+99$.`
        this.correction = `$${texNombre(a)}+99=${miseEnEvidence(texNombre(a + 99))}$<br>`
        this.reponse = a + 99
        this.correction += texteEnCouleur(
          `<br> Mentalement : <br>
        Pour ajouter $99$, on ajoute $100$ et on retranche $1$<br>
        $${texNombre(a)}+99=${texNombre(a)}+\\underbrace{100-1}_{99}=${texNombre(a + 100)}-1=${texNombre(a + 99)}$.
           `,
          bleuMathalea,
        )
        break
    }
  }
}
