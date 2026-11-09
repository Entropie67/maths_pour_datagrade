import { repere } from '../../../lib/2d/reperes'
import { texteParPosition } from '../../../lib/2d/textes'
import { Spline, spline } from '../../../lib/mathFonctions/Spline'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
export const dateDePublication = '12/09/2024'
export const interactifReady = true

export const titre = 'Résoudre une inéquation graphiquement'

/**
 * @author Gilles MORA
  *

*/
export const dateDeModifImportante = '02/11/2026'

export const uuid = 'cb790'

export const refs = {
  'fr-fr': ['can2F3-05', 'BP1RGEI09', '2F32-flash3', '1A-F04-8'],
  'fr-ch': ['2mIneq-2'],
}

type Noeud = {
  x: number
  y: number
  deriveeGauche: number
  deriveeDroit: number
  isVisible: boolean
}

// Déclarés au niveau du module (et non dans nouvelleVersion()) : quotaChoice()
// mémorise la valeur choisie par identité de référence pour la réutiliser sur
// les questions suivantes. Des constantes recréées à chaque appel de
// nouvelleVersion() casseraient cette comparaison (maFonction === noeuds3
// serait toujours faux dès la 2e question).
const noeuds1: Noeud[] = [
  { x: -4, y: -3, deriveeGauche: 2, deriveeDroit: 2.5, isVisible: true },
  { x: -2, y: -1, deriveeGauche: 1, deriveeDroit: 0.5, isVisible: true },
  { x: 0, y: 0, deriveeGauche: 1, deriveeDroit: 2, isVisible: true },
  { x: 1, y: 2, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
  { x: 2, y: 3, deriveeGauche: 1.5, deriveeDroit: 1, isVisible: true },
  { x: 3, y: 4, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
]

const noeuds3: Noeud[] = [
  { x: -4, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: -2, y: 0, deriveeGauche: 0.8, deriveeDroit: 1, isVisible: true },
  { x: 0, y: 2, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
  { x: 1, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: 2, y: 2, deriveeGauche: -1, deriveeDroit: -1.5, isVisible: true },
  { x: 3, y: 0, deriveeGauche: -1.5, deriveeDroit: -1, isVisible: true },
  { x: 4, y: -1, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
  { x: 5, y: -3, deriveeGauche: -1.5, deriveeDroit: -1, isVisible: true },
  { x: 6, y: -4, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
]

// f(x) = 0 a trois solutions entières : -1, 2 et 4.
const noeuds4: Noeud[] = [
  { x: -3, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: -2, y: 2, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
  { x: -1, y: 0, deriveeGauche: -2, deriveeDroit: -2, isVisible: true },
  { x: 0, y: -2, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: 1, y: -1, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
  { x: 2, y: 0, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
  { x: 3, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
  { x: 4, y: 0, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
  { x: 5, y: -2, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
  { x: 6, y: -3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
]

/**
 * Ensemble des x de l'intervalle de définition tels que f(x) symbole y, sous forme de
 * morceaux (intervalles ou singletons) en LaTeX, rangés dans l'ordre croissant.
 * Les racines (solutions de f(x) = y) découpent l'intervalle de définition en cellules
 * (alternativement un point puis un intervalle ouvert) que l'on teste une à une.
 */
function morceauxSolution(
  laSpline: Spline,
  symbole: string,
  y: number,
  racines: number[],
): string[] {
  const f = laSpline.fonction
  const strict = symbole === '<' || symbole === '>'
  const inferieur = symbole === '<' || symbole === '\\leqslant'
  const verifie = (x: number) => {
    const ecart = f(x) - y
    if (Math.abs(ecart) < 1e-9) return !strict
    return inferieur ? ecart < 0 : ecart > 0
  }
  const points = [
    ...new Set([laSpline.x[0], ...racines, laSpline.x[laSpline.n - 1]]),
  ].sort((a, b) => a - b)
  // cellule 2k : le point points[k] ; cellule 2k+1 : l'intervalle ]points[k] ; points[k+1][
  const cellules: boolean[] = []
  points.forEach((point, k) => {
    cellules.push(verifie(point))
    if (k < points.length - 1)
      cellules.push(verifie((point + points[k + 1]) / 2))
  })
  const morceaux: string[] = []
  let debut = -1
  for (let c = 0; c <= cellules.length; c++) {
    if (c < cellules.length && cellules[c]) {
      if (debut === -1) debut = c
      continue
    }
    if (debut === -1) continue
    const fin = c - 1
    if (debut === fin && debut % 2 === 0) {
      morceaux.push(`\\{${points[debut / 2]}\\}`)
    } else {
      const gauche =
        debut % 2 === 0
          ? `[${points[debut / 2]}`
          : `]${points[(debut - 1) / 2]}`
      const droite =
        fin % 2 === 0 ? `${points[fin / 2]}]` : `${points[(fin + 1) / 2]}[`
      morceaux.push(`${gauche};${droite}`)
    }
    debut = -1
  }
  return morceaux
}

function permutations<T>(liste: T[]): T[][] {
  if (liste.length <= 1) return [liste]
  return liste.flatMap((element, i) =>
    permutations([...liste.slice(0, i), ...liste.slice(i + 1)]).map((suite) => [
      element,
      ...suite,
    ]),
  )
}

export default class InequationsGSpline extends ExerciceSimple {
  spline!: Spline
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.formatChampTexte = KeyboardType.clavierEnsemble
    this.optionsDeComparaison = { texteSansCasse: true }
  }

  nouvelleVersion() {
    const maFonction: Noeud[] = this.quotaChoice('maFonction', [
      noeuds1,
      noeuds3,
      noeuds4,
    ]) //
    const mesFonctions: Noeud[][] = [maFonction]
    function aleatoiriseCourbe(listeFonctions: Noeud[][]): Noeud[] {
      const coeffX = 1 //  // symétries ou pas
      const coeffY = choice([-1, 1]) // choice([-1, 1])
      const deltaX = randint(-3, 3) //  // translations
      const deltaY = randint(-2, 2) // la valeur de y[8] sur le noeud 3 doit rester négative car elle est testée
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
    const nbAntecedentsEntiersMaximum = theSpline.nombreAntecedentsMaximum(
      bornes.yMin,
      bornes.yMax,
      true,
      true,
    )

    const nombreAntecedentCherches1 = randint(1, nbAntecedentsEntiersMaximum)
    const y1 =
      theSpline.trouveYPourNAntecedents(
        nombreAntecedentCherches1,
        maFonction === noeuds3 && theSpline.y[8] < 0
          ? bornes.yMin + 1
          : bornes.yMin,
        maFonction === noeuds3 && theSpline.y[8] > 0
          ? bornes.yMax - 1
          : bornes.yMax,
        true,
        true,
      ) || 0

    const solutions1 = theSpline.solve(y1) || []
    const symbole = this.quotaChoice('symbole', [
      '<',
      '\\leqslant',
      '>',
      '\\geqslant',
    ]) //
    const correction = `Les solutions de l'inéquation $f(x)${symbole}${y1}$ sont les abscisses respectives des points de $\\mathscr{C}_f$ 
qui se situent  ${symbole === '>' || symbole === '<' ? 'strictement' : 'sur ou '} ${symbole === '>' || symbole === '\\geqslant' ? 'au-dessus' : 'en dessous'} de la droite d'équation $y=${y1}$.<br>
On en déduit `
    const correctionBis = `Les solutions de l'inéquation $f(x)${symbole}${y1}$ sont les abscisses respectives des points de $\\mathscr{C}_f$ 
qui se situent  ${symbole === '>' || symbole === '<' ? 'strictement' : 'sur ou '} ${symbole === '>' || symbole === '\\geqslant' ? 'au-dessus' : 'en dessous'} de la droite d'équation $y=${y1}$.<br>
On en déduit `
    this.question =
      `On donne la représentation graphique d'une fonction $f$. <br>
    Résoudre l'inéquation  $f(x)${symbole}${y1}$.<br>` +
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
    if (this.interactif) {
      this.question += '$S=$ '
    }
    if (maFonction === noeuds3) {
      if (solutions1.length === 1) {
        // Cas 1 solution
        if (y1 === theSpline.y[7]) {
          // Cas solution 8ième valeur
          if (
            (symbole === '<' && theSpline.y[8] < 0) ||
            (symbole === '>' && theSpline.y[8] > 0)
          ) {
            this.reponse = `]${theSpline.x[7]};${theSpline.x[8]}]`
            this.correction = `${correction}`
            this.correction += `$S=${miseEnEvidence(this.reponse)}$.`
          }
          if (
            (symbole === '\\leqslant' && theSpline.y[8] < 0) ||
            (symbole === '\\geqslant' && theSpline.y[8] > 0)
          ) {
            this.reponse = `[${theSpline.x[7]};${theSpline.x[8]}]`
            this.correction = `${correction}`
            this.correction += `$S=${miseEnEvidence(this.reponse)}$.`
          }
          if (
            (symbole === '>' && theSpline.y[8] < 0) ||
            (symbole === '<' && theSpline.y[8] > 0)
          ) {
            this.reponse = `[${theSpline.x[0]};${theSpline.x[7]}[`
            this.correction = `${correction}`
            this.correction += `$S=${miseEnEvidence(this.reponse)}$.`
          }
          if (
            (symbole === '\\geqslant' && theSpline.y[8] < 0) ||
            (symbole === '\\leqslant' && theSpline.y[8] > 0)
          ) {
            this.reponse = `[${theSpline.x[0]};${theSpline.x[7]}]`
            this.correction = `${correction}`
            this.correction += `$S=${miseEnEvidence(this.reponse)}$.`
          }
        } else {
          // sol 4ième valeur
          if (
            (symbole === '<' && theSpline.y[8] < 0) ||
            (symbole === '>' && theSpline.y[8] > 0)
          ) {
            this.reponse = {
              reponse: {
                value: [
                  `[${theSpline.x[0]};${theSpline.x[3]}[\\cup]${theSpline.x[3]};${theSpline.x[8]}]`,
                  `]${theSpline.x[3]};${theSpline.x[8]}]\\cup[${theSpline.x[0]};${theSpline.x[3]}[`,
                ],
                options: { intervalle: true },
              },
            }
            this.correction = `${correctionBis}`
            this.correction += `$S=${miseEnEvidence(`[${theSpline.x[0]};${theSpline.x[3]}[\\cup]${theSpline.x[3]};${theSpline.x[8]}]`)}$.`
          }
          if (
            (symbole === '\\leqslant' && theSpline.y[8] < 0) ||
            (symbole === '\\geqslant' && theSpline.y[8] > 0)
          ) {
            this.reponse = `[${theSpline.x[0]};${theSpline.x[8]}]`
            this.correction = `${correction}`
            this.correction += `$S=${miseEnEvidence(this.reponse)}$.`
          }
          if (
            (symbole === '>' && theSpline.y[8] < 0) ||
            (symbole === '<' && theSpline.y[8] > 0)
          ) {
            this.reponse = '\\emptyset'
            this.correction = `${correction}`
            this.correction += `$S=${miseEnEvidence(this.reponse)}$.`
          }
          if (
            (symbole === '\\geqslant' && theSpline.y[8] < 0) ||
            (symbole === '\\leqslant' && theSpline.y[8] > 0)
          ) {
            this.reponse = `\\{${theSpline.x[3]}\\}`
            this.correction = `${correction}`
            this.correction += `$S=${miseEnEvidence(this.reponse)}$.`
          }
        }
      } else {
        // cas 2  racines
        if (y1 === theSpline.y[0]) {
          if (
            (symbole === '<' && theSpline.y[8] < 0) ||
            (symbole === '>' && theSpline.y[8] > 0)
          ) {
            this.reponse = `]${theSpline.x[6]};${theSpline.x[8]}]`
            this.correction = `${correction}`
            this.correction += `$S=${miseEnEvidence(this.reponse)}$.`
          }
          if (
            (symbole === '\\leqslant' && theSpline.y[8] < 0) ||
            (symbole === '\\geqslant' && theSpline.y[8] > 0)
          ) {
            this.reponse = {
              reponse: {
                value: [
                  `\\{${theSpline.x[0]}\\}\\cup[${theSpline.x[6]};${theSpline.x[8]}]`,
                  `[${theSpline.x[6]};${theSpline.x[8]}]\\cup\\{${theSpline.x[0]}\\}`,
                ],
                options: { intervalle: true },
              },
            }
            this.correction = `${correctionBis}`
            this.correction += `$S=${miseEnEvidence(`\\{${theSpline.x[0]}\\}\\cup[${theSpline.x[6]};${theSpline.x[8]}]`)}$.`
          }
          if (
            (symbole === '>' && theSpline.y[8] < 0) ||
            (symbole === '<' && theSpline.y[8] > 0)
          ) {
            this.reponse = `]${theSpline.x[0]};${theSpline.x[6]}[`
            this.correction = `${correction}`
            this.correction += `$S=${miseEnEvidence(this.reponse)}$.`
          }
          if (
            (symbole === '\\geqslant' && theSpline.y[8] < 0) ||
            (symbole === '\\leqslant' && theSpline.y[8] > 0)
          ) {
            this.reponse = `[${theSpline.x[0]};${theSpline.x[6]}]`
            this.correction = `${correction}`
            this.correction += `$S=${miseEnEvidence(this.reponse)}$.`
          }
        } else {
          if (
            (symbole === '<' && theSpline.y[8] < 0) ||
            (symbole === '>' && theSpline.y[8] > 0)
          ) {
            this.reponse = {
              reponse: {
                value: [
                  `[${theSpline.x[0]};${solutions1[0]}[\\cup]${solutions1[1]};${theSpline.x[8]}]`,
                  `]${solutions1[1]};${theSpline.x[8]}]\\cup [${theSpline.x[0]};${solutions1[0]}[`,
                ],
                options: { intervalle: true },
              },
            }
            this.correction = `${correctionBis}`
            this.correction += `$S=${miseEnEvidence(`[${theSpline.x[0]};${solutions1[0]}[\\cup]${solutions1[1]};${theSpline.x[8]}]`)}$.`
          }
          if (
            (symbole === '\\leqslant' && theSpline.y[8] < 0) ||
            (symbole === '\\geqslant' && theSpline.y[8] > 0)
          ) {
            this.reponse = {
              reponse: {
                value: [
                  `[${theSpline.x[0]};${solutions1[0]}]\\cup[${solutions1[1]};${theSpline.x[8]}]`,
                  `[${solutions1[1]};${theSpline.x[8]}]\\cup[${theSpline.x[0]};${solutions1[0]}]`,
                ],
                options: { intervalle: true },
              },
            }
            this.correction = `${correctionBis}`
            this.correction += `$S=${miseEnEvidence(`[${theSpline.x[0]};${solutions1[0]}]\\cup[${solutions1[1]};${theSpline.x[8]}]`)}$.`
          }
          if (
            (symbole === '>' && theSpline.y[8] < 0) ||
            (symbole === '<' && theSpline.y[8] > 0)
          ) {
            this.reponse = `]${solutions1[0]};${solutions1[1]}[`
            this.correction = `${correction}`
            this.correction += `$S=${miseEnEvidence(this.reponse)}$.`
          }
          if (
            (symbole === '\\geqslant' && theSpline.y[8] < 0) ||
            (symbole === '\\leqslant' && theSpline.y[8] > 0)
          ) {
            this.reponse = `[${solutions1[0]};${solutions1[1]}]`
            this.correction = `${correction}`
            this.correction += `$S=${miseEnEvidence(this.reponse)}$.`
          }
        }
      }
    }
    if (maFonction === noeuds4) {
      const morceaux = morceauxSolution(theSpline, symbole, y1, solutions1)
      const solution =
        morceaux.length === 0 ? '\\emptyset' : morceaux.join('\\cup')
      // L'ordre des morceaux de la réunion est libre
      this.reponse =
        morceaux.length > 1
          ? {
              reponse: {
                value: permutations(morceaux).map((ordre) =>
                  ordre.join('\\cup'),
                ),
                options: { intervalle: true },
              },
            }
          : solution
      this.correction = `${correction}$S=${miseEnEvidence(solution)}$.`
    }
    if (maFonction === noeuds1) {
      if (
        (symbole === '<' && theSpline.y[0] < 0) ||
        (symbole === '>' && theSpline.y[0] > 0)
      ) {
        this.reponse =
          y1 === theSpline.y[0]
            ? '\\emptyset'
            : `[${theSpline.x[0]};${solutions1[0]}[`
      }
      if (
        (symbole === '\\leqslant' && theSpline.y[0] < 0) ||
        (symbole === '\\geqslant' && theSpline.y[0] > 0)
      ) {
        this.reponse =
          y1 === theSpline.y[0]
            ? `\\{${theSpline.x[0]}\\}`
            : `[${theSpline.x[0]};${solutions1[0]}]`
      }
      if (
        (symbole === '>' && theSpline.y[0] < 0) ||
        (symbole === '<' && theSpline.y[0] > 0)
      ) {
        this.reponse =
          y1 === theSpline.y[5]
            ? '\\emptyset'
            : `]${solutions1[0]};${theSpline.x[5]}]`
      }
      if (
        (symbole === '\\geqslant' && theSpline.y[0] < 0) ||
        (symbole === '\\leqslant' && theSpline.y[0] > 0)
      ) {
        this.reponse =
          y1 === theSpline.y[5]
            ? `\\{${theSpline.x[5]}\\}`
            : `[${solutions1[0]};${theSpline.x[5]}]`
      }
      this.correction = `${correction}`
      this.correction += `$S=${miseEnEvidence(String(this.reponse))}$.`
    }

    this.canEnonce = this.question // 'Compléter'
    this.canReponseACompleter = ''
  }
}
