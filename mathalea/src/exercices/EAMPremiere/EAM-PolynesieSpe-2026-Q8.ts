import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = 'ps268'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Factoriser une différence de deux carrés'
export const dateDePublication = '01/07/2026'
export const dateDeModifImportante = '22/10/2026'

/**
 * @author Stéphane Guyon
 */
export default class AutoQ8PolynesieSpe2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(a: number, b: number): void {
    const carre = a * a
    const parenthese = b === 1 ? 'x+1' : `x+${b}`
    const facteur = (coefficient: number, constante: number) =>
      `(${rienSi1(coefficient)}x${ecritureAlgebrique(constante)})`
    const facteur1 = facteur(a - 1, -b)
    const facteur2 = facteur(a + 1, b)
    const correct = `${facteur1}${facteur2}`

    this.enonce = `Quelle est la forme factorisée de l'expression $${carre}x^2-(${parenthese})^2$ ?`

    this.reponses = [
      `$${correct}$`,
      `$${facteur1}^2$`,
      `$${facteur(carre - 1, -b)}^2$`,
      `$${facteur(carre - 1, -b)}${facteur(carre + 1, b)}$`,
    ]

    this.correction = `$${carre}x^2=(${a}x)^2$, donc l'expression est une différence de deux carrés.<br>
    On sait que pour tous réels $a$ et $b$, $a^2-b^2=(a-b)(a+b)$.<br>
    $\\begin{aligned}
    ${carre}x^2-(${parenthese})^2
    &=(${a}x)^2-(${parenthese})^2\\\\
    &=(${a}x-(${parenthese}))(${a}x+(${parenthese}))\\\\
    &=${facteur1}${facteur2}\\\\
    &=${miseEnEvidence(correct)}
    \\end{aligned}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(4, 1)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      this.appliquerLesValeurs(choice([2, 3, 4, 5, 6]), choice([1, 2, 3, 4]))
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /^Quelle est la forme factorisée de l'expression \$(.*)\$ \?\s*$/,
        (_, expression: string) => `Factoriser $${expression}$.`,
      )
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { factorisation: true })
    this.clavierReponseCourte = KeyboardType.lyceeClassique
  }
}
