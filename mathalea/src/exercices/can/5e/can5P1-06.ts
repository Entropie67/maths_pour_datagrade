import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une partie connaissant le tout'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '21/07/2025' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export const uuid = '6a3da'

export const refs = {
  'fr-fr': ['can5P1-06', '5P1C-flash4', '2I11-flash5'],
  'fr-ch': ['9R1FA1D-9', '9R2FA1D-9', '9R3FA1D-9'],
}
export default class CalculPartieAvecTout extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcmDisponible = true
  }

  nouvelleVersion() {
    let taux, total, matiere

    switch (this.quotaRandint('typeDeQuestions', 1, 2)) {
      case 1:
        taux = choice([1, 2, 4, 5, 10])
        total = randint(4, 15) * 100
        matiere = 'le grec'
        break
      case 2:
      default:
        taux = choice([20, 25, 50])
        total = randint(4, 15) * 100
        matiere = "l'espagnol"
        break
    }

    // Calcul de la partie
    const partie = (total * taux) / 100

    const correctionCommune = `$${taux}\\,\\%$ de $${texNombre(total, 0)}  = ${texNombre(taux / 100, 2)} \\times ${texNombre(total, 0)} = ${miseEnEvidence(`${texNombre(partie, 0)}`)}$<br>
    Donc $${miseEnEvidence(`${texNombre(partie, 0)}`)}$ élèves étudient ${matiere}.`

    const distracteursCommuns = [
      `$${texNombre(total * (1 - taux / 100), 0)}$`,
      `${taux === 10 ? `$${texNombre(partie + 10, 0)}$` : `$${texNombre(total / taux, 0)}$`}`, // erreur division au lieu de multiplication
      `$${texNombre(partie + 50, 0)}$`, // erreur +50
      `$${texNombre(taux, 0)}$`,
    ]

    this.question = `Dans un lycée, il y a $${texNombre(total, 0)}$ élèves inscrits. <br>
    $${taux}\\,\\%$ d'entre eux étudient ${matiere}.<br>`
    this.question += this.versionQcm
      ? `Le nombre d'élèves qui étudient ${matiere} est égal à :`
      : `Combien d'élèves étudient ${matiere} ?`

    this.correction = correctionCommune
    this.optionsChampTexte = { texteAvant: '<br>' }

    this.reponse = this.versionQcm ? `$${texNombre(partie, 0)}$` : `${partie}`

    this.distracteurs = distracteursCommuns

    this.canEnonce = `Dans un lycée, il y a $${texNombre(total, 0)}$ élèves inscrits. $${taux}\\,\\%$ d'entre eux étudient ${matiere}.<br>
    Combien d'élèves étudient ${matiere} ?`

    this.canReponseACompleter = '$\\ldots$'
  }
}
