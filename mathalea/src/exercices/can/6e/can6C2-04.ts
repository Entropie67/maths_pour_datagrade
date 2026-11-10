import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Multiplier astucieusement'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote ; Olivier Mimeau (ajout de catégories de nombres)
 * Créé pendant l'été 2021
 */
export const uuid = 'c8078'

export const refs = {
  'fr-fr': ['can6C2-04', '6N2autoD-3'],
  'fr-ch': [],
}

export default class MultiplierAstucieusement extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.besoinFormulaireCaseACocher = [
      'Permettre des facteurs au dixième, au millième',
      false,
    ]
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    const a = randint(1, 9)
    const b = randint(1, 9, a)
    const c = randint(1, 9, [a, b])
    const d = randint(1, 9, [a, b, c])
    // typeDeQuestions :  1, 2, 3, 4 : *100 // 5, 6 : *10 // 7 : *1000
    const typeDeQuestions = this.quotaChoice(
      'typeDeQuestions',
      [1, 2, 3, 4, 5, 6, 7],
    )
    let nombre = a * 1000 + b * 100
    nombre += this.sup ? choice([c * 10 + d, c * 10, 0]) : c * 10
    const facteur = nombre / 1000
    this.reponse =
      typeDeQuestions < 5
        ? nombre / 10
        : typeDeQuestions < 7
          ? nombre / 100
          : nombre
    switch (typeDeQuestions) {
      case 1:
        this.question = `Calculer $4 \\times ${texNombre(facteur, 3)}\\times 25$.`
        this.correction = `$4 \\times ${texNombre(facteur, 3)}\\times 25 = 100 \\times ${texNombre(facteur, 3)} = ${miseEnEvidence(texNombre(this.reponse, 1))}$<br>`
        this.correction += texteEnCouleur(
          `<br> Mentalement : <br>
  On remarque dans $4 \\times ${texNombre(facteur, 3)}\\times 25$ le produit $4\\times 25$ qui donne $100$.<br>
  Il reste alors à multiplier par $100$ le nombre $${texNombre(facteur, 3)}$ : le chiffre des unités ($${a}$) devient le chiffre des centaines, etc.
  on obtient ainsi comme résultat : $${texNombre(this.reponse, 1)}$.
    `,
          bleuMathalea,
        )
        break
      case 2:
        this.question = `Calculer $2 \\times ${texNombre(facteur, 3)}\\times 50$.`
        this.correction = `$2 \\times ${texNombre(facteur, 3)}\\times 50 = 100 \\times ${texNombre(facteur, 3)} = ${miseEnEvidence(texNombre(this.reponse, 1))}$<br>`
        this.correction += texteEnCouleur(
          `<br> Mentalement : <br>
  On remarque dans $2 \\times ${texNombre(facteur, 3)}\\times 50$ le produit $2\\times 50$ qui donne $100$.<br>
  Il reste alors à multiplier par $100$ le nombre $${texNombre(facteur, 3)}$ : le chiffre des unités ($${a}$) devient le chiffre des centaines, etc.
  on obtient ainsi comme résultat : $${texNombre(this.reponse, 1)}$.
    `,
          bleuMathalea,
        )
        break
      case 3:
        this.question = `Calculer $25 \\times ${texNombre(facteur, 3)}\\times 4$.`
        this.correction = `$25 \\times ${texNombre(facteur, 3)}\\times 4 = 100 \\times ${texNombre(facteur, 3)} = ${miseEnEvidence(texNombre(this.reponse, 1))}$<br>`
        this.correction += texteEnCouleur(
          `<br> Mentalement : <br>
        On remarque dans $25 \\times ${texNombre(facteur, 3)}\\times 4$ le produit $4\\times 25$ qui donne $100$.<br>
        Il reste alors à multiplier par $100$ le nombre $${texNombre(facteur, 3)}$ : le chiffre des unités ($${a}$) devient le chiffre des centaines, etc.
        on obtient ainsi comme résultat : $${texNombre(this.reponse, 1)}$.
          `,
          bleuMathalea,
        )
        break
      case 4:
        this.question = `Calculer $50 \\times ${texNombre(facteur, 3)}\\times 2$.`
        // Si les exos can avaient toujours cette propriété this.question on pourrait faire un ajout automatique
        this.correction = `$50 \\times ${texNombre(facteur, 3)}\\times 2 = 100 \\times ${texNombre(facteur, 3)} = ${miseEnEvidence(texNombre(this.reponse, 1))}$<br>`
        this.correction += texteEnCouleur(
          `<br> Mentalement : <br>
  On remarque dans $50 \\times ${texNombre(facteur, 3)}\\times 2$ le produit $2\\times 50$ qui donne $100$.<br>
  Il reste alors à multiplier par $100$ le nombre $${texNombre(facteur, 3)}$ : le chiffre des unités ($${a}$) devient le chiffre des centaines, etc.
  on obtient ainsi comme résultat : $${texNombre(this.reponse, 1)}$.
    `,
          bleuMathalea,
        )
        break
      case 5:
        this.question = `Calculer $2 \\times ${texNombre(facteur, 3)}\\times 5$.`
        this.correction = `$2 \\times ${texNombre(facteur, 3)}\\times 5 = 10 \\times ${texNombre(facteur, 3)} = ${miseEnEvidence(texNombre(this.reponse, 1))}$<br>`
        this.correction += texteEnCouleur(
          `<br> Mentalement : <br>
    On remarque dans $2 \\times ${texNombre(facteur, 3)}\\times 5$ le produit $2\\times 5$ qui donne $10$.<br>
    Il reste alors à multiplier par $10$ le nombre $${texNombre(facteur, 3)}$ : le chiffre des unités ($${a}$) devient le chiffre des dizaines, etc.
    on obtient ainsi comme résultat : $${texNombre(this.reponse, 1)}$.
      `,
          bleuMathalea,
        )
        break
      case 6:
        this.question = `Calculer $5 \\times ${texNombre(facteur, 3)}\\times 2$.`
        this.correction = `$5 \\times ${texNombre(facteur, 3)}\\times 2 = 10 \\times ${texNombre(facteur, 3)} = ${miseEnEvidence(texNombre(this.reponse, 1))}$<br>`
        this.correction += texteEnCouleur(
          `<br> Mentalement : <br>
    On remarque dans $5 \\times ${texNombre(facteur, 3)}\\times 2$ le produit $5\\times 2$ qui donne $10$.<br>
    Il reste alors à multiplier par $10$ le nombre $${texNombre(facteur, 3)}$ : le chiffre des unités ($${a}$) devient le chiffre des dizaines, etc.
    on obtient ainsi comme résultat : $${texNombre(this.reponse, 1)}$.
      `,
          bleuMathalea,
        )
        break
      case 7:
        this.question = `Calculer $8 \\times ${texNombre(facteur, 3)}\\times 125$.`
        this.correction = `$8 \\times ${texNombre(facteur, 3)}\\times 125 = ${texNombre(1000)} \\times ${texNombre(facteur, 3)} = ${miseEnEvidence(texNombre(this.reponse, 1))}$<br>`
        this.correction += texteEnCouleur(
          `<br> Mentalement : <br>
  On remarque dans $8 \\times ${texNombre(facteur, 3)}\\times 125$ le produit $8\\times 125$ qui donne $${texNombre(1000)}$.<br>
  Il reste alors à multiplier par $${texNombre(1000)}$ le nombre $${texNombre(facteur, 3)}$ : le chiffre des unités ($${a}$) devient le chiffre des milliers, etc.
  on obtient ainsi comme résultat : $${texNombre(this.reponse, 1)}$.
    `,
          bleuMathalea,
        )
        break
    }
  }
}
