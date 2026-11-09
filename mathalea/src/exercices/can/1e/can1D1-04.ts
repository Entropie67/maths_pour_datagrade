import { courbe } from '../../../lib/2d/Courbe'
import { repere } from '../../../lib/2d/reperes'
import { texteParPosition } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Lire graphiquement un nombre dérivé'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '21/06/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
// export const dateDeModifImportante = '14/02/2022' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export const uuid = '0e984'

export const refs = {
  'fr-fr': ['can1D1-04', '1Tec-D11'],
  'fr-ch': ['NR'],
}
export default class LectureGraphiqueNombreDerivee extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const listeFractions = [
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 4],
      [2, 1],
      [2, 3],
      [3, 4],
      [3, 2],
      [4, 3],
      [5, 3],
      [5, 4],
    ]
    let b: number
    let f: (x: number) => number
    let r
    let alpha: number
    let beta: number
    let a: number
    let F: (x: number) => number
    let o
    let nbre: number
    let tang
    let frac: FractionEtendue
    let valueFrac: number
    let fraction = []
    switch (this.quotaChoice('type', [1, 2, 3, 4, 5])) {
      case 1:
        a = randint(1, 2)
        nbre = randint(-1, 1)
        alpha = randint(-1, 1)
        beta = randint(-2, 2)
        o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
        f = function (x: number) {
          return 2 * a * x - 2 * a * alpha
        }
        F = function (x: number) {
          return a * (x - alpha) ** 2 + beta
        }
        r = repere({
          xMin: -4,
          xMax: 4,
          xUnite: 2,
          yMin: -3,
          yMax: 10,
          thickHauteur: 0.2,
          xLabelMin: -3,
          xLabelMax: 3,
          yLabelMax: 9,
          yLabelMin: -1,
          axeXStyle: '->',
          axeYStyle: '->',
          yLabelDistance: 2,
          yLabelEcart: 0.8,
          grilleSecondaire: true,
          grilleSecondaireYDistance: 1,
          grilleSecondaireXDistance: 1,
          grilleSecondaireYMin: -3,
          grilleSecondaireYMax: 10,
          grilleSecondaireXMin: -4,
          grilleSecondaireXMax: 4,
        })
        tang = (x: number) => f(nbre) * (x - nbre) + F(nbre)
        F = (x) => a * (x - alpha) ** 2 + beta
        this.question = `La courbe représente une fonction $f$ et la droite est la tangente au point d'abscisse $${nbre}$.<br>

        Déterminer $f'(${nbre})$.`
        this.question +=
          '<br>' +
          mathalea2d(
            {
              xmin: -8,
              xmax: 8,
              ymin: -3,
              ymax: 10,
              pixelsParCm: 14,
              scale: 0.5,
              center: !context.isHtml,
            },
            r,
            o,
            courbe(F, { repere: r, color: bleuMathalea, epaisseur: 2 }),
            courbe(tang, { repere: r, color: 'red', epaisseur: 2 }),
          )
        this.correction = `$f'(${nbre})$ est donné par le coefficient directeur de la tangente à la courbe au point d'abscisse $${nbre}$, soit $${f(nbre)}$.`

        this.reponse = f(nbre)

        this.canReponseACompleter = `$f'(${nbre})=\\ldots$`
        break

      case 2:
        a = randint(-2, -1)
        nbre = randint(-1, 1)
        alpha = randint(-1, 1)
        beta = randint(-2, 2)
        o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
        f = function (x: number) {
          return 2 * a * x - 2 * a * alpha
        }
        F = function (x: number) {
          return a * (x - alpha) ** 2 + beta
        }
        r = repere({
          xMin: -4,
          xMax: 4,
          xUnite: 2,
          yMin: -10,
          yMax: 3,
          thickHauteur: 0.2,
          xLabelMin: -3,
          xLabelMax: 3,
          yLabelMax: 2,
          yLabelMin: -9,
          yLabelEcart: 0.8,
          axeXStyle: '->',
          axeYStyle: '->',
          yLabelDistance: 2,
          grilleSecondaire: true,
          grilleSecondaireYDistance: 1,
          grilleSecondaireXDistance: 1,
          grilleSecondaireYMin: -10,
          grilleSecondaireYMax: 3,
          grilleSecondaireXMin: -4,
          grilleSecondaireXMax: 4,
        })
        tang = (x: number) => f(nbre) * (x - nbre) + F(nbre)
        F = (x) => a * (x - alpha) ** 2 + beta
        this.question = `La courbe représente une fonction $f$ et la droite est la tangente au point d'abscisse $${nbre}$.<br>
        Déterminer $f'(${nbre})$.`
        this.question +=
          '<br>' +
          mathalea2d(
            {
              xmin: -8,
              xmax: 8,
              ymin: -10,
              ymax: 3,
              pixelsParCm: 14,
              scale: 0.5,
              center: !context.isHtml,
            },
            r,
            o,
            courbe(F, { repere: r, color: bleuMathalea, epaisseur: 2 }),
            courbe(tang, { repere: r, color: 'red', epaisseur: 2 }),
          )
        this.correction = `$f'(${nbre})$ est donné par le coefficient directeur de la tangente à la courbe au point d'abscisse $${nbre}$, soit $${f(nbre)}$.`

        this.reponse = f(nbre)

        this.canReponseACompleter = `$f'(${nbre})=\\ldots$`
        break

      case 3: // a/x+b
        a = randint(1, 2)
        nbre = randint(1, 2)
        b = randint(0, 3)
        frac = new FractionEtendue(-a, nbre * nbre)
        o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
        f = function (x: number) {
          return -a / (x * x)
        }
        F = function (x: number) {
          return a / x + b
        }
        this.question = `La courbe représente une fonction $f$ et la droite est la tangente au point d'abscisse $${nbre}$.<br>
        Déterminer $f'(${nbre})$.`
        r = repere({
          xMin: -1,
          xMax: 7,
          xUnite: 2,
          yUnite: 2,
          yMin: -1,
          yMax: 6,
          thickHauteur: 0.2,
          xLabelMin: 0,
          xLabelMax: 5,
          yLabelMax: 5,
          yLabelMin: 0,
          axeXStyle: '->',
          axeYStyle: '->',
          grilleSecondaire: true,
          grilleSecondaireYDistance: 0.5,
          grilleSecondaireYMin: -1,
          grilleSecondaireYMax: 6,
          grilleSecondaireXMin: -1,
          grilleSecondaireXMax: 7,
        })
        tang = (x: number) => f(nbre) * (x - nbre) + F(nbre)
        F = (x) => a / x + b

        this.question +=
          '<br>' +
          mathalea2d(
            {
              xmin: -2,
              xmax: 14,
              ymin: -2,
              ymax: 12,
              pixelsParCm: 14,
              scale: 0.5,
              center: !context.isHtml,
            },
            r,
            o,
            courbe(F, {
              repere: r,
              xMin: 0.1,
              xMax: 7,
              color: bleuMathalea,
              epaisseur: 2,
            }),
            courbe(tang, { repere: r, color: 'red', epaisseur: 2 }),
          )

        this.correction = `$f'(${nbre})$ est donné par le coefficient directeur de la tangente à la courbe au point d'abscisse $${nbre}$, soit $${frac.texFraction}${frac.estEntiere ? '' : frac.texSimplificationAvecEtapes()}$.`
        this.reponse = frac

        this.canReponseACompleter = `$f'(${nbre})=\\ldots$`
        break

      case 4: // exp(ax) avec a>0
        fraction = choice(listeFractions)
        frac = new FractionEtendue(fraction[0], fraction[1])
        nbre = 0
        o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
        valueFrac = frac.valueOf()
        f = function (x: number) {
          return valueFrac * Math.exp(valueFrac * x)
        }
        F = function (x: number) {
          return Math.exp(valueFrac * x)
        }
        this.question = `La courbe représente une fonction $f$ et la droite est la tangente au point d'abscisse $0$.<br>
        Déterminer $f'(0)$.`
        r = repere({
          xMin: -2,
          xMax: 6,
          xUnite: 2,
          yUnite: 2,
          yMin: -1,
          yMax: 6,
          thickHauteur: 0.2,
          xLabelMin: 0,
          xLabelMax: 5,
          yLabelMax: 5,
          yLabelMin: 0,
          axeXStyle: '->',
          axeYStyle: '->',
          grilleSecondaire: true,
          grilleSecondaireYDistance: 1,
          grilleSecondaireXDistance: 1,
          grilleSecondaireYMin: -1,
          grilleSecondaireYMax: 6,
          grilleSecondaireXMin: -2,
          grilleSecondaireXMax: 6,
        })
        tang = (x: number) => f(0) * x + F(0)
        F = (x) => Math.exp(valueFrac * x)
        this.question +=
          '<br>' +
          mathalea2d(
            {
              xmin: -4,
              xmax: 12,
              ymin: -2,
              ymax: 12,
              pixelsParCm: 14,
              scale: 0.5,
              center: !context.isHtml,
            },
            r,
            o,
            courbe(F, {
              repere: r,
              xMin: -2,
              xMax: 5,
              color: bleuMathalea,
              epaisseur: 2,
            }),
            courbe(tang, { repere: r, color: 'red', epaisseur: 2 }),
          )
        this.correction = `$f'(0)$ est donné par le coefficient directeur de la tangente à la courbe au point d'abscisse $0$, soit $${frac.texFraction}${frac.estEntiere ? '' : frac.texSimplificationAvecEtapes()}$.`
        this.reponse = frac

        this.canReponseACompleter = "$f'(0)=\\ldots$"
        break

      case 5: // exp(ax) avec a<0
      default:
        fraction = choice(listeFractions)
        frac = new FractionEtendue(fraction[0] * -1, fraction[1])
        valueFrac = frac.valueOf()
        o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
        nbre = 0
        f = function (x: number) {
          return valueFrac * Math.exp(valueFrac * x)
        }
        F = function (x: number) {
          return Math.exp(valueFrac * x)
        }
        this.question = `La courbe représente une fonction $f$ et la droite est la tangente au point d'abscisse $0$.<br>
        Déterminer $f'(0)$.`
        r = repere({
          xMin: -5,
          xMax: 2,
          xUnite: 2,
          yUnite: 2,
          yMin: -1,
          yMax: 6,
          thickHauteur: 0.2,
          xLabelMin: -4,
          xLabelMax: 1,
          yLabelMax: 5,
          yLabelMin: 0,
          axeXStyle: '->',
          axeYStyle: '->',
          grilleSecondaire: true,
          grilleSecondaireYDistance: 1,
          grilleSecondaireXDistance: 1,
          grilleSecondaireYMin: -1,
          grilleSecondaireYMax: 6,
          grilleSecondaireXMin: -5,
          grilleSecondaireXMax: 2,
        })
        tang = (x: number) => f(0) * x + F(0)
        F = (x) => Math.exp(valueFrac * x)

        this.question +=
          '<br>' +
          mathalea2d(
            {
              xmin: -10,
              xmax: 4,
              ymin: -2,
              ymax: 12,
              pixelsParCm: 14,
              scale: 0.5,
              center: !context.isHtml,
            },
            r,
            o,
            courbe(F, {
              repere: r,
              xMin: -5,
              xMax: 2,
              color: bleuMathalea,
              epaisseur: 2,
            }),
            courbe(tang, { repere: r, color: 'red', epaisseur: 2 }),
          )

        this.correction = `$f'(0)$ est donné par le coefficient directeur de la tangente à la courbe au point d'abscisse $0$, soit $${frac.texFraction}${frac.estEntiere ? '' : frac.texSimplificationAvecEtapes()}$.`

        this.reponse = frac

        this.canReponseACompleter = "$f'(0)=\\ldots$"
        break
    }
    if (this.correction.includes('=')) {
      const textCorrSplit = this.correction.split('=')
      let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
      aRemplacer = aRemplacer.replaceAll('$', '')

      this.correction = ''
      for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
        this.correction += textCorrSplit[ee] + '='
      }
      this.correction += ` ${miseEnEvidence(aRemplacer.slice(0, -1))}$.`
    } else {
      const textCorrSplit = this.correction.split('soit')

      let aRemplacer = textCorrSplit[1]
      aRemplacer = aRemplacer.replaceAll('$', '')
      this.correction =
        textCorrSplit[0] +
        'soit ' +
        `$${miseEnEvidence(aRemplacer.slice(0, -1))}$.`
    }
    if (this.interactif) {
      this.question += '<br>' + `$f'(${nbre})=$`
    }
  }
}
