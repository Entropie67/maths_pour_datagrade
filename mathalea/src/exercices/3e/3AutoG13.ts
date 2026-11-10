import { miseEnEvidence } from '../../lib/outils/embellissements'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { choice } from '../../lib/outils/arrayOutils'
import { mathalea2d } from '../../modules/mathalea2d'
import ExerciceSimple from '../ExerciceSimple'

export const titre =
  'Connaître la formule du cosinus dans le triangle rectangle'

export const interactifReady = true

export const dateDePublication = '06/12/2025'
export const dateDeModifImportante = '19/01/2026'

export const uuid = '6ab87'

export const refs = {
  'fr-fr': ['3AutoG13'],
  'fr-ch': [],
}
/**
 * @author Jean-claude Lhote
 */
export default class FormuleCosinus extends ExerciceSimple {
  constructor() {
    super()
    /* this.besoinFormulaireCaseACocher = [
      'Sujet original (2e paramètre inutile si coché)',
      false,
    ]
    this.besoinFormulaire2CaseACocher = ['Autres formules', false]
    */
    this.sup = false
    this.sup2 = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.alphanumeric
  }

  nouvelleVersion() {
    const fonctionTrigo = !this.sup2
      ? 'cosinus'
      : choice(['cosinus', 'sinus', 'tangente'])
    const positionAngleDroit = this.sup
      ? 'gauche'
      : choice(['gauche', 'droite'])
    const nomTriangle = this.sup ? 'BAC' : choisitLettresDifferentes(3).join('')
    const nomAngle = `\\widehat{${nomTriangle[1]}${nomTriangle[0]}${nomTriangle[2]}}`

    const B =
      positionAngleDroit === 'gauche'
        ? pointAbstrait(0, 0, nomTriangle[1], 'below left')
        : pointAbstrait(6, 0, nomTriangle[1], 'below right')
    const A =
      positionAngleDroit === 'gauche'
        ? pointAbstrait(6, 0, nomTriangle[0], 'below right')
        : pointAbstrait(0, 0, nomTriangle[0], 'below left')
    const C =
      positionAngleDroit === 'gauche'
        ? pointAbstrait(0, 3, nomTriangle[2], 'above left')
        : pointAbstrait(6, 3, nomTriangle[2], 'above right')

    const coteAB = segment(A, B)
    const coteBC = segment(B, C)
    const coteCA = segment(C, A)
    const labels = labelPoint(A, B, C)
    const angleDroit = codageAngleDroit(A, B, C)

    const objets = [coteAB, coteBC, coteCA, labels, angleDroit]
    const figure = mathalea2d(
      Object.assign({ pixelsParCm: 30 }, fixeBordures(objets)),
      objets,
    )

    this.reponse =
      fonctionTrigo === 'cosinus'
        ? [
            `\\dfrac{${nomTriangle[0]}${nomTriangle[1]}}{${nomTriangle[0]}${nomTriangle[2]}}`,
            `\\dfrac{${nomTriangle[1]}${nomTriangle[0]}}{${nomTriangle[0]}${nomTriangle[2]}}`,
            `\\dfrac{${nomTriangle[0]}${nomTriangle[1]}}{${nomTriangle[2]}${nomTriangle[0]}}`,
            `\\dfrac{${nomTriangle[1]}${nomTriangle[0]}}{${nomTriangle[2]}${nomTriangle[0]}}`,
          ]
        : fonctionTrigo === 'sinus'
          ? [
              `\\dfrac{${nomTriangle[1]}${nomTriangle[2]}}{${nomTriangle[0]}${nomTriangle[2]}}`,
              `\\dfrac{${nomTriangle[2]}${nomTriangle[1]}}{${nomTriangle[0]}${nomTriangle[2]}}`,
              `\\dfrac{${nomTriangle[1]}${nomTriangle[2]}}{${nomTriangle[2]}${nomTriangle[0]}}`,
              `\\dfrac{${nomTriangle[2]}${nomTriangle[1]}}{${nomTriangle[2]}${nomTriangle[0]}}`,
            ]
          : [
              `\\dfrac{${nomTriangle[1]}${nomTriangle[2]}}{${nomTriangle[0]}${nomTriangle[1]}}`,
              `\\dfrac{${nomTriangle[2]}${nomTriangle[1]}}{${nomTriangle[0]}${nomTriangle[1]}}`,
              `\\dfrac{${nomTriangle[1]}${nomTriangle[2]}}{${nomTriangle[1]}${nomTriangle[0]}}`,
              `\\dfrac{${nomTriangle[2]}${nomTriangle[1]}}{${nomTriangle[1]}${nomTriangle[0]}}`,
            ]
    this.question =
      figure +
      `Dans le triangle $${nomTriangle}$, rectangle en $${nomTriangle[1]}$, quel calcul doit-on effectuer pour déterminer le ${fonctionTrigo} de l’angle $${nomAngle}$ ?`

    this.correction = `La bonne formule est : <br>
    $\\text{${fonctionTrigo}}(${nomAngle}) = 
    ${
      fonctionTrigo === 'cosinus'
        ? `\\dfrac{\\text{longueur du côté adjacent à l’angle } ${nomAngle}}{\\text{longueur de l’hypoténuse }}=${miseEnEvidence(this.reponse[0])}$.`
        : fonctionTrigo === 'sinus'
          ? `\\dfrac{\\text{longueur du côté opposé à l’angle } ${nomAngle}}{\\text{longueur de l’hypoténuse }}=${miseEnEvidence(this.reponse[0])}$.`
          : `\\dfrac{\\text{longueur du côté opposé à l’angle } ${nomAngle}}{\\text{longueur du côté adjacent à l’angle } ${nomAngle}}=${miseEnEvidence(this.reponse[0])}$.`
    }`
  }
}
