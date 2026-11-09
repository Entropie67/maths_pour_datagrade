import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import { sp } from '../../lib/outils/outilString'

export const uuid = 'pt6q7'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer une probabilité en situation d’équiprobabilité'
export const dateDePublication = '04/07/2026'
export const dateDeModifImportante = '22/10/2026'

const listeEntiers = (debut: number, fin: number): string =>
  Array.from({ length: fin - debut + 1 }, (_, index) => debut + index).join(
    '\\,;\\,',
  )

/**
 * @author Stéphane Guyon
 */
export default class AutoQ7PolynesieTechno2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(faces: number, seuil: number): void {
    const correct = new FractionEtendue(seuil, faces).simplifie()
    const dist1 = new FractionEtendue(1, faces)
    const dist2 = new FractionEtendue(faces - seuil, faces).simplifie()
    const dist3 = new FractionEtendue(seuil + 1, faces).simplifie()

    this.enonce = `On lance un dé à $${faces}$ faces numérotées de $1$ à $${faces}$.<br>
    On admet que toutes les faces ont la même probabilité d'apparaître.<br>
    Quelle est la probabilité d'obtenir un numéro inférieur ou égal à $${seuil}$ ?`

    this.reponses = [
      `$${correct.texFractionSimplifiee}$`,
      `$${dist1.texFractionSimplifiee}$`,
      `$${dist2.texFractionSimplifiee}$`,
      `$${dist3.texFractionSimplifiee}$`,
    ]

    const issues = Array.from({ length: seuil }, (_, index) => index + 1).join(
      '\\,;\\,',
    )
    this.correction = `L'univers est $\\Omega=\\{${listeEntiers(1, faces)}\\}$.<br>
    L'événement «${sp()}obtenir un numéro inférieur ou égal à $${seuil}$${sp()}» est $E=\\{${issues}\\}$.<br>
    Comme l'expérience aléatoire est une situation d'équiprobabilité, $P(E)=\\dfrac{${seuil}}{${faces}}=${miseEnEvidence(correct.texFractionSimplifiee)}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(6, 2)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      const faces = choice([6, 8, 10, 12])
      const seuil = randint(2, faces - 2)
      this.appliquerLesValeurs(faces, seuil)
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
        /Quelle est la probabilité (.*) \?\s*$/,
        (_, evenement: string) =>
          this.interactif
            ? `La probabilité ${evenement} est `
            : `Calculer la probabilité ${evenement}.`,
      )
    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
