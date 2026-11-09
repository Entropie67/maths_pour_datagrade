import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer le reste de la division euclidienne d’un multiple d’un entier'
export const dateDePublication = '10/10/2026'
export const uuid = 'c3529'
export const interactifReady = true
export const refs = { 'fr-fr': ['TEA1-25'], 'fr-ch': [] }

/** @author Stéphane Guyon */
export default class ResteDivisionEuclidienneMultiple extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.nbQuestionsModifiable = true
  }

  nouvelleVersion(): void {
    const divisor = randint(2, 12)
    const initialRemainder = randint(0, divisor - 1)
    // Une seule question en non interactif : l'énoncé porte la consigne.
    const questionUnique = this.nbQuestions === 1 && !this.interactif
    this.consigne = `Sachant que le reste de la division euclidienne d’un entier $a$ par $${divisor}$ est $${initialRemainder}$${questionUnique ? '.' : ', déterminer les restes des divisions euclidiennes suivantes.'}`
    for (
      let i = 0, attempts = 0;
      i < this.nbQuestions && attempts < 50;
      attempts++
    ) {
      const coefficient = randint(-9, 9, 0)
      if (
        !this.questionJamaisPosee(i, divisor, initialRemainder, coefficient)
      ) {
        continue
      }
      const product = coefficient * initialRemainder
      // Le quotient arrondi vers le bas garantit un reste positif, même si k < 0.
      const quotient = Math.floor(product / divisor)
      const remainder = product - divisor * quotient
      const multiple = reduireAxPlusB(coefficient, 0, 'a')
      const quotientExpression = reduireAxPlusB(coefficient, quotient, 'q')

      let statement = questionUnique
        ? `Déterminer le reste de la division euclidienne de $${multiple}$ par $${divisor}$.`
        : `Division euclidienne de $${multiple}$ par $${divisor}$.`
      if (this.interactif) {
        statement += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierDeBase,
          { texteAvant: '<br>Le reste est ', texteApres: '.' },
        )
      }
      this.listeQuestions[i] = statement
      const coefficientExpression = reduireAxPlusB(coefficient, 0, 'q')
      const coefficientParenthese =
        coefficient < 0 ? `(${coefficientExpression})` : coefficientExpression
      const factoredQuotient =
        quotient === 0 ? quotientExpression : `(${quotientExpression})`
      let remainderReduction = ''
      if (product < 0 || product >= divisor) {
        const invalidRemainder =
          product < 0 ? `$${product}<0$` : `$${product}\\geqslant ${divisor}$`
        remainderReduction =
          `Cette écriture ne peut pas être la division euclidienne de $${multiple}$ par $${divisor}$, car le reste proposé est $${product}$ et ${invalidRemainder}.<br>` +
          `Il faut décomposer ce reste pour obtenir un reste compris entre $0$ et $${divisor - 1}$ :<br>` +
          `$${multiple}=${divisor}\\times ${coefficientParenthese}${ecritureAlgebrique(divisor * quotient)}+${remainder}$<br>` +
          `$${multiple}=${divisor}\\times ${coefficientParenthese}+${divisor}\\times ${ecritureParentheseSiNegatif(quotient)}+${remainder}$<br>` +
          `$${multiple}=${divisor}\\times ${factoredQuotient}+${remainder}$<br>`
      } else {
        remainderReduction = `Cette écriture est déjà une division euclidienne, car $0\\leqslant ${product}<${divisor}$.<br>`
      }
      this.listeCorrections[i] =
        `Il existe un entier $q\\in\\mathbb Z$ tel que $a=${divisor}q+${initialRemainder}$<br>` +
        `En multipliant cette égalité par $${coefficient}$, on obtient $${multiple}=${divisor}\\times ${coefficientParenthese}${ecritureAlgebrique(product)}$<br>` +
        remainderReduction +
        `Comme $${quotientExpression}$ est un entier et $0\\leqslant ${remainder}<${divisor}$, il s’agit bien de l’écriture de la division euclidienne de $${multiple}$ par $${divisor}$.<br>` +
        `Donc, le reste de la division euclidienne de $${multiple}$ par $${divisor}$ est $${miseEnEvidence(remainder)}$.`
      handleAnswers(this, i, { reponse: { value: remainder } })
      i++
    }
    listeQuestionsToContenu(this)
  }
}
