import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  simplificationDeFractionAvecEtapes,
  texFractionFromString,
} from '../../lib/outils/deprecatedFractions'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { lettreDepuisChiffre, sp } from '../../lib/outils/outilString'
import { pgcd, ppcm } from '../../lib/outils/primalite'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const amcReady = true
export const amcType = 'AMCNum'
export const titre = 'Additionner ou soustraire deux fractions'
export const interactifReady = true

export const dateDeModifImportante = '16/05/2025'

/**
 * Effectuer la somme ou la différence de deux fractions
 *
 * * Niveau 1 : 4 fois sur 5 un dénominateur est un multiple de l'autre et une fois sur 5 il faut additionner une fraction et un entier
 * * Niveau 2 : 2 fois sur 5, il faut trouver le ppcm, 1 fois sur 5 le ppcm correspond à leur produit, 1 fois sur 5 un dénominateur est multiple de l'autre, 1 fois sur 5 il faut additionner une fraction et un entier
 * * Paramètre supplémentaire : utiliser des nombres relatifs (par défaut tous les nombres sont positifs)
 * * 2 fois sur 4 il faut faire une soustraction
 * @author Rémi Angot
 */
export const uuid = '5f429'

export const refs = {
  'fr-fr': ['4C21', 'BP2AutoH9'],
  'fr-ch': ['9R3NO4J-8', '10CTNO3A-8', '10LCNO3A-8', '10LSNO3A-8', 'PRQNO12A-2'],
}
export default class ExerciceAdditionnerOuSoustraireDesFractions extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      2,
      "1 : Un dénominateur multiple de l'autre\n2 : Cas général",
    ]
    this.besoinFormulaire2CaseACocher = ['Avec des nombres relatifs']
    this.besoinFormulaire3CaseACocher = [
      "Avec l'écriture simplifiée de la fraction résultat",
    ]
    this.besoinFormulaire4CaseACocher = [
      'Présentation des corrections en colonnes',
      false,
    ]
    this.sup = 2 // Niveau de difficulté
    this.sup2 = false // Avec ou sans relatifs
    this.sup3 = true // Si false alors le résultat n'est pas en fraction simplifiée
    this.sup4 = false // Par défaut c'est l'ancienne correction qui est affichée
    this.consigne =
      "Calculer et donner le résultat sous la forme d'une fraction simplifiée."
    this.spacing = 2
    this.spacingCorr = 2
    this.nbQuestions = 5
    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    if (!this.sup3 && !context.isAmc) {
      this.consigne = 'Calculer.'
    } else {
      this.consigne =
        "Calculer et donner le résultat sous la forme d'une fraction simplifiée au maximum."
    }

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
    const listeDePlusOuMoins = combinaisonListes(
      ['-', '-', '+', '+'],
      this.nbQuestions,
    )
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
      const plusOuMoins = listeDePlusOuMoins[i]
      const plusOuMoinsUn = plusOuMoins === '+' ? 1 : -1
      const lettre = lettreDepuisChiffre(i + 1)
      const prefixCorr = this.sup4 ? '' : `${lettre}=`
      let k1 = 0
      let k2 = 0
      let k = 0
      let num = 0
      let den = 1
      typesDeQuestions = listeTypeDeQuestions[i]
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
      if (!this.sup2 && plusOuMoins === '-' && a / b < c / d) {
        // s'il n'y a pas de relatifs, il faut s'assurer que la soustraction soit positive
        ;[a, b, c, d] = [c, d, a, b] // on échange les 2 fractions
        k1 = ppcm(b, d) / b
        k2 = ppcm(b, d) / d
        if (typesDeQuestions === 'd_multiple_de_b') {
          typesDeQuestions = 'b_multiple_de_d' // comme on a échangé les 2 fractions, le type de la question change
          k = b / d
        } else if (typesDeQuestions === 'b_multiple_de_d') {
          typesDeQuestions = 'd_multiple_de_b' // comme on a échangé les 2 fractions, le type de la question change
          k = d / b
        }
      }
      texte = `$${lettre}=${texFractionFromString(a, b)}${plusOuMoins}${texFractionFromString(c, d)}$`
      texteCorr = `$${prefixCorr}${texFractionFromString(a, b)}${plusOuMoins}${texFractionFromString(c, d)}`

      // a/b(+ou-)c/d = num/den (résultat non simplifié)
      if (
        typesDeQuestions === 'ppcm' ||
        typesDeQuestions === 'premiers_entre_eux'
      ) {
        texteCorr += `=${texFractionFromString(a + miseEnEvidence('\\times ' + k1, bleuMathalea), b + miseEnEvidence('\\times ' + k1, bleuMathalea))}${plusOuMoins}${texFractionFromString(c + miseEnEvidence('\\times ' + k2, bleuMathalea), d + miseEnEvidence('\\times ' + k2, bleuMathalea))}`
        num = arrondi(a * k1 + plusOuMoinsUn * c * k2)
        den = b * k1
        texteCorr += `=${texFractionFromString(a * k1 + plusOuMoins + ecritureParentheseSiNegatif(c * k2), den)}`
      }

      if (typesDeQuestions === 'd_multiple_de_b') {
        texteCorr += `=${texFractionFromString(a + miseEnEvidence('\\times ' + k, bleuMathalea), b + miseEnEvidence('\\times ' + k, bleuMathalea))}${plusOuMoins}${texFractionFromString(c, d)}`
        num = arrondi(a * k + plusOuMoinsUn * c)
        den = b * k
        texteCorr += `=${texFractionFromString(a * k + plusOuMoins + ecritureParentheseSiNegatif(c), den)}`
      }

      if (typesDeQuestions === 'b_multiple_de_d') {
        texteCorr += `=${texFractionFromString(a, b)}${plusOuMoins}${texFractionFromString(c + miseEnEvidence('\\times ' + k, bleuMathalea), d + miseEnEvidence('\\times ' + k, bleuMathalea))}`
        num = arrondi(a + plusOuMoinsUn * c * k)
        den = b
        texteCorr += `=${texFractionFromString(a + plusOuMoins + ecritureParentheseSiNegatif(c * k), den)}`
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
          // n+-a/b
          if (!this.sup2 && plusOuMoins === '-' && n < a / b) {
            n = randint(5, 9) // max(a/b)=9/2
          }
          texteCorr = `$${prefixCorr}${n}${plusOuMoins}${texFractionFromString(a, b)}`
          texte = `$${lettre}=${n}${plusOuMoins}${texFractionFromString(a, b)}$`
          texteCorr += `=${texFractionFromString(n + miseEnEvidence('\\times ' + b, bleuMathalea), miseEnEvidence(b, bleuMathalea))}${plusOuMoins}${texFractionFromString(a, b)}`
          texteCorr += `=${texFractionFromString(n * b + plusOuMoins + ecritureParentheseSiNegatif(a), b)}`
          num = arrondi(n * b + plusOuMoinsUn * a)
        } else {
          // a/b +-n
          if (!this.sup2 && plusOuMoins === '-' && n > a / b) {
            n = randint(1, 4) //
            a = n * b + randint(1, 9) // (n*b+?)/b-n>0
          }
          texteCorr = `$${prefixCorr}${texFractionFromString(a, b)}${plusOuMoins}${ecritureParentheseSiNegatif(n)}`
          texte = `$${lettre}=${texFractionFromString(a, b)}${plusOuMoins}${ecritureParentheseSiNegatif(n)}$`
          texteCorr += `=${texFractionFromString(a, b)}${plusOuMoins}${texFractionFromString(n + miseEnEvidence('\\times ' + b, bleuMathalea), miseEnEvidence(b, bleuMathalea))}`
          texteCorr += `=${texFractionFromString(a + plusOuMoins + ecritureParentheseSiNegatif(n * b), b)}`
          num = arrondi(a + plusOuMoinsUn * n * b)
        }
        den = b
      }

      texteCorr += `=${texFractionFromString(num, den)}`
      texteCorr +=
        simplificationDeFractionAvecEtapes(num, den, {
          colorisationResultat: false,
        }) + '$'

      // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
      const textCorrSplit = texteCorr.split('=')
      let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
      aRemplacer = aRemplacer.replaceAll('$', '')

      texteCorr = ''
      for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
        texteCorr += textCorrSplit[ee] + '='
      }
      texteCorr += `$ $${miseEnEvidence(aRemplacer)}$`
      // Fin de cette uniformisation

      const myTexteCorrCol = texteCorr
      if (this.sup4) {
        texteCorr = ''
        // On redécoupe comme un chacal
        const etapes = myTexteCorrCol.split('=')
        texteCorr += `${lettreDepuisChiffre(i + 1)} = $${etapes[0].replace('$', '')}$ <br>`
        for (let w = 1; w < etapes.length - 1; w++) {
          texteCorr += `<br>${lettreDepuisChiffre(i + 1)} = $${etapes[w]}$ <br>`
        }
        // Le dernier morceau commence par le `$` fermant de la ligne précédente, il faut le retirer
        texteCorr += `<br>${lettreDepuisChiffre(i + 1)} = ${etapes[etapes.length - 1].replace('$', '')}`
      }

      if (!new FractionEtendue(num, den).estIrreductible)
        texteCorr += sp(5) + ' (On a réduit le plus possible la fraction.)'

      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierDeBaseAvecFraction,
        { texteAvant: '=' },
      )
      reponse = this.sup3 ? fraction(num, den).simplifie() : fraction(num, den)
      handleAnswers(this, i, {
        reponse: {
          value: reponse.toLatex(),
          options: {
            fractionEgale: !this.sup3,
            fractionIrreductible: this.sup3,
          },
        },
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
              digits: 4,
              digitsNum: 2,
              digitsDen: 2,
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
