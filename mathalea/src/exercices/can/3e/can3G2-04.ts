import { afficheMesureAngle } from '../../../lib/2d/AfficheMesureAngle'
import { codageSegments } from '../../../lib/2d/CodageSegment'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../../lib/2d/textes'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer un angle'
export const interactifReady = true

export const dateDePublication = '02/01/2026'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * 
*/
export const uuid = '15803'

export const refs = {
  'fr-fr': ['can3G2-04', '2G10-flash3'],
  'fr-ch': [],
}
export default class CalculerAngle extends ExerciceSimple {
  constructor() {
    super()
    this.optionsChampTexte = { texteAvant: '$x=$', texteApres: '$^\\circ$' }
    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.nbQuestions = 1
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    switch (this.quotaChoice('cas', [1, 2])) {
      case 1:
        {
          // Angle extérieur pair entre 114° et 132°
          const angleExterieur = randint(60, 68) * 2
          const angleInterieurBase = 180 - angleExterieur
          const angleX = 180 - 2 * angleInterieurBase

          // Construction de la figure
          // Segment horizontal qui dépasse (comme sur l'image)
          const D = pointAbstrait(-1.5, 0, '', 'none') // Point gauche du segment
          const E = pointAbstrait(9, 0, '', 'none') // Point droite du segment
          const segmentHorizontal = segment(D, E)

          // Base du triangle sur le segment
          const A = pointAbstrait(0, 0, '', 'below')
          const B = pointAbstrait(6, 0, '', 'below')

          // Point pour l'angle extérieur (prolongement à droite de B)

          // Sommet en haut au milieu (triangle isocèle)
          const angleBaseRad = (angleInterieurBase * Math.PI) / 180
          const xC = 3
          const yC = 3 * Math.tan(angleBaseRad)
          const C = pointAbstrait(xC, yC, '', 'above')

          // Construction des segments du triangle avec codage pour les côtés égaux
          const coteAC = segment(A, C, 'black')
          coteAC.styleExtremites = 'x-'
          const coteBC = segment(B, C, 'black')
          coteBC.styleExtremites = 'x-'
          const codage = codageSegments('//', 'black', A, C, B, C)
          const labels = labelPoint(A, B, C)

          // Affichage de l'angle extérieur en bas à droite
          const angleExt = afficheMesureAngle(
            C,
            B,
            E,
            'black',
            0.8,
            `${angleExterieur}^\\circ`,
          )

          // Affichage de x au sommet (angle C)
          const angleC = afficheMesureAngle(A, C, B, 'black', 0.8, 'x')

          const objets = [
            segmentHorizontal,
            coteAC,
            coteBC,
            labels,
            angleExt,
            angleC,
            codage,
          ]

          const figure = mathalea2d(
            Object.assign(
              { pixelsParCm: 30, scale: 0.7 },
              fixeBordures(objets),
            ),
            objets,
          )

          this.reponse = angleX

          this.question = `Déterminer la valeur de $x$.<br>` + figure

          this.correction = `L'angle extérieur mesure $${angleExterieur}^\\circ$, donc l'angle intérieur au triangle mesure $180^\\circ - ${angleExterieur}^\\circ = ${angleInterieurBase}^\\circ$. <br>
    Comme le triangle est isocèle, ses angles à la base sont de même mesure et valent $${angleInterieurBase}^\\circ$.<br>
    La somme des mesures des angles d'un triangle est égale à $180^\\circ$. <br>
    Ainsi, $x + 2\\times ${angleInterieurBase}^\\circ  = 180^\\circ$. <br>
    D'où $x = 180^\\circ - ${2 * angleInterieurBase}^\\circ = ${miseEnEvidence(`${angleX}`)}^\\circ$.`
        }
        break
      case 2:
      default:
        {
          // Angle extérieur pair entre 114° et 132°
          const angleExterieur = randint(60, 68) * 2
          const angleInterieurBase = 180 - angleExterieur
          // Pour un triangle isocèle en C, les angles en A et B sont égaux
          const angleX = (180 - angleInterieurBase) / 2

          // Construction de la figure
          // Segment horizontal qui dépasse
          const D = pointAbstrait(-1.5, 0, '', 'none')
          const E = pointAbstrait(9, 0, '', 'none')
          const segmentHorizontal = segment(D, E)

          // Points A et C sur le segment
          const A = pointAbstrait(0, 0, '', 'below')
          const C = pointAbstrait(6, 0, '', 'below')

          // Sommet B en haut (triangle isocèle en C, donc CA = CB)
          // On calcule la position de B à partir de C
          const angleIntRad = (angleInterieurBase * Math.PI) / 180
          const longueurCA = 6 // distance AC
          const longueurCB = longueurCA // car isocèle en C

          // B est à une distance longueurCB de C, avec un angle angleInterieurBase par rapport à CA
          const xB = C.x - longueurCB * Math.cos(angleIntRad)
          const yB = longueurCB * Math.sin(angleIntRad)
          const B = pointAbstrait(xB, yB, '', 'above')

          // Construction des segments du triangle
          const coteAC = segment(A, C, 'black')
          const coteAB = segment(A, B, 'black')
          const coteBC = segment(B, C, 'black')

          // Codage pour indiquer que CA = CB (les deux côtés partant de C)
          const codage = codageSegments('//', 'black', C, A, C, B)

          const labels = labelPoint(A, B, C)

          // Affichage de l'angle extérieur en bas à droite (en C)
          const angleExt = afficheMesureAngle(
            B,
            C,
            E,
            'black',
            0.8,
            `${angleExterieur}^\\circ`,
          )

          // Affichage de x en A (angle à la base gauche)
          const angleA = afficheMesureAngle(C, A, B, 'black', 0.8, 'x')

          const objets = [
            segmentHorizontal,
            coteAC,
            coteAB,
            coteBC,
            labels,
            angleExt,
            angleA,
            codage,
          ]

          const figure = mathalea2d(
            Object.assign(
              { pixelsParCm: 30, scale: 0.7 },
              fixeBordures(objets),
            ),
            objets,
          )

          this.reponse = angleX

          this.question = `Déterminer la valeur de $x$.<br>` + figure

          this.correction = `L'angle extérieur mesure $${angleExterieur}^\\circ$, donc l'angle intérieur au triangle mesure $180^\\circ - ${angleExterieur}^\\circ = ${angleInterieurBase}^\\circ$. <br>
        Comme le triangle est isocèle, ses angles à la base sont de même mesure et valent $x$.<br>
        La somme des mesures des angles d'un triangle est égale à $180^\\circ$. <br>
        Ainsi, $2x + ${angleInterieurBase}^\\circ = 180^\\circ$. <br>
        D'où $2x = 180^\\circ - ${angleInterieurBase}^\\circ = ${180 - angleInterieurBase}^\\circ$, soit $x = ${miseEnEvidence(`${angleX}`)}^\\circ$.`
        }
        break
    }

    this.canReponseACompleter = '$x = \\ldots^\\circ$'
  }
}
