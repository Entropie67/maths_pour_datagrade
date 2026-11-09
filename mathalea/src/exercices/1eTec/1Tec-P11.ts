import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { point } from '../../lib/2d/PointAbstrait'
import { tracePoint } from '../../lib/2d/TracePoint'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'

export const titre = "Extrapoler une grandeur à partir d'un ajustement affine"
export const interactifReady = true

export const dateDePublication = '06/07/2026'

/**
 * Exercice : observer un nuage de points autour d'une droite y = ax + b,
 * tracer la droite de tendance, et prédire une valeur en extrapolation.
 *
 * @author Arnaud Meistermann
 */
export const uuid = '11ade'

export const refs = {
  'fr-fr': ['1Tec-P11'],
  'fr-ch': [],
}

export default class ExtrapolerTendanceLineaire extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = 4
    this.spacing = 1.5
    this.spacingCorr = 3
  }

  nouvelleVersion() {
    for (
      let i = 0,
        texte,
        texteCorr,
        cpt = 0,
        xMin,
        xMax,
        yMin,
        yMax,
        listeX,
        listeY,
        sommeX,
        sommeY,
        listePoints,
        objetsFigure,
        figure,
        nomsPoints;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Bornes du repère
      xMin = 0
      xMax = 10
      yMin = 0
      yMax = 3

      nomsPoints = ['M_1', 'M_2', 'M_3', 'M_4', 'M_5', 'M_6']

      // Génération des 6 points alignés autour d'une droite y = ax + b
      const a = randint(10, 15) / 10 // de 1 à 1,5

      const b = randint(1, 3) / 2 // 0,5, 1 ou 1,5

      let distinct = false
      do {
        // X croissants pour avoir une vraie ligne, générés aléatoirement dans [xMin, xMax]
        const step = Math.ceil((xMax - xMin) / 6)
        listeX = []
        for (let i = 0; i < 6; i++) {
          listeX.push(randint(xMin + i * step, xMin + (i + 1) * step))
        }
        listeX.sort((x, y) => x - y) // trier pour éviter zigzag

        // Y sur la droite avec perturbation entre -1 et 1 (pas de 0,5)
        listeY = listeX.map((x) => {
          const perturbation = randint(-2, 2) * 0.5
          const y = Math.round(a * x + b + perturbation)
          return y
        })

        // Vérifier que tous les x sont distincts ET tous les y sont distincts
        distinct = true

        // Vérifier x
        for (let i = 0; i < 6 && distinct; i++) {
          for (let j = i + 1; j < 6; j++) {
            if (listeX[i] === listeX[j]) {
              distinct = false
              break
            }
          }
        }

        // Vérifier y
        for (let i = 0; i < 6 && distinct; i++) {
          for (let j = i + 1; j < 6; j++) {
            if (listeY[i] === listeY[j]) {
              distinct = false
              break
            }
          }
        }
      } while (!distinct)

      sommeX = listeX.reduce((s, x) => s + x, 0)
      sommeY = listeY.reduce((s, y) => s + y, 0)

      // Bornes du repère basées sur les données
      const maxX = Math.max(...listeX)
      const maxY = Math.max(...listeY)
      xMin = 0
      xMax = maxX + 1
      yMin = 0
      yMax = maxY + 1

      // Construction des points et de la figure
      listePoints = nomsPoints.map((nom, k) => {
        const p = point(listeX[k], listeY[k], nom, 'above right')
        return p
      })

      // Tracer la droite y = ax + b
      const x1 = xMin - 0.5
      const y1 = a * x1 + b
      const x2 = xMax + 0.5
      const y2 = a * x2 + b
      const drotteTendance = segment(x1, y1, x2, y2, 'red')

      objetsFigure = [
        repere({ xMin, xMax, yMin, yMax }),
        drotteTendance,
        ...listePoints.map((M) => tracePoint(M, 'blue')),
      ]
      figure = mathalea2d(
        {
          xmin: xMin - 1,
          xmax: xMax + 1,
          ymin: yMin - 1,
          ymax: yMax + 1,
          display: 'block',
          center: !context.isHtml,
          scale: 0.5,
        },
        objetsFigure,
      )

      // Choisir une valeur d'extrapolation hors de l'intervalle des x
      const xExtra = maxX + randint(2, 4)
      const yExtra = a * xExtra + b

      texte =
        "Un ballon-sonde est lancé dans l'air. Un capteur enregistre son altitude toutes les secondes pendant son ascension.<br>"
      texte +=
        "On note $x$ le nombre de secondes écoulées depuis le décollage et $y$ l'altitude du ballon (en mètres). <br>" +
        'On a représenté le nuage de points correspondant aux mesures obtenues.<br>'

      // Centrer la figure selon le contexte
      if (context.isHtml) {
        texte +=
          `<div style="display: flex; justify-content: center; width: 100%;">` +
          figure +
          `</div>`
      } else {
        texte += `\\begin{center}${figure}\\end{center}`
      }
      texte +=
        `Le nuage de points permet d'envisager un ajustement affine. Estimer l'altitude du ballon au bout de $${texNombre(xExtra)}$ secondes à l'aide de la droite d'équation $y = ` +
        (a === 1
          ? `x + ${texNombre(b)}`
          : `${texNombre(a)}x + ${texNombre(b)}`) +
        `$.<br>`

      if (this.interactif) {
        texte +=
          `Au bout de $${xExtra}$ secondes, on estime que le ballon est à ` +
          `${addMultiMathfield(this, i, {
            dataTemplate: `%{champ1} m d'altitude.`,
            dataOptions: {
              champ1: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
            },
          })}`
      }

      handleAnswers(
        this,
        i,
        {
          champ1: { value: yExtra },
        },
        { formatInteractif: 'multi-mathfield' },
      )

      texteCorr = `On utilise l'équation de la droite en remplaçant $x$ par $${xExtra}$ : <br>`
      texteCorr +=
        a === 1
          ? `$y = ${xExtra} + ${texNombre(b)} = ${texNombre(yExtra)}$ <br>`
          : `$y = ${texNombre(a)} \\times ${xExtra} + ${texNombre(b)} = ${texNombre(yExtra)}$ <br>`
      texteCorr += `Au bout de $${xExtra}$ secondes, on estime que le ballon est à $${miseEnEvidence(texNombre(yExtra))}$ m d'altitude.`

      if (this.questionJamaisPosee(i, sommeX, sommeY)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
