import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
export const titre = 'Calculer une somme/différence'
export const interactifReady = true

export const uuid = 'k3zjv'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author GM+EE
 */
export default class CalculDivers extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const annee = 2026
    switch (this.canOfficielle ? 1 : this.quotaRandint('choix', 1, 7)) {
      case 1:
        this.question = `Combien vaut $${texNombre(annee)} + 20 + ${annee % 10}$ ?`
        this.reponse = annee + 20 + (annee % 10)
        this.correction = `$${texNombre(annee)} + 20 + ${annee % 10}=${texNombre(annee)} + ${texNombre(20 + (annee % 10))}=${miseEnEvidence(texNombre(this.reponse, 4))}$`
        break
      case 2:
        this.question = `Combien vaut $${texNombre(annee)} + 20 -  ${annee % 10}$ ?`
        this.reponse = annee + 20 - (annee % 10)
        this.correction = `$${texNombre(annee)} + 20 -  ${annee % 10}=${texNombre(annee + 20)} -  ${annee % 10}=${miseEnEvidence(texNombre(this.reponse, 4))}$`
        break
      case 3:
        this.question = `Combien vaut $${texNombre(annee)} - 20 - ${annee % 10}$ ?`
        this.reponse = annee - 20 - (annee % 10)
        this.correction = `$${texNombre(annee)} - 20 - ${annee % 10}=${texNombre(annee - 20)} -${annee % 10}=${miseEnEvidence(texNombre(this.reponse, 4))}$`
        break
      case 4:
        this.question = `Combien vaut $${texNombre(annee)} - 20 + ${annee % 10}$ ?`
        this.reponse = annee - 20 + (annee % 10)
        this.correction = `$${texNombre(annee)} - 20 + ${annee % 10}=${texNombre(annee - 20)} + ${annee % 10}=${miseEnEvidence(texNombre(this.reponse, 4))}$`
        break
      case 5:
        this.question = `Combien vaut $${texNombre(annee)} - (20 + ${annee % 10})$ ?`
        this.reponse = annee - (20 + (annee % 10))
        this.correction = `$${texNombre(annee)} - (20 + ${annee % 10})=${texNombre(annee)} - ${20 + (annee % 10)}=${miseEnEvidence(texNombre(this.reponse, 4))}$`
        break
      case 6:
        this.question = `Combien vaut $${texNombre(annee)} - (20 \\times ${annee % 10})$ ?`
        this.reponse = annee - 20 * (annee % 10)
        this.correction = `$${texNombre(annee)} - (20 \\times ${annee % 10})=${texNombre(annee)} - ${20 * (annee % 10)}=${miseEnEvidence(texNombre(this.reponse, 4))}$`
        break
      case 7:
        this.question = `Combien vaut $${texNombre(annee)} + (20 \\times ${annee % 10})$ ?`
        this.reponse = annee + 20 * (annee % 10)
        this.correction = `$${texNombre(annee)} + (20 \\times ${annee % 10})=${texNombre(annee)} +${20 * (annee % 10)}=${miseEnEvidence(texNombre(this.reponse, 4))}$`
        break
    }
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
