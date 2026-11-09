import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer un module'
export const interactifReady = true

export const dateDePublication = '05/02/2025'

export const uuid = '28c55'
export const refs = {
  'fr-fr': ['canTEC2-01'],
  'fr-ch': ['3mNC-4'],
}

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Stéphane Guyon

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: '$\\vert z  \\vert =$' }
    this.formatChampTexte = KeyboardType.clavierFullOperations
  }

  nouvelleVersion() {
    const a = randint(-7, 7, 0)
    const b = randint(-7, 7, 0)

    this.question = `Soit $z=${a}${ecritureAlgebriqueSauf1(b)}\\mathrm{i}\\in\\mathbb{C}$.`
    // En interactif, le champ « |z| = » tient lieu de consigne
    this.question += this.interactif
      ? '<br><br>'
      : '<br><br>Calculer le module de $z$.'
    this.correction =
      'On sait que si $z=a+\\mathrm{i}b$ alors $\\vert z\\vert=\\sqrt{a^2+b^2}$'
    this.correction += `<br>Il vient ici : $\\vert z\\vert=\\sqrt{${ecritureParentheseSiNegatif(a)}^2+${ecritureParentheseSiNegatif(b)}^2}$,`
    this.correction += ` d'où $\\vert z\\vert=\\sqrt{${a * a}+${b * b}}=\\sqrt{${a * a + b * b}}$.`
    this.correction += `<br>Le module de $z$ est donc $\\vert z\\vert=${miseEnEvidence(`\\sqrt{${a * a + b * b}}`)}$.`
    this.reponse = Math.sqrt(a * a + b * b)
  }
}
