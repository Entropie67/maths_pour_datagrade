import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { pgcd } from '../../lib/outils/primalite'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

export const titre =
  'Résoudre une équation du premier degré à solutions entières'

/**
 * Équation du premier degré à solutions entières, avec les mêmes formes que 4L20
 * @author Rémi Angot
 * Modifications de 4L20 pour n'avoir que des solutions entières : Jean-claude Lhote
 * Refactorisation et extraction de la fonction génératrice d'équations par Guillaume Valmont le 06/06/2025
 * 4L20-0
 */
export const dateDeModifImportante = '25/09/2026'

export const uuid = '12d4b'

export const refs = {
  'fr-fr': ['4L20-0', 'BP2RES9', 'BP1AUTO020'],
  'fr-ch': ['10LCFA5C-1', '10LSFA5C-1', '11CTFA4C-1', '11LCFA4C-1', '11LSFA4C-1', 'PRQAL05B-1'],
}

/** Opération appliquée aux deux membres, mise en évidence en bleu. */
function operationBleue(operation: string) {
  return miseEnEvidence(sp() + operation, bleuMathalea)
}

/** Étape « on ajoute ou on soustrait b aux deux membres » de gauche + b = droite. */
function etapeConstante(
  gauche: string,
  b: number,
  droite: string,
  correctionDetaillee: boolean,
) {
  let texteCorr = ''
  if (correctionDetaillee) {
    texteCorr +=
      b > 0
        ? `On soustrait $${b}$ aux deux membres.<br>`
        : `On ajoute $${-b}$ aux deux membres.<br>`
  }
  const operation = operationBleue(ecritureAlgebrique(-b))
  texteCorr += `$${gauche}${ecritureAlgebrique(b)}${operation}=${droite}${operation}$<br>`
  return texteCorr
}

/** Étape « on divise les deux membres par a » de a × inconnue = produit. */
function etapeDivision(
  a: number,
  inconnue: string,
  produit: number,
  correctionDetaillee: boolean,
) {
  let texteCorr = ''
  if (correctionDetaillee) {
    texteCorr += `On divise les deux membres par $${a}$.<br>`
  }
  const operation = operationBleue(
    '\\div' + sp() + ecritureParentheseSiNegatif(a),
  )
  texteCorr += `$${a}${inconnue}${operation}=${produit}${operation}$<br>`
  return texteCorr
}

