import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
export const uuid = '67e1a'
export const refs = {
  'fr-fr': ['3L1QCM-02'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Équation produit nul (2013 Centres étrangers)'
export const dateDePublication = '30/10/2024'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export default class EtrangersJuin13Exo1Q1 extends ExerciceQcmA {
  private appliquerLesValeurs(a: number, b: number, c: number): void {
    const s1 = -a
    const s2 = c / b
    this.reponses = [
      `$${String(s1)}$ et $${texNombre(s2, 2)}$`,
      `$${String(-s1)}$ et $${texNombre(-s2, 2)}$`,
      `$${String(s1)}$ et $${String(c - b)}$`,
    ]
    this.enonce = `Les solutions de l'équation  $(x+${String(a)})(${String(b)}x-${String(c)})=0$ sont :`
    this.correction = `Un produit de facteurs est nul si l'un des facteurs est nul, soit <br>
    $\\left\\{\\begin{array}{l c l}
    x+${String(a)}&=0\\\\
    \\text{ou}&\\\\
    ${String(b)}x-${String(c)}&=0\\\\
    \\end{array}\\right.$ d'où $\\left\\{\\begin{array}{l c l}
    x&=-${String(a)}\\\\
     \\text{ou}&\\\\
     ${String(b)}x&=${String(c)}\\\\
      \\end{array}\\right.$ soit $\\left\\{\\begin{array}{l c l}
      x&=${String(s1)}\\\\
      \\text{ou}&\\\\
       x&=${texNombre(s2, 2)}\\\\
        \\end{array}\\right.$.<br>`

    this.correction += `Donc, l'équation $(x+${String(a)})(${String(b)}x-${String(c)})=0$ a pour solutions $${miseEnEvidence(`x=${String(s1)}`)}$ ${texteEnCouleurEtGras('et')} $${miseEnEvidence(`x=${texNombre(s2, 2)}`)}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(7, 2, 7)
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      const a = randint(2, 9)
      const c = randint(5, 9)
      const b = choice([2, 4])
      this.appliquerLesValeurs(a, b, c)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
