import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = '44f7a'
export const refs = {
  'fr-fr': ['3C1QCM-05'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Puissances (06/2021 Asie)'
export const dateDePublication = '09/11/2024'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */

export default class AsieJuin21Exo1Q5 extends ExerciceQcmA {
  private appliquerLesValeurs(a: number, b: number): void {
    this.reponses = [
      `$${String(a)}^{${texNombre(b + 1, 0)}}$`,
      `$${String(a)}^{${texNombre(2 * b, 0)}}$`,
      `$${String(a * a)}^{${texNombre(b, 0)}}$`,
    ]
    this.enonce = `$${String(a)}\\times ${String(a)}^{${texNombre(b, 0)}}$ est égal à :`
    this.correction = `$\\begin{aligned}${String(a)}\\times ${String(a)}^{${texNombre(b, 0)}}&=${String(a)}^1\\times ${String(a)}^{${texNombre(b, 0)}}\\\\
    &=${String(a)}^{${texNombre(b, 0)}+1}\\\\
    &=${miseEnEvidence(`${String(a)}^{${texNombre(b + 1, 0)}}`)}
    \\end{aligned}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(2, 400)
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      const a = randint(2, 9)
      const b = randint(2, 9) * choice([10, 100, 1000])
      this.appliquerLesValeurs(a, b)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
