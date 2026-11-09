import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { stringNombre, texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Donner une écriture scientifique'
export const interactifReady = true

export const uuid = '34155'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.optionsChampTexte = { texteAvant: ' $=$' }

    this.canOfficielle = false
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = '7,4\\times 10^{-4}'
      this.question = `Écriture  scientifique de $${texNombre(0.00074)}$`
      this.correction = `La notation scientifique est de la forme $a\\times 10^{n}$ avec $1\\leqslant a <10$ et $n$ un entier relatif.<br>
            Ici : $${texNombre(0.00074)}=\\underbrace{${miseEnEvidence(texNombre(7.4))}}_{1\\leqslant 7,4 <10}${miseEnEvidence('\\times')} ${miseEnEvidence('10^{-4}')}$.`
    } else {
      const choix = choice(['a', 'b', 'c']) //
      if (choix === 'a') {
        const a = randint(11, 39, [10, 20, 30]) / 1000
        const truc = a * 100
        this.reponse = `${stringNombre(truc)}\\times 10^{-2}`
        this.question = `Écriture  scientifique de $${texNombre(a, 3)}$`
        this.correction = `La notation scientifique est de la forme $a\\times 10^{n}$ avec $1\\leqslant a <10$ et $n$ un entier relatif.<br>
            Ici : $${texNombre(a, 3)}=\\underbrace{${miseEnEvidence(texNombre(truc, 3))}}_{1\\leqslant ${texNombre(truc, 3)} <10}${miseEnEvidence('\\times')} ${miseEnEvidence('10^{-2}')}$. `
      }
      if (choix === 'b') {
        const a = randint(111, 399, [200, 300]) / 100000
        const truc = a * 1000
        this.reponse = `${stringNombre(truc)}\\times 10^{-3}`
        this.question = `Écriture  scientifique de $${texNombre(a, 5)}$`
        this.correction = `La notation scientifique est de la forme $a\\times 10^{n}$ avec $1\\leqslant a <10$ et $n$ un entier relatif.<br>
              Ici : $${texNombre(a, 5)}=\\underbrace{${miseEnEvidence(texNombre(truc, 5))}}_{1\\leqslant ${texNombre(truc, 5)} <10}${miseEnEvidence('\\times')} ${miseEnEvidence('10^{-3}')}$. `
      }
      if (choix === 'c') {
        const a = randint(111, 399, [200, 300]) / 1000000
        const truc = a * 10000
        this.reponse = `${stringNombre(truc)}\\times 10^{-4}`
        this.question = `Écriture  scientifique de $${texNombre(a, 6)}$`
        this.correction = `La notation scientifique est de la forme $a\\times 10^{n}$ avec $1\\leqslant a <10$ et $n$ un entier relatif.<br>
                Ici : $${texNombre(a, 6)}=\\underbrace{${miseEnEvidence(texNombre(truc, 6))}}_{1\\leqslant ${texNombre(truc, 6)} <10}${miseEnEvidence('\\times')} ${miseEnEvidence('10^{-4}')}$. `
      }
    }
  }
}
