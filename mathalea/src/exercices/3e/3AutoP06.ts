import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { fraction } from '../../modules/fractions'
import { egal } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const titre =
  'Calculer le temps de trajet en fonction de la vitesse et de la distance'

export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'

export const dateDePublication = '24/12/2025'

export const uuid = '5ba87'

export const refs = {
  'fr-fr': ['3AutoP02-3'],
  'fr-ch': ['11CTFA1A-2', '11LCFA1A-2', '11LSFA1A-2', 'PRQPF03C-4'],
}

const texDuree = (heures: number, minutes: number, secondes = 0) =>
  [
    heures > 0 ? `${heures}\\text{ h}` : '',
    minutes > 0 ? `${minutes}\\text{ min}` : '',
    secondes > 0 ? `${secondes}\\text{ s}` : '',
  ]
    .filter((morceau) => morceau !== '')
    .join('\\;')

/**
 * @author Jean-claude Lhote
 */
export default class VitesseEtDistance extends ExerciceQcmA {
  private appliquerLesValeurs(
    vitesse: number,
    diviseurMultiple: [number, number[]],
  ): void {
    const diviseur = diviseurMultiple[0]
    const rapport = choice(diviseurMultiple[1])

    const duree = (60 * rapport) / diviseur
    const distance = vitesse * (duree / 60)

    const hour = Math.floor(duree / 60)
    const duree2 = duree / 2
    const duree3 = duree * 1.5
    const duree4 = duree * 2
    const hour2 = Math.floor(duree2 / 60)
    const hour3 = Math.floor(duree3 / 60)
    const hour4 = Math.floor(duree4 / 60)
    const minute2 = Math.floor((duree2 / 60 - hour2) * 60)
    const minute3 = Math.floor((duree3 / 60 - hour3) * 60)
    const minute4 = Math.round((duree4 / 60 - hour4) * 60)
    const minute = Math.round((duree / 60 - hour) * 60)
    const seconde2 = Math.round(((duree2 / 60 - hour2) * 60 - minute2) * 60)
    const seconde3 = Math.round(((duree3 / 60 - hour3) * 60 - minute3) * 60)
    const frac =
      diviseur === 20
        ? fraction(Math.round(distance * 10), vitesse * 10)
        : fraction(Math.round(distance), vitesse)
    this.reponses = [
      `$${texDuree(hour, minute)}$`,
      `$${texDuree(hour2, minute2, seconde2)}$`,
      `$${texDuree(hour3, minute3, seconde3)}$`,
      `$${texDuree(hour4, minute4)}$`,
    ]

    this.enonce = `Une voiture roule à $${vitesse}$ km/h. Combien de temps met-elle pour parcourir $${texNombre(distance, 2)}$ km ?`
    this.correction = `Pour parcourir $${texNombre(distance, 2)}$ km à $${vitesse}$ km/h, il faut :<br>
    $${diviseur === 20 ? `\\dfrac{${texNombre(distance, 1)}}{${vitesse}}\\text{h}=` : ''}${frac.texFraction}\\text{h}${
      frac.estIrreductible
        ? egal(frac.valeurDecimale, distance / vitesse, 3)
          ? `=${texNombre(frac.valeurDecimale, 3)}\\text{h}`
          : ''
        : `=${frac.texFractionSimplifiee}\\text{h}`
    }=${miseEnEvidence(texDuree(hour, minute))}$.`
  }

  // s'occupe d'aléatoiriser les valeurs à passer à la fonction appliquerLesValeurs en vérifiant qu'on a bien 3 réponses différentes
  // Pour un qcm à n réponses, il faudrait vérifier que nombreElementsDifferents(this.reponses) < n
  versionAleatoire: () => void = () => {
    let compteur = 0
    do {
      const vitesse = this.sup2
        ? choice([60, 80, 100, 120])
        : choice([50, 70, 90, 110, 130])
      const diviseurMultiple: [number, number[]] = this.sup2
        ? choice([
            [2, [1, 3, 5]],
            [4, [1, 3, 5, 7]],
            [10, [1, 3, 9, 11]],
          ])
        : choice([[20, [1, 9, 11]]])
      this.appliquerLesValeurs(vitesse, diviseurMultiple)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()
    this.besoinFormulaire2CaseACocher = ['Distances entières', true]
    this.sup2 = true
    this.versionAleatoire()
    this.optionsDeComparaison = { HMS: true } // pour le test qcm_exercices
  }
}
