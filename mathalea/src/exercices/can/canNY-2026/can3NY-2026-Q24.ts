import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = ''
export const interactifReady = true

export const uuid = 't25p6'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class canQ24 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
  }

  nouvelleVersion() {
    const annee = 2026
    switch (this.canOfficielle ? 1 : this.quotaRandint('cas', 1, 3)) {
      case 1:
        this.question = `Exprimer la somme de $a$ et $${texNombre(annee, 0)}$ en fonction de $a$.`
        this.reponse = `${annee}+a`
        this.correction = `La somme de $a$ et $${texNombre(annee, 0)}$ en fonction de $a$ est donnée par $${miseEnEvidence(`${texNombre(annee)}+a`)}$`
        break
      case 2:
        this.reponse = `a\\times ${annee}`
        this.question = `Comment peut se noter le produit de $a$ par $${texNombre(annee, 0)}$  en fonction de $a$?`

        this.correction = `Le produit de $a$ par $${texNombre(annee, 0)}$ se note $${miseEnEvidence(`a\\times ${texNombre(annee, 0)}`)}$.`
        break
      case 3:
        this.reponse = `a\\div ${annee}`
        this.question = `Exprimer le quotient de $a$ par $${texNombre(annee, 0)}$  en fonction de $a$.`

        this.correction = `Le quotient de $a$ par $${texNombre(annee, 0)}$ se note  $${miseEnEvidence(`\\dfrac{a}{${texNombre(annee, 0)}}`)}$.`
        break
    }
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
