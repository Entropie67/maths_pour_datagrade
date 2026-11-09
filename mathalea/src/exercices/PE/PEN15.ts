import {
  texteEnCouleurEtGras,
  miseEnEvidence,
} from '../../lib/outils/embellissements'
import { choice } from '../../lib/outils/arrayOutils'
import FractionEtendue from '../../modules/FractionEtendue'
import operation from '../../modules/operations'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import {
  analyzeDecimal,
  texNombreAvecZeroInutile,
  toFixedTruncate,
} from './PEN14'
export const titre = "Étudier l'écriture décimale d'un nombre rationnel"

export const dateDePublication = '2/1/2025'
export const uuid = 'f8648'
export const refs = {
  'fr-fr': ['PEN15'],
  'fr-ch': [],
}

/**
 * @author Rémi Angot
 */

export default class nomExercice extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    const den = choice([7, 13])
    const num = randint(1, den - 1)
    const f = new FractionEtendue(num, den)
    this.introduction = `On considère le nombre $A = ${f.texFraction}$.`
    let question1 =
      'Le nombre $A$ est-il un nombre entier naturel ? un nombre décimal ? un nombre rationnel ?'
    question1 += '<br>Justifier chacune des réponses.'
    let correction1 = `$${num}$ n'est pas divisible par $${den}$, donc $A$ ${texteEnCouleurEtGras("n'est pas un nombre entier naturel")}.`
    correction1 += `<br>$A$ est une fraction irréductible qui a pour dénominateur un nombre premier différent de $2$ et $5$ donc $A$ ${texteEnCouleurEtGras("n'est pas un nombre décimal")}.`
    correction1 += `<br>$A$ s'écrit sous la forme d'une fraction $\\dfrac{a}{b}$ avec $a$ et $b$ des nombres entiers donc ${texteEnCouleurEtGras("c'est un nombre rationnel")}.`

    const question2 = "Que peut-on dire de l'écriture décimale de $A$ ?"
    let correction2 = `$A$ est un nombre rationnel non décimal donc son écriture décimale ${texteEnCouleurEtGras('est illimitée et périodique')}.`
    correction2 += '<br>'

    const n = new Date().getFullYear()
    const { periodLength, firstRepeat } = analyzeDecimal(num, den)
    let question3 = `Déterminer sa $${n}^{\\mathrm{e}}$ décimale.`
    question3 += '<br>'

    let correction3 = operation({
      operande1: num,
      operande2: den,
      type: 'division',
      precision: firstRepeat,
    })

    correction3 += '<br><br>'
    correction3 += `La division posée fait apparaitre un reste déjà obtenu, l'écriture décimale de $\\dfrac{${num}}{${den}}\\approx ${texNombreAvecZeroInutile(toFixedTruncate(num / den, periodLength))}\\ldots$ a une période à $${periodLength}$ chiffres.`
    correction3 += '<br><br>'

    correction3 += operation({
      operande1: n,
      operande2: periodLength,
      type: 'divisionE',
    })

    correction3 += '<br><br>'
    const rang = n % periodLength
    const rangString =
      rang === 1 ? `$${rang}^{\\text{re}}$` : `$${rang}^{\\mathrm{e}}$`
    if (rang === 0) {
      correction3 += `$${n} = ${periodLength} \\times ${Math.floor(n / periodLength)}$<br>`
      correction3 += `La $${n}^{\\mathrm{e}}$ décimale du nombre $\\dfrac{${num}}{${den}}$ est donc identique à la dernière décimale de la période soit $${miseEnEvidence(String(toFixedTruncate(num / den, periodLength).at(-1)))}$.`
    } else {
      correction3 += `$${n} = ${periodLength} \\times ${Math.floor(n / periodLength)} + ${n % periodLength}$<br>`
      correction3 += `La $${n}^{\\mathrm{e}}$ décimale du nombre $\\dfrac{${num}}{${den}}$ est donc identique à la ${rangString} décimale soit $${miseEnEvidence(String(toFixedTruncate(num / den, n % periodLength).at(-1)))}$.`
    }

    this.listeQuestions.push(question1, question2, question3)
    this.listeCorrections.push(correction1, correction2, correction3)

    listeQuestionsToContenu(this)
  }
}
