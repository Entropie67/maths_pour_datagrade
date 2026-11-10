import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import type { ObjetMathalea2D } from '../../lib/2d/ObjetMathalea2D'
import { penteAffineAnimee } from '../../lib/2d/PenteAffineAnimee'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import {
  bleuMathalea,
  coopmathsAction,
  coopmathsCorpus,
  vertMathalea,
} from '../../lib/colors'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { reduireAxPlusB } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
import { sp } from '../../lib/outils/outilString'

export const titre =
  "Reconnaître la représentation graphique d'une fonction affine (coefficient directeur fractionnaire)"
export const dateDePublication = '29/06/2026'

export const uuid = '15233'
/**
 * @author Stéphane Guyon
 *
 */
export const refs = {
  'fr-fr': ['1A-F03-4'],
  'fr-ch': ['1mQCM-55', '11LCQCMFA2B-3', '11LSQCMFA2B-3'],
}

export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

type DroiteAffine = {
  pente: number
  ordonneeOrigine: number
  estBonneReponse: boolean
  couleur: string
  numero?: number
}

/**
 * Reconnaître graphiquement la droite représentant une fonction affine.
 * @author Stéphane Guyon
 */
export default class ReconnaissanceGraphiqueFonctionAffine extends ExerciceQcmA {
  private sontDistinctes(droites: DroiteAffine[]) {
    return droites.every((droite, index) =>
      droites
        .slice(index + 1)
        .every(
          (autreDroite) =>
            droite.pente !== autreDroite.pente ||
            droite.ordonneeOrigine !== autreDroite.ordonneeOrigine,
        ),
    )
  }

  private positionLabel(
    pente: number,
    ordonneeOrigine: number,
    xMin: number,
    xMax: number,
    yMin: number,
    yMax: number,
    labelsUtilises: { x: number; y: number }[],
  ) {
    const distanceMinimale = 1
    const ecartExterieur = 0.55
    const candidats = [
      { x: xMax + ecartExterieur, y: pente * xMax + ordonneeOrigine },
      { x: xMin - ecartExterieur, y: pente * xMin + ordonneeOrigine },
      { x: (yMax - ordonneeOrigine) / pente, y: yMax + ecartExterieur },
      { x: (yMin - ordonneeOrigine) / pente, y: yMin - ecartExterieur },
    ].filter(
      ({ x, y }) =>
        x >= xMin - ecartExterieur &&
        x <= xMax + ecartExterieur &&
        y >= yMin - ecartExterieur &&
        y <= yMax + ecartExterieur,
    )

    const label = candidats.find(({ x, y }) =>
      labelsUtilises.every(
        (labelUtilise) =>
          Math.hypot(x - labelUtilise.x, y - labelUtilise.y) > distanceMinimale,
      ),
    ) ??
      candidats[0] ?? {
        x: xMax + ecartExterieur,
        y: Math.max(
          yMin + ecartExterieur,
          Math.min(yMax - ecartExterieur, pente * xMax + ordonneeOrigine),
        ),
      }

    labelsUtilises.push(label)
    return label
  }

  private creerFigure(droites: DroiteAffine[], id = '') {
    const xMin = -5
    const xMax = 5
    const yMin = -6
    const yMax = 6
    const r = repere({
      xMin,
      xMax,
      yMin,
      yMax,
      grilleX: true,
      grilleY: true,
      grilleSecondaire: true,
      grilleOpacite: 0.45,
      grilleSecondaireOpacite: 0.18,
      xLabelMin: xMin,
      xLabelMax: xMax,
      yLabelMin: yMin,
      yLabelMax: yMax,
      axeXStyle: '->',
      axeYStyle: '->',
    })
    const origine = latex2d('\\text{O}', -0.25, -0.35, {
      letterSize: 'scriptsize',
    })

    const objets: ObjetMathalea2D[] = [r, origine]
    const labelsUtilises: { x: number; y: number }[] = []
    for (const uneDroite of droites) {
      // La droite est limitée à la grille : on trace le segment qui la découpe.
      const { pente: m, ordonneeOrigine: p } = uneDroite
      const xAvecYMin = (yMin - p) / m
      const xAvecYMax = (yMax - p) / m
      const xDebut = Math.max(xMin, Math.min(xAvecYMin, xAvecYMax))
      const xFin = Math.min(xMax, Math.max(xAvecYMin, xAvecYMax))
      const d = segment(
        pointAbstrait(xDebut, m * xDebut + p),
        pointAbstrait(xFin, m * xFin + p),
      )
      d.color = colorToLatexOrHTML(uneDroite.couleur)
      objets.push(d)
      const label = this.positionLabel(
        uneDroite.pente,
        uneDroite.ordonneeOrigine,
        xMin,
        xMax,
        yMin,
        yMax,
        labelsUtilises,
      )
      objets.push(
        latex2d(`\\left(d_${uneDroite.numero}\\right)`, label.x, label.y, {
          color: uneDroite.couleur,
          backgroundColor: 'white',
          letterSize: 'scriptsize',
        }),
      )
    }

    return mathalea2d(
      {
        xmin: xMin - 1.1,
        xmax: xMax + 1.1,
        ymin: yMin - 1,
        ymax: yMax + 1,
        pixelsParCm: 25,
        scale: 0.72,
        center: !context.isHtml,
        id,
      },
      objets,
    )
  }

