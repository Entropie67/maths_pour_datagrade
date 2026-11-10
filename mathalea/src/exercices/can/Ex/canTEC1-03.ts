import { Complexe } from '../../../lib/mathFonctions/Complexe'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  "Déterminer la partie réelle ou imaginaire d'un nombre complexe"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDePublication = '07/092025'

/**
 * Question de can : Partie réelle/imaginaire
 * @author Stéphane Guyon

*/
export const dateDeModifImportante = '31/10/2026'
export const uuid = 'cbd3e'

export const refs = {
  'fr-fr': ['canTEC1-03'],
  'fr-ch': [],
}
export default class PartieReelle extends ExerciceSimple {
  constructor() {
    super()

    this.nbQuestions = 1
    this.typeExercice = 'simple'
  }

  nouvelleVersion() {
    const ReZ = randint(-5, 5)
    const ImZ = randint(-5, 5)
    const z1 = new Complexe(ReZ, ImZ)
    const z2 = new Complexe(-ImZ, ReZ)
    const moinsiz2 = new Complexe(ImZ, -ReZ)
    const scenario = randint(0, 2)
    this.question = `On donne le nombre complexe $z = ${z1.tex().replace(/i/g, '\\mathrm{i}')}$.<br>`

    switch (scenario) {
      case 0:
        this.question += 'Déterminer la partie imaginaire de $z$.'
        this.correction = `Par définition, la partie imaginaire est le réel facteur du nombre imaginaire $\\mathrm{i}$<br>$\\operatorname{Im}(z) = ${miseEnEvidence(ImZ)}.$`

        this.reponse = ImZ
        break
      case 1:
        this.question += 'Déterminer la partie imaginaire de $\\mathrm{i}z$.'
        this.correction = `On écrit $\\mathrm{i}z$ sous forme algébrique puis on identifie la partie imaginaire.<br>
   $\\mathrm{i}z=\\mathrm{i}\\left( ${z1.tex().replace(/i/g, '\\mathrm{i}')}\\right) =${z2.tex().replace(/i/g, '\\mathrm{i}')}$<br>

   $\\operatorname{Im}(\\mathrm{i}z) = ${miseEnEvidence(ReZ)}.$`
        this.reponse = ReZ
        break
      case 2:
      default:
        this.question += 'Déterminer la partie imaginaire de $-\\mathrm{i}z$.'
        this.correction = `On écrit $-\\mathrm{i}z$ sous forme algébrique puis on identifie la partie imaginaire.<br>
   $-\\mathrm{i}z=-\\mathrm{i}\\left( ${z1.tex().replace(/i/g, '\\mathrm{i}')}\\right) =${moinsiz2.tex().replace(/i/g, '\\mathrm{i}')}$<br>

   $\\operatorname{Im}(-\\mathrm{i}z) = ${miseEnEvidence(-ReZ)}.$`
        this.reponse = -ReZ
        break
    }
  }
}
