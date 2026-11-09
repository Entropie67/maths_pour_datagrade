import { bleuMathalea } from '../../../lib/colors'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Recomposer un entier'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDeModifImportante = '05/09/2025'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021
 */
export const uuid = '5cffb'

export const refs = {
  'fr-fr': ['can6N1-01', '6N1A-flash1'],
  'fr-ch': [],
}
export default class RecomposerEntier extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.besoinFormulaireCaseACocher = ['Avec des parenthèses', true]
    this.sup = true
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 2, 5)
    const b = this.quotaRandint('b', 2, 9)
    const c = this.quotaRandint('c', 2, 9)
    this.reponse = a * 1000 + b * 10 + c * 100
    let correction = `<br><br> Mentalement : <br>
    On décompose le calcul (milliers, centaines puis dizaines) : <br>
    $\\bullet$ $${texNombre(a)}\\times ${texNombre(1000)}=${texNombre(a * 1000)}$.<br>
    $\\bullet$ $${texNombre(c)}\\times 100=${texNombre(c * 100)}$.<br>
    $\\bullet$ $${texNombre(b)}\\times 10=${texNombre(b * 10)}$.<br>
    Ainsi,  <br>
    $\\begin{aligned}`

    if (this.quotaChoice('ordre', [true, false])) {
      this.question = this.sup
        ? `Calculer $(${texNombre(a)}\\times ${texNombre(1000)}) + (${texNombre(b)}\\times 10) + (${texNombre(c)}\\times 100)$.`
        : `Calculer $${texNombre(a)}\\times ${texNombre(1000)} + ${texNombre(b)}\\times 10 + ${texNombre(c)}\\times 100$.`
      this.correction = this.sup
        ? `$(${texNombre(a)}\\times ${texNombre(1000)}) + (${texNombre(b)}\\times 10) + (${texNombre(c)}\\times 100) `
        : `$${texNombre(a)}\\times ${texNombre(1000)} + ${texNombre(b)}\\times 10 + ${texNombre(c)}\\times 100 `
      correction += this.sup
        ? `(${texNombre(a)}\\times ${texNombre(1000)}) + (${texNombre(b)}\\times 10) + (${texNombre(c)}\\times 100) `
        : `${texNombre(a)}\\times ${texNombre(1000)} + ${texNombre(b)}\\times 10 + ${texNombre(c)}\\times 100 `
    } else {
      this.question = this.sup
        ? `Calculer $(${texNombre(c)}\\times 100)+ (${texNombre(b)}\\times 10) + (${texNombre(a)}\\times ${texNombre(1000)})$.`
        : `Calculer $ ${texNombre(c)}\\times 100+ ${texNombre(b)}\\times 10 + ${texNombre(a)}\\times ${texNombre(1000)}$.`
      this.correction = this.sup
        ? `$(${texNombre(c)}\\times 100)+ (${texNombre(b)}\\times 10) + (${texNombre(a)}\\times ${texNombre(1000)})`
        : `$ ${texNombre(c)}\\times 100+ ${texNombre(b)}\\times 10 + ${texNombre(a)}\\times ${texNombre(1000)}`
      correction += this.sup
        ? `(${texNombre(c)}\\times 100)+ (${texNombre(b)}\\times 10) + (${texNombre(a)}\\times ${texNombre(1000)}) &=(${texNombre(a)}\\times ${texNombre(1000)}) + (${texNombre(c)}\\times 100) + (${texNombre(b)}\\times 10)\\\\`
        : `${texNombre(c)}\\times 100+ ${texNombre(b)}\\times 10 + ${texNombre(a)}\\times ${texNombre(1000)} &=${texNombre(a)}\\times ${texNombre(1000)} + ${texNombre(c)}\\times 100 + ${texNombre(b)}\\times 10\\\\`
      correction += ``
    }

    correction += `&=${texNombre(a * 1000)}+${texNombre(c * 100)}+${texNombre(b * 10)}\\\\
  &=${texNombre(this.reponse)}
  \\end{aligned}$.`
    this.correction += `=${miseEnEvidence(texNombre(this.reponse))}$`
    this.correction += texteEnCouleur(correction, bleuMathalea)
  }
}
