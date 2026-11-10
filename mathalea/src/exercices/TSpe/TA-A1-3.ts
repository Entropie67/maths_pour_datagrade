import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '10/08/2025'
export const uuid = 'a49d5'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': ['TA-A1-3'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer avec des puissances ($3$)'
export default class Puissances extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    this.enonce =
      'Soit $a$ un nombre réel non nul et $n$ un entier non nul. À quelle expression est égale $\\left(a^2\\right)^{n}$ ?'
    this.correction = `On applique la propriété des puissances de puissances d'un réel.<br>
    Soit $n\\in \\mathbb{N}$, et $p \\in \\mathbb{N}$, on a $\\left(a^{n}\\right)^{p}=a^{np}$.<br>
         Dans notre situation : $\\left(a^2\\right)^{n}= ${miseEnEvidence(`a^{2n}`)}$`

    this.reponses = [
      '$a^{2n}$',
      '$a^{2+n}$',
      '$a^{2^n}$',
      'Aucune de ces propositions',
    ]
  }

  versionAleatoire = () => {
    const k = randint(2, 6)
    this.enonce = `Soient $a$ un nombre réel non nul et $n$ un entier. À quelle expression est égale $\\left(a^${k}\\right)^{n}$ ?`
    this.correction = `On applique la propriété des puissances de puissances d'un réel.<br>
    Soit $n\\in \\mathbb{N}$, et $p \\in \\mathbb{N}$, on a $\\left(a^{n}\\right)^{p}=a^{np}$.<br>
         Dans notre situation : $\\left(a^${k}\\right)^{n}= ${miseEnEvidence(`a^{${k}n}`)}$`
    this.reponses = [
      `$a^{${k}{n}}$`,
      `$a^{${k}^{n}}$`,
      `$a^{${k}+n}$`,
      'Aucune de ces propositions.',
    ]
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
