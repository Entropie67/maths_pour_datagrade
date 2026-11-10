import {
  addPossibleMultiLinesAnswer,
  baremeMultiLignes,
  besoinFormulaireVerificationMultiLignes,
  commentaireMultiLignes,
} from '../../lib/customElements/PossibleMultiLinesAnswerElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  simplificationDeFractionAvecEtapes,
  texFractionFromString,
} from '../../lib/outils/deprecatedFractions'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { orangeMathalea } from '../../lib/colors'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd, ppcm } from '../../lib/outils/primalite'
import { fraction } from '../../modules/fractions'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { context } from '../../modules/context'

export const titre = 'Additionner deux fractions'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDeModifImportante = '31/08/2024'
/**
 * Effectuer la somme de deux fractions
 *
 * * Niveau 1 : 4 fois sur 5 un dénominateur est un multiple de l'autre et une fois sur 5 il faut additionner une fraction et un entier
 * * Niveau 2 : 2 fois sur 5, il faut trouver le ppcm, 1 fois sur 5 le ppcm correspond à leur produit, 1 fois sur 5 un dénominateur est multiple de l'autre, 1 fois sur 5 il faut additionner une fraction et un entier
 * * Paramètre supplémentaire : utiliser des nommbres relatifs (par défaut tous les nombres sont positifs)
 * @author Rémi Angot
 */
export const uuid = '5e8fc'

