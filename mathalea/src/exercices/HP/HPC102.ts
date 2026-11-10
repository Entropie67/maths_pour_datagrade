import { courbe } from '../../lib/2d/Courbe'
import { integrale } from '../../lib/2d/Integrale'
import { repere } from '../../lib/2d/reperes'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const titre = 'Calculer des probabilités avec la loi normale'
function erf(x: number) {
  // Constantes
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  // Sauvegarde le signe de x
  const sign = x < 0 ? -1 : 1
  x = Math.abs(x)

  // Calcul de l'approximation
  const t = 1.0 / (1.0 + p * x)
  const y =
    1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

  return sign * y
}

/**
 * Calculs de probas
 * @author Maxime Nguyen
 */

export const uuid = '89071'

export const refs = {
  'fr-fr': ['HPC102'],
  'fr-ch': [],
}
export default class CalculsLoiNormale extends Exercice {
  declare sup: number
  liste_valeurs: string[] = []

  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      2,
      '1 : Loi normale centrée réduite \n2 : Loi normale quelconque',
    ]

    this.consigne =
      "Les évaluations numériques pourront se faire à l'aide d'une table de valeur de la loi normale centrée réduite."
    this.nbQuestions = 4

    this.sup = 1

    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    this.liste_valeurs = [] // Les questions sont différentes du fait du nom de la fonction, donc on stocke les valeurs
    let listeTypeDeQuestionsDisponibles
    if (this.sup === 1) {
      listeTypeDeQuestionsDisponibles = ['N01']
    } else {
      listeTypeDeQuestionsDisponibles = ['Nmusigma', 'Nmusigmaintervallecentre']
    }

    const listeTypeDeQuestions = combinaisonListes(
      listeTypeDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (
      let i = 0,
        texte = '',
        texteCorr = '',
        variables: { a: number; b: number; mu: number; sigma: number } = {
          a: 0,
          b: 0,
          mu: 0,
          sigma: 1,
        },
        expression = '',
        gaussienne: (x: number) => number,
        r,
        C,
        I,
        graphique = '',
        resultat = 0,
        resultatA = '',
        resultatB = '',
        bornea = '',
        oppbornea = '',
        borneb = '',
        oppborneb = '',
        mu = '',
        sigma = '',
        bornec = '',
        borned = '',
        calculstep: string[] = [],
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (listeTypeDeQuestions[i]) {
        case 'N01':
          {
            const [a, b] = [
              (randint(100, 300) / 100) * choice([-1, 1]),
              (randint(100, 300) / 100) * choice([-1, 1]),
            ].sort((a, b) => a - b)
            variables = { a, b, mu: 0, sigma: 1 }

            gaussienne = (x: number) =>
              (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-(x ** 2) / 2)
            r = repere({
              xMin: -4,
              xMax: 4,
              yMin: -0.1,
              yMax: 0.51,
              xUnite: 2,
              yUnite: 6,
              axesEpaisseur: 1,
              yThickDistance: 0.5,
            })
            C = courbe(gaussienne, { repere: r, step: 0.1 })
            I = integrale(gaussienne, {
              repere: r,
              step: 0.1,
              a: variables.a,
              b: variables.b,
              hachures: 0,
            })
            graphique = mathalea2d(
              {
                xmin: -9,
                xmax: 9,
                ymin: -0.2,
                ymax: 3.5,
                pixelsParCm: 30,
                scale: 0.75,
              },
              r,
              C,
              I,
            )
            bornea = texNombre(variables.a)
            oppbornea = texNombre(-variables.a)
            borneb = texNombre(variables.b)
            oppborneb = texNombre(-variables.b)
            bornec = bornea
            borned = borneb
            resultat =
              0.5 * erf(variables.b / Math.sqrt(2)) -
              0.5 * erf(variables.a / Math.sqrt(2))
            expression = `$\\mathrm{P}(${bornea} < X < ${borneb})$`
            calculstep = []
            texte =
              'Soit $X$ une variable aléatoire réelle suivant une loi normale $\\mathcal{N}(0,1)$. <br> Calculer à $10^{-2}$ près la probabilité ' +
              expression

            texteCorr =
              'On décompose pour exprimer la probabilité avec la fonction de répartition $t \\mapsto \\mathrm{P}(X \\leqslant t)$ en utilisant la tabulation de ses valeurs pour $t \\geqslant 0$ : <br>'
            calculstep.push(
              `\\mathrm{P}(${bornea} < X < ${borneb}) &=  \\mathrm{P}(X < ${borneb}) - \\mathrm{P}(X \\leqslant ${bornea}) &&`,
            )
            if (variables.b < 0) {
              resultatB = texNombre(
                0.5 + 0.5 * erf(-variables.b / Math.sqrt(2)),
                3,
              )
              if (variables.a < 0) {
                resultatA = texNombre(
                  0.5 + 0.5 * erf(-variables.a / Math.sqrt(2)),
                  3,
                )
                calculstep.push(
                  ` &=  \\mathrm{P}(X > ${oppborneb}) - \\mathrm{P}(X \\geqslant ${oppbornea}) && (\\text{symétrie de la loi normale})`,
                )
                calculstep.push(
                  ` &=  1 - \\mathrm{P}(X \\leqslant ${oppborneb}) - (1-\\mathrm{P}(X < ${oppbornea})) && (\\text{passage au complémentaire})`,
                )
                calculstep.push(
                  ` &=  \\mathrm{P}(X < ${oppbornea}) - \\mathrm{P}(X \\leqslant ${oppborneb}) &&`,
                )
                calculstep.push(` &\\approx ${resultatA} - ${resultatB} &&`)
              } else {
                resultatA = texNombre(
                  0.5 + 0.5 * erf(variables.a / Math.sqrt(2)),
                  3,
                )
                calculstep.push(
                  ` &=  \\mathrm{P}(X > ${oppborneb}) - \\mathrm{P}(X \\leqslant ${bornea}) && (\\text{symétrie de la loi normale})`,
                )
                calculstep.push(
                  ` &=  1 - \\mathrm{P}(X \\leqslant ${oppborneb}) - \\mathrm{P}(X \\leqslant ${bornea}) && (\\text{passage au complémentaire})`,
                )
                calculstep.push(` &\\approx 1 - ${resultatB} - ${resultatA} &&`)
              }
            } else if (variables.a < 0) {
              resultatA = texNombre(
                0.5 + 0.5 * erf(-variables.a / Math.sqrt(2)),
                3,
              )
              resultatB = texNombre(
                0.5 + 0.5 * erf(variables.b / Math.sqrt(2)),
                3,
              )
              calculstep.push(
                ` &=  \\mathrm{P}(X < ${borneb}) - \\mathrm{P}(X > ${oppbornea}) && (\\text{symétrie de la loi normale})`,
              )
              calculstep.push(
                ` &=  \\mathrm{P}(X < ${borneb}) - (1 - \\mathrm{P}(X \\leqslant ${oppbornea})) && (\\text{passage au complémentaire})`,
              )
              calculstep.push(
                ` &\\approx  ${resultatB} - (1 - ${resultatA}) &&`,
              )
            } else {
              resultatA = texNombre(
                0.5 + 0.5 * erf(variables.a / Math.sqrt(2)),
                3,
              )
              resultatB = texNombre(
                0.5 + 0.5 * erf(variables.b / Math.sqrt(2)),
                3,
              )
              calculstep.push(`&\\approx  ${resultatB} - ${resultatA} &&`)
            }
            handleAnswers(
              this,
              i,
              { reponse: { value: resultat.toFixed(2) } },
              { formatInteractif: 'mathalea-mathfield' },
            )
          }
          break
        case 'Nmusigma':
          {
            let test = 0
            do {
              const [a, b] = [
                (randint(3, 25) / 10) * choice([-1, 1]),
                (randint(3, 25) / 10) * choice([-1, 1]),
              ].sort((a, b) => a - b)
              const mu = randint(-30, 30)
              const sigma = randint(1, 4)
              test = (a - b) / sigma
              variables = { a, b, mu, sigma }
            } while (test >= -1)

            gaussienne = (x: number) =>
              (1 / variables.sigma / Math.sqrt(2 * Math.PI)) *
              Math.exp(-((x - variables.mu) ** 2) / 2 / variables.sigma ** 2)
            r = repere({
              labelsYareVisible: false,
              xMin: -4 * variables.sigma + variables.mu,
              xMax: 4 * variables.sigma + variables.mu,
              yMin: -1,
              yMax: 3,
              xUnite: 2 / variables.sigma,
              yUnite: 6 * variables.sigma,
              axesEpaisseur: 1,
              xThickListe: [
                variables.a * variables.sigma + variables.mu,
                variables.mu,
                variables.b * variables.sigma + variables.mu,
              ],
              xLabelListe: [
                variables.a * variables.sigma + variables.mu,
                variables.mu,
                variables.b * variables.sigma + variables.mu,
              ],
              yThickDistance: 0.5,
              grilleXMin: variables.mu - 4 * variables.sigma,
              grilleXDistance: variables.sigma,
            })
            C = courbe(gaussienne, { repere: r, step: 0.1 })
            I = integrale(gaussienne, {
              repere: r,
              step: 0.1,
              a: variables.a * variables.sigma + variables.mu,
              b: variables.b * variables.sigma + variables.mu,
              hachures: 0,
            })
            graphique = mathalea2d(
              {
                xmin: (-4 * variables.sigma + variables.mu) * r.xUnite,
                xmax: (4 * variables.sigma + variables.mu) * r.xUnite,
                ymin: -0.8,
                ymax: 2.8,
                pixelsParCm: 30,
                scale: 0.75,
              },
              r,
              C,
              I,
            )
            bornec = texNombre(variables.a * variables.sigma + variables.mu)
            borned = texNombre(variables.b * variables.sigma + variables.mu)
            bornea = texNombre(variables.a)
            oppbornea = texNombre(-variables.a)
            borneb = texNombre(variables.b)
            oppborneb = texNombre(-variables.b)
            mu = texNombre(variables.mu)
            sigma = texNombre(variables.sigma)
            resultat =
              0.5 * erf(variables.b / Math.sqrt(2)) -
              0.5 * erf(variables.a / Math.sqrt(2))
            expression = `$\\mathrm{P}(${bornec} < X < ${borned})$`
            calculstep = []
            texte =
              `Soit $X$ une variable aléatoire réelle suivant une loi normale $\\mathcal{N}(\\mu=${mu},\\sigma=${sigma})$. <br> Calculer à $10^{-2}$ près la probabilité ` +
              expression

            if (variables.mu < 0) {
              texteCorr = `On pose $Z = \\frac{X + ${texNombre(-variables.mu)}}{${sigma}}$ `
              calculstep.push(
                `\\mathrm{P}(${bornec} < X < ${borned}) &=  \\mathrm{P}\\left(\\frac{${bornec} + ${texNombre(-variables.mu)}}{${sigma}}   < \\frac{X + ${texNombre(-variables.mu)}}{${sigma}} < \\frac{${borned} + ${texNombre(-variables.mu)}}{${sigma}}  \\right) &&`,
              )
            } else {
              texteCorr = `On pose $Z = \\frac{X - ${mu}}{${sigma}}$ `
              calculstep.push(
                `\\mathrm{P}(${bornec} < X < ${borned}) &=  \\mathrm{P}\\left(\\frac{${bornec} - ${mu}}{${sigma}}   < \\frac{X - ${mu}}{${sigma}} < \\frac{${borned} - ${mu}}{${sigma}}  \\right) &&`,
              )
            }
            texteCorr +=
              ' de telle sorte que $Z$ suive une loi $\\mathcal{N}(0,1)$. <br><br>'
            calculstep.push(
              `&= \\mathrm{P}\\left( ${bornea}   < Z < ${borneb}  \\right)`,
            )
            calculstep.push(
              `&=  \\mathrm{P}(X < ${borneb}) - \\mathrm{P}(X \\leqslant ${bornea}) &&`,
            )
            if (variables.b < 0) {
              resultatB = texNombre(
                0.5 + 0.5 * erf(-variables.b / Math.sqrt(2)),
                3,
              )
              if (variables.a < 0) {
                resultatA = texNombre(
                  0.5 + 0.5 * erf(-variables.a / Math.sqrt(2)),
                  3,
                )
                calculstep.push(
                  ` &=  \\mathrm{P}(X > ${oppborneb}) - \\mathrm{P}(X \\geqslant ${oppbornea}) && (\\text{symétrie de la loi normale})`,
                )
                calculstep.push(
                  ` &=  1 - \\mathrm{P}(X \\leqslant ${oppborneb}) - (1-\\mathrm{P}(X < ${oppbornea})) && (\\text{passage au complémentaire})`,
                )
                calculstep.push(
                  ` &=  \\mathrm{P}(X < ${oppbornea}) - \\mathrm{P}(X \\leqslant ${oppborneb}) &&`,
                )
                calculstep.push(` &\\approx ${resultatA} - ${resultatB} &&`)
              } else {
                resultatA = texNombre(
                  0.5 + 0.5 * erf(variables.a / Math.sqrt(2)),
                  3,
                )
                calculstep.push(
                  ` &=  \\mathrm{P}(X > ${oppborneb}) - \\mathrm{P}(X \\leqslant ${bornea}) && (\\text{symétrie de la loi normale})`,
                )
                calculstep.push(
                  ` &=  1 - \\mathrm{P}(X \\leqslant ${oppborneb}) - \\mathrm{P}(X \\leqslant ${bornea}) && (\\text{passage au complémentaire})`,
                )
                calculstep.push(` &\\approx 1 - ${resultatB} - ${resultatA} &&`)
              }
            } else if (variables.a < 0) {
              resultatA = texNombre(
                0.5 + 0.5 * erf(-variables.a / Math.sqrt(2)),
                3,
              )
              resultatB = texNombre(
                0.5 + 0.5 * erf(variables.b / Math.sqrt(2)),
                3,
              )
              calculstep.push(
                ` &=  \\mathrm{P}(X < ${borneb}) - \\mathrm{P}(X > ${oppbornea}) && (\\text{symétrie de la loi normale})`,
              )
              calculstep.push(
                ` &=  \\mathrm{P}(X < ${borneb}) - (1 - \\mathrm{P}(X \\leqslant ${oppbornea})) && (\\text{passage au complémentaire})`,
              )
              calculstep.push(
                ` &\\approx  ${resultatB} - (1 - ${resultatA}) &&`,
              )
            } else {
              resultatA = texNombre(
                0.5 + 0.5 * erf(variables.a / Math.sqrt(2)),
                3,
              )
              resultatB = texNombre(
                0.5 + 0.5 * erf(variables.b / Math.sqrt(2)),
                3,
              )
              calculstep.push(`&\\approx  ${resultatB} - ${resultatA} &&`)
            }
            handleAnswers(
              this,
              i,
              { reponse: { value: resultat.toFixed(2) } },
              { formatInteractif: 'mathalea-mathfield' },
            )
          }
          break
        case 'Nmusigmaintervallecentre':
          {
            const [a, mu2, sigma2] = [
              randint(5, 25) / 10,
              randint(-30, 30),
              randint(1, 4),
            ]
            variables = { a, b: a, mu: mu2, sigma: sigma2 }
            gaussienne = (x: number) =>
              (1 / variables.sigma / Math.sqrt(2 * Math.PI)) *
              Math.exp(-((x - variables.mu) ** 2) / 2 / variables.sigma ** 2)
            r = repere({
              axeYisVisible: false,
              xMin: -4 * variables.sigma + variables.mu,
              xMax: 4 * variables.sigma + variables.mu,
              yMin: -1,
              yMax: 3,
              xUnite: 2 / variables.sigma,
              yUnite: 6 * variables.sigma,
              axesEpaisseur: 1,
              xThickListe: [
                -variables.a * variables.sigma + variables.mu,
                variables.mu,
                variables.a * variables.sigma + variables.mu,
              ],
              xLabelListe: [
                -variables.a * variables.sigma + variables.mu,
                variables.mu,
                variables.a * variables.sigma + variables.mu,
              ],
              yThickDistance: 0.5,
              grilleXMin: variables.mu - 4 * variables.sigma,
              grilleXDistance: variables.sigma,
            })
            C = courbe(gaussienne, { repere: r, step: 0.1 })
            I = integrale(gaussienne, {
              repere: r,
              step: 0.1,
              a: -variables.a * variables.sigma + variables.mu,
              b: variables.a * variables.sigma + variables.mu,
              hachures: 0,
            })
            graphique = mathalea2d(
              {
                xmin: r.xUnite * (-4 * variables.sigma + variables.mu),
                xmax: (4 * variables.sigma + variables.mu) * r.xUnite,
                ymin: -0.8,
                ymax: 2.8,
                pixelsParCm: 30,
                scale: 0.75,
              },
              r,
              C,
              I,
            )
            bornec = texNombre(-variables.a * variables.sigma + variables.mu)
            borned = texNombre(variables.a * variables.sigma + variables.mu)
            bornea = texNombre(-variables.a)
            borneb = texNombre(variables.a)
            mu = texNombre(variables.mu)
            sigma = texNombre(variables.sigma)
            resultat =
              0.5 * erf(variables.a / Math.sqrt(2)) -
              0.5 * erf(-variables.a / Math.sqrt(2))
            expression = `$\\mathrm{P}(${bornec} < X < ${borned})$`
            calculstep = []
            texte =
              `Soit $X$  une variable aléatoire réelle suivant une loi normale $\\mathcal{N}(\\mu=${mu},\\sigma=${sigma})$. <br> Calculer à $10^{-2}$ près la probabilité ` +
              expression

            if (variables.mu < 0) {
              texteCorr = `On pose $Z = \\frac{X + ${texNombre(-variables.mu)}}{${sigma}}$ `
              calculstep.push(
                `\\mathrm{P}(${bornec} < X < ${borned}) &=  \\mathrm{P}\\left(\\frac{${bornec} + ${texNombre(-variables.mu)}}{${sigma}}   < \\frac{X + ${texNombre(-variables.mu)}}{${sigma}} < \\frac{${borned} + ${texNombre(-variables.mu)}}{${sigma}}  \\right) &&`,
              )
            } else {
              texteCorr = `On pose $Z = \\frac{X - ${mu}}{${sigma}}$ `
              calculstep.push(
                `\\mathrm{P}(${bornec} < X < ${borned}) &=  \\mathrm{P}\\left(\\frac{${bornec} - ${mu}}{${sigma}}   < \\frac{X - ${mu}}{${sigma}} < \\frac{${borned} - ${mu}}{${sigma}}  \\right) &&`,
              )
            }
            texteCorr +=
              ' de telle sorte que $Z$ suive une loi $\\mathcal{N}(0,1)$. <br><br>'
            calculstep.push(
              `&= \\mathrm{P}\\left( ${bornea}   < Z < ${borneb}  \\right)`,
            )
            calculstep.push(
              `&=  \\mathrm{P}(X < ${borneb}) - \\mathrm{P}(X \\leqslant ${bornea}) &&`,
            )
            resultatA = texNombre(
              0.5 + 0.5 * erf(variables.a / Math.sqrt(2)),
              3,
            )
            calculstep.push(
              ` &=  2\\times\\mathrm{P}(X < ${borneb}) - 1 && (\\text{symétrie de la loi normale})`,
            )
            calculstep.push(` &\\approx  2\\times ${resultatA} - 1 &&`)
            handleAnswers(
              this,
              i,
              { reponse: { value: resultat.toFixed(2) } },
              { formatInteractif: 'mathalea-mathfield' },
            )
          }
          break
      }
      texte += '.<br>' + graphique
      calculstep.push(`&\\approx  ${texNombre(resultat, 2)} &&`)
      texteCorr += String.raw`
      $\begin{aligned}
      ${calculstep.join('\\\\')}
      \end{aligned}$ <br>`
      texteCorr += `Et donc la probabilité $\\mathrm{P}(${bornec} < X < ${borned}) \\approx ${miseEnEvidence(texNombre(resultat, 2))}$.` //  ${resultat}$`

      texteCorr = texteCorr.replaceAll('frac', 'dfrac')
      if (this.interactif) {
        texte +=
          '<br><br>' +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
            texteAvant: `La probabilité est : $\\mathrm{P}(${bornec} < X < ${borned}) \\approx $`,
          })
      }

      if (this.questionJamaisPosee(i, bornea, borneb, bornec, borned)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.liste_valeurs.push(expression)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
