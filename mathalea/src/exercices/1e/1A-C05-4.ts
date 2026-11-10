import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '19/12/2025'
export const uuid = '4fa90'
// @Author Gilles Mora
export const refs = {
  'fr-fr': ['1A-C05-4', '2A-N5-4'],
  'fr-ch': ['10CTQCMFA1-2', '10LCQCMFA1-2', '10LSQCMFA1-2'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Déterminer un ordre de grandeur avec un pourcentage'
export default class auto1AC5d extends ExerciceQcmA {
  private appliquerLesValeurs(
    prixInitial: number,
    remise: number,
    contexte: 'voiture' | 'maison',
  ): void {
    const pourcentageReel = (remise / prixInitial) * 100
    const dixPourcent = prixInitial / 10
    const unPourcent = prixInitial / 100

    // Déterminer la réponse correcte (le pourcentage le plus proche)
    const choixPourcentages = [0.1, 1, 10, 20]
    let reponseCorrecte = choixPourcentages[0]
    let ecartMin = Math.abs(pourcentageReel - choixPourcentages[0])

    for (const p of choixPourcentages) {
      const ecart = Math.abs(pourcentageReel - p)
      if (ecart < ecartMin) {
        ecartMin = ecart
        reponseCorrecte = p
      }
    }

    const article = contexte === 'voiture' ? "d'une voiture" : "d'une maison"

    this.enonce = `Le prix ${article} est $${texNombre(prixInitial)}$ €.<br>
    Le vendeur propose une remise de $${texNombre(remise)}$ €.<br>
    Le pourcentage de remise le plus proche est :`

    // Correction avec raisonnement adapté selon le cas
    let explicationOrdreGrandeur: string

    if (reponseCorrecte === 0.1) {
      explicationOrdreGrandeur = `La remise ($${texNombre(remise)}$ €) est très petite par rapport au prix.<br>
      On prend $1\\,\\%$ de $${texNombre(prixInitial)}$ €. Cela revient à diviser par $100$.<br>
      On obtient $${texNombre(unPourcent)}$ €.<br>
      On remarque que la remise est environ $10$ fois plus petite que $1\\,\\%$ du prix.<br>`
    } else if (reponseCorrecte === 1) {
      explicationOrdreGrandeur = `La remise ($${texNombre(remise)}$ €) est petite par rapport au prix.<br>
      On prend $1\\,\\%$ de $${texNombre(prixInitial)}$ €. Cela revient à diviser par $100$.<br>
      On obtient $${texNombre(unPourcent)}$ €.<br>
      On remarque que la remise est proche de $1\\,\\%$ du prix.<br>`
    } else if (reponseCorrecte === 10) {
      explicationOrdreGrandeur = `On prend $10\\,\\%$ de $${texNombre(prixInitial)}$ €. Cela revient à diviser par $10$.<br>
      On obtient $${texNombre(dixPourcent)}$ €.<br>
      On remarque que la remise ($${texNombre(remise)}$ €) est proche de $10\\,\\%$ du prix.<br>`
    } else {
      // 20%
      explicationOrdreGrandeur = `On prend $10\\,\\%$ de $${texNombre(prixInitial)}$ €. Cela revient à diviser par $10$.<br>
      On obtient $${texNombre(dixPourcent)}$ €.<br>
      On remarque que la remise ($${texNombre(remise)}$ €) est environ $2$ fois plus grande que $10\\,\\%$ du prix.<br>`
    }

    this.correction = `Pour déterminer un ordre de grandeur, on cherche à comparer la remise avec des pourcentages simples du prix initial.<br>
    Les pourcentages de référence les plus utiles sont $1\\,\\%$ et $10\\,\\%$ car ils sont faciles à calculer mentalement.<br>
    ${explicationOrdreGrandeur}
    Le pourcentage le plus proche parmi les propositions est $${miseEnEvidence(texNombre(reponseCorrecte) + '\\,\\%')}$.`

    this.reponses = [
      `$${texNombre(reponseCorrecte)}\\,\\%$`,
      ...choixPourcentages
        .filter((p) => p !== reponseCorrecte)
        .map((p) => `$${texNombre(p)}\\,\\%$`),
    ]
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(22030, 30, 'voiture')
  }

  versionAleatoire: () => void = () => {
    const contexte = choice(['voiture', 'maison'] as const)
    const multiplicateur = contexte === 'voiture' ? 1 : 10
    const cas = choice([1, 2, 3, 4])

    switch (cas) {
      case 1: {
        // Cas ~0,1%
        const prixRond = randint(211, 279) * 100 * multiplicateur
        const ajout = randint(2, 5) * 10 * multiplicateur
        const prixInitial = prixRond + ajout
        const remise = ajout
        this.appliquerLesValeurs(prixInitial, remise, contexte)
        break
      }
      case 2: {
        // Cas ~1%
        const prixRond = randint(211, 279) * 100 * multiplicateur
        const ajout = randint(18, 35) * 10 * multiplicateur
        const prixInitial = prixRond + ajout
        const remise = ajout
        this.appliquerLesValeurs(prixInitial, remise, contexte)
        break
      }
      case 3: {
        // Cas ~10%
        const prixRond = randint(211, 279) * 100 * multiplicateur
        const ajout = randint(18, 35) * 100 * multiplicateur
        const prixInitial = prixRond + ajout
        const remise = ajout
        this.appliquerLesValeurs(prixInitial, remise, contexte)
        break
      }
      case 4: {
        // Cas ~20%
        const prixRond = randint(211, 279) * 100 * multiplicateur
        const ajout = randint(60, 70) * 100 * multiplicateur
        const prixInitial = prixRond + ajout
        const remise = ajout
        this.appliquerLesValeurs(prixInitial, remise, contexte)
        break
      }
    }
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
