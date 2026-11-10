import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  obtenirListeFractionsIrreductibles,
  obtenirListeFractionsIrreductiblesFaciles,
  produitDeDeuxFractions,
  simplificationDeFractionAvecEtapes,
  texFractionFromString,
} from '../../lib/outils/deprecatedFractions'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { pgcd, ppcm } from '../../lib/outils/primalite'
import { context } from '../../modules/context'
import type FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

// parenthèses autour d'un entier négatif placé après une opération
const fractionParenthese = (a: number | string, b: number | string) => {
  const texte = texFractionFromString(a, b)
  return texte.startsWith('-') ? `(${texte})` : texte
}

export const titre =
  'Effectuer des calculs avec des fractions et les priorités opératoires'
export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

/** Styles d'expressions :
 1 : Fractions faciles, tout enchaînement d'opérations possibles
 2 : Fractions standards, tout enchaînement d'opérations possibles
 3 : Des expressions pièges démarrant sur une opération prioritaire ou pas
 4 : Uniquement des expressions pièges démarrant sur une opération non prioritaire`
 * @author Jean-claude Lhote
 */
export const uuid = '18ddd'

export const refs = {
  'fr-fr': ['4C23-1', 'BP2AutoH18'],
  'fr-ch': ['10LSNO3C-3', '11CTNO2B-3', '11LCNO2B-3', 'PRQNO13C-1'],
}
export default class ExerciceAdditionnerFractionProduit extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      "Style d'expressions",
      4,
      ` 1 : Fractions faciles, tout enchaînement d'opérations possibles
  2 : Fractions standards, tout enchaînement d'opérations possibles
  3 : Des expressions pièges démarrant sur une opération prioritaire ou pas
  4 : Uniquement des expressions pièges démarrant sur une opération non prioritaire`,
    ]
    this.besoinFormulaire2CaseACocher = ['Utiliser les nombres relatifs', false]
    this.besoinFormulaire3CaseACocher = ['Utiliser les divisions', true]
    this.besoinFormulaire4CaseACocher = [
      'Présentation des calculs en colonnes',
      true,
    ]
    this.sup = 3
    this.sup2 = false
    this.sup3 = true
    this.sup4 = true

    this.consigne = 'Calculer et donner un résultat simplifié au maximum.'
    this.nbCols = 2

    this.spacingCorr = 2
    this.nbQuestions = 6
    this.nbColsCorr = this.sup4 ? 2 : 1
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = false
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles
    const listeFractions = obtenirListeFractionsIrreductibles() as [
      number,
      number,
    ][]
    const listeFractionsFaciles =
      obtenirListeFractionsIrreductiblesFaciles() as [number, number][]
    let piegeObligatoire = false

    // Définition des styles d'exercices
    switch (this.sup) {
      case 1: // Fractions faciles, tout enchaînement d'opérations possibles
        typesDeQuestionsDisponibles = [1, 2]
        break

      case 2: // Fractions standards, tout enchaînement d'opérations possibles
        typesDeQuestionsDisponibles = [1, 2]
        break

      case 3: // Uniquement expressions pièges démarrant sur une opération prioritaire *ou pas*
        typesDeQuestionsDisponibles = [1, 2]
        piegeObligatoire = true
        break

      case 4: // Uniquement des expressions pièges démarrant sur une opération non prioritaire`
        typesDeQuestionsDisponibles = [1]
        piegeObligatoire = true
        break

      default: // En cas de pépin…
        typesDeQuestionsDisponibles = [1]
        break
    }
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      const typesDeQuestions = listeTypeDeQuestions[i]
      let ab: [number, number]
      let cd: [number, number]
      let ef: [number, number]

      if (this.sup === 1) {
        ab = choice(listeFractionsFaciles)
        cd = choice(listeFractionsFaciles)
        ef = choice(listeFractionsFaciles)
      } else {
        ab = choice(listeFractions)
        cd = choice(listeFractions)
        ef = choice(listeFractions)
      }

      let [a, b] = ab
      let [c, d] = cd
      let [e, f] = ef

      if (this.sup2) {
        ;[a, b, c, d, e, f] = [a, b, c, d, e, f].map(
          (e) => e * randint(-1, 1, [0]),
        )
      }
      let produit: [string, string, [number, number, number, number]]
      const operation1 = randint(0, 1) // Pioche la soustraction (0) ou l'addition (1)
      const operation2 = this.sup3 ? randint(0, 1) : 1 // Si l'option est cochée, Pioche la division (0) ou la multiplication (1)
      const texteOperation1 = operation1 ? '+' : '-'
      const texteOperation2 = operation2 ? ' \\times ' : ' \\div '
      texte = ''
      let p: number
      let k1: number
      let k2: number
      let reponse: FractionEtendue
      switch (typesDeQuestions) {
        case 1: // De la forme : « a⁄b ± c⁄d ×÷ e⁄f »
          if (piegeObligatoire) {
            d = b
          }

          texte += `$${texFractionFromString(a, b)} ${texteOperation1} ${fractionParenthese(c, d)} ${texteOperation2} ${fractionParenthese(e, f)}$`

          texteCorr = `$${texFractionFromString(a, b)} ${texteOperation1} ${fractionParenthese(c, d)} ${texteOperation2} ${fractionParenthese(e, f)}`
          if (!operation2) {
            // Si il y a division, multiplier par l'inverse du diviseur
            ;[e, f] = [f, e]
            texteCorr += `=${texFractionFromString(a, b)} ${texteOperation1} ${fractionParenthese(c, d)} \\times ${texFractionFromString(e, f)}`
          }
          produit = produitDeDeuxFractions(c, d, e, f)
          if (this.correctionDetaillee) {
            texteCorr += `=${texFractionFromString(a, b)} ${texteOperation1} ${texFractionFromString(c + '\\times' + ecritureParentheseSiNegatif(e), d + '\\times' + ecritureParentheseSiNegatif(f))}`
            texteCorr += `=${texFractionFromString(a, b)} ${texteOperation1} ${fractionParenthese(c * e, d * f)}`
          } else {
            texteCorr += `=${texFractionFromString(a, b)} ${texteOperation1} ${produit[1]}`
            texteCorr += `=${texFractionFromString(a, b)} ${texteOperation1} ${produit[0]}`
          }

          // faut-il simplifier c×e⁄d×f ?
          if (!this.correctionDetaillee) {
            ;[c, d, e, f] = produit[2]
          }
          p = pgcd(c * e, d * f)
          if (p !== 1 && ppcm(b, d * f) > ppcm(b, (d * f) / p)) {
            texteCorr += `=${texFractionFromString(a, b)} ${texteOperation1} ${texFractionFromString(
              (e * c) / p +
                '\\times\\cancel{' +
                ecritureParentheseSiNegatif(p) +
                '}',
              (f * d) / p +
                '\\times\\cancel{' +
                ecritureParentheseSiNegatif(p) +
                '}',
            )}`
            c = (e * c) / p
            d = (f * d) / p
          } else {
            c = e * c
            d = f * d
          }
          p = ppcm(b, d) // p = dénominateur commun
          k1 = p / b
          k2 = p / d
          if (k1 !== 1) {
            texteCorr += `=${texFractionFromString(a + miseEnEvidence('\\times' + ecritureParentheseSiNegatif(k1)), b + miseEnEvidence('\\times' + ecritureParentheseSiNegatif(k1)))}`
          } else {
            if (k2 !== 1) {
              texteCorr += `=${texFractionFromString(a, b)}`
            }
          }
          if (k2 !== 1) {
            texteCorr += ` ${texteOperation1} ${texFractionFromString(c + miseEnEvidence('\\times' + ecritureParentheseSiNegatif(k2)), d + miseEnEvidence('\\times' + ecritureParentheseSiNegatif(k2)))}`
          } else {
            if (k1 !== 1) {
              texteCorr += ` ${texteOperation1} ${fractionParenthese(c, d)}`
            }
          }

          texteCorr += `=${texFractionFromString(a * k1, p)} ${texteOperation1} ${fractionParenthese(c * k2, p)}`
          e = operation1 ? a * k1 + c * k2 : a * k1 - c * k2
          f = p
          texteCorr += `=${texFractionFromString(e, f)}${simplificationDeFractionAvecEtapes(e, f)}$`
          reponse = fraction(e, f).simplifie()
          break

        case 2: // De la forme : « c⁄d ×÷ e⁄f ± a⁄b »
        default:
          if (piegeObligatoire) {
            f = b
          }
          texte += `$${texFractionFromString(c, d)} ${texteOperation2} ${fractionParenthese(e, f)} ${texteOperation1} ${fractionParenthese(a, b)}$`

          texteCorr = `$${texFractionFromString(c, d)} ${texteOperation2} ${fractionParenthese(e, f)} ${texteOperation1} ${fractionParenthese(a, b)}`
          if (!operation2) {
            // S'il y a division, multiplier par l'inverse du diviseur
            ;[e, f] = [f, e]
            texteCorr += `=${texFractionFromString(c, d)} \\times ${texFractionFromString(e, f)} ${texteOperation1} ${fractionParenthese(a, b)}`
          }

          produit = produitDeDeuxFractions(c, d, e, f)
          // texteCorr += `$=${texFractionFromString(c, d)}\\times ${texFractionFromString(e, f)} ${texteOperation1} ${fractionParenthese(a, b)}$`
          if (this.correctionDetaillee) {
            texteCorr += `=${texFractionFromString(c + '\\times' + ecritureParentheseSiNegatif(e), d + '\\times' + ecritureParentheseSiNegatif(f))} ${texteOperation1} ${fractionParenthese(a, b)}`
            texteCorr += `=${texFractionFromString(c * e, d * f)} ${texteOperation1} ${fractionParenthese(a, b)}`
          } else {
            texteCorr += `=${produit[1]} ${texteOperation1} ${fractionParenthese(a, b)}`
            texteCorr += `=${produit[0]} ${texteOperation1} ${fractionParenthese(a, b)}`
          }

          // faut-il simplifier c×e⁄d×f ?
          if (!this.correctionDetaillee) {
            ;[c, d, e, f] = produit[2]
          }
          p = pgcd(c * e, d * f)
          if (p !== 1 && ppcm(b, d * f) > ppcm(b, (d * f) / p)) {
            texteCorr += `=${texFractionFromString((e * c) / p + '\\times\\cancel{' + ecritureParentheseSiNegatif(p) + '}', (f * d) / p + '\\times\\cancel{' + ecritureParentheseSiNegatif(p) + '}')} ${texteOperation1} ${fractionParenthese(a, b)}`
            c = (e * c) / p
            d = (f * d) / p
          } else {
            c = e * c
            d = f * d
          }
          p = ppcm(b, d) // p = dénominateur commun
          k1 = p / b
          k2 = p / d
          if (k2 !== 1) {
            texteCorr += `=${texFractionFromString(
              c + miseEnEvidence('\\times' + ecritureParentheseSiNegatif(k2)),
              d + miseEnEvidence('\\times' + ecritureParentheseSiNegatif(k2)),
            )}`
          } else {
            if (k1 !== 1) {
              texteCorr += `=${texFractionFromString(c, d)}`
            }
          }

          if (k1 !== 1) {
            texteCorr += ` ${texteOperation1} ${texFractionFromString(
              a + miseEnEvidence('\\times' + ecritureParentheseSiNegatif(k1)),
              b + miseEnEvidence('\\times' + ecritureParentheseSiNegatif(k1)),
            )}`
          } else {
            if (k2 !== 1) {
              texteCorr += ` ${texteOperation1} ${fractionParenthese(a, b)}`
            }
          }

          if (this.correctionDetaillee) {
            texteCorr += `=${texFractionFromString(c * k2, p)} ${texteOperation1} ${fractionParenthese(a * k1, p)}`
          }
          e = operation1 ? c * k2 + a * k1 : c * k2 - a * k1
          f = p

          texteCorr += `=${texFractionFromString(e, f)}${simplificationDeFractionAvecEtapes(e, f)}$`
          reponse = fraction(e, f).simplifie()
          break
      }

      if (this.questionJamaisPosee(i, a, b, c, d, typesDeQuestions)) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierDeBaseAvecFraction,
          { texteAvant: '$=$' },
        )
        handleAnswers(this, i, {
          reponse: {
            value: reponse.toLatex(),
            options: { fractionIrreductible: true },
          },
        })

        if (this.sup4) {
          texte = `$${lettreDepuisChiffre(i + 1)} = $ ${texte}`
          // On découpe
          const etapes = texteCorr.split('=')
          texteCorr = ''
          etapes.forEach(function (etape) {
            // etape = etape.replace('$', '')
            etape = etape.split('$').join('')
            if (context.isHtml) {
              texteCorr += '<br>'
            }
            texteCorr += `$ ${lettreDepuisChiffre(i + 1)} = ${etape}$<br>`
          })
        }
        // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
        const textCorrSplit = texteCorr.split('=')
        let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
        aRemplacer = aRemplacer.replace('$', '').replace('<br>', '')

        texteCorr = ''
        for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
          texteCorr += textCorrSplit[ee] + '='
        }
        texteCorr += `$ $${miseEnEvidence(aRemplacer)}$`
        // Fin de cette uniformisation

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
              valeur: [reponse], // obligatoire (la réponse numérique à comparer à celle de l'élève), NE PAS METTRE DE STRING à virgule ! 4.9 et non pas 4,9. Cette valeur doit être passée dans un tableau d'où la nécessité des crochets.
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
