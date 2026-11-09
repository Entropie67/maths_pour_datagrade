import Decimal from 'decimal.js'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { touchesDecimal } from '../../lib/outils/ordreDeGrandeur'
import { prenomPronom } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const dateDePublication = '26/10/2026'
export const uuid = '9c364'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': ['1A-C05-11', '2A-N5-11'],
  'fr-ch': [],
}
export const interactifReady = true
export const titre = 'Placer la virgule dans un produit ou un quotient'

/** Entier à `nbChiffres` chiffres, sans zéro final */
function entierSansZeroFinal(nbChiffres: number): number {
  let n: number
  do {
    n = randint(10 ** (nbChiffres - 1), 10 ** nbChiffres - 1)
  } while (n % 10 === 0)
  return n
}

/** Décimal égal à `chiffres × 10^(-decimales)` */
function decimal(chiffres: number, decimales: number): Decimal {
  return new Decimal(chiffres).div(Decimal.pow(10, decimales))
}

/** Arrondi à un chiffre significatif */
function arrondi(x: Decimal): Decimal {
  return x.toSD(1)
}

/**
 * Les chiffres du résultat exact d'un produit ou d'un quotient sont donnés :
 * l'ordre de grandeur permet de placer la virgule, sans calculatrice.
 */
export default class PlacerLaVirgule extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierEntierementPersonnalisable
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    const quotient =
      this.quotaChoice('cas', ['produit', 'quotient']) === 'quotient'
    let a: Decimal
    let b: Decimal
    let resultat: Decimal
    let chiffresResultat: string
    if (quotient) {
      // Q = A ÷ B, avec Q de 2 ou 3 chiffres et B de 2 chiffres
      let q: number
      let diviseur: number
      let estimation: Decimal
      do {
        q = entierSansZeroFinal(randint(2, 3))
        diviseur = entierSansZeroFinal(2)
        estimation = arrondi(new Decimal(q * diviseur)).div(
          arrondi(new Decimal(diviseur)),
        )
        // l'estimation (quotient des arrondis) doit se calculer de tête
      } while (!estimation.equals(estimation.toSD(2)))
      const decimalesQ = randint(0, String(q).length)
      const decimalesB = randint(0, 2)
      a = decimal(q * diviseur, decimalesQ + decimalesB)
      b = decimal(diviseur, decimalesB)
      resultat = decimal(q, decimalesQ)
      chiffresResultat = String(q)
    } else {
      let produit: number
      let d1: number
      let d2: number
      do {
        d1 = entierSansZeroFinal(randint(2, 3))
        d2 = entierSansZeroFinal(2)
        produit = d1 * d2
      } while (produit % 10 === 0 || produit < 100)
      const nbChiffres = String(produit).length
      let decimales1: number
      let decimales2: number
      do {
        decimales1 = randint(0, String(d1).length)
        decimales2 = randint(0, 2)
      } while (decimales1 + decimales2 > nbChiffres)
      a = decimal(d1, decimales1)
      b = decimal(d2, decimales2)
      resultat = decimal(produit, decimales1 + decimales2)
      chiffresResultat = String(produit)
    }
    const operateur = quotient ? '\\div' : '\\times'
    const expression = `${texNombre(a)}${operateur}${texNombre(b)}`
    const estimation = quotient
      ? arrondi(a).div(arrondi(b))
      : arrondi(a).mul(arrondi(b))
    const listeChiffres = chiffresResultat
      .split('')
      .map((c) => `$${c}$`)
      .join(', ')
    // la calculatrice de l'énoncé ajoute un zéro au début (et parfois un à la fin) et oublie la virgule
    const affichage = `0${chiffresResultat}${'0'.repeat(randint(0, 1))}`
    const { prenom, pronom } = prenomPronom()
    this.question = `${prenom} possède une calculatrice qui ajoute parfois des zéros inutiles et qui oublie les virgules.<br>Quand ${pronom} tape $${expression}$, ${pronom} obtient $${affichage}$.<br>En travaillant uniquement avec des ordres de grandeur, retrouver la place de la virgule dans le résultat du ${quotient ? 'quotient' : 'produit'}.`
    this.optionsChampTexte = {
      dataKeys: touchesDecimal,
      texteAvant: `<br>$${expression}=$`,
    }
    this.reponse = resultat
    this.correction = `On arrondit chaque nombre à un seul chiffre significatif : $${texNombre(a)}\\approx${texNombre(arrondi(a))}$ et $${texNombre(b)}\\approx${texNombre(arrondi(b))}$.<br>
  Donc $${expression}\\approx${texNombre(arrondi(a))}${operateur}${texNombre(arrondi(b))}=${texNombre(estimation)}$.<br>
  Le résultat est proche de $${texNombre(estimation)}$ : avec les chiffres ${listeChiffres}, on obtient $${miseEnEvidence(texNombre(resultat))}$.`
  }
}
