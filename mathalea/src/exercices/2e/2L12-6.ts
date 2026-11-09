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
import {
  ecritureAlgebriqueSauf1,
  reduireAxPlusByPlusC,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'

export const interactifReady = true

export const titre = "Développer à l'aide des identités remarquables"
export const dateDePublication = '19/11/2025'

/**
 * @author Éric Elter
 */

export const uuid = '7bd4f'

export const refs = {
  'fr-fr': ['2L12-6', 'BP1AUTO079'],
  'fr-ch': ['11LSFA3G-7'],
}

export default class DevelopperIdentitesRemarquables5 extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      "Valeur devant $x$ de l'identité remarquable",
      2,
      '1 : Égal à 1\n2 : Supérieur à 1',
    ]

    this.besoinFormulaire2Texte = [
      "Type d'identités remarquables",
      [
        'Nombres séparés par des tirets  :',
        '1 : (a+b)²',
        '2 : (a-b)²',
        '3 : (a+b)(a-b)',
        '4 : Mélange',
      ].join('\n'),
    ]

    this.besoinFormulaire3Texte = [
      'Opération avant ou après identité remarquable',
      [
        'Nombres séparés par des tirets  :',
        '1 : Addition',
        '2 : Soustraction',
        '3 : Multiplication',
        '4 : Mélange',
      ].join('\n'),
    ]

    this.besoinFormulaire4Texte = [
      'Valeur hors identité remarquable',
      [
        'Nombres séparés par des tirets  :',
        '1 : Constante',
        '2 : Affine',
        '3 : Quadratique',
        '4 : Mélange',
      ].join('\n'),
    ]

    this.comment =
      "Derrière ou devant l'identité remarquable, quand il s'agit d'une différence ou d'un somme, il y a un terme qui est soit constant $c$, soit affine $cx$, soit quadratique $x^2$.<br>"
    this.comment +=
      "Ce choix s'effectue avec le 4ème paramètre mais n'a pas d'effet lorsqu'il s'agit d'un produit car le facteur est toujours une constante."
    this.nbQuestions = 5
    this.sup = 2
    this.sup2 = '4'
    this.sup3 = '4'
    this.sup4 = '4'

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

    const listeTypeDIdentites = gestionnaireFormulaireTexte({
      nbQuestions: this.nbQuestions,
      saisie: this.sup2,
      max: 3,
      melange: 4,
      defaut: 4,
    }).map(Number)

    const listeTypeDOperations = gestionnaireFormulaireTexte({
      nbQuestions: this.nbQuestions,
      saisie: this.sup3,
      max: 3,
      melange: 4,
      defaut: 4,
    }).map(Number)

    let listeTypeDeQuestions = [
      ...new Set(
        listeTypeDIdentites.flatMap((m) =>
          listeTypeDOperations.map((n) => 10 * m + n),
        ),
      ),
    ]

    listeTypeDeQuestions = combinaisonListes(
      listeTypeDeQuestions,
      this.nbQuestions,
    )

    let listeTypeConstante = gestionnaireFormulaireTexte({
      nbQuestions: this.nbQuestions,
      saisie: this.sup4,
      max: 3,
      melange: 4,
      defaut: 4,
      listeOfCase: [0, 1, 2],
    }).map(Number)

    listeTypeConstante = combinaisonListes(listeTypeConstante, this.nbQuestions)

    for (
      let i = 0, texte = '', texteCorr, cpt = 0, a, b, c, typesDeQuestions;
      i < this.nbQuestions && cpt < 50;
    ) {
      typesDeQuestions = listeTypeDeQuestions[i]
      b = this.sup === 1 ? 1 : randint(2, 9)
      a = randint(1, 9, [b])
      c = randint(2, 9)

      if (this.questionJamaisPosee(i, typesDeQuestions, a, b, c)) {
        texteCorr = ''
        const coefFinaux = [0, 0, 0] // C[0]x^2 + C[1]x + C[0]
        const cEstAGauche = choice([true, false]) // Choix c+identiteR ou identiteR+c
        const estInverse = choice([true, false]) // Choix entre (bx+a)^2 et (a+bx)^2
        let identiteRemarquable = ''
        let IRdeveloppee = ''
        let IRdeveloppeeSignee = ''
        let expressionAvecC = ''
        switch (typesDeQuestions) {
          case 11: // c + (bx+a)², cx + (bx+a)², cx² + (bx+a)², (bx+a)² + c, (bx+a)² + cx, (bx+a)² + cx²
            coefFinaux[0] = b * b
            coefFinaux[1] = 2 * b * a
            coefFinaux[2] = a * a
            break

          case 12: // c - (bx+a)², cx - (bx+a)², cx² - (bx+a)², (bx+a)² - c, (bx+a)² - cx, (bx+a)² - cx²
            coefFinaux[0] = cEstAGauche ? -b * b : b * b
            coefFinaux[1] = cEstAGauche ? -2 * b * a : 2 * b * a
            coefFinaux[2] = cEstAGauche ? -a * a : a * a
            break

          case 13: // c × (bx+a)²   ou   (bx+a)² × c
            coefFinaux[0] = c * b * b
            coefFinaux[1] = c * 2 * b * a
            coefFinaux[2] = c * a * a
            break

          case 21: // c + (bx-a)², cx + (bx-a)², cx² + (bx-a)², (bx-a)² + c, (bx-a)² + cx, (bx-a)² + cx²
            coefFinaux[0] = b * b
            coefFinaux[1] = -2 * b * a
            coefFinaux[2] = a * a
            break

          case 22: // c - (bx-a)², cx - (bx-a)², cx² - (bx-a)², (bx-a)² - c, (bx-a)² - cx, (bx-a)² - cx²
            coefFinaux[0] = cEstAGauche ? -b * b : b * b
            coefFinaux[1] = cEstAGauche ? 2 * b * a : -2 * b * a
            coefFinaux[2] = cEstAGauche ? -a * a : a * a
            break

          case 23: // c × (bx-a)²   ou   (bx-a)² × c
            coefFinaux[0] = c * b * b
            coefFinaux[1] = -c * 2 * b * a
            coefFinaux[2] = c * a * a
            break

          case 31: // c + (bx-a)(bx+a), cx + (bx-a)(bx+a), cx² + (bx-a)(bx+a)
            coefFinaux[0] = estInverse ? b * b : -b * b
            coefFinaux[1] = 0
            coefFinaux[2] = estInverse ? -a * a : a * a
            break

          case 32: // c - (bx-a)(bx+a), cx - (bx-a)(bx+a), cx² - (bx-a)(bx+a), (bx-a)(bx+a) - c, (bx-a)(bx+a) - cx, (bx-a)(bx+a) - cx²
            coefFinaux[0] =
              (estInverse && !cEstAGauche) || (!estInverse && cEstAGauche)
                ? b * b
                : -b * b
            coefFinaux[1] = 0
            coefFinaux[2] =
              (estInverse && !cEstAGauche) || (!estInverse && cEstAGauche)
                ? -a * a
                : a * a

            break

          case 33: // c × (bx-a)(bx+a)
            coefFinaux[0] = estInverse ? c * b * b : -c * b * b
            coefFinaux[1] = 0
            coefFinaux[2] = estInverse ? -c * a * a : c * a * a
            break
        }

        expressionAvecC = `${c}`
        expressionAvecC +=
          listeTypeConstante[i] === 0
            ? ''
            : listeTypeConstante[i] === 1
              ? 'x'
              : 'x^2'

        switch (
          Math.floor(typesDeQuestions / 10) // Selon le type d'IR
        ) {
          case 1: // (bx+a)² // 11, 12 et 13
            identiteRemarquable = estInverse
              ? `(${a}+${rienSi1(b)}x)^2`
              : `(${rienSi1(b)}x+${a})^2`

            IRdeveloppee = `${rienSi1(b * b)}x^2 + ${2 * b * a}x + ${a * a}`
            IRdeveloppee = `${rienSi1(b * b)}x^2 + ${2 * b * a}x + ${a * a}`

            IRdeveloppeeSignee = `${ecritureAlgebriqueSauf1(-b * b)}x^2 - ${2 * a * b}x - ${a * a}`

            if (this.correctionDetaillee) {
              texteCorr = `On développe $${identiteRemarquable}$ en utilisant l'identité remarquable $(a+b)^2=a^2+2ab+b^2$.<br>`
            }
            break

          case 2: // (bx-a)² // 21, 22 et 23
            identiteRemarquable = estInverse
              ? `(${a}-${rienSi1(b)}x)^2`
              : `(${rienSi1(b)}x-${a})^2`

            IRdeveloppee = `${rienSi1(b * b)}x^2 - ${2 * b * a}x + ${a * a}`

            IRdeveloppeeSignee = `${ecritureAlgebriqueSauf1(-b * b)}x^2 + ${2 * a * b}x - ${a * a}`

            if (this.correctionDetaillee) {
              texteCorr = `On développe $${identiteRemarquable}$ en utilisant l'identité remarquable $(a-b)^2=a^2-2ab+b^2$.<br>`
            }
            break

          case 3: {
            // 31, 32 et 33
            // (bx-a)(bx+a)
            const estInverse2 = choice([true, false])
            const first = estInverse
              ? `(${rienSi1(b)}x-${a})`
              : `(${a}-${rienSi1(b)}x)`
            const second = estInverse2
              ? `(${rienSi1(b)}x+${a})`
              : `(${a}+${rienSi1(b)}x)`

            const sensIR = choice([true, false])
            identiteRemarquable = sensIR
              ? `${first}${second}`
              : `${second}${first}`

            IRdeveloppee = estInverse
              ? `${rienSi1(b * b)}x^2 - ${a * a}`
              : `-${rienSi1(b * b)}x^2 + ${a * a}`

            IRdeveloppeeSignee =
              (typesDeQuestions === 32 &&
                ((estInverse && cEstAGauche) ||
                  (!estInverse && !cEstAGauche))) ||
              (typesDeQuestions === 31 &&
                ((estInverse && !cEstAGauche) || (!estInverse && cEstAGauche)))
                ? `${ecritureAlgebriqueSauf1(-b * b)}x^2 + ${a * a}`
                : `${ecritureAlgebriqueSauf1(b * b)}x^2 - ${a * a}`

            if (this.correctionDetaillee) {
              texteCorr = `On développe $${identiteRemarquable}$ en utilisant $(a-b)(a+b)=a^2-b^2$.<br>`
            }
            break
          }
        }

        if (this.correctionDetaillee) {
          texteCorr += `$${identiteRemarquable} = ${IRdeveloppee}$<br>`
          texteCorr += `Puis on remplace.<br>`
        }

        switch (
          typesDeQuestions % 10 // Selon le type d'opération avant ou près l'IR
        ) {
          case 1:
            texte = cEstAGauche // Comme 11, 21 et 31
              ? `$${expressionAvecC}+${identiteRemarquable}$`
              : `$${identiteRemarquable}+${expressionAvecC}$`

            texteCorr += cEstAGauche
              ? `${texte.slice(0, -1)}  = ${expressionAvecC} + (${IRdeveloppee}) = ${expressionAvecC} ${IRdeveloppee[0] === '-' ? '' : '+'}${IRdeveloppee} `
              : `${texte.slice(0, -1)}  = (${IRdeveloppee}) + ${expressionAvecC} = ${IRdeveloppee} + ${expressionAvecC} `
            break

          case 2:
            texte = cEstAGauche // Comme 12, 22 et 32
              ? `$${expressionAvecC}-${identiteRemarquable}$`
              : `$${identiteRemarquable}-${expressionAvecC}$`

            texteCorr += cEstAGauche
              ? `${texte.slice(0, -1)}  = ${expressionAvecC}-(${IRdeveloppee}) =${expressionAvecC} ${IRdeveloppeeSignee} `
              : `${texte.slice(0, -1)}  = (${IRdeveloppee})-${expressionAvecC} =${IRdeveloppee} -${expressionAvecC}`
            break

          case 3:
            texte = cEstAGauche // Comme 13, 23 et 33
              ? `$${c}${identiteRemarquable}$`
              : `$${identiteRemarquable}\\times${c}$`

            texteCorr += cEstAGauche
              ? `${texte.slice(0, -1)}=${c}\\times(${IRdeveloppee})`
              : `${texte.slice(0, -1)}=(${IRdeveloppee})\\times${c}`
            break
        }

        const indice = 2 - listeTypeConstante[i]
        coefFinaux[indice] =
          typesDeQuestions % 10 === 1 // c + IR OU IR + c
            ? coefFinaux[indice] + c
            : typesDeQuestions % 10 === 2 // c - IR OU IR - c
              ? (coefFinaux[indice] = cEstAGauche
                  ? // ? c - coefFinaux[indice]
                    c + coefFinaux[indice]
                  : coefFinaux[indice] - c)
              : coefFinaux[indice] // c × IR OU IR × c

        texteCorr += `= ${reduireAxPlusByPlusC(coefFinaux[0], coefFinaux[1], coefFinaux[2], 'x^2', 'x')}$`

        if (this.interactif) {
          handleAnswers(this, i, {
            reponse: {
              value: `${reduireAxPlusByPlusC(coefFinaux[0], coefFinaux[1], coefFinaux[2], 'x^2', 'x')}`,
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