export const refs = {
  'fr-fr': ['4C21-1', 'BP2AutoH10'],
  'fr-ch': ['9R3NO4J-7', '10CTNO3A-7', '10LCNO3A-7', '10LSNO3A-7', 'PRQNO12A-6'],
}
export default class ExerciceAdditionnerDesFractions extends Exercice {
  constructor() {
    super()
    this.sup = 2 // Niveau de difficulté
    this.sup2 = false // Avec ou sans relatifs
    this.sup3 = false // Fraction irréductible attendue
    this.sup4 = 2

    this.spacing = 2
    this.spacingCorr = 2
    this.nbQuestions = 5

    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      2,
      "1 : Un dénominateur multiple de l'autre\n2 : Cas général",
    ]
    this.besoinFormulaire2CaseACocher = ['Avec des nombres relatifs']
    this.besoinFormulaire3CaseACocher = ['Fraction irréductible attendue']
    this.besoinFormulaire4Numerique = besoinFormulaireVerificationMultiLignes
    this.comment = commentaireMultiLignes
  }

  nouvelleVersion() {
    const listeCouplesDeDenominateurs = [
      [6, 9],
      [4, 6],
      [8, 12],
      [9, 12],
      [10, 15],
      [10, 25],
      [6, 21],
      [12, 30],
      [6, 8],
      [50, 75],
    ]
    this.consigne = `Calculer et donner le résultat sous la forme d'une fraction${this.sup3 ? ' simplifiée au maximum.' : '.'}`
    let typesDeQuestionsDisponibles
    if (this.sup === 1) {
      typesDeQuestionsDisponibles = [
        'b_multiple_de_d',
        'd_multiple_de_b',
        'b_multiple_de_d',
        'd_multiple_de_b',
        'entier',
      ]
    } else {
      typesDeQuestionsDisponibles = [
        'ppcm',
        'ppcm',
        'premiers_entre_eux',
        choice(['b_multiple_de_d', 'd_multiple_de_b']),
        'entier',
      ]
    }
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    for (
      let i = 0,
        a,
        b,
        c,
        d,
        texte,
        texteCorr,
        reponse,
        couplesDeDenominateurs,
        typesDeQuestions;
      i < this.nbQuestions;
      i++
    ) {
      typesDeQuestions = listeTypeDeQuestions[i]
      let k1 = 0
      let k2 = 0
      let k = 0
      let num = 0
      let den = 1
      switch (typesDeQuestions) {
        case 'ppcm':
          couplesDeDenominateurs = choice(listeCouplesDeDenominateurs)
          if (choice([true, false])) {
            b = couplesDeDenominateurs[0]
            d = couplesDeDenominateurs[1]
          } else {
            b = couplesDeDenominateurs[1]
            d = couplesDeDenominateurs[0]
          }
          k1 = ppcm(b, d) / b
          k2 = ppcm(b, d) / d
          break

        case 'premiers_entre_eux':
          b = randint(2, 9)
          d = randint(2, 9)
          while (pgcd(b, d) !== 1) {
            b = randint(2, 9)
            d = randint(2, 9)
          }
          k1 = ppcm(b, d) / b
          k2 = ppcm(b, d) / d
          break

        case 'd_multiple_de_b':
          b = randint(2, 9)
          k = randint(2, 11)
          d = b * k
          break

        case 'b_multiple_de_d':
        default:
          d = randint(2, 9)
          k = randint(2, 11)
          b = d * k
          break
      }

      a = randint(1, 9, [b])
      c = randint(1, 9, [d])
      if (this.sup2) {
        // si les numérateurs sont relatifs
        a = a * choice([-1, 1])
        c = c * choice([-1, 1])
      }
      texte = `$${texFractionFromString(a, b)}+${texFractionFromString(c, d)}$`
      texteCorr = `$${texFractionFromString(a, b)}+${texFractionFromString(c, d)}`

      // a/b+c/d = num/den (résultat non simplifié)
      if (
        typesDeQuestions === 'ppcm' ||
        typesDeQuestions === 'premiers_entre_eux'
      ) {
        texteCorr += `=${texFractionFromString(a + miseEnEvidence('\\times ' + k1), b + miseEnEvidence('\\times ' + k1))}+${texFractionFromString(c + miseEnEvidence('\\times ' + k2), d + miseEnEvidence('\\times ' + k2))}`
        // texteCorr += `=${texFraction(a*k1,b*k1)}+${texFraction(c*k2,d*k2)}`;
        num = a * k1 + c * k2
        den = b * k1
        texteCorr += `=${texFractionFromString(a * k1 + '+' + ecritureParentheseSiNegatif(c * k2), den)}`
      }

      if (typesDeQuestions === 'd_multiple_de_b') {
        texteCorr += `=${texFractionFromString(a + miseEnEvidence('\\times ' + k), b + miseEnEvidence('\\times ' + k))}+${texFractionFromString(c, d)}`
        // texteCorr += `=${texFraction(a*k1,b*k1)}+${texFraction(c*k2,d*k2)}`;
        num = a * k + c
        den = b * k
        texteCorr += `=${texFractionFromString(a * k + '+' + ecritureParentheseSiNegatif(c), den)}`
      }

      if (typesDeQuestions === 'b_multiple_de_d') {
        texteCorr += `=${texFractionFromString(a, b)}+${texFractionFromString(c + miseEnEvidence('\\times ' + k), d + miseEnEvidence('\\times ' + k))}`
        // texteCorr += `=${texFraction(a*k1,b*k1)}+${texFraction(c*k2,d*k2)}`;
        num = a + c * k
        den = b
        texteCorr += `=${texFractionFromString(a + '+' + ecritureParentheseSiNegatif(c * k), den)}`
      }

      if (typesDeQuestions === 'entier') {
        a = randint(1, 9)
        b = randint(2, 9, [a])
        let n = randint(1, 9)
        if (this.sup2) {
          a = a * choice([-1, 1])
          n = n * choice([-1, 1])
        }
        if (choice([true, false])) {
          texte = `$${n}+${texFractionFromString(a, b)}$`
          texteCorr = texte
          texteCorr += `$=${texFractionFromString(n + '\\times ' + b, b)}+${texFractionFromString(a, b)}`
          texteCorr += `=${texFractionFromString(n * b + '+' + ecritureParentheseSiNegatif(a), b)}`
        } else {
          texte = `$${texFractionFromString(a, b)}+${ecritureParentheseSiNegatif(n)}$`
          texteCorr = texte
          texteCorr += `$=${texFractionFromString(a, b)}+${texFractionFromString(n + '\\times ' + b, b)}`
          texteCorr += `=${texFractionFromString(a + '+' + ecritureParentheseSiNegatif(n * b), b)}`
        }
        num = n * b + a
        den = b
      }
      texteCorr += `=${texFractionFromString(num, den)}`
      texteCorr += simplificationDeFractionAvecEtapes(num, den, {
        couleur2: orangeMathalea,
      }) + '$'
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

      reponse = fraction(num, den).simplifie()
      handleAnswers(this, i, {
        reponse: {
          value: reponse.toLatex(),
          options: {
            fractionEgale: !this.sup3,
            fractionIrreductible: this.sup3,
          },
        },
      })
      texte += addPossibleMultiLinesAnswer(this, i, {
        prefix: '=',
        style: KeyboardType.clavierDeBaseAvecFraction,
        bareme: baremeMultiLignes(this.sup4),
      })

      if (context.isAmc) {
        texte =
          'Calculer et donner le résultat sous forme irréductible\\\\\n' + texte
        this.autoCorrectionAMC[i] = {
          enonce: texte, // Si vide, l'énoncé est celui de l'exercice.
          propositions: [
            {
              texte: '', // Si vide, le texte est la correction de l'exercice.
            },
          ],
          reponse: {
            valeur: reponse, // obligatoire (la réponse numérique à comparer à celle de l'élève), NE PAS METTRE DE STRING à virgule ! 4.9 et non pas 4,9. Cette valeur doit être passée dans un tableau d'où la nécessité des crochets.
            param: {
              digits: 5,
              digitsNum: 3,
              digitsDen: 2,
              signe: true,
            },
          },
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }

      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
    }
    listeQuestionsToContenu(this) // Espacement de 2 em entre chaque questions.
  }
}
