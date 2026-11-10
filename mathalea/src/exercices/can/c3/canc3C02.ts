import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer à partir d’une décomposition'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Date de publication septembre 2021

 */
export const uuid = '913e9'

export const refs = {
  'fr-fr': ['canc3C02'],
  'fr-ch': [],
}
export default class CompositionDeNombreEntier extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 1, 9)
    const b = randint(1, 9, a)
    const c = randint(1, 9, [a, b])
    switch (this.quotaChoice('cas', [1, 2, 3])) {
      case 1:
        this.reponse = a * 1000 + b * 100 + c
        this.question = `Calculer $(${a}\\times ${texNombre(1000)}) + (${b}\\times 100) + (${c}\\times 1)$.`
        this.correction = `$(${a}\\times ${texNombre(1000)}) + (${b}\\times 100) + (${c}\\times 1)=${texNombre(a * 1000)}+${b * 100}+${c}=${miseEnEvidence(texNombre(a * 1000 + b * 100 + c))}$`
        break
      case 2:
        this.reponse = a * 1000 + b * 10 + c
        this.question = `Calculer $(${a}\\times ${texNombre(1000)}) + (${b}\\times 10) + (${c}\\times 1)$.`
        this.correction = `$(${a}\\times ${texNombre(1000)}) + (${b}\\times 10) + (${c}\\times 1)=${texNombre(a * 1000)}+${b * 10}+${c}=${miseEnEvidence(texNombre(a * 1000 + b * 10 + c))}$`
        break
      case 3:
        this.reponse = a * 1000 + b * 100 + c * 10
        this.question = `Calculer $(${a}\\times ${texNombre(1000)}) + (${b}\\times 100) + (${c}\\times 10)$.`
        this.correction = `$(${a}\\times ${texNombre(1000)}) + (${b}\\times 100) + (${c}\\times 10)=${texNombre(a * 1000)}+${b * 100}+${c * 10}=${miseEnEvidence(texNombre(a * 1000 + b * 100 + c * 10))}$`
        break
    }
  }
}
