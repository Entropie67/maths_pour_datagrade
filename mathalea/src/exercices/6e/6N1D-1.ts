import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import {
  conversionEnFractionDecimale,
  denominateursDecimaux,
} from '../../lib/outils/fractionsDecimales'
import { gcd } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import operation from '../../modules/operations'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Reconnaître un nombre décimal'
export const dateDePublication = '01/10/2026'
export const uuid = 'ec6b3'
export const interactifReady = true
export const interactifType = 'qcm'
export const amcReady = true
export const amcType = 'qcmMono'

export const refs = { 'fr-fr': ['6N1D-1'], 'fr-ch': ['9R1NO2B-6', '9R2NO2B-6', '9R3NO2B-6', 'PRQNO01A-6'] }

type FamilleVraie =
  | 'ecritureCourte'
  | 'ecritureLongue'
  | 'entier'
  | 'fractionDecimale'
  | 'fractionEntiere'
type FamilleFausse = 'pi' | 'fractionNonDecimale'
type Famille = FamilleVraie | FamilleFausse
type Question = {
  nombre: string
  estDecimal: boolean
  justification: string
}

const famillesVraies: FamilleVraie[] = [
  'ecritureCourte',
  'ecritureLongue',
  'entier',
  'fractionDecimale',
  'fractionEntiere',
]
// π ne peut être tiré qu'une fois : les fractions non décimales sont donc deux fois plus présentes.
const famillesFaussesAvecPi: FamilleFausse[] = [
  'pi',
  'fractionNonDecimale',
  'fractionNonDecimale',
]
const famillesFaussesSansPi: FamilleFausse[] = ['fractionNonDecimale']

/** Écrit l'entier `numerateur` divisé par 10^nbDecimales, sans arrondi ni regroupement des chiffres. */
function ecritureDecimale(numerateur: number, nbDecimales: number) {
  const chiffres = String(numerateur).padStart(nbDecimales + 1, '0')
  return `${chiffres.slice(0, -nbDecimales)}{,}${chiffres.slice(-nbDecimales)}`
}

/** Entier à nbDecimales + 1 chiffres, dont le dernier chiffre n'est pas 0 (pour que l'écriture décimale ait bien nbDecimales décimales). */
function numerateurSansZeroFinal(nbDecimales: number) {
  const numerateur = randint(10 ** nbDecimales, 10 ** (nbDecimales + 1) - 1)
  return numerateur % 10 === 0 ? numerateur + 1 : numerateur
}

/** Fraction irréductible n/d (n < 2d) dont le dénominateur est choisi parmi `denominateurs`. */
function fractionIrreductible(denominateurs: number[]) {
  const d = choice(denominateurs)
  const multiplesDeD = Array.from({ length: 2 * d }, (_, k) => k + 1).filter(
    (k) => gcd(k, d) !== 1,
  )
  return { n: randint(1, 2 * d, multiplesDeD), d }
}

/**
 * Pose la division de n par d jusqu'à retrouver un reste déjà obtenu (les calculs se répètent alors indéfiniment).
 * Renvoie la division posée suivie d'une phrase qui signale la répétition.
 */
function divisionJusquAuxRepetitions(n: number, d: number) {
  const restesObtenus = new Set<number>()
  let reste = n % d
  let nbDecimales = 0
  while (!restesObtenus.has(reste)) {
    restesObtenus.add(reste)
    reste = (reste * 10) % d
    nbDecimales++
  }
  const division = operation({
    operande1: n,
    operande2: d,
    type: 'division',
    // Une décimale de plus que nécessaire pour voir revenir le même reste.
    precision: nbDecimales + 1,
    options: { solution: true, colore: '' },
  })
  return `${division}<br>On retrouve le reste $${reste}$${sp()}: les calculs se répètent indéfiniment.`
}

