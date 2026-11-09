import { courbe } from '../../lib/2d/Courbe'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import ExerciceQcmA from '../ExerciceQcmA'

export const titre =
  'Reconnaître une fonction de référence à partir de sa courbe'
export const dateDePublication = '10/08/2026'
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'

export const uuid = 'f214a'
export const refs = {
  'fr-fr': ['2F22-4'],
  'fr-ch': ['11LCFA2F-3', '11LSFA2F-3'],
}

type TypeCourbe =
  | 'valeurAbsolue'
  | 'opposeValeurAbsolue'
  | 'carre'
  | 'opposeCarre'
  | 'inverse'
  | 'opposeInverse'
  | 'identite'
  | 'opposeIdentite'
  | 'racineCarree'
  | 'cube'

const expressions: Record<TypeCourbe, string> = {
  valeurAbsolue: '|x|',
  opposeValeurAbsolue: '-|x|',
  carre: 'x^2',
  opposeCarre: '-x^2',
  inverse: '\\dfrac{1}{x}',
  opposeInverse: '-\\dfrac{1}{x}',
  identite: 'x',
  opposeIdentite: '-x',
  racineCarree: '\\sqrt{x}',
  cube: 'x^3',
}

function construireGraphique(type: TypeCourbe): string {
  const xmin = -4.5
  const xmax = 4.5
  const ymin = -4.5
  const ymax = 4.5
  const r = repere({
    xMin: xmin,
    xMax: xmax,
    yMin: ymin,
    yMax: ymax,
    grilleX: false,
    grilleY: false,
    grilleSecondaire: true,
    grilleSecondaireXDistance: 1,
    grilleSecondaireYDistance: 1,
  })
  const optionsCourbe = {
    repere: r,
    color: bleuMathalea,
    epaisseur: 2,
    step: 0.05,
    yMin: ymin,
    yMax: ymax,
  }
  const courbes = []

  switch (type) {
    case 'valeurAbsolue':
      courbes.push(
        courbe((x) => Math.abs(x), {
          ...optionsCourbe,
          xMin: -4.2,
          xMax: 4.2,
        }),
      )
      break
    case 'opposeValeurAbsolue':
      courbes.push(
        courbe((x) => -Math.abs(x), {
          ...optionsCourbe,
          xMin: -4.2,
          xMax: 4.2,
        }),
      )
      break
    case 'carre':
      courbes.push(
        courbe((x) => x ** 2, {
          ...optionsCourbe,
          xMin: -2.15,
          xMax: 2.15,
        }),
      )
      break
    case 'opposeCarre':
      courbes.push(
        courbe((x) => -(x ** 2), {
          ...optionsCourbe,
          xMin: -2.15,
          xMax: 2.15,
        }),
      )
      break
    case 'inverse':
    case 'opposeInverse': {
      const signe = type === 'inverse' ? 1 : -1
      courbes.push(
        courbe((x) => signe / x, {
          ...optionsCourbe,
          xMin: xmin,
          xMax: -0.22,
          step: 0.02,
        }),
        courbe((x) => signe / x, {
          ...optionsCourbe,
          xMin: 0.22,
          xMax: xmax,
          step: 0.02,
        }),
      )
      break
    }
    case 'identite':
      courbes.push(
        courbe((x) => x, {
          ...optionsCourbe,
          xMin: -4.2,
          xMax: 4.2,
        }),
      )
      break
    case 'opposeIdentite':
      courbes.push(
        courbe((x) => -x, {
          ...optionsCourbe,
          xMin: -4.2,
          xMax: 4.2,
        }),
      )
      break
    case 'racineCarree':
      courbes.push(
        courbe((x) => Math.sqrt(x), {
          ...optionsCourbe,
          xMin: 0,
          xMax: 4.2,
        }),
      )
      break
    case 'cube':
      courbes.push(
        courbe((x) => x ** 3, {
          ...optionsCourbe,
          xMin: -1.65,
          xMax: 1.65,
        }),
      )
      break
  }

  const axeX = segment(xmin, 0, xmax, 0, 'black', '->')
  const axeY = segment(0, ymin, 0, ymax, 'black', '->')
  const origine = latex2d('O', -0.3, -0.3, {
    letterSize: 'scriptsize',
  })

  return mathalea2d(
    {
      xmin: xmin - 0.2,
      xmax: xmax + 0.2,
      ymin: ymin - 0.2,
      ymax: ymax + 0.2,
      pixelsParCm: 18,
      scale: 0.42,
      center: !context.isHtml,
    },
    r,
    ...courbes,
    axeX,
    axeY,
    origine,
  )
}

