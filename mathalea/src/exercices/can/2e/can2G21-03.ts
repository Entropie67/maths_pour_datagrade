import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Déterminer les coordonnées d’un vecteur'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '30/10/2021' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 */
export const uuid = '651a5'

export const refs = {
  'fr-fr': ['can2G21-03', '2G25-flash1'],
  'fr-ch': ['3G92-2'],
}
export default class CoordonneesVecteur1 extends ExerciceSimple {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const xA = this.quotaRandint('xA', -5, 5)
    const yA = this.quotaRandint('yA', -5, 5)
    const ux = this.quotaRandint('ux', -5, 5, [0])
    const uy = this.quotaRandint('uy', -5, 5)
    const xB = xA + ux

    const yB = yA + uy

    this.question = `Dans un repère orthonormé, on donne les points suivants :
    $A\\left(${xA}${sp(1)} ; ${sp(1)}${yA}\\right)$ et $B\\left(${xB}${sp(1)} ; ${sp(1)}${yB}\\right)$.<br>
    Déterminer les coordonnées du vecteur $\\overrightarrow{AB}$.<br><br>`
    this.optionsChampTexte = {
      texteAvant: '$\\overrightarrow{AB}$ a pour coordonnées :',
    }
    this.correction = `On sait d'après le cours, que si $A(x_A${sp(1)} ; ${sp(1)}y_A)$ et $B(x_B${sp(1)} ; ${sp(1)} y_B)$ sont deux points dans un repère, alors on a : $\\overrightarrow{AB}\\begin{pmatrix}x_B-x_A \\\\ y_B-y_A\\end{pmatrix}$.<br>
    En appliquant aux données de l'énoncé, on obtient  : $\\overrightarrow{AB}\\begin{pmatrix}${xB}-${ecritureParentheseSiNegatif(xA)} \\\\ ${yB}-${ecritureParentheseSiNegatif(yA)}\\end{pmatrix}$.<br>
    Les coordonnées du vecteur $\\overrightarrow{AB}$ sont donc $\\overrightarrow{AB}\\begin{pmatrix}${miseEnEvidence(`${xB - xA}`)} \\\\ ${miseEnEvidence(`${yB - yA}`)}\\end{pmatrix}$.`
    this.reponse = `(${xB - xA};${yB - yA})`
  }
}
