import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

import Decimal from 'decimal.js'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
export const titre = 'Calculer une valeur connaissant la moyenne'
export const interactifReady = true

export const dateDePublication = '18/05/2024'
export const uuid = '8490c'
export const refs = {
  'fr-fr': ['can3S1-04'],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class EnFonctionDe extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '$a=$' }
  }

  nouvelleVersion() {
    switch (this.quotaChoice('cas', [1, 2])) {
      case 1: //
        {
          const val1 = randint(-10, 20, 0)
          const val2 = randint(1, 10)
          const somme = val1 + val2
          const moy = new Decimal(somme).div(2)
          this.reponse = val2

          this.question = `La moyenne de $${val1}$ et $a$ est $${texNombre(moy, 1)}$.<br>`

          // this.question += mathalea2d(Object.assign({ scale: 0.45, style: 'margin: auto' }, fixeBordures(objets)), objets)
          this.correction = `Comme la moyenne des deux valeurs est $${texNombre(moy, 1)}$, la somme des deux valeurs doit être égale à $2\\times ${moy.lt(0) ? `(${texNombre(moy, 1)})` : texNombre(moy, 1)}=${texNombre(somme, 0)}$.<br>
          On en déduit que $${val1}+a=${texNombre(somme, 0)}$, soit $a=${miseEnEvidence(texNombre(val2, 0))}$.`

          if (!this.interactif) {
            this.question += 'Quelle est la valeur de $a$ ?'
          }
        }
        break
      case 2: //
        {
          const val1 = randint(1, 10)
          const val2 = randint(1, 10)
          const somme = 3 * randint(Math.max(val1, val2), 15)
          const val3 = somme - val1 - val2
          const moy = new Decimal(somme).div(3)
          this.reponse = val3

          this.question = `La moyenne de la série de nombres suivante est $${texNombre(moy, 1)}$.<br>
           $${val1}$ ${sp(7)} $${val2}$ ${sp(7)} $a$<br>
           `

          // this.question += mathalea2d(Object.assign({ scale: 0.45, style: 'margin: auto' }, fixeBordures(objets)), objets)
          this.correction = `Comme la moyenne des trois valeurs est $${texNombre(moy, 1)}$, la somme des trois valeurs doit être égale à $3\\times ${texNombre(moy, 1)}=${texNombre(somme, 0)}$.<br>
          On en déduit que $${val1}+${val2}+a=${texNombre(somme, 0)}$, soit $a=${miseEnEvidence(texNombre(val3, 0))}$.`

          if (!this.interactif) {
            this.question += 'Quelle est la valeur de $a$ ?'
          }
        }
        break
    }
  }
}
