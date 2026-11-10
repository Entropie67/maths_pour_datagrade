import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import {
  nombreDeChiffresDansLaPartieDecimale,
  round,
} from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Multiplier astucieusement avec des décimaux'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Olivier Mimeau
 * Variante plus difficile de can6C2-04 : les mêmes produits remarquables
 * (4x25, 2x50, 2x5, 8x125) sont rendus méconnaissables par un décalage de
 * la virgule sur chacun des deux facteurs concernés, ce qui oblige à
 * repérer le "bon" décalage global (jeu sur les virgules et les zéros).
 * Créé à l'été 2026
 */
export const dateDePublication = '23/08/2026'
export const uuid = 'f8095'

export const refs = {
  'fr-fr': ['can5C2-05'],
  'fr-ch': [],
}

// a * b = 10^k
const duos = [
  { a: 4, b: 25, k: 2 },
  { a: 2, b: 50, k: 2 },
  { a: 2, b: 5, k: 1 },
  { a: 8, b: 125, k: 3 },
]

// décalages individuels possibles sur chaque facteur du duo
const decalages = [-3, -2, -1, 0, 1, 2]
// bornes du décalage global (duo.k + decalageA + decalageB) pour garder un
// résultat final raisonnable malgré des décalages individuels marqués
const exposantMin = -2
const exposantMax = 3

// nom du rang atteint quand on s'éloigne des unités de |exposant| crans
// (vers la gauche si exposant > 0, vers la droite si exposant < 0)
const nomsDesRangs: Record<number, string> = {
  1: 'dizaines',
  2: 'centaines',
  3: 'milliers',
  '-1': 'dixièmes',
  '-2': 'centièmes',
  '-3': 'millièmes',
}

export default class MultiplierAstucieusementAvecDecimales extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    const duo = this.quotaChoice('duo', duos)
    const c = randint(1, 8) * 10 + randint(1, 9)

    let decalageA = 0
    let decalageB = 0
    let exposant = 0
    for (let essai = 0; essai < 20; essai++) {
      decalageA = choice(decalages)
      decalageB = choice(decalages)
      exposant = duo.k + decalageA + decalageB
      if (exposant >= exposantMin && exposant <= exposantMax) break
    }

    const precisionA = Math.max(0, -decalageA)
    const precisionB = Math.max(0, -decalageB)
    const aDecale = round(duo.a * 10 ** decalageA, precisionA)
    const bDecale = round(duo.b * 10 ** decalageB, precisionB)

    const puissanceDeDix = 10 ** exposant
    const precisionReponse = Math.max(0, -exposant)
    this.reponse = round(c * puissanceDeDix, precisionReponse)

    const aTex = texNombre(aDecale, precisionA)
    const bTex = texNombre(bDecale, precisionB)
    const cTex = texNombre(c, 0)
    const puissanceTex = texNombre(puissanceDeDix, precisionReponse)
    const reponseTex = texNombre(this.reponse, precisionReponse)

    const facteurs = shuffle([aTex, bTex, cTex])
    this.question = `Calculer astucieusement $${facteurs[0]} \\times ${facteurs[1]} \\times ${facteurs[2]}$.`

    let phraseDecalage: string
    if (exposant === 0) {
      phraseDecalage = `multiplier par $1$ ne change rien à $${cTex}$`
    } else if (Number.isInteger(c)) {
      phraseDecalage = `quand on multiplie par $${puissanceTex}$, le chiffre des unités devient le chiffre des ${nomsDesRangs[exposant]}`
    } else {
      const nbDecimales = nombreDeChiffresDansLaPartieDecimale(c)
      phraseDecalage = `quand on multiplie par $${puissanceTex}$, le chiffre des ${nomsDesRangs[-nbDecimales]} devient le chiffre des unités`
    }

    this.correction = `$${aTex} \\times ${bTex} \\times ${cTex} = ${puissanceTex} \\times ${cTex} = ${miseEnEvidence(reponseTex)}$<br>`
    this.correction += texteEnCouleur(
      `<br> Mentalement : <br>
On repère dans $${facteurs[0]} \\times ${facteurs[1]} \\times ${facteurs[2]}$ le produit $${aTex} \\times ${bTex}$ qui donne $${puissanceTex}$.<br>
Il reste alors à multiplier $${cTex}$ par $${puissanceTex}$ : ${phraseDecalage}.
On obtient ainsi comme résultat : $${reponseTex}$.
  `,
      bleuMathalea,
    )
  }
}
