import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Compléter une égalité avec un produit'
export const interactifReady = true

export const amcReady = true
export const dateDePublication = '02/01/2026'

/**
 * @author Gilles Mora
 */

export const uuid = '6ccf5'

export const refs = {
  'fr-fr': ['can5C1-09', '5N1autoD-1'],
  'fr-ch': [],
}
export default class MultiplicationATrou extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
    }
  }

  nouvelleVersion() {
    const choix = this.quotaChoice('choix', [1, 2])
    const a = randint(2, 9) * choice([10, 100, 1000])
    const numB = randint(2, 9)
    const denB = choice([10, 100, 1000])
    const b = new Decimal(numB).div(denB)
    const produit = new Decimal(a).mul(b)
    const produitEntier = a * numB

    // Déterminer le facteur de réduction pour le cas 1
    let facteur = ''
    let facteurNombre = 1
    if (denB === 10) {
      facteur = `$${texNombre(10)}$ fois`
      facteurNombre = 10
    } else if (denB === 100) {
      facteur = `$${texNombre(100)}$ fois`
      facteurNombre = 100
    } else {
      facteur = `$${texNombre(1000)}$ fois`
      facteurNombre = 1000
    }

    switch (choix) {
      case 1: {
        // a × ? = produit  donc ? = b
        this.reponse = b
        this.question = 'Compléter : <br>'
        this.optionsChampTexte = {
          texteAvant: `$${texNombre(a)}\\times$`,
          texteApres: `$=${texNombre(produit)}$`,
        }
        this.correction = `On a : $${texNombre(a)}\\times ${numB}=${texNombre(produitEntier)}$.<br>
        Le résultat attendu est $${texNombre(produit)}$, qui est ${facteur} plus petit que $${texNombre(produitEntier)}$.<br>
        Donc le nombre cherché est ${facteur} plus petit que $${numB}$, soit $${numB}\\div ${texNombre(facteurNombre)}=${miseEnEvidence(texNombre(b))}$.`

        if (!this.interactif) {
          this.question += `$${texNombre(a)} \\times \\ldots = ${texNombre(produit)}$`
        }
        this.canEnonce = 'Compléter.'
        this.canReponseACompleter = `$${texNombre(a)} \\times \\ldots = ${texNombre(produit)}$`
        break
      }

      case 2:
      default: {
        // ? × b = produit  donc ? = a
        this.reponse = a
        this.question = 'Compléter : <br>'
        this.optionsChampTexte = {
          texteAvant: '',
          texteApres: `$\\times${texNombre(b)}=${texNombre(produit)}$`,
        }

        // Trouver le bon diviseur pour a (10, 100 ou 1000)
        let diviseurA = 10
        if (a >= 1000) {
          diviseurA = 1000
        } else if (a >= 100) {
          diviseurA = 100
        }

        const aDiv = new Decimal(a).div(diviseurA)
        const produitSimple = aDiv.mul(b)
        const facteurComparaison = produit.div(produitSimple).toNumber()

        let facteurTexte = ''
        if (facteurComparaison === 10) {
          facteurTexte = `$${texNombre(10)}$ fois`
        } else if (facteurComparaison === 100) {
          facteurTexte = `$${texNombre(100)}$ fois`
        } else if (facteurComparaison === 1000) {
          facteurTexte = `$${texNombre(1000)}$ fois`
        }

        this.correction = `On a : $${texNombre(aDiv)}\\times ${texNombre(b)}=${texNombre(produitSimple)}$.<br>
        Le résultat attendu est $${texNombre(produit)}$, qui est ${facteurTexte} plus grand que $${texNombre(produitSimple)}$.<br>
        Donc le nombre cherché est ${facteurTexte} plus grand que $${texNombre(aDiv)}$, soit $${texNombre(aDiv)}\\times ${texNombre(facteurComparaison)}=${miseEnEvidence(texNombre(a))}$.`

        if (!this.interactif) {
          this.question += `$\\ldots \\times ${texNombre(b)} = ${texNombre(produit)}$`
        }
        this.canEnonce = 'Compléter.'
        this.canReponseACompleter = `$\\ldots \\times ${texNombre(b)} = ${texNombre(produit)}$`
        break
      }
    }
  }
}
