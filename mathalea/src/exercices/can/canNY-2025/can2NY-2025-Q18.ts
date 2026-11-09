import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Trouver un nombre'
export const interactifReady = true

export const uuid = '365f4'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class nombreATrouver extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierFullOperations
  }

  nouvelleVersion() {
    const choix = this.quotaChoice('choix', [1, 2, 3])
    const nbre = this.quotaChoice('nbre', [-2025, 2025])
    if (choix === 1) {
      this.question = `En multipliant un nombre positif par lui-même, on trouve $${texNombre(2025, 0)}$. <br>
            Quel est ce nombre ? `
      this.correction = ` $\\sqrt{${texNombre(2025, 0)}}\\times \\sqrt{${texNombre(2025, 0)}}=${texNombre(2025, 0)}$.<br>
            Le nombre est donc $${miseEnEvidence(`\\sqrt{${texNombre(2025, 0)}}`)}$.`
      this.reponse = '\\sqrt{2025}'
    }
    if (choix === 2) {
      this.question = `En multipliant un nombre négatif par lui-même, on trouve $${texNombre(2025, 0)}$. <br>
            Quel est ce nombre ? `
      this.correction = ` $-\\sqrt{${texNombre(2025, 0)}}\\times (-\\sqrt{${texNombre(2025, 0)}})=${texNombre(2025, 0)}$.<br>
            Le nombre est donc $${miseEnEvidence(`-\\sqrt{${texNombre(2025, 0)}}`)}$.`
      this.reponse = '-\\sqrt{2025}'
    }
    if (choix === 3) {
      this.question = `En multipliant un nombre par  $${texNombre(nbre)}$, on trouve $1$. <br>
              Quel est ce nombre ? `
      this.correction = ` $${texNombre(nbre)}\\times\\dfrac{1}{${nbre}}=1$.<br>
              Le nombre est donc $${miseEnEvidence(`\\dfrac{1}{${nbre}}`)}$.`
      if (nbre === 2025) {
        this.reponse = `\\dfrac{1}{${nbre}}`
      } else {
        this.reponse = `-\\dfrac{1}{${-nbre}}`
      }
    }
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
