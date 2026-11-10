import { texteGras } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { texFractionReduite } from '../../lib/outils/deprecatedFractions'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs } from '../../lib/outils/nombres'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Déterminer une fonction affine'
export const interactifReady = true

export const dateDeModifImportante = '14/05/2023'
/**
 * Déterminer une fonction affine à partir de deux images
 * @author Stéphane Guyon et Gilles Mora
 */
export const uuid = 'ef897'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class DeterminerfonctionaffineOld extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      4,
      '1 : Avec deux images (nombres entiers)\n 2 : Avec deux images (fractions)\n 3 : Avec deux points\n 4 : Mélange des cas précédents',
    ]

    this.nbQuestions = 3
    this.spacingCorr = context.isHtml ? 2 : 1
    this.sup = 1
    this.comment = `Dans le premier cas, les nombres $a$ et $b$ obtenus sont des nombres entiers. <br>
  Le deuxième cas est plus complexe puisque les nombres $a$ et $b$ sont des fractions. <br>
  Dans le troisième cas, les nombres $a$ et $b$ sont quelconques.`
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles: number[] = []
    if (this.sup === 1) {
      typesDeQuestionsDisponibles = [1] // on donne f(a)=b et f(c)=d cas entier
    } else if (this.sup === 2) {
      typesDeQuestionsDisponibles = [2] // on donne f(a)=b et f(c)=d cas fraction
    } else if (this.sup === 3) {
      typesDeQuestionsDisponibles = [3] // On donne 2 points A(a;b) et B(c;d)
    } else {
      typesDeQuestionsDisponibles = [1, 2, 3] // Mélange des cas précédents
    }

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const typesDeQuestions = listeTypeDeQuestions[i]
      let texte = ''
      let texteCorr = ''
      let reponse: string = ''
      const variables: number[] = []
      switch (typesDeQuestions) {
        case 1:
          {
            const k = randint(-6, 6, 0) // [-1,0,1]
            const a = randint(1, 9)
            const c = randint(1, 9, [a])
            const p = randint(-9, 9)
            const b = k * a + p
            const d = k * c + p
            texte = ` Déterminer l'expression algébrique de la fonction affine $f$ définie sur $\\mathbb R$, sachant que
                        $f(${a})=${b}$ et que $f(${c})=${d}$.<br>`
            if (context.isDiaporama) {
              texteCorr = `$f(x)=${rienSi1(k)}x${k * a - b === 0 ? '' : `${ecritureAlgebrique(b - k * a)}`}$`
            } else {
              texteCorr = `$f$ est une fonction affine, elle a donc une expression de la forme  $f(x)=ax+b$ avec $a$ et $b$ des nombres réels.<br>`
              texteCorr +=
                "D'après le cours, on sait que pour $u\\neq v$, $a=\\dfrac{f(u)-f(v)}{u-v}$ <br>"
              texteCorr += `Avec $u=${a}$ et  $v=${c}$, on obtient  :  $a=\\dfrac{f(${a})-f(${c})}{${a}-${ecritureParentheseSiNegatif(c)}}=\\dfrac{${b}-${ecritureParentheseSiNegatif(d)}}{${a}-${ecritureParentheseSiNegatif(c)}}=\\dfrac{${b - d}}{${a - c}}=${k}$.<br>`
              if (b === d) {
                // m=0 ; cas f constante
                texteCorr +=
                  '$f$ est une fonction constante, cas particulier des fonctions affines.<br>'
                texteCorr += `On a donc : $f(x)=${b}$`
              } else {
                texteCorr +=
                  "On en déduit que la fonction $f$ s'écrit sous la forme : "
                texteCorr += `   $f(x)=${rienSi1(k)} x +b.$<br>`
                texteCorr += `${texteGras('Remarque : ')}On obtient $b$ en utilisant (au choix) une des deux données de l'énoncé, par exemple $f(${a})=${b}$.<br>`
                texteCorr += `Comme $f(x)=${rienSi1(k)}x +b$, alors $f(${a})=
              ${abs((b - d) / (a - c)) === 1 ? `${k * a}+b` : `${k}\\times${a}+b=${k * a}+b`}$ . On en déduit :<br>`
                texteCorr += `$\\begin{aligned}f(${a})=${b}&\\iff ${k * a}+b=${b}\\\\`
                texteCorr += `&\\iff b=${b - k * a}\\\\`
                texteCorr += '\\end{aligned}$<br>'

                texteCorr += `On en déduit $f(x)=${rienSi1(k)}x${k * a - b === 0 ? '' : `${ecritureAlgebrique(b - k * a)}`}$.`
              }
              reponse = `${k}x+${p}`
            }
            variables.push(a, b, c, d, p)
          }
          break
        case 2:
          {
            let k1 = randint(-6, 6, 0)
            let k2 = randint(-6, 6, k1)
            let a = randint(1, 10)
            let c = randint(1, 5, [a])
            let p = randint(-9, 9)
            let b = k1 * a + p
            let d = k2 * c + p

            while (Number.isInteger((b - d) / (a - c))) {
              k1 = randint(-6, 6, 0)
              k2 = k1 + 1
              a = randint(1, 9)
              c = randint(1, 9, [a])
              p = randint(-9, 9)
              b = k1 * a + p
              d = k2 * c + p
            }
            texte = ` Déterminer l'expression algébrique de la fonction affine $f$ définie sur $\\mathbb R$, sachant que
                          $f(${a})=${b}$ et que $f(${c})=${d}$.<br>`
            if (context.isDiaporama) {
              if ((b * (a - c) - (b - d) * a) * (a - c) > 0) {
                texteCorr = ` $f(x)=${texFractionReduite(b - d, a - c)}x+${texFractionReduite(b * (a - c) - (b - d) * a, a - c)}$.`
              }
              if ((b * (a - c) - (b - d) * a) * (a - c) < 0) {
                texteCorr = ` $f(x)=${texFractionReduite(b - d, a - c)}x-${texFractionReduite(abs(b * (a - c) - (b - d) * a), abs(a - c))}$.`
              }
              if ((b * (a - c) - (b - d) * a) * (a - c) === 0) {
                texteCorr = `$f(x)=${texFractionReduite(b - d, a - c)}x.`
              }
            } else {
              texteCorr = `$f$ est une fonction affine, elle a donc une expression de la forme  $f(x)=ax+b$ avec $a$ et $b$ des nombres réels.<br>
                          `
              texteCorr +=
                "D'après le cours, on sait que pour $u\\neq v$, $a=\\dfrac{f(u)-f(v)}{u-v}$ <br>"
              texteCorr += `Avec $u=${a}$ et  $v=${c}$, on obtient  :  $a=\\dfrac{f(${a})-f(${c})}{${a}-${ecritureParentheseSiNegatif(c)}}=\\dfrac{${b}-${ecritureParentheseSiNegatif(d)}}{${a}-${ecritureParentheseSiNegatif(c)}}=\\dfrac{${b - d}}{${a - c}}$.<br>`
              texteCorr += `D'où $a=${texFractionReduite(b - d, a - c)}$.<br>`
              if (b === d) {
                // m=0 ; cas f constante
                texteCorr +=
                  '$f$ est une fonction constante, cas particulier des fonctions affines.<br>'
                texteCorr += `On a donc : $f(x)=${b}$`
                reponse = `${b}`
              } else {
                texteCorr += `On en déduit que la fonction $f$ s'écrit sous la forme : $f(x)=${texFractionReduite(b - d, a - c)}x +b.$<br>`
                texteCorr += `${texteGras('Remarque : ')}On obtient $b$ en utilisant (au choix)   une des deux données de l'énoncé, par exemple $f(${a})=${b}$.<br>`
                texteCorr += `Comme $f(x)=${texFractionReduite(b - d, a - c)}x +b$, alors $f(${a})=${texFractionReduite(b - d, a - c)}\\times ${a}+b=${texFractionReduite((b - d) * a, a - c)}+b$. On en déduit :<br><br>`
                texteCorr += `$\\begin{aligned}f(${a})=${b}&\\iff ${texFractionReduite((b - d) * a, a - c)}+b=${b}\\\\`
                texteCorr += `&\\iff b=${b} ${(b - d) * a * (a - c) > 0 ? `${texFractionReduite((b - d) * a * -1, a - c)}` : `+${texFractionReduite(abs((b - d) * a), abs(a - c))}`}\\\\`
                texteCorr += `&\\iff b=${texFractionReduite(b * (a - c) - (b - d) * a, a - c)}\\\\`
                texteCorr += '\\end{aligned}$<br>'
                if ((b * (a - c) - (b - d) * a) * (a - c) > 0) {
                  texteCorr += `Ainsi, $f(x)=${texFractionReduite(b - d, a - c)}x+${texFractionReduite(b * (a - c) - (b - d) * a, a - c)}$.`
                  reponse = `${texFractionReduite(b - d, a - c)}x+${texFractionReduite(b * (a - c) - (b - d) * a, a - c)}`
                }
                if ((b * (a - c) - (b - d) * a) * (a - c) < 0) {
                  texteCorr += `Ainsi, $f(x)=${texFractionReduite(b - d, a - c)}x-${texFractionReduite(abs(b * (a - c) - (b - d) * a), abs(a - c))}$.`
                  reponse = `${texFractionReduite(b - d, a - c)}x-${texFractionReduite(abs(b * (a - c) - (b - d) * a), abs(a - c))}`
                }
                if ((b * (a - c) - (b - d) * a) * (a - c) === 0) {
                  texteCorr += `Ainsi, $f(x)=${texFractionReduite(b - d, a - c)}x.`
                  reponse = `${texFractionReduite(b - d, a - c)}x`
                }
              }
            }
            variables.push(a, b, c, d, p)
          }
          break
        case 3:
        default:
          {
            const k1 = randint(-6, 6, 0)
            const k2 = randint(-6, 6, k1)
            const a = randint(1, 10)
            const c = randint(1, 5, [a])
            const p = randint(-9, 9)
            const b = k1 * a + p
            const d = k2 * c + p

            texte = `Déterminer, en détaillant les calculs, l'expression algébrique de la fonction affine $f$ dont la représentation  graphique $\\mathscr{C_f}$ passe par les points $A(${a};${b})$ et $B(${c};${d})$.<br>`
            if (context.isDiaporama) {
              if ((b * (a - c) - (b - d) * a) * (a - c) > 0) {
                texteCorr = ` $f(x)=${texFractionReduite(b - d, a - c)}x+${texFractionReduite(b * (a - c) - (b - d) * a, a - c)}$.`
              }
              if ((b * (a - c) - (b - d) * a) * (a - c) < 0) {
                texteCorr = ` $f(x)=${texFractionReduite(b - d, a - c)}x-${texFractionReduite(abs(b * (a - c) - (b - d) * a), abs(a - c))}$.`
              }
              if ((b * (a - c) - (b - d) * a) * (a - c) === 0) {
                texteCorr = `$f(x)=${texFractionReduite(b - d, a - c)}x.`
              }
            } else {
              texteCorr = `$f$ est une fonction affine, elle a donc une expression de la forme  $f(x)=ax+b$ avec $a$ et $b$ des nombres réels.<br>
                          `
              texteCorr += `Comme $A(${a};${b})\\in \\mathscr{C_f}$, on a  $f(${a})=${b}$  et comme $B(${c};${d})\\in \\mathscr{C_f}$, on a $f(${c})=${d}$ <br>`
              texteCorr +=
                "D'après le cours, on sait que pour $u\\neq v$, $a=\\dfrac{f(u)-f(v)}{u-v}$ <br>"
              texteCorr += `Avec $u=${a}$ et  $v=${c}$, on obtient  :  $a=\\dfrac{f(${a})-f(${c})}{${a}-${ecritureParentheseSiNegatif(c)}}=\\dfrac{${b}-${ecritureParentheseSiNegatif(d)}}{${a}-${ecritureParentheseSiNegatif(c)}}=\\dfrac{${b - d}}{${a - c}}$.<br>`
              texteCorr += `D'où $a=${texFractionReduite(b - d, a - c)}$.<br>`
              if (b === d) {
                // m=0 ; cas f constante
                texteCorr +=
                  '$f$ est une fonction constante, cas particulier des fonctions affines.<br>'
                texteCorr += `On a donc : $f(x)=${b}$`
                reponse = `${b}`
              } else {
                texteCorr +=
                  "On en déduit que la fonction $f$ s'écrit sous la forme : "
                texteCorr += `   $f(x)=${texFractionReduite(b - d, a - c)}x +b.$<br>`
                texteCorr += `${texteGras('Remarque : ')}On obtient $b$ en utilisant (au choix)   une des deux données de l'énoncé, par exemple $f(${a})=${b}$.<br>`
                texteCorr += `Comme $f(x)=${texFractionReduite(b - d, a - c)}x +b$, alors $f(${a})=${texFractionReduite(b - d, a - c)}\\times ${a}+b=${texFractionReduite((b - d) * a, a - c)}+b$. On en déduit :<br><br>`
                texteCorr += `$\\begin{aligned}f(${a})=${b}&\\iff ${texFractionReduite((b - d) * a, a - c)}+b=${b}\\\\`
                texteCorr += `&\\iff b=${b} ${(b - d) * a * (a - c) > 0 ? `${texFractionReduite((b - d) * a * -1, a - c)}` : `+${texFractionReduite(abs((b - d) * a), abs(a - c))}`}\\\\`
                texteCorr += `&\\iff b=${texFractionReduite(b * (a - c) - (b - d) * a, a - c)}\\\\`
                texteCorr += '\\end{aligned}$<br>'
                if ((b * (a - c) - (b - d) * a) * (a - c) > 0) {
                  texteCorr += `Ainsi, $f(x)=${texFractionReduite(b - d, a - c)}x+${texFractionReduite(b * (a - c) - (b - d) * a, a - c)}$.`
                  reponse = `${texFractionReduite(b - d, a - c)}x+${texFractionReduite(b * (a - c) - (b - d) * a, a - c)}`
                }
                if ((b * (a - c) - (b - d) * a) * (a - c) < 0) {
                  texteCorr += `Ainsi, $f(x)=${texFractionReduite(b - d, a - c)}x-${texFractionReduite(abs(b * (a - c) - (b - d) * a), abs(a - c))}$.`
                  reponse = `${texFractionReduite(b - d, a - c)}x-${texFractionReduite(abs(b * (a - c) - (b - d) * a), abs(a - c))}`
                }
                if ((b * (a - c) - (b - d) * a) * (a - c) === 0) {
                  texteCorr += `Ainsi, $f(x)=${texFractionReduite(b - d, a - c)}x.`
                  reponse = `${texFractionReduite(b - d, a - c)}x`
                }
              }
            }
            variables.push(a, b, c, d, p)
          }
          break
      }
      // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
      const textCorrSplit = texteCorr.split('=')
      let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
      aRemplacer = aRemplacer.replace('$', '')

      texteCorr = ''
      for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
        texteCorr += textCorrSplit[ee] + '='
      }
      texteCorr += `$ $${miseEnEvidence(aRemplacer.slice(0, -1))}$` + '.' // Gestion du point final
      // Fin de cette uniformisation

      handleAnswers(this, i, {
        reponse: { value: reponse, options: { fonction: true, variable: 'x' } },
      })
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierDeBaseAvecVariable,
        { texteAvant: '$f(x)=$' },
      )
      variables.push(typesDeQuestions)
      if (this.questionJamaisPosee(i, variables.map(String).join(';'))) {
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
