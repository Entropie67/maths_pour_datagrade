import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { reduireAxPlusB } from '../../../lib/outils/ecritures'
export const titre = 'Réduire une expression'
export const interactifReady = true

export const uuid = 'yhfer'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class canQ152026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.optionsDeComparaison = { factorisation: true }
  }

  nouvelleVersion() {
    const annee = 2026
    const b = this.canOfficielle ? 26 : this.quotaChoice('b', [6, 20, 26])
    const r1 = annee - b
    const r2 = -annee + b
    if (this.canOfficielle ? true : this.quotaChoice('sens', [true, false])) {
      this.reponse = `${reduireAxPlusB(r1, 0)}`
      this.question = `Réduire l'écriture de $${texNombre(annee, 0)}x -${texNombre(b, 0)}x$.`
      this.correction = `$${texNombre(annee)}x -${texNombre(b, 0)}x= (${texNombre(annee, 0)} -${texNombre(b, 1)})x=${miseEnEvidence(texNombre(r1, 1) + 'x')}$ `
      this.optionsChampTexte = {
        texteAvant: `$${texNombre(annee, 0)}x -${texNombre(b, 0)}x=$`,
      }
    } else {
      this.reponse = `${reduireAxPlusB(r2, 0)}`
      this.question = `Réduire l'écriture de $${texNombre(b, 0)}x-${texNombre(annee, 0)}x$.`
      this.correction = `$${texNombre(b, 1)}x-${texNombre(annee, 0)}x=(${texNombre(b, 1)}-${texNombre(annee, 0)})x=${miseEnEvidence(texNombre(r2, 1) + 'x')}$ `
      this.optionsChampTexte = {
        texteAvant: `$${texNombre(b, 1)}x-${texNombre(annee, 0)}x=$`,
      }
    }
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
