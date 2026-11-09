import { afficheMesureAngle } from '../../lib/2d/AfficheMesureAngle'
import { bissectrice } from '../../lib/2d/Bissectrice'
import { demiDroite } from '../../lib/2d/DemiDroite'
import { droite } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { labelPoint, latex2d } from '../../lib/2d/textes'
import { tracePointSurDroite } from '../../lib/2d/TracePointSurDroite'
import {
  homothetie,
  projectionOrtho,
  rotation,
} from '../../lib/2d/transformations'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const uuid = 'd8433'
export const titre = "Construire la bissectrice d'un angle"
export const dateDePublication = '01/09/2025'

export const refs = {
  'fr-fr': ['6G5B'],
  'fr-2016': [],
  'fr-ch': ['9R1ES2D-8', '9R2ES2D-8', '9R3ES2D-8'],
}

/**
 * @author Jean-claude Lhote
 */
export default class QuestionBissectrice extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3

    this.besoinFormulaireTexte = [
      'Niveau de difficulté',
      'Nombres séparés par des tirets :\n1 : Angle aigu\n2 : Angle obtus inférieur à 135°\n3 : Angle obtus supérieur ou égal à 135°\n4 : mélange',
    ]
    this.sup = '4'
    this.besoinFormulaire2CaseACocher = ['Angles pairs', false]
    this.sup2 = false
  }

  nouvelleVersion(): void {
    const niveauxDifficulte = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
    }).map(Number)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 100;) {
      let texte = ''
      let texteCorr = ''
      let alpha: number
      if (niveauxDifficulte[i] === 1) {
        alpha = this.sup2 ? randint(10, 45) * 2 : randint(20, 90)
      } else if (niveauxDifficulte[i] === 2) {
        alpha = this.sup2 ? randint(46, 67) * 2 : randint(91, 134)
      } else {
        alpha = this.sup2 ? randint(68, 80) * 2 : randint(135, 160)
      }
      const lettres = choisitLettresDifferentes(4)
      const A = lettres[0]
      const B = lettres[1]
      const C = lettres[2]
      const I = lettres[3]

      const pointA = pointAbstrait(5, 0, A, 'below')
      const pointB = pointAbstrait(0, 0, B, 'below left')
      const pointC = rotation(
        pointA,
        pointB,
        alpha,
        C,
        getPositionFromAngle(alpha),
      )
      const d1 = droite(pointB, pointA)
      const d2 = droite(pointB, pointC)
      const d3 = rotation(d1, pointB, alpha / 2)
      const pointI = homothetie(
        projectionOrtho(pointA, d3, I, 'above'),
        pointB,
        2,
        I,
        'above',
      )
      const labelI = latex2d(I, pointI.x + 0.5, pointI.y + 0.3, {})
      const dd1 = demiDroite(pointB, pointA)
      const dd2 = demiDroite(pointB, pointC)
      const dd3 = bissectrice(
        pointA,
        pointB,
        pointC,
        'red',
        'black',
        'green',
        true,
        true,
        '|',
      )

      const labels = labelPoint(pointA, pointB, pointC)
      const trace1 = tracePointSurDroite(pointA, d1)
      const trace2 = tracePointSurDroite(pointC, d2)
      const trace3 = tracePointSurDroite(pointI, d3)
      const mesureAngle = afficheMesureAngle(pointA, pointB, pointC)
      const objets = [dd1, dd2, labels, trace1, trace2, mesureAngle]
      const objetsCorr = [dd1, dd2, dd3, labels, labelI, trace1, trace2, trace3]
      texte += mathalea2d(
        Object.assign(
          {
            scale: 0.5,
            optionsTikz: ['baseline=(current bounding box.north)'],
          },
          fixeBordures(objets, { rymin: -2, rymax: 2 }),
        ),
        objets,
      )
      texte += `Construire la bissectrice $\\left[${B}${I}\\right)$ de l'angle $\\widehat{${A}${B}${C}}$.<br>`

      texteCorr =
        `La demi-droite $\\left[${B}${I}\\right)$ est la bissectrice de l'angle $\\widehat{${A}${B}${C}}$.<br>
        Par définition de la bissectrice, elle partage cet angle en deux angles de même mesure.<br>
        Donc : $\\widehat{${A}${B}${I}} = \\dfrac{${alpha}^\\circ}{2} = ${miseEnEvidence(`${texNombre(alpha / 2, 1)}^\\circ`)}$.<br>` +
        mathalea2d(
          Object.assign(
            {
              scale: 0.5,
              optionsTikz: ['baseline=(current bounding box.north)'],
            },
            fixeBordures(objetsCorr),
          ),
          objetsCorr,
        )

      if (this.questionJamaisPosee(i, alpha)) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }
  }
}

function getPositionFromAngle(alpha: number): string {
  // Normalisation de l’angle entre 0 et 360
  const a = ((alpha % 360) + 360) % 360

  // si aucune position fournie → on la déduit de l’angle
  if (a >= 0 && a < 90) return 'above left'
  if (a >= 90 && a < 180) return 'above right'
  return 'above' // fallback (par sécurité)
}
