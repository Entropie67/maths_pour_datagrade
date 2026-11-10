import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = 'aa6a8'
export const refs = {
  'fr-fr': ['3F1QCM-4'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer une image par une fonction (2024 Métropole)'
export const dateDePublication = '09/11/2024'

/**
 * @author Jean-Claude LHOTE
 */

export default class MetropoleJuin24Exo4Q1 extends ExerciceQcmA {
  private appliquerLesValeurs(a: number, b: number, c: number): void {
    this.reponses = [
      `$${texNombre(a * c + b, 0)}$`,
      `$${texNombre(a + c + b, 0)}$`,
      `$${texNombre(a * c - b)}$`,
    ]
    this.enonce = `On considère la fonction $f$ définie par $f(x)=${reduireAxPlusB(a, b)}$.<br>
    Quelle est l'image de $${String(c)}$ par cette fonction ?`
    this.correction = `L'image de $${String(c)}$ par $f$ est : $${rienSi1(a)}${Math.abs(a) !== 1 ? '\\times ' : ''}${ecritureParentheseSiNegatif(c)}${ecritureAlgebrique(b)}=${miseEnEvidence(texNombre(a * c + b, 0))}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(3, -2, -4)
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      const a = choice([2, 3, 4, 5])
      const b = -choice([2, 3, 4, 5, 6, 7, 8, 9], [a])
      const c = randint(-5, 5, [0, 1, -1])
      this.appliquerLesValeurs(a * choice([-1, 1]), b, c)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
