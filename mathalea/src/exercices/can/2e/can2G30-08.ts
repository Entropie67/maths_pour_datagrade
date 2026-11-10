import { distracteursDistincts } from '../../../lib/interactif/qcmDistractors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  reduireAxPlusB,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Calculer les coordonnées du point d’intersection entre l’axe des abscisses et une droite'
export const interactifReady = true

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication
*/
export const dateDeModifImportante = '30/10/2026'
export const uuid = '05ba1'

export const refs = {
  'fr-fr': ['can2G30-08', '2G31-flash5'],
  'fr-ch': ['NR'],
}
export default class CoordonneesPointIntersectionAxeAbscissesDroite extends ExerciceSimple {
  constructor() {
    super()
    this.versionQcmDisponible = true
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte =
      KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets
    this.optionsDeComparaison = { texteSansCasse: true }
  }

  nouvelleVersion() {
    switch (this.quotaRandint('cas', 1, 2)) {
      case 1:
        {
          const a = randint(-10, 10, 0)
          const n = randint(-5, 5, 0)
          const b = n * a

          this.reponse = this.versionQcm
            ? `$(${-b / a}\\,;\\,0)$`
            : `${-b / a};0`
          this.question = this.versionQcm
            ? ` Les coordonnées du point d'intersection
    entre la droite d'équation $y=${reduireAxPlusB(a, b)}$ et l'axe des abscisses sont : `
            : ` Déterminer les coordonnées du point d'intersection ${context.isDiaporama ? '<br>' : ''}
    entre la droite d'équation $y=${reduireAxPlusB(a, b)}$ et ${context.isDiaporama ? '<br>' : ''} l'axe des abscisses. `
          if (this.interactif) {
            this.optionsChampTexte = {
              texteAvant: '<br>$($',
              texteApres: '$)$',
            }
          }

          this.correction = `L'ordonnée de ce point est $0$ puisque le point d'intersection se situe sur l'axe des abscisses.<br>
      Son abscisse est donc donnée par la solution de l'équation $${reduireAxPlusB(a, b)}=0$, c'est-à-dire $x=${new FractionEtendue(-b, a).texFractionSimplifiee}$.<br>
      Les coordonnées de ce point sont donc : `
          this.correction += this.versionQcm
            ? `$${miseEnEvidence(`(${new FractionEtendue(-b, a).texFractionSimplifiee}\\,;\\,0)`)}$.`
            : `$(${miseEnEvidence(new FractionEtendue(-b, a).texFractionSimplifiee)}\\,;\\,${miseEnEvidence(0)})$.`
          this.distracteurs = [
            `$(0\\,;\\,${texNombre(-b / a, 1)})$`,
            `$(${b}\\,;\\,0)$`,
            `$(${texNombre(b / a, 1)}\\,;\\,0)$`,
            `$(${a}\\,;\\,0)$`,
          ]
        }
        break

      case 2:
      default:
        {
          const a = randint(2, 10, 0)

          const b = randint(-10, 10, 0)

          this.reponse = this.versionQcm
            ? `$(${-b * a}\\,;\\,0)$`
            : `${-b * a};0`
          this.question = this.versionQcm
            ? ` Les coordonnées du point d'intersection
    entre la droite d'équation $y=\\dfrac{x}{${a}}${ecritureAlgebrique(b)}$ et l'axe des abscisses sont : `
            : ` Déterminer les coordonnées du point d'intersection
   ${context.isDiaporama ? '<br>' : ''} entre la droite d'équation $y=\\dfrac{x}{${a}}${ecritureAlgebrique(b)}$ et ${context.isDiaporama ? '<br>' : ''} l'axe des abscisses. 
       `
          if (this.interactif) {
            this.optionsChampTexte = {
              texteAvant: '<br>$($',
              texteApres: '$)$',
            }
          }

          this.correction = `L'ordonnée de ce point est $0$ puisque le point d'intersection se situe sur l'axe des abscisses.<br>
      Son abscisse est donc donnée par la solution de l'équation $\\dfrac{x}{${a}}${ecritureAlgebrique(b)}=0$, c'est-à-dire $x=${-b * a}$.<br>
      Les coordonnées de ce point sont donc : `
          this.correction += this.versionQcm
            ? `$${miseEnEvidence(`(${-b * a}\\,;\\,0)`)}$.`
            : `$(${miseEnEvidence(-b * a)}\\,;\\,${miseEnEvidence(0)})$.`
          this.distracteurs = [
            `$(0\\,;\\,${texNombre(-b * a, 1)})$`,
            `$(${b}\\,;\\,0)$`,
            `$(${texNombre(b * a, 1)}\\,;\\,0)$`,
            `$(${a}\\,;\\,0)$`,
          ]
        }
        break
    }
    if (this.versionQcm) {
      // Secours : Confondre les axes ou choisir l’origine et les points unités.
      this.distracteurs = distracteursDistincts(
        String(this.reponse),
        this.distracteurs,
        [
          '$(0\\,;\\,0)$',
          '$(1\\,;\\,0)$',
          '$(-1\\,;\\,0)$',
          '$(0\\,;\\,1)$',
          '$(0\\,;\\,-1)$',
        ],
        Math.max(3, this.distracteurs.length),
      )
    }
  }
}
