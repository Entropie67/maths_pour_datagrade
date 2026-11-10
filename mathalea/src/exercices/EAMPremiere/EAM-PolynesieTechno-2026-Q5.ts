import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = 'pt6q5'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Effectuer un calcul avec des fractions'
export const dateDePublication = '04/07/2026'
export const dateDeModifImportante = '22/10/2026'

/**
 * @author Stéphane Guyon
 */
export default class AutoQ5PolynesieTechno2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(denominateur: number): void {
    const fractionAjoutee = new FractionEtendue(1, denominateur)
    const facteur = new FractionEtendue(denominateur, denominateur + 1)
    const somme = new FractionEtendue(denominateur + 1, denominateur)
    const distracteurs = [2, denominateur, denominateur + 1, 3, 4].filter(
      (valeur) => valeur !== 1,
    )
    const reponses = [1]
    for (const distracteur of distracteurs) {
      if (!reponses.includes(distracteur)) reponses.push(distracteur)
      if (reponses.length === 4) break
    }

    this.enonce = `Le nombre $\\left(1+${fractionAjoutee.texFractionSimplifiee}\\right)\\times ${facteur.texFractionSimplifiee}$ est égal à :`

    this.reponses = reponses.map((reponse) => `$${reponse}$`)

    this.correction = `$\\left(1+${fractionAjoutee.texFractionSimplifiee}\\right)\\times ${facteur.texFractionSimplifiee}=\\left(\\dfrac{${denominateur}}{${denominateur}}+${fractionAjoutee.texFractionSimplifiee}\\right)\\times ${facteur.texFractionSimplifiee}=${somme.texFractionSimplifiee}\\times ${facteur.texFractionSimplifiee}=${miseEnEvidence('1')}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(2)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      this.appliquerLesValeurs(choice([2, 3, 4, 5, 6, 7, 8, 9, 10]))
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
        /^Le nombre \$(.*)\$ est égal à :\s*$/,
        (_, expression: string) =>
          this.interactif ? `$${expression}=$` : `Calculer $${expression}$.`,
      )
    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
    this.champReponseCourteEnLigne = true
  }
}
