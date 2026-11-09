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
export const titre = 'Additionner et soustraire des polynômes'
export const dateDePublication = '19/08/2024'
export const interactifReady = true

/**
 * Réduire une expression littérale
 * @author Nathan Scheinmann
 */

export const uuid = '4b495'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['1mCL1-12', '10LCFA4F-4', '10LSFA4F-4', '11CTFA3E-8', '11LCFA3E-11', '11LSFA3E-11'],
}

export default class nomExercice extends Exercice {
  constructor() {
    super()
    this.consigne =
      this.nbQuestions > 1
        ? 'Réduire les expressions suivantes.'
        : "Réduire l'expression suivante."

    this.besoinFormulaireNumerique = [
      'Type de calcul',
      4,
      'Addition\nSoustraction\n Avec un signe devant la première parenthèse\nMélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Coefficients',
      3,
      'Entiers \n2 : Fractionnaires \n3 : Mélange',
    ]
    this.besoinFormulaire3Numerique = [
      'Degré maximum (au moins égal au degré minimum)',
      5,
      '1\n2\n3\n4\n5',
    ]
    this.besoinFormulaire4Numerique = [
      'Nombre de variables différentes',
      5,
      '1\n2\n3\n4\n5',
    ]
    this.besoinFormulaire5Numerique = [
      'Nombre de termes dans un polynôme (limité par le degré et les variables)',
      5,
      '2\n3\n4\n5\n6',
    ]
    // this.besoinFormulaireCaseACocher = ['Type de coefficients', 3, 'Entiers\nFractionnaires\nMélange']
    // this.besoinFormulaire5Numerique = ['Nombre de termes', 5, '1\n2\n3\n4\n5']
    this.sup = 4
    this.sup2 = 1
    this.sup3 = 3
    this.sup4 = 3
    this.sup5 = 2
    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    let typeQuestionsDisponibles: ('addition' | 'soustraction' | 'signe')[]
    if (this.sup === 1) {
      typeQuestionsDisponibles = ['addition']
    } else if (this.sup === 2) {
      typeQuestionsDisponibles = ['soustraction']
    } else if (this.sup === 3) {
      typeQuestionsDisponibles = ['signe']
    } else {
      typeQuestionsDisponibles = shuffle(['addition', 'soustraction', 'signe'])
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
      // Une variable offre degMax + 1 monômes ; au degré 1, il y en a
      // autant que de variables, plus la constante. Les autres réglages
      // permettent au moins les six termes proposés dans le formulaire.
      const nbTermes =
        variablesSelect.length === 1 || degMax === 1
          ? Math.min(this.sup5 + 1, degMax + variablesSelect.length)
          : this.sup5 + 1
      const typeCoeffListe = ['entier', 'fractionnaire']
      let typeofCoeff = []
      let solution: PolynomePlusieursVariables
      if (this.sup2 === 1) {
        typeofCoeff = ['entier']
      } else if (this.sup2 === 2) {
        typeofCoeff = ['fraction']
      } else {
        typeofCoeff = typeCoeffListe
      }
      const p1 = PolynomePlusieursVariables.createRandomPolynome(
        degMin,
        degMax,
        nbTermes,
        choice(typeofCoeff),
        variablesSelect,
      )
      const p2 = PolynomePlusieursVariables.createRandomPolynome(
        degMin,
        degMax,
        nbTermes,
        choice(typeofCoeff),
        variablesSelect,
        getRandomSubarray(
          p1.monomes,
          randint(Math.min(1, this.sup5), nbTermes),
        ),
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
      switch (listeTypeDeQuestions[i]) {
        case 'addition': {
          texte = `$${lettreDepuisChiffre(i + 1)}=\\left(${p1.toString()}\\right)+\\left(${p2.toString()}\\right)$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=${p1.somme(p2).toString()}=${miseEnEvidence(p1.somme(p2).reduire().toString())}$`
          solution = p1.somme(p2).reduire()
          break
        }
        case 'soustraction': {
          texte = `$${lettreDepuisChiffre(i + 1)}=\\left(${p1.toString()}\\right)-\\left(${p2.toString()}\\right)$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=${p1.difference(p2).toString()}=${miseEnEvidence(p1.difference(p2).reduire().toString())}$`
          solution = p1.difference(p2).reduire()
          break
        }
        case 'signe': {
          const randomInt = randint(0, 1)
          const signe = randomInt === 0 ? '-' : '+'
          if (signe === '-') {
            texte = `$${lettreDepuisChiffre(i + 1)}=-\\left(${p1.toString()}\\right)-\\left(${p2.toString()}\\right)$`
            texteCorr = `$${lettreDepuisChiffre(i + 1)}=${p1.oppose().difference(p2).toString()}=${miseEnEvidence(p1.oppose().difference(p2).reduire().toString())}$`
            solution = p1.oppose().difference(p2).reduire()
          } else {
            texte = `$${lettreDepuisChiffre(i + 1)}=-\\left(${p1.toString()}\\right)+\\left(${p2.toString()}\\right)$`
            texteCorr = `$${lettreDepuisChiffre(i + 1)}=${p1.oppose().somme(p2).toString()}=${miseEnEvidence(p1.oppose().somme(p2).reduire().toString())}$`
            solution = p1.oppose().somme(p2).reduire()
          }

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
