import { courbe } from '../../lib/2d/Courbe'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latexParCoordonnees, texteParPosition } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { vide2d } from '../../lib/2d/Vide2d'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { texFractionReduite } from '../../lib/outils/deprecatedFractions'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { bleuMathalea } from '../../lib/colors'

export const titre = "Étudier graphiquement la parité d'une fonction"

/**
 * Reconnaitre la parité d'une fonction
 * @author Stéphane Guyon
 */
export const uuid = '6e82d'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class EtudierGraphiqueParite extends Exercice {
  constructor() {
    super()

    this.consigne =
      'Déterminer, par lecture graphique mais en le justifiant, si la fonction $f$ représentée est paire, impaire ou ni paire, ni impaire.'

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = [1, 2, 3, 4, 5, 6]

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texte = ''
      let texteCorr = ''
      const variables: number[] = [] // Les variables de l'énoncé
      const typesDeQuestions = listeTypeDeQuestions[i]
      const o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
      switch (typesDeQuestions) {
        case 1:
          {
            // Cas f(x)=ax+b
            const a = randint(-2, 2, [0])
            const b = randint(-2, 2, [0])
            const r = repere({
              xMin: -5,
              xMax: 5,
              yMin: -5,
              yMax: 5,
              grilleX: false,
              grilleY: false,
              grilleSecondaire: true,
              grilleSecondaireYDistance: 1,
              grilleSecondaireXDistance: 1,
              grilleSecondaireYMin: -5,
              grilleSecondaireYMax: 5,
              grilleSecondaireXMin: -5,
              grilleSecondaireXMax: 5,
            })
            const rC = repere({
              xMin: -5,
              xMax: 5,
              yMin: -7,
              yMax: 7,
              grilleX: false,
              grilleY: false,
              grilleSecondaire: true,
              grilleSecondaireYDistance: 1,
              grilleSecondaireXDistance: 1,
              grilleSecondaireYMin: -7,
              grilleSecondaireYMax: 7,
              grilleSecondaireXMin: -5,
              grilleSecondaireXMax: 5,
            })
            const x = randint(-1, 1, [0]) * 2
            const f = (x: number) => a * x + b
            const C = courbe(f, { repere: rC, step: 0.25, color: bleuMathalea })
            const B = pointAbstrait(x, a * x + b)
            const A = pointAbstrait(-x, -a * x + b)

            const lA = latexParCoordonnees(
              "M'",
              -x - 1.1,
              -a * x + b,
              'red',
              15,
              10,
              'white',
              6,
            )
            const lB = latexParCoordonnees(
              'M',
              x - 1.1,
              a * x + b,
              'red',
              15,
              10,
              'white',
              6,
            )
            // labB1 = latexParCoordonnees('f(x)', -1.5, a * x + b, 'red', 25, 10, 'white', 8)
            const traceAetB = tracePoint(A, B, 'red') // Variable qui trace les points avec une croix
            traceAetB.taille = 4
            traceAetB.epaisseur = 2

            texte = mathalea2d(
              { xmin: -5, xmax: 5, ymin: -5, ymax: 5, scale: 0.7 },
              r,
              C,
              o,
            )
            texteCorr =
              "On observe que la représentation graphique n'admet pas l'axe des ordonnées comme axe de symétrie,"
            texteCorr += " ni l'origine comme centre de symétrie.<br> "
            texteCorr += `Prenons par exemple un point $M$ de la courbe, d'abscisse $${x}$, et `
            texteCorr += ` le point $M'$ aussi de la courbe, mais d'abscisse opposée : $${-x}$. <br>`
            texteCorr += `Les coordonnées sont $M(${x};${a * x + b})$ et $M'(${-x};${-a * x + b})$. <br>`
            texteCorr +=
              'On observe bien que ces deux points ont des ordonnées ni égales, ni opposées.<br>'
            texteCorr +=
              'La fonction représentée est donc ni paire, ni impaire.<br>'

            texteCorr +=
              '<br>' +
              mathalea2d(
                { xmin: -5, xmax: 5, ymin: -7, ymax: 7, scale: 0.7 },
                rC,
                o,
                C,
                lA,
                lB,
                traceAetB,
              )
            variables.push(a, x)
          }
          break
        case 2:
          {
            // Cas f(x)=ax
            const a = randint(-2, 2, [0])
            const r = repere({
              xMin: -5,
              xMax: 5,
              yMin: -5,
              yMax: 5,
              grilleX: false,
              grilleY: false,
              grilleSecondaire: true,
              grilleSecondaireYDistance: 1,
              grilleSecondaireXDistance: 1,
              grilleSecondaireYMin: -5,
              grilleSecondaireYMax: 5,
              grilleSecondaireXMin: -5,
              grilleSecondaireXMax: 5,
            })

            const rC = repere({
              xMin: -5,
              xMax: 5,
              yMin: -7,
              yMax: 7,
              grilleX: false,
              grilleY: false,
              grilleSecondaire: true,
              grilleSecondaireYDistance: 1,
              grilleSecondaireXDistance: 1,
              grilleSecondaireYMin: -7,
              grilleSecondaireYMax: 7,
              grilleSecondaireXMin: -5,
              grilleSecondaireXMax: 5,
            })

            const x = randint(2, 3, [0])
            const f = (x: number) => a * x
            const C = courbe(f, { repere: r, step: 0.25, color: bleuMathalea })

            const B = pointAbstrait(x, a * x)
            const A = pointAbstrait(-x, -a * x)
            const labA0 = latexParCoordonnees(
              '-x',
              -x - 0.2,
              0.8 * (a > 0 ? 1 : -1),
              'red',
              20,
              10,
              'white',
              8,
            )
            const labB0 = latexParCoordonnees(
              'x',
              x,
              0.8 * (a > 0 ? -1 : 1),
              'red',
              20,
              10,
              'white',
              8,
            )
            const lA = latexParCoordonnees(
              "M'",
              -x - 1,
              -a * x,
              'red',
              15,
              10,
              'white',
              7,
            )
            const lB = latexParCoordonnees(
              'M',
              x + 1,
              a * x,
              'red',
              15,
              10,
              'white',
              7,
            )
            const labA1 = latexParCoordonnees(
              'f(-x)=-f(x)',
              3,
              6,
              'red',
              90,
              10,
              '',
              10,
            )

            const traceAetB = tracePoint(A, B, 'red') // objet qui contient les croix des points
            const s1 = segment(x, a * x, x, 0, 'red')
            const s2 = segment(-x, -a * x, -x, 0, 'red')
            const s3 = segment(-x, -a * x, 0, -a * x, 'red')
            const s4 = segment(x, a * x, 0, a * x, 'red')
            s1.pointilles = 5
            s2.pointilles = 5
            s3.pointilles = 5
            s4.pointilles = 5
            s1.epaisseur = 2
            s2.epaisseur = 2
            s3.epaisseur = 2
            s4.epaisseur = 2
            traceAetB.taille = 4
            traceAetB.epaisseur = 2

            texte = mathalea2d(
              { xmin: -5, xmax: 5, ymin: -5, ymax: 5, scale: 0.7 },
              r,
              C,
              o,
            )
            texteCorr =
              "On observe que la représentation graphique admet l'origine comme centre de symétrie.<br> "
            texteCorr +=
              "Prenons un point $M$ de la courbe, d'abscisse $x$, et "
            texteCorr +=
              "le point $M'$ aussi de la courbe, mais d'abscisse opposée : $-x$. <br>"
            texteCorr +=
              "Les coordonnées sont $M(x;f(x))$ et $M'(-x;f(-x))$. <br>"
            texteCorr +=
              'On observe bien que ces deux points qui ont des abscisses opposées, ont aussi des ordonnées opposées.<br>'
            texteCorr += 'La fonction représentée est impaire.<br>'

            texteCorr +=
              '<br>' +
              mathalea2d(
                { xmin: -5, xmax: 6, ymin: -7, ymax: 7, scale: 0.7 },
                rC,
                C,
                lA,
                lB,
                traceAetB,
                labB0,
                labA1,
                s1,
                s2,
                s3,
                s4,
                labA0,
              )
            variables.push(a, x)
          }
          break
        case 3:
          {
            // Cas f(x)=ax^2
            const a = randint(-2, 2, [0])
            let b = randint(2, 5)
            if (a > 0) {
              b = -b
            }

            const r = repere({
              xMin: -4,
              xMax: 4,
              yMin: -6,
              yMax: 6,
              xUnite: 2,
              yUnite: 1,
              grilleX: false,
              grilleY: false,
              grilleSecondaire: true,
              grilleSecondaireYDistance: 1,
              grilleSecondaireXDistance: 1,
              grilleSecondaireYMin: -6,
              grilleSecondaireYMax: 6,
              grilleSecondaireXMin: -4,
              grilleSecondaireXMax: 4,
            })

            const rC = repere({
              xMin: -4,
              xMax: 4,
              yMin: -6,
              yMax: 6,
              xUnite: 2,
              yUnite: 1,
              grilleX: false,
              grilleY: false,
              grilleSecondaire: true,
              grilleSecondaireYDistance: 1,
              grilleSecondaireXDistance: 1,
              grilleSecondaireYMin: -6,
              grilleSecondaireYMax: 6,
              grilleSecondaireXMin: -4,
              grilleSecondaireXMax: 4,
            })

            const x = 1
            const f = (x: number) => a * x * x + b
            const C = courbe(f, { repere: r, color: bleuMathalea })

            const B = pointAbstrait(2 * x, a * x * x + b)
            const A = pointAbstrait(-2 * x, a * x * x + b)
            const labA0 = latexParCoordonnees(
              '-x',
              -2 * x - 0.2,
              -1.6,
              'red',
              20,
              10,
              'white',
              8,
            )
            const labB0 = latexParCoordonnees(
              'x',
              2 * x,
              -1.6,
              'red',
              20,
              10,
              'white',
              8,
            )
            const lA = latexParCoordonnees(
              "M'",
              -2 * x - 1,
              a * x * x + b,
              'red',
              15,
              10,
              'white',
              7,
            )
            const lB = latexParCoordonnees(
              'M',
              2 * x + 1,
              a * x * x + b,
              'red',
              15,
              10,
              'white',
              7,
            )
            const labA1 = latexParCoordonnees(
              'f(-x)=f(x)',
              3.5,
              4.5,
              'red',
              80,
              10,
              '',
              14,
            )
            const traceAetB = tracePoint(A, B, 'red') // objet qui contient les croix des points
            const s1 =
              a * x * x + b === 0
                ? vide2d()
                : segment(2 * x, a * x * x + b, 2 * x, 0, 'red')
            const s2 =
              a * x * x + b === 0
                ? vide2d()
                : segment(-2 * x, a * x * x + b, -2 * x, 0, 'red')
            const s3 = segment(
              -2 * x,
              a * x * x + b,
              2 * x,
              a * x * x + b,
              'red',
            )
            s1.pointilles = 5
            s2.pointilles = 5
            s3.pointilles = 5
            s1.epaisseur = 2
            s2.epaisseur = 2
            s3.epaisseur = 2
            traceAetB.taille = 4
            traceAetB.epaisseur = 2

            texte = mathalea2d(
              { xmin: -8, xmax: 8, ymin: -6, ymax: 6, scale: 0.7 },
              r,
              C,
              o,
            )
            texteCorr =
              'On observe que la représentation graphique admet les ordonnées comme axe de symétrie.<br> '
            texteCorr +=
              "Prenons un point $M$ de la courbe, d'abscisse $x$, et "
            texteCorr +=
              "le point $M'$ aussi de la courbe, mais d'abscisse opposée : $-x$. <br>"
            texteCorr +=
              "Les coordonnées sont $M(x;f(x))$ et $M'(-x;f(-x))$. <br>"
            texteCorr +=
              'On observe bien que ces deux points qui ont des abscisses opposées, ont des ordonnées égales.<br>'
            texteCorr += 'La fonction représentée est paire.<br>'

            texteCorr +=
              '<br>' +
              mathalea2d(
                { xmin: -8, xmax: 8, ymin: -6, ymax: 6, scale: 0.7 },
                rC,
                o,
                C,
                lA,
                lB,
                traceAetB,
                labB0,
                labA1,
                labA0,
                s1,
                s2,
                s3,
              )
            variables.push(a, x)
          }
          break
        case 4:
          {
            // Cas f(x)=a(x-b)²+c
            const a = randint(-1, 1, [0]) * 0.5
            const b = randint(-3, 3, [0])
            const c = a > 0 ? -randint(1, 3) : randint(1, 3)
            const r = repere({
              xMin: -6,
              xMax: 6,
              yMin: -5,
              yMax: 5,
              xUnite: 1,
              yUnite: 1,
              grilleX: false,
              grilleY: false,
              grilleSecondaire: true,
              grilleSecondaireYDistance: 1,
              grilleSecondaireXDistance: 1,
              grilleSecondaireYMin: -5,
              grilleSecondaireYMax: 5,
              grilleSecondaireXMin: -6,
              grilleSecondaireXMax: 6,
            })

            const rC = repere({
              xMin: -6,
              xMax: 6,
              yMin: -8,
              yMax: 8,
              xUnite: 1,
              yUnite: 1,
              grilleX: false,
              grilleY: false,
              grilleSecondaire: true,
              grilleSecondaireYDistance: 1,
              grilleSecondaireXDistance: 1,
              grilleSecondaireYMin: -8,
              grilleSecondaireYMax: 8,
              grilleSecondaireXMin: -6,
              grilleSecondaireXMax: 6,
            })
            const x = 4 - Math.abs(b)
            const f = (x: number) => a * (x - b) * (x - b) + c
            const C = courbe(f, { repere: rC, step: 0.25, color: bleuMathalea })

            const B = pointAbstrait(x, a * (x - b) * (x - b) + c)
            const A = pointAbstrait(-x, a * (-x - b) * (-x - b) + c)
            const lA = latexParCoordonnees(
              "M'",
              -x - 1,
              a * (-x - b) * (-x - b) + c,
              'red',
              15,
              10,
              'white',
              7,
            )
            const lB = latexParCoordonnees(
              'M',
              x + 1,
              a * (x - b) * (x - b) + c,
              'red',
              15,
              10,
              'white',
              7,
            )
            // labA1 = latexParCoordonnees('f(-x)', 1.2, a * (x - b) * (x - b) + c, 'red', 30, 10, '', 8)
            // labB1 = latexParCoordonnees('f(x)', -2, a * (x - b) * (x - b) + c + 0.2, 'red', 25, 10, '', 8)
            const traceAetB = tracePoint(A, B, 'red') // objet qui contient les croix des points

            traceAetB.taille = 4
            traceAetB.epaisseur = 2

            texte = mathalea2d(
              { xmin: -6, xmax: 6, ymin: -5, ymax: 5, scale: 0.6 },
              r,
              C,
              o,
            )
            texteCorr =
              "On observe que la représentation graphique n'admet pas l'axe des ordonnées comme axe de symétrie,"
            texteCorr += " ni l'origine comme centre de symétrie.<br> "
            texteCorr += `Prenons par exemple un point $M$ de la courbe, d'abscisse $${x}$, et `
            texteCorr += ` le point $M'$ aussi de la courbe, mais d'abscisse opposée : $${-x}$. <br>`
            texteCorr += `Les coordonnées sont $M(${x};${a * (x - b) * (x - b) + c})$ et $M'(${-x};${a * (-x - b) * (-x - b) + c})$. <br>`
            texteCorr +=
              'On observe bien que ces deux points ont des ordonnées ni égales, ni opposées.<br>'
            texteCorr +=
              'La fonction représentée est donc ni paire, ni impaire.<br>'

            texteCorr +=
              '<br>' +
              mathalea2d(
                { xmin: -6, xmax: 6, ymin: -8, ymax: 8, scale: 0.6 },
                rC,
                o,
                C,
                lA,
                lB,
                traceAetB,
              )
            variables.push(a, b, c, x)
          }
          break
        case 5:
          {
            // Cas f(x)=1/ax+b
            const a = randint(-2, 2, [0])
            const b = randint(-3, 3, [0])
            const r = repere({
              xMin: -6,
              xMax: 6,
              yMin: -5,
              yMax: 5,
              xUnite: 1,
              yUnite: 1,
              grilleX: false,
              grilleY: false,
              grilleSecondaire: true,
              grilleSecondaireYDistance: 1,
              grilleSecondaireXDistance: 1,
              grilleSecondaireYMin: -5,
              grilleSecondaireYMax: 5,
              grilleSecondaireXMin: -6,
              grilleSecondaireXMax: 6,
            })

            const rC = repere({
              xMin: -6,
              xMax: 6,
              yMin: -5,
              yMax: 5,
              xUnite: 1,
              yUnite: 1,
              xLabelMin: 10,
              yLabelMin: 10,
              grilleX: false,
              grilleY: false,
              grilleSecondaire: true,
              grilleSecondaireYDistance: 1,
              grilleSecondaireXDistance: 1,
              grilleSecondaireYMin: -5,
              grilleSecondaireYMax: 5,
              grilleSecondaireXMin: -6,
              grilleSecondaireXMax: 6,
            })
            const x = randint(-3, 3, [-b / a, b / a, 0, 1, -1])

            const f = (x: number) => 1 / (a * x + b)
            const C = courbe(f, { repere: r, step: 0.01, color: bleuMathalea })

            const B = pointAbstrait(x, 1 / (a * x + b))
            const A = pointAbstrait(-x, 1 / (-a * x + b))
            const lA = texteParPosition(
              "$M'$",
              -x + (a > 0 ? -1 : 1),
              1 / (-a * x + b) + (a > 0 ? 0.5 : -0.5),
              0,
              'red',
              1.5,
            )
            const lB = texteParPosition(
              '$M$',
              x - (a > 0 ? -1 : 1),
              1 / (a * x + b) + (a > 0 ? 0.5 : -0.5),
              0,
              'red',
              1.5,
            )

            const traceAetB = tracePoint(A, B, 'red') // objet qui contient les croix des points

            traceAetB.taille = 4
            traceAetB.epaisseur = 2

            texte = mathalea2d(
              { xmin: -6, xmax: 6, ymin: -5, ymax: 5, scale: 0.7 },
              r,
              C,
              o,
            )
            texteCorr =
              "On observe que la représentation graphique n'admet pas l'axe des ordonnées comme axe de symétrie,"
            texteCorr += " ni l'origine comme centre de symétrie.<br> "
            texteCorr += `Prenons par exemple un point $M$ de la courbe, d'abscisse $${x}$, et `
            texteCorr += ` le point $M'$ aussi de la courbe, mais d'abscisse opposée : $${-x}$. <br>`
            texteCorr += `Les coordonnées sont $M(${x};${texFractionReduite(1, a * x + b)})$ et $M'(${-x};${texFractionReduite(1, -a * x + b)})$. <br>`
            texteCorr +=
              'On observe bien que ces deux points ont des ordonnées ni égales, ni opposées.<br>'
            texteCorr +=
              'La fonction représentée est donc ni paire, ni impaire.<br>'

            texteCorr +=
              '<br>' +
              mathalea2d(
                { xmin: -6, xmax: 6, ymin: -5, ymax: 5, scale: 0.6 },
                rC,
                o,
                C,
                lA,
                lB,
                traceAetB,
              )
            variables.push(a, b, x)
          }
          break
        case 6:
        default:
          {
            // Cas f(x)=1/ax
            const a = randint(-3, 3, [0, 1, -1])
            const r = repere({
              xMin: -4,
              xMax: 4,
              yMin: -5,
              yMax: 5,
              xUnite: 2,
              yUnite: 1,
              grilleX: false,
              grilleY: false,
              grilleSecondaire: true,
              grilleSecondaireYDistance: 1,
              grilleSecondaireXDistance: 1,
              grilleSecondaireYMin: -5,
              grilleSecondaireYMax: 5,
              grilleSecondaireXMin: -4,
              grilleSecondaireXMax: 4,
            })
            const rC = repere({
              xMin: -4,
              xMax: 4,
              yMin: -5,
              yMax: 5,
              xUnite: 2,
              yUnite: 1,
              xLabelMin: 10,
              yLabelMin: 10,
              grilleX: false,
              grilleY: false,
              grilleSecondaire: true,
              grilleSecondaireYDistance: 1,
              grilleSecondaireXDistance: 1,
              grilleSecondaireYMin: -5,
              grilleSecondaireYMax: 5,
              grilleSecondaireXMin: -4,
              grilleSecondaireXMax: 4,
            })
            const x = 2
            const f = (x: number) => 1 / (a * x)
            const C = courbe(f, { repere: r, step: 0.01, color: bleuMathalea })

            const B = pointAbstrait(2 * x, 1 / (a * x))
            const A = pointAbstrait(-2 * x, -1 / (a * x))
            const labA0 = texteParPosition(
              '$-x$',
              -2 * x - 0.2,
              -0.8,
              0,
              'red',
              1,
            )
            // labA0 = latexParCoordonnees('-x', -2*x - 0.2, -0.8, 'red', 20, 10, 'white', 8)
            const labB0 = texteParPosition(
              '$x$',
              2 * x - 0.2,
              -0.8,
              0,
              'red',
              1,
            )
            // labB0 = latexParCoordonnees('x', 2 * x, -0.8, 'red', 20, 10, 'white', 8)
            const lA = texteParPosition("$M'$", 2 * -x - 0.2, 0.5, 0, 'red', 1)
            // lA = latexParCoordonnees('M\'', 2 * (-x), -1 / (a * x), 'red', 15, 10, 'white', 7)
            const lB = texteParPosition('$M$', 2 * x - 0.2, 0.5, 0, 'red', 1)
            // lB = latexParCoordonnees('M', 2 * (x), 1 / (a * x), 'red', 15, 10, 'white', 7)
            const labA1 = latexParCoordonnees(
              'f(-x)=-f(x)',
              3,
              3,
              'red',
              80,
              10,
              '',
              14,
            )
            const traceAetB = tracePoint(A, B, 'red') // objet qui contient les croix des points
            const s3 = segment(-2 * x, -1 / (a * x), 0, 0, 'red')
            const s4 = segment(2 * x, 1 / (a * x), 0, 0, 'red')
            s3.pointilles = 5
            s4.pointilles = 5
            s3.epaisseur = 2
            s4.epaisseur = 2
            traceAetB.taille = 4
            traceAetB.epaisseur = 2

            texte = mathalea2d(
              { xmin: -8, xmax: 8, ymin: -5, ymax: 5, scale: 0.7 },
              r,
              C,
              o,
            )
            texteCorr =
              "On observe que la représentation graphique admet l'origine comme centre de symétrie.<br> "
            texteCorr +=
              "Prenons un point $M$ de la courbe, d'abscisse $x$, et "
            texteCorr +=
              "le point $M'$ aussi de la courbe, mais d'abscisse opposée : $-x$. <br>"
            texteCorr +=
              "Les coordonnées sont $M(x;f(x))$ et $M'(-x;f(-x))$. <br>"
            texteCorr +=
              'On observe bien que ces deux points qui ont des abscisses opposées, ont aussi des ordonnées opposées.<br>'
            texteCorr += 'La fonction représentée est impaire.<br>'

            texteCorr +=
              '<br>' +
              mathalea2d(
                { xmin: -8, xmax: 8, ymin: -5, ymax: 5, scale: 0.7 },
                rC,
                C,
                lA,
                lB,
                o,
                traceAetB,
                labB0,
                labA1,
                s3,
                s4,
                labA0,
              )
            variables.push(a, x)
          }
          break
      }

      if (this.questionJamaisPosee(i, variables.map(String).join(''))) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
