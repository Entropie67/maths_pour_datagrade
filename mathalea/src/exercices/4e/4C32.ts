/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/interactivity/mathLive.ecritureScientifique.test.ts ⚠️
 */

import Decimal from 'decimal.js'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { sp } from '../../lib/outils/outilString'
import {
  scientifiqueToDecimal,
  stringNombre,
  texNombre,
} from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'

export const titre = 'Associer un nombre décimal à sa notation scientifique'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * Écrire un nombre décimal en notation scientifique et inversement
 * @author Jean-claude Lhote
 */

export const uuid = 'a0d17'

export const refs = {
  'fr-fr': ['4C32', 'BP2AutoF1', '3AutoN07-2'],
  'fr-ch': ['10CTNO5A-1', '10LCNO5A-1', '10LSNO5A-1', '11CTNO3A-1', 'PRQNO07C-1', 'PRQNO15C-4'],
}
export default class NotationScientifique extends Exercice {
  can: boolean
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de questions',
      2,
      '1 : Traduire en notation scientifique\n2 : Traduire en notation décimale',
    ]
    this.besoinFormulaire2Numerique = [
      'Niveau de difficulté',
      3,
      '1 : Facile\n2 : Moyen\n3 : Difficile',
    ]
    this.besoinFormulaire3CaseACocher = ['Avec des nombres négatifs', false]
    this.sup = 1
    this.sup2 = 1
    this.sup3 = false
    this.nbQuestions = 5
    this.interactif = false
    this.can = false
  }

  nouvelleVersion() {
    Decimal.set({ toExpNeg: -15, toExpPos: 20 })
    let reponse
    if (this.sup === 1)
      this.consigne =
        this.nbQuestions === 1
          ? 'Donner la notation scientifique du nombre suivant.'
          : 'Donner la notation scientifique des nombres suivants.'
    else
      this.consigne =
        this.nbQuestions === 1
          ? "Donner l'écriture décimale du nombre suivant."
          : "Donner l'écriture décimale des nombres suivants."
    let typesDeQuestionsDisponibles
    if (this.sup2 === 1) typesDeQuestionsDisponibles = [0, 0, 0, 1, 1]
    else if (this.sup2 === 2) typesDeQuestionsDisponibles = [0, 1, 1, 2, 2]
    else typesDeQuestionsDisponibles = [2, 2, 3, 3, 3]

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (
      let i = 0,
        texteAMC,
        texte,
        texteCorr,
        mantisse,
        exp,
        decimalstring,
        scientifiquestring,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const signe = this.sup3 ? choice([-1, 1]) : 1
      switch (listeTypeDeQuestions[i]) {
        case 0:
          mantisse = new Decimal(randint(1, 9))
          if (!context.isAmc) {
            exp = randint(1, 5)
          } else {
            exp = randint(1, 3)
          }

          break
        case 1:
          mantisse = new Decimal(randint(11, 99)).div(10)
          if (!context.isAmc) {
            exp = randint(1, 5)
          } else {
            exp = randint(1, 3)
          }
          break
        case 2:
          if (choice([false, true]))
            mantisse = new Decimal(randint(111, 999)).div(100)
          else
            mantisse = new Decimal(randint(1, 9))
              .plus(randint(1, 9) * 100)
              .div(100)
          if (!context.isAmc) {
            exp = randint(1, 7) * choice([-1, 1])
          } else {
            exp = randint(1, 3) * choice([-1, 1])
          }
          break
        case 3:
        default:
          if (choice([true, false]))
            mantisse = new Decimal(randint(1, 19) * 5)
              .plus(randint(1, 9) * 1000)
              .div(1000)
          else mantisse = new Decimal(randint(1111, 9999)).div(1000)
          if (!context.isAmc) {
            exp = randint(1, 7) * choice([-1, 1])
          } else {
            exp = randint(1, 3) * choice([-1, 1])
          }

          break
      }

      scientifiquestring = `${texNombre(mantisse.mul(signe), 8)}\\times 10^{${exp}}`
      decimalstring = scientifiqueToDecimal(mantisse.mul(signe).toNumber(), exp)

      if (this.sup === 1) {
        reponse = `${stringNombre(mantisse.mul(signe), 8)}e${exp}`
        texteAMC = `$${decimalstring}$`
        texteCorr = `$${decimalstring} = ${miseEnEvidence(scientifiquestring)}$`
      } else {
        reponse = mantisse.mul(Decimal.pow(10, exp)).mul(signe)
        texteCorr = `$${scientifiquestring} = ${miseEnEvidence(decimalstring)}$`
        texteAMC = `$${scientifiquestring}$`
      }
      if (context.isAmc) {
        texte = texteAMC
      } else {
        const expression = this.sup === 1 ? decimalstring : scientifiquestring
        texte = `$${expression}${sp()}=${this.interactif ? '' : `${sp()}\\dots`}$`
        if (this.interactif) {
          texte += ajouteChampTexteMathLive(
            this,
            i,
            '  ' +
              (this.sup === 2
                ? KeyboardType.clavierDeBase
                : KeyboardType.clavierFullOperations),
          )
        }
      }

      if (this.questionJamaisPosee(i, mantisse, exp)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        if (this.sup === 1) {
          handleAnswers(this, i, {
            reponse: {
              value: reponse,
              options: { ecritureScientifique: true },
            },
          })
        } else {
          handleAnswers(this, i, { reponse: { value: reponse } })
        }
        i++
      }
      cpt++
    }
    if (this.can) {
      this.listeQuestions[0] = `${this.consigne.substring(0, this.consigne.length - 1)} : ${this.listeQuestions[0]}`
      this.consigne = ''
    }
    listeQuestionsToContenu(this)
  }
}