  private appliquerLesValeurs(a: FractionEtendue, b: number) {
    const couleursDesDroites = shuffle([
      bleuMathalea,
      coopmathsAction,
      vertMathalea,
      coopmathsCorpus,
    ])
    const pente = a.valeurDecimale
    const penteInverse = a.inverse().simplifie().valeurDecimale
    let droites: DroiteAffine[] = [
      {
        pente,
        ordonneeOrigine: b,
        estBonneReponse: true,
        couleur: couleursDesDroites[0],
      },
      {
        pente: -pente,
        ordonneeOrigine: b,
        estBonneReponse: false,
        couleur: couleursDesDroites[1],
      },
      {
        pente: penteInverse,
        ordonneeOrigine: b,
        estBonneReponse: false,
        couleur: couleursDesDroites[2],
      },
      {
        pente: -penteInverse,
        ordonneeOrigine: -b,
        estBonneReponse: false,
        couleur: couleursDesDroites[3],
      },
    ]

    if (!this.sontDistinctes(droites)) {
      droites[3] = {
        pente: pente + 1,
        ordonneeOrigine: b - 1,
        estBonneReponse: false,
        couleur: couleursDesDroites[3],
      }
    }

    droites = shuffle(droites).map((droite, index) => ({
      ...droite,
      numero: index + 1,
    }))

    const bonneDroite = droites.find((droite) => droite.estBonneReponse)
    if (bonneDroite == null) {
      throw new Error('Aucune bonne droite générée.')
    }
    const mauvaisesDroites = droites.filter((droite) => !droite.estBonneReponse)
    const figureId = `penteAffineEx${this.numeroExercice ?? 0}Q${this.indexQuestionHote ?? 0}`
    const figure = this.creerFigure(droites, figureId)
    const fonction = reduireAxPlusB(a, b)
    const animation =
      context.isHtml && !context.isTypst
        ? `<br>${penteAffineAnimee({
            figureId,
            b,
            numerateur: a.num,
            denominateur: a.den,
            pixelsParCm: 25,
          })}`
        : ''

    this.enonce = `On considère la fonction affine $f$ définie sur $\\mathbb{R}$ par $f(x)=${fonction}$.<br>
On a représenté ci-dessous quatre droites dans un repère.<br><br>
${figure}<br>
La droite qui représente $f$ est :`

    this.reponses = [
      `$\\left(d_${bonneDroite?.numero}\\right)$`,
      ...mauvaisesDroites.map(
        (droite) => `$\\left(d_${droite.numero}\\right)$`,
      ),
    ]

    this.correction = `La représentation graphique de la fonction $f$ est la droite d'équation $y=${fonction}$.<br>
Elle coupe l'axe des ordonnées en $${b}$ et son coefficient directeur est $${a.texFractionSimplifiee}$.<br>
On part donc du point $(0;${b})$ et on avance de $${Math.abs(a.den)}$ vers la droite puis on ${a.num > 0 ? 'monte' : 'descend'} de $${Math.abs(a.num)}$ pour «${sp()}retomber${sp()}» sur la bonne droite.<br>
La droite qui possède ces deux caractéristiques est $${miseEnEvidence(`\\left(d_${bonneDroite?.numero}\\right)`)}$.${animation}`
  }

  versionOriginale = () => {
    this.appliquerLesValeurs(new FractionEtendue(2, 3), 3)
  }

  versionAleatoire = () => {
    const [num, den] = choice([
      [1, 2],
      [1, 3],
      [2, 3],
      [3, 4],
      [-1, 2],
      [-1, 3],
      [-2, 3],
      [-3, 4],
    ])
    const a = new FractionEtendue(num, den).simplifie()
    let b = randint(-4, 4, 0)
    while (
      b === a.valeurDecimale * a.valeurDecimale ||
      b === -a.valeurDecimale * a.valeurDecimale
    ) {
      b = randint(-4, 4, 0)
    }
    this.appliquerLesValeurs(a, b)
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
