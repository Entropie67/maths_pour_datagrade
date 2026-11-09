import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { premierAvec } from '../../lib/outils/primalite'
import { fraction } from '../../modules/fractions'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '081e2'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Déterminer par le calcul le coefficient directeur d'une droite"
export const dateDePublication = '29/06/2026'
export const dateDeModifImportante = '08/11/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Jean-Claude Lhote
 *
 */
export default class AutoQ8AGt2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    xA: number,
    yA: number,
    xB: number,
    yB: number,
    nomA: string,
    nomB: string,
  ): void {
    const coefficientDirecteur = (yB - yA) / (xB - xA)
    const coeffBis = (xB - xA) / (yB - yA)

    const sol = fraction(yB - yA, xB - xA).texFractionSimplifiee
    const dist1 = fraction(xB - xA, yB - yA).texFractionSimplifiee
    const dist2 = fraction(yB - xB, yA - xA).texFractionSimplifiee
    const dist3 = fraction(yA - xA, yB - xB).texFractionSimplifiee

    this.reponses = [sol, dist1, dist2, dist3].map((x) => `$${x}$`)
    this.enonce = `Dans un repère, on considère les points $${nomA}$ de coordonnées $(${xA}\\,;\\,${yA})$ et $${nomB}$ de coordonnées $(${xB}\\,;\\, ${yB})$.<br>
Le coefficient directeur de la droite $(${nomA}${nomB})$ est alors égal à :
    `

    this.correction = `Le coefficient directeur de la droite $(${nomA}${nomB})$ est donné par la formule :<br>
    $a=\\dfrac{y_${nomB}-y_${nomA}}{x_${nomB}-x_${nomA}}=\\dfrac{${yB}-${ecritureParentheseSiNegatif(yA)}}{${xB}-${ecritureParentheseSiNegatif(xA)}}=\\dfrac{${yB - yA}}{${xB - xA}}=${miseEnEvidence(sol)}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(20, 25, 5, 15, 'E', 'F')
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    const [A, B] = Array.from(creerNomDePolygone(2))
    let compteur = 0
    do {
      // Sans tirage valide à cette itération, le test ci-dessous ne doit pas juger les réponses d'un tirage précédent.
      this.reponses = []
      const a = choice([2, 3, 5, 7])
      const b = premierAvec(a)
      const facteur = choice([2, 3, 4, 5])
      const x0 = randint(-5, 5)
      const y0 = randint(-5, 5)
      const xA = x0 * facteur
      const xB = (x0 + a) * facteur
      const yA = y0 * facteur
      const yB = (y0 + b) * facteur
      if (new Set([xA, yA, xB, yB]).size < 4) {
        compteur++
        continue
      }
      this.appliquerLesValeurs(xA, yA, xB, yB, A, B)
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
        /Le coefficient directeur de la droite \$(.*?)\$ est alors égal à :\s*$/,
        (_, droite: string) =>
          this.interactif
            ? `Le coefficient directeur de la droite $${droite}$ est égal à `
            : `Calculer le coefficient directeur de la droite $${droite}$.`,
      )
    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
