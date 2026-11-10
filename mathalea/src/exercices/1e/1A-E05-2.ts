import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = '57e52'
export const refs = {
  'fr-fr': ['1A-E05-2', 'BP1CF05'],
  'fr-ch': ['11CTQCMFA1-8', '11LCQCMFA1-8', '11LSQCMFA1-8'],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre = 'Calculer un taux réciproque dans des cas particuliers'
export const dateDePublication = '15/07/2025'
export const dateDeModifImportante = '21/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class TauxReciproqueP extends ExerciceQcmACourt {
  // Pourcentage saisi lorsque la version QCM est désactivée
  private reponseSaisie = 0

  // S'occupe de passser les données originales à la fonction appliquerLesValeurs

  versionOriginale: () => void = () => {
    this.enonce = `Un prix diminue de $50\\,\\%$. <br>
    Pour retrouver le prix initial, il faut une augmentation de :`
    const corrige = (
      mise: string,
    ) => `Le coefficient multiplicateur associé à une diminution de $50\\,\\%$ est $1-0,5=0,5$.<br>
    Comme  $2\\times 0,5=1$, il faut donc multiplier par $2$ (coefficient multiplicateur réciproque) pour revenir au prix initial.<br>
      Un coefficient multiplicateur de $2$ correspond à un taux d'évolution de $100\\,\\%$.<br>
      En effet, $T=2-1=1=100\\,\\%$.<br>
      On en déduit qu'il faut une augmentation de  $${miseEnEvidence(mise)}$.`
    this.correction = corrige('100\\,\\%')
    this.reponseSaisie = 100

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
          const corrige = (
            mise: string,
          ) => `Le coefficient multiplicateur associé à une augmentation de $${a}\\,\\%$ est $1+${texNombre(a / 100, 2)}=${texNombre(1 + a / 100, 4)}$.<br>
    Comme $${b}\\times ${texNombre(c, 2)}=1$, il faut donc multiplier par $${texNombre(c, 2)}$ (coefficient multiplicateur réciproque) pour revenir au prix initial.<br>
      Un coefficient multiplicateur de $${texNombre(c, 2)}$ correspond à un taux d'évolution de $-${d}\\,\\%$.<br>
      En effet, $T=${texNombre(c, 2)}-1=${texNombre(c - 1, 2)}=-${d}\\,\\%$.<br>
      On en déduit qu'il faut une baisse de $${miseEnEvidence(mise)}$.`
          this.correction = corrige(`${d}\\,\\%`)
          this.reponseSaisie = d
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
          const corrige = (
            mise: string,
          ) => `Le coefficient multiplicateur associé à une baisse de $${a}\\,\\%$ est $1-${texNombre(a / 100, 2)}=${texNombre(1 - a / 100, 4)}$.<br>
    Comme $${texNombre(b, 2)}\\times ${texNombre(c, 2)}=1$, il faut donc multiplier par $${texNombre(c, 2)}$ (coefficient multiplicateur réciproque) pour revenir au prix initial.<br>
      Un coefficient multiplicateur de $${texNombre(c, 2)}$ correspond à un taux d'évolution de $${d}\\,\\%$.<br>
      En effet, $T=${texNombre(c, 2)}-1=${texNombre(c - 1, 2)}=${d}\\,\\%$.<br>
      On en déduit qu'il faut une augmentation de $${miseEnEvidence(mise)}$.`
          this.correction = corrige(`${d}\\,\\%`)
          this.reponseSaisie = d
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
    this.enonceCourt = () =>
      this.enonce.replace(
        /Pour retrouver le prix initial, il faut une (augmentation|baisse) de :\s*$/,
        'Quelle $1 faut-il appliquer pour retrouver le prix initial ?',
      )
    this.reponseCourte = () => String(this.reponseSaisie)
    this.optionsChampReponseCourte = { texteApres: '$\\,\\%$' }

    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })

    this.versionAleatoire()
  }
}
