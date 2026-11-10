import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer un pourcentage'
export const interactifReady = true

export const uuid = 'c49da'
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
    this.optionsChampTexte = { texteApres: '%' }

    this.canOfficielle = false
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = 44
      this.question = ` Dans mon bouquet, il y a $25$ fleurs dont $11$ tulipes.<br>
      Quel est le pourcentage de tulipes dans ce bouquet ?<br>`
      this.correction = `Comme il y a $11$ tulipes sur un total de $25$ fleurs, la proportion de tulipes est $\\dfrac{11}{25}$ soit $\\dfrac{44}{100}$. <br>
      On en déduit que le pourcentage de tulipes est $${miseEnEvidence(this.reponse)}\\,\\%$.
     `
    } else {
      const listeValeurs = [
        [11, 25, 44],
        [15, 25, 60],
        [7, 25, 28],
        [9, 25, 36],
        [9, 20, 45],
        [7, 20, 35],
        [8, 20, 40],
        [12, 20, 60],
        [4, 25, 16],
        [11, 20, 55],
        [6, 25, 24],
        [6, 20, 30],
      ]
      const valeurs = choice(listeValeurs)

      this.reponse = valeurs[2]
      this.question = ` Dans mon bouquet, il y a $${valeurs[1]}$ fleurs dont $${valeurs[0]}$ tulipes.<br>
      Quel est le pourcentage de tulipes dans ce bouquet ? `
      this.correction = `Comme il y a $${valeurs[0]}$ tulipes sur un total de $${valeurs[1]}$ fleurs, la proportion de tulipes est $\\dfrac{${valeurs[0]}}{${valeurs[1]}}$ soit $${valeurs[1] === 20 ? `\\dfrac{${valeurs[0]}\\times 5}{${valeurs[1]}\\times 5}` : `\\dfrac{${valeurs[0]}\\times 4}{${valeurs[1]}\\times 4}`}=\\dfrac{${valeurs[2]}}{100}$. <br>
      On en déduit que le pourcentage de tulipes est $${miseEnEvidence(this.reponse)}\\,\\%$.
     `
    }

    this.canReponseACompleter = '$\\ldots\\,\\%$'
  }
}
