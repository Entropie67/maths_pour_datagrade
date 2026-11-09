import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer la moyenne d’une série de nombres'
export const interactifReady = true

export const uuid = 'tfkec'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q5 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  enonce(valeurs?: number[]): void {
    if (valeurs == null) {
      // Choisir une somme cible parmi 60, 70, 80, 90
      const sommeTarget: number = choice([60, 70, 80, 90])

      valeurs = []

      // Générer 2 paires de nombres complémentaires à 20
      const a1 = randint(8, 15)
      const a2 = 20 - a1
      const b1 = randint(8, 15)
      const b2 = 20 - b1

      valeurs.push(a1, a2, b1, b2)

      const somme = a1 + a2 + b1 + b2

      // Le 5e nombre est calculé pour atteindre la somme cible
      const dernierNombre = sommeTarget - somme

      // Si le dernier nombre est valide (positif et raisonnable), on l'ajoute
      if (dernierNombre > 0 && dernierNombre <= 30) {
        valeurs.push(dernierNombre)
      } else {
        // Sinon on recommence
        this.enonce()
        return
      }

      valeurs = shuffle(valeurs)
    }

    const somme = valeurs[0] + valeurs[1] + valeurs[2] + valeurs[3] + valeurs[4]
    const moyenne = somme / 5

    this.reponse = texNombre(moyenne, 1)
    this.question = `Moyenne de la série :<br>$${valeurs.join(' ~;~ ')}$.`
    this.correction = `La moyenne est : $\\dfrac{${valeurs.join('+')}}{5}=\\dfrac{${somme}}{5}=${miseEnEvidence(texNombre(moyenne, 1))}$.`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce([14, 10, 12, 8, 16])
    else this.enonce()
  }
}
