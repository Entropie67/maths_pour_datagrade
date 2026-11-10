import { fixeBordures } from '../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { homothetie } from '../../lib/2d/transformations'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import ExerciceSimple from '../ExerciceSimple'

export const titre = 'Calculer une distance avec le théorème de Thalès'

export const dateDeModifImportante = '30/10/2026'
export const interactifReady = true

export const dateDePublication = '23/12/2025'

export const uuid = '6ab88'

export const refs = {
  'fr-fr': ['3AutoG12'],
  'fr-ch': [],
}
/**
 * @author Jean-claude Lhote
 */
export default class AutoTheoremeThales extends ExerciceSimple {
  constructor() {
    super()
    this.spacingCorr = 2
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.alphanumeric
    this.optionsChampTexte = { texteApres: ' cm' }
  }

  nouvelleVersion() {
    const rapport = this.sup ? 3.5 : choice([1.5, 2.1, 2.5, 3.1, 3.5])
    const longueurBC = this.sup ? 2 : choice([4, 6, 8, 10, 12])
    const longueurAC = this.sup ? 2 * longueurBC : choice([2, 3]) * longueurBC
    const longueurDE = longueurBC * rapport
    const positionAngleDroit = this.sup
      ? 'droite'
      : choice(['gauche', 'droite'])
    const nomTriangle = this.sup ? 'ADE' : choisitLettresDifferentes(3).join('')
    const nomPara2 = this.sup
      ? 'BC'
      : choisitLettresDifferentes(2, nomTriangle).join('')
    const nomPara1 = `${nomTriangle[1]}${nomTriangle[2]}`

    const D =
      positionAngleDroit === 'gauche'
        ? pointAbstrait(3, 4, nomTriangle[1], 'above left')
        : pointAbstrait(16 / 3, 4, nomTriangle[1], 'above right')
    const A =
      positionAngleDroit === 'gauche'
        ? pointAbstrait(25 / 3, 0, nomTriangle[0], 'below right')
        : pointAbstrait(0, 0, nomTriangle[0], 'below left')
    const E =
      positionAngleDroit === 'gauche'
        ? pointAbstrait(0, 0, nomTriangle[2], 'below left')
        : pointAbstrait(25 / 3, 0, nomTriangle[2], 'below right')
    const C = homothetie(
      D,
      A,
      1 / rapport,
      this.sup ? 'C' : nomPara2[1],
      'above',
    )
    const B = homothetie(
      E,
      A,
      1 / rapport,
      this.sup ? 'B' : nomPara2[0],
      'below',
    )
    const coteAD = segment(A, D)
    const coteDE = segment(D, E)
    const coteEA = segment(E, A)
    const coteBC = segment(B, C)
    const labels = labelPoint(A, D, E, B, C)
    const afficheBC = placeLatexSurSegment(
      texNombre(longueurBC, 1) + '\\text{ cm}',
      positionAngleDroit === 'gauche' ? B : C,
      positionAngleDroit === 'gauche' ? C : B,
      { horizontal: true, distance: 0.7, letterSize: 'small' },
    )
    const afficheDE = placeLatexSurSegment(
      texNombre(longueurDE, 1) + '\\text{ cm}',
      positionAngleDroit === 'gauche' ? E : D,
      positionAngleDroit === 'gauche' ? D : E,
      { horizontal: true, distance: 0.7, letterSize: 'small' },
    )
    const afficheAC = placeLatexSurSegment(
      texNombre(longueurAC, 1) + '\\text{ cm}',
      positionAngleDroit === 'gauche' ? C : A,
      positionAngleDroit === 'gauche' ? A : C,
      { horizontal: true, distance: 0.7, letterSize: 'small' },
    )

    const objets = [
      coteAD,
      coteDE,
      coteEA,
      coteBC,
      labels,
      afficheBC,
      afficheDE,
      afficheAC,
    ]
    const figure = mathalea2d(
      Object.assign({ pixelsParCm: 30 }, fixeBordures(objets)),
      objets,
    )

    this.reponse = arrondi(rapport * longueurAC, 1)

    this.question =
      figure +
      `Sur la figure ci-dessus, dans le triangle $${nomTriangle}$, les droites $(${nomPara1})$ et $(${nomPara2})$ sont parallèles. Déterminer la longueur $${nomTriangle.slice(0, 2)}$.`

    this.correction = `Dans le triangle $${nomTriangle}$, les droites $(${nomPara1})$ et $(${nomPara2})$ sont parallèles. <br>
    D'après le théorème de Thalès, on a : <br>
    $\\dfrac{${nomTriangle[0]}${nomTriangle[1]}}{${nomTriangle[0]}${C.nom}} =
    \\dfrac{${nomPara1}}{${nomPara2}}$. <br>
    En remplaçant par les longueurs, on obtient : <br>
    $\\dfrac{${nomTriangle[0]}${nomTriangle[1]}}{${nomTriangle[0]}${C.nom}} = \\dfrac{${texNombre(longueurDE, 1)}}{${texNombre(
      longueurBC,
      1,
    )}}=${texNombre(rapport, 1)}$.<br>
    On en déduit que : <br>
    $${nomTriangle[0]}${nomTriangle[1]} = ${texNombre(rapport, 1)} \\times ${texNombre(longueurAC, 1)} = ${miseEnEvidence(texNombre(longueurAC * rapport, 1))}$ cm.`
  }
}
