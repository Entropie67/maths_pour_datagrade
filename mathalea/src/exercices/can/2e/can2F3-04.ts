import { lectureAntecedentAnimee } from '../../../lib/2d/LectureAntecedent'
import { repere } from '../../../lib/2d/reperes'
import { latex2d } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  Spline,
  spline,
  type NoeudSpline,
} from '../../../lib/mathFonctions/Spline'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const dateDePublication = '28/07/2025'
export const interactifReady = true

export const titre =
  "Déterminer le nombre de solutions d'une équation (graphique)"

/**
 * @author Gilles Mora
 */
export const uuid = 'e59bc'

export const refs = {
  'fr-fr': ['can2F3-04', '2F32-flash2'],
  'fr-ch': [],
}
export default class EquationsGSplineNombre extends ExerciceSimple {
  compteur = 0
  spline?: Spline
  constructor() {
    super()
    this.versionQcmDisponible = true
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    const noeuds1 = [
      { x: -4, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: -3, y: 0, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: -2, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: -1, y: 0, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 0, y: -1, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 2, y: -2, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 3, y: -3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 4, y: -2, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: 5, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
    ]
    const noeuds2 = [
      { x: -4, y: 0, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: -3, y: 1, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: -2, y: 2, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: -1, y: 1, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 0, y: 0, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 2, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 3, y: 0, deriveeGauche: 2, deriveeDroit: 2, isVisible: true },
      { x: 4, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 5, y: 0, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 6, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
    ]
    const noeuds3 = [
      { x: -4, y: -3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: -3, y: -2, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: -2, y: 0, deriveeGauche: 2, deriveeDroit: 2, isVisible: true },
      { x: -1, y: 2, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: 0, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 2, y: 2, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 4, y: 0, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 5, y: 2, deriveeGauche: 2, deriveeDroit: 2, isVisible: true },
    ]
    const mesFonctions = [noeuds3, noeuds1, noeuds2] //
    function aleatoiriseCourbe(listeFonctions: NoeudSpline[][]) {
      const coeffX = choice([-1, 1]) // symétries ou pas
      const coeffY = choice([-1, 1])
      const deltaX = randint(-2, +2) // translations
      const deltaY = randint(-1, 1) // randint(-2, +2)
      const choix = choice(listeFonctions)
      return choix.map((noeud: NoeudSpline) =>
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
    const nuage = aleatoiriseCourbe(mesFonctions)
    const theSpline = spline(nuage)
    this.spline = theSpline
    const bornes = theSpline.trouveMaxes()
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
      grilleSecondaireOpacite: 1,
      axesEpaisseur: 1.5,
      grilleOpacite: 1,
      grilleSecondaireCouleur: 'black',
      grilleSecondaireYMin: bornes.yMin - 1.02,
      grilleSecondaireYMax: bornes.yMax + 1.02,
      grilleSecondaireXMin: bornes.xMin - 1.02,
      grilleSecondaireXMax: bornes.xMax + 1.02,
    })
    const courbe1 = theSpline.courbe({
      epaisseur: 1.5,
      ajouteNoeuds: true,
      optionsNoeuds: { color: 'black', taille: 1.5, style: 'x', epaisseur: 2 },
      color: bleuMathalea,
    })
    // Nom de la courbe, à droite de son extrémité
    const nomCourbe = latex2d(
      '\\mathscr{C}_f',
      theSpline.x[theSpline.n - 1] + 0.5,
      theSpline.y[theSpline.n - 1] + 0.6,
      { color: bleuMathalea },
    )
    const objetsEnonce = [repere1, courbe1, nomCourbe]
    const figureId = `lectureAntecedentsEx${this.numeroExercice ?? 0}Q${this.indexQuestionHote ?? 0}`
    const nbAntecedentsEntiersMaximum = theSpline.nombreAntecedentsMaximum(
      bornes.yMin,
      bornes.yMax,
      true,
      true,
    )

    const nombreAntecedentCherches1 = choice([
      randint(1, nbAntecedentsEntiersMaximum),
      randint(0, nbAntecedentsEntiersMaximum),
      randint(1, nbAntecedentsEntiersMaximum),
    ])
    const y1 = theSpline.trouveYPourNAntecedents(
      nombreAntecedentCherches1,
      bornes.yMin - 1,
      bornes.yMax + 1,
      true,
      true,
    )
    if (y1 === false) {
      this.compteur++
      if (this.compteur > 10) {
        window.notify(
          "Erreur dans la génération de l'exercice : y1 === false",
          {
            spline: theSpline,
            nombreAntecedentCherches1,
            nbAntecedentsEntiersMaximum,
            bornes,
          },
        )
        return
      }
      this.nouvelleVersion()
      return
    }
    this.compteur = 0
    const solutions1 = theSpline.solve(y1) ?? []
    const reponse1 = this.versionQcm
      ? `$${solutions1.length}$ ${solutions1.length === 0 || solutions1.length === 1 ? 'solution' : 'solutions'}`
      : solutions1.length
    this.reponse = reponse1
    this.question =
      "Voici la représentation graphique $\\mathscr{C}_f$ d'une fonction $f$. <br><br>"
    this.question +=
      mathalea2d(
        Object.assign(
          {
            pixelsParCm: 25,
            scale: 0.9,
            center: !context.isHtml,
            id: figureId,
          },
          {
            xmin: bornes.xMin - 1,
            ymin: bornes.yMin - 1,
            xmax: bornes.xMax + 1,
            ymax: bornes.yMax + 1,
          },
        ),
        objetsEnonce,
        o,
      ) + '<br><br>'
    this.question += this.versionQcm
      ? `L'équation $f(x)=${y1}$ possède :`
      : `Donner le nombre de solutions de l'équation $f(x)=${y1}$.`
    this.distracteurs = [
      '$0$ solution',
      '$1$ solution',
      '$2$ solutions',
      '$3$ solutions',
    ]

    this.correction = `Le nombre de solutions de l'équation $f(x)=${y1}$ est le nombre d'antécédents de $${y1}$ par la fonction $f$.<br>
      Puisque la droite d'équation $y = ${y1}$ (droite horizontale) ${solutions1.length === 0 ? 'ne coupe pas' : `coupe $${solutions1.length}$ fois`} la courbe, on en déduit que l'équation $f(x)=${y1}$ admet ${
        this.versionQcm
          ? `$${miseEnEvidence(solutions1.length)}$ ${texteEnCouleurEtGras(solutions1.length > 1 ? 'solutions' : 'solution')}`
          : `$${miseEnEvidence(solutions1.length)}$ ${solutions1.length > 1 ? 'solutions' : 'solution'}`
      }.`
    if (context.isHtml && !context.isTypst) {
      this.correction += `<br>${lectureAntecedentAnimee({
        figureId,
        x: solutions1,
        y: y1,
        pixelsParCm: 25,
      })}`
    }
  }
}
