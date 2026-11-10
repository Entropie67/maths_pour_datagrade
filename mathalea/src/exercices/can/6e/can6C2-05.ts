import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Diviser par $9$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021
 */
export const uuid = '8be78'

export const refs = {
  'fr-fr': ['can6C2-05', '6N2J-flash1'],
  'fr-ch': [],
}

export default class DivisionPar9 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    const b = this.quotaRandint('b', 2, 9)
    let a
    switch (this.quotaChoice('typeDeQuestions', [1, 2, 3])) {
      case 1:
        a = b * 90 + 9
        this.question = `Calculer $${texNombre(a, 0)}\\div 9$.`
        this.reponse = a / 9
        this.correction = `$${texNombre(a, 0)}\\div 9 = ${miseEnEvidence(texNombre(this.reponse, 0))}$<br>`
        this.correction += texteEnCouleur(
          `<br> Mentalement : <br>
        On décompose $${texNombre(a, 0)}$ en $${texNombre(b * 90, 0)}+9$.<br>
$${texNombre(b * 90, 0)}\\div 9= ${texNombre(b * 10, 0)}$ et $9\\div 9=1$. <br>
On obtient donc comme résultat : $${texNombre(a, 0)}\\div 9=${texNombre(b * 10, 0)}+1$, soit $${texNombre(this.reponse, 0)}$.
          `,
          bleuMathalea,
        )
        break
      case 2:
        a = b * 900 + 9
        this.question = `Calculer $${texNombre(a, 0)}\\div 9$.`
        this.reponse = a / 9
        this.correction = `$${texNombre(a, 0)}\\div 9 = ${miseEnEvidence(texNombre(this.reponse, 0))}$<br>`
        this.correction += texteEnCouleur(
          `<br> Mentalement : <br>
        On décompose $${texNombre(a, 0)}$ en $${texNombre(b * 900, 0)}+9$.<br>
$${texNombre(b * 900, 0)}\\div 9= ${texNombre(b * 100, 0)}$ et $9\\div 9=1$. <br>
On obtient donc comme résultat : $${texNombre(a, 0)}\\div 9=${texNombre(b * 100, 0)}+1$, soit $${texNombre(this.reponse, 0)}$.
          `,
          bleuMathalea,
        )
        break
      case 3:
        a = b * 900 + 90
        this.question = `Calculer $${texNombre(a, 0)}\\div 9$.`
        this.reponse = a / 9
        this.correction = `$${texNombre(a, 0)}\\div 9 = ${miseEnEvidence(texNombre(this.reponse, 0))}$<br>`
        this.correction += texteEnCouleur(
          `<br> Mentalement : <br>
        On décompose $${texNombre(a, 0)}$ en $${texNombre(b * 900, 0)}+90$.<br>
$${texNombre(b * 900, 0)}\\div 9= ${texNombre(b * 100, 0)}$ et $90\\div 9=10$. <br>
On obtient donc comme résultat : $${texNombre(a, 0)}\\div 9=${texNombre(b * 100, 0)}+10$, soit $${texNombre(this.reponse, 0)}$.
          `,
          bleuMathalea,
        )
        break
    }
  }
}
