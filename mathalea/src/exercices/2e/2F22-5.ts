import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { shuffle } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import ExerciceQcmA from '../ExerciceQcmA'
import { expressions, type TypeCourbe } from './2F22-3'

export const titre =
  'Reconnaître le tableau de variations d’une fonction de référence'
export const dateDePublication = '11/08/2026'
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'

export const uuid = 'c7d91'
export const refs = {
  'fr-fr': ['2F22-5'],
  'fr-ch': [],
}

type TypeTableau = 'minimumEnZero' | 'croissanteR' | 'inverse' | 'racineCarree'
type FonctionDemandee = Extract<
  TypeCourbe,
  'valeurAbsolue' | 'carre' | 'inverse' | 'cube' | 'racineCarree'
>

function tableau(type: TypeTableau): string {
  switch (type) {
    case 'minimumEnZero':
      return tableauDeVariation({
        tabInit: [
          [
            ['$x$', 1, 10],
            ['$f(x)$', 4, 60],
          ],
          ['$-\\infty$', 20, '$0$', 20, '$+\\infty$', 20],
        ],
        tabLines: [
          ['Var', 10, '+/$+\\infty$', 20, '-/$0$', 20, '+/$+\\infty$', 10],
        ],
        espcl: 4,
        deltacl: 0.8,
        lgt: 4,
        scale: 0.8,
      })
    case 'croissanteR':
      return tableauDeVariation({
        tabInit: [
          [
            ['$x$', 1, 10],
            ['$f(x)$', 4, 60],
          ],
          ['$-\\infty$', 20, '$+\\infty$', 20],
        ],
        tabLines: [['Var', 10, '-/$-\\infty$', 30, '+/$+\\infty$', 10]],
        espcl: 4,
        deltacl: 0.8,
        lgt: 4,
        scale: 0.8,
      })
    case 'inverse':
      return tableauDeVariation({
        tabInit: [
          [
            ['$x$', 1, 10],
            ['$f(x)$', 4, 60],
          ],
          ['$-\\infty$', 20, '$0$', 20, '$+\\infty$', 20],
        ],
        tabLines: [
          [
            'Var',
            10,
            '+/$0$',
            20,
            '-D+/$-\\infty$/$+\\infty$',
            20,
            '-/$0$',
            10,
          ],
        ],
        espcl: 4,
        deltacl: 0.8,
        lgt: 4,
        scale: 0.8,
      })
    case 'racineCarree':
      return tableauDeVariation({
        tabInit: [
          [
            ['$x$', 1, 10],
            ['$f(x)$', 4, 60],
          ],
          ['$0$', 20, '$+\\infty$', 20],
        ],
        tabLines: [['Var', 10, '-/$0$', 30, '+/$+\\infty$', 10]],
        espcl: 4,
        deltacl: 0.8,
        lgt: 4,
        scale: 0.8,
      })
  }
}

const tableauAttendu: Record<FonctionDemandee, TypeTableau> = {
  valeurAbsolue: 'minimumEnZero',
  carre: 'minimumEnZero',
  inverse: 'inverse',
  cube: 'croissanteR',
  racineCarree: 'racineCarree',
}

/**
 * @author Stéphane Guyon
 */
export default class TableauVariationsFonctionReference extends ExerciceQcmA {
  private ordreDesCas = shuffle([1, 2, 3])
  private indiceDuCas = 0

  private casDisponibles(): number[] {
    switch (this.sup3) {
      case 1:
        return [1, 2, 3]
      case 2:
        return [2, 3, 4, 5]
      case 3:
      default:
        return [1, 2, 3, 4, 5]
    }
  }

  private appliquerLesValeurs(cas: number): void {
    const fonctions: FonctionDemandee[] = [
      'valeurAbsolue',
      'carre',
      'inverse',
      'cube',
      'racineCarree',
    ]
    const fonctionDemandee = fonctions[cas - 1]
    const typeCorrect = tableauAttendu[fonctionDemandee]
    const autresTypes: TypeTableau[] = [
      'minimumEnZero',
      'croissanteR',
      'inverse',
      'racineCarree',
    ]
    const distracteurs = autresTypes.filter((type) => type !== typeCorrect)

    this.enonce = `On considère la fonction de référence $f$ définie par $f(x)=${expressions[fonctionDemandee]}$.<br><br>Quel est le tableau de variations de la fonction $f$ ?`
    this.reponses = [typeCorrect, ...shuffle(distracteurs)].map((type) =>
      tableau(type),
    )

    const commentaires: Record<TypeTableau, string> = {
      minimumEnZero:
        'La fonction est décroissante sur $]-\\infty~;~0]$, puis croissante sur $[0~;~+\\infty[$. Elle admet un minimum égal à $0$ en $0$.',
      croissanteR: 'La fonction est strictement croissante sur $\\mathbb{R}$.',
      inverse:
        'La fonction est définie sur $]-\\infty~;~0[\\,\\cup\\,]0~;~+\\infty[$ et elle est strictement décroissante sur chacun de ces deux intervalles.',
      racineCarree:
        'La fonction est définie sur $[0~;~+\\infty[$ et elle est strictement croissante sur cet intervalle.',
    }
    this.correction = `${commentaires[typeCorrect]}<br><br>${texteEnCouleurEtGras('Le tableau correct est donc :', 'black')}<br>${tableau(typeCorrect)}`
  }

  versionAleatoire = (): void => {
    const cas = this.ordreDesCas[this.indiceDuCas % this.ordreDesCas.length]
    this.indiceDuCas++
    this.appliquerLesValeurs(cas)
  }

  nouvelleVersion(): void {
    this.ordreDesCas = shuffle(this.casDisponibles())
    this.indiceDuCas = 0
    super.nouvelleVersion()

    if (context.isHtml) {
      const styleDeuxColonnes = `<style>
        mathalea-qcm.qcm-tableaux-2-cols { display: block; }
        mathalea-qcm.qcm-tableaux-2-cols > div:first-child {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          column-gap: 1.5rem;
          row-gap: 1rem;
        }
        @media (max-width: 700px) {
          mathalea-qcm.qcm-tableaux-2-cols > div:first-child {
            grid-template-columns: 1fr;
          }
        }
      </style>`

      for (let index = 0; index < this.listeQuestions.length; index++) {
        this.listeQuestions[index] = this.listeQuestions[index]
          .replace(
            '<mathalea-qcm ',
            `${styleDeuxColonnes}<mathalea-qcm class="qcm-tableaux-2-cols" `,
          )
          .replace('format="case"', 'format="case+lettre"')

        if (this.interactif) {
          const indiceBonneReponse =
            this.autoCorrection[index].propositions?.findIndex(
              (proposition) => proposition.statut,
            ) ?? -1
          const lettre = lettreDepuisChiffre(indiceBonneReponse + 1)
          this.listeCorrections[index] +=
            `<br>Cela permet de conclure que la bonne réponse est ${texteEnCouleurEtGras(lettre, 'red')}.`
        }
      }
    }
  }

  constructor() {
    super()
    this.sup3 = 3
    this.besoinFormulaire3Numerique = [
      'Fonctions proposées',
      3,
      '1 : Nouveau programme 2026\n2 : Années de transition\n3 : Toutes les fonctions de référence',
    ]

    this.ordreDesCas = shuffle(this.casDisponibles())
    this.versionAleatoire()
  }
}
