// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid e6427 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { prenomF } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '01/10/2025'
export const uuid = 'e6427'
// @Author Gilles Mora
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer une vitesse'
export default class auto1AC7bOld extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    this.enonce =
      'Une athlète parcourt $1\\text{ km}$ en $5$ minutes. <br>Quelle est sa vitesse moyenne ?   '
    this.correction = `Dans une $1$ heure, il y a $5\\times 12$ minutes.<br>
      Ainsi, en $1$ heure, elle parcourt $12$ fois plus de distance, soit $12\\text{ km}$.<br>
      Sa vitesse moyenne est donc $${miseEnEvidence('12')}\\text{ km/h}$. `
    this.reponses = [
      '$12\\text{ km/h}$',
      '$8\\text{ km/h}$ ',
      '$10\\text{ km/h}$',
      '$14\\text{ km/h}$ ',
    ]
  }

  versionAleatoire: () => void = () => {
    let compteur = 0
    const choix = prenomF()
    do {
      switch (choice([1, 2, 3, 4])) {
        case 1: {
          const dist = randint(1, 4)
          this.enonce = `${dist > 2 ? 'Une athlète' : `${choix}`} parcourt $${dist}\\text{ km}$ en $12$ minutes. <br>Quelle est sa vitesse moyenne ?   `
          this.correction = `Dans une $1$ heure, il y a $12\\times 5$ minutes.<br>
      Ainsi, en $1$ heure, ${dist > 2 ? 'cette athlète' : `${choix}`}  parcourt $5$ fois plus de distance, soit $${texNombre(5 * dist)}\\text{ km}$.<br>
      Sa vitesse moyenne est donc $${miseEnEvidence(5 * dist)}\\text{ km/h}$. `
          this.reponses = [
            `$${texNombre(5 * dist)}\\text{ km/h}$`,
            `$${texNombre(4 * dist)}\\text{ km/h}$ `,
            `$${texNombre(12 * dist)}\\text{ km/h}$`,
            `$${texNombre(12 * 2)}\\text{ km/h}$ `,
          ]
          break
        }

        case 2: {
          const dist = randint(3, 9)
          this.enonce = `${choix} parcourt $${texNombre(dist * 100, 0)}\\text{ m}$ en $5$ minutes. <br>Quelle est sa vitesse moyenne ?   `
          this.correction = `Dans une $1$ heure, il y a $5\\times 12$ minutes.<br>
      Ainsi, en $1$ heure, ${choix} parcourt $12$ fois plus de distance, soit $${texNombre(dist / 10, 2)}\\times 12=${texNombre((12 * dist) / 10, 2)}\\text{ km}$.<br>
      Sa vitesse moyenne est donc $${miseEnEvidence(texNombre((12 * dist) / 10, 2))}\\text{ km/h}$. `
          this.reponses = [
            `$${texNombre((12 * dist) / 10, 2)}\\text{ km/h}$`,
            `$${texNombre(dist, 2)}\\text{ km/h}$ `,
            `$${texNombre(5)}\\text{ km/h}$`,
            `$${texNombre(12)}\\text{ km/h}$ `,
          ]
          break
        }
        case 3: {
          const dist = randint(3, 9)
          this.enonce = `${choix} parcourt $${texNombre(dist * 100, 0)}\\text{ m}$ en $3$ minutes. <br>Quelle est sa vitesse moyenne ?   `
          this.correction = `Dans une $1$ heure, il y a $3\\times 20$ minutes.<br>
    Ainsi, en $1$ heure, ${choix} parcourt $20$ fois plus de distance, soit $${texNombre(dist / 10, 2)}\\times 20=${texNombre((20 * dist) / 10, 2)}\\text{ km}$.<br>
    Sa vitesse moyenne est donc $${miseEnEvidence(texNombre((20 * dist) / 10, 2))}\\text{ km/h}$. `
          this.reponses = [
            `$${texNombre((20 * dist) / 10, 2)}\\text{ km/h}$`,
            `$${texNombre((15 * dist) / 10, 2)}\\text{ km/h}$ `,
            `$${texNombre((10 * dist) / 10, 2)}\\text{ km/h}$`,
            `$${texNombre((3 * dist) / 10, 2)}\\text{ km/h}$ `,
          ]
          break
        }

        case 4: {
          const dist = randint(3, 9)
          this.enonce = `${choix} parcourt $${texNombre(dist * 100, 0)}\\text{ m}$ en $4$ minutes. <br>Quelle est sa vitesse moyenne ?   `
          this.correction = `Dans une $1$ heure, il y a $4\\times 15$ minutes.<br>
    Ainsi, en $1$ heure, ${choix} parcourt $15$ fois plus de distance, soit $${texNombre(dist / 10, 2)}\\times 15=${texNombre((15 * dist) / 10, 2)}\\text{ km}$.<br>
    Sa vitesse moyenne est donc $${miseEnEvidence(texNombre((15 * dist) / 10, 2))}\\text{ km/h}$. `
          this.reponses = [
            `$${texNombre((15 * dist) / 10, 2)}\\text{ km/h}$`,
            `$${texNombre((12 * dist) / 10, 2)}\\text{ km/h}$ `,
            `$${texNombre((10 * dist) / 10, 2)}\\text{ km/h}$`,
            `$${texNombre((4 * dist) / 10, 2)}\\text{ km/h}$ `,
          ]
          break
        }
      }
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
