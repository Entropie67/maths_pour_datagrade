import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
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
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Trinome from '../../modules/Trinome'
import Exercice from '../Exercice'
export const titre = 'Simplifier des expressions exponentielles'

export const dateDePublication = '02/07/2024'
export const dateDeModifImportante = '20/10/2025'
export const interactifReady = true

export const uuid = 'cb7d9'
export const refs = {
  'fr-fr': ['1AN30-2', 'TSA3-20', 'TCA7-20'],
  'fr-ch': [],
}

/**
 *
 * @author Rémi Angot
 * @author Gilles Mora et Éric Elter ont créé l'interactif en QCM (suite demande JNAPMEP 2025 Toulon)
 */
export default class SimplifierExponentielles extends Exercice {
  can: boolean
  constructor() {
    super()
    this.can = false
    this.nbQuestions = 7
    this.spacing = 1.5
    this.spacingCorr = 2
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
    this.besoinFormulaire3CaseACocher = ['Interactif avec QCM', false]
    this.comment =
      '7 types de calculs différents. Le résultat peut être une exponentielle ou une somme de deux exponentiels'
    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Simplifier les expressions suivantes.'
        : "Simplifier l'expression suivante."
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
    this.consigne =
      this.nbQuestions > 1
        ? 'Simplifier les expressions suivantes.'
        : "Simplifier l'expression suivante."

    if (this.sup >= 2) {
      this.consigne = 'Soit $x$ un réel. ' + this.consigne
    }
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let propQCM1 = ''
      let propQCM2 = ''
      let propQCM3 = ''
      let texte = ''
      let texteCorr = ''
      let answer = ''
      let alea1 = randint(-5, 5, [0, 1])
      let alea2 = randint(-5, 5, [0, 1])
      let alea3 = randint(-5, 5, [0, 1])
      let alea4 = 0
      let alea5 = 0
      let alea6 = 0
      let p1 = new Trinome(0, 0, alea1)
      let p2 = new Trinome(0, 0, alea2)
      let p3 = new Trinome(0, 0, alea3)
      let distract2 = new Trinome(0, 0, -alea2)
      let distract3 = new Trinome(0, 0, -alea1)
      let distract4 = new Trinome(0, 0, alea1 * alea2)
      let distract5 = new Trinome(0, 0, 0)
      let distract6 = new Trinome(0, 0, 0)

      const distract0 = new Trinome(0, 0, 0)
      const edistract0 = new ExponentialOperande({ polynome: distract0 })

      if (this.sup !== 1) {
        alea1 = randint(-5, 5, [0])
        alea2 = randint(-5, 5, [0])
        alea3 = randint(-5, 5, [0])
        if (this.sup === 2) {
          p1 = new Trinome(0, alea1, 0)
          p2 = new Trinome(0, alea2, 0)
          p3 = new Trinome(0, alea3, 0)
          distract2 = new Trinome(0, -alea2, 0)
          distract3 = new Trinome(0, -alea1, 0)
          distract4 = new Trinome(alea1 * alea2, 0, 0)
        } else {
          alea4 = randint(-5, 5, [0])
          alea5 = randint(-5, 5, [0])
          alea6 = randint(-5, 5, [0])
          p1 = new Trinome(0, alea1, alea4)
          p2 = new Trinome(0, alea2, alea5)
          p3 = new Trinome(0, alea3, alea6)
          distract2 = new Trinome(0, -alea2, -alea5)
          distract3 = new Trinome(0, -alea1, -alea4)
          distract4 = new Trinome(
            alea1 * alea2,
            alea1 * alea5 + alea2 * alea4,
            alea5 * alea4,
          )
        }
      }
      let e1 = new ExponentialOperande({ polynome: p1 })
      let e2 = new ExponentialOperande({ polynome: p2 })
      let e3 = new ExponentialOperande({ polynome: p3 })
      const edist2 = new ExponentialOperande({ polynome: distract2 })
      const edist3 = new ExponentialOperande({ polynome: distract3 })
      const edist4 = new ExponentialOperande({ polynome: distract4 })
      switch (listeTypeQuestions[i]) {
        case 'mul': {
          const calcul = new Mul(e1, e2)
          texte = `$${lettreDepuisChiffre(i + 1)} = ${calcul.toString()}$`
          if (calcul.step !== '') {
            texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${calcul.step}$<br>`
          }
          texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${calcul.result}$`
          answer = calcul.result.toString()

          if (this.sup3) {
            propQCM1 = `$${new Mul(e1, edist2).result.toString()}$`
            propQCM2 = `$${new Mul(edist3, e2).result.toString()}$`
            propQCM3 = `$${new Mul(edist4, edistract0).result.toString()}$`
          }
          break
        }
        case 'pow': {
          const exposant = randint(2, 4)
          if (this.sup === 1) {
            alea1 = randint(-5, 5, [0, 1, exposant])
            p1 = new Trinome(0, 0, alea1)
          } else if (this.sup === 2) {
            alea1 = randint(-5, 5, [0, 1, exposant])
            p1 = new Trinome(0, alea1, 0)
          } else {
            alea1 = randint(-5, 5, [0, 1, exposant])
            alea2 = randint(-5, 5, [0, 1, exposant])
            p1 = new Trinome(0, alea1, alea2)
          }
          e1 = new ExponentialOperande({ polynome: p1 })

          const calcul = new Pow(e1, exposant)
          texte = `$${lettreDepuisChiffre(i + 1)} = ${calcul.toString()}$`
          texteCorr = ''
          if (calcul.step !== '') {
            texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${calcul.step}$<br>`
          }
          texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${calcul.result}$`
          answer = calcul.result.toString()

          if (this.sup3) {
            this.autoCorrection[i] = {}
            this.autoCorrection[i].enonce = `${texte}\n`
            if (this.sup === 1) {
              distract2 = new Trinome(0, 0, exposant)
              distract3 = new Trinome(
                0,
                0,
                alea1 > 0 ? alea1 * 10 + exposant : alea1 * 10 - exposant,
              )
              distract5 = new Trinome(
                0,
                0,
                alea1 *
                  choice(
                    [exposant - 1, exposant + 1],
                    arrondi((alea1 + exposant) / alea1, 0),
                  ),
              )
            } else if (this.sup === 2) {
              distract2 = new Trinome(0, exposant, 0)
              distract3 = new Trinome(
                0,
                alea1 > 0 ? alea1 * 10 + exposant : alea1 * 10 - exposant,
                0,
              )
              distract5 = new Trinome(0, alea1, exposant)
            } else {
              distract2 = new Trinome(0, 0, exposant)
              distract3 = new Trinome(0, alea1 * exposant, alea2)
              distract5 = new Trinome(0, alea1, alea2 * exposant)
            }
            const edistract2 = new ExponentialOperande({ polynome: distract2 })
            const edistract3 = new ExponentialOperande({ polynome: distract3 })
            const edistract6 = new ExponentialOperande({ polynome: distract5 })

            propQCM1 = `$${new Mul(e1, edistract2).result.toString()}$`
            propQCM2 = `$${new Mul(edistract3, edistract0).result.toString()}$`
            propQCM3 = `$${new Mul(edistract6, edistract0).result.toString()}$`
          }
          break
        }
        case 'powTimesPow': {
          const exposant1 = randint(2, 4)
          const exposant2 = randint(2, 4)
          alea1 = randint(-5, 5, [0, 1])
          alea2 = randint(-5, 5, [0, 1])
          alea3 = randint(-5, 5, [0, 1])
          alea4 = randint(-5, 5, [0, 1])
          if (this.sup === 1) {
            p1 = new Trinome(0, 0, alea1)
            p2 = new Trinome(0, 0, alea2)
          } else if (this.sup === 2) {
            p1 = new Trinome(0, alea1, 0)
            p2 = new Trinome(0, alea2, 0)
          } else {
            p1 = new Trinome(0, alea1, alea3)
            p2 = new Trinome(0, alea2, alea4)
          }
          e1 = new ExponentialOperande({ polynome: p1 })
          e2 = new ExponentialOperande({ polynome: p2 })
          const facteur1 = new Pow(e1, exposant1)
          const facteur2 = new Pow(e2, exposant2)

          const calcul = new Mul(facteur1, facteur2)
          const calculStep = new Mul(facteur1.result, facteur2.result)
          texte = `$${lettreDepuisChiffre(i + 1)} = ${calcul.toString()}$`
          texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${new Mul(facteur1.step, facteur2.step)}$`
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)} = ${calculStep}$`
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)} = ${calculStep.step}$`
          texteCorr += `<br>$${lettreDepuisChiffre(i + 1)} = ${calculStep.result}$`
          answer = calculStep.result.toString()
          if (this.sup3) {
            this.autoCorrection[i] = {}
            this.autoCorrection[i].enonce = `${texte}\n`
            if (this.sup === 1) {
              distract2 = new Trinome(
                0,
                0,
                alea1 + exposant1 + alea2 + exposant2,
              )
              distract4 = new Trinome(
                0,
                0,
                alea1 * exposant1 - alea2 * exposant2,
              )
              distract5 = new Trinome(
                0,
                0,
                (alea1 + alea2) * (exposant1 + exposant2),
              )
            } else if (this.sup === 2) {
              distract2 = new Trinome(
                0,
                alea1 + exposant1 + alea2 + exposant2,
                0,
              )
              distract4 = new Trinome(
                0,
                alea1 * exposant1 - alea2 * exposant2,
                0,
              )
              distract5 = new Trinome(
                0,
                (alea1 + alea2) * (exposant1 + exposant2),
                0,
              )
            } else {
              distract2 = new Trinome(
                0,
                alea1 + exposant1 + alea2 + exposant2,
                alea3 + exposant1 + alea4 + exposant2,
              )
              distract4 = new Trinome(
                0,
                alea1 * exposant1 - alea2 * exposant2,
                alea3 * exposant1 - alea4 * exposant2,
              )
              distract5 = new Trinome(
                0,
                (alea1 + alea2) * (exposant1 + exposant2),
                (alea3 + alea4) * (exposant1 + exposant2),
              )
            }
            const edistract2 = new ExponentialOperande({ polynome: distract2 })
            const edistract4 = new ExponentialOperande({ polynome: distract4 })
            const edistract6 = new ExponentialOperande({ polynome: distract5 })

            propQCM1 = `$${new Mul(edistract2, edistract0).result.toString()}$`
            propQCM2 = `$${new Mul(edistract4, edistract0).result.toString()}$`
            propQCM3 = `$${new Mul(edistract6, edistract0).result.toString()}$`
          }

          break
        }
        case 'k(a+b)': {
          do {
            const aOublier: number[] = []
            alea1 = randint(-5, 5, [0, 1, ...aOublier])
            aOublier.push(alea1)
            alea2 = randint(-5, 5, [0, 1, ...aOublier])
            aOublier.push(alea2)
            alea3 = randint(-5, 5, [0, 1, ...aOublier])
            aOublier.push(alea3)
            alea4 = randint(-5, 5, [0, 1, ...aOublier])
            aOublier.push(alea4)
            alea5 = randint(-5, 5, [0, 1, ...aOublier])
            aOublier.push(alea5)
            alea6 = randint(-5, 5, [0, 1, ...aOublier])
            aOublier.push(alea6)
          } while (
            alea2 + alea1 === 1 ||
            alea2 + alea3 === 1 ||
            alea1 + alea2 + alea3 === 1 ||
            alea1 * alea2 * alea3 === 1
          )
          if (this.sup === 1) {
            p1 = new Trinome(0, 0, alea1)
            p2 = new Trinome(0, 0, alea2)
            p3 = new Trinome(0, 0, alea3)
          } else if (this.sup === 2) {
            p1 = new Trinome(0, alea1, 0)
            p2 = new Trinome(0, alea2, 0)
            p3 = new Trinome(0, alea3, 0)
          } else {
            p1 = new Trinome(0, alea1, alea4)
            p2 = new Trinome(0, alea2, alea5)
            p3 = new Trinome(0, alea3, alea6)
          }
          e1 = new ExponentialOperande({ polynome: p1 })
          e2 = new ExponentialOperande({ polynome: p2 })
          e3 = new ExponentialOperande({ polynome: p3 })
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

          if (this.sup3) {
            this.autoCorrection[i] = {}
            this.autoCorrection[i].enonce = `${texte}\n`
            if (this.sup === 1) {
              distract2 = new Trinome(0, 0, alea1 + alea2 + alea3)
              distract4 = new Trinome(0, 0, alea1 * alea2 * alea3)
            } else if (this.sup === 2) {
              distract2 = new Trinome(0, alea1 + alea2 + alea3, 0)
              distract4 = new Trinome(0, alea1 * alea2 * alea3, 0)
            } else {
              distract2 = new Trinome(
                0,
                alea1 + alea2 + alea3,
                alea4 + alea5 + alea6,
              )
              distract4 = new Trinome(
                0,
                alea1 * alea2 * alea3,
                alea4 * alea5 * alea6,
              )
            }
            const edistract2 = new ExponentialOperande({ polynome: distract2 })
            const edistract4 = new ExponentialOperande({ polynome: distract4 })

            propQCM1 = `$${new Mul(edistract2, edistract0).result.toString()}$`
            propQCM2 = `$${new Mul(edistract4, edistract0).result.toString()}$`
            propQCM3 = `$${new Add(new Mul(e2, e1).result, new Mul(e2, e3).result).result.toString()}$`
          }

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
          if (this.sup === 2) {
            p1 = new Trinome(0, m, 0)
            p2 = new Trinome(0, n, 0)
            p3 = new Trinome(0, o, 0)
          } else if (this.sup === 3) {
            const aOublier: number[] = []
            alea1 = randint(-5, 5, [0, 1, ...aOublier])
            aOublier.push(alea1)
            alea2 = randint(-5, 5, [0, 1, ...aOublier])
            aOublier.push(alea2)
            alea3 = randint(-5, 5, [0, 1, ...aOublier])
            p1 = new Trinome(0, m, alea1)
            p2 = new Trinome(0, n, alea2)
            p3 = new Trinome(0, o, alea3)
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

          if (this.sup3) {
            this.autoCorrection[i] = {}
            this.autoCorrection[i].enonce = `${texte}\n`
            if (this.sup === 1) {
              distract2 = new Trinome(0, 0, m + p)
              distract4 = new Trinome(0, 0, alea1 * alea2 * alea3)
            } else if (this.sup === 2) {
              distract2 = new Trinome(0, alea1 + alea2 + alea3, 0)
              distract4 = new Trinome(0, alea1 * alea2 * alea3, 0)
            } else {
              distract2 = new Trinome(0, m, alea1 * p)
              distract3 = new Trinome(0, n + o, alea2 + alea3)
              distract4 = new Trinome(0, m * p, alea1 * p)
              distract5 = new Trinome(
                n * o,
                n * alea3 + o * alea2,
                alea2 * alea3,
              )
              distract6 = new Trinome(
                0,
                m * p - n - o,
                alea1 * p - alea2 - alea3,
              )
            }
            const edistract2 = new ExponentialOperande({ polynome: distract2 })
            const edistract4 = new ExponentialOperande({ polynome: distract4 })

            if (this.sup < 3) {
              const edistract3 = new ExponentialOperande({
                polynome: distract0,
              })
              propQCM1 = `$${new Mul(edistract2, edistract3).result.toString()}$`
              propQCM2 = `$${new Mul(edistract3, edistract4).result.toString()}$`
              propQCM3 = `$${new Add(new Mul(e2, e1).result, new Mul(e2, e3).result).result.toString()}$`
            } else {
              const edistract3 = new ExponentialOperande({
                polynome: distract3,
              })
              const edistract5 = new ExponentialOperande({
                polynome: distract5,
              })
              const edistract6 = new ExponentialOperande({
                polynome: distract6,
              })
              propQCM1 = `$${new Sub(edistract2, edistract3).result.toString()}$`
              propQCM2 = `$${new Sub(edistract4, edistract5).result.toString()}$`
              propQCM3 = `$${new Mul(edistract6, edistract0).result.toString()}$`
            }
          }

          break
        }
        case 'fracPowNum': {
          const aOublier: number[] = []
          alea1 = randint(-5, 5, [0, 1, ...aOublier])
          aOublier.push(alea1)
          alea2 = randint(-5, 5, [0, 1, ...aOublier])
          aOublier.push(alea2)
          alea3 = randint(-5, 5, [0, 1, ...aOublier])
          aOublier.push(alea3)
          alea4 = randint(-5, 5, [0, 1, ...aOublier])
          aOublier.push(alea4)
          alea5 = randint(-5, 5, [0, 1, ...aOublier])
          if (this.sup === 1) {
            p1 = new Trinome(0, 0, alea1)
            p2 = new Trinome(0, 0, alea2)
          } else if (this.sup === 2) {
            p1 = new Trinome(0, alea1, 0)
            p2 = new Trinome(0, alea2, 0)
          } else {
            p1 = new Trinome(0, alea1, alea4)
            p2 = new Trinome(0, alea2, alea5)
          }
          e1 = new ExponentialOperande({ polynome: p1 })
          e2 = new ExponentialOperande({ polynome: p2 })

          const num = new Pow(e1, alea3)
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

          if (this.sup3) {
            this.autoCorrection[i] = {}
            this.autoCorrection[i].enonce = `${texte}\n`
            if (this.sup === 1) {
              distract2 = new Trinome(0, 0, alea1 + alea3 - alea2)
              distract3 = new Trinome(0, 0, alea1 * alea3 + alea2)
              distract4 = new Trinome(0, 0, alea1 + alea3 + alea2)
            } else if (this.sup === 2) {
              distract2 = new Trinome(0, alea1 - alea2, alea3)
              distract3 = new Trinome(0, alea1 * alea2, alea3)
              distract4 = new Trinome(0, alea1 + alea2, alea3)
            } else {
              distract2 = new Trinome(
                0,
                alea1 * alea3 - alea2,
                alea4 * alea3 + alea5,
              )
              distract3 = new Trinome(0, alea1 - alea2, alea4 + alea3 - alea5)
              distract4 = new Trinome(0, alea1 - alea2, alea4 * alea3 - alea5)
            }
            const edistract2 = new ExponentialOperande({ polynome: distract2 })
            const edistract3 = new ExponentialOperande({ polynome: distract3 })
            const edistract4 = new ExponentialOperande({ polynome: distract4 })

            propQCM1 = `$${new Mul(edistract2, edistract0).result.toString()}$`
            propQCM2 = `$${new Mul(edistract3, edistract0).result.toString()}$`
            propQCM3 = `$${new Mul(edistract4, edistract0).result.toString()}$`
          }

          break
        }
        case 'fracMulNum': {
          const aOublier: number[] = []
          alea1 = randint(-5, 5, [0, 1, ...aOublier])
          aOublier.push(alea1)
          alea2 = randint(-5, 5, [0, 1, ...aOublier])
          aOublier.push(alea2)
          alea3 = randint(-5, 5, [0, 1, ...aOublier])
          aOublier.push(alea3)
          alea4 = randint(-5, 5, [0, 1, ...aOublier])
          aOublier.push(alea4)
          alea5 = randint(-5, 5, [0, 1, ...aOublier])
          if (this.sup === 1) {
            p1 = new Trinome(0, 0, alea1)
            p2 = new Trinome(0, 0, alea2)
            p3 = new Trinome(0, 0, alea3)
          } else if (this.sup === 2) {
            p1 = new Trinome(0, alea1, 0)
            p2 = new Trinome(0, alea2, 0)
            p3 = new Trinome(0, alea3, 0)
          } else {
            p1 = new Trinome(0, alea1, alea4)
            p2 = new Trinome(0, alea2, alea5)
            p3 = new Trinome(0, alea3, alea6)
          }
          e1 = new ExponentialOperande({ polynome: p1 })
          e2 = new ExponentialOperande({ polynome: p2 })
          e3 = new ExponentialOperande({ polynome: p3 })

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

          if (this.sup3) {
            if (this.sup === 1) {
              distract2 = new Trinome(0, 0, alea1 * alea2 - alea3)
              distract3 = new Trinome(0, 0, alea1 + alea2 + alea3)
              distract4 = new Trinome(0, 0, alea1 * alea2 + alea3)
            } else if (this.sup === 2) {
              distract2 = new Trinome(0, alea1 * alea2 - alea3, 0)
              distract3 = new Trinome(0, alea1 + alea2 + alea3, 0)
              distract4 = new Trinome(0, alea1 * alea2 + alea3, 0)
            } else {
              distract2 = new Trinome(
                0,
                alea1 + alea2 - alea3,
                alea4 + alea5 + alea6,
              )
              distract3 = new Trinome(
                alea1 * alea2,
                alea1 * alea5 + alea4 * alea2 - alea3,
                alea4 * alea5 - alea6,
              )
              distract4 = new Trinome(
                0,
                alea1 + alea2 + alea3,
                alea4 + alea5 - alea6,
              )
            }
            const edistract2 = new ExponentialOperande({ polynome: distract2 })
            const edistract3 = new ExponentialOperande({ polynome: distract3 })
            const edistract4 = new ExponentialOperande({ polynome: distract4 })

            propQCM1 = `$${new Mul(edistract2, edistract0).result.toString()}$`
            propQCM2 = `$${new Mul(edistract3, edistract0).result.toString()}$`
            propQCM3 = `$${new Mul(edistract4, edistract0).result.toString()}$`
          }

          break
        }
      }
      // Avant le QCM : remplacer après coup insérerait des \ dans le JSON de ses propositions.
      texte = texte.replace(/e\^/g, '\\mathrm{e}^')
      texteCorr = texteCorr.replace(/e\^/g, '\\mathrm{e}^')

      if (this.sup3) {
        this.autoCorrection[i] = {}
        this.autoCorrection[i].enonce = `${texte}\n`
        this.autoCorrection[i].propositions = [
          {
            texte: `$${answer}$`,
            statut: true,
            feedback: 'Correct !',
          },
          {
            texte: propQCM1,
            statut: false,
            feedback: '',
          },
          {
            texte: propQCM2,
            statut: false,
            feedback: '',
          },
          {
            texte: propQCM3,
            statut: false,
            feedback: '',
          },
        ].map((proposition) => ({
          ...proposition,
          texte: proposition.texte.replace(/e\^/g, '\\mathrm{e}^'),
        }))

        this.autoCorrection[i].options = {
          ordered: false,
          lastChoice: 4,
        }
        const props = propositionsQcm(this, i)

        texte += props.texte
      }

      if (this.can) {
        texte = "Simplifier l'expression :<br>" + texte
      }

      if (this.interactif && !this.sup3) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierFonctionsTerminales,
          {
            texteAvant: ' $=$ ',
          },
        )
      }
      if (!this.sup3) {
        handleAnswers(this, i, {
          reponse: {
            value: answer,
            options: {
              expressionNumerique: true,
              nombreDecimalSeulement: true,
            },
          },
        })
      }
      // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
      const textCorrSplit = texteCorr.split('=')
      let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
      aRemplacer = aRemplacer.replace('$', '')

      texteCorr = ''
      for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
        texteCorr += textCorrSplit[ee] + '='
      }
      texteCorr += `$ $${miseEnEvidence(aRemplacer)}$`
      // Fin de cette uniformisation

      if (
        this.questionJamaisPosee(i, alea1, alea2, alea3, alea4, alea5, alea6)
      ) {
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
