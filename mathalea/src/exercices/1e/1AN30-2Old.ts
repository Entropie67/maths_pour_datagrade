import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  Add,
  ExponentialOperande,
  Frac,
  Mul,
  Pow,
  Sub,
} from '../../lib/mathFonctions/Calcul'
import { choice } from '../../lib/outils/arrayOutils'
import { lettreDepuisChiffre, sp } from '../../lib/outils/outilString'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Trinome from '../../modules/Trinome'
import Exercice from '../Exercice'
export const titre = 'Simplifier des expressions exponentielles'

export const dateDePublication = '2/7/2024'
export const interactifReady = true

export const uuid = '9325e'
export const refs = {
  'fr-fr': [''],
  'fr-ch': [],
}

/**
 *
 * @author Rémi Angot

*/
export default class SimplifierExponentielles extends Exercice {
  can: boolean
  constructor() {
    super()
    this.can = false
    this.consigne = 'Simplifier les expressions suivantes.'
    this.nbQuestions = 7
    this.spacing = 2
    this.spacingCorr = 3
    this.sup = 1
    this.sup2 = 8
    this.besoinFormulaireNumerique = [
      'Niveaux de difficulté',
      3,
      '1 : Exposants entiers\n2 : Exposants de la forme ax\n3 : Exposants de la forme ax + b',
    ]
    this.besoinFormulaire2Texte = [
      'Types de calculs',
      'Nombres séparés par des tirets : \n1 : Produit\n2 : Puissance\n3 : Produit et puissances\n4 : Distributivité simple\n5 : Différence de puissance et de produit \n6 : Fraction et puissance\n7 : Fraction et produit\n8 : Mélange',
    ]
    this.comment =
      '7 types de calculs différents. Le résultat peut être une exponentielle ou une somme de deux exponentiels'
    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    const listeTypeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 7,
      defaut: 1,
      melange: 8,
      nbQuestions: this.nbQuestions,
      listeOfCase: [
        'mul',
        'pow',
        'powTimesPow',
        'k(a+b)',
        '(e^mx)p - e^nx * e^ox',
        'fracPowNum',
        'fracMulNum',
      ],
    })
    if (this.sup >= 2) {
      this.consigne = `Soit $x$ un réel. Simplifier les expressions suivantes${sp()}:`
    }
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let answer = ''
      let p1 = new Trinome(0, 0, randint(-5, 5, [0, 1]))
      let p2 = new Trinome(0, 0, randint(-5, 5, [0, 1]))
      let p3 = new Trinome(0, 0, randint(-5, 5, [0, 1]))
      if (this.sup === 2) {
        p1 = new Trinome(0, randint(-5, 5, [0]), 0)
        p2 = new Trinome(0, randint(-5, 5, [0]), 0)
        p3 = new Trinome(0, randint(-5, 5, [0]), 0)
      } else if (this.sup === 3) {
        p1 = new Trinome(0, randint(-5, 5, [0]), randint(-5, 5, [0]))
        p2 = new Trinome(0, randint(-5, 5, [0]), randint(-5, 5, [0]))
        p3 = new Trinome(0, randint(-5, 5, [0]), randint(-5, 5, [0]))
      }
      const e1 = new ExponentialOperande({ polynome: p1 })
      const e2 = new ExponentialOperande({ polynome: p2 })
      const e3 = new ExponentialOperande({ polynome: p3 })
      switch (listeTypeQuestions[i]) {
        case 'mul': {
          const calcul = new Mul(e1, e2)
          texte = `$${lettreDepuisChiffre(i + 1)} = ${calcul.toString()}$`
          if (calcul.step !== '') {
            texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${calcul.step}$<br>`
          }
          texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${calcul.result}$`
          answer = calcul.result.toString()
          break
        }
        case 'pow': {
          const calcul = new Pow(e1, randint(2, 4))
          texte = `$${lettreDepuisChiffre(i + 1)} = ${calcul.toString()}$`
          texteCorr = ''
          if (calcul.step !== '') {
            texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${calcul.step}$<br>`
          }
          texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${calcul.result}$`
          answer = calcul.result.toString()
          break
        }
        case 'powTimesPow': {
          const facteur1 = new Pow(e1, randint(2, 4))
          const facteur2 = new Pow(e2, randint(2, 4))
          const calcul = new Mul(facteur1, facteur2)
          const calculStep = new Mul(facteur1.result, facteur2.result)
          texte = `$${lettreDepuisChiffre(i + 1)} = ${calcul.toString()}$`
          texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${new Mul(facteur1.step, facteur2.step)}$`
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)} = ${calculStep}$`
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)} = ${calculStep.step}$`
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)} = ${calculStep.result}$`
          answer = calculStep.result.toString()
          break
        }
        case 'k(a+b)': {
          const calcul = new Mul(e1, new Add(e2, e3))
          texte = `$${lettreDepuisChiffre(i + 1)} = ${calcul.toString()}$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)} = `
          const mul1 = new Mul(e1, e2)
          const mul2 = new Mul(e1, e3)
          const add = new Add(mul1, mul2)
          texteCorr += `${add.toString()}$`
          const mul1Step = mul1.step
          const mul2Step = mul2.step
          const add2 = new Add(mul1Step, mul2Step)
          texteCorr += `<br> $${lettreDepuisChiffre(i + 1)} = ${add2}$`
          const add3 = new Add(mul1.result, mul2.result)
          texteCorr += `<br> $${lettreDepuisChiffre(i + 1)}= ${add3}$`
          if (add3.result.toString() !== add3.toString()) {
            texteCorr += `<br> $${lettreDepuisChiffre(i + 1)}= ${add3.result}$`
          }
          answer = add3.result.toString()

          break
        }
        case '(e^mx)p - e^nx * e^ox': {
          const [m, p, n, o] = choice([
            productEqualSum(),
            [randint(2, 5), randint(2, 5), randint(2, 5), randint(2, 5)],
          ])
          let p1 = new Trinome(0, 0, m)
          let p2 = new Trinome(0, 0, n)
          let p3 = new Trinome(0, 0, o)
          if (this.sup > 1) {
            p1 = new Trinome(0, m, 0)
            p2 = new Trinome(0, n, 0)
            p3 = new Trinome(0, o, 0)
          }
          const e1 = new ExponentialOperande({ polynome: p1 })
          const e2 = new ExponentialOperande({ polynome: p2 })
          const e3 = new ExponentialOperande({ polynome: p3 })
          const terme1 = new Pow(e1, p)
          const terme2 = new Mul(e2, e3)
          const calcul = new Sub(terme1, terme2)
          const result = new Sub(terme1.result, terme2.result)
          texte = `$${lettreDepuisChiffre(i + 1)} = ${calcul.toString()}$`
          texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${terme1.step} - ${terme2.step}$`
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)} = ${result}$`
          if (String(result) !== String(result.result)) {
            texteCorr += `<br> $${lettreDepuisChiffre(i + 1)} = ${result.result}$`
          }
          answer = result.result.toString()
          break
        }
        case 'fracPowNum': {
          const n = randint(2, 4)
          const num = new Pow(e1, n)
          const den = e2
          const calcul = new Frac(num, den)
          texte = `$${lettreDepuisChiffre(i + 1)} = ${calcul}$`
          const numStep = new Frac(num.step, den)
          texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${numStep}$`
          const calcul2 = new Frac(num.result, den)
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)} = ${calcul2}$`
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)} = ${calcul2.step}$`
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)} = ${calcul2.result}$`
          answer = calcul2.result.toString()
          break
        }
        case 'fracMulNum': {
          const num = new Mul(e1, e2)
          const den = e3
          const calcul = new Frac(num, den)
          texte = `$${lettreDepuisChiffre(i + 1)} = ${calcul}$`
          const numStep = new Frac(num.step, den)
          texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${numStep}$`
          const calcul2 = new Frac(num.result, den)
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)} = ${calcul2}$`
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)} = ${calcul2.step}$`
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)} = ${calcul2.result}$`
          answer = calcul2.result.toString()
          break
        }
      }
      if (this.can) {
        texte = `Simplifier l'expression${sp()}:<br>` + texte
      }
      if (this.interactif) {
        texte +=
          `<br><br> $${lettreDepuisChiffre(i + 1)} = $` +
          ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierPersonnalisable,
            { dataKeys: ['EXP'] },
          )
        handleAnswers(this, i, { reponse: { value: answer } })
      }
      if (this.questionJamaisPosee(i, texte)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

/**
 * @returns [a, b, c, d] avec a * b = c + d
 */
function productEqualSum() {
  // return [a, b, c, d] avec
  // a * b = c + d
  return choice([
    [2, 3, 4, 2],
    [2, 3, 5, 1],
    [2, 3, 3, 3],
    [2, 4, 1, 7],
    [2, 4, 2, 6],
    [2, 4, 3, 5],
    [2, 4, 4, 4],
    [3, 3, 1, 8],
    [3, 3, 2, 7],
    [3, 3, 3, 6],
    [3, 3, 4, 5],
  ])
}
