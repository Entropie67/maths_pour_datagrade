import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Trouver un ordre de grandeur'
export const interactifReady = true

export const uuid = '2f808'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase

    this.canOfficielle = false
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = 80000
      if (this.interactif) {
        this.question = `Recopie un ordre de grandeur de  $${texNombre(19397)}+${texNombre(56432)}$ parmi les valeurs suivantes : <br>
       `
      } else {
        this.question = `Entoure un ordre de grandeur de : $${texNombre(19397)}+${texNombre(56432)}$. <br>`
      }
      this.question += ` $800$ ${sp(2)} ; ${sp(2)} $${texNombre(8000)}$ ${sp(2)} ; ${sp(2)} $${texNombre(80000)}$${sp(2)} ; ${sp(2)} $${texNombre(800000)}$`
      this.correction = `Un ordre de grandeur de $${texNombre(19397)}$ est $${texNombre(20000)}$ et un ordre de grandeur de $${texNombre(56432)}$ est $${texNombre(60000)}$, ainsi, un ordre de 
      grandeur de la somme $${texNombre(19397)}+${texNombre(56432)}$ est la somme $${texNombre(20000)}+${texNombre(60000)}$ soit $${miseEnEvidence(texNombre(80000))}$.`
      this.canEnonce = `Entoure un ordre de grandeur de : $${texNombre(19397)}+${texNombre(56432)}$`
      this.canReponseACompleter = `$800$ ${sp(2)} ; ${sp(2)} $${texNombre(8000)}$ ${sp(2)} ; ${sp(2)} $${texNombre(80000)}$${sp(2)} ; ${sp(2)} $${texNombre(800000)}$`
    } else {
      const LesValeurs = [
        [randint(17000, 19900), randint(57000, 59900), 20000, 60000, 80000],
        [randint(1700, 1990), randint(5700, 5990), 2000, 6000, 8000],
        [randint(5700, 5990), randint(1700, 1990), 6000, 2000, 8000],
        [randint(57000, 59900), randint(17000, 19900), 60000, 20000, 80000],
      ]
      const valeurs = choice(LesValeurs)
      this.reponse = valeurs[4]
      if (this.interactif) {
        this.question = `Recopie un ordre de grandeur de  $${texNombre(valeurs[0])}+${texNombre(valeurs[1])}$ parmi les valeurs suivantes : <br>
       `
      } else {
        this.question = `Entoure un ordre de grandeur de : $${texNombre(valeurs[0])}+${texNombre(valeurs[1])}$ <br>`
      }
      this.question += ` $800$ ${sp(2)} ; ${sp(2)} $${texNombre(8000)}$ ${sp(2)} ; ${sp(2)} $${texNombre(80000)}$${sp(2)} ; ${sp(2)} $${texNombre(800000)}$`
      this.correction = `Un ordre de grandeur de $${texNombre(valeurs[0])}$ est $${texNombre(valeurs[2])}$ et un ordre de grandeur de $${texNombre(valeurs[1])}$ est $${texNombre(valeurs[3])}$, ainsi, un ordre de 
      grandeur de la somme $${texNombre(valeurs[0])}+${texNombre(valeurs[1])}$ est la somme $${texNombre(valeurs[2])}+${texNombre(valeurs[3])}$ soit $${miseEnEvidence(texNombre(valeurs[4]))}$.`
      this.canEnonce = `Entoure un ordre de grandeur de : $${texNombre(valeurs[0])}+${texNombre(valeurs[1])}$`
      this.canReponseACompleter = `$800$ ${sp(2)} ; ${sp(2)} $${texNombre(8000)}$ ${sp(2)} ; ${sp(2)} $${texNombre(80000)}$${sp(2)} ; ${sp(2)} $${texNombre(800000)}$`
    }
  }
}
