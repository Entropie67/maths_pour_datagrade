import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { pgcd } from '../../../lib/outils/primalite'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer une probabilité sur un dé'
export const interactifReady = true

export const uuid = 'ith1o'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q26 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = {
      fractionEgale: true,
      nombreDecimalSeulement: true,
    }
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  enonce(nombre?: number): void {
    if (nombre == null) {
      nombre = choice([4, 8, 9, 10, 12, 14])
    }

    // Trouver les diviseurs de 'nombre' parmi {1, 2, 3, 4, 5, 6}
    const diviseurs: number[] = []
    for (let i = 1; i <= 6; i++) {
      if (nombre % i === 0) {
        diviseurs.push(i)
      }
    }

    const nbDiviseurs = diviseurs.length
    const proba = new FractionEtendue(nbDiviseurs, 6)

    this.reponse = proba

    this.question = `On lance un dé équilibré à six faces.<br>
    Probabilité d'obtenir un diviseur de $${nombre}$`

    let listeDiviseurs = ''
    if (nbDiviseurs === 1) {
      listeDiviseurs = `$${diviseurs[0]}$`
    } else if (nbDiviseurs === 2) {
      listeDiviseurs = `$${diviseurs[0]}$ et $${diviseurs[1]}$`
    } else {
      for (let i = 0; i < nbDiviseurs - 1; i++) {
        listeDiviseurs += `$${diviseurs[i]}$, `
      }
      listeDiviseurs += `et $${diviseurs[nbDiviseurs - 1]}$`
    }

    this.correction = `Les diviseurs de $${nombre}$ parmi les faces du dé sont : ${listeDiviseurs}.<br>
    Il y a $${nbDiviseurs}$ cas favorables sur $6$ issues possibles équiprobables.<br>
    La probabilité est : ${pgcd(nbDiviseurs, 6) === 1 ? `$${miseEnEvidence(proba.texFractionSimplifiee)}$` : `$\\dfrac{${nbDiviseurs}}{6}=${miseEnEvidence(proba.texFractionSimplifiee)}$`}.`

    this.canEnonce = `On lance un dé équilibré à six faces.<br>
    Probabilité d'obtenir un diviseur de $${nombre}$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(6)
    else this.enonce()
  }
}
