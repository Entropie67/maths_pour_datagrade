import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '66824'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Effectuer un calcul avec des fractions'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ1ANt2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    n: number,
    num: number,
    den: number,
    d1?: string,
    d2?: string,
    d3?: string,
  ): void {
    const frac = new FractionEtendue(num, den)
    const correct = new FractionEtendue(n * den - num, den)

    this.enonce = `$${n} - ${frac.texFraction}$ est égal à :`

    this.correction = `On écrit l'entier sous la forme d'une fraction de dénominateur $${den}$ :<br>`
    this.correction += `$\\begin{aligned}`
    this.correction += `${n} - ${frac.texFraction} &= \\dfrac{${n * den}}{${den}} - ${frac.texFraction}\\\\[0.5em]`
    this.correction += `&= \\dfrac{${n * den} - ${num}}{${den}}\\\\[0.5em]`
    this.correction += `&= ${miseEnEvidence(correct.texFractionSimplifiee)}`
    this.correction += `\\end{aligned}$`

    // Si on est dans la version originale, on utilise les distracteurs fournis
    if (d1 !== undefined && d2 !== undefined && d3 !== undefined) {
      this.reponses = [
        `$${correct.texFractionSimplifiee}$`,
        `$${d1}$`,
        `$${d2}$`,
        `$${d3}$`,
      ]
    } else {
      // Sinon, on génère des distracteurs basés sur des erreurs classiques
      // Erreur 1 : on soustrait les numérateurs en gardant le dénominateur -> (n - num)/den
      const dist1 = new FractionEtendue(n - num, den)

      // Erreur 2 : on additionne au lieu de soustraire -> (n + num)/den
      const dist2 = new FractionEtendue(n + num, den)

      // Erreur 3 : on inverse le sens de la soustraction -> (num - n * den)/den
      const dist3 = new FractionEtendue(num - n * den, den)

      this.reponses = [
        `$${correct.texFractionSimplifiee}$`,
        `$${dist1.texFractionSimplifiee}$`,
        `$${dist2.texFractionSimplifiee}$`,
        `$${dist3.texFractionSimplifiee}$`,
      ]
    }
  }

  versionOriginale: () => void = () => {
    // Valeurs du sujet officiel : 5 - 3/2
    // Distracteurs stricts de l'image : 1, 4 et -5/2
    this.appliquerLesValeurs(5, 3, 2, '1', '4', '-\\dfrac{5}{2}')
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      const n = randint(3, 5)
      const den = randint(2, 8)
      let num = randint(1, 7)

      // On s'assure que la fraction est bien irréductible et n'est pas un nombre entier
      while (pgcd(num, den) !== 1 || num % den === 0) {
        num = randint(1, 7)
      }

      this.appliquerLesValeurs(n, num, den)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, {
        fractionEgale: true,
        nombreDecimalSeulement: true,
      })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /^\$(.+)\$ est égal à :\s*$/,
        (_, expression: string) =>
          this.interactif ? `$${expression}=$` : `Calculer $${expression}$.`,
      )
    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
    this.champReponseCourteEnLigne = true
  }
}
