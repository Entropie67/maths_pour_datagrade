import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Question $22$'
export const interactifReady = true

export const uuid = 'fhmbj'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/ export default class Can2026TermQ22 extends ExerciceCan {
  enonce(nbLettres?: number, nbTirages?: number, lettres?: string[]): void {
    if (nbLettres == null || nbTirages == null || lettres == null) {
      nbTirages = 3
      nbLettres = choice([4, 5, 6])
      const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
      lettres = alphabet.slice(0, nbLettres)
    }

    // Nombre d'arrangements : A(n, p) = n! / (n-p)! = n × (n-1) × ... × (n-p+1)
    let resultat = 1
    const facteurs: string[] = []
    for (let i = 0; i < nbTirages; i++) {
      resultat *= nbLettres - i
      facteurs.push(String(nbLettres - i))
    }

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = String(resultat)

    const listeNoms = lettres.join(', ')

    this.question = `On tire successivement ${nbTirages === 3 ? 'trois' : 'deux'} lettres au hasard et sans remise parmi $${listeNoms}$.<br>
    Combien de «\u00a0mots\u00a0» différents peut-on former ?<br>`

    this.correction = `Il s'agit d'un arrangement de $${nbTirages}$ éléments parmi $${nbLettres}$ (l'ordre compte et sans remise).<br>
    Le nombre de mots est $${facteurs.join('\\times ')}=${miseEnEvidence(String(resultat))}$.`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(4, 3, ['A', 'B', 'C', 'D'])
    else this.enonce()
  }
}
