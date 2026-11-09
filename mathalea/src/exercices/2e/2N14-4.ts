import {
  addMultiMathfield,
  type DataOptionsMultiMathfield,
} from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import type { ValeurNames } from '../../lib/types'
import { fraction } from '../../modules/fractions'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const uuid = 'abdef'
export const dateDePublication = '19/08/2026'
export const titre = 'Comparer des nombres à $1$'
export const interactifReady = true
export const refs = {
  'fr-fr': ['2N14-4'],
  'fr-ch': [],
}

/**
 * @author Jean-Claude Lhote
 * Comparer des nombres à un
 */

const fraction6Chiffres = () => {
  const num = randint(1, 8) * 100 + randint(0, 9) * 10 + randint(0, 9)
  const delta = choice([-2, -1, 1, 2])
  const den = num + delta
  return { fraction: fraction(num, den) }
}
const fraction8Chiffres = () => {
  const num =
    randint(1, 8) * 1000 +
    randint(0, 9) * 100 +
    randint(0, 9) * 10 +
    randint(0, 9)
  const delta = choice([-2, -1, 1, 2])
  const den = num + delta
  return { fraction: fraction(num, den) }
}
const radicalSimple = () => {
  const radical = choice([
    randint(1, 99) / 100,
    randint(1, 9) / 10,
    randint(1, 9),
  ])
  return { radical }
}

const quotientDecimal = () => {
  const expoNum = randint(-3, -1)
  const expoDen = randint(-3, -1)
  const num = randint(1, 9) * 10 ** expoNum
  const den = randint(1, 9) * 10 ** expoDen
  return { quotient: { num, den } }
}

const calcul = () => {
  const typeCalcul = choice([1, 2])
  switch (typeCalcul) {
    case 1: {
      const a = randint(1, 3)
      const factor = randint(1, 3)
      const b = randint(3, 6) * factor
      const c = randint(-4, -2)
      const d = b / factor - c
      const expression = `${a} - \\dfrac{${b}}{${c}+${d}}`
      const value = a - b / (c + d)
      const explication = `le calcul donne $${texNombre(value, 3)}$ comme résultat.`
      return { expression, value, explication }
    }
    case 2:
    default: {
      const b = randint(5, 9)
      const a = b + randint(1, 3)
      const c = randint(1, 3)
      const d = randint(2, 3, c)
      const expression = `\\dfrac{${a}+${b}}{\\dfrac{${c}}{${d}}}`
      const value = (a + b) / (c / d)
      const numerateur = (a + b) * d
      const explication =
        numerateur % c === 0
          ? `le calcul donne $${texNombre(value, 3)}$ comme résultat.`
          : `$${expression} = \\dfrac{${a + b}\\times ${d}}{${c}} = \\dfrac{${numerateur}}{${c}}$ et le numérateur est supérieur au dénominateur.`
      return { expression, value, explication }
    }
  }
}

