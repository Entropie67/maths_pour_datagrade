import { propositionsQcm } from '../../lib/interactif/qcm'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { arrondi, rangeMinMax } from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { pgcd } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Savoir que la fraction peut représenter un nombre entier, un nombre décimal non entier ou un nombre non décimal'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

/** Savoir que la fraction peut représenter un nombre entier, un nombre décimal non entier ou un nombre non décimal
 * @author Eric Elter
 */
export const uuid = '28e58'

export const refs = {
  'fr-fr': ['6N3F', '6AutoF1-2'],
  'fr-2016': ['6N22-6'],
  'fr-ch': ['9R1NO4C-5', '9R2NO4C-5', '9R3NO4C-5'],
}

/**
 * Retourne tous les diviseurs d'un nombre donné, à l'exception de 1.
 * Inclut le nombre lui-même comme diviseur.
 *
 * @param {number} n - Le nombre pour lequel on cherche les diviseurs.
 * @returns {number[]} Un tableau contenant tous les diviseurs de n, sauf 1.
 * @author Eric Elter
 * @example
 * getDiviseursSansUn(12); // [2, 3, 4, 6, 12]
 * getDiviseursSansUn(7);  // [7]
 * getDiviseursSansUn(1);  // []
 */

function getDiviseursSansUn(n: number): number[] {
  if (n <= 1) return []

  const diviseurs: number[] = []

  for (let i = 2; i <= Math.floor(n / 2); i++) {
    if (n % i === 0) {
      diviseurs.push(i)
    }
  }

  diviseurs.push(n) // On ajoute le nombre lui-même comme diviseur

  return diviseurs
}

/**
 * Détermine si une fraction `num / den` donne un nombre décimal fini ou non.
 * Une fraction a une écriture décimale finie si, après simplification,
 * son dénominateur ne contient que des facteurs premiers 2 et/ou 5.
 *
 * @param {number} num - Le numérateur de la fraction.
 * @param {number} den - Le dénominateur de la fraction.
 * @returns {boolean} `true` si le résultat est un nombre décimal fini, `false` sinon.
 * @author Eric Elter
 * @example
 * estDecimal(1, 2); // true (0.5)
 * estDecimal(1, 3); // false (0.333...)
 * estDecimal(7, 8); // true (0.875)
 * estDecimal(1, 6); // false (0.1666...)
 */
function estDecimal(num: number, den: number): boolean {
  let b = arrondi(den / pgcd(num, den))

  // On enlève tous les facteurs 2 et 5 du dénominateur
  while (b % 2 === 0) b /= 2
  while (b % 5 === 0) b /= 5

  // Si le dénominateur est réduit à 1, c'est une fraction décimale finie
  return b === 1
}

