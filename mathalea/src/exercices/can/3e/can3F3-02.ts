import { courbe } from '../../../lib/2d/Courbe'
import { repere } from '../../../lib/2d/reperes'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../../lib/2d/textes'
import { bleuMathalea, vertMathalea } from '../../../lib/colors'
import { texteCentre } from '../../../lib/format/miseEnPage'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { texFractionFromString } from '../../../lib/outils/deprecatedFractions'
import { reduireAxPlusB } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Lire graphiquement une fonction affine'
export const interactifReady = true

export const dateDePublication = '25/10/2021' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora (2F10-02)
 */
export const uuid = '82f73'

export const refs = {
  'fr-fr': ['can3F3-02', 'can2F20-04', '2F21-flash2'],
  'fr-ch': [],
}
export default class LectureGraphiqueFonctionAffine1 extends ExerciceSimple {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1, 'milieu', true)
    let s1, s2
    const a = this.quotaRandint('a', -4, 4, [0])
    const b = this.quotaRandint('b', -4, 4, [0])

    const rep = repere({ xMin: -5, yMin: -5, xMax: 5, yMax: 5 })

    this.question = `$f$ est une fonction affine${this.interactif ? '.' : ' définie par $f(x)=\\ldots$'}<br><br>`
    this.question += `
    ${mathalea2d(
      {
        xmin: -5,
        ymin: -5,
        xmax: 5,
        ymax: 5,
        pixelsParCm: 20,
        scale: 0.7,
        center: !context.isHtml,
      },
      rep,
      courbe((x) => a * x + b, { repere: rep, color: bleuMathalea }),
      o,
    )}
        `
    this.optionsChampTexte = { texteAvant: '$f(x)=$' }
    this.reponse = { reponse: { value: `${reduireAxPlusB(a, b)}` } }
    this.correction = `$f$ est de la forme
    $f(x)=ax+b$ avec $a$ le coefficient directeur de la droite (inclinaison de la droite par rapport à l'horizontale)
    et $b$ l'ordonnée à l'origine (ordonnée du point d'intersection entre la droite et l'axe des ordonnées).<br>
    On a  $b=${b}$ et :`
    this.correction += texteCentre(
      `$a=\\dfrac{\\text{Dénivelé vertical}}{\\text{Déplacement horizontal}}=${texFractionFromString(miseEnEvidence(a, bleuMathalea), miseEnEvidence(1, vertMathalea))}=${a}$`,
    )
    this.correction += `On en déduit que la fonction $f$ est définie par $f(x)=${miseEnEvidence(reduireAxPlusB(a, b))}$.<br>`
    s1 = segment(0, 0, 1, 0, 'black')
    s2 = segment(0, 0, 1, 0, 'black')
    if (a > 0) {
      s1 = segment(0, b, 1, b, 'green')
      s2 = segment(1, b, 1, a + b, 'red')
    }
    if (a < 0) {
      s1 = segment(0, b, 1, b, 'green')
      s2 = segment(1, b, 1, a + b, 'red')
    }
    s2.epaisseur = 2
    s1.epaisseur = 2
    s2.styleExtremites = '->'
    s1.styleExtremites = '->'
    if (a > 0) {
      this.correction += `${mathalea2d(
        {
          xmin: -5,
          ymin: -5,
          xmax: 5,
          ymax: 5,
          pixelsParCm: 20,
          scale: 0.7,
          center: !context.isHtml,
        },
        rep,
        courbe((x) => a * x + b, { repere: rep, color: bleuMathalea }),
        o,
        s1,
        s2,
        texteParPosition('1', 0.5, b - 0.5, 0, 'green', 1, 'milieu', true),
        texteParPosition(a, 1.5, b + a / 2, 0, 'red', 1, 'milieu', true),
      )}<br>`
    }
    if (a < 0) {
      this.correction += `${mathalea2d(
        {
          xmin: -5,
          ymin: -5,
          xmax: 5,
          ymax: 5,
          pixelsParCm: 20,
          scale: 0.7,
          center: !context.isHtml,
        },
        rep,
        courbe((x) => a * x + b, { repere: rep, color: bleuMathalea }),
        o,
        s1,
        s2,
        texteParPosition('1', 0.5, b + 0.5, 0, 'green', 1, 'milieu', true),
        texteParPosition(a, 1.5, b + a / 2, 0, 'red', 1, 'milieu', true),
      )}<br>`
    }
    this.canEnonce = `$f$ est une fonction affine. <br>
    Exprimer $f(x)$ en fonction de $x$.`
    this.canEnonce += `
    ${mathalea2d(
      {
        xmin: -5,
        ymin: -5.2,
        xmax: 5,
        ymax: 5,
        pixelsParCm: 20,
        scale: 0.7,
        center: !context.isHtml,
      },
      rep,
      courbe((x) => a * x + b, { repere: rep, color: bleuMathalea }),
      o,
    )}`
    this.canReponseACompleter = '$f(x)=\\ldots$'
  }
}
