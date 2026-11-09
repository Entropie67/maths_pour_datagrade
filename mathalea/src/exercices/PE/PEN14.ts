import { miseEnEvidence } from '../../lib/outils/embellissements'
import { choice } from '../../lib/outils/arrayOutils'
import { obtenirListeFacteursPremiers } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import operation from '../../modules/operations'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  "Déterminer la n-ième décimale d'un nombre rationnel non décimal"
export const uuid = 'cbd18'
export const dateDePublication = '1/1/2025'
export const refs = {
  'fr-fr': ['PEN14'],
  'fr-ch': [],
}
/**
 *
 * @author Rémi Angot
 */
export default class NiemeDecimale extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const den = choice([7, 13])
      const num = randint(den + 1, 2 * den - 1)
      let n = randint(1, 9) * 100 + randint(1, 9) * 10 + randint(1, 9)
      if (choice([true, false])) n = new Date().getFullYear()
      const texte = `Déterminer la $${n}^{\\mathrm{e}}$ décimale du nombre $\\dfrac{${num}}{${den}}$.`
      const { hasPeriod, periodLength, firstRepeat } = analyzeDecimal(num, den)
      if (!hasPeriod) throw new Error('Pas de période')
      let texteCorr = operation({
        operande1: num,
        operande2: den,
        type: 'division',
        precision: firstRepeat,
      })

      texteCorr += '<br><br>'
      texteCorr += `La division posée fait apparaitre un reste déjà obtenu, l'écriture décimale de $\\dfrac{${num}}{${den}}\\approx ${texNombreAvecZeroInutile(toFixedTruncate(num / den, periodLength))}\\ldots$ a une période à $${periodLength}$ chiffres.`
      texteCorr += '<br><br>'
      texteCorr += operation({
        operande1: n,
        operande2: periodLength,
        type: 'divisionE',
      })

      texteCorr += '<br><br>'
      const rang = n % periodLength
      const rangString =
        rang === 1 ? `$${rang}^{\\text{re}}$` : `$${rang}^{\\mathrm{e}}$`
      if (rang === 0) {
        texteCorr += `$${n} = ${periodLength} \\times ${Math.floor(n / periodLength)}$<br>`
        texteCorr += `La $${n}^{\\mathrm{e}}$ décimale du nombre $\\dfrac{${num}}{${den}}$ est donc identique à la dernière décimale de la période soit $${miseEnEvidence(String(toFixedTruncate(num / den, periodLength).at(-1)))}$.`
      } else {
        texteCorr += `$${n} = ${periodLength} \\times ${Math.floor(n / periodLength)} + ${n % periodLength}$<br>`
        texteCorr += `La $${n}^{\\mathrm{e}}$ décimale du nombre $\\dfrac{${num}}{${den}}$ est donc identique à la ${rangString} décimale soit $${miseEnEvidence(String(toFixedTruncate(num / den, n % periodLength).at(-1)))}$.`
      }

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

export function toFixedTruncate(num: number, digits: number): string {
  const re = new RegExp('^-?\\d+(?:\\.\\d{0,' + (digits || -1) + '})?')
  const match = num.toString().match(re)
  return match ? match[0] : '0'
}

export function analyzeDecimal(numerator: number, denominator: number) {
  const f = new FractionEtendue(numerator, denominator)
  const n = f.numIrred
  const d = f.denIrred
  const listeFacteursPremiers = obtenirListeFacteursPremiers(d)
  const hasOtherFactorThan2And5 = listeFacteursPremiers.some(
    (f) => f !== 2 && f !== 5,
  )
  if (!hasOtherFactorThan2And5) {
    return {
      hasPeriod: false,
      periodLength: 0,
      firstRepeat: 0,
    }
  }

  let rang = 1
  const restes = new Set<number>()
  while (!restes.has((n * 10 ** rang) % d)) {
    restes.add((n * 10 ** rang) % d)
    rang++
  }

  return {
    hasPeriod: true,
    periodLength: rang - 1,
    firstRepeat: rang,
  }
}

export function texNombreAvecZeroInutile(text: string) {
  if (text.endsWith('0')) {
    return texNombre(Number(text)) + '0'
  } else if (text.endsWith('00')) {
    return texNombre(Number(text)) + '00'
  } else {
    return texNombre(Number(text))
  }
}
