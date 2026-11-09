import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Résoudre un problème de fraction'
export const interactifReady = true

export const dateDeModifImportante = '19/09/2024'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora & Jean-claude Lhote

 * Date de publication 21/10/2021
*/
export const uuid = '2ce71'

export const refs = {
  'fr-fr': ['can6C6-03', '6N3autoE-2', '2N33-flash3'],
  'fr-ch': ['NR'],
}
export default class PetitsProblemeDeFraction extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    const a = this.quotaChoice('a', [12, 24, 36, 48])
    const b = this.quotaChoice('b', [15, 20, 25, 30, 35, 40, 45])
    const N = this.quotaChoice('N', [
      'quart',
      'tiers',
      'cinquième',
      'sixième',
      'autre',
      'autre',
      'autre',
    ]) //
    const listeFractions = [
      [2, 5],
      [3, 5],
      [3, 4],
      [1, 4],
      [5, 6],
    ]

    const fraction = this.quotaChoice('fraction', listeFractions)
    const frac = new FractionEtendue(fraction[0], fraction[1])
    const nbre =
      frac.d * this.quotaChoice('multiplicateur', [2, 3, 4, 5, 6, 7, 8])
    const reste = new FractionEtendue(frac.d - frac.n, frac.d)
    const reponse = (nbre * reste.n) / frac.d

    switch (N) {
      case 'cinquième':
        this.reponse = 0.8 * b
        this.question = `J'ai mangé le ${N} d'un paquet de gâteaux qui contenait $${b}$ gâteaux. <br>
      Combien en reste-t-il ?`
        this.correction = `$\\dfrac{1}{5}\\times ${b}=${texNombre(b / 5)}$.<br>
      Il en reste donc $${b}-${texNombre(b / 5)}=${miseEnEvidence(this.reponse)}$ gâteaux.`
        break
      case 'quart':
        this.reponse = 0.75 * a
        this.question = `J'ai mangé le ${N} d'un paquet de gâteaux qui contenait $${a}$ gâteaux. <br>
      Combien en reste-t-il ?`
        this.correction = `$\\dfrac{1}{4}\\times ${a}=${texNombre(a / 4)}$.<br>
      Il en reste donc $${a}-${texNombre(a / 4)}=${miseEnEvidence(this.reponse)}$ gâteaux.`
        break
      case 'tiers':
        this.reponse = (2 * a) / 3
        this.question = `J'ai mangé le ${N} d'un paquet de gâteaux qui contenait $${a}$ gâteaux. <br>
      Combien en reste-t-il ?`
        this.correction = `$\\dfrac{1}{3}\\times ${a}=${texNombre(a / 3)}$.<br>
      Il en reste donc $${a}-${texNombre(a / 3)}=${miseEnEvidence(this.reponse)}$ gâteaux.`
        break
      case 'sixième':
        this.reponse = (5 * a) / 6
        this.question = `J'ai mangé le ${N} d'un paquet de gâteaux qui contenait $${a}$ gâteaux. <br>
      Combien en reste-t-il ?`
        this.correction = `$\\dfrac{1}{6}\\times ${a}=${texNombre(a / 6)}$.<br>
      Il en reste donc $${a}-${texNombre(a / 6)}=${miseEnEvidence(this.reponse)}$ gâteaux.`
        break

      case 'autre':
      default:
        this.reponse = reponse

        this.question = `J'ai mangé $${frac.texFraction}$ d'un paquet de gâteaux qui contenait $${nbre}$ gâteaux. <br>
        Combien en reste-t-il ?`
        this.correction = `J'ai mangé $${frac.texFraction}$ d'un paquet de gâteaux, il en reste donc $${reste.texFraction}$.<br>
          $${reste.texFraction}\\times ${nbre}=${reponse}$.<br>
          Il reste donc $${miseEnEvidence(reponse)}$ gâteaux.`
        break
    }
    this.reponse = this.reponse.toString()
  }
}
