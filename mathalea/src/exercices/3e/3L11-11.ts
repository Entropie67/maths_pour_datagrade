import {
  all,
  isEqual,
  isReduced,
  onlyIrreducibleFractions,
} from '../../lib/interactif/checks'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import MonomePlusieursVariables from '../../lib/mathFonctions/MonomePlusieursVariables'
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
export const titre = 'Additionner et soustraire des monômes'
export const dateDePublication = '19/08/2024'
export const interactifReady = true

/**
 * Réduire une expression littérale
 * @author Nathan Scheinmann
 */

export const uuid = '2f983'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['1mCL1-10', '10LCFA4D-8', '10LSFA4D-8', '11LCFA3E-3', '11LSFA3E-3', 'PRQAL03A-3'],
}

export default class NomExercice extends Exercice {
  constructor() {
    super()
    this.consigne =
      this.nbQuestions > 1
        ? 'Réduire les expressions suivantes.'
        : "Réduire l'expression suivante."

    this.besoinFormulaireNumerique = [
      'Coefficients',
      3,
      'Entiers \n2 : Fractionnaires \n3 : Mélange',
    ]
    this.besoinFormulaire2Numerique = ['Degré minimum', 6, '0\n1\n2\n3\n4\n5']
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
    this.besoinFormulaire5Numerique = ['Nombre de termes', 5, '2\n3\n4\n5\n6']
    this.sup = 1
    this.sup2 = 3
    this.sup3 = 3
    this.sup4 = 3
    this.sup5 = 2
    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = [1]

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte, texteCorr: string
      const degMin = this.sup2 - 1
      const degMax = Math.max(this.sup3, this.sup2 - 1)
      // const variables = ['x', 'y', 'z', 'r', 's', 't']
      const variables = ['x', 'y', 'z', 'a', 'b', 'c', 'k']
      const variablesSelect = getRandomSubarray(variables, this.sup4)
      const typeCoeffListe = ['entier', 'fractionnaire']
      let typeofCoeff = []
      let rep: PolynomePlusieursVariables =
        PolynomePlusieursVariables.createRandomPolynome(1, 1, 1, 'entier', [
          'x',
        ])
      texte = ''
      texteCorr = ''
      switch (listeTypeDeQuestions[i]) {
        case 1: {
          if (this.sup === 1) {
            typeofCoeff = ['entier']
          } else if (this.sup === 2) {
            typeofCoeff = ['fraction']
          } else {
            typeofCoeff = typeCoeffListe
          }

          const q = MonomePlusieursVariables.createRandomMonome(
            randint(degMin, degMax),
            choice(typeofCoeff),
            variablesSelect,
          )
          let r: MonomePlusieursVariables
          const randomInt = randint(0, 3)
          if (randomInt === 0 || randomInt === 1 || randomInt === 2) {
            r = MonomePlusieursVariables.createMonomeFromPartieLitterale(
              choice(typeofCoeff),
              q.partieLitterale,
            )
          } else {
            r = MonomePlusieursVariables.createRandomMonome(
              randint(degMin, degMax),
              choice(typeofCoeff),
              variablesSelect,
            )
          }
          let monomesListe = [q, r]
          if (this.sup5 + 1 > 3) {
            monomesListe.push(
              MonomePlusieursVariables.createRandomMonome(
                randint(degMin, degMax),
                choice(typeofCoeff),
                variablesSelect,
              ),
            )
            const randomInt = randint(0, 3)
            if (randomInt === 0 || randomInt === 1 || randomInt === 2) {
              monomesListe.push(
                MonomePlusieursVariables.createMonomeFromPartieLitterale(
                  choice(typeofCoeff),
                  monomesListe[2].partieLitterale,
                ),
              )
            } else {
              monomesListe.push(
                MonomePlusieursVariables.createRandomMonome(
                  randint(degMin, degMax),
                  choice(typeofCoeff),
                  variablesSelect,
                ),
              )
            }

            for (let i = 0; i < this.sup5 + 1 - 4; i++) {
              monomesListe.push(
                MonomePlusieursVariables.createRandomMonome(
                  randint(degMin, degMax),
                  choice(typeofCoeff),
                  variablesSelect,
                ),
              )
            }
          } else if (this.sup5 + 1 === 3) {
            monomesListe.push(
              MonomePlusieursVariables.createRandomMonome(
                randint(degMin, degMax),
                choice(typeofCoeff),
                variablesSelect,
              ),
            )
          }
          monomesListe = shuffle(monomesListe)
          // On redéfinit à présent le coefficient des monômes fractionnaires afin que toutes les fractions soient des multiples les unes des autres
          let testPremiereFraction = true
          let denominateurCommun = 1
          for (let i = 0; i < monomesListe.length; i++) {
            if (monomesListe[i].coefficient.den !== 1) {
              if (testPremiereFraction) {
                denominateurCommun = monomesListe[i].coefficient.den
                testPremiereFraction = false
              } else {
                monomesListe[i].coefficient = new FractionEtendue(
                  randint(-10, 10, [0]),
                  denominateurCommun * randint(-2, 2, [0]),
                )
              }
            }
          }
          const t = new PolynomePlusieursVariables(monomesListe)
          rep = PolynomePlusieursVariables.PolynomeReduit(monomesListe)
          texte =
            `$${lettreDepuisChiffre(i + 1)}=${t.toString()}$` +
            ajouteChampTexteMathLive(this, i, KeyboardType.lyceeClassique, {
              texteAvant: '$=$',
            })
          texteCorr = `$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(rep.toString())}$`
        }
      }
      const solution = texteCorr.split('=')[1]
      if (this.questionJamaisPosee(i, solution)) {
        handleAnswers(this, i, {
          reponse: {
            value: rep.toString(),
            compare: all([isEqual(), isReduced(), onlyIrreducibleFractions()]),
          },
        })
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
