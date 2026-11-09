import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  reduireAxPlusB,
  rienSi0,
  rienSi1,
} from '../../lib/outils/ecritures'
import { numAlpha, sp } from '../../lib/outils/outilString'
import FractionEtendue from '../../modules/FractionEtendue'

export const titre = 'Résoudre une équation simple avec le logarithme'
export const dateDePublication = '22/7/2024'
export const uuid = 'f1f9d'
export const interactifReady = true

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

function resoudreAxPlusBZeroTex(a: number, b: number): string {
  const fracMoinsBsurA = new FractionEtendue(-b, a).texFractionSimplifiee
  let texteCorr = ''
  texteCorr += `$${reduireAxPlusB(a, b)}> 0`
  if (b !== 0) {
    texteCorr += `\\iff ${rienSi1(a)}x> ${-b}`
  }
  if (a !== 1) {
    texteCorr += `\\iff x${a > 0 ? '> ' : '< '}${fracMoinsBsurA}`
  }
  texteCorr += '$'
  return texteCorr
}

/**
 *
 * @author  Jean-claude Lhote
 * QQes aménagements Stéphane Guyon
 */
export default class EquationsLog extends Exercice {
  version: string
  constructor() {
    super()
    this.version = 'ln'
    this.nbQuestions = 2
    this.spacing = 1.5
    this.spacingCorr = 3
    this.sup = '1'
    this.sup2 = true
    this.besoinFormulaireTexte = [
      'Type de question ',
      'Nombres séparés par des tirets  :\n1 : $\\ln(ax+b)=n$\n2 : $\\ln(ax+b)=\\ln(cx+d)$\n3 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Type de logarithme', true]
  }

