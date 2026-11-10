import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import ExerciceQcmA from '../ExerciceQcmA'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
/**
 * @author Gilles Mora
 *
 */
export const dateDeModifImportante = '22/10/2026'

export const uuid = 'd1a6e'
export const refs = {
  'fr-fr': ['1A-F02-20', '2A-F2-2'],
  'fr-ch': ['1mQCM-46', '11LCFA2F-6', '11LSFA2F-6', '11LCQCMFA2A-7', '11LSQCMFA2A-11'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Déterminer si un point appartient à une hyperbole'
export const dateDePublication = '19/01/2026'

type PointCourbe = {
  texte: string
  nom: string
  xNum: number
  xDen: number
  xTex: string
  yNum: number
  yDen: number
}

const APPARTIENT = 'appartient'
const N_APPARTIENT_PAS = "n'appartient pas"

/**
 * Version par défaut : « Le point M appartient / n'appartient pas à la courbe ».
 * La case « Version QCM » (`sup3`) rétablit le QCM « Déterminer le point qui n'appartient pas ».
 */
export default class Auto1AF2t extends ExerciceQcmACourt {
  private k = 6
  private bonnePointChoisi?: PointCourbe
  private mauvaisPointsChoisis: PointCourbe[] = []

  /** Calcul de k/x puis comparaison avec l'ordonnée du point. */
  private correctionPoint(k: number, point: PointCourbe) {
    const y = new FractionEtendue(point.yNum, point.yDen)
    // Calcul de k/x = k × (1/x) = k × (xDen/xNum)
    const yTheorique = new FractionEtendue(
      k * point.xDen,
      point.xNum,
    ).simplifie()
    let texte = ''
    if (point.xDen === 1) {
      texte += `On calcule $\\dfrac{${k}}{${point.xTex}}=${yTheorique.texFractionSimplifiee}$.<br>`
    } else {
      const inverse = new FractionEtendue(point.xDen, point.xNum)
      texte += `On calcule $\\dfrac{${k}}{${point.xTex}}=${k}\\times ${inverse.texFractionSimplifiee}=${yTheorique.texFractionSimplifiee}$.<br>`
    }
    const appartient = y.isEqual(yTheorique)
    const nom = point.nom
    if (appartient) {
      texte += `On a $y_{_{${nom}}}=${yTheorique.texFractionSimplifiee}$ donc $${nom}$ ${texteEnCouleurEtGras(APPARTIENT)} à la courbe.<br>`
    } else {
      texte += `On a $y_{_{${nom}}}=${y.texFractionSimplifiee}\\neq ${yTheorique.texFractionSimplifiee}$ donc $${nom}$ ${texteEnCouleurEtGras(N_APPARTIENT_PAS)} à la courbe.<br>`
    }
    return texte
  }

  private appliquerLesValeurs(
    k: number,
    bonnesReponses: Array<{
      texte: string
      nom: string
      xNum: number
      xDen: number
      xTex: string
      yNum: number
      yDen: number
    }>,
    mauvaisesReponses: Array<{
      texte: string
      nom: string
      xNum: number
      xDen: number
      xTex: string
      yNum: number
      yDen: number
    }>,
  ): void {
    // Énoncé
    this.enonce = `Dans un repère orthonormé, on considère la courbe d'équation $y=\\dfrac{${k}}{x}$. <br>
    ${this.interactif ? 'Le point qui n’appartient pas à cette courbe est :' : "Déterminer le point qui n'appartient pas à cette courbe :"}`

    // Choisir 1 bonne réponse et 3 mauvaises réponses
    const bonneReponseObj = choice(bonnesReponses)
    const mauvaisesChoisies = shuffle(mauvaisesReponses).slice(0, 3)
    this.k = k
    this.bonnePointChoisi = bonneReponseObj
    this.mauvaisPointsChoisis = mauvaisesChoisies

    // Construire le tableau de réponses
    this.reponses = [
      bonneReponseObj.texte,
      ...mauvaisesChoisies.map((r) => r.texte),
    ]

    // Correction détaillée
    this.correction = `Pour vérifier si un point $(x\\,;\\,y)$ appartient à la courbe d'équation $y=\\dfrac{${k}}{x}$, on vérifie si les coordonnées satisfont l'équation.<br>`

    // Justifications pour tous les points affichés
    const tousLesPoints = [bonneReponseObj, ...mauvaisesChoisies]

    for (const point of tousLesPoints) {
      const y = new FractionEtendue(point.yNum, point.yDen)

      // Calcul de k/x = k × (1/x) = k × (xDen/xNum)
      const yTheorique = new FractionEtendue(
        k * point.xDen,
        point.xNum,
      ).simplifie()

      this.correction += `$\\bullet$ Pour le point $${point.nom}$ :<br>`

      // Afficher le calcul avec multiplication par l'inverse
      if (point.xDen === 1) {
        // Si x est entier
        this.correction += `On calcule $\\dfrac{${k}}{${point.xTex}}=${yTheorique.texFractionSimplifiee}$.<br>`
      } else {
        // Si x est une fraction
        const inverse = new FractionEtendue(point.xDen, point.xNum)
        this.correction += `On calcule $\\dfrac{${k}}{${point.xTex}}=${k}\\times ${inverse.texFractionSimplifiee}=${yTheorique.texFractionSimplifiee}$.<br>`
      }

      // Comparer avec l'ordonnée du point en utilisant isEqual()
      if (y.isEqual(yTheorique)) {
        this.correction += `On a $y_{_{${point.nom}}}=${yTheorique.texFractionSimplifiee}$ donc $${point.nom}$ appartient à la courbe.<br>`
      } else {
        // En QCM, la bonne réponse est le point : lui seul, avec ses coordonnées, est mis en évidence
        this.correction += `On a $y_{_{${point.nom}}}=${y.texFractionSimplifiee}\\neq ${yTheorique.texFractionSimplifiee}$ donc $${miseEnEvidence(point.texte.replace(/^\$|\$$/g, ''))}$ n'appartient pas à la courbe.<br>`
      }
    }
  }

  versionOriginale: () => void = () => {
    const k = 6

    // Énoncé
    this.enonce = `Dans un repère orthonormé, on considère la courbe d'équation $y=\\dfrac{${k}}{x}$. <br>
    ${this.interactif ? 'Le point qui n’appartient pas à cette courbe est :' : "Déterminer le point qui n'appartient pas à cette courbe :"}`

    // Les 4 points fixes pour la version originale
    const pointsAffiches = [
      // Bonne réponse : erreur de multiplication directe
      {
        nom: 'M',
        xNum: 1,
        xDen: 3,
        xTex: '\\dfrac{1}{3}',
        yNum: 2,
        yDen: 1,
        appartient: false,
      },
      // Mauvaises réponses
      {
        nom: 'N',
        xNum: 6,
        xDen: 5,
        xTex: '\\dfrac{6}{5}',
        yNum: 5,
        yDen: 1,
        appartient: true,
      },
      {
        nom: 'P',
        xNum: 2,
        xDen: 1,
        xTex: '2',
        yNum: 3,
        yDen: 1,
        appartient: true,
      },
      {
        nom: 'Q',
        xNum: 2,
        xDen: 5,
        xTex: '\\dfrac{2}{5}',
        yNum: 15,
        yDen: 1,
        appartient: true,
      },
    ]

    // Le point avec ses coordonnées, sans les $
    const texteDuPoint = (point: (typeof pointsAffiches)[number]) =>
      `${point.nom}\\left(${point.xTex}\\,;\\,${point.yNum === 1 && point.yDen === 1 ? point.yNum : point.yDen === 1 ? point.yNum : `\\dfrac{${point.yNum}}{${point.yDen}}`}\\right)`

    // Construire les réponses
    const reponses: string[] = []
    let bonneReponse = ''

    for (const point of pointsAffiches) {
      const reponse = `$${texteDuPoint(point)}$`

      if (!point.appartient) {
        bonneReponse = reponse
      } else {
        reponses.push(reponse)
      }
    }

    // Mettre la bonne réponse en première position
    this.reponses = [bonneReponse, ...reponses]

    // Correction détaillée
    this.correction = `Pour vérifier si un point $(x\\,;\\,y)$ appartient à la courbe d'équation $y=\\dfrac{${k}}{x}$, on vérifie si les coordonnées vérifient l'équation.<br>`

    for (const point of pointsAffiches) {
      const y = new FractionEtendue(point.yNum, point.yDen)

      // Calcul de k/x = k × (1/x) = k × (xDen/xNum)
      const yTheorique = new FractionEtendue(
        k * point.xDen,
        point.xNum,
      ).simplifie()

      this.correction += `$\\bullet$ Pour le point $${point.nom}$ :<br>`

      // Afficher le calcul avec multiplication par l'inverse
      if (point.xDen === 1) {
        // Si x est entier
        this.correction += `On calcule $\\dfrac{${k}}{${point.xTex}}=${yTheorique.texFractionSimplifiee}$.<br>`
      } else {
        // Si x est une fraction
        const inverse = new FractionEtendue(point.xDen, point.xNum)
        this.correction += `On calcule $\\dfrac{${k}}{${point.xTex}}=${k}\\times ${inverse.texFractionSimplifiee}=${yTheorique.texFractionSimplifiee}$.<br>`
      }

      // Comparer avec l'ordonnée du point en utilisant isEqual()
      if (y.isEqual(yTheorique)) {
        this.correction += `On a $y_{_{${point.nom}}}=${yTheorique.texFractionSimplifiee}$ donc $${point.nom}$ appartient à la courbe.<br>`
      } else {
        this.correction += `On a $y_{_{${point.nom}}}=${y.texFractionSimplifiee}\\neq ${yTheorique.texFractionSimplifiee}$ donc $${miseEnEvidence(texteDuPoint(point))}$ n'appartient pas à la courbe.<br>`
      }
    }
  }

  versionAleatoire: () => void = () => {
    const k = choice([3, 4, 6, 8])

    let bonnesReponses: Array<{
      texte: string
      nom: string
      xNum: number
      xDen: number
      xTex: string
      yNum: number
      yDen: number
    }>
    let mauvaisesReponses: Array<{
      texte: string
      nom: string
      xNum: number
      xDen: number
      xTex: string
      yNum: number
      yDen: number
    }>

    if (k === 4) {
      // Hyperbole y = 4/x
      bonnesReponses = [
        // Erreur : multiplication par la fraction au lieu de l'inverse
        {
          texte: `$M\\left(\\dfrac{8}{3}\\,;\\,\\dfrac{32}{3}\\right)$`,
          nom: 'M',
          xNum: 8,
          xDen: 3,
          xTex: '\\dfrac{8}{3}',
          yNum: 32,
          yDen: 3,
        },
        {
          texte: `$N\\left(\\dfrac{2}{5}\\,;\\,\\dfrac{8}{5}\\right)$`,
          nom: 'N',
          xNum: 2,
          xDen: 5,
          xTex: '\\dfrac{2}{5}',
          yNum: 8,
          yDen: 5,
        },
        // Erreur : mauvaise simplification
        {
          texte: `$P\\left(\\dfrac{12}{5}\\,;\\,\\dfrac{12}{5}\\right)$`,
          nom: 'P',
          xNum: 12,
          xDen: 5,
          xTex: '\\dfrac{12}{5}',
          yNum: 12,
          yDen: 5,
        },
        {
          texte: `$Q\\left(\\dfrac{6}{7}\\,;\\,\\dfrac{6}{7}\\right)$`,
          nom: 'Q',
          xNum: 6,
          xDen: 7,
          xTex: '\\dfrac{6}{7}',
          yNum: 6,
          yDen: 7,
        },
        // Erreur : valeur entière proche
        {
          texte: `$R\\left(\\dfrac{4}{3}\\,;\\,4\\right)$`,
          nom: 'R',
          xNum: 4,
          xDen: 3,
          xTex: '\\dfrac{4}{3}',
          yNum: 4,
          yDen: 1,
        },
        {
          texte: `$S(2\\,;\\,3)$`,
          nom: 'S',
          xNum: 2,
          xDen: 1,
          xTex: '2',
          yNum: 3,
          yDen: 1,
        },
        {
          texte: `$T(8\\,;\\,1)$`,
          nom: 'T',
          xNum: 8,
          xDen: 1,
          xTex: '8',
          yNum: 1,
          yDen: 1,
        },
      ]
      mauvaisesReponses = [
        {
          texte: `$U\\left(\\dfrac{8}{3}\\,;\\,\\dfrac{3}{2}\\right)$`,
          nom: 'U',
          xNum: 8,
          xDen: 3,
          xTex: '\\dfrac{8}{3}',
          yNum: 3,
          yDen: 2,
        },
        {
          texte: `$V\\left(\\dfrac{12}{7}\\,;\\,\\dfrac{7}{3}\\right)$`,
          nom: 'V',
          xNum: 12,
          xDen: 7,
          xTex: '\\dfrac{12}{7}',
          yNum: 7,
          yDen: 3,
        },
        {
          texte: `$W\\left(\\dfrac{6}{5}\\,;\\,\\dfrac{10}{3}\\right)$`,
          nom: 'W',
          xNum: 6,
          xDen: 5,
          xTex: '\\dfrac{6}{5}',
          yNum: 10,
          yDen: 3,
        },
        {
          texte: `$X\\left(\\dfrac{2}{3}\\,;\\,6\\right)$`,
          nom: 'X',
          xNum: 2,
          xDen: 3,
          xTex: '\\dfrac{2}{3}',
          yNum: 6,
          yDen: 1,
        },
        {
          texte: `$Y(2\\,;\\,2)$`,
          nom: 'Y',
          xNum: 2,
          xDen: 1,
          xTex: '2',
          yNum: 2,
          yDen: 1,
        },
        {
          texte: `$Z(4\\,;\\,1)$`,
          nom: 'Z',
          xNum: 4,
          xDen: 1,
          xTex: '4',
          yNum: 1,
          yDen: 1,
        },
      ]
    } else if (k === 6) {
      // Hyperbole y = 6/x
      bonnesReponses = [
        // Erreur : multiplication par la fraction au lieu de l'inverse
        {
          texte: `$M\\left(12\\,;\\,\\dfrac{1}{3}\\right)$`,
          nom: 'M',
          xNum: 12,
          xDen: 1,
          xTex: '12',
          yNum: 1,
          yDen: 3,
        },
        {
          texte: `$N\\left(\\dfrac{1}{3}\\,;\\,\\dfrac{1}{3}\\right)$`,
          nom: 'N',
          xNum: 1,
          xDen: 3,
          xTex: '\\dfrac{1}{3}',
          yNum: 1,
          yDen: 3,
        },
        {
          texte: `$P\\left(\\dfrac{2}{3}\\,;\\,3\\right)$`,
          nom: 'P',
          xNum: 2,
          xDen: 3,
          xTex: '\\dfrac{2}{3}',
          yNum: 3,
          yDen: 1,
        },
        {
          texte: `$Q\\left(\\dfrac{3}{5}\\,;\\,\\dfrac{18}{5}\\right)$`,
          nom: 'Q',
          xNum: 3,
          xDen: 5,
          xTex: '\\dfrac{3}{5}',
          yNum: 18,
          yDen: 5,
        },
        // Erreur : mauvaise simplification
        {
          texte: `$R\\left(\\dfrac{4}{7}\\,;\\,\\dfrac{24}{7}\\right)$`,
          nom: 'R',
          xNum: 4,
          xDen: 7,
          xTex: '\\dfrac{4}{7}',
          yNum: 24,
          yDen: 7,
        },
        {
          texte: `$S\\left(\\dfrac{8}{3}\\,;\\,\\dfrac{8}{3}\\right)$`,
          nom: 'S',
          xNum: 8,
          xDen: 3,
          xTex: '\\dfrac{8}{3}',
          yNum: 8,
          yDen: 3,
        },
        // Erreur : valeur entière proche
        {
          texte: `$T(3\\,;\\,3)$`,
          nom: 'T',
          xNum: 3,
          xDen: 1,
          xTex: '3',
          yNum: 3,
          yDen: 1,
        },
        {
          texte: `$U(6\\,;\\,2)$`,
          nom: 'U',
          xNum: 6,
          xDen: 1,
          xTex: '6',
          yNum: 2,
          yDen: 1,
        },
      ]
      mauvaisesReponses = [
        {
          texte: `$V\\left(\\dfrac{6}{5}\\,;\\,5\\right)$`,
          nom: 'V',
          xNum: 6,
          xDen: 5,
          xTex: '\\dfrac{6}{5}',
          yNum: 5,
          yDen: 1,
        },
        {
          texte: `$W\\left(\\dfrac{12}{5}\\,;\\,\\dfrac{5}{2}\\right)$`,
          nom: 'W',
          xNum: 12,
          xDen: 5,
          xTex: '\\dfrac{12}{5}',
          yNum: 5,
          yDen: 2,
        },
        {
          texte: `$X\\left(\\dfrac{4}{3}\\,;\\,\\dfrac{9}{2}\\right)$`,
          nom: 'X',
          xNum: 4,
          xDen: 3,
          xTex: '\\dfrac{4}{3}',
          yNum: 9,
          yDen: 2,
        },
        {
          texte: `$Y\\left(\\dfrac{2}{5}\\,;\\,15\\right)$`,
          nom: 'Y',
          xNum: 2,
          xDen: 5,
          xTex: '\\dfrac{2}{5}',
          yNum: 15,
          yDen: 1,
        },
        {
          texte: `$Z(2\\,;\\,3)$`,
          nom: 'Z',
          xNum: 2,
          xDen: 1,
          xTex: '2',
          yNum: 3,
          yDen: 1,
        },
      ]
    } else if (k === 8) {
      // Hyperbole y = 8/x
      bonnesReponses = [
        // Erreur : multiplication par la fraction au lieu de l'inverse
        {
          texte: `$M\\left(\\dfrac{1}{4}\\,;\\,\\dfrac{1}{4}\\right)$`,
          nom: 'M',
          xNum: 1,
          xDen: 4,
          xTex: '\\dfrac{1}{4}',
          yNum: 1,
          yDen: 4,
        },
        {
          texte: `$N\\left(\\dfrac{3}{4}\\,;\\,5\\right)$`,
          nom: 'N',
          xNum: 3,
          xDen: 4,
          xTex: '\\dfrac{3}{4}',
          yNum: 5,
          yDen: 1,
        },
        {
          texte: `$P\\left(\\dfrac{2}{5}\\,;\\,\\dfrac{16}{5}\\right)$`,
          nom: 'P',
          xNum: 2,
          xDen: 5,
          xTex: '\\dfrac{2}{5}',
          yNum: 16,
          yDen: 5,
        },
        // Erreur : mauvaise simplification
        {
          texte: `$Q\\left(\\dfrac{12}{5}\\,;\\,\\dfrac{8}{5}\\right)$`,
          nom: 'Q',
          xNum: 12,
          xDen: 5,
          xTex: '\\dfrac{12}{5}',
          yNum: 8,
          yDen: 5,
        },
        {
          texte: `$R\\left(\\dfrac{8}{7}\\,;\\,\\dfrac{56}{7}\\right)$`,
          nom: 'R',
          xNum: 8,
          xDen: 7,
          xTex: '\\dfrac{8}{7}',
          yNum: 56,
          yDen: 7,
        },
        // Erreur : valeur entière proche
        {
          texte: `$S(4\\,;\\,3)$`,
          nom: 'S',
          xNum: 4,
          xDen: 1,
          xTex: '4',
          yNum: 3,
          yDen: 1,
        },
        {
          texte: `$T(16\\,;\\,1)$`,
          nom: 'T',
          xNum: 16,
          xDen: 1,
          xTex: '16',
          yNum: 1,
          yDen: 1,
        },
      ]
      mauvaisesReponses = [
        {
          texte: `$U\\left(\\dfrac{8}{3}\\,;\\,3\\right)$`,
          nom: 'U',
          xNum: 8,
          xDen: 3,
          xTex: '\\dfrac{8}{3}',
          yNum: 3,
          yDen: 1,
        },
        {
          texte: `$V\\left(\\dfrac{12}{7}\\,;\\,\\dfrac{14}{3}\\right)$`,
          nom: 'V',
          xNum: 12,
          xDen: 7,
          xTex: '\\dfrac{12}{7}',
          yNum: 14,
          yDen: 3,
        },
        {
          texte: `$W\\left(\\dfrac{6}{5}\\,;\\,\\dfrac{20}{3}\\right)$`,
          nom: 'W',
          xNum: 6,
          xDen: 5,
          xTex: '\\dfrac{6}{5}',
          yNum: 20,
          yDen: 3,
        },
        {
          texte: `$X\\left(\\dfrac{4}{3}\\,;\\,6\\right)$`,
          nom: 'X',
          xNum: 4,
          xDen: 3,
          xTex: '\\dfrac{4}{3}',
          yNum: 6,
          yDen: 1,
        },
        {
          texte: `$Y(2\\,;\\,4)$`,
          nom: 'Y',
          xNum: 2,
          xDen: 1,
          xTex: '2',
          yNum: 4,
          yDen: 1,
        },
      ]
    } else {
      // k === 3, Hyperbole y = 3/x
      bonnesReponses = [
        // Erreur : multiplication par la fraction au lieu de l'inverse
        {
          texte: `$M\\left(\\dfrac{1}{2}\\,;\\,\\dfrac{1}{2}\\right)$`,
          nom: 'M',
          xNum: 1,
          xDen: 2,
          xTex: '\\dfrac{1}{2}',
          yNum: 1,
          yDen: 2,
        },
        {
          texte: `$N\\left(\\dfrac{2}{5}\\,;\\,\\dfrac{6}{5}\\right)$`,
          nom: 'N',
          xNum: 2,
          xDen: 5,
          xTex: '\\dfrac{2}{5}',
          yNum: 6,
          yDen: 5,
        },
        {
          texte: `$P\\left(\\dfrac{4}{3}\\,;\\,3\\right)$`,
          nom: 'P',
          xNum: 4,
          xDen: 3,
          xTex: '\\dfrac{4}{3}',
          yNum: 3,
          yDen: 1,
        },
        // Erreur : mauvaise simplification
        {
          texte: `$Q\\left(\\dfrac{6}{5}\\,;\\,\\dfrac{18}{5}\\right)$`,
          nom: 'Q',
          xNum: 6,
          xDen: 5,
          xTex: '\\dfrac{6}{5}',
          yNum: 18,
          yDen: 5,
        },
        {
          texte: `$R\\left(\\dfrac{9}{4}\\,;\\,\\dfrac{9}{4}\\right)$`,
          nom: 'R',
          xNum: 9,
          xDen: 4,
          xTex: '\\dfrac{9}{4}',
          yNum: 9,
          yDen: 4,
        },
        // Erreur : valeur entière proche
        {
          texte: `$S(6\\,;\\,1)$`,
          nom: 'S',
          xNum: 6,
          xDen: 1,
          xTex: '6',
          yNum: 1,
          yDen: 1,
        },
        {
          texte: `$T(9\\,;\\,1)$`,
          nom: 'T',
          xNum: 9,
          xDen: 1,
          xTex: '9',
          yNum: 1,
          yDen: 1,
        },
      ]
      mauvaisesReponses = [
        {
          texte: `$U\\left(\\dfrac{6}{5}\\,;\\,\\dfrac{5}{2}\\right)$`,
          nom: 'U',
          xNum: 6,
          xDen: 5,
          xTex: '\\dfrac{6}{5}',
          yNum: 5,
          yDen: 2,
        },
        {
          texte: `$V\\left(\\dfrac{12}{7}\\,;\\,\\dfrac{7}{4}\\right)$`,
          nom: 'V',
          xNum: 12,
          xDen: 7,
          xTex: '\\dfrac{12}{7}',
          yNum: 7,
          yDen: 4,
        },
        {
          texte: `$W\\left(\\dfrac{4}{5}\\,;\\,\\dfrac{15}{4}\\right)$`,
          nom: 'W',
          xNum: 4,
          xDen: 5,
          xTex: '\\dfrac{4}{5}',
          yNum: 15,
          yDen: 4,
        },
        {
          texte: `$X\\left(\\dfrac{2}{3}\\,;\\,\\dfrac{9}{2}\\right)$`,
          nom: 'X',
          xNum: 2,
          xDen: 3,
          xTex: '\\dfrac{2}{3}',
          yNum: 9,
          yDen: 2,
        },
        {
          texte: `$Y(3\\,;\\,1)$`,
          nom: 'Y',
          xNum: 3,
          xDen: 1,
          xTex: '3',
          yNum: 1,
          yDen: 1,
        },
      ]
    }

    this.appliquerLesValeurs(k, bonnesReponses, mauvaisesReponses)
  }

  /**
   * Version sans QCM : l'élève dit si le point proposé appartient ou non à la courbe.
   * Les tirages sont ceux du QCM ; un tirage supplémentaire choisit le point
   * (celui qui n'appartient pas à la courbe ou l'un des trois autres).
   */
  nouvelleVersion() {
    if (this.sup3) {
      super.nouvelleVersion()
      return
    }
    if (context.isAmc) {
      // L'export AMC reste un QCM : on court-circuite ExerciceQcmACourt
      ExerciceQcmA.prototype.nouvelleVersion.call(this)
      return
    }

    this.consigne = ''
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 30; cpt++) {
      this.versionAleatoire()
      const k = this.k
      const appartient = choice([true, false])
      const point = appartient
        ? this.mauvaisPointsChoisis[0]
        : (this.bonnePointChoisi as PointCourbe)
      const bonneReponse = appartient ? APPARTIENT : N_APPARTIENT_PAS
      const debut = `Dans un repère orthonormé, on considère la courbe d'équation $y=\\dfrac{${k}}{x}$.<br>`

      if (this.questionJamaisPosee(i, k, point.nom, bonneReponse)) {
        const choices = [
          { label: 'Choisir une réponse', value: '' },
          { label: APPARTIENT, value: APPARTIENT },
          { label: N_APPARTIENT_PAS, value: N_APPARTIENT_PAS },
        ]
        this.listeQuestions[i] =
          this.interactif && context.isHtml
            ? `${debut}Le point ${point.texte} ${choixDeroulant(this, i, { choices })} à cette courbe.`
            : `${debut}Déterminer si le point ${point.texte} appartient ou non à cette courbe.`
        this.listeCorrections[i] =
          `Pour vérifier si un point $(x\\,;\\,y)$ appartient à la courbe d'équation $y=\\dfrac{${k}}{x}$, on vérifie si les coordonnées satisfont l'équation.<br>` +
          this.correctionPoint(k, point)

        handleAnswers(
          this,
          i,
          { reponse: { value: bonneReponse } },
          { formatInteractif: 'liste-deroulante' },
        )
        i++
      }
    }
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.spacingCorr = 2
  }
}
