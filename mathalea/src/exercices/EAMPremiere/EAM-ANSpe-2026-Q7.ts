import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { ecritureAlgebrique, reduireAxPlusB } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = '63f83'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer avec des expressions littérales'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ7ANs2026 extends ExerciceQcmACourt {
  appliquerLesValeurs = (b: number, d: number) => {
    // Création des expressions sous forme de chaînes de caractères
    const expr1 = `(x${ecritureAlgebrique(b)})^2`
    const expr2 = `(${d}-x)^2`

    this.enonce = `La forme développée et réduite de l'expression $${expr1} - ${expr2}$ vaut :`

    // Calcul des coefficients pour le résultat juste : (2b + 2d)x + (b^2 - d^2)
    const coeffX_bon = 2 * b + 2 * d
    const constante_bon = b * b - d * d

    // Bonne réponse (pour l'image : 6x + 3)
    const polyBon = reduireAxPlusB(coeffX_bon, constante_bon)

    // Distracteur 1 : Erreur de signe (pour l'image : 2x + 5)
    const polyFaux1 = reduireAxPlusB(2 * b - 2 * d, b * b + d * d)

    // Distracteur 2 : Oubli des doubles produits et addition des carrés (pour l'image : 2x^2 + 3)
    const polyFaux2 = new Polynome({
      rand: false,
      coeffs: [constante_bon, 0, 2],
    }).toLatex()

    // Distracteur 3 : Addition des carrés et erreur de signe (pour l'image : 2x^2 + 2x + 3)
    const polyFaux3 = new Polynome({
      rand: false,
      coeffs: [constante_bon, 2 * b - 2 * d, 2],
    }).toLatex()

    // Génération du LaTeX pour la correction détaillée
    const poly1Latex = new Polynome({
      rand: false,
      coeffs: [b * b, 2 * b, 1],
    }).toLatex()
    const poly2Latex = new Polynome({
      rand: false,
      coeffs: [d * d, -2 * d, 1],
    }).toLatex()
    const poly2OppLatex = new Polynome({
      rand: false,
      coeffs: [-d * d, 2 * d, -1],
    }).toLatex()

    this.correction = `On développe chacune des parenthèses en utilisant les identités remarquables :<br>
    $\\begin{aligned}
    ${expr1} - ${expr2} &= \\left(${poly1Latex}\\right) - \\left(${poly2Latex}\\right)\\\\
    &= ${poly1Latex} ${poly2OppLatex}\\\\
    &= ${miseEnEvidence(polyBon)}
    \\end{aligned}$`

    // Le premier élément est la bonne réponse, l'aléatoire mélangera l'ordre à l'affichage
    this.reponses = [
      `$${polyBon}$`,
      `$${polyFaux2}$`,
      `$${polyFaux1}$`,
      `$${polyFaux3}$`,
    ]
  }

  versionOriginale: () => void = () => {
    // Cas de l'image de référence : (x+2)^2 - (1-x)^2
    this.appliquerLesValeurs(2, 1)
  }

  versionAleatoire = () => {
    // L'appel de la version originale était manquant ici !
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      const b = randint(-6, 6, [0])
      const d = randint(1, 6, [0, b, -b])

      this.appliquerLesValeurs(b, d)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /^La forme développée et réduite de l'expression \$(.*)\$ vaut :\s*$/,
        (_, expression: string) => `Développer et réduire $${expression}$.`,
      )
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, {
        expressionsForcementReduites: true,
      })
    this.clavierReponseCourte = KeyboardType.lyceeClassique
  }
}
