import Decimal from 'decimal.js'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  contraindreValeur,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { miseEnEvidence } from '../../lib/outils/embellissements'

export const titre =
  'Calculer des produits et des quotients de nombres relatifs'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '23/09/2022'

export const uuid = '745ba'

export const refs = {
  'fr-fr': ['4C10'],
  'fr-ch': ['10LCNO2C-1', '10LSNO2C-1', '11CTNO1B-1', 'PRQNO06B-12'],
}
/**
 * @author ???
 */
export default class ProduitsEtQuotientRelatifs extends Exercice {
  constructor() {
    super()

    this.consigne = 'Calculer.'
    this.sup = 1
    this.sup2 = 1

    this.besoinFormulaireNumerique = [
      'Opérations',
      3,
      '1 : Multiplication\n2 : Division\n3 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Opérandes',
      4,
      '1 : Entiers relatifs (quotient exact)\n2 : Un entier et un décimal (quotient décimal simple)\n3 : Rationnels\n4 : Mélange',
    ]
  }

  nouvelleVersion() {
    this.sup = contraindreValeur(1, 3, this.sup, 3)
    this.sup2 = contraindreValeur(1, 4, this.sup2, 1)
    const typesDeQuestions = []
    if (this.sup % 2 === 1) typesDeQuestions.push('multiplication')
    if (this.sup > 1) typesDeQuestions.push('division')
    const typesDeNombre = this.sup2 < 4 ? [this.sup2] : [1, 2, 3]
    const listeTypesDeQuestion = combinaisonListes(
      typesDeQuestions,
      this.nbQuestions,
    )
    const listeTypesDeNombre = combinaisonListes(
      typesDeNombre,
      this.nbQuestions,
    )
    const ponderation = [
      ['-', '-'],
      ['-', '-'],
      ['-', '-'],
      ['-', '+'],
      ['+', '-'],
      ['-', '+'],
      ['+', '-'],
      ['+', '+'],
    ]
    for (
      let i = 0, texte, texteCorr, a, b, c, num1, num2, den1, den2, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const signes = choice(ponderation)
      switch (listeTypesDeNombre[i]) {
        case 1: // entiers
          a = new Decimal(randint(2, 9) * (signes[0] === '-' ? -1 : 1))
          b = new Decimal(randint(2, 9) * (signes[1] === '-' ? -1 : 1))
          break

        case 2: // un entier un décimal
          if (choice([true, false])) {
            a = new Decimal(randint(2, 9) * (signes[0] === '-' ? -1 : 1))
            b = new Decimal(randint(11, 29) * (signes[1] === '-' ? -1 : 1)).div(
              10,
            )
          } else {
            a = new Decimal(randint(11, 29) * (signes[0] === '-' ? -1 : 1)).div(
              10,
            )
            b = new Decimal(randint(2, 9) * (signes[1] === '-' ? -1 : 1))
          }
          break
        case 3: // rationnels
        default:
          den1 = randint(2, 9)
          num1 = randint(2, 15, [
            den1,
            2 * den1,
            3 * den1,
            4 * den1,
            5 * den1,
            6 * den1,
            7 * den1,
          ]) // on évite les fractions réductibles
          den2 = randint(2, 9)
          num2 = randint(2, 15, [
            den2,
            2 * den2,
            3 * den2,
            4 * den2,
            5 * den2,
            6 * den2,
            7 * den2,
          ]) // on évite les fractions réductibles
          a = new FractionEtendue(num1 * (signes[0] === '-' ? -1 : 1), den1)
          b = new FractionEtendue(num2 * (signes[1] === '-' ? -1 : 1), den2)
          break
      }
      const fois = function (
        a: Decimal | FractionEtendue,
        b: Decimal | FractionEtendue,
      ): typeof a {
        if (a instanceof Decimal) return a.mul(b as Decimal) as Decimal
        return a.produitFraction(b as FractionEtendue)
      }
      switch (listeTypesDeQuestion[i]) {
        case 'multiplication':
          if (listeTypesDeNombre[i] < 3) {
            texte = `$${texNombre(a, 1)}\\times ${ecritureParentheseSiNegatif(b)} = $${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase)}`
            texteCorr =
              texte.split('=')[0] + ' = ' + texNombre(fois(a, b), 1) + '$'
            handleAnswers(this, i, {
              reponse: {
                value: fois(a, b),
                options: { nombreDecimalSeulement: true },
              },
            })
          } else {
            const aF = a as FractionEtendue
            const bF = b as FractionEtendue
            texte = `$${aF.texFSD}\\times ${bF.texFSP} = $${ajouteChampTexteMathLive(this, i, KeyboardType.clavierFullOperations)}`
            texteCorr =
              texte.split('=')[0] +
              ' = ' +
              aF.texProduitFraction(bF, true) +
              '$'
            handleAnswers(this, i, {
              reponse: {
                value: aF.produitFraction(bF).texFraction,
                options: { fractionEgale: true },
              },
            })
          }
          break

        case 'division':
        default:
          if (listeTypesDeNombre[i] < 3) {
            c = fois(a, b)
            texte = `$\\dfrac{${texNombre(c, 1)}}{${texNombre(a, 1)}} = $${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase)}`
            texteCorr = texte.split('=')[0] + ' = ' + texNombre(b, 1) + '$'
            handleAnswers(this, i, { reponse: { value: b } })
          } else {
            const aF = a as FractionEtendue
            const bF = b as FractionEtendue
            c = aF.produitFraction(bF)
            texte = `$\\dfrac{${c.texFraction}}{${aF.texFraction}} = $${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBaseAvecFraction)}`
            texteCorr = texte.split('=')[0]
            b = c.produitFraction(aF.inverse())
            texteCorr += ` = ${c.texProduitFraction(aF.inverse(), true)}$`
            handleAnswers(this, i, {
              reponse: {
                value: bF.simplifie(),
                options: { fractionEgale: true },
              },
            })
          }
          break
      }
      // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
      const textCorrSplit = texteCorr.split('=')
      let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
      aRemplacer = aRemplacer.replace('$', '')

      texteCorr = ''
      for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
        texteCorr += textCorrSplit[ee] + '='
      }
      texteCorr += `$ $${miseEnEvidence(aRemplacer)}$`
      // Fin de cette uniformisation

      if (this.questionJamaisPosee(i, a, b, listeTypesDeQuestion[i])) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
