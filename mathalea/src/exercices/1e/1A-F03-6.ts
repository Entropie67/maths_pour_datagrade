import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import { randint } from '../../modules/outils'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const titre =
  "Déterminer l'expression d'une fonction affine avec deux points appartenant à sa représentation graphique"
export const dateDePublication = '30/06/2026'
export const dateDeModifImportante = '23/10/2026'

export const uuid = 'f0366'

export const refs = {
  'fr-fr': ['1A-F03-6'],
  'fr-ch': ['1mQCM-56', '11LCQCMFA2C-1', '11LSQCMFA2C-1'],
}

export const interactifReady = true

export const amcReady = true

/**
 * Déterminer une fonction affine à partir de deux points de sa représentation graphique.
 * @author Stéphane Guyon
 */
export default class FonctionAffineDeuxPointsQcm extends ExerciceQcmACourt {
  clavierReponseCourte = KeyboardType.clavierDeBaseAvecX
  texteAvantReponseCourte = '$f(x)=$'
  private appliquerLesValeurs(a: number, b: number, xA: number, xB: number) {
    const yA = a * xA + b
    const yB = a * xB + b
    const expression = reduireAxPlusB(a, b)
    const propositions = [
      {
        expression,
        imageA: yA,
        imageB: yB,
        convient: true,
      },
      {
        expression: reduireAxPlusB(-a, b),
        imageA: -a * xA + b,
        imageB: -a * xB + b,
        convient: false,
      },
      {
        expression: reduireAxPlusB(a, -b),
        imageA: a * xA - b,
        imageB: a * xB - b,
        convient: false,
      },
      {
        expression: reduireAxPlusB(-a, -b),
        imageA: -a * xA - b,
        imageB: -a * xB - b,
        convient: false,
      },
    ]
    const elimination = propositions
      .map(
        (proposition) =>
          `$${proposition.expression === expression ? miseEnEvidence(`f(x)=${proposition.expression}`) : `f(x)=${proposition.expression}`}$ donne $f(${xA})=${proposition.imageA}$ et $f(${xB})=${proposition.imageB}$ : ${proposition.convient ? 'cette expression convient' : 'cette expression ne convient pas'}.`,
      )
      .join('<br>')

    this.enonce = `On considère une fonction affine $f$ dont la représentation graphique passe par les points $A(${xA}\\,;\\,${yA})$ et $B(${xB}\\,;\\,${yB})$.<br>
Quelle est l'expression de $f$ ?`

    this.reponseCourte = () => expression
    // Une expression réduite est attendue : ni calcul, ni forme développable non réduite
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { expressionsForcementReduites: true })
    this.enonceCourt = () =>
      `On considère une fonction affine $f$ dont la représentation graphique passe par les points $A(${xA}\\,;\\,${yA})$ et $B(${xB}\\,;\\,${yB})$.<br>
Déterminer, en justifiant, l'expression de $f$.`

    this.reponses = propositions.map(
      (proposition) => `$f(x)=${proposition.expression}$`,
    )

    // La mise en évidence ne porte que sur ce que le champ attend : « f(x)= » est écrit devant le champ
    const methode = (
      conclusion: string,
    ) => `Les abscisses respectives des points $A$ et $B$ sont distinctes, donc le coefficient directeur de la droite est :
$\\dfrac{y_B-y_A}{x_B-x_A}=\\dfrac{${yB}-${ecritureParentheseSiNegatif(yA)}}{${xB}-${ecritureParentheseSiNegatif(xA)}}=${a}$.<br>
La fonction est donc de la forme $f(x)=ax+b$.<br>
Comme $A$ appartient à la représentation graphique de $f$, on a $${yA}=${a}\\times ${ecritureParentheseSiNegatif(xA)}+b$, donc $b=${yA}-${ecritureParentheseSiNegatif(a * xA)}=${b}$.<br>
Ainsi, $${conclusion}$.<br>`
    this.correctionCourte = () =>
      methode(`f(x)=${miseEnEvidence(expression)}`)
    this.correction = `${methode(miseEnEvidence(`f(x)=${expression}`))}<br>
On peut aussi procéder par élimination en testant les propositions avec les coordonnées des deux points.<br>
${elimination}`
  }

  versionOriginale = () => {
    this.appliquerLesValeurs(2, -3, -1, 2)
  }

  versionAleatoire = () => {
    const a = randint(1, 5) * choice([-1, 1])
    const b = randint(1, 6) * choice([-1, 1])
    const xA = randint(-4, 4)
    const xB = randint(-4, 4, xA)
    this.appliquerLesValeurs(a, b, xA, xB)
  }

  nouvelleVersion() {
    this.sansLettreCorrection = true
    super.nouvelleVersion()
  }

  constructor() {
    super()

    this.versionAleatoire()
  }
}
