import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'

export const titre = 'Eric fait ses tests interactifs.'
export const interactifReady = true

export const refs = {
  'fr-fr': [],
  'fr-ch': [''],
}

export const uuid = 'testEEE'

// const ce = new ComputeEngine({ tolerance: 1e-21 })
// handleExpressionsForcementReduites('\\dfrac23 x', '\\dfrac23 x')

// console.info('+++++++++++++++++++')
// console.info(expand('3x+12').latex)
// console.info(expand('3.1x+12').latex)
// console.info(ce.parse('3.1x+12', { form: 'raw' }).latex)
// true but should be false.

/* console.info('3-1', ce.parse('3-1', { form: 'raw' }).toJSON())
console.info('3+-1', ce.parse('3+-1', { form: 'raw' }).toJSON())
console.info(
  '(+3)-(+1)',
  ce.parse('(+3)-(+1)', { form: ['Flatten'] }).toJSON(),
)
console.info('Comparaison avec 2x+1')
console.info(
  ce.parse('1+2x', { form: 'raw' }).toJSON(),
  ce.parse('1+2x', { form: 'raw' }).latex,
)
console.info(
  'isSame avec raw : 1+2x',
  engine
    .parse('1+2x', { form: 'raw' })
    .isSame(ce.parse('2x+1', { form: 'raw' })),
)
console.info(
  'isEqual avec raw : 1+2x',
  engine
    .parse('1+2x', { form: 'raw' })
    .isEqual(ce.parse('2x+1', { form: 'raw' })),
)
console.info(
  ce.parse('1+2x', { form: 'canonical' }).toJSON(),
  ce.parse('1+2x', { form: 'canonical' }).latex,
)
console.info(
  'isSame avec canonical : 1+2x',
  engine
    .parse('1+2x', { form: 'canonical' })
    .isSame(ce.parse('2x+1', { form: 'canonical' })),
)
console.info(
  'isEqual avec canonical : 1+2x',
  engine
    .parse('1+2x', { form: 'canonical' })
    .isEqual(ce.parse('2x+1', { form: 'canonical' })),
)
console.info('Comparaison avec 2x+1')
console.info(
  ce.parse('1+x+x', { form: 'raw' }).toJSON(),
  ce.parse('1+x+x', { form: 'raw' }).latex,
)
console.info(
  'isSame avec raw : 1+x+x',
  engine
    .parse('1+x+x', { form: 'raw' })
    .isSame(ce.parse('2x+1', { form: 'raw' })),
)
console.info(
  'isEqual avec raw : 1+x+x',
  engine
    .parse('1+x+x', { form: 'raw' })
    .isEqual(ce.parse('2x+1', { form: 'raw' })),
)
console.info(
  ce.parse('1+x+x', { form: 'canonical' }).toJSON(),
  ce.parse('1+x+x', { form: 'canonical' }).latex,
)
console.info(
  'isSame avec canonical : 1+x+x',
  engine
    .parse('1+x+x', { form: 'canonical' })
    .isSame(ce.parse('2x+1', { form: 'canonical' })),
)
console.info(
  'isEqual avec canonical : 1+x+x',
  engine
    .parse('1+x+x', { form: 'canonical' })
    .isEqual(ce.parse('2x+1', { form: 'canonical' })),
)
console.info(ce.parse('1+x+x').isSame(ce.parse('2x+1')))
console.info(
  customCanonical(ce.parse('1+x+x', { form: 'raw' }), {
    expressionsForcementReduites: true,
    fractionIrreductible: false,
    nombreDecimalSeulement: false,
  }).isEqual(ce.parse('2x+1')),
) */
/* console.info(
  engine
    .parse('1000')
    .toLatex({ notation: 'scientific', avoidExponentsInRange: [0, 0] }),
)
console.info(
  engine
    .parse('2000')
    .toLatex({ notation: 'scientific', avoidExponentsInRange: [0, 0] }),
)
const saisie = ce.parse('(x+5)^2', { canonical: true })
const saisieDev = engine
  .expr(['ExpandAll', saisie])
  .evaluate()
  .simplify().canonical
const reponseParsed = ce.parse('(x+5)(x+5)', { canonical: true })
const reponseDev = engine
  .expr(['ExpandAll', reponseParsed])
  .evaluate()
  .simplify().canonical
console.info(saisieDev.isEqual(reponseDev))
const result = fonctionComparaison('3.1\\times10^{3}', '3100', {
  ecritureScientifique: true,
})

const result = fonctionComparaison(
  '0.90\\times c_{n}+50',
  '20+30+0.90\\times c_{n}',
  {
    calculFormel: true,
  },
)



const expr1 = ce.parse('(15 \\div 3) - 3', { canonical: true })
const expr2 = ce.parse('10 \\times (9-4)', {
  canonical: false,
})
console.info(expr1.latex) // -> false but should be true
// console.info(expr1.simplify().json) // -> false but should be true
console.info(expr2.latex) // -> false but should be true

console.info('comparaison', expr1.isEqual(expr2)) // -> true OK of course
console.info(expr1.isSame(expr2)) // -> true OK of course

console.info(expr1.latex)
console.info(JSON.stringify(expr2.json))

console.info(ce.parse('2^6').isEqual(ce.parse('-2^6'))) // -> false OK
console.info(ce.parse('(-2)^6').isEqual(ce.parse('2^6'))) // -> true
console.info(ce.parse('(-2)^6').isSame(ce.parse('-2^6'))) // -> false
*/

