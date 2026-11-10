import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { ecritureParentheseSiMoins } from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '25/08/2025'
export const uuid = '5cf1f'
/**
 * Author Stéphane Guyon
 */
export const refs = {
  'fr-fr': ['1AL11-5'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Calculer la raison d'une suite arithmétique (QCM)"
export default class Puissances extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    const p = 10
    const up = 4
    const k = 25
    const r = 2
    this.enonce = `Soit $(u_n)$ une suite arithmétique.<br>
    On donne $u_{${p}}=${up}$ et $u_{${p + k} }=${up + k * r}$. <br>
    La raison de cette suite est égale à : `
    this.correction = `Soit $(u_n)$ une suite arithmétique, de premier terme $u_0\\in \\mathbb{R}$ et de raison $r\\in \\mathbb{R}.$<br>
    On a alors pour tout $n\\in \\mathbb{N}$ et tout $p\\in \\mathbb{N}$ : $u_n=u_p+(n-p)r$.<br>
    En particulier, avec l'énoncé, <br>$\\begin{aligned}
u_{${p + k}}&=u_{${p}}+(${p + k}-${p})\\times r\\\\
${k}\\times r&=u_{${p + k}}-u_{${p}}\\\\
r&=\\dfrac{${up + k * r}-${up}}{${k}}\\\\
r&=${r}
\\end{aligned}$.<br>
 ${texteEnCouleur(`La raison est donc ${r}.`)} `
    this.reponses = ['$2$', '$50$', '$25$', '$5$']
  }

  versionAleatoire = () => {
    const nombreSouhaites = 4
    let compteur = 0
    do {
      const up = randint(-5, 5, [0, 1])
      const p = randint(3, 10)
      const k = randint(4, 10)
      const r = randint(-5, 5, [-1, 0, 1, p])

      this.enonce = `Soit $(u_n)$ une suite arithmétique.<br>On donne $u_{${p}}=${up}$ et $u_{${p + k} }=${up + k * r}$. <br>
    La raison de cette suite est égale à :`
      this.correction = `Soit $(u_n)$ une suite arithmétique, de premier terme $u_0\\in \\mathbb{R}$ et de raison $r\\in \\mathbb{R}.$<br>
      On a alors pour tout $n\\in \\mathbb{N}$ et tout $p\\in \\mathbb{N}$ : $u_n=u_p+(n-p)r$.<br>
      En particulier, avec l'énoncé, <br>$\\begin{aligned}
u_{${p + k}}&=u_{${p}}+(${p + k}-${p})\\times r\\\\
${k}\\times r&=u_{${p + k}}-u_{${p}}\\\\
r&=\\dfrac{${up + k * r}-${ecritureParentheseSiMoins(up)}}{${k}}\\\\
r&=\\dfrac{${k * r}}{${k}}\\\\
r&=${r}
\\end{aligned}$.<br>
La raison est donc $${miseEnEvidence(`r=${r}.`)}$ `
      const distracteur = new FractionEtendue(k * r, k + 1)

      this.reponses = [
        `$${r}$`,
        ` $${p}$`,
        `$${-r}$`,
        `$${distracteur.texFractionSimplifiee}$`,
      ]
      compteur++
    } while (
      compteur < 100 &&
      !aLeBonNombreDePropsDifferentes(this, nombreSouhaites, true)
    )
  }

  constructor() {
    super()

    this.versionAleatoire()
  }
}
