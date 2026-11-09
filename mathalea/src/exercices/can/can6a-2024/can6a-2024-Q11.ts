import { propositionsQcm } from '../../../lib/interactif/qcm'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Trouver le plus grand d'un décimal et d'une fraction"
export const interactifReady = true

export const uuid = 'e1faf'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Jean-claude Lhote

*/
export default class CompareDecimalFraction extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatInteractif = 'qcm'
    this.canOfficielle = false
  }

  nouvelleVersion() {
    let nbA: number
    let nbB: number
    let num: number
    let den: number
    if (this.canOfficielle) {
      nbA = 3.4
      nbB = 7 / 3
      num = 7
      den = 3
    } else {
      do {
        num = randint(7, 15)
        den = randint(2, 5)
        nbA = randint(21, 49, [20, 40]) / 10
        nbB = num / den
      } while (Math.abs(nbA - nbB) <= 1)
    }
    const a = texNombre(nbA, 1)
    const b = `\\dfrac{${num}}{${den}}`
    this.autoCorrection[0] = {
      options: { ordered: true },
      enonce: 'Cocher le plus grand nombre : ',
      propositions: [
        {
          texte: `$${a}$`,
          statut: nbA > nbB,
        },
        {
          texte: `$${b}$`,
          statut: nbB > nbA,
        },
      ],
    }
    const qcm = propositionsQcm(this, 0)
    if (!this.interactif) {
      this.question = 'Entourer le plus grand nombre : '
      this.question += `${sp(7)}$${a}$ ${sp(7)} $${b}$`
    } else {
      this.question = 'Cocher le plus grand nombre : ' + qcm.texte
    }

    this.canEnonce = 'Entourer le plus grand nombre.'
    this.canReponseACompleter = `$${a}$ ${sp(7)} $${b}$`
    const reponse = nbA > nbB ? a : b
    this.correction = `Le plus grand nombre est : $${miseEnEvidence(reponse)}$.<br><br>`
    if (nbA > nbB) {
      if (Number.isInteger(num / den)) {
        this.correction += `En effet : $${b}=${texNombre(num / den, 0)}$ et $${texNombre(num / den, 0)}>${a}$.`
      } else {
        if (num > den) {
          this.correction += `$\\begin{aligned}
          \\dfrac{${num}}{${den}}&=\\dfrac{${num - (num % den)}}{${den}}+\\dfrac{${num % den}}{${den}} \\\\
          &= ${texNombre(Math.floor(num / den), 0)} +\\dfrac{${num % den}}{${den}}
          \\end{aligned}$<br>
           et  $\\dfrac{${num % den}}{${den}}<1$,`
          this.correction += ` alors $${texNombre(Math.floor(num / den), 0)} +\\dfrac{${num % den}}{${den}}<${Math.ceil(num / den - 1).toFixed(0)}+1$ et $\\dfrac{${num}}{${den}}<${Math.ceil(num / den).toFixed(0)}$, donc $\\dfrac{${num}}{${den}}<${a}$.`
        } else {
          this.correction += `En effet : $${num}<${den}$ donc $\\dfrac{${num}}{${den}}<1$`
        }
      }
    } else {
      if (Number.isInteger(num / den)) {
        this.correction += `En effet : $${b}=${texNombre(num / den, 0)}$ et $${texNombre(num / den, 0)}>${a}$.`
      } else {
        this.correction += `$\\begin{aligned}\\dfrac{${num}}{${den}}&=\\dfrac{${num - (num % den)}}{${den}}+\\dfrac{${num % den}}{${den}} \\\\
        &= ${texNombre(Math.floor(num / den), 0)} +\\dfrac{${num % den}}{${den}}
        \\end{aligned}$<br> `
        this.correction += `alors $\\dfrac{${num}}{${den}}>${Math.floor(num / den).toFixed(0)}$.`
      }
    }
  }
}
