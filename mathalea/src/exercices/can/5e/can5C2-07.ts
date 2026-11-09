import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre =
  'Multiplier astucieusement par $9$, $11$, $19$, $21$, $99$ ou $101$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Rémi Angot
 * On multiplie par 9, 19 ou 99 (respectivement 11, 21 ou 101) en
 * remarquant que ces nombres sont à 1 d'une puissance de 10 facile à
 * multiplier (10, 20 ou 100), puis en soustrayant (respectivement
 * ajoutant) le facteur restant.
 */
export const uuid = 'e82af'

export const refs = {
  'fr-fr': ['can5C2-07'],
  'fr-ch': [],
}

const cas = [
  {
    m: 9,
    base: 10,
    signe: -1,
    explication:
      'quand on multiplie par $10$, le chiffre des unités devient le chiffre des dizaines',
  },
  {
    m: 11,
    base: 10,
    signe: 1,
    explication:
      'quand on multiplie par $10$, le chiffre des unités devient le chiffre des dizaines',
  },
  {
    m: 19,
    base: 20,
    signe: -1,
    explication: 'on multiplie par $2$ puis par $10$',
  },
  {
    m: 21,
    base: 20,
    signe: 1,
    explication: 'on multiplie par $2$ puis par $10$',
  },
  {
    m: 99,
    base: 100,
    signe: -1,
    explication:
      'quand on multiplie par $100$, le chiffre des unités devient le chiffre des centaines',
  },
  {
    m: 101,
    base: 100,
    signe: 1,
    explication:
      'quand on multiplie par $100$, le chiffre des unités devient le chiffre des centaines',
  },
]

export default class MultiplierAstucieusementParVoisinDePuissanceDeDix extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    const leCas = this.quotaChoice('cas', cas)
    const n = this.quotaRandint('n', 12, 89)

    const produitBase = n * leCas.base
    this.reponse = produitBase + leCas.signe * n

    const signeTex = leCas.signe < 0 ? '-' : '+'
    const operation = leCas.signe < 0 ? 'de soustraire' : "d'ajouter"

    this.question = `Calculer $${n} \\times ${leCas.m}$.`

    this.correction = `$${n} \\times ${leCas.m} = ${n} \\times (${leCas.base} ${signeTex} 1) = ${n} \\times ${leCas.base} ${signeTex} ${n} = ${texNombre(produitBase)} ${signeTex} ${texNombre(n)} = ${miseEnEvidence(texNombre(this.reponse))}$`
    this.correction += texteEnCouleur(
      `<br> Mentalement : <br>
On remarque que $${leCas.m} = ${leCas.base} ${signeTex} 1$.<br>
On calcule $${n} \\times ${leCas.base} = ${texNombre(produitBase)}$ (${leCas.explication}).<br>
Il suffit ensuite ${operation} $${n}$ pour obtenir $${texNombre(this.reponse)}$.
  `,
      bleuMathalea,
    )
  }
}