export default class FractionRepresenteNb extends Exercice {
  constructor() {
    super()

    this.consigne =
      'Pour chaque cas, indiquer si la fraction représente un nombre entier, un nombre décimal non entier ou bien un nombre non décimal.'
    this.nbQuestions = 5

    this.sup = 1
    this.sup2 = 1
    this.spacing = 2
    this.spacingCorr = 2
    this.besoinFormulaireNumerique = [
      'Choix du numérateur le plus petit possible',
      500,
    ]
    this.besoinFormulaire2Numerique = [
      'Choix du numérateur le plus grand possible',
      500,
    ]
    this.besoinFormulaire3Numerique = [
      'Choix du dénominateur',
      3,
      [
        '1 : Plus petit que 10',
        '2 : Plus petit que 100',
        '3 : Plus petit que 500',
      ].join('\n'),
    ]

    this.sup = 1
    this.sup2 = 100
    this.sup3 = 1

    this.comment = '1 ne peut pas être choisi comme numérateur.'
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Pour chaque cas, indiquer si la fraction représente un nombre entier, un nombre décimal non entier ou bien un nombre non décimal.'
        : 'Indiquer si la fraction représente un nombre entier, un nombre décimal non entier ou bien un nombre non décimal.'
    let choixDenominateurNbDecimal = true
    const listeTypeDeQuestions = []
    for (let ee = 0; ee < Math.ceil(this.nbQuestions / 3); ee++) {
      listeTypeDeQuestions.push(...shuffle([1, 2, 3]))
    }
    let indiceNonDecimal = 0
    let numerateurMin = Math.max(2, this.sup)
    let numerateurMax = Math.max(2, this.sup2)
    if (numerateurMin > numerateurMax) {
      const tampon = numerateurMax
      numerateurMax = numerateurMin
      numerateurMin = tampon
    }
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let typeNombre = ''
      let tabDenominateurNbDecimal = combinaisonListes(
        [2, 4, 5, 8, 10, 20, 50, 100, 200, 500],
        this.nbQuestions,
      )
      let tabDenominateurNbNonDecimal = combinaisonListes(
        [3, 6, 7, 9, 11, 12, 13, 14, 15, 17, 18, 19, 30, 60, 150, 300],
        this.nbQuestions,
      )
      if (this.sup3 === 1) {
        tabDenominateurNbDecimal = combinaisonListes(
          [2, 4, 5, 8],
          this.nbQuestions,
        )
        tabDenominateurNbNonDecimal = combinaisonListes(
          [3, 6, 7, 9],
          this.nbQuestions,
        )
      } else if (this.sup3 === 2) {
        tabDenominateurNbDecimal = combinaisonListes(
          [2, 4, 5, 8, 10, 20, 50],
          this.nbQuestions,
        )
        tabDenominateurNbNonDecimal = combinaisonListes(
          [3, 6, 7, 9, 11, 12, 13, 14, 15, 17, 18, 19, 30, 60],
          this.nbQuestions,
        )
      }
      let numerateur = choice(rangeMinMax(numerateurMin, numerateurMax))
      const denominateurNbNonDecimal =
        tabDenominateurNbNonDecimal[indiceNonDecimal]
      const denominateurNbDecimal =
        tabDenominateurNbDecimal[i - indiceNonDecimal]
      let denominateur = 1
      let compteur = 0
      switch (listeTypeDeQuestions[i]) {
        case 1: // Un entier
          if (choixDenominateurNbDecimal) {
            denominateur = denominateurNbNonDecimal
            while (
              arrondi(numerateur / denominateur) % 1 !== 0 &&
              compteur < 100
            ) {
              numerateur = choice(rangeMinMax(numerateurMin, numerateurMax))
              compteur++
            }
          } else {
            denominateur = denominateurNbDecimal
            while (
              arrondi(numerateur / denominateur) % 1 !== 0 &&
              compteur < 100
            ) {
              numerateur = choice(rangeMinMax(numerateurMin, numerateurMax))
              compteur++
            }
          }
          if (compteur === 100) {
            // Nombre entier non trouvé alors on en impose un.
            denominateur = choice(getDiviseursSansUn(numerateur))
          }
          choixDenominateurNbDecimal = !choixDenominateurNbDecimal
          typeNombre = 'entier'
          break

        case 2: // Un décimal non entier
          denominateur = denominateurNbDecimal
          while (
            arrondi(numerateur / denominateur) % 1 === 0 &&
            compteur < 100
          ) {
            numerateur = choice(rangeMinMax(numerateurMin, numerateurMax))
            compteur++
          }
          if (compteur === 100) {
            // Nombre décimal non entier non trouvé alors on en impose un.
            denominateur = choice([2, 4, 5, 8, 10]) * numerateur
          }
          typeNombre = 'decimal'
          break

        case 3: {
          // Un décimal non entier
          denominateur = denominateurNbNonDecimal
          let b = arrondi(denominateur / pgcd(numerateur, denominateur))
          // On enlève tous les facteurs 2 et 5 du dénominateur
          while (b % 2 === 0) b /= 2
          while (b % 5 === 0) b /= 5

          // Si le dénominateur est réduit à 1, c'est une fraction décimale finie
          while (estDecimal(numerateur, denominateur) && compteur < 100) {
            numerateur = choice(rangeMinMax(numerateurMin, numerateurMax))
            compteur++
          }
          if (compteur === 100) {
            // Nombre décimal non entier non trouvé alors on en impose un.
            denominateur = numerateur + randint(-2, 2, [0])
          }
          typeNombre = 'non decimal'
          break
        }
      }

      const fractionUtile = new FractionEtendue(numerateur, denominateur)
        .texFraction

      texte += `$${fractionUtile}$`
      if (typeNombre !== 'non decimal') {
        texteCorr = `Par calcul mental ou en posant la division $${numerateur}\\div${texNombre(denominateur)}$, on obtient que $${fractionUtile}=${texNombre(numerateur / denominateur)}$ et est donc un `
        texteCorr +=
          typeNombre === 'entier'
            ? `${texteEnCouleurEtGras('nombre entier')}.<br>`
            : `${texteEnCouleurEtGras('nombre décimal non entier')}.<br>`
        if (tabDenominateurNbDecimal.includes(denominateur)) {
          texteCorr += `De manière générale, toute division d'un nombre entier par $${denominateur}$ aboutit à un nombre décimal, parfois entier.`
        }
      } else {
        texteCorr = `Par calcul mental ou en posant la division $${numerateur}\\div${denominateur}$, on se rend compte que cette division ne se «${sp()}termine${sp()}» pas ($${fractionUtile}\\approx${texNombre(numerateur / denominateur, 3)}$) et $${fractionUtile}$ est donc un ${texteEnCouleurEtGras('nombre non décimal')}.`
      }

      this.autoCorrection[i] = {}
      this.autoCorrection[i].propositions = [
        {
          texte: 'Nombre entier',
          statut: typeNombre === 'entier',
        },
        {
          texte: 'Nombre décimal non entier',
          statut: typeNombre === 'decimal',
        },
        {
          texte: 'Nombre non décimal',
          statut: typeNombre === 'non decimal',
        },
      ]
      this.autoCorrection[i].options = { ordered: true, radio: true } // On ne mélange pas les propositions
      const props = propositionsQcm(this, i)

      texte += '<br>' + props.texte

      if (this.questionJamaisPosee(i, denominateur, numerateur)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        if (
          listeTypeDeQuestions[i] === 3 ||
          (listeTypeDeQuestions[i] === 1 && choixDenominateurNbDecimal)
        )
          indiceNonDecimal++
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
