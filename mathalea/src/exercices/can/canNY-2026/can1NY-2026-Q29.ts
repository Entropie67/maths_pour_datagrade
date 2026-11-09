import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer une différence de deux carrés'
export const interactifReady = true

export const uuid = 'p6rs9'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class diffDeDeuxCarres extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
  }

  nouvelleVersion() {
    const annee = 2026
    const choix = this.canOfficielle ? 1 : this.quotaRandint('choix', 1, 3)
    const a = this.quotaRandint('a', 1, 2)

    if (choix === 1) {
      // Cas 1 : 2026² - 2025²
      this.question = `Calculer $${texNombre(annee, 0)}^2-${texNombre(annee - 1, 0)}^2$.`
      this.correction = `On utilise l'égalité remarquable $a^2-b^2=(a-b)(a+b)$ avec $a=${texNombre(annee, 0)}$ et $b=${texNombre(annee - 1, 0)}$.<br>
      $${texNombre(annee, 0)}^2-${texNombre(annee - 1, 0)}^2=(${texNombre(annee, 0)}-${texNombre(annee - 1, 0)})(${texNombre(annee, 0)}+${texNombre(annee - 1, 0)})
      =1\\times ${texNombre(2 * annee - 1, 0)}=${miseEnEvidence(`${texNombre(2 * annee - 1, 0)}`)}$.`
      this.reponse = 2 * annee - 1
      if (this.interactif) {
        this.question += `<br>$${texNombre(annee, 0)}^2-${texNombre(annee - 1, 0)}^2=$`
      }
    } else if (choix === 2) {
      // Cas 2 : 2026² - 2024² (avec a aléatoire entre 1 et 2)
      this.question = `Calculer $${texNombre(annee, 0)}^2-${texNombre(annee - a, 0)}^2$.`
      const b = annee - a
      const resultat = (annee - b) * (annee + b)
      this.correction = `On utilise l'égalité remarquable $a^2-b^2=(a-b)(a+b)$ avec $a=${texNombre(annee, 0)}$ et $b=${texNombre(b, 0)}$.<br>
      $${texNombre(annee, 0)}^2-${texNombre(b, 0)}^2=(${texNombre(annee, 0)}-${texNombre(b, 0)})(${texNombre(annee, 0)}+${texNombre(b, 0)})
      =${texNombre(a, 0)}\\times ${texNombre(annee + b, 0)}=${miseEnEvidence(`${texNombre(resultat, 0)}`)}$.`
      this.reponse = resultat
      if (this.interactif) {
        this.question += `<br>$${texNombre(annee, 0)}^2-${texNombre(b, 0)}^2=$`
      }
    } else {
      // Cas 3 : 2025² - 2026² ou 2024² - 2026²
      const c = annee - a // c = 2025 ou 2024
      this.question = `Calculer $${texNombre(c, 0)}^2-${texNombre(annee, 0)}^2$.`
      const resultat = (c - annee) * (c + annee)
      this.correction = `On utilise l'égalité remarquable $a^2-b^2=(a-b)(a+b)$ avec $a=${texNombre(c, 0)}$ et $b=${texNombre(annee, 0)}$.<br>
      $${texNombre(c, 0)}^2-${texNombre(annee, 0)}^2=(${texNombre(c, 0)}-${texNombre(annee, 0)})(${texNombre(c, 0)}+${texNombre(annee, 0)})
      =${texNombre(c - annee, 0)}\\times ${texNombre(c + annee, 0)}=${miseEnEvidence(`${texNombre(resultat, 0)}`)}$.`
      this.reponse = resultat
      if (this.interactif) {
        this.question += `<br>$${texNombre(c, 0)}^2-${texNombre(annee, 0)}^2=$`
      }
    }
  }
}