export default class ComparerDesNombresAUn extends Exercice {
  constructor() {
    super()
    this.spacing = 1
    this.spacingCorr = 3
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.sup = '5'
    this.besoinFormulaireTexte = [
      'Types de nombres',
      [
        'Nombres séparés par des tirets :',
        '1 : Fractions',
        '2 : Racines carrées',
        '3 : Quotients de nombres décimaux',
        '4 : Calculs',
        '5 : Mélange',
      ].join('\n'),
    ]
  }
  nouvelleVersion() {
    this.consigne = this.interactif
      ? 'Pour chacun des nombres suivants, compléter avec le symbole $<$, $>$ ou $=$.'
      : 'Comparer à $1$ chacun des nombres suivants.'
    const typesDeNombres = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: 5,
    })
    const fonctionsGeneratrices = typesDeNombres.map((type) => {
      switch (type) {
        case 1:
          return choice([fraction6Chiffres, fraction8Chiffres])
        case 2:
          return radicalSimple
        case 3:
          return quotientDecimal
        case 4:
        default:
          return calcul
      }
    })
    let templates = ``
    let indexChamp = 1
    const dataOptions: DataOptionsMultiMathfield = {}
    const reponses: Record<string, unknown> = { bareme: toutAUnPoint }
    let texteCorr = ''
    for (const generateur of fonctionsGeneratrices) {
      const nombre = generateur()
      if ('fraction' in nombre) {
        templates += `${indexChamp}. $${nombre.fraction.texFraction}$ %{champ${indexChamp}}${sp(10)}`
        texteCorr += `${indexChamp}. $${nombre.fraction.texFraction} ${nombre.fraction.num < nombre.fraction.den ? miseEnEvidence('<') : nombre.fraction.num > nombre.fraction.den ? miseEnEvidence('>') : miseEnEvidence('=')} 1$ car le numérateur est ${nombre.fraction.num < nombre.fraction.den ? 'inférieur' : nombre.fraction.num > nombre.fraction.den ? 'supérieur' : 'égal'} au dénominateur.<br>`
        if (nombre.fraction.num < nombre.fraction.den) {
          reponses[`champ${indexChamp}`] = { value: '<' }
        } else if (nombre.fraction.num > nombre.fraction.den) {
          reponses[`champ${indexChamp}`] = { value: '>' }
        } else {
          reponses[`champ${indexChamp}`] = { value: '=' }
        }
      } else if ('radical' in nombre) {
        templates += `${indexChamp}. $ \\sqrt{${texNombre(nombre.radical, 3)}}$ %{champ${indexChamp}}${sp(10)}`
        texteCorr += `${indexChamp}. $ \\sqrt{${texNombre(nombre.radical, 3)}} ${nombre.radical < 1 ? miseEnEvidence('<') : nombre.radical > 1 ? miseEnEvidence('>') : miseEnEvidence('=')} 1$ car la fonction racine carrée est croissante, donc comme $${texNombre(nombre.radical, 3)} ${nombre.radical < 1 ? '<' : nombre.radical > 1 ? '>' : '='} 1$ alors $ \\sqrt{${texNombre(nombre.radical, 3)}} ${nombre.radical < 1 ? '<' : nombre.radical > 1 ? '>' : '='} \\sqrt{1}$.<br>`
        if (nombre.radical < 1) {
          reponses[`champ${indexChamp}`] = { value: '<' }
        } else if (nombre.radical > 1) {
          reponses[`champ${indexChamp}`] = { value: '>' }
        } else {
          reponses[`champ${indexChamp}`] = { value: '=' }
        }
      } else if ('quotient' in nombre) {
        templates += `${indexChamp}. $\\dfrac{${texNombre(nombre.quotient.num, 3)}}{${texNombre(nombre.quotient.den, 3)}}$ %{champ${indexChamp}}${sp(10)}`
        texteCorr += `${indexChamp}. $\\dfrac{${texNombre(nombre.quotient.num, 3)}}{${texNombre(nombre.quotient.den, 3)}} ${nombre.quotient.num < nombre.quotient.den ? miseEnEvidence('<') : nombre.quotient.num > nombre.quotient.den ? miseEnEvidence('>') : miseEnEvidence('=')} 1$ car le numérateur est ${nombre.quotient.num < nombre.quotient.den ? 'inférieur' : nombre.quotient.num > nombre.quotient.den ? 'supérieur' : 'égal'} au dénominateur.<br>`
        if (nombre.quotient.num < nombre.quotient.den) {
          reponses[`champ${indexChamp}`] = { value: '<' }
        } else if (nombre.quotient.num > nombre.quotient.den) {
          reponses[`champ${indexChamp}`] = { value: '>' }
        } else {
          reponses[`champ${indexChamp}`] = { value: '=' }
        }
      } else if ('expression' in nombre) {
        templates += `${indexChamp}. $${nombre.expression}$ %{champ${indexChamp}}${sp(10)}`
        texteCorr += `${indexChamp}. $${nombre.expression} ${nombre.value < 1 ? miseEnEvidence('<') : nombre.value > 1 ? miseEnEvidence('>') : miseEnEvidence('=')} 1$ car ${nombre.explication}<br>`
        if (nombre.value < 1) {
          reponses[`champ${indexChamp}`] = { value: '<' }
        } else if (nombre.value > 1) {
          reponses[`champ${indexChamp}`] = { value: '>' }
        } else {
          reponses[`champ${indexChamp}`] = { value: '=' }
        }
      }
      dataOptions[`champ${indexChamp}` as ValeurNames] = {
        keyboard: KeyboardType.clavierCompare,
        minWidth: 15,
        texteApres: '$1$',
      }
      indexChamp++
    }

    this.listeQuestions[0] = addMultiMathfield(this, 0, {
      dataTemplate: templates,
      dataOptions,
    })
    handleAnswers(this, 0, reponses, { formatInteractif: 'multi-mathfield' })
    this.listeCorrections[0] = texteCorr
    listeQuestionsToContenu(this)
  }
}
