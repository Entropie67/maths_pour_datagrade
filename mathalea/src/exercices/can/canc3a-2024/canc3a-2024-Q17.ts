import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { prenom } from '../../../lib/outils/Personne'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
import { queDevant } from '../../../lib/outils/outilString'
export const titre = 'Calculer un nombre de billes'
export const interactifReady = true

export const uuid = '70cb3'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora (reprise du fichier de Jean-claude Lhote 6ième)

*/
export default class BillesMultipliees extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1

    this.canOfficielle = false
  }

  nouvelleVersion() {
    let coeff: number
    let nbBilles: number
    let quidams: string[] = []
    if (this.canOfficielle) {
      coeff = 6
      nbBilles = 5
      quidams[0] = 'Léo'
      quidams[1] = 'Lola'
    } else {
      quidams = prenom(2) as string[]
      coeff = choice([3, 4, 5, 6])
      nbBilles = randint(3, 7)
    }
    this.reponse = coeff.toFixed(0)
    this.question = `${quidams[0]} a $${texNombre(coeff * nbBilles, 0)}$  billes et  ${quidams[1]}  en a $${texNombre(nbBilles, 0)}$.<br>
    `
    this.optionsChampTexte = {
      texteApres: ` fois moins de billes ${queDevant(quidams[0])}. `,
    }
    this.canEnonce = `${quidams[0]} a $${texNombre(coeff * nbBilles, 0)}$  billes et  ${quidams[1]}  en a $${texNombre(nbBilles, 0)}$.<br>
    `
    this.question +=
      `${quidams[1]} a ` +
      (this.interactif
        ? ''
        : `$\\ldots$ fois moins de billes ${queDevant(quidams[0])}.`)
    this.canReponseACompleter = `${quidams[1]} a $\\ldots$ fois moins de billes ${queDevant(quidams[0])}.`
    this.correction = `Comme $${coeff}\\times ${nbBilles}=${coeff * nbBilles}$, ${quidams[1]} a donc $${miseEnEvidence(this.reponse)}$ fois moins de billes ${queDevant(quidams[0])}.`
  }
}
