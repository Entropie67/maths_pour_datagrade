import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Trouver un nombre'
export const interactifReady = true

export const uuid = 'rg0k0'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class nombreATrouver2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierFullOperations
  }

  nouvelleVersion() {
    const annee = 2026
    const choix = this.canOfficielle ? 3 : this.quotaChoice('choix', [1, 2, 3])
    const nbre = this.canOfficielle
      ? annee
      : this.quotaChoice('nbre', [-annee, annee])
    if (choix === 1) {
      this.question = `En multipliant un nombre positif par lui-même, on trouve $${texNombre(annee, 0)}$. <br>
            Quel est ce nombre ? `
      this.correction = ` $\\sqrt{${texNombre(annee, 0)}}\\times \\sqrt{${texNombre(annee, 0)}}=${texNombre(annee, 0)}$.<br>
            Le nombre est donc $${miseEnEvidence(`\\sqrt{${texNombre(annee, 0)}}`)}$.`
      this.reponse = `\\sqrt{${annee}}`
    }
    if (choix === 2) {
      this.question = `En multipliant un nombre négatif par lui-même, on trouve $${texNombre(annee, 0)}$. <br>
            Quel est ce nombre ? `
      this.correction = ` $-\\sqrt{${texNombre(annee, 0)}}\\times (-\\sqrt{${texNombre(annee, 0)}})=${texNombre(annee, 0)}$.<br>
            Le nombre est donc $${miseEnEvidence(`-\\sqrt{${texNombre(annee, 0)}}`)}$.`
      this.reponse = `-\\sqrt{${annee}}`
    }
    if (choix === 3) {
      this.question = `En multipliant un nombre par  $${texNombre(nbre)}$, on trouve $1$. <br>
              Quel est ce nombre ? `
      this.correction = ` $${texNombre(nbre)}\\times\\dfrac{1}{${nbre}}=1$.<br>
              Le nombre est donc $${miseEnEvidence(`\\dfrac{1}{${nbre}}`)}$.`
      if (nbre === annee) {
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
