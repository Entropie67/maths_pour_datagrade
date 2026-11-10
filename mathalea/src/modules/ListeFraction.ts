import { listeDesDiviseurs, ppcmListe } from '../lib/outils/primalite'
import type FractionEtendue from './FractionEtendue'

function ppcm(n: number[]): number {
  return ppcmListe(n)
}

/**
 * Trie la liste pour la retourner dans l'ordre croissant
 * @private
 */
const sortFractions = (liste: FractionEtendue[]): FractionEtendue[] =>
  liste.slice().sort((f1, f2) => f1.valeurDecimale - f2.valeurDecimale)

/**
 * Classe ListeFraction qui propose des méthodes utiles sur les collections de fractions
 * @author Jean-claude Lhote
 */
class ListeFraction {
  liste: FractionEtendue[]
  denominateurs_amis: number[][]
  listeMemeDenominateur: FractionEtendue[]
  listeRangee: FractionEtendue[]
  listeRangeeMemeDenominateur: FractionEtendue[]
  listeRangeeMmeDenominateur: FractionEtendue[]
  listeSimplifiee: FractionEtendue[]
  listeRangeeSimplifiee: FractionEtendue[]
  texListe: string

  constructor(...fractions: FractionEtendue[]) {
    /**
     * La liste des fractions passées au constructeur (une par argument)
     */
    this.liste = fractions
    /**
     * Les tableaux contenant les diviseurs différents de 1 de chaque dénominateur
     */
    this.denominateurs_amis = []
    let listetemp: number[] = []
    const dens: number[] = []
    this.liste.forEach((f) => {
      dens.push(f.d)
      listetemp = listeDesDiviseurs(f.d)
      listetemp.splice(0, 1)
      this.denominateurs_amis.push(listetemp)
    })
    const den = ppcm(dens)
    /**
     * La liste des fractions mises au même dénominateur dans le même ordre que this.liste
     */
    this.listeMemeDenominateur = []
    this.liste.forEach((f) => {
      this.listeMemeDenominateur.push(f.reduire(Math.round(den / f.d)))
    })

    /**
     * La liste de fraction rangée dans l'ordre croissant.
     */
    this.listeRangee = sortFractions(this.liste)
    /**
     * La liste des fractions mises au même dénominateur par ordre croissant
     */
    this.listeRangeeMemeDenominateur = sortFractions(this.listeMemeDenominateur)
    this.listeRangeeMmeDenominateur = this.listeRangeeMemeDenominateur
    /**
     * la liste des fractions simplifiées (dans le même ordre que celles fournies)
     */
    this.listeSimplifiee = this.liste.map((f) => f.simplifie())
    /**
     * la liste des fractions simplifiées par ordre croissant
     */
    this.listeRangeeSimplifiee = sortFractions(this.listeSimplifiee)
    /**
     * La liste des fractions au format LaTeX, séparées par ;
     */
    this.texListe = this.liste.map((f) => f.texFraction).join(' ; ')
  }

  /**
   * @todo virer cette méthode jamais utilisée
   */
  completeListe(...frac: FractionEtendue[]): void {
    const dens = [this.listeMemeDenominateur[0].d]
    for (let i = 0; i < frac.length; i++) {
      this.liste.push(frac[i])
      dens.push(frac[i].d)
      const listetemp = listeDesDiviseurs(frac[i].d)
      listetemp.splice(0, 1)
      this.denominateurs_amis.push(listetemp)
    }
    const den = ppcm(dens)
    this.listeMemeDenominateur = []
    for (let i = 0; i < this.liste.length; i++) {
      this.listeMemeDenominateur.push(
        this.liste[i].reduire(Math.round(den / this.liste[i].d)),
      )
    }
    this.listeSimplifiee = []
    for (let i = 0; i < this.liste.length; i++) {
      this.listeSimplifiee.push(this.liste[i].simplifie())
    }
    this.texListe = ''
    for (let i = 0; i < this.liste.length - 1; i++) {
      this.texListe += this.liste[i].texFraction + ' ; '
    }
    this.texListe += this.liste[this.liste.length - 1].texFraction
    this.listeRangee = sortFractions(this.liste) // La liste de fraction rangée dans l'ordre croissant.
    this.listeRangeeMmeDenominateur = sortFractions(this.listeMemeDenominateur)
    this.listeRangeeSimplifiee = sortFractions(this.listeSimplifiee)
  }
}

export default ListeFraction
