import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer la moyenne de cinq nombres'
export const interactifReady = true

export const uuid = '7jkqc'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q14 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(valeurs?: number[]) {
    if (valeurs == null) {
      // Tableau de 8 cas prédéfinis : [val1, val2, val3, val4, val5]
      // Sommes facilement divisibles par 5
      const listeCas = [
        [25, 75, 100, 100, 150], // Somme = 450, Moyenne = 90
        [50, 75, 100, 125, 150], // Somme = 500, Moyenne = 100
        [25, 50, 75, 125, 175], // Somme = 450, Moyenne = 90
        [50, 50, 75, 100, 125], // Somme = 400, Moyenne = 80
        [25, 75, 100, 150, 150], // Somme = 500, Moyenne = 100
        [50, 100, 125, 150, 175], // Somme = 600, Moyenne = 120
        [25, 25, 50, 75, 125], // Somme = 300, Moyenne = 60
        [50, 75, 125, 125, 175], // Somme = 550, Moyenne = 110
      ]

      valeurs = choice(listeCas)
    }

    const somme = valeurs.reduce((acc, val) => acc + val, 0)
    const moyenne = somme / valeurs.length
    this.reponse = moyenne

    this.question = `Moyenne de <br>$${valeurs[0]}$ ${sp(2)} ; ${sp(2)} $${valeurs[1]}$ ${sp(2)} ; ${sp(2)} $${valeurs[2]}$ ${sp(2)} ; ${sp(2)} $${valeurs[3]}$ ${sp(2)} ; ${sp(2)} $${valeurs[4]}$<br>
 `

    // Construction de la correction avec underbrace pour les paires dont la somme est un multiple de 100
    const correctionSomme = this.construireSommeAvecUnderbrace(valeurs)

    this.correction = `La somme des $5$ valeurs est :
$${correctionSomme}=${somme}$.<br>
La moyenne est donc $\\dfrac{${somme}}{5}=${miseEnEvidence(moyenne)}$.`
  }

  /**
   * Regroupe les paires dont la somme est un multiple de 100 avec \underbrace,
   * et place les termes restants à la fin.
   */
  private construireSommeAvecUnderbrace(valeurs: number[]): string {
    const restants = [...valeurs]
    const parties: string[] = []

    // Chercher des paires dont la somme est un multiple de 50
    const utilises = new Array(restants.length).fill(false)

    for (let i = 0; i < restants.length; i++) {
      if (utilises[i]) continue
      for (let j = i + 1; j < restants.length; j++) {
        if (utilises[j]) continue
        const s = restants[i] + restants[j]
        if (s % 50 === 0) {
          parties.push(`\\underbrace{${restants[i]}+${restants[j]}}_{${s}}`)
          utilises[i] = true
          utilises[j] = true
          break
        }
      }
    }

    // Ajouter les termes non regroupés
    for (let i = 0; i < restants.length; i++) {
      if (!utilises[i]) {
        parties.push(`${restants[i]}`)
      }
    }

    return parties.join('+')
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce([25, 175, 125, 75, 100])
    else this.enonce()
  }
}
