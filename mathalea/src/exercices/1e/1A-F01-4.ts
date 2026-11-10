import { repere } from '../../lib/2d/reperes'
import { latex2d } from '../../lib/2d/textes'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import {
  Spline,
  spline,
  type NoeudSpline,
} from '../../lib/mathFonctions/Spline'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'

import { lectureImage, lectureImageAnimee } from '../../lib/2d/LectureImage'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { context } from '../../modules/context'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '03/01/2026'
export const uuid = '26795'

export const refs = {
  'fr-fr': ['1A-F01-4', '2A-F1-4'],
  'fr-ch': ['10LCQCMFA2-2', '10LSQCMFA2-2', '11CTQCMFA2-2', '11LCQCMFA2A-2', '11LSQCMFA2A-2'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Calculer une somme ou différence d'images avec un graphique"
export default class AutoF01d extends ExerciceQcmA {
  compteur = 0
  spline?: Spline

  private appliquerLesValeurs(
    noeuds: NoeudSpline[],
    coeffX: number,
    abs1: number,
    abs2: number,
    estSomme: boolean,
  ): void {
    // Aléatorisation éventuelle de la courbe
    function aleatoiriseCourbe(noeudsChoisis: NoeudSpline[]) {
      const coeffY = 1
      const deltaX = 0
      const deltaY = 0

      return noeudsChoisis.map((noeud: NoeudSpline) =>
        Object({
          x: (noeud.x + deltaX) * coeffX,
          y: (noeud.y + deltaY) * coeffY,
          deriveeGauche: noeud.deriveeGauche * coeffX * coeffY,
          deriveeDroit: noeud.deriveeDroit * coeffX * coeffY,
          isVisible: noeud.isVisible,
        }),
      )
    }

    const o = latex2d('\\text{O}', -0.3, -0.3, { letterSize: 'scriptsize' })

    const nuage = aleatoiriseCourbe(noeuds)
    const theSpline = spline(nuage)
    this.spline = theSpline
    const bornes = theSpline.trouveMaxes()

    const repere1 = repere({
      xMin: bornes.xMin - 1,
      xMax: bornes.xMax + 1,
      yMin: bornes.yMin - 1,
      yMax: bornes.yMax + 1,
      grilleX: true,
      grilleY: true,
      xThickMin: bornes.xMin - 1,
      yThickMin: bornes.yMin - 1,
      yThickMax: bornes.yMax + 1,
      xLabelMin: bornes.xMin,
      yLabelMin: bornes.yMin,
      yLabelMax: bornes.yMax,
      xLabelMax: bornes.xMax,
      xThickMax: bornes.xMax + 1,
      axesEpaisseur: 1.5,
      grilleOpacite: 0.6,
      grilleSecondaire: true,
      grilleSecondaireDistance: 0.5,
      grilleSecondaireOpacite: 0.2,
      grilleYMin: bornes.yMin - 1.02,
      grilleYMax: bornes.yMax + 1.02,
      grilleXMin: bornes.xMin - 1.02,
      grilleXMax: bornes.xMax + 1.02,
    })

    const courbe1 = theSpline.courbe({
      epaisseur: 1.5,
      ajouteNoeuds: true,
      optionsNoeuds: { color: 'black', taille: 1.5, style: 'x', epaisseur: 2 },
      color: bleuMathalea,
    })

    const objetsEnonce = [repere1, courbe1, o]

    this.enonce = `On considère une fonction $f$ dont la représentation graphique est tracée ci-dessous.<br><br>`
    const optionsFigure = {
      pixelsParCm: 30,
      scale: 1,
      center: !context.isHtml,
      xmin: bornes.xMin - 1,
      ymin: bornes.yMin - 1,
      xmax: bornes.xMax + 1,
      ymax: bornes.yMax + 1,
    }
    this.enonce += mathalea2d(optionsFigure, objetsEnonce) + '<br><br>'

    const x1 = theSpline.x[abs1]
    const y1 = theSpline.y[abs1]
    const x2 = theSpline.x[abs2]
    const y2 = theSpline.y[abs2]
    const resultat = estSomme ? y1 + y2 : y1 - y2

    const operateur = estSomme ? '+' : '-'
    this.enonce += `$f(${texNombre(x1)}) ${operateur} f(${texNombre(x2)})$ est égal à :`

    // Distracteurs
    const mauvaisesReponses = [
      x1 + x2, // Erreur : somme des abscisses
      x1 - x2, // Erreur : différence des abscisses
      y1 + x2, // Erreur : mélange image et abscisse
      y2 + x1, // Erreur : mélange image et abscisse
      y1 - x2, // Erreur : mélange image et abscisse
      y2 - x1, // Erreur : mélange image et abscisse
      estSomme ? y1 - y2 : y1 + y2, // Erreur : mauvaise opération
    ]

    // Filtrer les doublons et les valeurs égales au résultat
    const mauvaisesReponsesUniques = [...new Set(mauvaisesReponses)]
      .filter((val) => val !== resultat)
      .slice(0, 3)

    // S'assurer d'avoir au moins 3 distracteurs
    while (mauvaisesReponsesUniques.length < 3) {
      const distraction = resultat + randint(-3, 3, [0])
      if (
        !mauvaisesReponsesUniques.includes(distraction) &&
        distraction !== resultat
      ) {
        mauvaisesReponsesUniques.push(distraction)
      }
    }

    this.reponses = [
      `$${texNombre(resultat)}$`, // Bonne réponse en premier
      ...mauvaisesReponsesUniques.map((val) => `$${texNombre(val)}$`), // Mauvaises réponses ensuite
    ]
    const questionId = this.compteur++
    const figureCorrectionId = `1A-F01-4-correctionEx${this.numeroExercice ?? 0}Q${questionId}`
    const objetsCorrection = [
      ...objetsEnonce,
      ...[abs1, abs2].map((abs, _index) =>
        lectureImage(
          theSpline.x[abs],
          theSpline.y[abs],
          1,
          1,
          orangeMathalea,
          '',
          `${theSpline.y[abs]}`,
        ),
      ),
    ]

    const optionsFigureCorrection = Object.assign(
      { id: figureCorrectionId },
      optionsFigure,
    )
    const correctionFigure =
      !context.isHtml || context.isTypst
        ? mathalea2d(optionsFigure, objetsCorrection)
        : `<div style="display: flex; align-items: center; justify-content: center; gap: 0.75rem; flex-wrap: wrap;">${mathalea2d(
            optionsFigureCorrection,
            objetsEnonce,
          )}${lectureImageAnimee({
            figureId: figureCorrectionId,
            x: [theSpline.x[abs1], theSpline.x[abs2]],
            y: [theSpline.y[abs1], theSpline.y[abs2]],
            pixelsParCm: optionsFigure.pixelsParCm,
            couleurHorizontale: orangeMathalea,
          })}</div>`
    this.correction = `D'après le graphique, on lit :<br>
          $f(${texNombre(x1)}) = ${texNombre(y1)}$ et
          $f(${texNombre(x2)}) = ${texNombre(y2)}$.<br>
          Donc $f(${texNombre(x1)}) ${operateur} f(${texNombre(x2)}) = ${texNombre(y1)} ${operateur} ${ecritureParentheseSiNegatif(y2)} = ${miseEnEvidence(texNombre(resultat))}$.<br>
          ${correctionFigure}`
  }

  versionOriginale: () => void = () => {
    const noeuds1: NoeudSpline[] = [
      { x: -4, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: -3, y: 0, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: -2, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: -1, y: 0, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 0, y: -1, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 1, y: -3, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 3, y: -4, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 4, y: -2, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: 5, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
    ]

    this.appliquerLesValeurs(noeuds1, 1, 2, 4, true)
  }

  versionAleatoire = () => {
    let compteur = 0
    do {
      const cas = randint(1, 2)

      const noeuds1: NoeudSpline[] = [
        { x: -4, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
        { x: -3, y: 0, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
        { x: -2, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
        { x: -1, y: 0, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
        { x: 0, y: -0.5, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
        { x: 1, y: -3, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
        { x: 3, y: -4, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
        { x: 4, y: -2, deriveeGauche: 2, deriveeDroit: 2, isVisible: true },
        { x: 5, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      ]

      const noeuds2: NoeudSpline[] = [
        { x: -6, y: 2, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
        { x: -5, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
        { x: -4, y: 2, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
        { x: -3, y: 1, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
        { x: -2, y: 0, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
        { x: 0, y: -4, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
        { x: 1, y: -2, deriveeGauche: 2, deriveeDroit: 2, isVisible: true },
        { x: 2, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
        { x: 3, y: -3, deriveeGauche: -2, deriveeDroit: -2, isVisible: true },
      ]

      const noeudsCourbe = cas === 1 ? noeuds1 : noeuds2
      const coeffX = choice([-1, 1])
      const estSomme = choice([true, false])

      // Choisir deux points distincts
      const abs1 = randint(0, noeudsCourbe.length - 1)
      let abs2 = randint(0, noeudsCourbe.length - 1)

      // S'assurer que les deux points sont différents
      while (abs2 === abs1) {
        abs2 = randint(0, noeudsCourbe.length - 1)
      }

      this.appliquerLesValeurs(noeudsCourbe, coeffX, abs1, abs2, estSomme)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
