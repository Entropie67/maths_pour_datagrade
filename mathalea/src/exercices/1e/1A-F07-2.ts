import { courbe } from '../../lib/2d/Courbe'
import { repere } from '../../lib/2d/reperes'
import { latex2d } from '../../lib/2d/textes'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { reduireAxPlusB } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
// import ExerciceQcmA from '../../ExerciceQcmA'
import { bleuMathalea } from '../../lib/colors'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '35c0e'
export const refs = {
  'fr-fr': ['1A-F07-2'],
  'fr-ch': ['1mQCM-62', '11CTQCMFA2-9', '11LCQCMFA2C-2', '11LSQCMFA2C-2'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Retrouver la représentation graphique d'une droite"
export const dateDePublication = '02/08/2025'
//
/**
 *
 * @author Gilles Mora (exercice factorisé par Claude)
 *
 */
// Types pour une meilleure lisibilité
type FonctionLineaire = (x: number) => number
type CasEquation = {
  a: number
  b: number
  description: string
  graphiqueIndex: number
}

export default class Auto1AF6b extends ExerciceQcmA {
  // Configuration commune
  readonly configRepere = {
    xMin: -3,
    yMin: -3,
    yMax: 3,
    xMax: 3,
    xUnite: 1,
    yUnite: 1,
    axeXStyle: '->',
    axeYStyle: '->',
    grilleX: false,
    grilleY: false,
    xThickListe: [0],
    yThickListe: [0],
    xLabelListe: [-6],
    yLabelListe: [-6],
  }

  readonly configGraphique = {
    xmin: -3,
    xmax: 5,
    ymin: -3,
    ymax: 3,
    pixelsParCm: 15,
    scale: 0.5,
  }

  // Fonctions des droites
  readonly fonctions: FonctionLineaire[] = [
    (x: number) => x - 1, // a>0 et b<0
    (x: number) => -x + 1, // a<0 et b>0
    (x: number) => -x - 1, // a<0 et b<0
    (x: number) => x + 1, // a>0 et b>0
  ]

  // Génère les éléments communs (repère, origine, graphiques)
  genererElementsCommuns() {
    const r = repere(this.configRepere)
    const o = latex2d('\\text{O}', -0.3, -0.3, { letterSize: 'scriptsize' })
    const indice = shuffle([1, 2, 3, 4])

    const graphiques = this.fonctions.map((f) =>
      mathalea2d(
        this.configGraphique,
        courbe(f, {
          repere: r,
          color: bleuMathalea,
          epaisseur: 2,
        }),
        o,
        r,
      ),
    )

    return { r, o, indice, graphiques }
  }

  // Génère les réponses dans l'ordre voulu
  genererReponses(
    indice: number[],
    graphiques: string[],
    bonneReponseIndex: number,
  ): string[] {
    const reponses = graphiques.map(
      (graphique, i) => `La droite $(D_${indice[i]})$ <br>${graphique}`,
    )

    // Place la bonne réponse en premier
    const bonneReponse = reponses[bonneReponseIndex]
    const autresReponses = reponses.filter((_, i) => i !== bonneReponseIndex)

    return [bonneReponse, ...autresReponses]
  }

  // Génère la correction
  genererCorrection(
    a: number,
    b: number,
    indice: number[],
    bonneReponseIndex: number,
  ): string {
    const signeB = b > 0 ? '>' : '<'
    const signeA = a > 0 ? '>' : '<'
    const positionY = b > 0 ? 'au-dessus' : 'en dessous'
    const direction = a > 0 ? 'monte' : 'descend'

    return `On reconnaît la droite grâce à son ordonnée à l'origine ($${b}${signeB}0$) et son coefficient directeur ($${a}${signeA}0$).<br>
    Parmi ces $4$ droites, il s'agit de la droite coupant l'axe des ordonnées ${positionY} de l'axe des abscisses et qui ${direction}.<br>
    Il s'agit de la droite $${miseEnEvidence(`(D_${indice[bonneReponseIndex]})`)}$.`
  }

  // Détermine l'index du graphique correct selon les signes de a et b
  obtenirIndexGraphique(a: number, b: number): number {
    if (a > 0 && b < 0) return 0 // f1: x - 1
    if (a < 0 && b > 0) return 1 // f2: -x + 1
    if (a < 0 && b < 0) return 2 // f3: -x - 1
    if (a > 0 && b > 0) return 3 // f4: x + 1
    return 0 // fallback
  }

  // Version commune utilisée par les deux méthodes
  genererExercice(a: number, b: number): void {
    const { indice, graphiques } = this.genererElementsCommuns()
    const bonneReponseIndex = this.obtenirIndexGraphique(a, b)

    this.enonce = `La seule droite pouvant correspondre à l'équation $y=${reduireAxPlusB(a, b)}$ est  :`
    this.correction = this.genererCorrection(a, b, indice, bonneReponseIndex)
    this.reponses = this.genererReponses(indice, graphiques, bonneReponseIndex)
  }

  versionOriginale: () => void = () => {
    this.genererExercice(-2, 5)
  }

  versionAleatoire: () => void = () => {
    const cas: CasEquation[] = [
      {
        a: randint(1, 10),
        b: randint(1, 10),
        description: 'a>0, b>0',
        graphiqueIndex: 3,
      },
      {
        a: randint(1, 10),
        b: randint(-10, -1),
        description: 'a>0, b<0',
        graphiqueIndex: 0,
      },
      {
        a: randint(-10, -1),
        b: randint(1, 10),
        description: 'a<0, b>0',
        graphiqueIndex: 1,
      },
      {
        a: randint(-10, -1),
        b: randint(-10, -1),
        description: 'a<0, b<0',
        graphiqueIndex: 2,
      },
    ]

    const casChoisi = choice(cas)
    this.genererExercice(casChoisi.a, casChoisi.b)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
