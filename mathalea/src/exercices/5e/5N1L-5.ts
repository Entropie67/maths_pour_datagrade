import {
  ajouteDecompositionFacteursPremiers,
  solutionDecompositionFacteursPremiers,
} from '../../lib/customElements/DecompositionFacteursPremiersElement'
import {
  baremeMultiLignes,
  besoinFormulaireVerificationMultiLignes,
} from '../../lib/customElements/PossibleMultiLinesAnswerElement'
import { all, isEqual, isPrimeFactorization } from '../../lib/interactif/checks'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import { texFactorisation } from '../../lib/outils/primalite'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Décomposer en produit de facteurs premiers avec un algorithme'
export const dateDePublication = '23/10/2026'
export const interactifReady = true

/**
 * Décomposer un entier en produit de facteurs premiers avec l'algorithme posé
 * au cahier : l'élève choisit chaque diviseur premier, saisit le quotient, et
 * écrit la décomposition quand il obtient 1.
 * @author Rémi Angot
 */
export const uuid = '984fb'

export const refs = {
  'fr-fr': ['5N1L-5'],
  'fr-ch': ['10CTNO1A-16', '9R2NO1G-6', '9R3NO1G-6', 'PRQNO09B-14'],
}

const MELANGE = 4

export default class DecompositionAvecAlgorithme extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Nombre de facteurs premiers (nombres séparés par des tirets)',
      '1 : 3 facteurs\n2 : 4 facteurs\n3 : 5 facteurs\n4 : Mélange',
    ]
    this.sup = '2'
    this.besoinFormulaire2Numerique = besoinFormulaireVerificationMultiLignes
    this.sup2 = 2
    this.comment = `En interactif, l'élève pose l'algorithme comme au cahier : il choisit un diviseur premier, saisit le quotient, et recommence jusqu'à obtenir 1. Il écrit ensuite la décomposition.<br>
Le paramètre « Vérification » propose deux modes :<br>
- Vérification à la fin (1 point par question) : rien n'est corrigé pendant la saisie. Le point n'est accordé que si toutes les étapes et la décomposition sont justes. L'élève peut effacer sa dernière saisie.<br>
- Vérification à chaque étape (2 points par question) : chaque diviseur et chaque quotient est corrigé dès qu'il est validé. Une saisie fausse est barrée en rouge et l'élève la corrige juste à côté. Il obtient 2 points si tout est juste, 1 point si la décomposition finale est juste malgré une étape fausse, 0 point si elle est fausse.`
    this.spacing = 2
    this.nbQuestions = 2
    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? "Décomposer chaque nombre en produit de facteurs premiers en utilisant l'algorithme."
        : "Décomposer le nombre en produit de facteurs premiers en utilisant l'algorithme."
    const nbFacteursParQuestion = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: MELANGE,
      defaut: 2,
      nbQuestions: this.nbQuestions,
    }).map((niveau) => Number(niveau) + 2)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const nbFacteurs = nbFacteursParQuestion[i]
      const facteurs: number[] = []
      for (let k = 0; k < nbFacteurs - 1; k++) {
        facteurs.push(
          k < 2 && nbFacteurs > 3 ? choice([2, 3]) : choice([2, 3, 5]),
        )
      }
      facteurs.push(choice([5, 7, 11, 13]))
      const nombre = facteurs.reduce((produit, facteur) => produit * facteur, 1)

      if (this.questionJamaisPosee(i, nombre)) {
        handleAnswers(this, i, {
          reponse: {
            value: texFactorisation(nombre),
            compare: all([isEqual(), isPrimeFactorization()]),
          },
        })
        this.listeQuestions[i] = ajouteDecompositionFacteursPremiers(this, i, {
          nombre,
          bareme: baremeMultiLignes(this.sup2),
          style: KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
        })
        this.listeCorrections[i] = solutionDecompositionFacteursPremiers(nombre)
        this.listeReponsesCourtes[i] = `$${texFactorisation(nombre)}$`
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
