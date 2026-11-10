import { repere } from '../../lib/2d/reperes'
import { latex2d } from '../../lib/2d/textes'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import {
  Spline,
  spline,
  type NoeudSpline,
} from '../../lib/mathFonctions/Spline'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'

import {
  lectureAntecedent,
  lectureAntecedentAnimee,
} from '../../lib/2d/LectureAntecedent'
import { lectureImage, lectureImageAnimee } from '../../lib/2d/LectureImage'
import { bleuMathalea, orangeMathalea, vertMathalea } from '../../lib/colors'
import { context } from '../../modules/context'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '11/11/2025'
export const uuid = '3833f'

export const refs = {
  'fr-fr': ['1A-F01-3', '2A-F1-3'],
  'fr-ch': ['10LCQCMFA2-1', '10LSQCMFA2-1', '11CTQCMFA2-1', '11LCQCMFA2A-1', '11LSQCMFA2A-1'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Retrouver, graphiquement, la phrase correcte avec des images et antécédents'

/**
 *
 * @author Gilles Mora
 *
 */

export default class AutoF01c extends ExerciceQcmA {
  compteur = 0
  spline?: Spline

  private appliquerLesValeurs(
    noeuds: NoeudSpline[],
    coeffX: number,
    abs1: number,
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

    const objetsEnonce = [repere1, courbe1]

    this.enonce = `On considère une fonction $f$ dont la représentation graphique $\\mathscr{C}$ est tracée dans un repère ci-dessous.<br><br>`
    const optionsFigure = Object.assign(
      { pixelsParCm: 30, scale: 1, center: !context.isHtml },
      {
        xmin: bornes.xMin - 1,
        ymin: bornes.yMin - 1,
        xmax: bornes.xMax + 1,
        ymax: bornes.yMax + 1,
      },
    )
    const figureEnonce = mathalea2d(optionsFigure, objetsEnonce, o)
    this.enonce += figureEnonce + '<br><br>'
    this.enonce += 'Une seule affirmation est correcte. Laquelle ?'

    // Définir toutes les bonnes réponses possibles avec leur numéro d'ordre
    const bonnesReponses = [
      {
        texte: `$${texNombre(theSpline.y[abs1])}$ est l'image de $${texNombre(theSpline.x[abs1])}$.`,
        numero: 1,
        estCorrecte: true,
      },
      {
        texte: `Un antécédent de $${texNombre(theSpline.y[abs1])}$ est $${texNombre(theSpline.x[abs1])}$.`,
        numero: 2,
        estCorrecte: true,
      },
      {
        texte: `$${texNombre(theSpline.x[abs1])}$ est un antécédent de $${texNombre(theSpline.y[abs1])}$.`,
        numero: 3,
        estCorrecte: true,
      },
      {
        texte: `L'image de $${texNombre(theSpline.x[abs1])}$ est $${texNombre(theSpline.y[abs1])}$.`,
        numero: 4,
        estCorrecte: true,
      },
      {
        texte: `$${texNombre(theSpline.x[abs1])}$ a pour image $${texNombre(theSpline.y[abs1])}$.`,
        numero: 5,
        estCorrecte: true,
      },
      {
        texte: `$${texNombre(theSpline.y[abs1])}$ a pour antécédent $${texNombre(theSpline.x[abs1])}$.`,
        numero: 6,
        estCorrecte: true,
      },
    ]

    const mauvaisesReponses = [
      {
        texte: `$${texNombre(theSpline.x[abs1])}$ est l'image de $${texNombre(theSpline.y[abs1])}$.`,
        estCorrecte: false,
      },
      {
        texte: `Un antécédent de $${texNombre(theSpline.x[abs1])}$ est $${texNombre(theSpline.y[abs1])}$.`,
        estCorrecte: false,
      },
      {
        texte: `$${texNombre(theSpline.y[abs1])}$ est un antécédent de $${texNombre(theSpline.x[abs1])}$.`,
        estCorrecte: false,
      },
      {
        texte: `$${texNombre(theSpline.y[abs1])}$ a pour image $${texNombre(theSpline.x[abs1])}$.`,
        estCorrecte: false,
      },
      {
        texte: `L'image de $${texNombre(theSpline.y[abs1])}$ est $${texNombre(theSpline.x[abs1])}$.`,
        estCorrecte: false,
      },
    ]

    // Choisir une bonne réponse et 3 mauvaises réponses distinctes
    const bonneReponseChoisie = choice(bonnesReponses)
    const mauvaisesReponsesMelangees = shuffle([...mauvaisesReponses])
    const mauvaisesReponsesChoisies = mauvaisesReponsesMelangees.slice(0, 3)

    // Constituer le tableau des réponses (bonne réponse en premier)
    const toutesLesReponses = [
      bonneReponseChoisie,
      ...mauvaisesReponsesChoisies,
    ]

    // Extraire les textes pour this.reponses
    this.reponses = toutesLesReponses.map((reponse) => reponse.texte)

    // Créer la correction avec la bonne réponse en orange
    const phrases = [
      `$${texNombre(theSpline.y[abs1])}$ est l'image de $${texNombre(theSpline.x[abs1])}$`,
      `un antécédent de $${texNombre(theSpline.y[abs1])}$ est $${texNombre(theSpline.x[abs1])}$`,
      `$${texNombre(theSpline.x[abs1])}$ est un antécédent de $${texNombre(theSpline.y[abs1])}$`,
      `l'image de $${texNombre(theSpline.x[abs1])}$ est $${texNombre(theSpline.y[abs1])}$`,
      `$${texNombre(theSpline.x[abs1])}$ a pour image $${texNombre(theSpline.y[abs1])}$`,
      `$${texNombre(theSpline.y[abs1])}$ a pour antécédent $${texNombre(theSpline.x[abs1])}$`,
    ]

    const questionId = this.compteur++
    const correctionFigureId = `figureCorrection-1A-F01-3Ex${this.numeroExercice ?? 0}Q${questionId}`
    const optionsFigureCorrection = Object.assign(optionsFigure, {
      id: correctionFigureId,
    })
    this.correction = `Les images se lisent sur l'axe des ordonnées et les antécédents sur l'axe des abscisses.<br>
          Ainsi, on peut dire que ${texteEnCouleurEtGras(phrases[bonneReponseChoisie.numero - 1])}.`
    let correctionFigure = ''
    if (bonneReponseChoisie.texte.includes('image')) {
      const objetsCorrection = [
        repere1,
        courbe1,
        lectureImage(
          theSpline.x[abs1],
          theSpline.y[abs1],
          1,
          1,
          orangeMathalea,
          '',
          `${theSpline.x[abs1]}`,
        ),
      ]
      correctionFigure =
        !context.isHtml || context.isTypst
          ? mathalea2d(optionsFigureCorrection, objetsCorrection)
          : `<div style="display: flex; align-items: center; justify-content: center; gap: 0.75rem; flex-wrap: wrap;">${mathalea2d(
              Object.assign(
                { id: correctionFigureId },
                optionsFigureCorrection,
                {
                  center: false,
                },
              ),
              objetsEnonce,
              o,
            )}${lectureImageAnimee({
              figureId: correctionFigureId,
              x: theSpline.x[abs1],
              y: theSpline.y[abs1],
              pixelsParCm: optionsFigureCorrection.pixelsParCm,
              couleurHorizontale: orangeMathalea,
            })}</div>`
    } else {
      const objetsCorrection = [
        repere1,
        courbe1,
        lectureAntecedent(
          theSpline.x[abs1],
          theSpline.y[abs1],
          1,
          1,
          orangeMathalea,
          '',
          `${theSpline.y[abs1]}`,
        ),
      ]
      correctionFigure =
        !context.isHtml || context.isTypst
          ? mathalea2d(optionsFigureCorrection, objetsCorrection)
          : `<div style="display: flex; align-items: center; justify-content: center; gap: 0.75rem; flex-wrap: wrap;">${mathalea2d(
              Object.assign(
                { id: correctionFigureId },
                optionsFigureCorrection,
                {
                  center: false,
                },
              ),
              objetsEnonce,
              o,
            )}${lectureAntecedentAnimee({
              figureId: correctionFigureId,
              x: theSpline.x[abs1],
              y: theSpline.y[abs1],
              pixelsParCm: optionsFigureCorrection.pixelsParCm,
              couleurHorizontale: vertMathalea,
            })}</div>`
    }
    this.correction += correctionFigure
  }

  versionOriginale: () => void = () => {
    // Utiliser noeuds1 avec coeffX = 1 et un point spécifique (index 2: x=-2, y=1)
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

    this.appliquerLesValeurs(noeuds1, 1, 2)
  }

  versionAleatoire = () => {
    let compteur = 0
    do {
      // Générer aléatoirement les noeuds de la courbe et choisir un point spécifique
      // Choix aléatoire entre deux ensembles de nœuds
      const cas = randint(1, 2)

      const noeuds1: NoeudSpline[] = [
        { x: -4, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
        { x: -3, y: 0, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
        { x: -2, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
        { x: -1, y: 0, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
        { x: 0, y: -0.5, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
        { x: 1, y: -3, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
        { x: 3, y: -4, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
        { x: 4, y: -2, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
        { x: 5, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      ]

      const noeuds2: NoeudSpline[] = [
        { x: -6, y: 2, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
        { x: -5, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
        {
          x: -4,
          y: 2,
          deriveeGauche: -1.5,
          deriveeDroit: -1.5,
          isVisible: true,
        },
        { x: -2, y: 0, deriveeGauche: -1, deriveeDroit: -1.5, isVisible: true },
        { x: 0, y: -4, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
        { x: 1, y: -2, deriveeGauche: 1.5, deriveeDroit: 1.5, isVisible: true },
        { x: 2, y: 0, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
        { x: 3, y: -2, deriveeGauche: -2, deriveeDroit: -2, isVisible: true },
      ]

      const noeudsCourbe = cas === 1 ? noeuds1 : noeuds2
      const coeffX = choice([-1, 1])

      // Choisir un point où x ≠ y
      let abs1 = randint(0, noeudsCourbe.length - 1)
      let valeurX = noeudsCourbe[abs1].x * coeffX
      let valeurY = noeudsCourbe[abs1].y

      // Tant que x = y, chercher un autre point
      while (valeurX === valeurY) {
        abs1 = randint(0, noeudsCourbe.length - 1)
        valeurX = noeudsCourbe[abs1].x * coeffX
        valeurY = noeudsCourbe[abs1].y
      }

      this.appliquerLesValeurs(noeudsCourbe, coeffX, abs1)
      compteur++
    } while (
      compteur < 100 &&
      !aLeBonNombreDePropsDifferentes(this, 4, true) // on ne peut pas faire mieux vu les props
    ) // On s'assure d'avoir 4 réponses différentes, sinon on régénère
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.options.vertical = true
  }
}
