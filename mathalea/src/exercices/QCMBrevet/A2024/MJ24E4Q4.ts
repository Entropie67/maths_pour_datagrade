import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { droite } from '../../../lib/2d/droites'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import RepereBuilder from '../../../lib/2d/RepereBuilder'
import { latex2d } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { mathalea2d } from '../../../modules/mathalea2d'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = '1c2db'
export const refs = {
  'fr-fr': ['3F1QCM-1'],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Lire graphiquement un antécédent (2024 Métropole)'
export const dateDePublication = '28/10/2024'
/**
 *
 * @author Jean-Claude LHOTE
 */

export default class MetropoleJuin24Exo4Q4 extends ExerciceQcmA {
  private appliquerLesValeurs(a: number): void {
    const deltaY = -2 * a
    const deltaX = Math.abs(a)

    const f = (x: number) => (x * deltaY) / deltaX + a
    const antecedent = choice([0, Math.abs(a)])
    const image = f(antecedent)
    this.reponses = [
      `$${antecedent}$`,
      `$${antecedent === 0 ? String(a) : '0'}$`,
      `$${antecedent === 0 ? String(-a) : antecedent === a ? String(-a) : String(a)}$`,
    ]
    const xMin = -1
    const xMax = 6.5
    const yMin = -6.5
    const yMax = 6.5
    this.enonce = `Quel est l'antécédent de $${image}$ par la fonction $f$ ?`
    const theRepere = new RepereBuilder({ xMin, xMax, yMin, yMax })
      .setGrille({
        grilleX: { dx: 1, xMin, xMax },
        grilleY: { yMin: yMin + 0.5, yMax, dy: 1 },
      })
      .setThickX({ xMin, xMax, dx: 1 })
      .setThickY({ yMin, yMax, dy: 1 })
      .buildStandard().objets
    const cF = droite(pointAbstrait(0, a), pointAbstrait(Math.abs(a), -a))
    cF.color = colorToLatexOrHTML(bleuMathalea)
    const labelF = latex2d('\\mathcal{C_f}', 1.5, 1.7, { color: bleuMathalea })
    const objets = [...theRepere, cF, labelF]
    this.enonce += mathalea2d(
      Object.assign({ pixelsParCm: 20, scale: 0.5 }, fixeBordures(objets)),
      objets,
    )
    this.correction = `L'antécédent de $${image}$ est $${miseEnEvidence(antecedent.toString())}$, on note $f(${antecedent}) = ${image}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(3)
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      const a = choice([2, 3, 4, 5, 6]) * choice([-1, 1])
      this.appliquerLesValeurs(a)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
