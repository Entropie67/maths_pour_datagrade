import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique, reduireAxPlusB } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const dateDeModifImportante = '30/09/2026'

export const uuid = '4301a'
export const refs = {
  'fr-fr': ['1A-C10-16'],
  'fr-ch': ['10LCFA5B-5', '10LSFA5B-5', '11CTQCMFA5-3', '11LCQCMFA5-3', '11LSQCMFA5-6'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre = 'Manipuler une équation du type $ax+b=c$'
export const dateDePublication = '22/04/2026'
/**
 * @author Gilles Mora
 */
export default class Auto1C10p extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionIrreductible: true }
    this.optionsChampTexte = { texteApres: '.' }
    this.versionQcmDisponible = true
    this.versionQcm = false
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = true

    const a = choice([3, 4, 5, 6, 7])
    // p non multiple de a (pour que x soit une vraie fraction)
    let p = randint(1, 10)
    while (p % a === 0) p = randint(1, 10)
    const b = randint(1, 8)
    // k différent de a
    let k = choice([2, 3, 4, 5, 6, 7, 8])
    while (k === a) k = choice([2, 3, 4, 5, 6, 7, 8])
    const d = choice([-3, -2, -1, 1, 2, 3])

    // ax = p  =>  c = p + b, x = p/a, kx = kp/a, kx + d = kp/a + d
    const c = p + b
    const fX = new FractionEtendue(p, a)
    const fKX = new FractionEtendue(k * p, a)
    const fReponse = fKX.ajouteEntier(d).simplifie()

    this.question = `${this.versionQcm ? '' : 'Compléter.<br>'}Si $${reduireAxPlusB(a, b)}=${c}$, alors $${reduireAxPlusB(k, d)}${this.interactif || this.versionQcm ? '=' : '=\\ldots'}$`
    this.correction = `De $${reduireAxPlusB(a, b)}=${c}$, on obtient $${a}x=${p}$, soit $x=${fX.texFractionSimplifiee}$.<br>
     Ainsi, $${reduireAxPlusB(k, d)} = ${k}\\times ${fX.texFractionSimplifiee}${ecritureAlgebrique(d)}=${fKX.texFractionSimplifiee}${ecritureAlgebrique(d)} = ${miseEnEvidence(fReponse.texFractionSimplifiee)}$.`

    if (this.versionQcm) {
      this.reponse = `$${fReponse.texFractionSimplifiee}$`
      this.distracteurs = [
        fX.texFractionSimplifiee,
        new FractionEtendue(k * p + d, a).simplifie().texFractionSimplifiee,
        fX.ajouteEntier(d).simplifie().texFractionSimplifiee,
        new FractionEtendue(k * p - d, a).simplifie().texFractionSimplifiee,
        fKX.texFractionSimplifiee,
      ].map((f) => `$${f}$`)
    } else {
      this.reponse = fReponse.texFractionSimplifiee
    }
  }
}
