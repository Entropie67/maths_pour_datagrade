import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { personnes } from '../../../lib/outils/Personne'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
import { queDevant } from '../../../lib/outils/outilString'
export const titre = 'Calculer un nombre de billes'
export const interactifReady = true

export const uuid = '1b6cc'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class BillesMultiplieesCM2 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1

    this.optionsChampTexte = { texteApres: ' billes.' }
    this.canOfficielle = false
  }

  nouvelleVersion() {
    let coeff: number
    let nbBilles: number
    let quidams: string[] = []
    let personnages
    let pronom
    if (this.canOfficielle) {
      coeff = 4
      nbBilles = 12
      quidams[0] = 'Léo'
      quidams[1] = 'Lola'
      pronom = 'Il'
    } else {
      personnages = personnes(2)
      quidams = [personnages[0].prenom, personnages[1].prenom]
      coeff = choice([3, 4, 5])
      nbBilles = randint(11, 15)
      pronom = personnages[0].pronom
      pronom = pronom.charAt(0).toUpperCase() + pronom.slice(1)
    }
    this.reponse = texNombre(coeff * nbBilles, 0)
    this.question = `${quidams[0]} a $${texNombre(nbBilles, 0)}$ billes.<br>${pronom} en a $${coeff}$ fois moins ${queDevant(quidams[1])}.<br>`

    this.question +=
      `${quidams[1]} a ` + (this.interactif ? '' : '$\\ldots$ billes.')
    this.canReponseACompleter = `${quidams[1]} a $\\ldots$ billes.`
    this.correction = `${quidams[1]} a $${coeff}$ fois plus de billes ${queDevant(quidams[0])}.<br>
    Comme $${coeff}\\times ${nbBilles}=${this.reponse}$, ${quidams[1]} a donc $${miseEnEvidence(this.reponse)}$ billes.`
  }
}
