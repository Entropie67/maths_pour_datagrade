import { miseEnEvidence } from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { listeDesDiviseurs } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import {
  contraindreValeur,
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const titre = 'Calculer avec des nombres'

export const dateDePublication = '25/09/2025'

export const dateDeModifImportante = '30/10/2026'

export const uuid = '345f7'

export const refs = {
  'fr-fr': ['5N1B-1'],
  'fr-2016': ['5C12-7'],
  'fr-ch': ['9R1NO7E-10', '9R2NO7E-10', '9R3NO7E-10', 'PRQNO15A-10'],
}
/**
 *
 * @author Olivier Mimeau
 */
export default class nomExercice extends Exercice {
  constructor() {
    super()
    // this.consigne = 'Consigne'
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        ' 1 : Double',
        ' 2 : Triple',
        ' 3 : Moitié',
        ' 4 : Quart',
        ' 5 : Dixième',
        ' 6 : Entier suivant',
        ' 7 : Entier précédent',
        ' 8 : Carré',
        ' 9 : Cube',
        '10 : Opposé',
        '11 : Inverse',
        '12 : Somme de deux nombres',
        '13 : Différence entre deux nombres',
        '14 : Produit de deux nombres',
        '15 : Quotient de deux nombres',
        // '16 : Nombre pair suivant',
        // '17 : Nombre impair suivant',
        // '18 : Multiple suivant',
      ].join('\n'),
    ]

    this.besoinFormulaire2Texte = [
      "Type de nombres dans l'énoncé",
      [
        'Nombres séparés par des tirets  :',
        ' 1 : Nombres entiers',
        ' 2 : Nombres Decimaux',
        // ' 3 : Fractions',
        // ' 4 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire3CaseACocher = ['Utiliser des nombres relatifs']
    this.besoinFormulaire4Numerique = ['Valeur maximum en valeur absolue', 100]
    this.nbQuestions = 14
    this.sup = '1-2-3-4-5-6-7-8-9-10-12-13-14-15'
    this.sup2 = 1
    this.sup3 = false
    this.sup4 = 50
  }

  nouvelleVersion() {
    this.sup4 = contraindreValeur(10, 200, this.sup4, 50)
    const listeTypeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 15,
      defaut: 1,
      melange: 19,
      // shuffle: false, //true bien pour les tests
      nbQuestions: this.nbQuestions,
    })
    const listeTypeNombres = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 2,
      defaut: 1,
      melange: 4,
      nbQuestions: this.nbQuestions,
    })
    type Operation = {
      num: number
      nom: string
      enchainement: string
      fct: (x: number, y: number) => number
    }
    const operations: Operation[] = [
      {
        num: 1,
        nom: 'le double de number1',
        enchainement: `number1 \\times 2 = `,
        fct: (x: number, y: number) => 2 * x,
      },
      {
        num: 2,
        nom: 'le triple de number1',
        enchainement: ` number1 \\times 3 = `,
        fct: (x: number, y: number) => 3 * x,
      },
      {
        num: 3,
        nom: 'la moitié de number1',
        enchainement: `number1 \\div 2 = `,
        fct: (x: number, y: number) => x / 2,
      },
      {
        num: 4,
        nom: 'le quart de number1',
        enchainement: `number1 \\div 4 = `,
        fct: (x: number, y: number) => x / 4,
      },
      {
        num: 5,
        nom: 'le dixième de number1',
        enchainement: `number1 \\div 10 = `,
        fct: (x: number, y: number) => x / 10,
      },
      {
        num: 6,
        nom: "l'entier suivant de number1",
        enchainement: `number1 + 1 = `,
        fct: (x: number, y: number) => Math.floor(x) + 1,
      },
      {
        num: 7,
        nom: "l'entier précédent de number1",
        enchainement: `number1 - 1 = `,
        fct: (x: number, y: number) => Math.ceil(x) - 1,
      },
      {
        num: 8,
        nom: 'le carré de number1',
        enchainement: `number1^2 = number1 \\times number1 = `,
        fct: (x: number, y: number) => x * x,
      },
      {
        num: 9,
        nom: 'le cube de number1',
        enchainement: `number1^3 = number1 \\times number1 \\times number1 = `,
        fct: (x: number, y: number) => x * x * x,
      },
      {
        num: 10,
        nom: "l'opposé de number1",
        enchainement: ``,
        fct: (x: number, y: number) => -x,
      },
      {
        num: 11,
        nom: "l'inverse de number1",
        enchainement: `$\\dfrac{1}{number1}$`,
        fct: (x: number, y: number) => (x !== 0 ? 1 / x : NaN),
      },

      {
        num: 12,
        nom: 'la somme de number1 et number2',
        enchainement: `number1 + number2 = `,
        fct: (x: number, y: number) => x + y,
      },
      {
        num: 13,
        nom: 'la différence entre number1 et number2',
        enchainement: `number1 - number2 = `,
        fct: (x: number, y: number) => x - y,
      },
      {
        num: 14,
        nom: 'le produit de number1 par number2',
        enchainement: `number1 \\times number2 = `,
        fct: (x: number, y: number) => x * y,
      },
      {
        num: 15,
        nom: 'le quotient de number1 par number2',
        enchainement: `number1 \\div number2 = `,
        fct: (x: number, y: number) => (y !== 0 ? x / y : NaN),
      },
      {
        num: 16,
        nom: 'le nombre pair suivant de number1',
        enchainement: `$number1 + 2$ (si le nombre se termine par 0,2,4,6,8), $number1 + 1$ sinon`,
        fct: (x: number, y: number) =>
          Math.floor(x) % 2 === 0 ? Math.floor(x) + 2 : Math.floor(x) + 1,
      },
      {
        num: 17,
        nom: 'le nombre impair suivant de number1',
        enchainement: `$number1 + 1$ (si le nombre se termine par 0,2,4,6,8), $number1 + 2$ sinon`,
        fct: (x: number, y: number) =>
          Math.floor(x) % 2 === 1 ? Math.floor(x) + 2 : Math.floor(x) + 1,
      },
      {
        num: 18,
        nom: 'le multiple de number2 suivant number1',
        enchainement: `$number1 +1$`,
        fct: (x: number, y: number) =>
          y !== 0 ? (Math.floor(x / y) + 1) * y : NaN,
      },
    ]
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      const lOperation = Number(listeTypeQuestions[i])
      // alea

      let nombre1 = 0
      let nombre2 = 0
      switch (listeTypeQuestions[i]) {
        case 8: // carré
          nombre1 = randint(1, 10)
          break
        case 9: // cube
          nombre1 = randint(1, 5)
          break
        case 13: // différence
          nombre1 = randint(2, this.sup4)
          nombre2 = randint(1, nombre1 - 1)
          break
        case 14: // produit
          nombre1 = randint(2, this.sup4)
          nombre2 = randint(2, 11)
          break
        case 15: // quotient
          {
            nombre1 = randint(2, this.sup4)
            const divNombre1 = listeDesDiviseurs(nombre1)
            nombre2 = choice(divNombre1)
          }
          break
        case 18: // multiple de number2 suivant
          nombre1 = randint(1, this.sup4)
          nombre2 = choice([3, 4, 5, 9, 10])
          break
        default:
          nombre1 = randint(1, this.sup4)
          nombre2 = randint(1, this.sup4)
      }
      if (listeTypeNombres[i] === 2) {
        switch (listeTypeQuestions[i]) {
          case 8: // carré
          case 9: // cube
            nombre1 /= 10
            break
          case 14:
            {
              // produit
              const choix1 = choice([0, 1])
              const choix2 = choix1 === 1 ? 0 : choice([0, 1])
              nombre1 = randint(2, this.sup4)
              nombre2 = randint(2, 11)
              nombre1 = choix1 === 0 ? nombre1 : nombre1 / 10
              nombre2 = choix2 === 0 ? nombre2 : nombre2 / 10
            }
            break
          case 15: // quotient
            {
              nombre1 = randint(2, this.sup4 * 10)
              const divNombre1 = listeDesDiviseurs(nombre1)
              nombre2 = choice(divNombre1)
              nombre1 /= 10
            }
            break
          case 18: // multiple de number2 suivant
            nombre1 += randint(1, 9) / 10
            break
          default:
            nombre1 += randint(1, 9) / 10
            nombre2 += randint(1, 9) / 10
        }
      }
      if (this.sup3) {
        if (choice([true, false])) nombre1 = -nombre1
        if (lOperation !== 18 && choice([true, false])) nombre2 = -nombre2
      }
      // fin alea
      // on remplit le texte

      const texteAvecNombre = operations[lOperation - 1].nom
        .replaceAll('number1', `$${texNombre(nombre1)}$`) // `${texNombre(nombre1)}`)
        .replaceAll('number2', `$${texNombre(nombre2)}$`)
      texte += `Calculer ${texteAvecNombre}`
      // correction
      const laReponseEnTexte = texNombre(
        operations[lOperation - 1].fct(nombre1, nombre2),
      )
      // interactivité
      texte += this.interactif
        ? ' : ' +
          ajouteQuestionMathlive({
            exercice: this,
            question: i,
            typeInteractivite: 'mathlive',

            reponseParams: { formatInteractif: 'mathalea-mathfield' },
            objetReponse: {
              reponse: {
                value: laReponseEnTexte,
              },
            },
            classe: KeyboardType.clavierDeBaseAvecFraction,
          })
        : '.'
      // correction
      const metUnE = texteAvecNombre.charAt(1) === 'a' ? 'e' : ''
      let PrepareCorrection = operations[lOperation - 1].enchainement
      if (nombre1 < 0) {
        // si le nombre est négatif
        switch (lOperation) {
          case 8: // carré
          case 9: // cube
            PrepareCorrection = PrepareCorrection.replaceAll(
              'number1',
              '(number1)',
            )
            break
          case 11: // inverse
            PrepareCorrection += ` = $-\\dfrac{1}{${texNombre(-nombre1)}}$`
            break
          default:
            PrepareCorrection = replaceFromSecondOccurrence(
              PrepareCorrection,
              'number1',
              '(number1)',
            )
        }
      }
      let enchainementAvecNombre = PrepareCorrection.replaceAll(
        'number1',
        `${texNombre(nombre1)}`,
      ).replaceAll('number2', `${ecritureParentheseSiNegatif(nombre2)}`)
      if (listeTypeNombres[i] === 2 && (lOperation === 6 || lOperation === 7)) {
        enchainementAvecNombre = ''
      }
      texteCorr += `${texteAvecNombre.replace('l', 'L')} est égal${metUnE} à `
      texteCorr +=
        lOperation === 11 // inverse on laisse 1 sur nombre1
          ? `${enchainementAvecNombre}.`
          : `$${enchainementAvecNombre}${miseEnEvidence(texNombre(operations[lOperation - 1].fct(nombre1, nombre2)))}$.`
      // fin de la correction
      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

function replaceFromSecondOccurrence(
  str: string,
  pattern: string,
  replacement: string,
): string {
  let count = 0
  const regex = new RegExp(pattern, 'g') // Le flag 'g' pour global

  return str.replace(regex, (match) => {
    count++
    return count === 1 ? match : replacement // Garde la première, remplace les autres
  })
}
