import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = 'd7f6c'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Calculer la valeur d'une expression du second degré"
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ6CEns2026 extends ExerciceQcmACourt {
  // Valeur de a x² + b x + c pour x = x0 (x0 < 0)
  private appliquerLesValeurs(
    a: number,
    b: number,
    c: number,
    x0: number,
  ): void {
    const sq = x0 * x0 // (x0)²
    const bx0 = b * x0 // b × x0

    const correct = a * sq + b * x0 + c
    const distCarre = a * -sq + b * x0 + c // (x0)² pris comme -(x0)²
    const distLineaire = a * sq + b * -x0 + c // b × x0 pris comme b × |x0|
    const distDouble = a * -sq + b * -x0 + c // les deux erreurs de signe

    // Affichage de l'expression avec la classe Polynome (coeffs par degré croissant)
    const P = new Polynome({ rand: false, coeffs: [c, b, a] })

    this.enonce = `La valeur de l'expression $${P.toLatex()}$ pour $x = ${x0}$ est :`

    this.correction = `On remplace $x$ par $${x0}$ en plaçant ce nombre négatif entre parenthèses :<br>
$\\begin{aligned}
${a}\\times(${x0})^2${ecritureAlgebrique(b)}\\times(${x0})${ecritureAlgebrique(c)}
&=${a}\\times ${sq}${ecritureAlgebrique(bx0)}${ecritureAlgebrique(c)}\\\\
&=${a * sq}${ecritureAlgebrique(bx0)}${ecritureAlgebrique(c)}\\\\
&=${miseEnEvidence(`${correct}`)}
\\end{aligned}$`

    this.reponses = [
      `$${correct}$`,
      `$${distCarre}$`,
      `$${distLineaire}$`,
      `$${distDouble}$`,
    ]
  }

  versionOriginale: () => void = () => {
    // 2x² - 3x - 4 pour x = -1
    this.appliquerLesValeurs(2, -3, -4, -1)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    let compteur = 0
    do {
      const a = 2
      const b = randint(-4, 4, [0]) // coefficient de x non nul
      const c = randint(-6, 6, [0]) // constante non nulle
      const x0 = choice([-1, -2]) // valeur négative (les erreurs de signe ont du sens)
      this.appliquerLesValeurs(a, b, c, x0)
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
        /^La valeur de (l'expression \$[^$]*\$ pour \$x = [^$]*\$) est :\s*$/,
        (_, groupe: string) =>
          this.interactif
            ? `La valeur de ${groupe} est `
            : `Calculer la valeur de ${groupe}.`,
      )
    this.clavierReponseCourte = KeyboardType.clavierDeBase
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
