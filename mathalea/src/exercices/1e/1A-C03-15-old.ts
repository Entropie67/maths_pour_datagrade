// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid c091a continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'

import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'c091a'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Calculer le double ou le triple d'un nombre écrit avec une puissance"
export const dateDePublication = '14/02/2026'
/**
 *
 * @author Gilles Mora
 *
 */
export default class Auto1AC3jOld extends ExerciceQcmA {
  private appliquerLesValeurs(a: number, n: number, choix: string): void {
    this.enonce = `Le ${choix} de  $${texNombre(a * a, 0)}^{${n}}$ est égal à :`
    const k = choix === 'double' ? 2 : 3
    this.correction = `On a $${a * a}=${a}^{2}$ et on cherche ${choix === 'double' ? `le double de ` : `le triple de `} $${texNombre(a * a, 0)}^{${n}}$, soit $${k} \\times ${texNombre(a * a, 0)}^{${n}}$ donc :<br>
    $\\begin{aligned}
    ${k} \\times ${texNombre(a * a, 0)}^{${n}} & = ${k}\\times ${choix === 'double' ? ` \\left(2^{2}\\right)^{${n}}` : `\\left(3^{2}\\right)^{${n}}`} \\\\
    &=${k}\\times ${choix === 'double' ? ` 2^{${2 * n}}` : `3^{${2 * n}}`} \\\\
    &=${choix === 'double' ? `${miseEnEvidence(`2^{${2 * n + 1}}`)}` : `${miseEnEvidence(`3^{${2 * n + 1}}`)}`} \\\\
    \\end{aligned}$`

    this.reponses = [
      `${choix === 'double' ? `$2^{${2 * n + 1}}$` : `$3^{${2 * n + 1}}$`}`,
      `${choix === 'double' ? `$${2 * a * a}^{${n}}$` : `$${3 * a * a}^{${n}}$`}`,
      `${choix === 'double' ? `$2^{${n + 1}}$` : `$3^{${n + 1}}$`}`,
      `${choix === 'double' ? `$${a * a}^{${2 * n}}$` : `$${a * a}^{${3 * n}}$`}`,
    ]
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(2, 50, 'double')
  }

  versionAleatoire: () => void = () => {
    const n = randint(2, 5) * 10
    const choix = choice(['double', 'triple'])
    const a = choix === 'double' ? 2 : 3
    this.appliquerLesValeurs(a, n, choix)
  }

  constructor() {
    super()
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut calculer le double ou le triple d'un nombre écrit avec une puissance.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Écrire le calcul en langage mathématique.</li>
    <li>Respecter les priorités opératoires.</li>
    <li>Reconnaître la base(le nombre élevé à une puissance) écrite sous la forme d'une puissance plus simple.</li>
    <li>Utiliser les propriétés des puissances pour identifier la bonne réponse.</li>
    <li>Procéder par élimination si plusieurs réponses semblent possibles.</li>
  </ul>`
    this.versionAleatoire()
  }
}
