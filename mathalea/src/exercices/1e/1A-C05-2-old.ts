// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid edf86 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '15/10/2025'
export const uuid = 'edf86'
// @Author Gilles Mora
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Déterminer un ordre de grandeur avec des puissances de $10$'
export default class auto1AC5aOld extends ExerciceQcmA {
  private appliquerLesValeurs(a: number, b: number, cas: number): void {
    if (cas === 1) {
      // Cas original : 10^a + 10^(-b)
      this.enonce = `$10^{${a}}+10^{${-b}}$ est environ égal à :`
      this.correction = `$10^{${-b}}$ est très petit devant $10^{${a}}$.<br>
     En effet, $10^{${-b}}=\\dfrac{1}{10^{${b}}}=\\underbrace{0,0\\ldots 0}_{${b} \\text{ zéros}}1$ et $10^{${a}}=1\\underbrace{0\\ldots 0}_{${a}\\text{ zéros}}$.<br>
     On en déduit  que $10^{${a}}+10^{${-b}}$ est environ égal à $${miseEnEvidence(`10^{${a}}`)}$.`
      this.reponses = [`$10^{${a}}$`, `$20^{${a}}$`, `$10^{${a - b}}$`, `$0$`]
    } else if (cas === 2) {
      // Cas 2 : a + 10^b avec b positif grand
      this.enonce = `$${a}+10^{${b}}$ est environ égal à :`
      this.correction = `$${a}$ est très petit devant $10^{${b}}$.<br>
     En effet, $10^{${b}}=1\\underbrace{0\\ldots 0}_{${b} \\text{ zéros}}$.<br>
     On en déduit que $${a}+10^{${b}}$ est environ égal à $${miseEnEvidence(`10^{${b}}`)}$.`
      this.reponses = [
        `$10^{${b}}$`,
        `$${a}$`,
        `$${a + 1}\\times 10^{${b}}$`,
        `$10^{${b + 1}}$`,
      ]
    } else {
      // Cas 3 : a + 10^b avec b négatif
      this.enonce = `$${a}+10^{${b}}$ est environ égal à :`
      this.correction = `$10^{${b}}$ est très petit devant $${a}$.<br>
     En effet, $10^{${b}}=\\dfrac{1}{10^{${-b}}}=\\underbrace{0,0\\ldots 0}_{${-b} \\text{ zéros}}1$.<br>
     On en déduit que $${a}+10^{${b}}$ est environ égal à $${miseEnEvidence(`${a}`)}$.`
      this.reponses = [
        `$${a}$`,
        `$10^{${b}}$`,
        `$${a}\\times 10^{${b}}$`,
        `$${a + 1}$`,
      ]
    }
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(30, 30, 1)
  }

  versionAleatoire: () => void = () => {
    let compteur = 0
    do {
      const casChoisi = randint(1, 3)

      if (casChoisi === 1) {
        const a = randint(10, 50)
        const b = randint(10, 50)
        this.appliquerLesValeurs(a, b, 1)
      } else if (casChoisi === 2) {
        const a = randint(1, 15)
        const b = randint(10, 40)
        this.appliquerLesValeurs(a, b, 2)
      } else if (casChoisi === 3) {
        const a = randint(1, 15)
        const b = randint(-40, -10)
        this.appliquerLesValeurs(a, b, 3)
      }
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
