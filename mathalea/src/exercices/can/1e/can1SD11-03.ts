import { courbe } from '../../../lib/2d/Courbe'
import { repere } from '../../../lib/2d/reperes'
import { texteParPosition } from '../../../lib/2d/textes'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique, rienSi1 } from '../../../lib/outils/ecritures'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { miseEnEvidence } from '../../../lib/outils/embellissements'

export const titre = 'Lire graphiquement la valeur de $c$ dans $ax^2+c$'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '17/06/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 *
 * @author Gilles Mora

 */
export const uuid = '26b38'

export const refs = {
  'fr-fr': ['can1SD11-03'],
  'fr-ch': ['NR'],
}
export default class LectureGraphiqueParaboleB extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let texte = ''
    let texteCorr = ''
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let a = 0
      let b = 0
      let o
      let f
      let r
      switch (choice([1, 2])) {
        case 1: // cas parabole a>0
          a = randint(1, 4)
          b = randint(-3, 3, 0)
          o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)

          f = function (x: number) {
            return a * x ** 2 + b
          }
          if (b > 0) {
            r = repere({
              yUnite: 1,
              xUnite: 2,
              xMin: -3,
              yMin: -1,
              yMax: 8,
              xMax: 3,
              thickHauteur: 0.1,
              xLabelMin: -2,
              xLabelMax: 2,
              yLabelMax: 7,
              yLabelMin: 0,
              // yLabelMin: -9,
              // yLabelListe:[-8,-6,-4,-2,2,4,6,8],
              axeXStyle: '->',
              axeYStyle: '->',
            })

            f = (x: number) => a * x ** 2 + b

            texte = ` $f$ est définie par $f(x)=${rienSi1(a)}x^2+c$ .<br>
                        `
            texte +=
              `Déterminer la valeur de $c$.<br>
            
            ` +
              mathalea2d(
                {
                  xmin: -6,
                  xmax: 6,
                  ymin: -1.5,
                  ymax: 8,
                  pixelsParCm: 25,
                  scale: 0.6,
                  center: !context.isHtml,
                },
                r,
                o,
                courbe(f, { repere: r, color: bleuMathalea, epaisseur: 2 }),
              )
          } else {
            r = repere({
              yUnite: 1,
              xUnite: 2,
              xMin: -3,
              yMin: -4,
              yMax: 4,
              xMax: 3,
              thickHauteur: 0.1,
              xLabelMin: -2,
              xLabelMax: 2,
              yLabelMax: 3,
              yLabelMin: -3,
              // yLabelMin: -9,
              // yLabelListe:[-8,-6,-4,-2,2,4,6,8],
              axeXStyle: '->',
              axeYStyle: '->',
            })

            f = (x: number) => a * x ** 2 + b

            texte = `$f$ est définie par $f(x)=${rienSi1(a)}x^2+c$ .<br>
            `
            texte +=
              `Déterminer la valeur de $c$.<br>
            
            ` +
              mathalea2d(
                {
                  xmin: -6,
                  xmax: 6,
                  ymin: -4.5,
                  ymax: 4,
                  pixelsParCm: 25,
                  scale: 0.6,
                  center: !context.isHtml,
                },
                r,
                o,
                courbe(f, { repere: r, color: bleuMathalea, epaisseur: 2 }),
              )
          }
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
              {
                texteAvant: '$c=$',
              },
            )
            handleAnswers(this, i, { reponse: { value: b } })
          }

          texteCorr = `La valeur de $c$ est donnée par l'image de $0$ par la fonction $f$.<br>
          On lit $f(0)=${b}$. D'où, $c=${miseEnEvidence(b)}$.<br>
           On obtient alors $f(x)=${rienSi1(a)}x^2${ecritureAlgebrique(b)}$.<br>
          `
          break

        case 2: // cas parabole a<0
          a = randint(-4, -1)
          b = randint(-3, 3, 0)
          o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)

          f = function (x: number) {
            return a * x ** 2 + b
          }
          if (b > 0) {
            r = repere({
              yUnite: 1,
              xUnite: 2,
              xMin: -3,
              yMin: -4,
              yMax: 4,
              xMax: 3,
              thickHauteur: 0.1,
              xLabelMin: -2,
              xLabelMax: 2,
              yLabelMax: 3,
              yLabelMin: -3,
              // yLabelMin: -9,
              // yLabelListe:[-8,-6,-4,-2,2,4,6,8],
              axeXStyle: '->',
              axeYStyle: '->',
            })

            f = (x: number) => a * x ** 2 + b

            texte = `$f$ est définie par $f(x)=${rienSi1(a)}x^2+c$ .<br>
            `
            texte +=
              `Déterminer la valeur de $c$.<br>
            
            ` +
              mathalea2d(
                {
                  xmin: -6,
                  xmax: 6,
                  ymin: -4.5,
                  ymax: 4,
                  pixelsParCm: 25,
                  scale: 0.6,
                  center: !context.isHtml,
                },
                r,
                o,
                courbe(f, { repere: r, color: bleuMathalea, epaisseur: 2 }),
              )
          } else {
            r = repere({
              yUnite: 1,
              xUnite: 2,
              xMin: -3,
              yMin: -7,
              yMax: 1,
              xMax: 3,
              thickHauteur: 0.1,
              xLabelMin: -2,
              xLabelMax: 2,
              yLabelMax: 0,
              yLabelMin: -6,
              // yLabelMin: -9,
              // yLabelListe:[-8,-6,-4,-2,2,4,6,8],
              axeXStyle: '->',
              axeYStyle: '->',
            })

            f = (x: number) => a * x ** 2 + b

            texte = `$f$ est définie par $f(x)=${rienSi1(a)}x^2+c$ .<br>
            `
            texte +=
              `Déterminer la valeur de $c$.<br>
            
            ` +
              mathalea2d(
                {
                  xmin: -6,
                  xmax: 6,
                  ymin: -7.1,
                  ymax: 1,
                  pixelsParCm: 25,
                  scale: 0.6,
                  center: !context.isHtml,
                },
                r,
                o,
                courbe(f, { repere: r, color: bleuMathalea, epaisseur: 2 }),
              )
          }
          if (this.interactif) {
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBase,
              {
                texteAvant: '$c=$',
              },
            )
            handleAnswers(this, i, { reponse: { value: b } })
          }

          texteCorr = `La valeur de $c$ est donnée par l'image de $0$ par la fonction $f$.<br>
          On lit $f(0)=${b}$. D'où, $c=${miseEnEvidence(b)}$. <br>
          On obtient alors $f(x)=${rienSi1(a)}x^2${ecritureAlgebrique(b)}$.<br>
          `
          break
      }

      if (this.questionJamaisPosee(i, a, b)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
    this.listeCanEnonces.push(texte)
    this.listeCanReponsesACompleter.push('$c=\\ldots$')
  }
}
