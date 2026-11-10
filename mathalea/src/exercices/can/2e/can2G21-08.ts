import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Déterminer le déterminant de deux vecteurs'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '04/03:2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Stéphane Guyon

 */
export const dateDeModifImportante = '31/10/2026'
export const uuid = '84eaa'

export const refs = {
  'fr-fr': ['can2G21-08', '2G27-flash3'],
  'fr-ch': ['3G93-4'],
}
export default class DeterminantVecteur extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    const vx = this.quotaRandint('vx', -5, 5)
    const vy = this.quotaRandint('vy', -5, 5)
    const ux = this.quotaRandint('ux', -5, 5, [0])
    const uy = this.quotaRandint('uy', -5, 5)
    const det = ux * vy - uy * vx

    this.question = `Dans un repère orthonormé, on donne les vecteurs $\\vec{u}\\begin{pmatrix}${ux}${sp(1)} \\\\ ${sp(1)}${uy}\\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}${vx}${sp(1)} \\\\ ${sp(1)}${vy}\\end{pmatrix}$.<br>
      Calculer le déterminant des vecteurs $\\vec{u}$ et $\\vec{v}$.<br><br>`
    this.optionsChampTexte = {
      texteAvant: '$\\det\\left(\\vec{u}\\,;\\,\\vec{v}\\right)=$',
    }
    this.correction = `On sait d'après le cours que si $\\vec{u}\\begin{pmatrix}x \\\\ y\\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}x' \\\\ y'\\end{pmatrix}$, alors :<br><br>
      $\\det\\left(\\vec{u}\\,;\\,\\vec{v}\\right)=\\begin{vmatrix}x&x'\\\\y&y'\\end{vmatrix}=xy'-x'y$.<br><br>
      En appliquant à l'énoncé :<br><br>
      $\\det\\left(\\vec{u}\\,;\\,\\vec{v}\\right)=\\begin{vmatrix}${ux}&${vx}\\\\${uy}&${vy}\\end{vmatrix}=${ux}\\times ${ecritureParentheseSiNegatif(vy)}-${ecritureParentheseSiNegatif(vx)}\\times${ecritureParentheseSiNegatif(uy)}=${miseEnEvidence(`${ux * vy - vx * uy}`)}$.<br>`
    this.reponse = `${det}`
  }
}
