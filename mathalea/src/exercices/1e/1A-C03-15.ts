import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
export const dateDePublication = '14/02/2026'
export const dateDeModifImportante = '30/09/2026'
export const uuid = 'cc145'

export const refs = {
  'fr-fr': ['1A-C03-15', '2A-N3-10'],
  'fr-ch': ['10LCNO4B-10', '10LSNO4B-10', '11LCNO3B-10', '11LSNO3B-10'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre =
  "Calculer le double ou le triple d'un nombre écrit avec une puissance"

/**
 *
 * @author Gilles Mora
 *
 */
export default class Auto1AC3j extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.versionQcmDisponible = true
    this.versionQcm = false
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
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = true
    this.formatInteractif = this.versionQcm ? 'mathlive' : 'fillInTheBlank'

    const n = randint(2, 5) * 10
    const choix = this.quotaChoice('choix', ['double', 'triple'])
    const a = choix === 'double' ? 2 : 3
    const k = a // double : 2 ; triple : 3
    const carre = a * a

    this.correction = `On a $${carre}=${a}^{2}$ et on cherche le ${choix} de $${texNombre(carre, 0)}^{${n}}$, soit $${k} \\times ${texNombre(carre, 0)}^{${n}}$ donc :<br>
    $\\begin{aligned}
    ${k} \\times ${texNombre(carre, 0)}^{${n}} & = ${k}\\times \\left(${a}^{2}\\right)^{${n}} \\\\
    &=${k}\\times ${a}^{${2 * n}} \\\\
    &=${this.versionQcm ? miseEnEvidence(`${a}^{${2 * n + 1}}`) : `${a}^{${miseEnEvidence(2 * n + 1)}}`} \\\\
    \\end{aligned}$`

    if (this.versionQcm) {
      this.consigne = ''
      this.question = `Le ${choix} de $${texNombre(carre, 0)}^{${n}}$ est égal à :`
      this.reponse = `$${a}^{${2 * n + 1}}$`
      this.distracteurs = [
        `$${k * carre}^{${n}}$`,
        `$${a}^{${n + 1}}$`,
        `$${carre}^{${k * n}}$`,
      ]
    } else {
      this.consigne = 'Compléter.'
      this.question = `\\text{Le ${choix} de }${texNombre(carre, 0)}^{${n}}\\text{ est égal à }${a}^{%{champ1}}.`
      this.reponse = {
        champ1: {
          value: String(2 * n + 1),
          options: { nombreDecimalSeulement: true },
        },
      }
    }
  }
}
