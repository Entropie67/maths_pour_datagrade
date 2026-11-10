import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
export const titre = 'Écrire plus simplement'
export const interactifReady = true

export const uuid = 'mgcai'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class aSimplifier2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: ' $=$' }
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    const annee = 2026
    const choix = this.canOfficielle ? 1 : this.quotaChoice('choix', [1, 2])
    const a = this.canOfficielle
      ? 1
      : this.quotaChoice('a', [-5, 3, 5, -3, 9, -9])
    const b = this.canOfficielle ? 2 : this.quotaRandint('b', -10, 10, [0])
    if (choix === 1) {
      this.question = `Écrire le plus simplement possible : $\\dfrac{${texNombre(annee, 0)}${ecritureAlgebrique(a)}}{${texNombre(annee, 0)}-${texNombre(annee - 1, 0)}}$.`
      this.correction = `$\\dfrac{${texNombre(annee, 0)}${ecritureAlgebrique(a)}}{${texNombre(annee, 0)}-${texNombre(annee - 1, 0)}}=
      \\dfrac{${texNombre(annee + a, 0)}}{${texNombre(1, 0)}} =    
      ${miseEnEvidence(texNombre(annee + a, 0))}$`
      this.reponse = annee + a

      this.canReponseACompleter = `$\\dfrac{${texNombre(annee, 0)}${ecritureAlgebrique(a)}}{${texNombre(annee, 0)}-${texNombre(annee - 1, 0)}}=\\ldots$`
      if (this.interactif) {
        this.question = `Écrire le plus simplement possible.<br><br>$\\dfrac{${texNombre(annee, 0)}${ecritureAlgebrique(a)}}{${texNombre(annee, 0)}-${texNombre(annee - 1, 0)}}$`
      }
    } else if (choix === 2) {
      this.reponse = `\\dfrac{1}{${annee + b}}`
      this.question = `Écrire le plus simplement possible : $\\dfrac{${texNombre(annee, 0)}-${texNombre(annee - 1, 0)}}{${texNombre(annee, 0)}${ecritureAlgebrique(b)}}$.`
      this.correction = `$\\dfrac{${texNombre(annee, 0)}-${texNombre(annee - 1, 0)}}{${texNombre(annee, 0)}${ecritureAlgebrique(b)}}=
      ${miseEnEvidence(`\\dfrac{1}{${annee + b}}`)}$`

      this.canReponseACompleter = `$\\dfrac{${texNombre(annee, 0)}-${texNombre(annee - 1, 0)}}{${texNombre(annee, 0)}${ecritureAlgebrique(b)}}=\\ldots$`
      if (this.interactif) {
        this.question = `Écrire le plus simplement possible.<br><br>$\\dfrac{${texNombre(annee, 0)}-${texNombre(annee - 1, 0)}}{${texNombre(annee, 0)}${ecritureAlgebrique(b)}}$`
      }
    }
  }
}