export default class ExerciceEquationASolutionEntiere extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Avec des nombres relatifs']
    this.besoinFormulaire2Texte = [
      "Type d'équations",
      [
        'Nombres séparés par des tirets  :',
        '1 : ax+b=0',
        '2 : ax+b=c',
        '3 : ax=b',
        '4 : x+b=c',
        '5 : ax+b=cx+d',
        '6 : x/a=b',
        '7 : ax/b=c',
        '8 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire3CaseACocher = ['Avec uniquement la lettre $x$']
    this.spacing = 2
    this.spacingCorr = context.isHtml ? 3 : 2
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = context.isHtml
    this.sup = true // Avec des nombres relatifs
    this.sup2 = '1-2-3-4-5' // Choix du type d'équation
    this.sup3 = true
    this.nbQuestions = 6
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? "Résoudre l'équation suivante."
        : 'Résoudre les équations suivantes.'
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 7,
      melange: 8,
      defaut: 8,
      nbQuestions: this.nbQuestions,
      listeOfCase: [
        'ax+b=0',
        'ax+b=c',
        'ax=b',
        'x+b=c',
        'ax+b=cx+d',
        'x/a=b',
        'ax/b=c',
      ],
    })
    const relatifs = Boolean(this.sup)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const inconnue = this.sup3
        ? 'x'
        : choice(['x', 'y', 'z', 'm', 't', 'a', 'b', 'c'])
      let a = 0
      let b = 0
      let c = 0
      let d = 0
      let solution = 0
      let equation = ''
      let texteCorr = ''
      switch (listeTypeDeQuestions[i]) {
        case 'ax+b=0':
        case 'ax+b=c': {
          do {
            a = relatifs ? randint(-9, 9, [-1, 0, 1]) : randint(2, 9)
            solution = relatifs ? randint(-9, 9, [-1, 0, 1]) : randint(2, 9)
            if (listeTypeDeQuestions[i] === 'ax+b=0') {
              // Sans relatifs, l'équation est de la forme ax-b=0
              b = -a * solution
              c = 0
            } else {
              b = relatifs ? randint(-13, 13, [0]) : randint(1, 13)
              c = a * solution + b
            }
          } while (b === 0 || (listeTypeDeQuestions[i] === 'ax+b=c' && c === 0))
          equation = `${a}${inconnue}${ecritureAlgebrique(b)}=${c}`
          texteCorr += etapeConstante(
            `${a}${inconnue}`,
            b,
            String(c),
            this.correctionDetaillee,
          )
          texteCorr += `$${a}${inconnue}=${c - b}$<br>`
          texteCorr += etapeDivision(
            a,
            inconnue,
            c - b,
            this.correctionDetaillee,
          )
          break
        }
        case 'ax=b':
          a = relatifs ? randint(-13, 13, [-1, 0, 1]) : randint(2, 13)
          solution = relatifs ? randint(-9, 9, [-1, 0, 1]) : randint(2, 9)
          b = a * solution
          equation = `${a}${inconnue}=${b}`
          texteCorr += etapeDivision(a, inconnue, b, this.correctionDetaillee)
          break
        case 'x+b=c':
          do {
            // Sans relatifs, b peut être négatif (équation x-b=c) mais la solution et c restent positifs.
            b = relatifs ? randint(-13, 13, [0]) : randint(-9, 9, [0])
            c = relatifs ? randint(-13, 13, [0]) : randint(1, 15)
            solution = c - b
          } while (solution === 0 || (!relatifs && solution < 0))
          equation = `${inconnue}${ecritureAlgebrique(b)}=${c}`
          texteCorr += etapeConstante(
            inconnue,
            b,
            String(c),
            this.correctionDetaillee,
          )
          break
        case 'ax+b=cx+d': {
          if (relatifs) {
            do {
              a = randint(-9, 9, [0])
              c = randint(-9, 9, [0, a])
              solution = randint(-9, 9, [-1, 0, 1])
              b = randint(-13, 13, [0])
              d = (a - c) * solution + b
            } while (
              Math.abs(a - c) < 2 ||
              Math.abs(a - c) > 9 ||
              d === 0 ||
              Math.abs(d) > 60
            )
          } else {
            c = randint(1, 9)
            a = c + randint(2, 6)
            solution = randint(2, 9)
            b = randint(1, 13)
            d = (a - c) * solution + b
          }
          equation = `${reduireAxPlusB(a, b, inconnue)}=${rienSi1(c)}${inconnue}${ecritureAlgebrique(d)}`
          if (this.correctionDetaillee) {
            texteCorr +=
              c > 0
                ? `On soustrait $${rienSi1(c)}${inconnue}$ aux deux membres.<br>`
                : `On ajoute $${rienSi1(-c)}${inconnue}$ aux deux membres.<br>`
          }
          const operation = operationBleue(
            `${c > 0 ? '-' : '+'}${rienSi1(Math.abs(c))}${inconnue}`,
          )
          texteCorr += `$${reduireAxPlusB(a, b, inconnue)}${operation}=${rienSi1(c)}${inconnue}${ecritureAlgebrique(d)}${operation}$<br>`
          texteCorr += `$${reduireAxPlusB(a - c, b, inconnue)}=${d}$<br>`
          texteCorr += etapeConstante(
            `${a - c}${inconnue}`,
            b,
            String(d),
            this.correctionDetaillee,
          )
          texteCorr += `$${rienSi1(a - c)}${inconnue}=${d - b}$<br>`
          texteCorr += etapeDivision(
            a - c,
            inconnue,
            d - b,
            this.correctionDetaillee,
          )
          break
        }
        case 'x/a=b': {
          a = relatifs ? randint(-9, 9, [-1, 0, 1]) : randint(2, 9)
          b = relatifs ? randint(-12, 12, [0]) : randint(1, 12)
          solution = a * b
          equation = `\\dfrac{${inconnue}}{${a}}=${b}`
          if (this.correctionDetaillee) {
            texteCorr += `On multiplie les deux membres par $${a}$.<br>`
          }
          const operation = operationBleue(
            '\\times' + sp() + ecritureParentheseSiNegatif(a),
          )
          texteCorr += `$\\dfrac{${inconnue}}{${a}}${operation}=${b}${operation}$<br>`
          break
        }
        case 'ax/b=c':
        default: {
          // x = b × k donc c = a × k : la solution est entière.
          let k = 0
          do {
            a = randint(2, 5)
            b = randint(5, 9)
            k = randint(1, 4)
          } while (pgcd(a, b) !== 1)
          if (relatifs) {
            a *= choice([-1, 1])
            b *= choice([-1, 1])
            k *= choice([-1, 1])
          }
          solution = b * k
          c = a * k
          equation = `\\dfrac{${a}${inconnue}}{${b}}=${c}`
          if (this.correctionDetaillee) {
            texteCorr += `On multiplie les deux membres par $${b}$.<br>`
          }
          const operation = operationBleue(
            '\\times' + sp() + ecritureParentheseSiNegatif(b),
          )
          texteCorr += `$\\dfrac{${a}${inconnue}}{${b}}${operation}=${c}${operation}$<br>`
          texteCorr += `$${a}${inconnue}=${c * b}$<br>`
          texteCorr += etapeDivision(
            a,
            inconnue,
            c * b,
            this.correctionDetaillee,
          )
          break
        }
      }
      texteCorr = `$${equation}$<br>` + texteCorr
      texteCorr += `$${inconnue}=${solution}$<br>`
      texteCorr += `La solution de l'équation $${equation}$ est $${miseEnEvidence(solution)}$.`

      if (this.questionJamaisPosee(i, listeTypeDeQuestions[i], a, b, c, d)) {
        this.listeQuestions[i] =
          `$${equation}$` +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
            texteAvant: `<br>La solution est : $${inconnue}=$`,
            texteApres: '.',
          })
        this.listeCorrections[i] = texteCorr
        handleAnswers(
          this,
          i,
          { reponse: { value: solution } },
          { signe: relatifs },
        )
        if (!context.isHtml) {
          this.listeCanEnonces[i] = `Résoudre l'équation $${equation}$.`
        }
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
    if (!context.isHtml) {
      this.canEnonce = this.listeCanEnonces[0]
      this.correction = this.listeCorrections[0]
    }
  }
}
