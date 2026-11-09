import {
  all,
  isEqual,
  isReduced,
  onlyIrreducibleFractions,
} from '../../lib/interactif/checks'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import PolynomePlusieursVariables from '../../lib/mathFonctions/PolynomePlusieursVariables'
import {
  choice,
  combinaisonListes,
  getRandomSubarray,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  "Développer une expression à l'aide de la distributivité simple et double"
export const dateDePublication = '04/09/2024'
export const interactifReady = true

/**
 * Réduire une expression littérale
 * @author Nathan Scheinmann
 */

export const uuid = '1cd08'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['1mCL1-6', '11LCFA3F-9', '11LSFA3F-9', 'PRQAL03D-4'],
}

export default class nomExercice extends Exercice {
  constructor() {
    super()
    this.consigne =
      this.nbQuestions > 1
        ? 'Développer et réduire les expressions suivantes.'
        : "Développer et réduire l'expression suivante."

    this.besoinFormulaireNumerique = [
      'Type de calcul',
      3,
      'Distributivité simple\nDistributivité double\nMélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Coefficients',
      3,
      'Entiers \n2 : Fractionnaires \n3 : Mélange',
    ]
    this.besoinFormulaire3Numerique = ['Degré maximum', 5, '1\n2\n3\n4\n5']
    this.besoinFormulaire4Numerique = [
      'Nombre de variables différentes',
      5,
      '1\n2\n3\n4\n5',
    ]
    this.besoinFormulaire5CaseACocher = [
      "Présence d'un signe devant l'expression (si distributivité double)",
    ]
    // this.besoinFormulaireCaseACocher = ['Type de coefficients', 3, 'Entiers\nFractionnaires\nMélange']
    // this.besoinFormulaire5Numerique = ['Nombre de termes', 5, '1\n2\n3\n4\n5']
    this.sup = 3
    this.sup2 = 1
    this.sup3 = 2
    this.sup4 = 2
    this.sup5 = true
    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Développer et réduire les expressions suivantes.'
        : "Développer et réduire l'expression suivante."

    let typeQuestionsDisponibles: ('simple' | 'double')[]
    if (this.sup === 1) {
      typeQuestionsDisponibles = ['simple']
    } else if (this.sup === 2) {
      typeQuestionsDisponibles = ['double']
    } else {
      typeQuestionsDisponibles = shuffle([
        'simple',
        'double',
        'simple',
        'double',
      ])
    }
    const degMin = 0
    const listeTypeDeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte, texteCorr: string
      const degMax = Math.max(this.sup3, 1)
      const variables = ['x', 'y', 'z', 'r', 's', 't']
      const variablesSelect = getRandomSubarray(variables, this.sup4)
      const typeCoeffListe = ['entier', 'fractionnaire']
      let typeofCoeff = []
      let p1: PolynomePlusieursVariables
      let p2: PolynomePlusieursVariables
      let solution: PolynomePlusieursVariables
      if (this.sup2 === 1) {
        typeofCoeff = ['entier']
      } else if (this.sup2 === 2) {
        typeofCoeff = ['fraction']
      } else {
        typeofCoeff = typeCoeffListe
      }
      switch (listeTypeDeQuestions[i]) {
        case 'simple': {
          p1 = PolynomePlusieursVariables.createRandomPolynome(
            degMin,
            degMax,
            1,
            choice(typeofCoeff),
            variablesSelect,
          )
          p2 = PolynomePlusieursVariables.createRandomPolynome(
            degMin,
            degMax,
            2,
            choice(typeofCoeff),
            variablesSelect,
          )
          // On redéfinit à présent le coefficient des monômes fractionnaires afin que toutes les fractions soient des multiples les unes des autres
          let testPremiereFraction = true
          let denominateurCommun = 1
          for (let i = 0; i < p1.monomes.length; i++) {
            if (p1.monomes[i].coefficient.den !== 1) {
              if (testPremiereFraction) {
                denominateurCommun = p1.monomes[i].coefficient.den
                testPremiereFraction = false
              } else {
                p1.monomes[i].coefficient = new FractionEtendue(
                  randint(-10, 10, [0]),
                  denominateurCommun * randint(-2, 2, [0]),
                )
              }
            }
          }
          for (let i = 0; i < p2.monomes.length; i++) {
            if (p2.monomes[i].coefficient.den !== 1) {
              if (testPremiereFraction) {
                denominateurCommun = p2.monomes[i].coefficient.den
                testPremiereFraction = false
              } else {
                p2.monomes[i].coefficient = new FractionEtendue(
                  randint(-10, 10, [0]),
                  denominateurCommun * randint(-2, 2, [0]),
                )
              }
            }
          }
          if (
            p1.monomes[0].coefficient.num === 1 &&
            p1.monomes[0].coefficient.den === 1
          ) {
            p1.monomes[0].coefficient = new FractionEtendue(-2, 1)
          }
          texte = `$${lettreDepuisChiffre(i + 1)}=${p1.toString() === '-1' ? '-' : `${p1.toString()}`}\\left(${p2.toString()}\\right)$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=${p1.produit(p2).toString()}=${miseEnEvidence(p1.produit(p2).reduire().toString())}$`
          solution = p1.produit(p2).reduire()
          break
        }
        case 'double': {
          p1 = PolynomePlusieursVariables.createRandomPolynome(
            degMin,
            degMax,
            2,
            choice(typeofCoeff),
            variablesSelect,
          )
          p2 = PolynomePlusieursVariables.createRandomPolynome(
            degMin,
            degMax,
            2,
            choice(typeofCoeff),
            variablesSelect,
            getRandomSubarray(p1.monomes, randint(1, 0)),
          )
          // On redéfinit à présent le coefficient des monômes fractionnaires afin que toutes les fractions soient des multiples les unes des autres
          let testPremiereFraction = true
          let denominateurCommun = 1
          for (let i = 0; i < p1.monomes.length; i++) {
            if (p1.monomes[i].coefficient.den !== 1) {
              if (testPremiereFraction) {
                denominateurCommun = p1.monomes[i].coefficient.den
                testPremiereFraction = false
              } else {
                p1.monomes[i].coefficient = new FractionEtendue(
                  randint(-10, 10, [0]),
                  denominateurCommun * randint(-2, 2, [0]),
                )
              }
            }
          }
          for (let i = 0; i < p2.monomes.length; i++) {
            if (p2.monomes[i].coefficient.den !== 1) {
              if (testPremiereFraction) {
                denominateurCommun = p2.monomes[i].coefficient.den
                testPremiereFraction = false
              } else {
                p2.monomes[i].coefficient = new FractionEtendue(
                  randint(-10, 10, [0]),
                  denominateurCommun * randint(-2, 2, [0]),
                )
              }
            }
          }
          let p3: PolynomePlusieursVariables
          p3 = p1
          let avecSigne = false
          if (this.sup5) {
            if (randint(0, 1) === 0) {
              p3 = p1.oppose()
              avecSigne = true
            } else {
              p3 = p1
            }
          }
          texte = `$${lettreDepuisChiffre(i + 1)}=${avecSigne ? '-' : ''}\\left(${p1.toString()}\\right)\\left(${p2.toString()}\\right)$`
          texteCorr = `$\\begin{aligned}${lettreDepuisChiffre(i + 1)}&=${avecSigne ? `\\left(${p1.oppose().toString()}\\right)\\left(${p2.toString()}\\right)\\\\&=` : ''}${p3.produit(p2).toString()}\\\\&=${miseEnEvidence(p3.produit(p2).reduire().toString())}\\end{aligned}$`
          solution = p3.produit(p2).reduire()
          break
        }
      }
      texte += ajouteChampTexteMathLive(this, i, KeyboardType.lyceeClassique, {
        texteAvant: '$=$',
      })
      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        handleAnswers(this, i, {
          reponse: {
            value: solution.toString(),
            compare: all([isEqual(), isReduced(), onlyIrreducibleFractions()]),
          },
        })
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
