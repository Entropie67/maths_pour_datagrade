// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 34543 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
// import ExerciceQcmA from '../../ExerciceQcmA'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '34543'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer un taux réciproque dans des cas particuliers'
export const dateDePublication = '15/07/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class TauxReciproquePOld extends ExerciceQcmA {
  // S'occupe de passser les données originales à la fonction appliquerLesValeurs

  versionOriginale: () => void = () => {
    this.enonce = `Un prix diminue de $50\\,\\%$. <br>
    Pour retrouver le prix initial, il faut une augmentation de :`
    this.correction = `Le coefficient multiplicateur associé à une diminution de $50\\,\\%$ est $1-0,5=0,5$.<br>
    Comme  $2\\times 0,5=1$, il faut donc multiplier par $2$ (coefficient multiplicateur réciproque) pour revenir au prix initial.<br>
      Un coefficient multiplicateur de $2$ correspond à un taux d'évolution de $100\\,\\%$.<br>
      En effet, $T=2-1=1=100\\,\\%$.<br>
      On en déduit qu'il faut une augmentation de  $${miseEnEvidence('100\\,\\%')}$.`

    this.reponses = ['$100\\,\\%$', '$50\\,\\%$', '$150\\,\\%$', '$200\\,\\%$']
  }

  versionAleatoire: () => void = () => {
    switch (choice([1, 2])) {
      case 1:
        {
          const listeTaux = [
            [100, 2, 0.5, 50],
            [300, 4, 0.25, 75],
            [400, 5, 0.2, 80],
            [900, 10, 0.1, 90],
          ]
          const taux = choice(listeTaux)
          const a = taux[0]
          const b = taux[1]
          const c = taux[2]
          const d = taux[3]

          this.enonce = `Un prix augmente de $${texNombre(a)}\\,\\%$. <br>
    Pour retrouver le prix initial, il faut une baisse de :`
          this.correction = `Le coefficient multiplicateur associé à une augmentation de $${a}\\,\\%$ est $1+${texNombre(a / 100, 2)}=${texNombre(1 + a / 100, 4)}$.<br>
    Comme $${b}\\times ${texNombre(c, 2)}=1$, il faut donc multiplier par $${texNombre(c, 2)}$ (coefficient multiplicateur réciproque) pour revenir au prix initial.<br>
      Un coefficient multiplicateur de $${texNombre(c, 2)}$ correspond à un taux d'évolution de $-${d}\\,\\%$.<br>
      En effet, $T=${texNombre(c, 2)}-1=${texNombre(c - 1, 2)}=-${d}\\,\\%$.<br>
      On en déduit qu'il faut une baisse de $${miseEnEvidence(`${d}\\,\\%`)}$.`
          this.reponses =
            a === 100
              ? [
                  `$${d}\\,\\%$`,
                  `$${100 - a}\\,\\%$`,
                  `$${a}\\,\\%$`,
                  '$150\\,\\%$',
                ]
              : [
                  `$${d}\\,\\%$`,
                  `$${100 - d}\\,\\%$`,
                  `$${a}\\,\\%$`,
                  '$100\\,\\%$',
                ]
        }
        break

      case 2:
      default:
        {
          const listeTaux = [
            [50, 0.5, 2, 100],
            [90, 0.1, 10, 900],
            [75, 0.25, 4, 300],
          ]
          const taux = choice(listeTaux)
          const a = taux[0]
          const b = taux[1]
          const c = taux[2]
          const d = taux[3]

          this.enonce = `Un prix diminue de $${texNombre(a)}\\,\\%$. <br>
    Pour retrouver le prix initial, il faut une augmentation de :`
          this.correction = `Le coefficient multiplicateur associé à une baisse de $${a}\\,\\%$ est $1-${texNombre(a / 100, 2)}=${texNombre(1 - a / 100, 4)}$.<br>
    Comme $${texNombre(b, 2)}\\times ${texNombre(c, 2)}=1$, il faut donc multiplier par $${texNombre(c, 2)}$ (coefficient multiplicateur réciproque) pour revenir au prix initial.<br>
      Un coefficient multiplicateur de $${texNombre(c, 2)}$ correspond à un taux d'évolution de $${d}\\,\\%$.<br>
      En effet, $T=${texNombre(c, 2)}-1=${texNombre(c - 1, 2)}=${d}\\,\\%$.<br>
      On en déduit qu'il faut une augmentation de $${miseEnEvidence(`${d}\\,\\%`)}$.`
          this.reponses = [
            `$${d}\\,\\%$`,
            `$${texNombre(100 + d)}\\,\\%$`,
            `$${a}\\,\\%$`,
            `$${a + 10}\\,\\%$`,
          ]
        }
        break
    }
  }

  constructor() {
    super()

    this.versionAleatoire()
  }
}
