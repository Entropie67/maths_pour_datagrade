import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs } from '../../lib/outils/nombres'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceQcm from '../ExerciceQcm'

export const uuid = '0b15f'
export const refs = {
  'fr-fr': ['TSA7-20', 'TCA5-20'],
  'fr-ch': ['4mQCM-2'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Tester une solution d'une équation différentielle"
export const dateDePublication = '26/03/2025'
/*
 @author Stéphane Guyon
*/
export default class EquaDiff extends ExerciceQcm {
  versionOriginale: () => void = () => {
    const a = randint(-5, 5, [-3, 0, 3])
    const b = randint(-5, 5, 0)
    const fraction = new FractionEtendue(a, 3)
    const fraction2 = new FractionEtendue(abs(b), 2)
    const fraction3 = new FractionEtendue(-b, 2)
    const fraction4 = new FractionEtendue(3, a)
    const fraction5 = new FractionEtendue(-b, a)
    const fraction6 = new FractionEtendue(b, 2)
    const F1 = `$y = ${rienSi1(fraction.simplifie())}x^3 ${fraction6.signeString}${rienSi1(fraction2.simplifie())}  x^2$`
    const F2 = `$y = ${2 * a}x${ecritureAlgebrique(b)}$`
    // const F3 = `$y = ${fraction.texFractionSimplifiee}x^3 ${fraction3.signeString}${fraction2.texFractionSimplifiee}  x^2$`
    const F3 = `$y = ${rienSi1(fraction.simplifie())}x^3 ${fraction3.signeString}${rienSi1(fraction2.simplifie())}  x^2$`
    const F4 = `$y = ${rienSi1(fraction4.simplifie())}x^3 ${fraction6.signeString}${rienSi1(fraction2.simplifie())} x^2$`
    const F5 = `$y=${fraction5.texFractionSimplifiee}$`
    this.reponses = [F1, F2, F3, F4, F5]
    let texte = `On considère l'équation différentielle $(E) : y'=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x$.<br>`
    texte += 'Quelle fonction est solution de $(E)$ ?'
    this.enonce = texte

    let correction = `L'énoncé nous donne l'expression de la dérivée de la fonction cherchée, sous la forme : $(E) : y'=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x$.<br>`
    correction += 'La fonction cherchée est donc une primitive de $y$.<br>'
    correction += `Ainsi, une primitive de $ f $ est  $${miseEnEvidence(`y = ${fraction.texFractionSimplifiee}x^3 ${fraction2.texFractionSignee}  x^2`)} $`
    this.correction = correction
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
