import { droite, Droite, droiteHorizontaleParPoint } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { lectureAntecedent } from '../../lib/2d/LectureAntecedent'
import { pointAbstrait, PointAbstrait } from '../../lib/2d/PointAbstrait'
import { polyline } from '../../lib/2d/Polyline'
import RepereBuilder from '../../lib/2d/RepereBuilder'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { texteSurSegment } from '../../lib/2d/texteSurSegment'
import { pointIntersectionDD } from '../../lib/2d/utilitairesPoint'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import { stringNombre, texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const interactifReady = true

export const dateDePublication = '05/05/2024'
export const dateDeModificationImportante = '24/03/2026'
export const titre = 'Lire graphiquement des quartiles et des EIQ'
export const uuid = 'b7662'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

const situations = [
  {
    label: 'des salaires en euros dans une entreprise',
    valeurs: [
      [1000, 5000],
      [1200, 4000],
      [800, 4000],
    ],
    zones: [
      [0, 2],
      [0, 2],
      [0, 3],
      [0, 4],
      [1, 5],
      [2, 8],
      [3, 10],
    ],
    precisionLecture: 50,
  },
  {
    label: 'des tailles de haricots en millimètres dans une conserverie',
    valeurs: [
      [50, 160],
      [60, 120],
      [80, 200],
    ],
    zones: [
      [0, 1],
      [0, 2],
      [1, 3],
      [1, 4],
      [2, 4],
      [2, 5],
      [3, 6],
      [4, 7],
      [5, 10],
    ],
    precisionLecture: 2,
  },
  {
    label: "des âges des habitants d'un village",
    valeurs: [
      [0, 80],
      [30, 100],
      [0, 100],
      [20, 80],
    ],
    zones: [
      [0, 3],
      [2, 5],
      [3, 6],
      [3, 7],
      [1, 5],
      [5, 8],
      [4, 6],
      [4, 7],
      [8, 10],
    ],
    precisionLecture: 2,
  },
]
const aleaPopulation = function (
  effectif: number,
  valeurMin: number,
  valeurMax: number,
  zones: number[][],
) {
  const pop: number[] = []
  const ecart = valeurMax - valeurMin
  for (let i = 0; i < effectif; i++) {
    const zone = choice(zones)
    const [min, max] = zone.map((el) => valeurMin + (ecart * el) / 10)
    pop.push(Math.round(randint(min, max)))
  }
  return pop.sort((a, b) => a - b)
}

const trouveQuartiles = function (
  yGrecs: number[],
  pts: PointAbstrait[],
): [number, number, number] {
  let d1: Droite | null = null
  let d2: Droite | null = null
  let d3: Droite | null = null
  let cpt = 0
  do {
    for (let i = 0; i < pts.length; i++) {
      if (yGrecs[i] * 5 <= 25 && yGrecs[i + 1] * 5 > 25) {
        d1 = droite(pts[i], pts[i + 1])
      } else if (yGrecs[i] * 5 <= 50 && yGrecs[i + 1] * 5 > 50) {
        d2 = droite(pts[i], pts[i + 1])
      } else if (yGrecs[i] * 5 <= 75 && yGrecs[i + 1] * 5 > 75) {
        d3 = droite(pts[i], pts[i + 1])
      }
    }
    cpt++
  } while ((d1 == null || d2 == null || d3 == null) && cpt < 5)
  if (cpt === 5) {
    return [0, 0, 0]
  }
  if (d1 && d2 && d3) {
    const D1 = droiteHorizontaleParPoint(pointAbstrait(0, 5))
    const D2 = droiteHorizontaleParPoint(pointAbstrait(0, 10))
    const D3 = droiteHorizontaleParPoint(pointAbstrait(0, 15))
    const p1 = pointIntersectionDD(d1, D1)
    const p2 = pointIntersectionDD(d2, D2)
    const p3 = pointIntersectionDD(d3, D3)
    if (!p1 || !p2 || !p3) {
      window.notify('Erreur dans le calcul des quartiles', { p1, p2, p3 })
      return [0, 0, 0]
    }
    const q1 = p1.x
    const q2 = p2.x
    const q3 = p3.x
    return [q1, q2, q3]
  } else return [0, 0, 0] // on ne devrait jamais arriver ici
}
/**
 * @author Jean-claude Lhote suite à une demande de Stéphane Guyon
 */
export default class Quartiles extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.titre = 'Lire graphiquement des quartiles et des EIQ'
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let q1: number
      let q2: number
      let q3: number
      let pts: PointAbstrait[]
      let echelleX: number
      let echelleY: number
      let valeurMin: number
      let valeurMax: number
      let situation: {
        label: string
        valeurs: number[][]
        zones: number[][]
        precisionLecture: number
      }
      let intervalle
      do {
        const effectif = 100
        situation = choice(situations)
        const valeurs = choice(situation.valeurs)
        ;[valeurMin, valeurMax] = valeurs
        echelleX = 20 / valeurMax
        echelleY = 0.2
        const y: number[] = []
        const x: number[] = []
        const pop = aleaPopulation(
          effectif,
          valeurMin,
          valeurMax,
          situation.zones,
        )
        const nbPart = randint(5, 8)
        let nbVal = 0
        let index = 0
        pts = []
        while (nbVal < effectif) {
          if (nbVal === 0) {
            x[index] = 0
            y[index] = 0
          } else {
            x[index] = pop[nbVal] * echelleX
            y[index] = (nbVal * 100 * echelleY) / effectif
          }
          pts.push(pointAbstrait(x[index], y[index]))
          do {
            nbVal += randint(
              Math.min(2, Math.round(effectif / nbPart)),
              Math.round(effectif / nbPart + 7),
            )
          } while (x[index] === pop[nbVal] * echelleX) // il faut éviter d'avoir deux points sur la même valeur
          index++
        }
        pts.push(pointAbstrait(valeurMax * echelleX, 100 * echelleY))
        ;[q1, q2, q3] = trouveQuartiles(y, pts).map((el) =>
          Math.round(el / echelleX),
        )
        intervalle = (2 * valeurMax) / 100
      } while (
        q1 + q2 + q3 === 0 ||
        (10 * q3) % (10 * intervalle) === 0 ||
        (10 * q1) % (10 * intervalle) === 0
      )

      const q1Round = q1
      // Math.round(q1 / situation.precisionLecture) * situation.precisionLecture
      const q3Round = q3
      //  Math.round(q3 / situation.precisionLecture) * situation.precisionLecture
      const line = polyline(pts, bleuMathalea)
      const rep = new RepereBuilder({
        xMin: 0,
        xMax: valeurMax,
        yMin: 0,
        yMax: 100,
      })
        .setUniteX(echelleX)
        .setUniteY(echelleY)
        .setThickX({ xMin: 0, xMax: valeurMax, dx: valeurMax / 10 })
        .setThickY({ yMin: 0, yMax: 100, dy: 10 })
        .setLabelX({
          xMin: 0,
          xMax: valeurMax,
          dx: valeurMax / 10,
          xLabelEcart: 0.5,
        })
        .setLabelY({ yMin: 0, yMax: 100, dy: 10, yLabelEcart: 0.8 })
        .setGrille({
          grilleX: { dx: (valeurMax * echelleX) / 10 },
          grilleY: { dy: 2 },
        })
        .setGrilleSecondaire({
          grilleX: { dx: (valeurMax * echelleX) / 50 },
          grilleY: { dy: 1 },
        })
        .buildCustom()
      const objets2d = [line, rep]
      const fig = mathalea2d(
        Object.assign({ pixelsParCm: 25, scale: 1 }, fixeBordures(objets2d)),
        objets2d,
      )
      const marque1 = lectureAntecedent(
        q1Round * echelleX,
        5,
        1,
        1,
        'red',
        '25',
        `${stringNombre(q1Round, 0)}`,
      )
      const marque3 = lectureAntecedent(
        q3Round * echelleX,
        15,
        1,
        1,
        'red',
        '75',
        `${stringNombre(q3Round, 0)}`,
      )
      const offset = Math.log10(q1Round) * 0.2 + 0.5
      const ecartIQ = segment(
        pointAbstrait(q1Round * echelleX + offset, -1.5),
        pointAbstrait(q3Round * echelleX - offset, -1.5),
        'red',
      )
      ecartIQ.styleExtremites = '<->'
      const iq = texteSurSegment(
        `$${texNombre(q3Round - q1Round, 0)}$$`,
        pointAbstrait(q1Round * echelleX + offset, -1.5),
        pointAbstrait(q3Round * echelleX - offset, -1.5),
        'red',
        -0.5,
      )
      const repCorr = new RepereBuilder({
        xMin: 0,
        xMax: valeurMax,
        yMin: 0,
        yMax: 100,
      })
        .setUniteX(echelleX)
        .setUniteY(echelleY)
        .setThickX({ xMin: 0, xMax: valeurMax, dx: valeurMax / 10 })
        .setThickY({ yMin: 0, yMax: 100, dy: 10 })
        .setLabelX({
          xMin: 0,
          xMax: valeurMax,
          dx: valeurMax / 10,
          xLabelEcart: 0.5,
        })
        .setLabelY({ yMin: 0, yMax: 100, dy: 10, yLabelEcart: 0.8 })
        .setGrille({
          grilleX: { dx: (valeurMax * echelleX) / 10 },
          grilleY: { dy: 2 },
        })
        .setGrilleSecondaire({
          grilleX: { dx: (valeurMax * echelleX) / 50 },
          grilleY: { dy: 1 },
        })
        .buildCustom()

      const objetsCorr = [line, repCorr.objets, marque1, marque3, ecartIQ, iq]
      const figCorrection = mathalea2d(
        Object.assign(
          { pixelsParCm: 25, scale: 0.5 },
          fixeBordures(objetsCorr),
        ),
        objetsCorr,
      )
      let texte = `On donne ci-dessus la représentation graphique des fréquences cumulées croissante ${situation.label}.<br>Les réponses seront données avec la précision permise par le graphique entre deux interlignes verticales.<br>`
      texte +=
        `${numAlpha(0)} Donner la valeur du premier quartile.` +
        ajouteChampTexteMathLive(this, 3 * i, KeyboardType.clavierNumbers)
      texte +=
        `<br>${numAlpha(1)} Donner la valeur du troisième quartile.` +
        ajouteChampTexteMathLive(this, 3 * i + 1, KeyboardType.clavierNumbers)
      texte +=
        `<br>${numAlpha(2)} Donner la valeur de l'écart inter-quartile.` +
        ajouteChampTexteMathLive(this, 3 * i + 2, KeyboardType.clavierNumbers)
      const minIntervalleq1 = Math.floor(
        Math.floor(q1Round / intervalle) * intervalle,
      )
      const maxIntervalleq1 = Math.ceil(
        intervalle + Math.floor(q1Round / intervalle) * intervalle,
      )
      handleAnswers(this, 3 * i, {
        reponse: {
          value: `[${minIntervalleq1};${maxIntervalleq1}]`,
          options: { estDansIntervalle: true },
        },
      })
      const minIntervalleq3 = Math.floor(
        Math.floor(q3Round / intervalle) * intervalle,
      )
      const maxIntervalleq3 = Math.ceil(
        intervalle + Math.floor(q3Round / intervalle) * intervalle,
      )
      handleAnswers(this, 3 * i + 1, {
        reponse: {
          value: `[${minIntervalleq3};${maxIntervalleq3}]`,
          options: { estDansIntervalle: true },
        },
      })
      handleAnswers(this, 3 * i + 2, {
        reponse: {
          value: `[${minIntervalleq3 - maxIntervalleq1};${maxIntervalleq3 - minIntervalleq1}]`,
          options: { estDansIntervalle: true },
        },
      })

      let texteCorr = 'Par lecture graphique, on trouve :<br>'
      texteCorr += `${numAlpha(0)} La valeur du premier quartile est environ $${miseEnEvidence(texNombre(q1Round, 0))}$. Par la précision du graphique, serait acceptée toute valeur entre $${miseEnEvidence(texNombre(minIntervalleq1), bleuMathalea)}$ et $${miseEnEvidence(texNombre(maxIntervalleq1), bleuMathalea)}$.`
      texteCorr += `<br>${numAlpha(1)} La valeur du troisième quartile est environ $${miseEnEvidence(texNombre(q3Round, 0))}$. Par la précision du graphique, serait acceptée toute valeur entre $${miseEnEvidence(texNombre(minIntervalleq3), bleuMathalea)}$ et $${miseEnEvidence(texNombre(maxIntervalleq3), bleuMathalea)}$.`
      texteCorr += `<br>${numAlpha(2)} La valeur de l'écart inter-quartile est environ $${texNombre(q3Round, 0)}-${texNombre(q1Round, 0)}=${miseEnEvidence(texNombre(q3Round - q1Round, 0))}$. Par la précision du graphique, serait acceptée toute valeur entre $${miseEnEvidence(texNombre(minIntervalleq3 - maxIntervalleq1), bleuMathalea)}$ et $${miseEnEvidence(texNombre(maxIntervalleq3 - minIntervalleq1), bleuMathalea)}$.`
      texteCorr += figCorrection

      texte = fig + texte
      if (this.questionJamaisPosee(i, texte, q1, q2, q3)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
