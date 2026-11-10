import MonomePlusieursVariables from '../../../lib/mathFonctions/MonomePlusieursVariables'
import PolynomePlusieursVariables from '../../../lib/mathFonctions/PolynomePlusieursVariables'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { pgcd } from '../../../lib/outils/primalite'
import FractionEtendue from '../../../modules/FractionEtendue'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Effectuer la division polynomiale'
export const dateDePublication = '08/10/2025'
export const interactifReady = false
export const uuid = '226f3'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['2mFctPoly1-2'],
}

/**
 * Effectuer la division polynomiale.
 * @author Nathan Scheinmann
 */

export default class ExerciceFactorisePoly extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Degré du dividende',
      4,
      '1: 2\n2: 3\n3: 4\n4: Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Degré du diviseur',
      4,
      '1: 1\n2: 2\n3: 3\n4: 4\n5: Mélange',
    ]
    this.besoinFormulaire3CaseACocher = [
      'Dividende et diviseur à coefficients entiers',
      true,
    ]
    this.besoinFormulaire4CaseACocher = [
      'Quotient à coefficients entiers',
      true,
    ]
    this.besoinFormulaire5CaseACocher = ['Reste nul', true]
    this.sup = 4
    this.sup2 = 5
    this.sup3 = true
    this.sup4 = true
    this.sup5 = true
    this.nbQuestions = 3
    this.comment = `La division en html est moins bien alignée que dans la sortie LaTeX, car KaTeX ne supporte pas encore l'option cline dans les environnements array.`
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      listeOfCase: [2, 3, 4],
      shuffle: true,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions2 = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      listeOfCase: [1, 2, 3, 4],
      shuffle: true,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texte = ''
      let texteCorr = ''
      let reste: PolynomePlusieursVariables
      let quotient: PolynomePlusieursVariables
      let diviseur: PolynomePlusieursVariables
      let dividende: PolynomePlusieursVariables
      const degreDividende = listeTypeDeQuestions[i] as number
      const degreDiviseur = Math.min(
        listeTypeDeQuestions2[i] as number,
        degreDividende,
      )
      diviseur = PolynomePlusieursVariables.createRandomPolynome(
        degreDiviseur,
        degreDiviseur,
        randint(Math.min(2, degreDiviseur + 1), degreDiviseur + 1),
        'entier',
        ['x'],
        [],
        5,
      ).reduire()
      quotient = PolynomePlusieursVariables.createRandomPolynome(
        degreDividende - diviseur.degre,
        degreDividende - diviseur.degre,
        randint(
          Math.min(2, degreDividende - diviseur.degre + 1),
          degreDividende - diviseur.degre + 1,
        ),
        'entier',
        ['x'],
        [],
        5,
      ).reduire()
      if (this.sup3 && this.sup4) {
        true
      } else if (!this.sup3 && this.sup4) {
        diviseur.monomes.forEach((monome) => {
          monome.coefficient = new FractionEtendue(
            randint(-5, 5, [0]),
            randint(1, 5),
          )
        })
      } else if (this.sup3 && !this.sup4) {
        quotient.monomes.forEach((monome) => {
          monome.coefficient = new FractionEtendue(
            randint(-5, 5, [0]),
            randint(1, 5),
          )
        })
        const ppcmCoeffQuotient = quotient.ppcm
        diviseur.monomes.forEach((monome) => {
          const facteur =
            ppcmCoeffQuotient /
            pgcd(ppcmCoeffQuotient, monome.coefficient.simplifie().num)
          monome.coefficient = monome.coefficient
            .multiplieEntier(facteur)
            .simplifie()
        })
      } else {
        diviseur.monomes.forEach((monome) => {
          monome.coefficient = new FractionEtendue(
            randint(-5, 5, [0]),
            randint(1, 5),
          )
        })
        quotient.monomes.forEach((monome) => {
          monome.coefficient = new FractionEtendue(
            randint(-5, 5, [0]),
            randint(1, 5),
          )
        })
      }
      dividende = diviseur.produit(quotient)
      if (this.sup5) {
        reste = new PolynomePlusieursVariables([
          new MonomePlusieursVariables(new FractionEtendue(0, 1), {
            variables: ['x'],
            exposants: [0],
          }),
        ])
      } else {
        reste = PolynomePlusieursVariables.createRandomPolynome(
          0,
          diviseur.degre - 1,
          randint(1, diviseur.degre),
          'entier',
          ['x'],
        ).reduire()
      }
      dividende = dividende.somme(reste).reduire()
      texte = `Effectuer la division euclidienne de $P(x) = ${dividende.toString()}$ par $D(x) = ${diviseur.toString()}$.`
      if (this.correctionDetaillee) {
        texteCorr = `Effectuons la division euclidienne :<br><br>`
        texteCorr += dividende.afficherDivision(diviseur)
      }
      texteCorr += `<br>Le quotient est $${miseEnEvidence(`Q(x) = ${quotient.toString()}`)}$ et le reste est $${miseEnEvidence(`R(x) = ${reste.toString() === '' ? '0' : reste.toString()}`)}$.<br>`
      texteCorr += `Remarquons que l'on a ainsi $${dividende.toString()} = ${diviseur.toString(true)}\\times ${quotient.toString(true)} ${reste.toStringAlgebrique()}$.`

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
