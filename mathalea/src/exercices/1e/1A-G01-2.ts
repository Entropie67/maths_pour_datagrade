import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { labelPoint, latex2d } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmACourt, { type ChampsReponseCourte } from '../ExerciceQcmACourt'

export const uuid = 'a9012'
export const refs = {
  'fr-fr': ['1A-G01-2', '2A-G2-1'],
  'fr-ch': ['9R1QCMES-1', '9R2QCMES-1', '9R3QCMES-1'],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre = "Lire les coordonnées d'un point dans un repère"
export const dateDePublication = '18/06/2026'
export const dateDeModifImportante = '28/10/2026'

/**
 * Version QCM de 3AutoG01-2.
 * @author Stéphane Guyon
 */
export default class LireCoordonneesPointQCM extends ExerciceQcmACourt {
  clavierReponseCourte = KeyboardType.lyceeClassique
  private figureCourante = ''
  private abscisseA = 0
  private ordonneeA = 0

  champsReponseCourte = (): ChampsReponseCourte => ({
    gabarit: 'A\\left(%{champ1}\\,;\\,%{champ2}\\right)',
    reponses: {
      champ1: {
        value: String(this.abscisseA),
        options: { nombreDecimalSeulement: true },
      },
      champ2: {
        value: String(this.ordonneeA),
        options: { nombreDecimalSeulement: true },
      },
    },
  })
  enonceCourt = () =>
    `On considère le repère ci-dessous :<br><br>${this.figureCourante}<br>
${this.interactif ? 'Les coordonnées du point $A$ sont :' : 'Lire les coordonnées du point $A$.'}`

  private coordonneesTex(
    label: string,
    x: number,
    y: number,
    egalApresLabel = false,
  ) {
    return `$${label}${egalApresLabel ? '=' : ''}\\left(${texNombre(x)}\\,;\\,${texNombre(y)}\\right)$`
  }

  private construireFigure(x: number, y: number, label: string) {
    const xMin = Math.min(0, x) - 1
    const xMax = Math.max(0, x) + 1
    const yMin = Math.min(0, y) - 1
    const yMax = Math.max(0, y) + 1
    const point = pointAbstrait(x, y, label, 'above left')
    // Mêmes graduations que par défaut (sans les bords du cadre)
    const graduations = (min: number, max: number) => [
      ...Array.from({ length: max - 1 }, (_, i) => i + 1),
      ...Array.from({ length: -min - 1 }, (_, i) => -(i + 1)),
    ]
    // Graduations des ordonnées remontées de 2 mm (0,2 cm) pour dégager le signe moins
    const ordonnees = graduations(yMin, yMax).map((v) =>
      latex2d(`${v}`, -0.5, v + 0.3, {
        letterSize: 'scriptsize',
        opacity: 0.8,
        color: 'black',
      }),
    )
    return mathalea2d(
      {
        xmin: xMin,
        ymin: yMin,
        xmax: xMax,
        ymax: yMax,
        pixelsParCm: 30,
        scale: 0.75,
        display: 'block',
        center: !context.isHtml,
      },
      repere({
        xMin,
        yMin,
        xMax,
        yMax,
        grilleSecondaire: true,
        grilleSecondaireDistance: 1,
        grilleSecondaireOpacite: 0.15,
        grilleSecondaireXMin: xMin,
        grilleSecondaireYMin: yMin,
        grilleSecondaireXMax: xMax,
        grilleSecondaireYMax: yMax,
        labelsYareVisible: false,
      }),
      ...ordonnees,
      tracePoint(point, 'red'),
      labelPoint(point),
    )
  }

  versionAleatoire = () => {
    const absX = randint(1, 5)
    let absY = randint(1, 5, absX)
    while (absY === absX) {
      absY = randint(1, 5, absX)
    }
    const x = randint(0, 1) === 0 ? -absX : absX
    const y = -Math.sign(x) * absY
    const label = 'A'

    const bonneReponse = this.coordonneesTex(label, x, y)
    const propositions = [
      bonneReponse,
      this.coordonneesTex(label, y, x),
      this.coordonneesTex(label, -x, y),
      this.coordonneesTex(label, x, -y),
      this.coordonneesTex(label, -y, -x),
    ]
    this.reponses = [...new Set(propositions)].slice(0, 4)

    const figure = this.construireFigure(x, y, label)
    this.figureCourante = figure
    this.abscisseA = x
    this.ordonneeA = y
    this.enonce = `On considère le repère ci-dessous :<br>${figure}
Les coordonnées du point $${label}$ sont :`
    // En QCM, la proposition exacte est mise en évidence entière ; en saisie libre, seuls l'abscisse et l'ordonnée
    const coordonnees = this.sup3
      ? miseEnEvidence(bonneReponse.slice(1, -1))
      : `${label}\\left(${miseEnEvidence(texNombre(x))}\\,;\\,${miseEnEvidence(texNombre(y))}\\right)`
    this.correction = `On lit d'abord l'abscisse sur l'axe horizontal, puis l'ordonnée sur l'axe vertical.<br>
Le point $${label}$ a donc pour coordonnées $${coordonnees}$.`
  }

  constructor() {
    super()

    this.nbQuestions = 1
    this.versionAleatoire()
  }
}
