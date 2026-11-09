import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const titre =
  'Déterminer des asymptotes à partir d’un tableau de variations'
export const dateDePublication = '08/08/2026'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const dateDeModifImportante = '06/10/2026'

export const uuid = '6de80'
export const refs = {
  'fr-fr': ['TSA2-11', 'TCA2-11'],
  'fr-ch': [],
}

type TypeQuestion = 1 | 2 | 3

/**
 * Lire les équations d'asymptotes dans un tableau de variations.
 * @author Stéphane Guyon
 */
export default class AsymptotesEtTableauDeVariations extends ExerciceQcmA {
  private typeAsymptotes?: number

  private tableauHorizontal(ordonnée: number): string {
    const limiteGauchePositive = choice([true, false])
    const abscisseIntermediaire = randint(-4, 4)
    const valeurIntermediaire = limiteGauchePositive
      ? ordonnée - randint(2, 5)
      : ordonnée + randint(2, 5)
    const ligneVariations = limiteGauchePositive
      ? [
          'Var',
          10,
          '+/$+\\infty$',
          20,
          `-/$${valeurIntermediaire}$`,
          20,
          `+/$${ordonnée}$`,
          10,
        ]
      : [
          'Var',
          10,
          '-/$-\\infty$',
          20,
          `+/$${valeurIntermediaire}$`,
          20,
          `-/$${ordonnée}$`,
          10,
        ]
    return tableauDeVariation({
      tabInit: [
        [
          ['$x$', 1.5, 10],
          ['$f(x)$', 4, 30],
        ],
        ['$-\\infty$', 10, `$${abscisseIntermediaire}$`, 10, '$+\\infty$', 10],
      ],
      tabLines: [ligneVariations],
      espcl: 5,
      deltacl: 1,
      lgt: 2.6,
      scale: context.isHtml ? 0.9 : 0.75,
      hauteurLignes: [18, 18],
    })
  }

  private tableauVertical(abscisse: number): {
    tableau: string
    limiteADroite: '+\\infty' | '-\\infty'
  } {
    const limiteADroite = choice(['+\\infty', '-\\infty'] as Array<
      '+\\infty' | '-\\infty'
    >)
    const abscisseIntermediaire = abscisse + randint(1, 5)
    const valeurIntermediaire = randint(-5, 5)
    const ligneVariations =
      limiteADroite === '+\\infty'
        ? [
            'Var',
            10,
            'D+/$+\\infty$',
            20,
            `-/$${valeurIntermediaire}$`,
            20,
            '+/$+\\infty$',
            10,
          ]
        : [
            'Var',
            10,
            'D-/$-\\infty$',
            20,
            `+/$${valeurIntermediaire}$`,
            20,
            '-/$-\\infty$',
            10,
          ]
    return {
      tableau: tableauDeVariation({
        tabInit: [
          [
            ['$x$', 1.5, 10],
            ['$f(x)$', 4, 30],
          ],
          [
            `$${abscisse}$`,
            10,
            `$${abscisseIntermediaire}$`,
            10,
            '$+\\infty$',
            10,
          ],
        ],
        tabLines: [ligneVariations],
        espcl: 5,
        deltacl: 1,
        lgt: 2.6,
        scale: context.isHtml ? 0.9 : 0.75,
        hauteurLignes: [18, 18],
      }),
      limiteADroite,
    }
  }

  private tableauAvecDeuxAsymptotes(
    abscisse: number,
    ordonnée: number,
  ): {
    tableau: string
    limiteADroite: '+\\infty' | '-\\infty'
  } {
    const limiteADroite = choice(['+\\infty', '-\\infty'] as Array<
      '+\\infty' | '-\\infty'
    >)
    const abscisseIntermediaire = abscisse + randint(1, 5)
    const valeurIntermediaire =
      limiteADroite === '+\\infty'
        ? ordonnée - randint(2, 5)
        : ordonnée + randint(2, 5)
    const ligneVariations =
      limiteADroite === '+\\infty'
        ? [
            'Var',
            10,
            'D+/$+\\infty$',
            20,
            `-/$${valeurIntermediaire}$`,
            20,
            `+/$${ordonnée}$`,
            10,
          ]
        : [
            'Var',
            10,
            'D-/$-\\infty$',
            20,
            `+/$${valeurIntermediaire}$`,
            20,
            `-/$${ordonnée}$`,
            10,
          ]
    return {
      tableau: tableauDeVariation({
        tabInit: [
          [
            ['$x$', 1.5, 10],
            ['$f(x)$', 4, 30],
          ],
          [
            `$${abscisse}$`,
            10,
            `$${abscisseIntermediaire}$`,
            10,
            '$+\\infty$',
            10,
          ],
        ],
        tabLines: [ligneVariations],
        espcl: 5,
        deltacl: 1,
        lgt: 2.6,
        scale: context.isHtml ? 0.9 : 0.75,
        hauteurLignes: [18, 18],
      }),
      limiteADroite,
    }
  }

