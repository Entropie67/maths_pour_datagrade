/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/view/viewcan.2024.2e.test.ts ⚠️
 */

import { repere } from '../../../lib/2d/reperes'
import { texteParPosition } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { texteGras } from '../../../lib/format/style'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  Spline,
  spline,
  type NoeudSpline,
} from '../../../lib/mathFonctions/Spline'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  "Déterminer le nombre de solutions d'une équation graphiquement"
export const interactifReady = true

export const uuid = '27a60'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  spline?: Spline
  constructor() {
    super()

    this.canOfficielle = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    function aleatoiriseCourbe1(listeFonctions: NoeudSpline[][]) {
      const choix = choice(listeFonctions)
      return choix.map((noeud) =>
        Object({
          x: noeud.x,
          y: noeud.y,
          deriveeGauche: noeud.deriveeGauche,
          deriveeDroit: noeud.deriveeDroit,
          isVisible: noeud.isVisible,
        }),
      )
    }
    function aleatoiriseCourbe2(listeFonctions: NoeudSpline[][]) {
      const coeffX = choice([-1, 1]) // choice([-1, 1]) // symétries ou pas
      const coeffY = choice([-1, 1]) // choice([-1, 1])
      const deltaX = randint(-2, +2) // randint(-2, +2) // translations
      const deltaY = 0 // randint(-1, 1)// randint(-2, +2)
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

    if (this.canOfficielle) {
      const noeuds2 = [
        { x: -6, y: -0.5, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
        {
          x: -5,
          y: 0,
          deriveeGauche: 0.5,
          deriveeDroit: 0.5,
          isVisible: false,
        },
        {
          x: -3,
          y: 2,
          deriveeGauche: 1.5,
          deriveeDroit: 1.5,
          isVisible: false,
        },
        { x: -2, y: 5, deriveeGauche: 0, deriveeDroit: -0.5, isVisible: false },
        { x: 0, y: 3, deriveeGauche: -1, deriveeDroit: -1, isVisible: false },
        { x: 1, y: 2, deriveeGauche: -1, deriveeDroit: -1, isVisible: false },
        { x: 2, y: 0, deriveeGauche: -1, deriveeDroit: -1, isVisible: false },
        {
          x: 4,
          y: -1,
          deriveeGauche: -0.7,
          deriveeDroit: -0.8,
          isVisible: false,
        },
        { x: 6, y: -2, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      ]

      const o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
      const maFonction = [noeuds2]
      const nuage = aleatoiriseCourbe1(maFonction)
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
        grilleSecondaire: true,
        grilleSecondaireYDistance: 1,
        grilleSecondaireXDistance: 1,
        grilleSecondaireYMin: bornes.yMin - 1,
        grilleSecondaireYMax: bornes.yMax + 1,
        grilleSecondaireXMin: bornes.xMin - 1,
        grilleSecondaireXMax: bornes.xMax + 1,
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

      const a = randint(-3, 4)
      if (!context.isHtml) {
        this.question = `Les questions ${texteGras(28)} à ${texteGras(30)} utilisent le  graphique d’une fonction $f$ tracée ci-dessous : <br>
     `
      } else {
        this.question = 'On donne le  graphique d’une fonction $f$ : <br>'
      }

      this.question += mathalea2d(
        Object.assign(
          { pixelsParCm: 30, scale: 0.55, center: !context.isHtml },
          {
            xmin: bornes.xMin - 1,
            ymin: bornes.yMin - 1,
            xmax: bornes.xMax + 1,
            ymax: bornes.yMax + 1,
          },
        ),
        objetsEnonce,
        o,
      ) // fixeBordures(objetsEnonce))
      this.question += "<br>Nombre de solutions de l'équation  $f(x)=2$<br>"
      this.correction =
        "Le nombre de solutions de l'équation $f(x)=2$ est le nombre de points d'intersection entre la droite horizontale d'équation $y=2$ et la courbe de $f$. <br>"

      this.reponse = 2
      this.correction += `La droite d'équation $y=${a}$ a un deux points d'intersection avec la courbe de $f$. <br>
      Ainsi l'équation $f(x)=2$ a $${miseEnEvidence('2')}$ solutions.`

      this.canEnonce = this.question // 'Compléter'
      this.canReponseACompleter = ''
    } else {
      const noeuds1 = [
        { x: -3, y: -1, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
        { x: -2, y: -3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
        { x: -1, y: -2, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
        { x: 0, y: 0, deriveeGauche: 2, deriveeDroit: 2, isVisible: true },
        { x: 1, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
        { x: 2, y: 2, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
        { x: 3, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      ]

      const mesFonctions = [noeuds1] // noeuds3,, noeuds2

      const o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
      const nuage = aleatoiriseCourbe2(mesFonctions)
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
        grilleSecondaire: true,
        grilleSecondaireYDistance: 1,
        grilleSecondaireXDistance: 1,
        grilleSecondaireYMin: bornes.yMin - 1,
        grilleSecondaireYMax: bornes.yMax + 1,
        grilleSecondaireXMin: bornes.xMin - 1,
        grilleSecondaireXMax: bornes.xMax + 1,
      })
      const courbe2 = theSpline.courbe({
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
      const objetsEnonce = [repere1, courbe2]

      const a = randint(-3, 4)

      this.question =
        `On donne le graphique d’une fonction $f$ : <br>
      ` +
        mathalea2d(
          Object.assign(
            { pixelsParCm: 30, scale: 0.55, center: !context.isHtml },
            {
              xmin: bornes.xMin - 1,
              ymin: bornes.yMin - 1,
              xmax: bornes.xMax + 1,
              ymax: bornes.yMax + 1,
            },
          ),
          objetsEnonce,
          o,
        ) // fixeBordures(objetsEnonce))
      this.question += `<br>Donner le nombre de solutions de l'équation  $f(x)=${a}$.<br>`
      this.correction = `Le nombre de solutions de l'équation $f(x)=${a}$ est le nombre de points d'intersection entre la droite d'équation $y=${a}$ et la courbe de $f$. <br>`

      this.correction = `Le nombre de solutions de l'équation $f(x)=${a}$ est le nombre de points d'intersection entre la droite d'équation $y=${a}$ et la courbe de $f$. <br>`
      if (a === -3 || a === 3 || a === 0) {
        this.reponse = 1
        this.correction += `La droite horizontale d'équation $y=${a}$ a un seul point d'intersection avec la courbe de $f$. <br>
        Ainsi l'équation $f(x)=${a}$ a $${miseEnEvidence(1)}$ solution.`
      }
      if (a === -2 || a === -1 || a === 1 || a === 2) {
        this.reponse = 2
        this.correction += `La droite horizontale d'équation $y=${a}$ a deux points d'intersection avec la courbe de $f$. <br>
          Ainsi l'équation $f(x)=${a}$ a $${miseEnEvidence(2)}$ solutions.`
      }
      if (a === 4) {
        this.reponse = 0
        this.correction += `La droite horizontale d'équation $y=${a}$ n'a aucun point d'intersection avec la courbe de $f$. <br>
          Ainsi l'équation $f(x)=${a}$ a $${miseEnEvidence(0)}$ solution.`
      }
      this.optionsChampTexte = { texteApres: ' solution(s)' }
      this.canEnonce = this.question // 'Compléter'
      this.canReponseACompleter = '$\\ldots$ solution(s)'
    }
  }
}
