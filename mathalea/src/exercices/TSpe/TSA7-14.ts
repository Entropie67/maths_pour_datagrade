import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs } from '../../lib/outils/nombres'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceQcm from '../ExerciceQcm'
/*
 @author Stéphane Guyon
*/
export const uuid = 'c1209'
export const refs = {
  'fr-fr': ['TSA7-14', 'TCA5-14'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Déterminer une primitive'
export const dateDePublication = '15/03/2025'

export default class Primitives extends ExerciceQcm {
  versionOriginale: () => void = () => {
    const a = choice([-7, -6, -5, -4, 4, 5, 6, 7])
    const b = choice([-7, -5, -3, 3, 5, 7])
    const c = randint(-5, 5, [-1, 0, 1])
    const fraction = new FractionEtendue(abs(b), 2)
    const fraction2 = new FractionEtendue(b, 2)
    const fractionSigne = new FractionEtendue(b, 2)
    const fractionSigne2 = new FractionEtendue(-b, 2)
    const f = `f(x) = ${a}x^2  ${ecritureAlgebrique(b)}x ${ecritureAlgebrique(c)}`
    const F1 = `$F(x) = ${new FractionEtendue(a, 3).texFractionSimplifiee}x^3 ${ecritureAlgebrique(b)}x^2${ecritureAlgebrique(c)}x$`
    const F2 = `$F(x) = ${new FractionEtendue(a, 3).texFractionSimplifiee}x^3 ${fractionSigne.signeString}${fraction.texFractionSimplifiee}x^2 ${ecritureAlgebrique(c)}x$`
    const F3 = `$F(x) = ${a}x^3 ${fractionSigne.signeString}${fraction.texFractionSimplifiee}x^2 ${ecritureAlgebrique(c)}x$`
    const F4 = `$F(x) = ${new FractionEtendue(-a, 3).texFractionSimplifiee}x^3 ${fractionSigne2.signeString}${fraction.texFractionSimplifiee}x^2 ${ecritureAlgebrique(-c)}x$`
    const F5 = `$F(x) = ${new FractionEtendue(a, 2).texFractionSimplifiee}x^3 ${fractionSigne2.signeString}${fraction.texFractionSimplifiee}x^2 ${ecritureAlgebrique(-c)}x$`
    this.reponses = [F2, F1, F3, F4, F5]
    const texte = `La fonction $ f $ définie sur $ \\mathbb{R} $ par $ ${f} $ admet comme primitive sur $ \\mathbb{R} $ la fonction $ F $ définie par : <br>`
    this.enonce = texte

    let correction = `Pour déterminer une primitive de $ f(x) = ${rienSi1(a)}x^2  ${ecritureAlgebrique(b)}${ecritureAlgebrique(c)} $, on intègre terme à terme :<br>`
    correction += `- La primitive de $ ${a}x^2 $ est $${new FractionEtendue(a, 3).texFractionSimplifiee}x^3$.<br>`
    correction += `- La primitive de $ ${b}x $ est $ ${fraction2.texFractionSimplifiee}x^2 $.<br>`
    correction += `- La primitive de $ ${c}$ est $ ${c}x $.<br>`
    correction += `Ainsi, une primitive de $ f $ est  $${miseEnEvidence(`F(x) =${new FractionEtendue(a, 3).texFractionSimplifiee}x^3 ${ecritureAlgebrique(b)}x^2${ecritureAlgebrique(c)}x`)} $`
    this.correction = correction
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
