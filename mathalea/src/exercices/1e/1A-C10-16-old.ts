// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid e6b50 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
// import ExerciceQcmA from '../../ExerciceQcmA'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique, reduireAxPlusB } from '../../lib/outils/ecritures'
import FractionEtendue from '../../modules/FractionEtendue'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'e6b50'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Manipuler une équation du type $ax+b=c$'
export const dateDePublication = '22/04/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class Auto1C10pOld extends ExerciceQcmA {
  private appliquerLesValeurs(
    a: number,
    p: number,
    b: number,
    k: number,
    d: number,
  ): void {
    // ax = p  =>  c = p + b
    // x = p/a
    // kx = kp/a
    // kx + d = kp/a + d
    const c = p + b
    const fX = new FractionEtendue(p, a)
    const fKX = new FractionEtendue(k * p, a)
    const fReponse = fKX.ajouteEntier(d)
    const fDist1 = fX
    const fDist2 = new FractionEtendue(k * p + d, a).simplifie()
    const fDist3 = new FractionEtendue(p, a).ajouteEntier(d)

    this.enonce = `Si $${reduireAxPlusB(a, b)} = ${c}$, alors $${reduireAxPlusB(k, d)} =$`

    this.correction = `De $${a}x + ${b} = ${c}$, on  obtient $x = ${fX.texFractionSimplifiee}$.<br>
     Ainsi  $${reduireAxPlusB(k, d)} = ${fKX.texFractionSimplifiee}  ${ecritureAlgebrique(d)} = ${miseEnEvidence(fReponse.texFractionSimplifiee)}$`

    this.reponses = [
      `$${fReponse.texFractionSimplifiee}$`,
      `$${fDist1.texFractionSimplifiee}$`,
      `$${fDist2.texFractionSimplifiee}$`,
      `$${fDist3.texFractionSimplifiee}$`,
    ]
  }

  versionOriginale: () => void = () => {
    // 3x + 5 = 7  =>  3x = 2  =>  x = 2/3
    // 4x - 1 = 4*(2/3) - 1 = 8/3 - 1 = 5/3
    this.appliquerLesValeurs(3, 2, 5, 4, -1)
  }

  versionAleatoire = () => {
    let compteur = 0
    do {
      const a = choice([3, 4, 5, 6, 7])
      // p non multiple de a (pour que x soit une vraie fraction)
      let p = randint(1, 10)
      while (p % a === 0) p = randint(1, 10)
      const b = randint(1, 8)
      // k différent de a
      let k = choice([2, 3, 4, 5, 6, 7, 8])
      while (k === a) k = choice([2, 3, 4, 5, 6, 7, 8])
      const d = choice([-3, -2, -1, 1, 2, 3])
      this.appliquerLesValeurs(a, p, b, k, d)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