  private appliqueLesValeurs(typeQuestion: TypeQuestion): void {
    const abscisse = randint(-5, 5)
    let ordonnée = randint(-5, 5)
    while (typeQuestion === 3 && ordonnée === abscisse) {
      ordonnée = randint(-5, 5)
    }

    let tableau: string
    let correction: string

    if (typeQuestion === 1) {
      tableau = this.tableauHorizontal(ordonnée)
      this.reponses = [
        `$\\mathcal{C}_f$  admet une asymptote horizontale d'équation $y=${ordonnée}$.`,
        `$\\mathcal{C}_f$  admet une asymptote verticale d'équation $x=${ordonnée}$.`,
        `$\\mathcal{C}_f$  admet une asymptote horizontale d'équation $x=${ordonnée}$.`,
        `$\\mathcal{C}_f$  n'admet aucune asymptote.`,
      ]
      correction = `Le tableau donne $\\displaystyle \\lim_{x\\to+\\infty}f(x)=${ordonnée}$.<br>
      $\\mathcal{C}_f$  admet donc une asymptote horizontale d'équation $${miseEnEvidence(`y=${ordonnée}`)}$.`
    } else if (typeQuestion === 2) {
      const donneesVerticales = this.tableauVertical(abscisse)
      tableau = donneesVerticales.tableau
      this.reponses = [
        `$\\mathcal{C}_f$  admet une asymptote verticale d'équation $x=${abscisse}$.`,
        `$\\mathcal{C}_f$  admet une asymptote horizontale d'équation $y=${abscisse}$.`,
        `$\\mathcal{C}_f$  admet une asymptote verticale d'équation $y=${abscisse}$.`,
        `$\\mathcal{C}_f$  admet une asymptote horizontale d'équation $x=${abscisse}$.`,
      ]
      correction = `Le tableau donne $\\displaystyle \\lim_{x\\to${abscisse}^{+}}f(x)=${donneesVerticales.limiteADroite}$.<br>
      $\\mathcal{C}_f$  admet donc une asymptote verticale d'équation $${miseEnEvidence(`x=${abscisse}`)}$.`
    } else {
      const donnees = this.tableauAvecDeuxAsymptotes(abscisse, ordonnée)
      tableau = donnees.tableau
      this.reponses = [
        `$\\mathcal{C}_f$  admet une asymptote verticale d'équation $x=${abscisse}$ et une asymptote horizontale d'équation $y=${ordonnée}$.`,
        `$\\mathcal{C}_f$  admet une asymptote verticale d'équation $x=${ordonnée}$ et une asymptote horizontale d'équation $y=${abscisse}$.`,
        `$\\mathcal{C}_f$  admet une asymptote verticale d'équation $y=${abscisse}$ et une asymptote horizontale d'équation $x=${ordonnée}$.`,
        `$\\mathcal{C}_f$  admet une asymptote verticale d'équation $y=${ordonnée}$ et une asymptote horizontale d'équation $x=${abscisse}$.`,
      ]
      correction = `Le tableau donne $\\displaystyle \\lim_{x\\to${abscisse}^{+}}f(x)=${donnees.limiteADroite}$ et $\\displaystyle \\lim_{x\\to+\\infty}f(x)=${ordonnée}$.<br>
      $\\mathcal{C}_f$  admet donc une asymptote verticale d'équation $${miseEnEvidence(`x=${abscisse}`)}$ et une asymptote horizontale d'équation $${miseEnEvidence(`y=${ordonnée}`)}$.`
    }

    this.enonce = `On donne ci-dessous le tableau de variations d'une fonction $f$. <br>
    ${tableau}<br>
    On appelle $\\mathcal{C}_f$ la courbe représentative de la fonction $f$. <br>

    Parmi les affirmations suivantes, laquelle est correcte ?`
    if (context.isTypst) {
      this.enonce += `<br>${this.reponses
        .map(
          (reponse, index) => `${String.fromCharCode(65 + index)}. ${reponse}`,
        )
        .join('<br>')}`
    }
    this.correction = correction
  }

  versionAleatoire = () => {
    const selection = this.typeAsymptotes ?? this.sup
    const typeQuestion: TypeQuestion =
      selection === 1 || selection === 2 ? selection : choice([1, 2, 3])
    this.appliqueLesValeurs(typeQuestion)
  }

  nouvelleVersion(): void {
    const selection = this.sup
    this.typeAsymptotes = selection
    // Le parent réserve sup au sujet original et limite alors le QCM à une question.
    this.sup = false
    try {
      super.nouvelleVersion()
    } finally {
      this.sup = selection
      this.typeAsymptotes = undefined
    }
  }

  constructor() {
    super()
    this.sup = 3
    this.besoinFormulaireNumerique = [
      'Type d’asymptotes',
      3,
      '1 : Uniquement horizontales\n2 : Uniquement verticales\n3 : Mélange des deux',
    ]
    this.options.ordered = context.isTypst
    this.options.vertical = true

    this.versionAleatoire()
  }
}