/**
 * @author Stéphane Guyon
 */
export default class ReconnaitreFonctionDepuisCourbe extends ExerciceQcmA {
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
    let fonctionDemandee: TypeCourbe
    switch (cas) {
      case 1:
        fonctionDemandee = 'valeurAbsolue'
        break
      case 2:
        fonctionDemandee = 'carre'
        break
      case 3:
        fonctionDemandee = 'inverse'
        break
      case 4:
        fonctionDemandee = 'cube'
        break
      case 5:
        fonctionDemandee = 'racineCarree'
        break
      default:
        fonctionDemandee = 'valeurAbsolue'
    }

    let distracteursPossibles: TypeCourbe[]
    let commentaire: string
    switch (fonctionDemandee) {
      case 'valeurAbsolue':
        distracteursPossibles = [
          'identite',
          'opposeIdentite',
          'opposeValeurAbsolue',
          'inverse',
          'cube',
        ]
        commentaire =
          'La courbe est formée de deux demi-droites de sommet $O$ et elle est située au-dessus de l’axe des abscisses : il s’agit de la fonction valeur absolue.'
        break
      case 'carre':
        distracteursPossibles = [
          'opposeCarre',
          'valeurAbsolue',
          'inverse',
          'identite',
          'cube',
        ]
        commentaire =
          'La courbe est une parabole de sommet $O$, symétrique par rapport à l’axe des ordonnées et située au-dessus de l’axe des abscisses : il s’agit de la fonction carré.'
        break
      case 'inverse':
        distracteursPossibles = [
          'opposeInverse',
          'carre',
          'valeurAbsolue',
          'identite',
          'opposeIdentite',
          'cube',
        ]
        commentaire =
          'La courbe possède deux branches situées dans les premier et troisième quadrants, et les axes sont ses asymptotes : il s’agit de la fonction inverse.'
        break
      case 'cube':
        distracteursPossibles = [
          'identite',
          'opposeIdentite',
          'carre',
          'valeurAbsolue',
          'inverse',
          'opposeInverse',
        ]
        commentaire =
          'La courbe passe par l’origine, elle est strictement croissante et possède un point d’inflexion en $O$ : il s’agit de la fonction cube.'
        break
      case 'racineCarree':
        distracteursPossibles = [
          'valeurAbsolue',
          'carre',
          'inverse',
          'identite',
          'cube',
        ]
        commentaire =
          'La courbe part de l’origine, n’est tracée que pour $x\\geqslant 0$ et elle est strictement croissante : il s’agit de la fonction racine carrée.'
        break
      default:
        distracteursPossibles = ['carre', 'inverse', 'identite']
        commentaire = ''
    }

    const graphique = construireGraphique(fonctionDemandee)
    const distracteurs = shuffle(distracteursPossibles).slice(0, 3)

    this.enonce = `On donne ci-dessous la courbe représentative d’une fonction $f$.<br>${graphique}<br>
    Quelle expression définit la fonction $f$ ?`
    this.reponses = [fonctionDemandee, ...distracteurs].map(
      (type) => `$f(x)=${expressions[type]}$`,
    )
    this.correction = `${commentaire}<br>
    Ainsi, $${miseEnEvidence(`f(x)=${expressions[fonctionDemandee]}`, bleuMathalea)}$.`
  }

  versionAleatoire: () => void = () => {
    const cas = this.ordreDesCas[this.indiceDuCas % this.ordreDesCas.length]
    this.indiceDuCas++
    this.appliquerLesValeurs(cas)
  }

  nouvelleVersion(): void {
    this.ordreDesCas = shuffle(this.casDisponibles())
    this.indiceDuCas = 0
    super.nouvelleVersion()
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
