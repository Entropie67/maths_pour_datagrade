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
import {
  choice,
  combinaisonListes,
  getRandomSubarray,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Multiplier des monômes'
export const dateDePublication = '19/08/2024'
export const interactifReady = true

/**
 * Réduire une expression littérale
 * @author Nathan Scheinmann
 */

export const uuid = '62111'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['1mCL1-11', '10LCFA4D-9', '10LSFA4D-9', '11LCFA3E-4', '11LSFA3E-4', 'PRQAL03B-1'],
}

export default class nomExercice extends Exercice {
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
    this.besoinFormulaire5Numerique = ['Nombre de termes', 2, '2\n3']
    // this.besoinFormulaireCaseACocher = ['Type de coefficients', 3, 'Entiers\nFractionnaires\nMélange']
    // this.besoinFormulaire5Numerique = ['Nombre de termes', 5, '1\n2\n3\n4\n5']
    this.sup = 1
    this.sup2 = 3
    this.sup3 = 3
    this.sup4 = 3
    this.sup5 = 1
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
      const variables = ['x', 'y', 'z', 'r', 's', 't']
      const variablesSelect = getRandomSubarray(variables, this.sup4)
      const typeCoeffListe = ['entier', 'fractionnaire']
      let typeofCoeff = []
      let p: MonomePlusieursVariables
      switch (listeTypeDeQuestions[i]) {
        case 1:
          {
            if (this.sup === 1) {
              typeofCoeff = ['entier']
            } else if (this.sup === 2) {
              typeofCoeff = ['fraction']
            } else {
              typeofCoeff = typeCoeffListe
            }
            texte = ''
            texteCorr = ''
            const listMonome = []
            const q1 = MonomePlusieursVariables.createRandomMonome(
              randint(degMin, degMax),
              choice(typeofCoeff),
              variablesSelect,
            )
            const q2 = MonomePlusieursVariables.createRandomMonome(
              randint(degMin, degMax),
              choice(typeofCoeff),
              variablesSelect,
            )
            listMonome.push(q1)
            listMonome.push(q2)
            if (this.sup5 > 1) {
              const q3 = MonomePlusieursVariables.createRandomMonome(
                randint(degMin, degMax),
                choice(typeofCoeff),
                variablesSelect,
              )
              listMonome.push(q3)
            }
            // Multplier les éléments de la liste ensemble en utilisant la méthode produit
            p = listMonome[0]
            for (let i = 1; i < listMonome.length; i++) {
              p = p.produit(listMonome[i])
            }
            // Créer le string qui multiplie les monômes ensemble avec \times en séparation
            let t = ''
            for (let i = 0; i < listMonome.length; i++) {
              t += listMonome[i].toStringAvecParentheses()
              if (i < listMonome.length - 1) {
                t += ' \\times '
              }
            }
            texte =
              `$${lettreDepuisChiffre(i + 1)}=${t}$` +
              ajouteChampTexteMathLive(this, i, KeyboardType.lyceeClassique, {
                texteAvant: '$=$',
              })
            texteCorr = `$${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(p.toString())}$`
          }
          if (this.questionJamaisPosee(i, texteCorr)) {
            handleAnswers(this, i, {
              reponse: {
                value: p.toString(),
                compare: all([
                  isEqual(),
                  isReduced(),
                  onlyIrreducibleFractions(),
                ]),
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
}
