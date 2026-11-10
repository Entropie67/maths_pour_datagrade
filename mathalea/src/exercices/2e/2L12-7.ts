import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { reduireAxPlusByPlusC, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { range1 } from '../../lib/outils/nombres'

export const interactifReady = true

export const titre = 'Soustraire ou additionner des identités remarquables'
export const dateDePublication = '20/11/2025'

/**
 * @author Éric Elter
 */

export const uuid = '8f546'

export const refs = {
  'fr-fr': ['2L12-7'],
  'fr-ch': ['11LSFA3G-8'],
}
export default class DevelopperIdentitesRemarquables6 extends Exercice {
  constructor() {
    super()
    this.comment =
      "Cet exercice propose la somme ou la différence de deux types différents d'identités remarquables. Si vous choisissez deux types identiques, alors votre choix ne sera pas exaucé."
    this.besoinFormulaireNumerique = [
      'Valeur devant $x$',
      2,
      '1 : Égal à 1\n2 : Supérieur à 1',
    ]

    this.besoinFormulaire2Numerique = [
      'Opération entres les deux expressions',
      2,
      '1 : Addition\n2 : Soustraction\n3 : Au hasard',
    ]

    this.besoinFormulaire3Texte = [
      'Première identité remarquable',
      [
        'Nombres séparés par des tirets  :',
        '1 : (a+b)²',
        '2 : (a-b)²',
        '3 : (a+b)(a-b)',
        '4 : Mélange',
      ].join('\n'),
    ]

    this.besoinFormulaire4Texte = [
      'Seconde identité remarquable',
      [
        'Nombres séparés par des tirets  :',
        '1 : (a+b)²',
        '2 : (a-b)²',
        '3 : (a+b)(a-b)',
        '4 : Mélange',
      ].join('\n'),
    ]

    this.nbQuestions = 5
    this.sup = 2
    this.sup2 = 3
    this.sup3 = 4
    this.sup4 = 4

    this.correctionDetailleeDisponible = true
    this.spacingCorr = context.isHtml ? 2 : 1.5
    if (!context.isHtml) {
      this.correctionDetaillee = false
    }
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Développer et réduire les expressions suivantes.'
        : "Développer et réduire l'expression suivante."

    const premiereIdentiteRem = gestionnaireFormulaireTexte({
      nbQuestions: this.nbQuestions,
      saisie: this.sup3,
      max: 3,
      melange: 4,
      defaut: 4,
    }).map(Number)

    const deuxiemeIdentiteRem = gestionnaireFormulaireTexte({
      nbQuestions: this.nbQuestions,
      saisie: this.sup4,
      max: 3,
      melange: 4,
      defaut: 4,
    }).map(Number)

    let listeTypeDeQuestions = [
      ...new Set(
        premiereIdentiteRem.flatMap((m) =>
          deuxiemeIdentiteRem
            .filter((n) => n !== m) // <<< exclusion ici
            .map((n) => 10 * m + n),
        ),
      ),
    ]
    if (listeTypeDeQuestions.length === 0)
      listeTypeDeQuestions = [
        ...new Set(
          range1(3).flatMap((m) =>
            range1(3)
              .filter((n) => n !== m) // <<< exclusion ici
              .map((n) => 10 * m + n),
          ),
        ),
      ]

    listeTypeDeQuestions = combinaisonListes(
      listeTypeDeQuestions,
      this.nbQuestions,
    )
    for (
      let i = 0, texte = '', texteCorr, cpt = 0, a, b, c, d;
      i < this.nbQuestions && cpt < 50;
    ) {
      b = randint(2, 9)
      a = randint(1, 9, [b])
      c = randint(2, 9)
      d = randint(1, 9) /// mettre d à 0 si pas x^2-a^2
      if (this.questionJamaisPosee(i, a, b, c, d)) {
        texteCorr = ''

        const estPlus = // Somme ou Différence
          this.sup2 === 3 ? choice([true, false]) : this.sup2 === 1

        // coefX1 et coefX2 sont les valeurs devant les x
        let coefX1 = 1
        let coefX2 = 1
        if (this.sup === 2) {
          coefX1 = randint(2, 9)
          coefX2 = randint(2, 9)
        }

        // A1, B1 et C1 sont A1x^2+B1x+C1 de la première identité remarquable
        let A1 = 0
        let B1 = 0
        let C1 = 0
        // A2, B2 et C2 sont A2x^2+B2x+C2 de la deuxième identité remarquable
        let A2 = 0
        let B2 = 0
        let C2 = 0

        let expr1Reduite = ''
        let expr2Reduite = ''
        let expr2ReduiteAvecMoins = ''
        let expr2ReduiteAvecBonSigne = ''

        let texte1 = ''
        let texte2 = ''
        switch (listeTypeDeQuestions[i]) {
          case 12: // (x+a)^2 +/- (x-b)^2
            texte1 = choice([
              `(${rienSi1(coefX2)}x+${a})^2`,
              `(${a}+${rienSi1(coefX2)}x)^2`,
            ])
            texte2 = choice([
              `(${rienSi1(coefX1)}x-${b})^2`,
              `(${b}-${rienSi1(coefX1)}x)^2`,
            ])

            A2 = coefX1 * coefX1
            A1 = coefX2 * coefX2
            B2 = -2 * coefX1 * b
            B1 = 2 * coefX2 * a
            C2 = b * b
            C1 = a * a
            break

          case 21: // (x-b)^2 +/- (x+a)^2
            texte1 = choice([
              `(${rienSi1(coefX1)}x-${b})^2`,
              `(${b}-${rienSi1(coefX1)}x)^2`,
            ])
            texte2 = choice([
              `(${rienSi1(coefX2)}x+${a})^2`,
              `(${a}+${rienSi1(coefX2)}x)^2`,
            ])

            A1 = coefX1 * coefX1
            A2 = coefX2 * coefX2
            B1 = -2 * coefX1 * b
            B2 = 2 * coefX2 * a
            C1 = b * b
            C2 = a * a
            break

          case 32: {
            // (x+c)(x-c) +/- (x-b)^2
            const ordre = randint(1, 2) // ordre 1 : x^2-c^2 / ordre 2 : c^2-x^2
            texte1 =
              ordre === 1
                ? choice([
                    `(${rienSi1(coefX1)}x+${c})(${rienSi1(coefX1)}x-${c})`,
                    `(${c}+${rienSi1(coefX1)}x)(${rienSi1(coefX1)}x-${c})`,
                  ])
                : choice([
                    `(${rienSi1(coefX1)}x+${c})(${c}-${rienSi1(coefX1)}x)`,
                    `(${c}+${rienSi1(coefX1)}x)(${c}-${rienSi1(coefX1)}x)`,
                  ])
            texte2 = choice([
              `(${rienSi1(coefX2)}x-${b})^2`,
              `(${b}-${rienSi1(coefX2)}x)^2`,
            ])

            A1 = ordre === 1 ? coefX1 * coefX1 : -coefX1 * coefX1
            A2 = coefX2 * coefX2
            B1 = 0
            B2 = -2 * coefX2 * b
            C1 = ordre === 1 ? -c * c : c * c
            C2 = b * b
            break
          }
          case 23: {
            // (x-b)^2 +/- (x+c)(x-c)
            const ordre = randint(1, 2) // ordre 1 : x^2-c^2 / ordre 2 : c^2-x^2
            texte1 = choice([
              `(${rienSi1(coefX2)}x-${b})^2`,
              `(${b}-${rienSi1(coefX2)}x)^2`,
            ])
            texte2 =
              ordre === 1
                ? choice([
                    `(${rienSi1(coefX1)}x+${c})(${rienSi1(coefX1)}x-${c})`,
                    `(${c}+${rienSi1(coefX1)}x)(${rienSi1(coefX1)}x-${c})`,
                  ])
                : choice([
                    `(${rienSi1(coefX1)}x+${c})(${c}-${rienSi1(coefX1)}x)`,
                    `(${c}+${rienSi1(coefX1)}x)(${c}-${rienSi1(coefX1)}x)`,
                  ])

            A2 = ordre === 1 ? coefX1 * coefX1 : -coefX1 * coefX1
            A1 = coefX2 * coefX2
            B2 = 0
            B1 = -2 * coefX2 * b
            C2 = ordre === 1 ? -c * c : c * c
            C1 = b * b
            break
          }
          case 31: {
            // (x+c)(x-c) +/- (x+a)^2
            const ordre = randint(1, 2) // ordre 1 : x^2-c^2 / ordre 2 : c^2-x^2
            texte1 =
              ordre === 1
                ? choice([
                    `(${rienSi1(coefX1)}x+${c})(${rienSi1(coefX1)}x-${c})`,
                    `(${c}+${rienSi1(coefX1)}x)(${rienSi1(coefX1)}x-${c})`,
                  ])
                : choice([
                    `(${rienSi1(coefX1)}x+${c})(${c}-${rienSi1(coefX1)}x)`,
                    `(${c}+${rienSi1(coefX1)}x)(${c}-${rienSi1(coefX1)}x)`,
                  ])
            texte2 = choice([
              `(${rienSi1(coefX2)}x+${a})^2`,
              `(${a}+${rienSi1(coefX2)}x)^2`,
            ])

            A1 = ordre === 1 ? coefX1 * coefX1 : -coefX1 * coefX1
            A2 = coefX2 * coefX2
            B1 = 0
            B2 = 2 * coefX2 * a
            C1 = ordre === 1 ? -c * c : c * c
            C2 = a * a
            break
          }
          case 13: {
            // (x+a)^2 +/- (x+c)(x-c)
            const ordre = randint(1, 2) // ordre 1 : x^2-c^2 / ordre 2 : c^2-x^2
            texte1 = choice([
              `(${rienSi1(coefX2)}x+${a})^2`,
              `(${a}+${rienSi1(coefX2)}x)^2`,
            ])
            texte2 =
              ordre === 1
                ? choice([
                    `(${rienSi1(coefX1)}x+${c})(${rienSi1(coefX1)}x-${c})`,
                    `(${c}+${rienSi1(coefX1)}x)(${rienSi1(coefX1)}x-${c})`,
                  ])
                : choice([
                    `(${rienSi1(coefX1)}x+${c})(${c}-${rienSi1(coefX1)}x)`,
                    `(${c}+${rienSi1(coefX1)}x)(${c}-${rienSi1(coefX1)}x)`,
                  ])

            A2 = ordre === 1 ? coefX1 * coefX1 : -coefX1 * coefX1
            A1 = coefX2 * coefX2
            B2 = 0
            B1 = 2 * coefX2 * a
            C2 = ordre === 1 ? -c * c : c * c
            C1 = a * a
            break
          }
        }

        // A, B et C sont Ax^2+Bx+C de la réponse finale
        const A = estPlus ? A1 + A2 : A1 - A2
        const B = estPlus ? B1 + B2 : B1 - B2
        const C = estPlus ? C1 + C2 : C1 - C2

        expr1Reduite = reduireAxPlusByPlusC(A1, B1, C1, 'x^2', 'x')
        expr2Reduite = reduireAxPlusByPlusC(A2, B2, C2, 'x^2', 'x')
        expr2ReduiteAvecMoins = reduireAxPlusByPlusC(-A2, -B2, -C2, 'x^2', 'x')
        expr2ReduiteAvecBonSigne = estPlus
          ? expr2Reduite.slice(0, 1) === '-'
            ? expr2Reduite
            : '+' + expr2Reduite
          : expr2ReduiteAvecMoins.slice(0, 1) === '-'
            ? expr2ReduiteAvecMoins
            : '+' + expr2ReduiteAvecMoins

        texte = `$${texte1} ${estPlus ? '+' : '-'} ${texte2}$`

        if (this.correctionDetaillee) {
          texteCorr += `On développe $${texte1}$.<br>`
          texteCorr += `$${texte1} = ${expr1Reduite}$<br>`

          texteCorr += `On développe $${texte2}$.<br>`
          texteCorr += `$${texte2} = ${expr2Reduite}$<br>`

          texteCorr += estPlus
            ? `Puis on additionne.<br>`
            : `Puis on soustrait.<br>`
        }

        texteCorr += `${texte.slice(0, -1)} = (${expr1Reduite}) ${estPlus ? '+' : '-'} (${expr2Reduite})$<br>`
        texteCorr += `${texte.slice(0, -1)} = ${expr1Reduite} ${expr2ReduiteAvecBonSigne}$<br>`

        const reponse = reduireAxPlusByPlusC(A, B, C, 'x^2', 'x')
        texteCorr += `${texte.slice(0, -1)} = ${reponse}$`

        if (this.interactif) {
          handleAnswers(this, i, {
            reponse: {
              value: `${reponse}`,
              options: { expressionsForcementReduites: true },
            },
          })
          texte +=
            ' $=$ ' +
            ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecVariable,
            )
        }

        const textCorrSplit = texteCorr.split('=')
        let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
        aRemplacer = aRemplacer.replaceAll('$', '')

        texteCorr = ''
        for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
          texteCorr += textCorrSplit[ee] + '='
        }
        texteCorr += ` ${miseEnEvidence(aRemplacer)}$`

        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
