import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { numTrie } from '../../../lib/outils/nombres'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Trouver le plus grand nombre entier'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Date de publication septembre 2021

 */
export const uuid = '44f8c'

export const refs = {
  'fr-fr': ['canc3N03'],
  'fr-ch': [],
}
export default class PlusGrandNombreEntier extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 1, 9)
    const b = randint(1, 9, a)
    const c = randint(1, 9, [a, b])
    const chiffres = numTrie([a, b, c])

    this.question = `Quel est le plus grand nombre que l'on peut écrire avec les trois chiffres : $${a}$, $${b}$ et $${c}$ ?`
    this.reponse = chiffres[2] * 100 + chiffres[1] * 10 + chiffres[0]
    this.correction = `Le plus grand nombre possible est : $${chiffres[2]}\\times 100 + ${chiffres[1]}\\times 10 + ${chiffres[0]}=${miseEnEvidence(chiffres[2] * 100 + chiffres[1] * 10 + chiffres[0])}$`
  }
}
