import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  reduirePolynomeDegre3,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Résoudre une équation $ax^2+bx+c=c$'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '19/06/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 *
 * @author Gilles Mora

 */
export const uuid = '6adb0'

export const refs = {
  'fr-fr': ['can1SD21-07'],
  'fr-ch': ['NR'],
}
export default class EquationSecondDegreParticuliere extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierEnsemble
    this.versionQcmDisponible = true
    this.optionsDeComparaison = { ensembleDeNombres: true }
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', -10, 10, [0])
    const b = randint(-10, 10, [0, a, -a])
    const c = this.quotaRandint('c', -10, 10, [0])
    const f = new FractionEtendue(-b, a)
    const equation = `$${reduirePolynomeDegre3(0, a, b, c)}=${c}$`
    // En interactif, S= à la ligne devant le champ ; sur papier (PDF), consigne classique
    this.question = this.versionQcm
      ? `L'équation ${equation} a pour ensemble de solutions :`
      : this.interactif
        ? `L'équation ${equation} a pour ensemble de solutions :<br>$S=$`
        : `Résoudre, dans $\\mathbb{R}$, l'équation ${equation}.`
    if (-b * a < 0) {
      this.reponse = this.versionQcm
        ? `$\\left\\{${f.texFractionSimplifiee}\\,;\\,0\\right\\}$`
        : `\\{0;${f.texFSD}\\}`
      this.distracteurs = [
        `$\\left\\{${f.texFractionSimplifiee}\\right\\}$`,
        `$\\left\\{0\\,;\\,${f.oppose().texFractionSimplifiee}\\right\\}$`,
        `$\\left\\{${f.inverse().texFractionSimplifiee}\\,;\\,0\\right\\}$`,
      ]
    } else {
      this.reponse = this.versionQcm
        ? `$\\left\\{0\\,;\\,${f.texFractionSimplifiee}\\right\\}$`
        : `\\{0;${f.texFSD}\\}`
      this.distracteurs = [
        `$\\left\\{${f.texFractionSimplifiee}\\right\\}$`,
        `$\\left\\{${f.oppose().texFractionSimplifiee}\\,;\\,0\\right\\}$`,
        `$\\left\\{0\\,;\\,${f.inverse().texFractionSimplifiee}\\right\\}$`,
      ]
    }

    this.correction = `L'équation $${reduirePolynomeDegre3(0, a, b, c)}=${c}$ s'écrit $${reduirePolynomeDegre3(0, a, b, 0)}=0$.<br>
          En factorisant le premier membre (facteur commun $x$), on obtient $x(${rienSi1(a)}x${ecritureAlgebrique(b)})=0$.<br>
          On reconnaît une équation produit nul dont les solutions sont : $0$ et $\\dfrac{${-b}}{${a}}${f.texSimplificationAvecEtapes()}$.<br>
          $S=${miseEnEvidence(`\\left\\{0\\,;\\,${new FractionEtendue(-b, a).texFractionSimplifiee}\\right\\}`)}$`
  }
}
