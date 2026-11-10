import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '816ad'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Reconnaître l'expression d'une opération sur un nombre"
export const dateDePublication = '06/06/2026'

type Cible = 'double' | 'carre' | 'somme' | 'moitie'

/**
 * DNB Antilles juin 2026 - Question 5
 * @author Rémi Angot
 */
export default class AutoQ5Antillesbrevet2026 extends ExerciceQcmA {
  private appliquerLesValeurs(cible: Cible): void {
    const expressions: Record<Cible, string> = {
      double: '2n',
      carre: 'n^2',
      somme: 'n+2',
      moitie: '\\dfrac{n}{2}',
    }
    const enonces: Record<Cible, string> = {
      double: 'le double de $n$',
      carre: 'le carré de $n$',
      somme: 'la somme de $n$ et de $2$',
      moitie: 'la moitié de $n$',
    }
    const ordre: Cible[] = ['double', 'carre', 'somme', 'moitie']

    this.enonce = `On note $n$ un nombre entier.<br>
Parmi les propositions suivantes, quelle expression donne ${enonces[cible]} ?`

    const bonneReponse = `$${expressions[cible]}$`
    const autres = ordre
      .filter((c) => c !== cible)
      .map((c) => `$${expressions[c]}$`)
    this.reponses = [bonneReponse, ...autres]

    this.correction = `$${expressions.double}$ est le double de $n$, $${expressions.carre}$ est son carré, $${expressions.somme}$ est la somme de $n$ et de $2$, et $${expressions.moitie}$ est la moitié de $n$.<br>
La réponse cherchée est donc $${miseEnEvidence(expressions[cible])}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs('moitie')
  }

  versionAleatoire = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    this.appliquerLesValeurs(
      choice(['double', 'carre', 'somme', 'moitie'] as Cible[]),
    )
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.options = { vertical: true, radio: true }
  }
}
