import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer le tout connaissant une partie'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '19/07/2025' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora +IA pour la factorisation

*/
export const uuid = 'eaf63'

export const refs = {
  'fr-fr': ['can2I1-02'],
  'fr-ch': ['NR'],
}
export default class CalculToutAvecPartie extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcmDisponible = true
  }

  nouvelleVersion() {
    let taux, partie, matiere

    switch (this.quotaRandint('cas', 1, 2)) {
      case 1:
        taux = choice([1, 2, 4, 5, 10])
        if (taux === 1) {
          partie = randint(1, 2) * 10 // 10 ou 20 → total 1000 ou 2000
        } else if (taux === 2) {
          partie = randint(1, 4) * 10 // 10, 20, 30 ou 40 → total 500 à 2000
        } else if (taux === 4) {
          partie = randint(4, 6) * 10 // 40 à 60 → total 1000 à 1500
        } else if (taux === 5) {
          partie = randint(4, 6) * 10 // 40 à 60 → total 800 à 1200
        } else {
          // taux === 10
          partie = randint(4, 6) * 10 // 40 à 60 → total 400 à 600
        }
        matiere = 'le grec'
        break
      case 2:
      default:
        taux = choice([20, 25, 50])
        if (taux === 20) {
          partie = randint(15, 20) * 10 // 150 à 200 → total 750 à 1000
        } else if (taux === 25) {
          partie = randint(15, 20) * 10 // 150 à 200 → total 600 à 800
        } else {
          // taux === 50
          partie = randint(15, 20) * 10 // 150 à 200 → total 300 à 400
        }
        matiere = "l'espagnol"
        break
    }

    // Parties communes
    const fracTaux = new FractionEtendue(taux, 100)
    const multiplicateur = texNombre(100 / taux, 1)
    const total = (partie * 100) / taux

    const correctionCommune = `En notant $N$ le nombre total d'élèves, 
    $${taux}\\,\\%$ de $N$ est égal à $${partie}$ élèves.<br>
Puisque $${taux}\\,\\% =\\dfrac{${taux}}{100}${taux === 1 ? '' : `=${fracTaux.texFractionSimplifiee}`}$, alors $N$ est $${fracTaux.d}$ fois plus grand que $${partie}$.<br>
Ainsi,  $N=${multiplicateur}\\times ${partie}$ élèves, soit 
    $${miseEnEvidence(`${texNombre(total, 0)}`)}$ élèves au total.`

    const distracteursCommuns = [
      `$${texNombre((partie * 10) / taux, 0)}$`,
      `${taux === 10 ? `$${texNombre(partie * taux + 10, 0)}$` : `$${texNombre(partie * taux, 0)}$`}`,
      `$${texNombre(total + 100, 1)}$`,
      `$${texNombre(total - 100, 1)}$`,
    ]

    this.question = `Dans un lycée, $${partie}$ élèves étudient ${matiere}, ${context.isDiaporama ? '<br>' : ''}ce qui représente $${taux}\\,\\%$ du nombre d'élèves inscrits ${context.isDiaporama ? '<br>' : ''}dans ce lycée.<br>`
    this.question += this.versionQcm
      ? "Le nombre d'élèves inscrits dans ce lycée est égal à :"
      : "Combien d'élèves sont inscrits dans ce lycée ?"

    this.correction = correctionCommune
    this.optionsChampTexte = { texteAvant: '<br>' }

    this.reponse = this.versionQcm ? `$${texNombre(total, 1)}$` : `${total}`

    this.distracteurs = distracteursCommuns

    this.canEnonce = `Dans un lycée, $${partie}$ élèves étudient ${matiere}, ce qui représente $${taux}\\,\\%$ du nombre d'élèves inscrits dans ce lycée.<br>
    Combien d'élèves sont inscrits dans ce lycée ?`

    this.canReponseACompleter = '$\\ldots$'
  }
}
