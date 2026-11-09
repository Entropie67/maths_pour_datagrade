import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { pgcd } from '../../lib/outils/primalite'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Résoudre une équation du second degré se ramenant au premier degré'
export const interactifReady = true

export const dateDeModifImportante = '21/06/2023' // EE : Rajout d'un paramètre, correction de coquilles, création interactivité et meilleure conclusion des corrections
/**
 *
 * Résoudre une équation du type (ax)2 - b2 = 0
 *
 * Résoudre une équation du type ax2 + bx = 0
 *
 * @author Rémi Angot

 */
export const uuid = '231d2'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class ExerciceEquations extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      "Type d'équations",
      'Nombres séparés par des tirets : \n1: ax2+bx=0\n2: ax2+bxAvec1=0\n3: ax2-b2=0\n4: ax2=b2\n5: (ax+b)2=0\n6: bcx2+a=bx(cx+d)\n7: (ax+b)(cx+d)=acx2\n8: Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Niveau plus facile']
    this.nbQuestions = 6
    this.nbCols = 2

    this.sup = 4
    this.sup2 = true
    this.spacingCorr = 3

    this.comment =
      "Dans le niveau plus facile, l'énoncé contient un maximum d'entiers positifs. <br>"
    this.comment +=
      "Dans le niveau moins facile, l'énoncé contient aléatoirement des entiers positifs ou négatifs. <br>"
  }

  nouvelleVersion() {
    this.consigne =
      'Résoudre ' +
      (this.nbQuestions !== 1
        ? 'les équations suivantes'
        : "l'équation suivante") +
      '.'

    const typeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 7,
      defaut: 8,
      melange: 8,
      nbQuestions: this.nbQuestions,
      listeOfCase: [
        'ax2+bx',
        'ax2+bxAvec1',
        'ax2-b2',
        'ax2=b2',
        '(ax+b)2=0',
        'bcx2+a=bx(cx+d)',
        '(ax+b)(cx+d)=acx2',
        'mélange',
      ],
    })
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    for (
      let i = 0,
        indiceQ = 0,
        fracReponse,
        a,
        b,
        c,
        d,
        texte,
        texteCorr,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = ''
      texteCorr = ''
      a = 0
      b = 0
      let increment = 0
      switch (
        listeTypeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'ax2+bx':
          a = this.sup2 ? randint(2, 9) : randint(-9, 9, [0, -1, 1]) // Le cas 1 (ou -1) est traité ensuite
          b = this.sup2 ? randint(2, 9) : randint(-9, 9, [0, -1, 1])
          texte = ax2plusbx(a, b)[0]
          texteCorr = ax2plusbx(a, b)[1]
          fracReponse = new FractionEtendue(-b, a)
          handleAnswers(
            this,
            fracReponse.signe === -1 ? indiceQ : indiceQ + 1,
            { reponse: { value: fracReponse } },
            { formatInteractif: 'mathlive' },
          )
          handleAnswers(
            this,
            fracReponse.signe === 1 ? indiceQ : indiceQ + 1,
            { reponse: { value: 0 } },
            { formatInteractif: 'mathlive' },
          )
          texte += ajouteChampTexteMathLive(
            this,
            indiceQ,
            KeyboardType.clavierDeBaseAvecFraction,
            {
              texteAvant: `<br>${sp(5)} Solution la plus petite : `,
            },
          )
          texte += ajouteChampTexteMathLive(
            this,
            indiceQ + 1,
            KeyboardType.clavierDeBaseAvecFraction,
            {
              texteAvant: `<br>${sp(5)} Solution la plus grande : `,
            },
          )
          increment = 2
          break
        case 'ax2+bxAvec1':
          if (choice([true, false])) {
            a = 1
            b = randint(2, 9)
          } else {
            b = 1
            a = randint(2, 9)
          }
          if (!this.sup2) {
            a = choice([-1, 1]) * a
            b = choice([-1, 1]) * b
          }
          texte = ax2plusbx(a, b)[0]
          texteCorr = ax2plusbx(a, b)[1]
          fracReponse = new FractionEtendue(-b, a)
          handleAnswers(
            this,
            fracReponse.signe === -1 ? indiceQ : indiceQ + 1,
            { reponse: { value: fracReponse } },
            { formatInteractif: 'mathlive' },
          )
          handleAnswers(
            this,
            fracReponse.signe === 1 ? indiceQ : indiceQ + 1,
            { reponse: { value: 0 } },
            { formatInteractif: 'mathlive' },
          )
          texte += ajouteChampTexteMathLive(
            this,
            indiceQ,
            KeyboardType.clavierDeBaseAvecFraction,
            {
              texteAvant: `<br>${sp(5)} Solution la plus petite : `,
            },
          )
          texte += ajouteChampTexteMathLive(
            this,
            indiceQ + 1,
            KeyboardType.clavierDeBaseAvecFraction,
            {
              texteAvant: `<br>${sp(5)} Solution la plus grande : `,
            },
          )
          increment = 2
          break
        case 'ax2-b2':
          a = randint(1, 10)
          b = randint(1, 10)
          texte = this.sup2
            ? `$ ${rienSi1(a ** 2)}x^2 - ${b ** 2} = 0 $ `
            : choice([
                `$ -${rienSi1(a ** 2)}x^2 + ${b ** 2} = 0 $ `,
                `$ ${rienSi1(a ** 2)}x^2 - ${b ** 2} = 0 $ `,
              ])
          texteCorr = `$ ${rienSi1(a ** 2)}x^2 - ${b ** 2} = 0 $ `
          texteCorr += '<br>'
          texteCorr +=
            a !== 1 ? `$ (${a}x)^2 - ${b}^2 = 0 $ ` : `$ x^2 - ${b}^2 = 0 $ `
          texteCorr += '<br>'
          texteCorr += `$ (${rienSi1(a)}x+${b})(${rienSi1(a)}x-${b}) = 0 $ `
          texteCorr += '<br>'
          texteCorr += `$${rienSi1(a)}x+${b} = 0 \\quad \\text{ou} \\quad ${rienSi1(a)}x-${b} = 0$ `
          texteCorr += '<br>'
          texteCorr += `$${rienSi1(a)}x = ${-b} \\quad \\text{ou} \\quad ${rienSi1(a)}x = ${b}$ `
          fracReponse = new FractionEtendue(b, a)
          if (a !== 1) {
            texteCorr += '<br>'
            if (pgcd(a, b) === 1) {
              texteCorr += `$x = ${fracReponse.oppose().texFSD} \\quad \\text{ou} \\quad x = ${fracReponse.texFSD}$ `
            } else {
              texteCorr += `$x = ${fracReponse.oppose().texFSD}=${fracReponse.simplifie().oppose().texFSD} \\quad \\text{ou} \\quad x = ${fracReponse.texFSD}=${fracReponse.simplifie().texFSD}$ `
            }
          }
          texteCorr += `<br>Les solutions de l'équation sont : $${miseEnEvidence(fracReponse.simplifie().oppose().texFSD)}$ et $${miseEnEvidence(fracReponse.simplifie().texFSD)}$.`
          fracReponse = fracReponse.oppose()
          handleAnswers(
            this,
            fracReponse.signe === -1 ? indiceQ : indiceQ + 1,
            { reponse: { value: fracReponse } },
            { formatInteractif: 'mathlive' },
          )
          handleAnswers(
            this,
            fracReponse.signe !== -1 ? indiceQ : indiceQ + 1,
            { reponse: { value: new FractionEtendue(b, a) } },
            { formatInteractif: 'mathlive' },
          )
          texte += ajouteChampTexteMathLive(
            this,
            indiceQ,
            KeyboardType.clavierDeBaseAvecFraction,
            {
              texteAvant: `<br>${sp(5)} Solution la plus petite : `,
            },
          )
          texte += ajouteChampTexteMathLive(
            this,
            indiceQ + 1,
            KeyboardType.clavierDeBaseAvecFraction,
            {
              texteAvant: `<br>${sp(5)} Solution la plus grande : `,
            },
          )
          increment = 2
          break
        case 'ax2=b2':
          a = randint(1, 10)
          b = randint(1, 10)
          texte = this.sup2
            ? `$ ${rienSi1(a ** 2)}x^2 = ${b ** 2}$ `
            : choice([
                `$ -${rienSi1(a ** 2)}x^2 = -${b ** 2}$ `,
                `$ ${rienSi1(a ** 2)}x^2 = ${b ** 2}$ `,
              ])
          texteCorr = `$ ${rienSi1(a ** 2)}x^2 = ${b ** 2}$ `
          texteCorr += '<br>'
          texteCorr += `$ ${rienSi1(a ** 2)}x^2 - ${b ** 2} = 0 $ `
          texteCorr += '<br>'
          texteCorr +=
            a !== 1 ? `$ (${a}x)^2 - ${b}^2 = 0 $ ` : `$ x^2 - ${b}^2 = 0 $ `
          texteCorr += '<br>'
          texteCorr += `$ (${rienSi1(a)}x+${b})(${rienSi1(a)}x-${b}) = 0 $ `
          texteCorr += '<br>'
          texteCorr += `$${rienSi1(a)}x+${b} = 0 \\quad \\text{ou} \\quad ${rienSi1(a)}x-${b} = 0$ `
          texteCorr += '<br>'
          texteCorr += `$${rienSi1(a)}x = ${-b} \\quad \\text{ou} \\quad ${rienSi1(a)}x = ${b}$ `
          fracReponse = new FractionEtendue(-b, a)
          if (a !== 1) {
            texteCorr += '<br>'
            if (pgcd(a, b) === 1) {
              texteCorr += `$x = ${fracReponse.texFSD} \\quad \\text{ou} \\quad x = ${fracReponse.oppose().texFSD}$ `
            } else {
              texteCorr += `$x = ${fracReponse.texFSD}=${fracReponse.simplifie().texFSD} \\quad \\text{ou} \\quad x = ${fracReponse.texFSD}=${fracReponse.oppose().simplifie().texFSD}$ `
            }
          }
          texteCorr += `<br>Les solutions de l'équation sont : $${miseEnEvidence(fracReponse.simplifie().texFSD)}$ et $${miseEnEvidence(fracReponse.simplifie().oppose().texFSD)}$.`
          fracReponse = new FractionEtendue(-b, a)
          handleAnswers(
            this,
            fracReponse.signe === -1 ? indiceQ : indiceQ + 1,
            { reponse: { value: fracReponse } },
            { formatInteractif: 'mathlive' },
          )
          handleAnswers(
            this,
            fracReponse.signe !== -1 ? indiceQ : indiceQ + 1,
            { reponse: { value: new FractionEtendue(b, a) } },
            { formatInteractif: 'mathlive' },
          )
          texte += ajouteChampTexteMathLive(
            this,
            indiceQ,
            KeyboardType.clavierDeBaseAvecFraction,
            {
              texteAvant: `<br>${sp(5)} Solution la plus petite : `,
            },
          )
          texte += ajouteChampTexteMathLive(
            this,
            indiceQ + 1,
            KeyboardType.clavierDeBaseAvecFraction,
            {
              texteAvant: `<br>${sp(5)} Solution la plus grande : `,
            },
          )
          increment = 2
          break
        case 'bcx2+a=bx(cx+d)':
          a = this.sup2 ? randint(1, 10) : randint(-10, 10, [0])
          b = this.sup2 ? randint(1, 10) : randint(-10, 10, [0])
          c = this.sup2 ? randint(1, 10) : randint(-10, 10, [0])
          d = this.sup2 ? randint(1, 10) : randint(-10, 10, [0])
          fracReponse = new FractionEtendue(a, b * d)
          if (randint(1, 2) === 1) {
            texte = `$ ${rienSi1(b * c)}x^2 ${ecritureAlgebrique(a)} = ${rienSi1(b)}x(${rienSi1(c)}x ${ecritureAlgebrique(d)}) $`
            texteCorr = `$ ${rienSi1(b * c)}x^2 ${ecritureAlgebrique(a)} = ${rienSi1(b)}x(${rienSi1(c)}x ${ecritureAlgebrique(d)}) $`
            texteCorr += '<br>'
            texteCorr += `$ ${rienSi1(b * c)}x^2 ${ecritureAlgebrique(a)} = ${rienSi1(b * c)}x^2 ${ecritureAlgebriqueSauf1(d * b)}x $`
            texteCorr += '<br>'
            texteCorr += `$ ${a} = ${rienSi1(d * b)}x $`
            if (d * b !== 1) texteCorr += `<br>$ ${fracReponse.texFSD} = x $`
            if ((a < 0 && d * b < 0) || pgcd(a, d * b) !== 1) {
              texteCorr += '<br>'
              texteCorr += ` $ ${fracReponse.simplifie().texFSD} = x $`
            }
          } else {
            texte = `$ ${rienSi1(b)}x(${rienSi1(c)}x ${ecritureAlgebrique(d)}) = ${rienSi1(b * c)}x^2 ${ecritureAlgebrique(a)} $`
            texteCorr = `$  ${rienSi1(b)}x(${rienSi1(c)}x ${ecritureAlgebrique(d)}) = ${rienSi1(b * c)}x^2 ${ecritureAlgebrique(a)} $`
            texteCorr += '<br>'
            texteCorr += `$ ${rienSi1(b * c)}x^2 ${ecritureAlgebriqueSauf1(b * d)}x = ${rienSi1(b * c)}x^2 ${ecritureAlgebrique(a)}$`
            texteCorr += '<br>'
            texteCorr += `$ ${rienSi1(b * d)}x = ${a} $`
            if (d * b !== 1) texteCorr += `<br>$ x = ${fracReponse.texFSD}$`
            if ((a < 0 && b * d < 0) || pgcd(a, b * d) !== 1) {
              texteCorr += '<br>'
              texteCorr += ` $ x = ${fracReponse.simplifie().texFSD} $`
            }
          }
          texteCorr += `<br>La solution de l'équation est : $${miseEnEvidence(fracReponse.simplifie().texFSD)}$.`

          handleAnswers(
            this,
            indiceQ,
            { reponse: { value: fracReponse } },
            { formatInteractif: 'mathlive' },
          )
          texte += ajouteChampTexteMathLive(
            this,
            indiceQ,
            KeyboardType.clavierDeBaseAvecFraction,
            {
              texteAvant: `<br>${sp(5)} Solution : `,
            },
          )
          increment = 1
          break
        case '(ax+b)2=0':
          a = this.sup2 ? randint(1, 5) : randint(-5, 5, [0])
          b = this.sup2 ? randint(1, 5) : randint(-5, 5, [0])
          fracReponse = new FractionEtendue(-b, a)
          texte = `$ (${rienSi1(a)}x ${ecritureAlgebrique(b)})^2 = 0 $`
          texteCorr = `$ (${rienSi1(a)}x ${ecritureAlgebrique(b)})^2 = 0 $`
          texteCorr += '<br>'
          texteCorr += `$ ${rienSi1(a)}x ${ecritureAlgebrique(b)} = 0$`
          texteCorr += '<br>'
          texteCorr += `$ ${rienSi1(a)}x = ${-b} $`
          if (a !== 1) texteCorr += `<br>$ x = ${fracReponse.texFSD}$`
          if ((-b < 0 && a < 0) || pgcd(a, b) !== 1) {
            texteCorr += '<br>'
            texteCorr += ` $ x = ${fracReponse.simplifie().texFSD} $`
          }
          texteCorr += `<br>La solution de l'équation est : $${miseEnEvidence(fracReponse.simplifie().texFSD)}$.`
          handleAnswers(
            this,
            indiceQ,
            { reponse: { value: fracReponse } },
            { formatInteractif: 'mathlive' },
          )
          texte += ajouteChampTexteMathLive(
            this,
            indiceQ,
            KeyboardType.clavierDeBaseAvecFraction,
            {
              texteAvant: `<br>${sp(5)} Solution : `,
            },
          )
          increment = 1
          break
        case '(ax+b)(cx+d)=acx2':
          a = this.sup2 ? randint(1, 5) : randint(-5, 5, [0])
          b = this.sup2 ? randint(1, 5) : randint(-5, 5, [0])
          c = this.sup2 ? randint(1, 5) : randint(-5, 5, [0])
          d = this.sup2 ? randint(1, 5) : randint(-5, 5, [0])
          fracReponse = new FractionEtendue(-b * d, a * d + b * c)
          texte = `$ (${rienSi1(a)}x ${ecritureAlgebrique(b)})(${rienSi1(c)}x ${ecritureAlgebrique(d)}) = ${rienSi1(a * c)}x^2 $`
          texteCorr = `$ (${rienSi1(a)}x ${ecritureAlgebrique(b)})(${rienSi1(c)}x ${ecritureAlgebrique(d)}) = ${rienSi1(a * c)}x^2 $`
          texteCorr += '<br>'
          texteCorr += `$ ${rienSi1(a * c)}x^2 ${ecritureAlgebriqueSauf1(a * d)}x ${ecritureAlgebriqueSauf1(b * c)}x ${ecritureAlgebrique(b * d)} = ${rienSi1(a * c)}x^2 $`
          texteCorr += '<br>'
          texteCorr += `$ ${rienSi1(a * c)}x^2 ${ecritureAlgebriqueSauf1(a * d + b * c)}x ${ecritureAlgebrique(b * d)} = ${rienSi1(a * c)}x^2 $`
          texteCorr += '<br>'
          texteCorr += `$ ${rienSi1(a * d + b * c)}x ${ecritureAlgebrique(b * d)} = 0 $`
          texteCorr += '<br>'
          texteCorr += `$ ${rienSi1(a * d + b * c)}x = ${-b * d}$ `
          texteCorr += '<br>'
          texteCorr += `$ x = ${fracReponse.texFSD}$`
          if (
            (-b * d < 0 && a * d + b * c < 0) ||
            pgcd(-b * d, a * d + b * c) !== 1
          ) {
            texteCorr += '<br>'
            texteCorr += `$ x = ${fracReponse.simplifie().texFSD}$`
          }
          texteCorr += `<br>La solution de l'équation est : $${miseEnEvidence(fracReponse.simplifie().texFSD)}$.`
          handleAnswers(
            this,
            indiceQ,
            { reponse: { value: fracReponse } },
            { formatInteractif: 'mathlive' },
          )
          texte += ajouteChampTexteMathLive(
            this,
            indiceQ,
            KeyboardType.clavierDeBaseAvecFraction,
            {
              texteAvant: `<br>${sp(5)} Solution : `,
            },
          )
          increment = 1
          break
      }

      if (this.questionJamaisPosee(i, a, b)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        indiceQ += increment
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
  // this.besoinFormulaireTexte = ["Type d'équations", "Nombres séparés par des tirets : \n1 : Factoriser avec x en facteur commun\n2 : Factoriser avec l'identité remarquable\n3 : Développer et réduire\n4 : Mélange"]
}

function ax2plusbx(a: number, b: number) {
  const texte = `$ ${rienSi1(a)} x^2 ${ecritureAlgebriqueSauf1(b)} x=0$`
  let texteCorr = `$ ${rienSi1(a)} x^2 ${ecritureAlgebriqueSauf1(b)} x=0$`
  texteCorr += '<br>'
  texteCorr += `$x(${rienSi1(a)} x ${ecritureAlgebrique(b)})=0$`
  texteCorr += '<br>'
  texteCorr += `$ x = 0 \\text{ \\quad ou \\quad } ${rienSi1(a)} x ${ecritureAlgebrique(b)} = 0 $ `
  texteCorr += '<br>'
  texteCorr += `$ \\phantom{x = 0 \\text{ \\quad ou \\quad }} ${rienSi1(a)} x = ${-b} $ `
  texteCorr += '<br>'
  const frac = new FractionEtendue(-b, a)
  texteCorr += `$ \\phantom{x = 0 \\text{ \\quad ou \\quad }}  x = ${frac.texFSD} `
  if ((b > 0 && a < 0) || pgcd(a, b) !== 1) {
    texteCorr += ` = ${frac.simplifie().texFSD} `
  }
  texteCorr += '$'
  texteCorr += `<br>Les solutions de l'équation sont : $${miseEnEvidence(0)}$ et $${miseEnEvidence(frac.simplifie().texFSD)}$.`
  return [texte, texteCorr]
}
