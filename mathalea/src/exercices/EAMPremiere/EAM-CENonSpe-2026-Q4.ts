import Decimal from 'decimal.js'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '13606'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Trouver le calcul pour une baisse en pourcentage'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ4CEns2026 extends ExerciceQcmACourt {
  private prix = 0
  private pourcentage = 0

  private coefficientBaisse(): Decimal {
    return new Decimal(1).minus(new Decimal(this.pourcentage).div(100))
  }

  private prixApresBaisse(): Decimal {
    return new Decimal(this.prix).times(this.coefficientBaisse())
  }

  private appliquerLesValeurs(prix: number, p: number): void {
    this.prix = prix
    this.pourcentage = p
    const decimalP = new Decimal(p).div(100) // p/100, ex. 0,15
    const coeffBaisse = new Decimal(1).minus(decimalP) // 1 - p/100, ex. 0,85
    const coeffHausse = new Decimal(1).plus(decimalP) // 1 + p/100, ex. 1,15

    this.enonce = `Un article coûtant $${texNombre(prix)}$ € subit une baisse de $${p}\\,\\%$. <br>
    Pour obtenir le prix de cet article après la baisse, il faut faire le calcul :`

    this.correction = `Une baisse de $${p}\\,\\%$ revient à multiplier par le coefficient multiplicateur $CM=1-\\dfrac{${p}}{100}=1-${texNombre(decimalP)}=${texNombre(coeffBaisse)}$.<br>
Le calcul à effectuer est donc $${miseEnEvidence(`${texNombre(prix)}\\times ${texNombre(coeffBaisse)}`)}$.`

    this.reponses = [
      `$${texNombre(prix)}\\times ${texNombre(coeffBaisse)}$`,
      `$${texNombre(prix)}-${texNombre(decimalP)}$`,
      `$${texNombre(prix)}\\times ${texNombre(coeffHausse)}$`,
      `$${texNombre(prix)}\\times ${texNombre(decimalP)}$`,
    ]
  }

  versionOriginale: () => void = () => {
    // 300 € avec une baisse de 15 %
    this.appliquerLesValeurs(300, 15)
  }

  versionAleatoire = () => {
    // Pont avec le mécanisme Can : si le méta a coché « sujet officiel »,
    // on produit la version originale figée au lieu d'un tirage aléatoire.
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    let compteur = 0
    do {
      const prix = 100 * randint(2, 9) // multiple de 100
      const p = choice([5, 15, 25, 35, 45]) // multiple de 5, pas de 10
      this.appliquerLesValeurs(prix, p)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /\.\s*<br>\s*Pour obtenir le prix de cet article après la baisse, il faut faire le calcul :\s*$/,
        this.interactif
          ? '.<br>Le prix de cet article après la baisse est '
          : '.<br>Calculer le prix de cet article après la baisse.',
      )
    this.reponseCourte = () => this.prixApresBaisse().toString()
    this.correctionCourte = () => {
      const coefficient = this.coefficientBaisse()
      return `Une baisse de $${this.pourcentage}\\,\\%$ revient à multiplier par le coefficient multiplicateur $CM=1-\\dfrac{${this.pourcentage}}{100}=${texNombre(coefficient)}$.<br>
Le prix après la baisse est donc $${texNombre(this.prix)}\\times ${texNombre(coefficient)}=${miseEnEvidence(texNombre(this.prixApresBaisse()))}$ €.`
    }
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = ' €.'
  }
}
