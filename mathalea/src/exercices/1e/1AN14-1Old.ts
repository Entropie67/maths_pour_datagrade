import Decimal from 'decimal.js'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebriqueSauf1,
  reduireAxPlusB,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { obtenirListeFractionsIrreductibles } from '../../modules/fractions'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Calculer la dérivée de $\\lambda u$'
export const interactifReady = true

export const uuid = 'ebd89'
export const refs = {
  'fr-fr': [], //  exercice déréférencé et remplacé par 1AN14-1
  'fr-ch': [],
}
export const dateDePublication = '09/05/2024'
const listFrac = obtenirListeFractionsIrreductibles()
/**
 *
 * Dérivation de fonctions du type x -> ku(x),
 * avec u une fonction de référence.
 * @author Jean-claude Lhote
 *
 */
class DerivationFonctionsUsuelles extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Types de fonctions',
      'Nombres séparés par des tirets : \n1 : Fonctions usuelles au hasard\n2 : Affine niveau 1\n3 : Affine niveau2\n4 : Monome niveau 1\n5 : Monome niveau2\n6 : Inverse niveau 1\n7 : Inverse niveau 2\n8 : Mélange',
    ]
    this.sup = '8'
    this.nbQuestions = 5
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = false
  }

  nouvelleVersion() {
    const listeTypeDeQuestion = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 7,
      defaut: 1,
      melange: 8,
      nbQuestions: this.nbQuestions,
      listeOfCase: [
        'usuelles',
        'affine1',
        'affine2',
        'monome1',
        'monome2',
        'inverse1',
        'inverse2',
      ],
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let laFonction: string = ''
      let laDerivee: string = ''
      let df: string = ''
      const nameF = [
        'f',
        'g',
        'h',
        'l',
        'r',
        's',
        't',
        'u',
        'v',
        'w',
        'b',
        'c',
        'd',
        'e',
      ][i % 16]
      let correctionDetaillee = ''
      switch (listeTypeDeQuestion[i]) {
        case 'usuelles':
          laFonction = choice([
            'k',
            'mx+p',
            'x^2',
            'x^3',
            'x^n',
            '\\frac{1}{x}',
            '\\sqrt{x}',
          ])
          switch (laFonction) {
            case 'k':
              df = 'pour tout $x\\in\\R$'
              laFonction = choice([
                String(randint(-100, 100)),
                texNombre(new Decimal(randint(-1000, 1000)).div(100), 2),
                choice(listFrac).multiplieEntier(choice([-1, 1])).texFSD,
                `\\sqrt{${choice(['2', '3', '5', '\\frac{1}{2}', '\\frac{1}{3}', '\\frac{3}{2}', '\\frac{4}{3}', '\\frac{1}{6}'])}}`,
                choice([
                  '\\pi',
                  '\\frac{\\pi}{2}',
                  '\\frac{\\pi}{3}',
                  '\\frac{\\pi}{4}',
                ]),
              ])
              laDerivee = '0'
              correctionDetaillee = `La fonction $${nameF}$ est une fonction constante, sa dérivée est nulle.<br>`
              break
            case 'mx+p':
              df = 'pour tout $x\\in\\R$,'
              laDerivee = 'm'
              correctionDetaillee = `La fonction $${nameF}$ est une fonction affine de la forme $f(x)=ax+b$, sa dérivée est le coefficient $a$.<br>`
              break
            case 'x^2':
              df = 'pour tout $x\\in\\R$'
              laDerivee = '2x'
              correctionDetaillee = `La fonction $${nameF}$ est une fonction puissance de la forme $f(x)=x^n$, sa dérivée est $nx^{n-1}$.<br>`
              break
            case 'x^3':
              df = 'pour tout $x\\in\\R$'
              laDerivee = '3x^2'
              correctionDetaillee = `La fonction $${nameF}$ est une fonction puissance de la forme $f(x)=x^n$, sa dérivée est $nx^{n-1}$.<br>`
              break
            case 'x^n':
              df = 'pour tout $x\\in\\R$'
              laDerivee = 'nx^{n - 1}'
              correctionDetaillee = `La fonction $${nameF}$ est une fonction puissance de la forme $f(x)=x^n$, sa dérivée est $nx^{n-1}$.<br>`
              break
            case '\\frac{1}{x}':
              df = 'pour tout $x\\in\\R^*$'
              laDerivee = '-\\frac{1}{x^2}'
              correctionDetaillee = `La fonction $${nameF}$ peut être considérée comme une fonction puissance, en effet : $f(x)=x^{-1}$, sa dérivée est donc $-1\\times x^{-1-1}$.<br>`
              break
            case '\\sqrt{x}':
              df = 'pour tout $x\\in\\R^*_+$'
              laDerivee = '\\frac{1}{2\\sqrt{x}}'
              break
          }
          break
        case 'affine1':
          {
            df = 'pour tout $x\\in\\R$'
            laFonction = choice([
              reduireAxPlusB(randint(-100, 100, 0), randint(-100, 100, 0)),
              `${String(randint(-100, 100, 0))}${ecritureAlgebriqueSauf1(randint(-100, 100, 0))}x`,
              reduireAxPlusB(
                new Decimal(randint(-1000, 1000, 0)).div(100),
                new Decimal(randint(-1000, 1000, 0)).div(100),
              ),
              `${texNombre(new Decimal(randint(-1000, 1000, 0)).div(100), 2)}${ecritureAlgebriqueSauf1(new Decimal(randint(-1000, 1000, 0)).div(100))}x`,
            ])
            laDerivee = laFonction.replaceAll(',', '.')
            const derivee1 = laDerivee.match(/-?\d*\.?\d*(-?\+?\d*.?\d*)x/)
            const derivee2 = laDerivee.match(/(-?\d*\.?\d*)x/)
            if (laFonction.charAt(laFonction.length - 1) === 'x') {
              if (derivee1 != null) laDerivee = derivee1[1]
              else
                window.notify('Un problème avec la dérivée de cette fonction', {
                  laFonction,
                })
            } else {
              if (derivee2 != null) laDerivee = derivee2[1]
              else
                window.notify('Un problème avec la dérivée de cette fonction', {
                  laFonction,
                })
            }
            laDerivee = laDerivee.startsWith('+')
              ? laDerivee.substring(1)
              : laDerivee
            laDerivee = laDerivee.replaceAll('.', ',')
            correctionDetaillee = `La fonction $${nameF}$ est une fonction affine de la forme $f(x)=ax+b$, sa dérivée est le coefficient $a$.<br>`
          }
          break
        case 'affine2':
          {
            const frac = choice(listFrac).multiplieEntier(choice([-1, 1]))
            const b = randint(1, 10)
            df = 'pour tout $x\\in\\R$'
            if (choice([true, false])) {
              laFonction = `${frac.texFractionSimplifiee}x+${b}`
              laDerivee = `${frac.texFractionSimplifiee}`
            } else {
              laFonction = `\\frac{${rienSi1(frac.num)}x+${b}}{${frac.den}}`
              laDerivee = `${frac.texFractionSimplifiee}`
              correctionDetaillee += `$${nameF}(x)$ peut s'écrire $${frac.texFractionSimplifiee}x+\\frac{${b}}{${frac.den}}$.<br>`
            }
            correctionDetaillee += `La fonction $${nameF}$ est une fonction affine de la forme $f(x)=ax+b$, sa dérivée est le coefficient $a$.<br>`
          }
          break
        case 'monome1':
          {
            const n = randint(4, 15)
            const m = randint(-10, 10, [-1, 0, 1])
            df = 'pour tout $x\\in\\R$'
            laFonction = `${String(m)}x^{${n}}`
            laDerivee = `${n * m}x^{${n - 1}}`
            correctionDetaillee = `La fonction $${nameF}$ est une fonction de la forme $f(x)=ax^n$, sa dérivée est $anx^{n-1}$.<br>`
          }
          break
        case 'monome2':
          {
            const den = randint(2, 8)
            const n = randint(2, 15)
            df = 'pour tout $x\\in\\R$'
            if (choice([true, false])) {
              laFonction = `\\frac{x^{${n}}}{${den}}`
              correctionDetaillee = `$${nameF}(x)$ peut s'écrire $\\frac{1}{${den}}x^{${n}}$.<br>`
            } else {
              laFonction = `\\frac{1}{${den}}x^{${n}}`
            }
            laDerivee = `\\frac{${n}}{${den}}x^{${n - 1}}`
            correctionDetaillee += `La fonction $${nameF}$ est une fonction de la forme $f(x)=ax^n$ avec $a=\\frac{${1}}{${den}}$ et $n=${n}$. Sa dérivée est $anx^{n-1}$.<br><br>`
          }
          break
        case 'inverse1':
          {
            const num = randint(-10, 10, [-1, 1, 0])
            laFonction = `\\frac{${num}}{x}`
            laDerivee = `${num < 0 ? '' : '-'}\\frac{${num < 0 ? String(-num) : String(num)}}{x^2}`
            correctionDetaillee = `La fonction $${nameF}$ est une fonction de la forme $f(x)=a\\times\\frac{1}{x}$ avec $a=${num}$. Sa dérivée est $a\\times\\frac{-1}{x^2}$.<br><br>`
            df = 'pour tout $x\\in\\R^*$'
          }
          break
        case 'inverse2':
          {
            const frac = choice(listFrac).multiplieEntier(choice([-1, 1]))
            const num = frac.num
            const den = frac.den
            laFonction = `\\frac{${num}}{${den}x}`
            laDerivee = `${num < 0 ? '' : '-'}\\frac{${num < 0 ? String(-num) : String(num)}}{${den}x^2}`
            correctionDetaillee = `La fonction $${nameF}$ est une fonction de la forme $f(x)=a\\times\\frac{1}{x}$ avec $a=\\frac{${num}}{${den}}$. Sa dérivée est $a\\times\\frac{-1}{x^2}$.<br><br>`
            df = 'pour tout $x\\in\\R^*$'
          }
          break
        default:
          df = 'pour tout $x\\in\\R$'
          laFonction = '42'
          laDerivee = '0'
          break
      }
      const passageDeLigneCorr =
        laDerivee.includes('frac') || laFonction.includes('frac')
          ? '<br><br>'
          : '<br>'
      let texte =
        `Donner la dérivée de la fonction $${nameF}$, dérivable ${df}, définie par  $${nameF}(x)=${laFonction}$.` +
        ajouteChampTexteMathLive(this, i, KeyboardType.lyceeClassique)
      const reponse = laDerivee

      let texteCorr = ''
      if (this.correctionDetaillee)
        texteCorr += correctionDetaillee.replace('<br>', passageDeLigneCorr)
      texteCorr += `L'expression de la dérivée de la fonction $${nameF}$ définie par $${nameF}(x)=${laFonction}$ est : `
      texteCorr += `$${miseEnEvidence(`${nameF}'(x)=${reponse}`)}$.`
      texte = texte.replaceAll('\\frac', '\\dfrac')
      texteCorr = texteCorr.replaceAll('\\frac', '\\dfrac')
      if (this.questionJamaisPosee(i, laFonction)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        handleAnswers(this, i, {
          reponse: {
            value: reponse,
            options: { calculFormel: true },
          },
        })
        i++
        cpt--
      }
      cpt++
    }
  }
}

export default DerivationFonctionsUsuelles
