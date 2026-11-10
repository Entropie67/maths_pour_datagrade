// import Decimal from 'decimal.js'
import { courbe } from '../../lib/2d/Courbe'
import { droiteHorizontaleParPoint } from '../../lib/2d/droites'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Résoudre $f(x)=k$ à partir d'un graphique"
export const interactifReady = true

export const dateDePublication = '31/01/2026'

/**
 * Un graphique étant tracé, déterminer les antécédents de nombres donnés.
 * La fonction est un polynôme de degré 1, 2 ou 3 et les nombres des questions ne sont que des entiers.
 * Interactivité et multiples questions ajoutés par Jean-claude Lhote le 23/09/2023
 * @author Rémi Angot
 */

export const uuid = '8117e'

export const refs = {
  'fr-fr': ['3F13-2', '2F12-5', '1Tec-F13'],
  'fr-ch': ['10LCFA3B-7', '10LSFA3B-7', '11CTFA2A-7', 'PRQPF01B-7'],
}
export default class AntecedentGraphique extends Exercice {
  constructor() {
    super()

    this.besoinFormulaireTexte = [
      "Nombre d'antécédents à chercher",
      'Nombre de 1 à 3 séparés par des tirets',
    ]
    this.sup = '0'

    // this.spacingCorr = context.isHtml ? 3 : 1
    this.nbQuestions = 1

    // this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    const nbAntecedents = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      defaut: 0,
      melange: 0,
      nbQuestions: this.nbQuestions,
    })

    let texte: string, texteCorr: string, f: (x: number) => number
    let pointsDePassage: { x: number; y: number }[] = []
    let reponses: number[] = []
    let imageChoisie: number = 0
    let yMin: number = -10
    let yMax: number = 10
    let yUnite = 1
    for (let i = 0; i < this.nbQuestions;) {
      const nbAnt = nbAntecedents[i] || 1
      if (nbAnt === 1) {
        let a: number = 0
        const pointDePassage1 = { x: randint(-5, 5), y: randint(-5, 5) }
        let pointDePassage2: { x: number; y: number }
        if (pointDePassage1.x < 0 && pointDePassage1.y < 0) {
          pointDePassage2 = {
            x: randint(1, 5),
            y: randint(pointDePassage1.y + 1, 5),
          }
        } else if (pointDePassage1.x > 0 && pointDePassage1.y < 0) {
          pointDePassage2 = {
            x: randint(-5, -1),
            y: randint(pointDePassage1.y + 1, 5),
          }
        } else if (pointDePassage1.x < 0 && pointDePassage1.y > 0) {
          pointDePassage2 = {
            x: randint(1, 5),
            y: randint(-5, pointDePassage1.y - 1),
          }
        } else {
          pointDePassage2 = {
            x: randint(-5, -1),
            y: randint(-5, pointDePassage1.y - 1),
          }
        }
        pointsDePassage = [pointDePassage1, pointDePassage2]
        a =
          (pointDePassage2.y - pointDePassage1.y) /
          (pointDePassage2.x - pointDePassage1.x)
        const b = pointDePassage1.y - a * pointDePassage1.x
        f = (x) => a * x + b
        texteCorr = ''
        const choixPoint = choice([pointDePassage1, pointDePassage2])

        texteCorr = `L'antécédent de $${choixPoint.y}$ est $${miseEnEvidence(choixPoint.x)}$, on note $f(${choixPoint.x})=${choixPoint.y}$.<br>`
        imageChoisie = choixPoint.y
        reponses = [choixPoint.x]
      } else if (nbAnt === 2) {
        const racine1DuTrinome = randint(-5, 5)
        const racine2DuTrinome = randint(-5, 5, [
          racine1DuTrinome,
          racine1DuTrinome - 1,
          racine1DuTrinome + 1,
        ])
        const deltaX = Math.abs(racine2DuTrinome - racine1DuTrinome)
        yUnite = deltaX > 3 ? 0.5 : 1
        imageChoisie =
          deltaX > 3 ? Math.floor(randint(-5, 5) / 2) * 2 : randint(-3, 3)
        const a = imageChoisie < 0 ? 1 : -1
        pointsDePassage = [
          { x: racine1DuTrinome, y: imageChoisie },
          { x: racine2DuTrinome, y: imageChoisie },
        ]
        f = (x) =>
          a * (x - racine1DuTrinome) * (x - racine2DuTrinome) + imageChoisie

        // Déterminer l'échelle Y adaptée pour que le sommet soit visible
        yMin = deltaX > 3 ? -20 : -10
        yMax = deltaX > 3 ? 20 : 10

        texteCorr = ''

        reponses = [racine1DuTrinome, racine2DuTrinome].sort((a, b) => a - b)
        texteCorr = `Les antécédents de $${imageChoisie}$ sont $${miseEnEvidence(`${reponses[0]};${reponses[1]}`)}$, on note $f(${reponses[0]})=${imageChoisie}$ et $f(${reponses[1]})=${imageChoisie}$.<br>`
      } else {
        yUnite = 1 / 3
        yMin = -30
        yMax = 30

        const racine1DeLaCubique = randint(-4, 4)
        const racine2DeLaCubique = randint(-4, 4, [
          racine1DeLaCubique,
          racine1DeLaCubique - 1,
          racine1DeLaCubique + 1,
        ])
        const racine3DeLaCubique = randint(-4, 4, [
          racine1DeLaCubique,
          racine2DeLaCubique,
          racine1DeLaCubique - 1,
          racine1DeLaCubique + 1,
          racine2DeLaCubique - 1,
          racine2DeLaCubique + 1,
        ])
        imageChoisie = randint(-4, 4) * 3
        const a = choice([-1, 1])
        pointsDePassage = [
          { x: racine1DeLaCubique, y: imageChoisie },
          { x: racine2DeLaCubique, y: imageChoisie },
          { x: racine3DeLaCubique, y: imageChoisie },
        ]
        f = (x) =>
          a *
            (x - racine1DeLaCubique) *
            (x - racine2DeLaCubique) *
            (x - racine3DeLaCubique) +
          imageChoisie
        texteCorr = ''
        reponses = [
          racine1DeLaCubique,
          racine2DeLaCubique,
          racine3DeLaCubique,
        ].sort((a, b) => a - b)
        texteCorr = `Les antécédents de $${imageChoisie}$ sont $${miseEnEvidence(`${reponses[0]};${reponses[1]};${reponses[2]}`)}$, on note $f(${reponses[0]})=${imageChoisie}$, $f(${reponses[1]})=${imageChoisie}$ et $f(${reponses[2]})=${imageChoisie}$.<br>`
      }
      texte =
        'On a tracé ci-dessous la courbe représentative de la fonction $f$.<br>'
      texte += `Résoudre par lecture graphique l'équation $f(x)=${imageChoisie}$.<br><br>`

      const r = repere({
        xMin: -10,
        xMax: 10,
        yMin,
        yMax,
        yUnite,
        yThickDistance: Math.round(1 / yUnite),
      })
      const Cf = courbe(f, { repere: r, step: 0.2, color: bleuMathalea })
      texte += mathalea2d(
        {
          xmin: -10,
          xmax: 10,
          ymin: -10,
          ymax: 10,
          scale: 0.5,
        },
        r,
        Cf,
      )
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
        {
          texteAvant: `Le ou les antécédents de $${imageChoisie}$ (séparer les nombres avec un point-virgule) :`,
        },
      )
      const horizontale = droiteHorizontaleParPoint(
        pointAbstrait(0, pointsDePassage[0].y * yUnite),
        '',
        'red',
      )
      const pointsY = pointsDePassage
        .sort((a, b) => a.x - b.x)
        .map((pt) => pointAbstrait(pt.x, pt.y * yUnite))
      texteCorr +=
        '<br>' +
        mathalea2d(
          {
            xmin: -10,
            xmax: 10,
            ymin: -10,
            ymax: 10,
            scale: 0.5,
          },
          r,
          Cf,
          horizontale,
          tracePoint(...pointsY, 'red'),
        )
      if (this.questionJamaisPosee(i, JSON.stringify(pointsDePassage))) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        handleAnswers(this, i, {
          reponse: {
            value: reponses.join(';'),
            options: { suiteDeNombres: true },
          },
        })

        i++
      }
    }
  }
}
