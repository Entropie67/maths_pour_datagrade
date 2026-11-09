import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { plot } from '../../lib/2d/Plot'
import { point } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'

export const titre =
  "Calculer les coordonnées du point moyen d'un nuage de points"
export const interactifReady = true

export const dateDePublication = '06/07/2026'

/**
 *
 * @author Arnaud Meistermann
 */
export const uuid = '11ad8'

export const refs = {
  'fr-fr': ['1Tec-P10'],
  'fr-ch': [],
}

export default class CalculerPointMoyenNuage extends Exercice {
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
        xG = 0,
        yG = 0,
        listePoints,
        objetsFigure,
        figure,
        nomsPoints;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Bornes du repère
      xMin = -10
      xMax = 10
      yMin = -3
      yMax = 3

      nomsPoints = ['M_1', 'M_2', 'M_3', 'M_4', 'M_5', 'M_6']

      // Génération des 6 points alignés autour d'une droite y = ax + b
      // Pente : -2 à -1 ou 1 à 2 (pente forte)
      let a = randint(2, 3) / 2 // 1.0 à 2.5
      if (Math.random() < 0.5) a = -a // ou -1.0 à -2.0

      // b < 0 si a > 0, b > 0 si a < 0
      let b = randint(2, 5) / 2
      if (Math.random() < 0.5) b = -b // ou -1.0 à -2.0

      let distinct = false
      do {
        // X croissants pour avoir une vraie ligne, générés aléatoirement dans [xMin, xMax]
        const step = Math.ceil((xMax - xMin) / 6)
        listeX = []
        for (let i = 0; i < 5; i++) {
          listeX.push(randint(xMin + i * step, xMin + (i + 1) * step))
        }
        listeX.sort((x, y) => x - y) // trier pour éviter zigzag

        // Y sur la droite avec perturbation entre -1.5 et 1.5 (pas de 0.5)
        listeY = listeX.map((x) => {
          const perturbation = randint(-2, 2) * 0.5
          const y = Math.round(a * x + b + perturbation)
          return y
        })

        // Vérifier que les 5 premiers points sont tous distincts
        let allDistinct = true
        for (let i = 0; i < 5 && allDistinct; i++) {
          for (let j = i + 1; j < 5; j++) {
            if (listeX[i] === listeX[j] && listeY[i] === listeY[j]) {
              allDistinct = false
              break
            }
          }
        }
        if (!allDistinct) continue

        // Sommes des 5 premiers points
        sommeX = listeX.reduce((s, x) => s + x, 0)
        sommeY = listeY.reduce((s, y) => s + y, 0)

        // Moyenne des 5 premiers points
        const moyX = sommeX / 5
        const moyY = sommeY / 5

        // Essayer des valeurs de G jusqu'à en trouver une qui donne un 6e point distinct
        distinct = false
        for (let attempts = 0; attempts < 10 && !distinct; attempts++) {
          xG = randint(Math.ceil(moyX) - 1, Math.ceil(moyX) + 1)
          yG = randint(Math.ceil(moyY) - 1, Math.ceil(moyY) + 1)

          // Le 6e point doit satisfaire : sommeX + x6 = 6*xG et sommeY + y6 = 6*yG
          listeX[5] = 6 * xG - sommeX
          listeY[5] = 6 * yG - sommeY

          // Vérifier que le 6e point est différent des 5 premiers ET dans les bornes
          if (
            listeX[5] >= xMin &&
            listeX[5] <= xMax &&
            listeY[5] >= yMin &&
            listeY[5] <= yMax
          ) {
            distinct = true
            for (let i = 0; i < 5; i++) {
              if (listeX[i] === listeX[5] && listeY[i] === listeY[5]) {
                distinct = false
                break
              }
            }
          }
        }
      } while (!distinct)

      sommeX = listeX.reduce((s, x) => s + x, 0)
      sommeY = listeY.reduce((s, y) => s + y, 0)

      // Bornes du repère basées sur les données
      const minX = Math.min(...listeX)
      const maxX = Math.max(...listeX)
      const minY = Math.min(...listeY)
      const maxY = Math.max(...listeY)
      xMin = minX - 1
      xMax = maxX + 1
      yMin = minY - 1
      yMax = maxY + 1

      // Construction des points et de la figure
      listePoints = nomsPoints.map((nom, k) => {
        const p = point(listeX[k], listeY[k], nom, 'above right')
        return p
      })
      objetsFigure = [
        repere({ xMin, xMax, yMin, yMax }),
        ...listePoints.map((M) => {
          const t = tracePoint(M, 'blue')
          t.epaisseur = 2.5
          t.taille = 5
          t.tailleTikz = t.taille / 15
          return t
        }),
      ]
      figure = mathalea2d(
        {
          xmin: xMin,
          xmax: xMax,
          ymin: yMin,
          ymax: yMax,
          scale: 0.5,
          display: 'block',
          center: !context.isHtml,
        },
        objetsFigure,
      )

      texte = `Calculer les coordonnées du point moyen $G$ de ce nuage de points.<br><br>`
      if (context.isHtml) {
        texte +=
          `<div style="display: flex; justify-content: center; width: 100%;">` +
          figure +
          `</div>`
      } else {
        texte += `\\begin{center}${figure}\\end{center}`
      }
      if (this.interactif) {
        texte += `${addMultiMathfield(this, i, {
          dataTemplate: `$G($ %{champ1} $;$ %{champ2} $)$`,
          dataOptions: {
            champ1: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
            champ2: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
          },
        })}`
      }

      handleAnswers(
        this,
        i,
        {
          champ1: { value: xG },
          champ2: { value: yG },
          bareme: toutAUnPoint,
        },
        { formatInteractif: 'multi-mathfield' },
      )

      texteCorr =
        "Le point moyen $G$ d'un nuage de points a pour coordonnées les moyennes des abscisses et des ordonnées des points du nuage. <br>"
      texteCorr +=
        'Si on note $(x_1;y_1), (x_2;y_2), \\ldots, (x_6;y_6)$ les coordonnées des $6$ points, on a :<br>'
      texteCorr += `$x_G=\\dfrac{x_1+x_2+\\cdots+x_6}{6}=\\dfrac{${listeX.map((x) => ecritureParentheseSiNegatif(x)).join('+')}}{6}=${xG}$ <br>`
      texteCorr += `$y_G=\\dfrac{y_1+y_2+\\cdots+y_6}{6}=\\dfrac{${listeY.map((y) => ecritureParentheseSiNegatif(y)).join('+')}}{6}=${yG}$ <br>`
      texteCorr += `Donc $G(${miseEnEvidence(xG)};${miseEnEvidence(yG)})$<br>`

      // Construire la figure de correction avec G en rouge
      const objetsFigureCorr = [
        repere({ xMin, xMax, yMin, yMax }),
        ...listePoints.map((M) => {
          const t = tracePoint(M, 'blue')
          t.epaisseur = 2.5
          t.taille = 5
          t.tailleTikz = t.taille / 15
          return t
        }),
        plot(xG, yG, { couleur: 'red', rayon: 0.15 }),
      ]
      const figureCorr = mathalea2d(
        {
          xmin: xMin,
          xmax: xMax,
          ymin: yMin,
          ymax: yMax,
          display: 'block',
          scale: 0.5,
          center: !context.isHtml,
        },
        objetsFigureCorr,
      )
      texteCorr += figureCorr

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
