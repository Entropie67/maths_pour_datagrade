import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer le reste de la division euclidienne de $a^n$ par $k$'
export const interactifReady = true

export const dateDePublication = '11/09/2026'
export const uuid = 'c5e18'

export const refs = {
  'fr-fr': ['TEA1-36'],
  'fr-ch': [],
}
/**
 *
 * @author Arnaud Meistermann

*/

// plus petit entier p >= 1 tel que a^p ≡ 1 [k] (défini seulement si a et k sont premiers entre eux)
function ordreMultiplicatif(a: number, k: number): number {
  let p = 1
  let courant = a % k
  while (courant !== 1) {
    courant = (courant * a) % k
    p++
  }
  return p
}

export default class ResteDivisionEuclidiennePuissance extends Exercice {
  constructor() {
    super()
    this.consigne = ''
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // k : modulo dont le groupe des inversibles admet un élément d'ordre compris entre 3 et 6
      const k = choice([5, 7, 9, 11, 13])
      // a0 : représentant de a modulo k, inversible et non trivial
      const a0 = randint(2, k - 1)
      if (pgcd(a0, k) !== 1) {
        cpt++
        continue
      }
      const ordre = ordreMultiplicatif(a0, k)
      if (ordre < 3 || ordre > 6) {
        cpt++
        continue
      }
      // a : un « vrai » entier congru à a0 modulo k
      const a = a0 + k * randint(1, 5)
      // n : grand exposant, écrit n = ordre * q + s
      const s = randint(0, ordre - 1)
      const q = randint(20, 60)
      const n = ordre * q + s
      // s < ordre <= 6 et a0 <= 12 : (a0 ** s) reste un petit entier
      const r = a0 ** s % k

      const texte = `Déterminer le reste de la division euclidienne de $${a}^{${n}}$ par $${k}$.`

      let texteCorr = `On calcule les puissances successives de $${a}$ modulo $${k}$ :<br>`
      texteCorr += `$${a}^{1} \\equiv ${a} \\equiv ${a0}\\,[${k}]$<br>`
      let residu = a0
      for (let j = 2; j <= ordre; j++) {
        const produit = residu * a0
        const nouveauResidu = produit % k
        const membreDroit =
          produit === nouveauResidu
            ? `${residu} \\times ${a0} \\equiv ${produit}`
            : `${residu} \\times ${a0} \\equiv ${produit} \\equiv ${nouveauResidu}`
        texteCorr += `$${a}^{${j}} \\equiv ${membreDroit}\\,[${k}]$<br>`
        residu = nouveauResidu
      }
      texteCorr += `On obtient donc $${a}^{${ordre}} \\equiv 1\\,[${k}]$.<br>`
      texteCorr += `On effectue la division euclidienne de $${n}$ par $${ordre}$ : `
      texteCorr += `$${n} = ${ordre} \\times ${q} + ${s}$<br>`
      if (s === 0) {
        texteCorr += `Ainsi, $${a}^{${n}} = ${a}^{${ordre} \\times ${q}} = \\left(${a}^{${ordre}}\\right)^{${q}}$<br>`
        texteCorr += `Donc $${a}^{${n}} \\equiv 1^{${q}} = 1\\,[${k}]$<br>`
      } else {
        texteCorr += `Ainsi, $${a}^{${n}} = ${a}^{${ordre} \\times ${q} + ${s}} = \\left(${a}^{${ordre}}\\right)^{${q}} \\times ${a}^{${s}}$<br>`
        texteCorr += `Donc $${a}^{${n}} \\equiv 1^{${q}} \\times ${a}^{${s}} = ${a}^{${s}} \\equiv ${r}\\,[${k}]$<br>`
      }
      texteCorr += `Comme $0 \\leqslant ${r} < ${k}$, le reste de la division euclidienne de $${a}^{${n}}$ par $${k}$ est $${miseEnEvidence(`${r}`)}$.`

      if (this.questionJamaisPosee(i, a, n, k)) {
        this.listeQuestions[i] =
          texte +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
            texteAvant: `<br>Le reste de la division euclidienne de $${a}^{${n}}$ par $${k}$ est `,
            texteApres: '.',
          })
        this.listeCorrections[i] = texteCorr

        handleAnswers(this, i, {
          reponse: { value: `${r}` },
        })

        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
