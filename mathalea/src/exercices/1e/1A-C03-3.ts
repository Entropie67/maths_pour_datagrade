import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '10/08/2025'
export const uuid = '65cdf'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': ['1A-C03-3', '2A-N3-3'],
  'fr-ch': ['10LCNO4B-2', '10LSNO4B-2', '11LCNO3B-2', '11LSNO3B-2'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Appliquer la propriété des puissances de puissances'
export default class Auto1AC3c extends ExerciceQcmA {
  private appliquerLesValeurs(a: number, k: number): void {
    this.enonce = `Soit $n$ un entier${a === 3 && k === 2 ? ' non nul' : ''}. <br>À quelle expression est égale $\\left(${a}^n\\right)^{${k}}$ ?`

    this.correction = `On applique la propriété des puissances de puissances d'un réel.<br>
    Soit $n\\in \\mathbb{N}$, et $p \\in \\mathbb{N}$, on a : 
     $\\left(a^{n}\\right)^{p}=a^{np}$<br>
    $\\begin{aligned}\\left(${a}^{n}\\right)^{${k}}&=${a}^{${k}n}\\\\
    &=\\left(${a}^{${k}}\\right)^{n}\\\\
    &=${miseEnEvidence(`${a ** k}^{n}`)}
    \\end{aligned}$`

    this.reponses = [
      `$${a ** k}^{n}$`,
      `$${a}^{n^{${k}}}$`,
      k === 2 ? 'Aucune de ces propositions' : `$${a}^{${k}+n}$`,
      k === 2 ? `$${a * k}^{n}$` : `$${a * k}^{n}$`,
    ]
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(3, 2)
  }

  versionAleatoire = () => {
    let compteur = 0
    do {
      const k = randint(2, 3)
      const a = randint(2, 4)
      this.appliquerLesValeurs(a, k)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut reconnaître une puissance de puissance.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Repérer la base (le nombre élevé à une puissance), l'exposant à l'intérieur des parenthèses et l'exposant placé à l'extérieur.</li>
    <li>Se demander ce que signifie répéter plusieurs fois la même puissance.</li>
    <li>Utiliser la propriété des puissances de puissances.</li>
  </ul>
`
    this.optionsDeComparaison = { texteSansCasse: true } // Pour le test qcm_exercice, sinon, il va croire que c'est des fractions ou unite...
    this.versionAleatoire()
  }
}
