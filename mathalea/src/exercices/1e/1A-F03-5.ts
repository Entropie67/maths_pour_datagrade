import { courbe } from '../../lib/2d/Courbe'
import { repere } from '../../lib/2d/reperes'
import { latex2d } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  reduireAxPlusB,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const titre =
  "Reconnaître l'expression algébrique possible d'une fonction à partir de sa représentation graphique"
export const dateDePublication = '30/06/2026'
export const dateDeModifImportante = '23/10/2026'

export const uuid = '53cea'

export const refs = {
  'fr-fr': ['1A-F03-5'],
  'fr-ch': ['2mQCM-15', '11LSQCMFA2B-4'],
}

export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

type TypeCourbe = 'droite' | 'parabole' | 'hyperbole' | 'cubique'

/**
 * Reconnaître une expression algébrique possible à partir d'une droite,
 * d'une parabole, d'une hyperbole ou d'une courbe cubique.
 * @author Stéphane Guyon
 */
export default class ReconnaitreExpressionDepuisCourbeQcm extends ExerciceQcmA {
  private expressionParabole(a: number, b: number) {
    return `${rienSi1(a)}x^2${ecritureAlgebrique(b)}`
  }

  private expressionHyperbole(a: number, b: number) {
    return `\\dfrac{1}{${rienSi1(a)}x}${ecritureAlgebrique(b)}`
  }

  private expressionCubique(a: number, b: number) {
    return `${rienSi1(a)}x^3${ecritureAlgebrique(b)}`
  }

  private creerFigure(fonction: (x: number) => number, step = 0.05) {
    const xMin = -5
    const xMax = 5
    const yMin = -6
    const yMax = 6
    const r = repere({
      xMin,
      xMax,
      yMin,
      yMax,
      grilleX: true,
      grilleY: true,
      grilleSecondaire: true,
      grilleOpacite: 0.45,
      grilleSecondaireOpacite: 0.18,
      xLabelMin: xMin,
      xLabelMax: xMax,
      yLabelMin: yMin,
      yLabelMax: yMax,
      axeXStyle: '->',
      axeYStyle: '->',
    })
    const origine = latex2d('\\text{O}', -0.25, -0.35, {
      letterSize: 'scriptsize',
    })

    return mathalea2d(
      {
        xmin: xMin,
        xmax: xMax,
        ymin: yMin,
        ymax: yMax,
        pixelsParCm: 25,
        scale: 0.72,
        display: 'block',
        center: !context.isHtml,
      },
      r,
      origine,
      courbe(fonction, {
        repere: r,
        color: bleuMathalea,
        epaisseur: 2,
        xMin,
        xMax,
        yMin,
        yMax,
        step,
      }),
    )
  }

  private appliquerLesValeurs(typeCourbe: TypeCourbe, a: number, b: number) {
    let fonction: (x: number) => number
    let bonneReponse: string
    let justification: string
    const expressions = {
      droite: reduireAxPlusB(a, b),
      parabole: this.expressionParabole(a, b),
      hyperbole: this.expressionHyperbole(a, b),
      cubique: this.expressionCubique(a, b),
    }

    switch (typeCourbe) {
      case 'droite':
        fonction = (x: number) => a * x + b
        bonneReponse = expressions.droite
        justification =
          'La courbe est une droite non verticale. On élimine donc les expressions qui ne sont pas des fonctions affines.'
        break

      case 'parabole':
        fonction = (x: number) => a * x ** 2 + b
        bonneReponse = expressions.parabole
        justification =
          'La courbe est une parabole. On élimine donc les expressions qui ne sont pas du second degré.'
        break

      case 'hyperbole':
        fonction = (x: number) => 1 / (a * x) + b
        bonneReponse = expressions.hyperbole
        justification =
          'La courbe est une hyperbole. On élimine les polynômes du premier, deuxième et troisième degré.'
        break

      case 'cubique':
        fonction = (x: number) => a * x ** 3 + b
        bonneReponse = expressions.cubique
        justification =
          "La courbe n'est ni une droite, ni une parabole, ni une hyperbole. On élimine donc les expressions qui représenteraient ces trois types de courbes."
        break
    }

    const distracteurs = Object.entries(expressions)
      .filter(([type]) => type !== typeCourbe)
      .map(([, expression]) => expression)

    const figure = this.creerFigure(
      fonction,
      typeCourbe === 'hyperbole' ? 0.02 : 0.05,
    )

    this.enonce = `On a représenté ci-dessous la courbe d'une fonction $f$.<br><br>
${figure}<br><br>
La seule expression algébrique possible de $f$ est :`

    this.reponses = [
      `$f(x)=${bonneReponse}$`,
      ...distracteurs.map((distracteur) => `$f(x)=${distracteur}$`),
    ]

    this.correction = `${justification}<br>
La seule expression possible de $f$ est donc $${miseEnEvidence(`f(x)=${bonneReponse}`)}$.`
  }

  versionOriginale = () => {
    this.appliquerLesValeurs('droite', 2, -1)
  }

  versionAleatoire = () => {
    const typeCourbe = choice<TypeCourbe>([
      'droite',
      'parabole',
      'hyperbole',
      'cubique',
    ])
    const a = choice([-3, -2, 2, 3])
    const b = randint(-3, 3, 0)
    this.appliquerLesValeurs(typeCourbe, a, b)
  }

  nouvelleVersion() {
    this.sansLettreCorrection = true
    super.nouvelleVersion()
  }

  constructor() {
    super()

    this.versionAleatoire()
  }
}