  nouvelleVersion() {
    if (this.sup2 === false) this.version = 'ln'
    else this.version = 'log'
    const logString = this.version !== 'ln' ? '\\log' : '\\ln'
    const base = this.version !== 'ln' ? '10' : 'e'
    const listeTypeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    }).map((el) => Number(el))

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte: string
      let texteCorr: string
      const fracPlusInf = new FractionEtendue(10 ** 15, 1)
      const fracMoinsInf = new FractionEtendue(-(10 ** 15), 1)
      // const { a, b, c, d, n } = aleaVariables({ a: true, b: true, c: true, d: true, n: true, test: 'a!=c and b!=d and b/c!=d/c' }) as {a: number, b: number, c: number, d:number, n: number}
      let a: number
      let b: number
      let c: number
      let d: number
      let n: number
      do {
        a = randint(-10, 10, 0)
        b = randint(-10, 10)
        c = randint(-10, 10, 0)
        d = randint(-10, 10)
        n = randint(-10, 10)
      } while (!(a !== c && b !== d && b / c !== d / c))
      let domaine: string
      let solution: string
      let intervalle: [FractionEtendue, FractionEtendue]
      if (listeTypeQuestions[i] === 1) {
        // log(ax+b)=n
        texte = `On demande de résoudre l'équation suivante : $${logString}(${reduireAxPlusB(a, b)})=${n}$.<br>`
        texte +=
          `${numAlpha(0)} Déterminer le domaine sur lequel on peut résoudre cette équation.` +
          ajouteChampTexteMathLive(
            this,
            2 * i,
            ` ${KeyboardType.equationsTerminale}`,
            { texteAvant: '<br>$\\mathcal{D}_f=$' },
          )
        texte +=
          `<br>${numAlpha(1)} Donner la solution de cette équation.` +
          ajouteChampTexteMathLive(
            this,
            2 * i + 1,
            ` ${KeyboardType.equationsTerminale}`,
            { texteAvant: '<br>$\\mathcal{S}=$' },
          )

        if (b !== 0) {
          solution = `${a > 0 ? '' : '-'}${Math.abs(a) !== 1 ? `\\dfrac{${base}^{${n}}${ecritureAlgebrique(-b)}}{${Math.abs(a)}}` : `${base}^{${n}}${ecritureAlgebrique(a === 1 ? -b : b)}`}`
        } else {
          solution = `${a > 0 ? '' : '-'}${Math.abs(a) !== 1 ? `\\dfrac{${base}^{${n}}}{${Math.abs(a)}}` : `${base}^{${n}}`}`
        }
        const f1 = new FractionEtendue(-b, a)
        const fracMoinsBsurA = f1.texFractionSimplifiee
        texteCorr = `${numAlpha(0)} La fonction $${logString}$ est définie sur $\\R_+^*$, donc il faut vérifier que :<br>`
        texteCorr += resoudreAxPlusBZeroTex(a, b)
        if (a <= 0) {
          texteCorr += ` (On inverse le signe car on divise chaque membre par $${a}$ qui est négatif)`
        }
        texteCorr += `.<br>Ainsi, ${sp()} $ \\mathcal{D}_f=${miseEnEvidence(a > 0 ? `\\left]${fracMoinsBsurA};+\\infty\\right[` : `\\left]-\\infty;${fracMoinsBsurA}\\right[`)}$.<br>`
        texteCorr += `${numAlpha(1)} On sait que pour tout $a$ et $b$ appartenant à $\\R_+^*$ :  $a=b \\iff ${logString} (a) = ${logString} (b)$.<br> D'où pour tout $x\\in \\mathcal{D}_f$<br> `
        texteCorr += `
        $\\begin{aligned}
        &\\phantom{\\iff}${logString}(${reduireAxPlusB(a, b)})= ${n}\\\\ &\\iff ${logString}(${reduireAxPlusB(a, b)})= ${logString}(${base}^{${n}})\\\\
         &\\iff ${reduireAxPlusB(a, b)}=${base}^{${n}}\\\\
         ${b !== 0 ? `&\\iff ${rienSi1(a)}x=${base}^{${n}}${ecritureAlgebrique(-b)}\\\\` : ''}
        \\end{aligned}$`
        if (a !== 1) {
          texteCorr += `<br>$\\begin{aligned}&\\iff x=${solution.replace('\\dfrac', '\\frac')}\\end{aligned}$`
        }
        domaine =
          a > 0
            ? `\\left]${fracMoinsBsurA};+\\infty\\right[`
            : `\\left]-\\infty;${fracMoinsBsurA}\\right[`
        intervalle =
          a > 0
            ? [f1, new FractionEtendue(10 ** 15, 1)]
            : [new FractionEtendue(-(10 ** 15), 1), f1] // une notion relative de \\infty ;-)
        const valeurSolution =
          base === '10' ? (10 ** n - b) / a : (Math.E ** n - b) / a
        if (
          intervalle[1].valeurDecimale > valeurSolution &&
          intervalle[0].valeurDecimale < valeurSolution
        ) {
          texteCorr += `<br>On vérifie que  $${solution}\\in ${domaine}$ donc $S=\\left\\{${solution}\\right\\}$.<br> L'équation admet $${miseEnEvidence(solution)}$ comme solution unique.`
          solution = `\\{${solution}\\}`
        } else {
          texteCorr += `<br>On vérifie que $${solution}\\notin ${domaine}$ donc $S=\\emptyset$.<br> L'équation n'admet aucune solution.`
          solution = '\\emptyset'
        }
      } else {
        // log(ax+b)=log(cx+d)
        texte = `On demande de résoudre l'équation suivante : $${logString}(${reduireAxPlusB(a, b)})=${logString}(${reduireAxPlusB(c, d)})$.<br>`
        texte +=
          `${numAlpha(0)} Déterminer le domaine sur lequel on peut résoudre cette équation.<br>` +
          ajouteChampTexteMathLive(
            this,
            2 * i,
            ` ${KeyboardType.equationsTerminale}`,
            { texteAvant: '$\\mathcal{D}_f=$', texteApres: '<br>' },
          )
        texte +=
          `${numAlpha(1)} Donner la solution de cette équation.<br>` +
          ajouteChampTexteMathLive(
            this,
            2 * i + 1,
            ` ${KeyboardType.equationsTerminale}`,
            { texteAvant: '$\\mathcal{S}=$' },
          )
        texteCorr = `${numAlpha(0)} La fonction $${logString}$ est définie sur $\\R_+^*$, il faut donc vérifier que :<br>`
        const f2 = new FractionEtendue(-b, a)
        const f3 = new FractionEtendue(-d, c)
        const fracMoinsBsurA = f2.texFractionSimplifiee
        const fracMoinsDsurC = f3.texFractionSimplifiee
        texteCorr += `D'une part, ${resoudreAxPlusBZeroTex(a, b)}.<br>`
        texteCorr += `D'autre part, ${resoudreAxPlusBZeroTex(c, d)}.<br>`
        if (a * c > 0) {
          // les signes sont dans le même sens, on a un intervalle inclus dans l'autre
          if (a > 0) {
            // le signe est > pour les deux, on cherche le plus grand des deux.
            if (-b / a > -d / c) {
              texteCorr += `$${fracMoinsDsurC}<${fracMoinsBsurA}< x$ donc $\\mathcal{D}_f=${miseEnEvidence(`\\left]${fracMoinsBsurA};+\\infty\\right[`)}$.<br>`
              domaine = `\\left]${fracMoinsBsurA};+\\infty\\right[`
              intervalle = [f2, fracPlusInf]
            } else {
              texteCorr += `$${fracMoinsBsurA}<${fracMoinsDsurC}< x$ donc $\\mathcal{D}_f=${miseEnEvidence(`\\left]${fracMoinsDsurC};+\\infty\\right[`)}$.<br>`
              domaine = `\\left]${fracMoinsDsurC};+\\infty\\right[`
              intervalle = [f3, fracPlusInf]
            }
          } else {
            // le signe est < on cherche le plus petit des deux
            if (-b / a < -d / c) {
              texteCorr += `$x<${fracMoinsBsurA}<${fracMoinsDsurC}$ donc $\\mathcal{D}_f=${miseEnEvidence(`\\left]-\\infty;${fracMoinsBsurA}\\right[`)}$.<br>`
              domaine = `\\left]-\\infty;${fracMoinsBsurA}\\right[`
              intervalle = [fracMoinsInf, f2]
            } else {
              texteCorr += `$x<${fracMoinsDsurC}<${fracMoinsBsurA}$ donc $\\mathcal{D}_f=${miseEnEvidence(`\\left]-\\infty;${fracMoinsDsurC}\\right[`)}$.<br>`
              domaine = `\\left]-\\infty;${fracMoinsDsurC}\\right[`
              intervalle = [fracMoinsInf, f3]
            }
          }
        } else {
          // les signes sont dans des sens différents, on a une intersection ou une réunion...
          if (-b / a < -d / c) {
            // -b/a<-d/c
            if (a > 0) {
              // -b/a<x -b/a<-d/c
              if (c > 0) {
                // -b/a<-d/c<x
                texteCorr += `$${fracMoinsBsurA}<${fracMoinsDsurC}< x$ donc $\\mathcal{D}_f=${miseEnEvidence(`\\left]${fracMoinsDsurC};+\\infty\\right[`)}$.<br>`
                domaine = `\\left]${fracMoinsDsurC};+\\infty\\right[`
                intervalle = [f3, fracPlusInf]
              } else {
                // -b/a<x<-d/c
                texteCorr += `$${fracMoinsBsurA}< x<${fracMoinsDsurC}$ donc $\\mathcal{D}_f=${miseEnEvidence(`\\left]${fracMoinsBsurA};${fracMoinsDsurC}\\right[`)}$.<br>`
                domaine = `\\left]${fracMoinsBsurA};${fracMoinsDsurC}\\right[`
                intervalle = [f2, f3]
              }
            } else {
              // x<-b/a et -b/a<-d/c
              if (c > 0) {
                // x>-d/c donc ensemble vide
                texteCorr += `$x<${fracMoinsBsurA}$ et $x> ${fracMoinsDsurC}$ ne peuvent être vérifiés en même temps car $${fracMoinsBsurA}<${fracMoinsDsurC}$, donc $\\mathcal{D}_f=${miseEnEvidence('\\emptyset')}$.<br>`
                domaine = '\\emptyset'
                intervalle = [fracMoinsInf, fracMoinsInf]
              } else {
                // x<-d/c donc x<-b/a<-d/c
                texteCorr += `$x<${fracMoinsBsurA}<${fracMoinsDsurC}$ donc $\\mathcal{D}_f=${miseEnEvidence(`\\left]-\\infty;${fracMoinsBsurA}\\right[`)}$.<br>`
                domaine = `\\left]-\\infty;${fracMoinsBsurA}\\right[`
                intervalle = [fracMoinsInf, f2]
              }
            }
          } else {
            // -d/c<-b/a
            if (a > 0) {
              // -b/a<x -d/c<-b/a
              if (c > 0) {
                // -d/c<-b/a<x
                texteCorr += `$x> ${fracMoinsBsurA}> ${fracMoinsDsurC}$ donc $\\mathcal{D}_f=${miseEnEvidence(`\\left]${fracMoinsBsurA};+\\infty;\\right[`)}$.<br>`
                domaine = `\\left]${fracMoinsBsurA};+\\infty;\\right[`
                intervalle = [f2, fracPlusInf]
              } else {
                // x<-d/c et x>-b/a impossible car -d/c<-b/a
                texteCorr += `$x> ${fracMoinsBsurA}$ et $x<${fracMoinsDsurC}$ ne peuvent être vérifiés en même temps car $${fracMoinsBsurA}> ${fracMoinsDsurC}$, donc $\\mathcal{D}_f=${miseEnEvidence('\\emptyset')}$.<br>`
                domaine = '\\emptyset'
                intervalle = [fracMoinsInf, fracMoinsInf]
              }
            } else {
              if (c > 0) {
                // -d/c<x<-b/a
                texteCorr += `$${fracMoinsDsurC}< x<${fracMoinsBsurA}$ donc $\\mathcal{D}_f=${miseEnEvidence(`\\left]${fracMoinsDsurC};${fracMoinsBsurA}\\right[`)}$.<br>`
                domaine = `\\left]${fracMoinsDsurC};${fracMoinsBsurA}\\right[`
                intervalle = [f3, f2]
              } else {
                //  x<-d/c<-b/a
                texteCorr += `$x< ${fracMoinsDsurC}< ${fracMoinsBsurA}$ donc $\\mathcal{D}_f=${miseEnEvidence(`\\left]-\\infty;${fracMoinsDsurC}\\right[`)}$.<br>`
                domaine = `\\left]-\\infty;${fracMoinsDsurC}\\right[`
                intervalle = [fracMoinsInf, f3]
              }
            }
          }
        }
        if (domaine !== '\\emptyset') {
          texteCorr += `<br>${numAlpha(1)} La fonction $${logString}$ étant une fonction strictement croissante sur $\\R_+^*$, <br> pour tout $a$ et $b$ appartenant à $\\R_+^*$, $a=b \\iff ${logString} a = ${logString} b$.<br>`
          texteCorr += `D'où pour tout $x\\in\\mathcal{D}_f$:<br>$
          \\begin{aligned} 
          &\\phantom{\\iff}${logString}(${reduireAxPlusB(a, b)})=${logString}(${reduireAxPlusB(c, d)})\\\\&\\iff ${reduireAxPlusB(a, b)}=${reduireAxPlusB(c, d)}\\\\`
          const fracSolution = new FractionEtendue(d - b, a - c).simplifie()
          if (a > c) {
            // a>c : on ramène dans le premier membre.
            texteCorr += `&\\iff ${rienSi1(a)}x{${ecritureAlgebriqueSauf1(-c)}x=${rienSi0(d)}${b !== 0 ? (d === 0 ? -b : ecritureAlgebrique(-b)) : ''}}\\\\
            ${a - c !== 1 ? `&\\iff ${a - c}x=${d - b}\\\\` : ''}
            &\\iff x=${fracSolution.texFSD}
            \\end{aligned}$`
          } else {
            // c>a, on ramène dans le deuxième membre
            texteCorr += `&\\iff ${rienSi0(b)}${d !== 0 ? (b === 0 ? -d : ecritureAlgebrique(-d)) : ''}`
            texteCorr += `=${rienSi1(c)}x${ecritureAlgebriqueSauf1(-a)}x\\\\
            &\\iff ${b - d}=${rienSi1(c - a)}x\\\\
            &\\iff x=${fracSolution.texFSD}
            \\end{aligned}$`
          }
          if (
            fracSolution.superieurstrict(intervalle[0]) &&
            fracSolution.inferieurstrict(intervalle[1])
          ) {
            texteCorr += `<br>On vérifie que $${fracSolution.texFSD}\\in ${domaine}$ donc  `
            solution = `\\{${fracSolution.texFSD}\\}`
          } else {
            texteCorr += `<br>On vérifie que $${fracSolution.texFSD}\\notin ${domaine}$ donc `
            solution = '\\emptyset'
          }
        } else {
          texteCorr += `<br>${numAlpha(1)} Le domaine de définition de l'équation étant l'ensemble vide, il en est de même pour l'ensemble de solutions de l'équation.<br>`
          solution = '\\emptyset'
        }
        texteCorr += `$\\mathcal{S}=${miseEnEvidence(solution.startsWith('{') ? `\\left\\{${solution.slice(1, -1)}\\right\\}` : solution)}$`
      }
      if (this.questionJamaisPosee(i, a, b, n, listeTypeQuestions[i])) {
        if (this.interactif) {
          handleAnswers(this, 2 * i, {
            reponse: { value: domaine, options: { intervalle: true } },
          })
          handleAnswers(this, 2 * i + 1, {
            reponse: { value: solution, options: { intervalle: true } },
          })
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
