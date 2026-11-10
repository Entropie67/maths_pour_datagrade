import { distracteursDistincts } from '../../../lib/interactif/qcmDistractors'
import { lectureImage, lectureImageAnimee } from '../../../lib/2d/LectureImage'
import { repere } from '../../../lib/2d/reperes'
import { latex2d } from '../../../lib/2d/textes'
import { bleuMathalea, orangeMathalea } from '../../../lib/colors'
import { Spline, spline } from '../../../lib/mathFonctions/Spline'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const dateDeModifImportante = '30/10/2026'
export const interactifReady = true

export const titre = 'Lire une image graphiquement'
/**
 * @author Gilles Mora
  *

*/
export const uuid = '966a6'

export const refs = {
  'fr-fr': ['can3F1-01', 'can2F10-01', '2F12-flash1'],
  'fr-ch': ['NR'],
}
type Noeud = {
  x: number
  y: number
  deriveeGauche: number
  deriveeDroit: number
  isVisible: boolean
}
export default class ImageSpline extends ExerciceSimple {
  compteur = 0
  spline!: Spline
  constructor() {
    super()
    this.versionQcmDisponible = true
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    const noeuds1: Noeud[] = [
      { x: -4, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: -3, y: 0, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: -2, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: -1, y: 2, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 0, y: 1, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 2, y: 0, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 3, y: -2, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 4, y: 0, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: 5, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
    ]
    const noeuds2: Noeud[] = [
      { x: -4, y: 0, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: -3, y: 2, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: -2, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: -1, y: 2, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 0, y: 0, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 2, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 3, y: 0, deriveeGauche: 2, deriveeDroit: 2, isVisible: true },
      { x: 4, y: 2, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: 5, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
    ]
    const mesFonctions = [noeuds1, noeuds2]
    function aleatoiriseCourbe(listeFonctions: Noeud[][]) {
      const coeffX = choice([-1, 1]) // symétries ou pas
      const coeffY = choice([-1, 1])
      const deltaX = randint(-2, +2) // translations
      const deltaY = randint(-1, 1) // randint(-2, +2)
      const choix = choice(listeFonctions)
      return choix.map((noeud) =>
        Object({
          x: (noeud.x + deltaX) * coeffX,
          y: (noeud.y + deltaY) * coeffY,
          deriveeGauche: noeud.deriveeGauche * coeffX * coeffY,
          deriveeDroit: noeud.deriveeDroit * coeffX * coeffY,
          isVisible: noeud.isVisible,
        }),
      )
    }
    let bornes = { xMin: 0, xMax: 0, yMin: 0, yMax: 0 }
    const o = latex2d('\\text{O}', -0.3, -0.3, { letterSize: 'scriptsize' })
    const nuage = aleatoiriseCourbe(mesFonctions)
    const theSpline = spline(nuage)
    this.spline = theSpline
    // Le distracteur "piège de l'antécédent" propose l'abscisse à la place de l'image
    // (erreur classique de lecture). Si les deux coïncident pour un nœud, ce piège devient
    // la bonne réponse : on évite donc ces nœuds, sauf si aucun ne convient.
    const indicesAvecPiegeInvalide = theSpline.x
      .map((x, i) => (x === theSpline.y[i] ? i : -1))
      .filter((i) => i !== -1)
    const indicesAEviter =
      indicesAvecPiegeInvalide.length === theSpline.x.length
        ? []
        : indicesAvecPiegeInvalide
    const antecedent = this.quotaRandint(
      'antecedent',
      0,
      theSpline.x.length - 1,
      indicesAEviter,
    )
    bornes = theSpline.trouveMaxes()
    const repere1 = repere({
      xMin: bornes.xMin - 1,
      xMax: bornes.xMax + 1,
      yMin: bornes.yMin - 1,
      yMax: bornes.yMax + 1,
      grilleX: false,
      grilleY: false,
      xThickMin: bornes.xMin - 1,
      yThickMin: bornes.yMin - 1,
      yThickMax: bornes.yMax + 1,
      xLabelMin: bornes.xMin,
      yLabelMin: bornes.yMin,
      yLabelMax: bornes.yMax,
      xLabelMax: bornes.xMax,
      xThickMax: bornes.xMax + 1,
      grilleSecondaire: true,
      grilleSecondaireYDistance: 1,
      grilleSecondaireXDistance: 1,
      grilleSecondaireOpacite: 0.5,
      axesEpaisseur: 1.5,
      grilleOpacite: 1,
      grilleSecondaireYMin: bornes.yMin - 1.02,
      grilleSecondaireYMax: bornes.yMax + 1.02,
      grilleSecondaireXMin: bornes.xMin - 1.02,
      grilleSecondaireXMax: bornes.xMax + 1.02,
    })
    const courbe1 = theSpline.courbe({
      epaisseur: 1.5,
      ajouteNoeuds: true,
      optionsNoeuds: {
        color: bleuMathalea,
        taille: 2,
        style: 'x',
        epaisseur: 2,
      },
      color: bleuMathalea,
    })
    const objetsEnonce = [repere1, courbe1]
    const figureOptions = Object.assign(
      { pixelsParCm: 30, scale: 0.7, center: !context.isHtml },
      {
        xmin: bornes.xMin - 1,
        ymin: bornes.yMin - 1,
        xmax: bornes.xMax + 1,
        ymax: bornes.yMax + 1,
      },
    )

    this.reponse = this.versionQcm
      ? `est $${theSpline.y[antecedent]}$`
      : theSpline.y[antecedent]
    this.distracteurs = [
      `est $${theSpline.x[antecedent]}$`,
      `n'existe pas`,
      `est $${theSpline.y[0]}$`,
      `est $${antecedent}$`,
      `est $${theSpline.x[antecedent]}$`,
    ]
    if (this.versionQcm) {
      this.question =
        mathalea2d(figureOptions, objetsEnonce, o) +
        '<br>' +
        `L'image de $${theSpline.x[antecedent]}$ : `
    } else {
      this.question =
        `Quelle est l'image de $${theSpline.x[antecedent]}$ ?<br><br>
    ` +
        mathalea2d(figureOptions, objetsEnonce, o) +
        '<br>'
    }
    const questionId = this.compteur++
    const correctionFigureId = `can3F01CorrectionEx${this.numeroExercice ?? 0}Q${questionId}`
    const objetsCorrection = [
      repere1,
      courbe1,
      lectureImage(
        theSpline.x[antecedent],
        theSpline.y[antecedent],
        1,
        1,
        orangeMathalea,
        '',
        `${theSpline.y[antecedent]}`,
      ),
    ]
    const correctionFigure =
      !context.isHtml || context.isTypst
        ? mathalea2d(figureOptions, objetsCorrection, o)
        : `<div style="display: flex; align-items: center; justify-content: center; gap: 0.75rem; flex-wrap: wrap;">${mathalea2d(
            Object.assign({ id: correctionFigureId }, figureOptions, {
              center: false,
            }),
            objetsEnonce,
            o,
          )}${lectureImageAnimee({
            figureId: correctionFigureId,
            x: theSpline.x[antecedent],
            y: theSpline.y[antecedent],
            pixelsParCm: figureOptions.pixelsParCm,
            couleurHorizontale: orangeMathalea,
          })}</div>`
    this.correction = `Pour lire l'image de $${theSpline.x[antecedent]}$, on place la valeur de $${theSpline.x[antecedent]}$ sur l'axe des abscisses (axe de lecture des antécédents) et on lit
    son image sur l'axe des ordonnées (axe de lecture des images). On obtient : $f(${theSpline.x[antecedent]})=${miseEnEvidence(theSpline.y[antecedent])}$.<br>${correctionFigure}`
    if (this.versionQcm) {
      // Secours : Inverser le signe ou décaler la lecture d’une graduation.
      this.distracteurs = distracteursDistincts(
        String(this.reponse),
        this.distracteurs,
        [
          -theSpline.y[antecedent],
          theSpline.y[antecedent] + 1,
          theSpline.y[antecedent] - 1,
        ].map((n) => `est $${n}$`),
        Math.max(3, this.distracteurs.length),
      )
    }
  }
}
