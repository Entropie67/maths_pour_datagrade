import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { nombreDeChiffresDansLaPartieDecimale } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Diviser astucieusement par $5$, $4$, $8$ ou $0{,}5$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Rémi Angot
 * Diviser par 5 revient à multiplier par 2 puis diviser par 10.
 * Diviser par 4 (respectivement 8) revient à diviser par 2 deux
 * (respectivement trois) fois de suite.
 * Diviser par 0,5 revient à multiplier par 2, car 0,5 = 1/2.
 */
export const uuid = 'c07b3'

export const refs = {
  'fr-fr': ['can6C2-11'],
  'fr-ch': [],
}

export default class DiviserAstucieusement extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    const type = this.quotaChoice('type', ['5', '4', '8', '0,5'])

    if (type === '5') {
      const n = this.quotaRandint('n5', 12, 199)
      const etape = n * 2
      const precision = nombreDeChiffresDansLaPartieDecimale(n / 5)
      this.reponse = n / 5

      this.question = `Calculer $${n} \\div 5$.`
      this.correction = `$${n} \\div 5 = ${n} \\times 2 \\div 10 = ${texNombre(etape)} \\div 10 = ${miseEnEvidence(texNombre(this.reponse, precision))}$`
      this.correction += texteEnCouleur(
        `<br> Mentalement : <br>
Diviser par $5$ revient à multiplier par $2$ puis diviser par $10$, car $5 = \\dfrac{10}{2}$.<br>
Ainsi, $${n} \\div 5 = ${n} \\times 2 \\div 10 = ${texNombre(etape)} \\div 10 = ${texNombre(this.reponse, precision)}$.
    `,
        bleuMathalea,
      )
    } else if (type === '4') {
      const quotient = this.quotaRandint('q4', 2, 15)
      const n = quotient * 4
      const etape = quotient * 2
      this.reponse = quotient

      this.question = `Calculer $${n} \\div 4$.`
      this.correction = `$${n} \\div 4 = ${n} \\div 2 \\div 2 = ${etape} \\div 2 = ${miseEnEvidence(texNombre(this.reponse))}$`
      this.correction += texteEnCouleur(
        `<br> Mentalement : <br>
Diviser par $4$ revient à diviser par $2$ deux fois de suite, car $4 = 2 \\times 2$.<br>
Ainsi, $${n} \\div 4 = ${n} \\div 2 \\div 2 = ${etape} \\div 2 = ${texNombre(this.reponse)}$.
    `,
        bleuMathalea,
      )
    } else if (type === '8') {
      const quotient = this.quotaRandint('q8', 2, 15)
      const n = quotient * 8
      const etape1 = quotient * 4
      const etape2 = quotient * 2
      this.reponse = quotient

      this.question = `Calculer $${n} \\div 8$.`
      this.correction = `$${n} \\div 8 = ${n} \\div 2 \\div 2 \\div 2 = ${etape1} \\div 2 \\div 2 = ${etape2} \\div 2 = ${miseEnEvidence(texNombre(this.reponse))}$`
      this.correction += texteEnCouleur(
        `<br> Mentalement : <br>
Diviser par $8$ revient à diviser par $2$ trois fois de suite, car $8 = 2 \\times 2 \\times 2$.<br>
Ainsi, $${n} \\div 8 = ${n} \\div 2 \\div 2 \\div 2 = ${etape1} \\div 2 \\div 2 = ${etape2} \\div 2 = ${texNombre(this.reponse)}$.
    `,
        bleuMathalea,
      )
    } else {
      const n = this.quotaRandint('n05', 12, 199)
      this.reponse = n * 2

      this.question = `Calculer $${n} \\div 0,5$.`
      this.correction = `$${n} \\div 0,5 = ${n} \\times 2 = ${miseEnEvidence(texNombre(this.reponse))}$`
      this.correction += texteEnCouleur(
        `<br> Mentalement : <br>
Diviser par $0,5$ revient à multiplier par $2$, car diviser par un nombre revient à multiplier par son inverse, et l'inverse de $0,5$ est $2$.<br>
Ainsi, $${n} \\div 0,5 = ${n} \\times 2 = ${texNombre(this.reponse)}$.
    `,
        bleuMathalea,
      )
    }
  }
}
