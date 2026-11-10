import Decimal from 'decimal.js'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer le double ou le triple (décimal)'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021
 */
export const uuid = '50fc4'

export const refs = {
  'fr-fr': ['can6C3-01', '6N2E-flash2'],
  'fr-ch': [],
}
export default class DoubleOuTripleDecimal extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 1, 3)
    const b = randint(1, 9, a)
    const e = a * 10 + b
    const d = new Decimal(this.quotaRandint('d', 1, 9)).div(10)
    const c = d.add(e)
    if (this.quotaChoice('doubleOuTriple', [true, false])) {
      this.reponse = c.mul(3)
      this.question = `Quel est le triple de $${texNombre(c, 1)}$ ?`
      this.correction = `Le triple de $${texNombre(c, 1)}$ est $3 \\times ${texNombre(c, 1)}=${miseEnEvidence(texNombre(Number(this.reponse), 1))}$.<br>`
      this.correction += texteEnCouleur(
        `Mentalement : <br>
  On décompose $${texNombre(c, 1)}$ en $${e}+${texNombre(d, 1)}$. <br>
  On calcule le triple de $${e}$, soit $3\\times ${e}= ${3 * e}$
  puis le triple de $${texNombre(d, 1)}$, soit $3\\times ${texNombre(d, 1)}=${texNombre(d.mul(3), 1)}$.<br>
  On en fait la somme : $${3 * e}+${texNombre(d.mul(3), 1)}$, ce qui donne le résultat $${texNombre(Number(this.reponse), 1)}$.
      `,
        bleuMathalea,
      )
    } else {
      this.reponse = c.mul(2)
      this.question = `Quel est le double de $${texNombre(c, 1)}$ ?`
      this.correction = `Le double de $${texNombre(c, 1)}$ est $2 \\times ${texNombre(c, 1)}=${miseEnEvidence(texNombre(Number(this.reponse), 1))}$.<br>`
      this.correction += texteEnCouleur(
        `Mentalement : <br>
  On décompose $${texNombre(c, 1)}$ en $${e}+${texNombre(d, 1)}$. <br>
  On calcule le double de $${e}$, soit $2\\times ${e}= ${2 * e}$
  puis le double de $${texNombre(d, 1)}$, soit $2\\times ${texNombre(d, 1)}=${texNombre(d.mul(2), 1)}$.<br>
  On en fait la somme : $${2 * e}+${texNombre(d.mul(2), 1)}$, ce qui donne le résultat $${texNombre(Number(this.reponse), 1)}$.
      `,
        bleuMathalea,
      )
    }
  }
}
