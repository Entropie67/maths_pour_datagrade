// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 9bd72 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const titre =
  "Calculer le sinus, le cosinus et la tangente d'un angle (sans figure)"
export const dateDePublication = '20/06/2026'

export const uuid = '9bd72'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

type TripletPythagoricien = [
  cathete1: number,
  cathete2: number,
  hypotenuse: number,
]
type Fraction = [numerateur: number, denominateur: number]
type FonctionTrigonometrie = 'sin' | 'cos' | 'tan'

/**
 * Calculer un rapport trigonométrique dans un triangle rectangle.
 * @author Stéphane Guyon
 */
export default class RapportsTrigonometriquesQcmOld extends ExerciceQcmA {
  private fractionTex([numerateur, denominateur]: Fraction) {
    const diviseur = pgcd(numerateur, denominateur)
    return `\\dfrac{${numerateur / diviseur}}{${denominateur / diviseur}}`
  }

  private appliquerLesValeurs(
    ab: number,
    ac: number,
    bc: number,
    fonction: FonctionTrigonometrie,
  ) {
    const rapports: Record<FonctionTrigonometrie, Fraction> = {
      sin: [ac, bc],
      cos: [ab, bc],
      tan: [ac, ab],
    }
    const bonRapport = rapports[fonction]
    const autresFonctions = (['sin', 'cos', 'tan'] as const).filter(
      (autreFonction) => autreFonction !== fonction,
    )

    this.enonce = `Soit $ABC$ un triangle rectangle en $A$ tel que $AB=${ab}\\text{ cm}$, $AC=${ac}\\text{ cm}$ et $BC=${bc}\\text{ cm}$.<br>
Quelle est la valeur de $\\${fonction}(\\widehat{ABC})$ ?`

    this.reponses = [
      `$${this.fractionTex(bonRapport)}$`,
      `$${this.fractionTex(rapports[autresFonctions[0]])}$`,
      `$${this.fractionTex(rapports[autresFonctions[1]])}$`,
      `$${this.fractionTex([bonRapport[1], bonRapport[0]])}$`,
    ]

    const rapportAvecSegments =
      fonction === 'sin'
        ? '\\dfrac{AC}{BC}'
        : fonction === 'cos'
          ? '\\dfrac{AB}{BC}'
          : '\\dfrac{AC}{AB}'
    const valeur = this.fractionTex(bonRapport)
    this.correction = `Dans le triangle $ABC$ rectangle en $A$, par rapport à l'angle $\\widehat{ABC}$ :<br>
- le côté opposé est $[AC]$ ;<br>
- le côté adjacent est $[AB]$ ;<br>
- l'hypoténuse est $[BC]$.<br>
Ainsi, $\\${fonction}(\\widehat{ABC})=${rapportAvecSegments}=${miseEnEvidence(valeur)}$.`
  }

  versionOriginale = () => {
    this.appliquerLesValeurs(8, 15, 17, 'sin')
  }

  versionAleatoire = () => {
    const triplets: TripletPythagoricien[] = [
      [3, 4, 5],
      [5, 12, 13],
      [7, 24, 25],
      [8, 15, 17],
      [9, 40, 41],
      [12, 35, 37],
      [20, 21, 29],
    ]
    const [cathete1, cathete2, hypotenuse] = choice(triplets)
    const facteur = randint(1, 3)
    const permuter = randint(0, 1) === 1
    const ab = facteur * (permuter ? cathete2 : cathete1)
    const ac = facteur * (permuter ? cathete1 : cathete2)
    this.appliquerLesValeurs(
      ab,
      ac,
      facteur * hypotenuse,
      choice<FonctionTrigonometrie>(['sin', 'cos', 'tan']),
    )
  }

  constructor() {
    super()

    this.nbQuestions = 1
    this.versionAleatoire()
  }
}
