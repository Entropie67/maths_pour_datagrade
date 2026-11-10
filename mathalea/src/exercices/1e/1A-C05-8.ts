import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  correctionPuissanceLaPlusProche,
  puissanceDeDix,
  tireNombreOdg,
  type NombreOdg,
  touchesPuissanceDeDix,
} from '../../lib/outils/ordreDeGrandeur'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const dateDePublication = '26/10/2026'
export const uuid = '2e4c5'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': ['1A-C05-8', '2A-N5-8'],
  'fr-ch': [],
}
export const interactifReady = true
export const titre =
  'Déterminer un ordre de grandeur d’un produit ou d’un quotient avec des puissances de $10$'

/**
 * Chaque nombre est remplacé par la puissance de 10 la plus proche, puis on calcule sur les exposants.
 * Le premier chiffre de chaque nombre est 1, 2, 8 ou 9 : la puissance de 10 à prendre est indiscutable.
 */
export default class OrdreDeGrandeurProduitQuotientPuissances extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierEntierementPersonnalisable
    this.optionsDeComparaison = { puissance: true }
  }

  nouvelleVersion() {
    const cas = this.quotaChoice('cas', [
      'produit',
      'produitAvecPetitNombre',
      'quotient',
    ])
    const quotient = cas === 'quotient'
    let nb1: NombreOdg
    let nb2: NombreOdg
    do {
      const exposant2 =
        cas === 'produit' || (quotient && randint(0, 1) === 1)
          ? randint(3, 9)
          : randint(-5, -2) // second nombre inférieur à 1
      nb1 = tireNombreOdg(randint(3, 9), randint(1, 4))
      nb2 = tireNombreOdg(exposant2, randint(1, 3))
      // le résultat n'est jamais 10^0 ni 10^1
    } while (
      (quotient
        ? nb1.exposantOdg - nb2.exposantOdg
        : nb1.exposantOdg + nb2.exposantOdg) <= 1
    )
    const o1 = nb1.exposantOdg
    const o2 = nb2.exposantOdg
    const operateur = quotient ? '\\div' : '\\times'
    const expression = `${texNombre(nb1.valeur)}${operateur}${texNombre(nb2.valeur)}`
    const resultat = quotient ? o1 - o2 : o1 + o2
    const attendu = puissanceDeDix(resultat)
    const o2Tex = o2 < 0 ? `(${o2})` : `${o2}`
    const calcul = quotient
      ? `\\dfrac{${puissanceDeDix(o1)}}{${puissanceDeDix(o2)}}=10^{${o1}-${o2Tex}}`
      : `${puissanceDeDix(o1)}\\times${puissanceDeDix(o2)}=10^{${o1}+${o2Tex}}`
    this.question = `Donner un ordre de grandeur de $${expression}$ sous la forme d'une puissance de $10$.`
    this.optionsChampTexte = {
      dataKeys: touchesPuissanceDeDix,
      texteAvant: `<br>Un ordre de grandeur de $${expression}$ est `,
      texteApres: '.',
    }
    this.reponse = attendu
    this.correction = `Comme on veut un ordre de grandeur sous la forme d'une puissance de $10$, on remplace chaque nombre par la puissance de $10$ la plus proche.<br>
  ${correctionPuissanceLaPlusProche(nb1)}<br>
  ${correctionPuissanceLaPlusProche(nb2)}<br>
  Donc $${expression}\\approx${quotient ? `${puissanceDeDix(o1)}\\div${puissanceDeDix(o2)}` : `${puissanceDeDix(o1)}\\times${puissanceDeDix(o2)}`}$.<br>
  On ${quotient ? 'soustrait' : 'additionne'} les exposants : $${calcul}=${miseEnEvidence(attendu)}$.`
  }
}
