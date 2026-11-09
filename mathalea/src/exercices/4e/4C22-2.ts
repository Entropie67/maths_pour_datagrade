import {
  addPossibleMultiLinesAnswer,
  baremeMultiLignes,
  besoinFormulaireVerificationMultiLignes,
  commentaireMultiLignes,
} from '../../lib/customElements/PossibleMultiLinesAnswerElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  obtenirListeFractionsIrreductibles,
  texFractionFromString,
  texFractionSigne,
} from '../../lib/outils/deprecatedFractions'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { pgcd } from '../../lib/outils/primalite'
import { fraction } from '../../modules/fractions'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'

export const titre = 'Diviser des fractions'
export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

/**
 * Calcul du quotient de deux fractions. Paramétrages possibles :
 * * 1 : Nombres positifs exclusivement
 * * 2 : nombres relatifs
 * @author Jean-claude Lhote
 * 4C22-2
 */
export const uuid = '55354'

export const refs = {
  'fr-fr': ['4C22-2', 'BP2AutoH14'],
  'fr-ch': ['10LSNO3B-4', '11CTNO2A-4', '11LCNO2A-4', 'PRQNO12B-3'],
}
export default class ExerciceDiviserFractions extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      2,
      ' 1 : Fractions à numérateur et dénominateur positifs \n 2 : Fractions à numérateur et dénominateur relatifs',
    ]
    this.sup = 1 // Avec ou sans relatifs
    this.besoinFormulaire2Numerique = besoinFormulaireVerificationMultiLignes
    this.sup2 = 2
    this.comment = commentaireMultiLignes

    this.consigne = 'Calculer et donner le résultat sous forme irréductible.'
    this.spacing = 2
    this.spacingCorr = 2
    this.nbQuestions = 5
  }

  nouvelleVersion() {
    const listeFractions = obtenirListeFractionsIrreductibles()

    const typesDeQuestionsDisponibles = [parseInt(this.sup)]
    let nombreDeSigneMoins
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (
      let i = 0,
        ab,
        cd,
        p,
        signe,
        texte,
        reponse,
        texteCorr,
        typesDeQuestions,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let a: number = 0
      let b: number = 0
      let c: number = 0
      let d: number = 0
      typesDeQuestions = listeTypeDeQuestions[i]
      do {
        ab = choice(listeFractions)
        cd = choice(listeFractions)
        a = ab[0]
        b = ab[1]
        c = cd[0]
        d = cd[1]
      } while ((a * d) % (b * c) === 0)
      p = pgcd(a * d, b * c)

      switch (typesDeQuestions) {
        case 1: // fraction / fraction tout positif
          texte = `$${texFractionFromString(a, b)}\\div${texFractionFromString(c, d)}$`
          if (p === 1) {
            texteCorr = `$${texFractionFromString(a, b)}\\div${texFractionFromString(
              c,
              d,
            )}=${texFractionFromString(a, b)}\\times${texFractionFromString(d, c)}=${texFractionFromString(
              a + '\\times' + d,
              b + '\\times' + c,
            )}=${texFractionFromString(a * d, b * c)}$`
          } else {
            texteCorr = `$${texFractionFromString(a, b)}\\div${texFractionFromString(
              c,
              d,
            )}=${texFractionFromString(a, b)}\\times${texFractionFromString(d, c)}=${texFractionFromString(
              a + '\\times' + d,
              b + '\\times' + c,
            )}=${texFractionFromString(a * d, b * c)}=${texFractionFromString(
              (a * d) / p + '\\times\\cancel{' + p + '}',
              (b * c) / p + '\\times\\cancel{' + p + '}',
            )}=${texFractionFromString((a * d) / p, (b * c) / p)}$`
          }
          break

        case 2:
        default:
          a = a * randint(-1, 1, [0])
          b = b * randint(-1, 1, [0])
          c = c * randint(-1, 1, [0])
          d = d * randint(-1, 1, [0])
          nombreDeSigneMoins =
            Number(a < 0) + Number(b < 0) + Number(c < 0) + Number(d < 0)
          if (Math.pow(-1, nombreDeSigneMoins) === 1) {
            signe = ''
          } else {
            signe = '-'
          }
          texte = `$${texFractionFromString(a, b)}\\div${texFractionFromString(c, d)}$`
          {
            const texQuotientInitial = `${texFractionFromString(a, b)}\\div${texFractionFromString(c, d)}`
            a = Math.abs(a)
            b = Math.abs(b)
            c = Math.abs(c)
            d = Math.abs(d)
            p = pgcd(a * d, b * c)
            texteCorr = `$${texQuotientInitial}=${signe}${texFractionFromString(
              a,
              b,
            )}\\times${texFractionFromString(d, c)}=${signe}${texFractionFromString(
              a + '\\times' + ecritureParentheseSiNegatif(d),
              b + '\\times' + ecritureParentheseSiNegatif(c),
            )}${
              p === 1
                ? `=${signe}${texFractionSigne(a * d, b * c)}`
                : `=${signe}${texFractionFromString(a * d, b * c)}${
                    a * d !== b * c
                      ? `=${signe}${texFractionFromString(
                          (a * d) / p + '\\times\\cancel{' + p + '}',
                          (b * c) / p + '\\times\\cancel{' + p + '}',
                        )}=${signe}${texFractionFromString((a * d) / p, (b * c) / p)}`
                      : `=${signe}1`
                  }`
            }$`
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
      texteCorr += `$ $${miseEnEvidence(aRemplacer)}$`
      // Fin de cette uniformisation

      reponse = fraction((signe === '-' ? -1 : 1) * a * d, b * c).simplifie()
      if (this.questionJamaisPosee(i, a, b, c, d, typesDeQuestions)) {
        handleAnswers(this, i, {
          reponse: {
            value: reponse.toLatex(),
            options: { fractionIrreductible: true },
          },
        })
        texte += addPossibleMultiLinesAnswer(this, i, {
          prefix: '=',
          style: KeyboardType.clavierDeBaseAvecFraction,
          bareme: baremeMultiLignes(this.sup2),
        })

        if (context.isAmc) {
          texte =
            'Calculer et donner le résultat sous forme irréductible\\\\\n' +
            texte
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
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }

      cpt++
    }
    listeQuestionsToContenu(this) // Espacement de 2 em entre chaque questions.
  }
}
