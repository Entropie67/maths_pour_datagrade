import { repere } from '../../../lib/2d/reperes'
import { texteParPosition } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { Spline, spline } from '../../../lib/mathFonctions/Spline'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const dateDePublication = '16/11/2023'
export const interactifReady = true

export const titre = 'Déterminer un extremum graphiquement'

/**
 * @author Gilles MORA
 */
export const uuid = '5a908'

export const refs = {
  'fr-fr': ['can2F4-03', 'BP1AUTO058', '2F42-flash2'],
  'fr-ch': [],
}
type Noeud = {
  x: number
  y: number
  deriveeGauche: number
  deriveeDroit: number
  isVisible: boolean
}
export default class MaxMinG extends ExerciceSimple {
  spline!: Spline
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const noeuds1: Noeud[] = [
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
    const noeuds2: Noeud[] = [
      { x: -4, y: 0, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: -3, y: 1, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: -2, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: -1, y: 1, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 0, y: 0, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 2, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 3, y: 0, deriveeGauche: 2, deriveeDroit: 2, isVisible: true },
      { x: 4, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 5, y: 0, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
      { x: 6, y: -2, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
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
    function aleatoiriseCourbe(listeFonctions: Noeud[][]): Noeud[] {
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
    let bornes: { xMin: number; xMax: number; yMin: number; yMax: number } = {
      xMin: 0,
      xMax: 0,
      yMin: 0,
      yMax: 0,
    }
    const o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
    const nuage = aleatoiriseCourbe(mesFonctions)
    const theSpline = spline(nuage)
    this.spline = theSpline
    bornes = theSpline.trouveMaxes()
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
    const solsMax = theSpline.solve(Math.max(...nuage.map((el) => el.y))) || []
    const solsMin = theSpline.solve(Math.min(...nuage.map((el) => el.y))) || []
    const choix = this.quotaChoice('choix', [true, false])
    this.reponse = choix
      ? Math.max(...nuage.map((el) => el.y))
      : Math.min(...nuage.map((el) => el.y))
    this.question =
      `On donne la représentation graphique d'une fonction $f$. <br>
    Déterminer le ${choix ? 'maximum' : 'minimum'} de $f$ sur son ensemble de définition.<br><br>` +
      mathalea2d(
        Object.assign(
          { pixelsParCm: 30, scale: 0.65, center: !context.isHtml },
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
    this.question += '<br>'
    this.correction = `Sur l'intervalle $[${theSpline.x[0]}\\,;\\,${theSpline.x[theSpline.n - 1]}]$, le point le plus ${choix ? 'haut' : 'bas'} de la courbe a pour coordonnées ${choix ? `$(${solsMax[0]}\\,;\\,${Math.max(...nuage.map((el) => el.y))})$` : `$(${solsMin[0]}\\,;\\,${Math.min(...nuage.map((el) => el.y))})$`}.<br>
    On en déduit que le ${choix ? 'maximum' : 'minimum'} de $f$ est ${choix ? `$${miseEnEvidence(`${Math.max(...nuage.map((el) => el.y))}`)}$` : `$${miseEnEvidence(`${Math.min(...nuage.map((el) => el.y))}`)}$`} . Il est atteint en 
    ${choix ? `$x=${solsMax[0]}$` : `$x=${solsMin[0]}$`}.`
    this.canEnonce =
      "On donne la représentation graphique d'une fonction $f$. <br>" +
      mathalea2d(
        Object.assign(
          { pixelsParCm: 30, scale: 0.65, center: !context.isHtml },
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
    this.canReponseACompleter = `Le ${choix ? 'maximum' : 'minimum'} de $f$ sur son ensemble de définition est : $\\ldots$.<br>`
  }
}