/* console.info('-\\dfrac12'.replace(/^-\\dfrac(?:(\d)(\d)|{(-?\d+)}{(-?\d+)})$/i, function (match, p1, p2, p3, p4) {
  return '\\dfrac{' + ((p1 || p3) * (p2 || p4) > 0 ? '-' : '') + Math.abs(p1 || p3) + '}{' + Math.abs(p2 || p4) + '}'
}))
console.info('\\dfrac{-12}{-13}'.replace(/^-\\dfrac(?:(\d)(\d)|{(-?\d+)}{(-?\d+)})$/i, function (match, p1, p2, p3, p4) {
  return '\\dfrac{' + ((p1 || p3) * (p2 || p4) > 0 ? '-' : '') + Math.abs(p1 || p3) + '}{' + Math.abs(p2 || p4) + '}'
}))
console.info('-\\dfrac{-12}{-13}'.replace(/^-\\dfrac(?:(\d)(\d)|{(-?\d+)}{(-?\d+)})$/i, function (match, p1, p2, p3, p4) {
  return '\\dfrac{' + ((p1 || p3) * (p2 || p4) > 0 ? '-' : '') + Math.abs(p1 || p3) + '}{' + Math.abs(p2 || p4) + '}'
}))
console.info('-\\dfrac{-12}{-13}'.replace(/^\\dfrac(?:(\d)(\d)|{(-?\d+)}{(-?\d+)})$/i, function (match, p1, p2, p3, p4) {
  return '\\dfrac{' + ((p1 || p3) * (p2 || p4) < 0 ? '-' : '') + Math.abs(p1 || p3) + '}{' + Math.abs(p2 || p4) + '}'
}))
*/

export default class desTestsPourInteractivité extends Exercice {
  constructor() {
    super()

    // this.consigne = 'Quel est le résultat des calculs suivants ?'
    // this.consigne = `Écrire une égalité égale à celle proposée.`
    this.consigne = `Recopie exactement une de ces deux propositions.`
    this.consigne = 'Donne un ensemble de nombres égal à : '
    this.consigne =
      ' Trouver une fraction égale à celle proposée en supprimant la racine carrée de son dénominateur.'
  }

  nouvelleVersion() {
    for (
      let i = 0, texte, texteCorr, cpt = 0, a, b;
      i < this.nbQuestions && cpt < 50;
    ) {
      a = randint(1, 12)
      b = randint(2, 12)

      // console.info(fonctionComparaison('16^1', '16', { sansExposantUn: true }).isOk)

      // const reponse = `1+3\\times2`
      // const reponse = '2x^2+2x+4'
      // const reponse = '{-5;4;10.2}'
      const reponse = '-2(x-4)'
      // const reponse = new FractionEtendue(-20, 50).valeurDecimale
      // const enonce = '$Donner l\'ensemble des nombres entiers non nuls positifs inférieurs à 4 +' + reponse + '$ : $'
      // const enonce = '$Donner l\'ensemble des nombres entiers non nuls positifs inférieurs à 4 :$'
      // const enonce =
      //  '\\dfrac{-3+\\sqrt{41}}{4} + -\\dfrac34+\\dfrac{\\sqrt{41}}{4}'
      const enonce = `-2(x-4)`
      // const enonce = `Addition égale à 6+2`
      // const enonce = '$Donner une valeur numér égale à 0.4 : $'
      // reponse = reponse.toString()
      texteCorr = ''
      // texte = `$${enonce}=$` + ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBaseAvecFraction)
      texte =
        `$${enonce}$` + ajouteChampTexteMathLive(this, i, KeyboardType.longueur)
      // texte += `$${enonce}$` + ajouteChampTexteMathLive(this, i + 1,  KeyboardType.clavierDeBaseAvecFraction)
      // texte += ajouteFeedback(this, i + 1)
      // handleAnswers(this, i, { reponse: { value: reponse, compare: expressionDeveloppeeEtNonReduiteCompare } })
      // handleAnswers(this, i, { reponse: { value: reponse } })
      handleAnswers(this, i, {
        reponse: {
          value: reponse,
          options: {
            expressionsForcementReduites: true,
          },
        },
      })
      // handleAnswers(this, i, { reponse: { value: reponse } })

      if (this.questionJamaisPosee(i, a, b)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
