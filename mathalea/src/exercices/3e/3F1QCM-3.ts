import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'df75e'
export const refs = {
  'fr-fr': ['3F1QCM-3'],
  'fr-ch': ['1mF1-14', '10LCFA3C-5', '10LSFA3C-5', '11CTFA2B-5'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Effectuer le calcul d'images dans une fonction"
export const dateDePublication = '13/11/2024'
/**
 *
 * @author Jean-Claude LHOTE
 */

export default class AsieJuin21Exo1Q2 extends ExerciceQcmA {
  private appliquerLesValeurs(a: number, b: number): void {
    this.reponses = [
      `$f(0)=${String(b)}$`,
      `$0$ est un antécédent de $${String(b)}$ par $f$.`,
      `$${String(b)}$ est l'image de $0$ par $f$.`,
      `$f(${String(b)})=0$`,
      `l'image de $${String(-b)}$ par $f$ est $${String(b)}$.`,
    ]
    this.bonnesReponses = [true, true, true, false, false]
    this.enonce = `On considère la fonction $f$ définie par $f(x)=${rienSi1(a)}x^2${ecritureAlgebrique(b)}$.`
    this.corrections = [
      `$${miseEnEvidence(`f(0)=${rienSi1(a)}${Math.abs(a) !== 1 ? '\\times ' : ''}0^2${ecritureAlgebrique(b)}=${texNombre(b, 0)}`)}$.`,
      `$${miseEnEvidence(0)}$ ${texteEnCouleurEtGras('est un antécédent de')} $${miseEnEvidence(b)}$ ${texteEnCouleurEtGras('par')} $${miseEnEvidence('f')}$, car $f(0)=${b}$.`,
      `$${miseEnEvidence(b)}$ ${texteEnCouleurEtGras("est l'image de")} $${miseEnEvidence(0)}$ ${texteEnCouleurEtGras('par')} $${miseEnEvidence('f')}$, car $f(0)=${b}$.`,
      ` $f(${b})=${rienSi1(a)}${Math.abs(a) !== 1 ? '\\times ' : ''}${ecritureParentheseSiNegatif(b)}^2${ecritureAlgebrique(b)}=${texNombre(a * b ** 2 + b, 0)}$.`,
      `l'image de $${String(-b)}$ par $f$ est : $${rienSi1(a)}${Math.abs(a) !== 1 ? '\\times ' : ''}${ecritureParentheseSiNegatif(-b)}^2${ecritureAlgebrique(b)}=${texNombre(a * b ** 2 + b, 0)}$.`,
    ]
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(1, -2)
  }

  versionAleatoire: () => void = () => {
    const n = 5
    do {
      const a = choice([2, 3, 4, 5]) * choice([-1, 1])
      const b = choice([2, 3, 4, 5]) * choice([-1, 1])
      this.appliquerLesValeurs(a, b)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
