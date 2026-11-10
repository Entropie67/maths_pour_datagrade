// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 690d1 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polyline } from '../../lib/2d/Polyline'
import { repere } from '../../lib/2d/reperes'
import { texteParPosition } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '690d1'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer une amplitude thermique à partir d’un graphique'
export const dateDePublication = '06/08/2026'

/**
 * @author Stéphane Guyon
 */
export default class CalculAmplitudeThermiqueOld extends ExerciceQcmA {
  private appliquerLesValeurs(
    jour: number,
    mois: string,
    temperatures: number[],
  ): void {
    const temperatureMin = Math.min(...temperatures)
    const temperatureMax = Math.max(...temperatures)
    const amplitude = temperatureMax - temperatureMin
    const yBase = 2 * Math.floor(temperatureMin / 2) - 2
    const ySommet = 2 * Math.ceil(temperatureMax / 2) + 2
    const hauteur = (ySommet - yBase) / 2

    const points = temperatures.map((temperature, index) =>
      pointAbstrait(index, (temperature - yBase) / 2),
    )
    const ligne = polyline(points, 'red')
    ligne.epaisseur = 2
    const pointsMarques = tracePoint(...points)
    pointsMarques.taille = 2.5
    pointsMarques.epaisseur = 1.5

    const graphique = repere({
      xMin: 0,
      xMax: 10,
      yMin: 0,
      yMax: hauteur,
      xThickDistance: 1,
      yThickDistance: 0.5,
      xLabelListe: Array.from({ length: 11 }, (_, index) => ({
        valeur: index,
        texte: `${2 * index}`,
      })),
      yLabelListe: Array.from({ length: hauteur + 1 }, (_, index) => ({
        valeur: index,
        texte: `${yBase + 2 * index}`,
      })),
      grilleXDistance: 1,
      grilleYDistance: 0.5,
      yLegende: 'Température (en °C)',
    })
    const legendeAxeX = texteParPosition('Heure (en h)', 5, -1.3, 0, 'black', 1)

    const figure = mathalea2d(
      {
        xmin: -1.2,
        xmax: 12,
        ymin: -2,
        ymax: hauteur + 1.2,
        pixelsParCm: 28,
        scale: 0.7,
        center: !context.isHtml,
      },
      graphique,
      ligne,
      pointsMarques,
      legendeAxeX,
    )

    this.reponses = [
      amplitude,
      temperatureMin,
      temperatureMax,
      temperatureMax + temperatureMin,
    ].map((valeur) => `$${valeur}\\,^{\\circ}\\text{C}$`)

    this.enonce = `Le graphique ci-dessous représente l'évolution de la température relevée à MathALÉA-city, entre minuit et 20 h, le ${jour} ${mois} 2025.<br>
    ${figure}<br>
    L'amplitude thermique de cette journée, c'est-à-dire la différence entre la température la plus élevée et la température la plus basse, est égale à :`

    this.correction = `La température la plus élevée est $${temperatureMax}\\,^{\\circ}\\text{C}$ et la température la plus basse est $${temperatureMin}\\,^{\\circ}\\text{C}$.<br>
    L'amplitude thermique est donc :<br>
    $${temperatureMax}-${ecritureParentheseSiNegatif(temperatureMin)}=${miseEnEvidence(`${amplitude}\\,^{\\circ}\\text{C}`)}$.`
  }

  versionAleatoire: () => void = () => {
    const mois = choice([
      'mars',
      'avril',
      'mai',
      'juin',
      'septembre',
      'octobre',
    ])
    const amplitude = 2 * randint(4, 8)
    const temperatureMin = randint(-4, 8, [0, amplitude])
    const temperatureMax = temperatureMin + amplitude
    const indiceMin = randint(1, 4)
    const nombreEtapesMin = Math.ceil(amplitude / 6)
    const indiceMax = randint(indiceMin + nombreEtapesMin, 9)
    const temperatures = Array<number>(11)
    temperatures[indiceMin] = temperatureMin
    temperatures[indiceMax] = temperatureMax

    for (let index = indiceMin - 1; index >= 0; index--) {
      temperatures[index] = Math.min(
        temperatureMax - 1,
        temperatures[index + 1] + randint(1, 6),
      )
    }

    const nombreEtapes = indiceMax - indiceMin
    for (let index = indiceMin + 1; index < indiceMax; index++) {
      temperatures[index] =
        temperatureMin +
        Math.round((amplitude * (index - indiceMin)) / nombreEtapes)
    }

    for (let index = indiceMax + 1; index < temperatures.length; index++) {
      temperatures[index] = Math.max(
        temperatureMin + 1,
        temperatures[index - 1] - randint(1, 6),
      )
    }

    this.appliquerLesValeurs(randint(1, 28), mois, temperatures)
  }

  constructor() {
    super()

    this.versionAleatoire()
  }
}
