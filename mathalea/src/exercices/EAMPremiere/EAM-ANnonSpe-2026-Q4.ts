import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = '2e229'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Estimer un ordre de grandeur'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ4ANns2026 extends ExerciceQcmACourt {
  // a : puissance pour le 1er nombre (10^a - 1)
  // b : puissance pour le 2e nombre (10^b + 1)
  // dist : tableau contenant les puissances des 3 distracteurs
  private appliquerLesValeurs(a: number, b: number, dist: number[]): void {
    const n1 = Math.pow(10, a) - 1 // Ex: 10^3 - 1 = 999
    const n2 = Math.pow(10, b) + 1 // Ex: 10^3 + 1 = 1001
    const expected = Math.pow(10, a + b)

    this.enonce = `On considère le nombre : $E = ${texNombre(n1, 0)} \\times ${texNombre(n2, 0)}$. Un ordre de grandeur de $E$ est :`

    this.correction = `Comme $${texNombre(n1, 0)}$ est proche de $${texNombre(Math.pow(10, a), 0)}$ et $${texNombre(n2, 0)}$ est proche de $${texNombre(Math.pow(10, b), 0)}$, un ordre de grandeur de $E$ est $${texNombre(Math.pow(10, a), 0)} \\times ${texNombre(Math.pow(10, b), 0)} = ${miseEnEvidence(texNombre(expected, 0))}$.`

    // La bonne réponse en premier, suivie des trois distracteurs
    this.reponses = [
      `$${texNombre(expected, 0)}$`,
      `$${texNombre(Math.pow(10, dist[0]), 0)}$`,
      `$${texNombre(Math.pow(10, dist[1]), 0)}$`,
      `$${texNombre(Math.pow(10, dist[2]), 0)}$`,
    ]
  }

  versionOriginale: () => void = () => {
    // Version de l'image : E = 999 * 1001
    this.appliquerLesValeurs(3, 3, [3, 4, 5])
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    // Données structurées pour correspondre à votre boucle : [a, b, dist]
    // (Note : 'dist' regroupe vos variables de distracteurs dans un tableau pour plus de simplicité)
    const donnees: [number, number, number[]][] = [
      [3, 3, [3, 4, 5]], // 999 x 1001 -> 1 000 000
      [2, 2, [2, 3, 5]], // 99 x 101 -> 10 000
      [3, 2, [3, 4, 6]], // 999 x 101 -> 100 000
      [2, 3, [3, 4, 6]], // 99 x 1001 -> 100 000
      [4, 2, [4, 5, 7]], // 9999 x 101 -> 1 000 000
      [2, 4, [4, 5, 7]], // 99 x 10001 -> 1 000 000
      [4, 3, [5, 6, 8]], // 9999 x 1001 -> 10 000 000
      [3, 4, [5, 6, 8]], // 999 x 10001 -> 10 000 000
    ]

    let compteur = 0
    do {
      const [a1, b1, dist] = choice(donnees)
      this.appliquerLesValeurs(a1, b1, dist)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  // Si la méthode n'est pas héritée directement avec un alias global,
  // on utilise la méthode interne de ExerciceQcmA : this.aLeBonNombreDePropsDifferentes(4)

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /Un ordre de grandeur de \$E\$ est :\s*$/,
        this.interactif
          ? "Un ordre de grandeur de $E$, sous la forme d'une puissance de $10$, est "
          : "Donner un ordre de grandeur de $E$ sous la forme d'une puissance de $10$.",
      )
    // La bonne réponse du QCM est de la forme « $1\,000\,000$ » : on attend la puissance de 10 correspondante
    this.reponseCourte = () =>
      `10^{${this.reponses[0].replace(/\$|\\,/g, '').length - 1}}`
    this.clavierReponseCourte = KeyboardType.lyceeClassique
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
