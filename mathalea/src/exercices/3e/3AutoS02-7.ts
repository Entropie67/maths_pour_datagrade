import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { plot } from '../../lib/2d/Plot'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polyline } from '../../lib/2d/Polyline'
import { Repere } from '../../lib/2d/reperes'
import { latex2d } from '../../lib/2d/textes'
import { vide2d } from '../../lib/2d/Vide2d'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import ExerciceSimple from '../ExerciceSimple'

export const titre = 'Lire un graphique cartésien'

export const interactifReady = true

export const dateDePublication = '24/12/2025'

export const uuid = '6b987'

export const refs = {
  'fr-fr': ['3AutoS02-7'],
  'fr-ch': [],
}

function choisir3Points(
  valeursEntieres: boolean,
  hiver: boolean,
): [number, number][] {
  const points: [number, number][] = []
  while (points.length < 3) {
    if (points.length === 0) {
      const x = randint(2, 3) * 2
      const y = randint(0, 3) * 5
      points.push([x, y])
    } else if (points.length === 1) {
      const x = points[0][0] + randint(2, 3) * 2
      const y =
        points[0][1] +
        (valeursEntieres ? randint(1, 3) * 5 : randint(1, 5) * 2.5)
      points.push([x, y])
    } else {
      const x = points[1][0] + randint(1, 3) * 2
      const y = points[1][1] + (valeursEntieres ? 5 : randint(1, 3) * 2.5)
      points.push([x, y])
    }
  }
  return hiver ? points.map((p: [number, number]) => [p[0], p[1] - 20]) : points
}
/**
 * @author Jean-claude Lhote
 */
export default class LireUnGraphiqueCartesien extends ExerciceSimple {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = [
      'Sujet original (autres paramètres inutiles si coché)',
      false,
    ]
    this.besoinFormulaire2CaseACocher = ['Valeurs entières', true]
    this.besoinFormulaire3CaseACocher = ['Avec valeurs négatives', false]
    this.sup = false
    this.sup2 = false
    this.sup3 = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.optionsChampTexte = { texteApres: '$^\\circ\\text{C}$' }
  }

  nouvelleVersion() {
    const changementDeRepere = !this.sup && this.sup3

    const serie = this.sup
      ? [
          [8, 15],
          [12, 27],
          [16, 30],
        ]
      : choisir3Points(this.sup2, this.sup3)
    const heureMatin = serie[0][0]
    const heureApresMidi = serie[2][0]
    const temperatureMatin = serie[0][1]
    const temperatureApresMidi = serie[2][1]
    const monRepere = new Repere({
      xUnite: 1,
      yUnite: 0.3,
      xMin: 0,
      xMax: 18,
      yMin: changementDeRepere ? -20 : 0,
      yMax: changementDeRepere ? 15 : 35,
      axeXisVisible: false,
      axeYisVisible: false,
      xThickDistance: 2,
      yThickDistance: 5,
      grille: true,
      grilleXDistance: 2,
      grilleYDistance: 1.5,
      yLabelMin: changementDeRepere ? -20 : 0,
      yLabelMax: changementDeRepere ? 15 : 35,
      yLabelDistance: 5,
      xLabelMin: 0,
      xLabelMax: 18,
      xLabelDistance: 2,
      xLabelEcart: changementDeRepere ? 6.5 : 0.5,
    })
    const origine = pointAbstrait(0, changementDeRepere ? -20 * 0.3 : 0)
    const topY = pointAbstrait(0, changementDeRepere ? 4.5 : 10.5)
    const topX = pointAbstrait(18, changementDeRepere ? -20 * 0.3 : 0)
    const legendeX = placeLatexSurSegment(
      '\\text{Horaire (en heures)}',
      origine,
      topX,
      { distance: -2 },
    )
    const legendeY = placeLatexSurSegment(
      '\\text{Température (en }^\\circ\\text{C)}',
      origine,
      topY,
      { distance: 2 },
    )
    const points: PointAbstrait[] = []
    for (let i = 0; i < serie.length; i++) {
      points.push(pointAbstrait(serie[i][0], (serie[i][1] * 1.5) / 5))
    }
    const courbe = polyline(points)
    courbe.epaisseur = 2
    courbe.color = colorToLatexOrHTML('gray')

    const blobs = points.map((p) =>
      plot(p.x, p.y, {
        rayon: 0.2,
        couleur: 'gray',
        couleurDeRemplissage: 'gray',
      }),
    )
    const zero = changementDeRepere
      ? latex2d('0', -0.5, 0, {
          letterSize: 'scriptsize',
          opacity: 0.8,
          color: 'black',
        })
      : vide2d()
    const objets: NestedObjetMathalea2dArray = [
      monRepere,
      legendeY,
      legendeX,
      courbe,
      blobs,
      zero,
    ]
    this.reponse = texNombre(temperatureApresMidi - temperatureMatin, 1)

    this.question = `Le graphique ci-dessous donne l'évolution de la température (en degrés Celsius) en
fonction de l'horaire (en heures).<br>
Entre $${heureMatin}\\text{ h}$ et $${heureApresMidi}\\text{ h}$, de combien de degrés la température a-t-elle augmenté ?<br>
${mathalea2d(Object.assign({ scale: 0.5 }, fixeBordures(objets)), objets)}`
    this.correction = `D’après le graphique, à $${heureMatin}\\text{ h}$, la température est de $${texNombre(temperatureMatin, 1)}\\,^\\circ\\text{C}$ et à $${heureApresMidi}\\text{ h}$, elle est de $${texNombre(temperatureApresMidi, 1)}\\,^\\circ\\text{C}$.<br>
    L'augmentation de la température entre $${heureMatin}\\text{ h}$ et $${heureApresMidi}\\text{ h}$ est donc de : $${texNombre(temperatureApresMidi, 1)}-${ecritureParentheseSiNegatif(temperatureMatin)}=`
    if (changementDeRepere && temperatureMatin < 0)
      this.correction += `${texNombre(temperatureApresMidi, 1)}+${-temperatureMatin}=`
    this.correction += `${miseEnEvidence(texNombre(temperatureApresMidi - temperatureMatin, 1))}\\,^\\circ\\text{C}$.`
  }
}
