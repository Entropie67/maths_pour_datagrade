import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmACourt, { type ChampsReponseCourte } from '../ExerciceQcmACourt'

export const titre =
  "Lire les coordonnées fractionnaires d'un point dans un repère"
export const dateDePublication = '21/06/2026'
export const dateDeModifImportante = '28/10/2026'

export const uuid = 'd3f74'

export const refs = {
  'fr-fr': ['1A-G01-4', '2A-G2-2'],
  'fr-ch': ['9R1QCMES-2', '9R2QCMES-2', '9R3QCMES-2'],
}

export const interactifReady = true

export const amcReady = true

type Fraction = [numerateur: number, denominateur: number]
type Coordonnees = [abscisse: Fraction, ordonnee: Fraction]

/**
 * Lire les coordonnées d'un point dans un repère dont les axes ont des
 * subdivisions fractionnaires différentes.
 * @author Stéphane Guyon
 */
export default class LireCoordonneesFractionnairesQcm extends ExerciceQcmACourt {
  clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
  private figureCourante = ''
  private abscisseA = ''
  private ordonneeA = ''

  champsReponseCourte = (): ChampsReponseCourte => ({
    gabarit: 'A\\left(%{champ1}\\,;\\,%{champ2}\\right)',
    reponses: {
      champ1: {
        value: this.abscisseA,
        options: { fractionIrreductible: true, nombreDecimalSeulement: true },
      },
      champ2: {
        value: this.ordonneeA,
        options: { fractionIrreductible: true, nombreDecimalSeulement: true },
      },
    },
  })

  enonceCourt = () =>
    `Dans le repère ci-dessous, lire les coordonnées du point $A$.${this.figureCourante}`

  private fractionIrreductible([numerateur, denominateur]: Fraction): Fraction {
    const diviseur = pgcd(Math.abs(numerateur), Math.abs(denominateur))
    const signe = denominateur < 0 ? -1 : 1
    return [(signe * numerateur) / diviseur, Math.abs(denominateur) / diviseur]
  }

  private fractionTex(fraction: Fraction) {
    const [numerateur, denominateur] = this.fractionIrreductible(fraction)
    return denominateur === 1
      ? `${numerateur}`
      : new FractionEtendue(numerateur, denominateur).texFSD
  }

  private coordonneesTex([abscisse, ordonnee]: Coordonnees) {
    return `A\\left(${this.fractionTex(abscisse)}\\,;\\,${this.fractionTex(ordonnee)}\\right)`
  }

  private construireFigure(
    abscisse: Fraction,
    ordonnee: Fraction,
    denominateurX: number,
    denominateurY: number,
  ) {
    const x = abscisse[0] / abscisse[1]
    const y = ordonnee[0] / ordonnee[1]
    const positionLabel =
      Math.abs(x) <= Math.abs(y)
        ? x < 0
          ? 'left'
          : 'right'
        : y < 0
          ? 'below'
          : 'above'
    const pointA = pointAbstrait(x, y, 'A', positionLabel)
    const xmin = -3
    const xmax = 3
    const ymin = -3
    const ymax = 3
    const repereFractionnaire = repere({
      xMin: xmin,
      xMax: xmax,
      yMin: ymin,
      yMax: ymax,
      xThickDistance: 1 / denominateurX,
      yThickDistance: 1 / denominateurY,
      xLabelDistance: 1,
      yLabelDistance: 1,
      grilleSecondaire: true,
      grilleSecondaireXDistance: 1 / denominateurX,
      grilleSecondaireYDistance: 1 / denominateurY,
      grilleSecondaireXMin: xmin,
      grilleSecondaireXMax: xmax,
      grilleSecondaireYMin: ymin,
      grilleSecondaireYMax: ymax,
      axeXStyle: '->',
      axeYStyle: '->',
    })
    return mathalea2d(
      {
        xmin: xmin - 0.5,
        xmax: xmax + 0.5,
        ymin: ymin - 0.5,
        ymax: ymax + 0.5,
        pixelsParCm: 30,
        scale: 0.8,
      },
      repereFractionnaire,
      tracePoint(pointA, orangeMathalea),
      labelPoint(pointA, orangeMathalea),
    )
  }

  private numerateurNonEntier(denominateur: number) {
    let valeurAbsolue: number
    do {
      valeurAbsolue = randint(1, 2 * denominateur)
    } while (valeurAbsolue % denominateur === 0)
    return randint(0, 1) === 0 ? valeurAbsolue : -valeurAbsolue
  }

  versionAleatoire = () => {
    const denominateurX = choice([3, 4, 5])
    const denominateurY = choice(
      [3, 4, 5].filter((denominateur) => denominateur !== denominateurX),
    )
    const abscisse: Fraction = [
      this.numerateurNonEntier(denominateurX),
      denominateurX,
    ]
    const ordonnee: Fraction = [
      this.numerateurNonEntier(denominateurY),
      denominateurY,
    ]
    const bonneReponse: Coordonnees = [abscisse, ordonnee]
    const candidats: Coordonnees[] = [
      bonneReponse,
      [ordonnee, abscisse],
      [[-abscisse[0], abscisse[1]], ordonnee],
      [abscisse, [-ordonnee[0], ordonnee[1]]],
      [
        [-abscisse[0], abscisse[1]],
        [-ordonnee[0], ordonnee[1]],
      ],
      [
        [abscisse[0], denominateurY],
        [ordonnee[0], denominateurX],
      ],
    ]
    const reponsesUniques = new Map<string, string>()
    for (const coordonnees of candidats) {
      const texte = this.coordonneesTex(coordonnees)
      reponsesUniques.set(texte, `$${texte}$`)
    }
    this.reponses = [...reponsesUniques.values()].slice(0, 4)

    const figure = this.construireFigure(
      abscisse,
      ordonnee,
      denominateurX,
      denominateurY,
    )
    this.figureCourante = figure
    this.abscisseA = this.fractionTex(abscisse)
    this.ordonneeA = this.fractionTex(ordonnee)
    const coordonneesCorrectesTex = this.coordonneesTex(bonneReponse)
    this.enonce = `Dans le repère ci-dessous, quelles sont les coordonnées du point $A$ ?${figure}`
    const coordonnees = miseEnEvidence(coordonneesCorrectesTex)
    this.correction = `Sur l'axe des abscisses, une petite graduation représente $\\dfrac{1}{${denominateurX}}$. On lit donc $x_A=${this.fractionTex(abscisse)}$.<br>
Sur l'axe des ordonnées, une petite graduation représente $\\dfrac{1}{${denominateurY}}$. On lit donc $y_A=${this.fractionTex(ordonnee)}$.<br>
Ainsi, les coordonnées du point $A$ sont $${coordonnees}$.`
  }

  constructor() {
    super()

    this.nbQuestions = 1
    this.versionAleatoire()
  }
}
