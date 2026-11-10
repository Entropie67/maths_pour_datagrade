import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  conversionEnFractionDecimale,
  denominateursDecimaux,
} from '../../lib/outils/fractionsDecimales'
import { gcd } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Montrer qu’un nombre est décimal'
export const dateDePublication = '01/10/2026'
export const uuid = 'a2b92'

export const refs = { 'fr-fr': ['6N1D'], 'fr-ch': ['9R1NO2B-7', '9R2NO2B-7', '9R3NO2B-7', 'PRQNO01A-7'] }

type Famille = 'ecritureDecimale' | 'sommeDecimale' | 'fraction'
const familles: Famille[] = ['ecritureDecimale', 'sommeDecimale', 'fraction']

/** Fraction irréductible n/d (n < 2d) dont le dénominateur est choisi parmi les dénominateurs simples. */
function fractionDecimaleIrreductible() {
  const d = choice(denominateursDecimaux)
  const multiplesDeD = Array.from({ length: 2 * d }, (_, k) => k + 1).filter(
    (k) => gcd(k, d) !== 1,
  )
  return { n: randint(1, 2 * d, multiplesDeD), d }
}

/**
 * Montrer qu'un nombre est décimal en l'écrivant sous la forme d'une fraction décimale.
 * @author Rémi Angot
 */
export default class MontrerNombreDecimal extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.consigne =
      'Montrer que les nombres suivants sont des nombres décimaux.'
    this.spacing = 1.5
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    let famillesDisponibles: Famille[] = []
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      if (famillesDisponibles.length === 0)
        famillesDisponibles = shuffle(familles)
      const famille = famillesDisponibles[famillesDisponibles.length - 1]
      let texte = ''
      let texteCorr = ''
      let cle = ''
      switch (famille) {
        case 'ecritureDecimale': {
          const nbDecimales = randint(1, 3)
          const numerateur = randint(11, 10 ** (nbDecimales + 2) - 1)
          if (numerateur % 10 === 0) continue
          const denominateur = 10 ** nbDecimales
          const nombre = texNombre(numerateur / denominateur)
          texte = `$${nombre}$`
          texteCorr = `$${nombre}=${miseEnEvidence(`\\dfrac{${texNombre(numerateur, 0)}}{${texNombre(denominateur, 0)}}`)}$`
          cle = nombre
          break
        }
        case 'sommeDecimale': {
          const entier = randint(2, 9)
          const nbDecimales = randint(2, 3)
          const numerateur = randint(11, 99)
          if (numerateur % 10 === 0) continue
          const denominateur = 10 ** nbDecimales
          const denominateurTex = texNombre(denominateur, 0)
          texte = `$${entier}+\\dfrac{${numerateur}}{${denominateurTex}}$`
          texteCorr = `$${entier}+\\dfrac{${numerateur}}{${denominateurTex}}=\\dfrac{${entier}\\times${denominateurTex}}{${denominateurTex}}+\\dfrac{${numerateur}}{${denominateurTex}}=\\dfrac{${texNombre(entier * denominateur, 0)}}{${denominateurTex}}+\\dfrac{${numerateur}}{${denominateurTex}}=${miseEnEvidence(`\\dfrac{${texNombre(entier * denominateur + numerateur, 0)}}{${denominateurTex}}`)}$`
          cle = `${entier}+${numerateur}/${denominateur}`
          break
        }
        case 'fraction': {
          const { n, d } = fractionDecimaleIrreductible()
          const conversion = conversionEnFractionDecimale(n, d)
          texte = `$\\dfrac{${n}}{${d}}$`
          texteCorr = `$${conversion.debut}${miseEnEvidence(conversion.fractionDecimale)}$`
          cle = `${n}/${d}`
          break
        }
      }
      if (this.questionJamaisPosee(i, cle)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] =
          `${texteCorr}<br><br>${texte} est bien un nombre décimal car il peut s’écrire sous la forme d’une fraction décimale (c’est-à-dire une fraction qui a pour dénominateur $10$, $100$, $1\\,000$, $\\ldots$).`
        famillesDisponibles.pop()
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
