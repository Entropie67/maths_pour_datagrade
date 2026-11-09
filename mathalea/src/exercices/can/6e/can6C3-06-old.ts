// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 16ea9 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'

import Decimal from 'decimal.js'
import { bleuMathalea } from '../../../lib/colors'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Multiplier deux décimaux'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '04/03/2022'

/**
 * @author  Gilles Mora
 */
export const uuid = '16ea9'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class MultiplierDeuxDecimauxOld extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.typeExercice = 'simple'
  }

  nouvelleVersion() {
    let a, b, c, d
    switch (this.quotaChoice('typeDeQuestions', [1, 2, 3, 4])) {
      case 1: // un entier par un décimal avec une chiffre après la virgule
        a = randint(2, 9)
        b = new Decimal(a).div(10)
        c = randint(2, 9)
        this.reponse = b.mul(c)
        this.question = `Calculer $${texNombre(b, 1)}\\times ${c}$.`
        this.correction = `$${texNombre(b, 1)}\\times ${c}=${miseEnEvidence(texNombre(Number(this.reponse), 1))}$<br>`

        this.correction += texteEnCouleur(
          `Mentalement : <br>
   Comme $${texNombre(b, 1)}=${a}\\times 0,1$, alors $${texNombre(b, 1)}\\times ${c}=${a}\\times 0,1\\times ${c} =
   ${a * c}\\times 0,1=${texNombre(Number(this.reponse), 1)}$ `,
          bleuMathalea,
        )
        break
      case 2: // un entier par un décimal avec deux chiffres après la virgule
        a = randint(2, 9)
        b = new Decimal(a).div(100)
        c = randint(2, 9)
        this.reponse = b.mul(c)
        this.question = `Calculer $${texNombre(b, 2)}\\times ${c}$.`
        this.correction = `$${texNombre(b, 2)}\\times ${c}=${miseEnEvidence(texNombre(Number(this.reponse), 2))}$<br>`

        this.correction += texteEnCouleur(
          `Mentalement : <br>
   Comme $${texNombre(b, 2)}=${a}\\times 0,01$, alors $${texNombre(b, 2)}\\times ${c}=${a}\\times 0,01\\times ${c} =
   ${a * c}\\times 0,01=${texNombre(Number(this.reponse), 2)}$ `,
          bleuMathalea,
        )
        break

      case 3: // Deux décimaux avec un chiffre après la virgule
        a = randint(2, 9)
        b = new Decimal(a).div(10)
        c = randint(2, 9)
        d = new Decimal(c).div(10)
        this.reponse = b.mul(d)
        this.question = `Calculer $${texNombre(b, 1)}\\times ${texNombre(d, 1)}$.`
        this.correction = `$${texNombre(b, 1)}\\times ${texNombre(d, 1)}=${miseEnEvidence(texNombre(Number(this.reponse), 2))}$<br>`

        this.correction += texteEnCouleur(
          `Mentalement : <br>
   Comme $${texNombre(b, 1)}=${a}\\times 0,1$ et $${texNombre(d, 1)}=${c}\\times 0,1$,
    alors $${texNombre(b, 1)}\\times ${texNombre(d, 1)}=${a}\\times ${c}\\times 0,1 \\times 0,1=${a * c}\\times 0,01=${texNombre(Number(this.reponse), 2)}$ `,
          bleuMathalea,
        )
        break

      case 4: // Deux décimaux avec un chiffre et deux chiffres après la virgule
        a = randint(2, 9)
        b = new Decimal(a).div(10)
        c = randint(2, 9)
        d = new Decimal(c).div(100)
        this.reponse = b.mul(d)
        this.question = `Calculer $${texNombre(b, 1)}\\times ${texNombre(d, 2)}$.`
        this.correction = `$${texNombre(b, 1)}\\times ${texNombre(d, 2)}=${miseEnEvidence(texNombre(Number(this.reponse), 3))}$<br>`

        this.correction += texteEnCouleur(
          `Mentalement : <br>
   Comme $${texNombre(b, 1)}=${a}\\times 0,1$ et $${texNombre(d, 2)}=${c}\\times 0,01$,
    alors $${texNombre(b, 1)}\\times ${texNombre(d, 2)}=${a}\\times ${c}\\times 0,01 \\times 0,1=${a * c}\\times 0,001=${texNombre(Number(this.reponse), 3)}$ `,
          bleuMathalea,
        )
        break
    }
  }
}
