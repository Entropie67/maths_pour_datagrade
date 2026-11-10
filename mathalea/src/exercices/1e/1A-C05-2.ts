import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
export const dateDePublication = '15/10/2025'
export const dateDeModifImportante = '30/09/2026'
export const uuid = '51f3e'

export const refs = {
  'fr-fr': ['1A-C05-2', '2A-N5-2'],
  'fr-ch': ['10CTQCMNO-5', '10LCQCMNO-6', '10LSQCMNO-7'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre =
  'Déterminer un ordre de grandeur avec des puissances de $10$'

export default class auto1AC5a extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.lycee
    this.versionQcmDisponible = true
    this.versionQcm = false
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = true

    const cas = this.quotaChoice('cas', [1, 2, 3])
    let expression: string
    let attendu: string
    let distracteurs: string[]
    if (cas === 1) {
      // 10^a + 10^(-b)
      const a = randint(10, 50)
      const b = randint(10, 50)
      expression = `10^{${a}}+10^{${-b}}`
      attendu = `10^{${a}}`
      this.correction = `$10^{${-b}}$ est très petit devant $10^{${a}}$.<br>
     En effet, $10^{${-b}}=\\dfrac{1}{10^{${b}}}=\\underbrace{0,0\\ldots 0}_{${b} \\text{ zéros}}1$ et $10^{${a}}=1\\underbrace{0\\ldots 0}_{${a}\\text{ zéros}}$.<br>
     On en déduit que $10^{${a}}+10^{${-b}}$ est environ égal à $${miseEnEvidence(attendu)}$.`
      distracteurs = [`20^{${a}}`, `10^{${a - b}}`, '0']
    } else if (cas === 2) {
      // a + 10^b avec b positif grand
      const a = randint(1, 15)
      const b = randint(10, 40)
      expression = `${a}+10^{${b}}`
      attendu = `10^{${b}}`
      this.correction = `$${a}$ est très petit devant $10^{${b}}$.<br>
     En effet, $10^{${b}}=1\\underbrace{0\\ldots 0}_{${b} \\text{ zéros}}$.<br>
     On en déduit que $${a}+10^{${b}}$ est environ égal à $${miseEnEvidence(attendu)}$.`
      distracteurs = [`${a}`, `${a + 1}\\times 10^{${b}}`, `10^{${b + 1}}`]
    } else {
      // a + 10^b avec b négatif
      const a = randint(1, 15)
      const b = randint(-40, -10)
      expression = `${a}+10^{${b}}`
      attendu = `${a}`
      this.correction = `$10^{${b}}$ est très petit devant $${a}$.<br>
     En effet, $10^{${b}}=\\dfrac{1}{10^{${-b}}}=\\underbrace{0,0\\ldots 0}_{${-b} \\text{ zéros}}1$.<br>
     On en déduit que $${a}+10^{${b}}$ est environ égal à $${miseEnEvidence(attendu)}$.`
      distracteurs = [`10^{${b}}`, `${a}\\times 10^{${b}}`, `${a + 1}`]
    }

    if (this.versionQcm) {
      this.question = `$${expression}$ est environ égal à :`
      this.reponse = `$${attendu}$`
      this.distracteurs = distracteurs.map((d) => `$${d}$`)
    } else if (cas === 3) {
      this.question = `Donner un ordre de grandeur de $${expression}$ sous la forme d'un nombre entier.`
      this.optionsChampTexte = {
        texteAvant: `<br>Un ordre de grandeur de $${expression}$ est `,
        texteApres: '.',
      }
      this.optionsDeComparaison = { nombreDecimalSeulement: true }
      this.reponse = attendu
    } else {
      this.question = `Donner un ordre de grandeur de $${expression}$ sous la forme d'une puissance de $10$.`
      this.optionsChampTexte = {
        texteAvant: `<br>Un ordre de grandeur de $${expression}$ est `,
        texteApres: '.',
      }
      this.optionsDeComparaison = { puissance: true }
      this.reponse = attendu
    }
  }
}
