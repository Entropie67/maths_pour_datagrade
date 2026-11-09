import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Déterminer le plus nombre possible'
export const interactifReady = true

export const uuid = 'c0979'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CE1Q7 extends ExerciceCan {
  enonce(chiffres?: number[]) {
    if (chiffres == null) {
      const c1 = randint(2, 9)
      const c2 = randint(1, 9, c1)
      const c3 = randint(1, 9, [c1, c2])
      chiffres = shuffle([c1, c2, c3])
    }

    const chiffresAffiches = chiffres.join(' ; ')
    const chiffresTries = [...chiffres].sort((a, b) => a - b)

    // Le plus petit nombre : on met le plus petit chiffre non nul en premier
    let plusPetit
    if (chiffresTries[0] === 0) {
      plusPetit =
        chiffresTries[1] * 100 + chiffresTries[0] * 10 + chiffresTries[2]
    } else {
      plusPetit =
        chiffresTries[0] * 100 + chiffresTries[1] * 10 + chiffresTries[2]
    }

    this.reponse = plusPetit
    this.question = `Écris le plus petit nombre possible avec les chiffres suivants : $${chiffresAffiches}$.`
    this.correction = `Pour former le plus petit nombre, on range les chiffres dans l'ordre croissant.<br>
    Le plus petit nombre est : $${miseEnEvidence(texNombre(plusPetit, 0))}$.`
    this.canEnonce =
      'Écris le plus petit nombre possible avec les chiffres suivants : $5$ ; $2$ ; $1$.'

    if (this.interactif) {
      this.optionsChampTexte = { texteAvant: '<br>' }
    }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce([5, 2, 1])
    else this.enonce()
  }
}
