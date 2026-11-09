import Decimal from 'decimal.js'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '8d25a'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Calculer $25\\,\\%$ d'un nombre"
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ3CEs2026 extends ExerciceQcmACourt {
  // 25 % de n
  private appliquerLesValeurs(n: number): void {
    const valeur = new Decimal(n)
    const resultat = valeur.times(25).div(100) // 25 % de n = n/4

    // Distracteurs (chacun cible une erreur précise)
    const moitie = valeur.div(2) // n/2 : confond 25 % avec la moitié (50 %)
    const cinquieme = valeur.div(5) // n/5 : confond 25 % avec un cinquième (20 %)
    const moins25 = valeur.minus(25) // n - 25 : soustrait le nombre 25

    this.enonce = `$25\\,\\%$ de $${texNombre(valeur)}$ est égal à :`

    this.correction = `Prendre $25\\,\\%$ d'un nombre revient à le diviser par $4$, c'est-à-dire à le diviser par $2$, puis encore par $2$ (car $25\\,\\%=\\dfrac14$).<br>
$\\begin{aligned}
25\\,\\%\\text{ de }${texNombre(valeur)}&=(${texNombre(valeur)}\\div 2)\\div 2\\\\
&=${texNombre(moitie)}\\div 2\\\\
&=${miseEnEvidence(texNombre(resultat))}
\\end{aligned}$`

    this.reponses = [
      `$${texNombre(resultat)}$`,
      `$${texNombre(moitie)}$`,
      `$${texNombre(cinquieme)}$`,
      `$${texNombre(moins25)}$`,
    ]
  }

  versionOriginale: () => void = () => {
    // 25 % de 250
    this.appliquerLesValeurs(250)
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
      let n: number
      if (choice([true, false])) {
        // Cas décimal : multiple de 10 « impair » (n ≡ 2 [4]) → résultat en ,5 (150 à 490)
        n = 10 * (2 * randint(7, 24) + 1)
      } else {
        // Cas entier : multiple de 4 → résultat entier assez grand (160 à 600)
        n = 4 * randint(41, 59, 50)
      }
      this.appliquerLesValeurs(n)
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
      this.enonce.replace(/^(.*) est égal à :\s*$/, (_, groupe: string) =>
        this.interactif ? `${groupe} est égal à ` : `Calculer ${groupe}.`,
      )
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
