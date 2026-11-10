import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = 'f43d1'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Développer une identité remarquable'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ7FMns2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    xA: number,
    yA: number,
    xB: number,
    yB: number,
    repOrigine?: string,
    d1Origine?: string,
    d2Origine?: string,
    d3Origine?: string,
  ): void {
    const num = yB - yA
    const den = xB - xA

    // Création de la fraction de base avec la fonction recommandée
    const mFraction = new FractionEtendue(num, den)
    const mStr = mFraction.simplifie().texFractionSimplifiee

    this.enonce = `Une droite passe par les points $A(${xA}\\,;\\,${yA})$ et $B(${xB}\\,;\\,${yB})$. Son coefficient directeur est :`

    let correct = ''
    let d1 = ''
    let d2 = ''
    let d3 = ''

    if (repOrigine && d1Origine && d2Origine && d3Origine) {
      correct = repOrigine
      d1 = d1Origine
      d2 = d2Origine
      d3 = d3Origine
    } else {
      correct = `$${mStr}$`

      // Distracteurs générés proprement grâce aux méthodes de FractionEtendue

      // d1 : erreur de signe (on utilise f.oppose())
      d1 = `$${mFraction.oppose().simplifie().texFractionSimplifiee}$`

      // d2 : inversion de la formule (Δx / Δy)
      const mInverse = new FractionEtendue(den, num)
      d2 = `$${mInverse.simplifie().texFractionSimplifiee}$`

      // d3 : inversion + erreur de signe
      d3 = `$${mInverse.oppose().simplifie().texFractionSimplifiee}$`
    }

    this.reponses = [correct, d1, d2, d3]

    // Rédaction de la correction étape par étape
    this.correction = `Le coefficient directeur $m$ d'une droite passant par deux points $A(x_A\\,;\\,y_A)$ et $B(x_B\\,;\\,y_B)$ est donné par la formule :<br><br>`
    this.correction += `$\\begin{aligned}`
    this.correction += `m &= \\dfrac{y_B - y_A}{x_B - x_A} \\\\[0.5em]`
    this.correction += `m &= \\dfrac{${yB} - ${ecritureParentheseSiNegatif(yA)}}{${xB} - ${ecritureParentheseSiNegatif(xA)}} \\\\[0.5em]`

    // Affichage de la fraction brute avant simplification
    this.correction += `m &= ${mFraction.texFraction}`

    // On affiche l'étape de simplification uniquement si la fraction brute est différente de sa version simplifiée
    if (
      mFraction.texFraction !== mStr &&
      `\\dfrac{${mFraction.texFraction}}` !== mStr
    ) {
      this.correction += `\\\\[0.5em] m &= ${mStr}`
    }

    this.correction += `\\end{aligned}$<br><br>`
    this.correction += `Le coefficient directeur de la droite est donc $${miseEnEvidence(mStr)}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(-1, 2, -3, 4, '$-1$', '$-2$', '$1$', '$2$')
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      const xA = randint(-5, 5)
      const yA = randint(-5, 5)

      // On s'assure de ne pas avoir de droite verticale (xB != xA)
      const xB = randint(-5, 5, [xA])

      // On s'assure de ne pas avoir de droite horizontale (yB != yA, donc pente != 0)
      const yB = randint(-5, 5, [yA])

      this.appliquerLesValeurs(xA, yA, xB, yB)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(
        saisie,
        reponse,
        reponse.includes('frac')
          ? { fractionEgale: true, nombreDecimalSeulement: true }
          : { nombreDecimalSeulement: true },
      )
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /^Une droite passe par les points (.*)\. Son coefficient directeur est :\s*$/,
        (_, points: string) =>
          this.interactif
            ? `Une droite passe par les points ${points}. Son coefficient directeur est `
            : `Une droite passe par les points ${points}.<br>Calculer son coefficient directeur.`,
      )
    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