function genereQuestion(famille: Famille): Question {
  switch (famille) {
    case 'ecritureCourte': {
      const nbDecimales = randint(1, 3)
      const numerateur = numerateurSansZeroFinal(nbDecimales)
      const nombre = ecritureDecimale(numerateur, nbDecimales)
      return {
        nombre: `$${nombre}$`,
        estDecimal: true,
        justification: `$${nombre}=\\dfrac{${texNombre(numerateur, 0)}}{${texNombre(10 ** nbDecimales, 0)}}$.`,
      }
    }
    case 'ecritureLongue': {
      const nbDecimales = randint(5, 8)
      const numerateur = numerateurSansZeroFinal(nbDecimales)
      const nombre = ecritureDecimale(numerateur, nbDecimales)
      return {
        nombre: `$${nombre}$`,
        estDecimal: true,
        justification: `$${nombre}=\\dfrac{${texNombre(numerateur, 0)}}{${texNombre(10 ** nbDecimales, 0)}}$.`,
      }
    }
    case 'entier': {
      const n = randint(2, 99)
      return {
        nombre: `$${n}$`,
        estDecimal: true,
        justification: `$${n}=\\dfrac{${n * 10}}{10}$.`,
      }
    }
    case 'fractionDecimale': {
      const { n, d } = fractionIrreductible(denominateursDecimaux)
      const conversion = conversionEnFractionDecimale(n, d)
      return {
        nombre: `$\\dfrac{${n}}{${d}}$`,
        estDecimal: true,
        justification: `$${conversion.debut}${conversion.fractionDecimale}$.`,
      }
    }
    case 'fractionEntiere': {
      // La division tombe juste (reste nul) : le quotient est un entier, donc un nombre décimal.
      const quotient = randint(2, 19)
      const diviseur = choice([3, 6, 7, 9, 11, 12, 13, 14, 15, 16, 18])
      const dividende = quotient * diviseur
      return {
        nombre: `$\\dfrac{${dividende}}{${diviseur}}$`,
        estDecimal: true,
        justification: `$\\dfrac{${dividende}}{${diviseur}}=${dividende}\\div${diviseur}=${quotient}=\\dfrac{${quotient * 10}}{10}$.`,
      }
    }
    case 'pi':
      return {
        nombre: '$\\pi$',
        estDecimal: false,
        justification:
          'les mathématiciens ont démontré que le nombre $\\pi$ n’avait pas d’écriture décimale finie (ils ont même montré que l’on ne pouvait pas l’écrire comme une fraction).',
      }
    case 'fractionNonDecimale': {
      const { n, d } = fractionIrreductible([3, 6, 9, 11])
      return {
        nombre: `$\\dfrac{${n}}{${d}}$`,
        estDecimal: false,
        justification: `si l’on pose la division de $${n}$ par $${d}$, on voit qu’il est impossible d’obtenir une écriture décimale finie.<br>${divisionJusquAuxRepetitions(n, d)}`,
      }
    }
  }
}

/** Alterne les familles de nombres décimaux et non décimaux, dans un ordre mélangé. */
function choisirFamilles(
  nbQuestions: number,
  famillesFausses: FamilleFausse[],
): Famille[] {
  let vraies: Famille[] = []
  let fausses: Famille[] = []
  let doitEtreVraie = choice([true, false])
  const familles: Famille[] = []
  while (familles.length < nbQuestions) {
    if (doitEtreVraie) {
      if (vraies.length === 0) vraies = shuffle(famillesVraies)
      familles.push(vraies.pop() as Famille)
    } else {
      if (fausses.length === 0) fausses = shuffle(famillesFausses)
      familles.push(fausses.pop() as Famille)
    }
    doitEtreVraie = !doitEtreVraie
  }
  return shuffle(familles)
}

/** Dire si un nombre est décimal ou non (Vrai/Faux), en justifiant. @author Rémi Angot */
export default class ReconnaitreNombreDecimal extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 7
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.besoinFormulaireCaseACocher = ['Exclure le nombre π', false]
    this.sup = false
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? `Le nombre suivant est-il un nombre décimal${sp()}?`
        : `Les nombres suivants sont-ils des nombres décimaux${sp()}?`
    const famillesFausses = this.sup
      ? famillesFaussesSansPi
      : famillesFaussesAvecPi
    const familles = choisirFamilles(this.nbQuestions, famillesFausses)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const question = genereQuestion(familles[i])
      if (!this.questionJamaisPosee(i, question.nombre)) {
        familles[i] = choisirFamilles(1, famillesFausses)[0]
        continue
      }
      this.autoCorrection[i] = {
        enonce: question.nombre,
        options: { vertical: false, ordered: true, radio: true },
        propositions: [
          { texte: 'Vrai', statut: question.estDecimal },
          { texte: 'Faux', statut: !question.estDecimal },
        ],
      }
      const qcm = propositionsQcm(this, i)
      this.listeQuestions[i] = `${question.nombre}${qcm.texte}`
      this.listeCorrections[i] =
        `${qcm.texteCorr}${texteEnCouleurEtGras(question.estDecimal ? 'Vrai' : 'Faux')} car ${question.justification}`
      i++
    }
    listeQuestionsToContenu(this)
  }
}
