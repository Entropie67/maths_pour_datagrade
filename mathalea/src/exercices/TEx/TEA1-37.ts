import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { texNombre } from '../../lib/outils/texNombre'

export const titre =
  'Calculer le reste d’une grande puissance à l’aide des congruences'
export const dateDePublication = '11/10/2026'
export const uuid = 'd1ea8'
export const interactifReady = true
export const refs = { 'fr-fr': ['TEA1-37'], 'fr-ch': [] }

// Les représentants non triviaux évitent de réduire l'exercice à a ≡ ±1.
const candidates: {
  base: number
  modulus: number
  power: number
  sign: number
}[] = []
for (const power of [2, 3]) {
  for (let modulus = 5; modulus <= 31; modulus++) {
    for (let base = 2; base < modulus - 1; base++) {
      const residue = base ** power % modulus
      if (residue === 1 || residue === modulus - 1) {
        // Pour les cubes, écarter les bases dont le carré vaut déjà ±1.
        if (power === 3 && [1, modulus - 1].includes(base ** 2 % modulus))
          continue
        candidates.push({ base, modulus, power, sign: residue === 1 ? 1 : -1 })
      }
    }
  }
}

export default class ShortCongruenceRemainder extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
  }

  nouvelleVersion() {
    for (
      let i = 0, attempts = 0;
      i < this.nbQuestions && attempts < 50;
      attempts++
    ) {
      const { base, modulus, power, sign } = choice(candidates)
      const quotient = randint(30, 150)
      const negative = choice([true, false])
      const offset = negative ? -randint(1, 2) : randint(0, power - 1)
      const exponent = power * quotient + offset
      if (!this.questionJamaisPosee(i, base, exponent, modulus)) continue

      const signedPower = sign === 1 ? '1' : '(-1)'
      const reducedQuotient = negative ? quotient - 1 : quotient
      const reducedOffset = negative ? power + offset : offset
      const blockResidue = sign === -1 && reducedQuotient % 2 === 1 ? -1 : 1
      const factor = base ** reducedOffset
      let correction = ''
      if (power === 3) {
        const squareResidue = base ** 2 % modulus
        correction += `On teste le carré : $${base}^2=${base ** 2}\\equiv ${squareResidue}\\,[${modulus}]$.<br>`
      }
      correction += `On teste ${power === 2 ? 'le carré' : 'alors le cube'} : $${base}^{${power}}=${texNombre(base ** power)}=${modulus}\\times ${(base ** power - sign) / modulus}${sign === 1 ? '+1' : '-1'}$, donc $${base}^{${power}}\\equiv ${sign}\\,[${modulus}]$.<br>`
      correction += 'Ce résultat va nous permettre de résoudre le problème.<br>'
      correction += `La division euclidienne de $${exponent}$ par $${power}$ donne : $${exponent}=${power}\\times ${reducedQuotient}${reducedOffset === 0 ? '' : `+${reducedOffset}`}$.<br>`
      const exponentDecomposition = `${power}\\times ${reducedQuotient}${reducedOffset === 0 ? '' : `+${reducedOffset}`}`
      const remainingFactor =
        reducedOffset === 0 ? '' : `\\times ${base}^{${reducedOffset}}`
      const parityComment =
        sign === -1
          ? `&\\quad\\text{car }${reducedQuotient}\\text{ est ${reducedQuotient % 2 === 0 ? 'pair' : 'impair'}}`
          : ''
      const evaluatedBlock =
        blockResidue === -1 && remainingFactor !== ''
          ? '(-1)'
          : `${blockResidue}`
      const evaluationLine =
        remainingFactor === ''
          ? ''
          : `&\\equiv ${evaluatedBlock}${remainingFactor}\\,[${modulus}]\\\\\n`
      correction += `$\\begin{aligned}
${base}^{${exponent}}&=${base}^{${exponentDecomposition}}\\\\
&=(${base}^{${power}})^{${reducedQuotient}}${remainingFactor}\\\\
&\\equiv ${signedPower}^{${reducedQuotient}}${remainingFactor}\\,[${modulus}]${parityComment}\\\\
${evaluationLine}&\\equiv ${blockResidue * factor}\\,[${modulus}]
\\end{aligned}$<br>`
      const remainder =
        (((blockResidue * factor) % modulus) + modulus) % modulus
      correction += `Le reste de la division euclidienne doit être positif ou nul et strictement inférieur à $${modulus}$.<br>`
      if (blockResidue * factor !== remainder) {
        const intermediate = blockResidue * factor
        const euclideanQuotient = (intermediate - remainder) / modulus
        const quotientText =
          euclideanQuotient < 0
            ? `(${euclideanQuotient})`
            : `${euclideanQuotient}`
        correction += `La division euclidienne de $${intermediate}$ par $${modulus}$ donne :<br>$${intermediate}=${modulus}\\times ${quotientText}${remainder === 0 ? '' : `+${remainder}`}$<br>Donc : $${intermediate}\\equiv ${remainder}\\,[${modulus}]$<br>On en déduit : `
      } else {
        correction += 'On obtient :<br>'
      }
      correction += `$${base}^{${exponent}}\\equiv ${remainder}\\,[${modulus}]$<br>Comme $0\\leqslant ${remainder}<${modulus}$, le reste demandé est $${miseEnEvidence(remainder)}$.`
      let question = `Déterminer le reste de la division euclidienne de $${base}^{${exponent}}$ par $${modulus}$ à l’aide des congruences.`
      if (this.interactif) {
        question += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierNumbers,
          { texteAvant: '<br>Le reste est ', texteApres: '.' },
        )
      }
      handleAnswers(this, i, { reponse: { value: remainder } })
      this.listeQuestions[i] = question
      this.listeCorrections[i] = correction
      i++
    }
    listeQuestionsToContenu(this)
  }
}
