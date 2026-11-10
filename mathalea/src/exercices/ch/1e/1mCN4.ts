import { arrondi } from '../../../lib/outils/nombres'
import NombrePeriodique from '../../../modules/NombrePeriodique'
import {
    contraindreValeur,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  'Convertir un nombre périodique en écriture décimale en fraction irréductible'
export const dateDePublication = '12/09/2024'
export const dateDeModifImportante = '21/11/2024'
export const interactifReady = false
export const uuid = '8f8bc'
export const refs = {
  'fr-ch': ['1mCN-4', '9R1NO4F-10', '9R2NO4F-10', '9R3NO4F-10'],
  'fr-fr': ['PEN16'],
}

/**
 *
 * @author Nathan Scheinmann
 */

export default class NombrePeriodiqueVersFraction extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3

    this.besoinFormulaireNumerique = [
      'Longueur maximale de la période',
      1,
      '1\n2\n3',
    ]
    this.besoinFormulaire2Numerique = [
      'Nombre de chiffres maximum dans la partie entière',
      1,
      '1\n2\n3',
    ]
    this.besoinFormulaire3Numerique = [
      'Nombre de chiffres maximum dans la partie décimale (hors période)',
      4,
      '0\n1\n2\n3',
    ]
    this.besoinFormulaire4CaseACocher = ['Partie entière égale à 0']
    this.besoinFormulaire5CaseACocher = [
      'Indiquer que la calculatrice est autorisée',
    ]
    this.sup = 1
    this.sup = 1
    this.sup2 = 1
    this.sup3 = 1
    this.sup4 = false
    this.sup5 = true
  }

  nouvelleVersion() {
    this.consigne = `Écrire en fraction irréductible ${this.nbQuestions > 1 ? 'les nombres périodiques suivants' : 'le nombre périodique suivant'}.`
    if (this.sup5) {
      this.consigne += ' La calculatrice est autorisée.'
    }
    this.sup = contraindreValeur(1, 3, this.sup, 1)
    this.sup2 = contraindreValeur(1, 3, this.sup2, 1)
    this.sup3 = contraindreValeur(1, 4, this.sup3, 1)
    const nombreChiffresMaxPartieDecimale = this.sup3 - 1
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      const periode = Math.ceil(
        randint(10 ** (this.sup - 1), 10 ** this.sup - 1) /
          10 ** randint(0, this.sup),
      )
      let entier = arrondi(
        randint(10 ** (this.sup2 - 1), 10 ** this.sup2 - 1) /
          10 ** randint(0, this.sup2),
        0,
      )
      let decimal = -1
      if (nombreChiffresMaxPartieDecimale > 0) {
        const decimalDivision = randint(0, nombreChiffresMaxPartieDecimale)
        decimal = Math.ceil(
          randint(
            10 ** (nombreChiffresMaxPartieDecimale - 1),
            10 ** nombreChiffresMaxPartieDecimale - 1,
          ) /
            10 ** decimalDivision,
        )
      }
      if (this.sup4 === true) {
        entier = 0
      }
      // Déterminer si le decimal contient un 0 en première position
      const contient0PremierePosition =
        decimal > 0 &&
        nombreChiffresMaxPartieDecimale > decimal.toString().length
      const nombrePerio = new NombrePeriodique(
        entier,
        decimal,
        periode,
        contient0PremierePosition,
      )

      let texte = ''
      let texteCorr = ''

      texte = `$${nombrePerio.toString()}$`
      texteCorr = `${nombrePerio.toFractionNouvelProcedure()}`

      if (this.questionJamaisPosee(i, periode)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
