import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import {
  addPossibleMultiLinesAnswer,
  baremeMultiLignes,
  besoinFormulaireVerificationMultiLignes,
  commentaireMultiLignes,
} from '../../lib/customElements/PossibleMultiLinesAnswerElement'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import {
  simplificationDeFractionAvecEtapes,
  texFractionFromString,
} from '../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { pgcd } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Effectuer somme, différence, produit ou quotient de fractions'

export const interactifReady = true
export const dateDePublication = '15/09/2021'
export const dateDeModifImportante = '06/10/2024'

/**
 * Effectuer somme, différence, produit, ou quotient de fractions
 * @author Mireille Gain
 */

export const uuid = '374b6'

export const refs = {
  'fr-fr': ['4C23', 'BP2AutoH17', '3AutoN03'],
  'fr-ch': ['10LSNO3C-1', '11CTNO2B-1', '11LCNO2B-1', 'PRQNO12B-2', 'PRQNO13C-3', '1mCN-5'],
}
export default class SommeOuProduitFractions extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de questions',
      'Nombres séparés par des tirets :\n1 : Somme\n2 : Différence\n3 : Produit\n4 : Avec priorités opératoires\n5 : Mélange\n6 : Quotient\n7 : Mélange avec quotient',
    ]
    this.spacing = 3
    this.spacingCorr = 3
    this.nbQuestions = 8 // Nombre de questions par défaut
    this.nbCols = 4 // Uniquement pour la sortie LaTeX
    this.nbColsCorr = 4 // Uniquement pour la sortie LaTeX

    this.sup = '1-3'
    this.besoinFormulaire2CaseACocher = [
      "Avec l'écriture simplifiée de la fraction résultat",
    ]
    this.sup2 = true
    this.besoinFormulaire3Numerique = besoinFormulaireVerificationMultiLignes
    this.sup3 = 2
    this.comment = commentaireMultiLignes
    this.correctionDetailleeDisponible = true // booléen qui indique si une correction détaillée est disponible.
    this.correctionDetaillee = false
    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Effectuer les calculs suivants'
        : 'Effectuer le calcul suivant'
    this.consigne += " en donnant le résultat sous forme d'une fraction."
    let typeQuestionsDisponibles = []
    const typeQuestionsPossibles = [
      ['sommeMult', 'sommeAvecEntier'],
      ['diffMult', 'diffAvecEntier'],
      ['prod', 'prodAvecEntier'],
      ['sommePuisProd', 'prodPuisSomme'],
      [
        'sommeMult',
        'sommeAvecEntier',
        'diffMult',
        'diffAvecEntier',
        'prod',
        'prodAvecEntier',
        'sommePuisProd',
        'prodPuisSomme',
      ],
      ['div', 'entierPuisDiv'],
      [
        'sommeMult',
        'sommeAvecEntier',
        'diffMult',
        'diffAvecEntier',
        'prod',
        'prodAvecEntier',
        'sommePuisProd',
        'prodPuisSomme',
        'div',
        'entierPuisDiv',
      ],
    ]

    const QuestionsDisponibles = gestionnaireFormulaireTexte({
      melange: 0,
      max: 7,
      defaut: 5,
      nbQuestions: this.nbQuestions,
      shuffle: true,
      saisie: this.sup,
      enleveDoublons: false,
    }).map(Number)

    for (let ee = 0; ee < QuestionsDisponibles.length; ee++) {
      const typesQuestions =
        typeQuestionsPossibles[QuestionsDisponibles[ee] - 1]
      typeQuestionsDisponibles.push(
        typesQuestions[randint(0, typesQuestions.length - 1)],
      )
    }
    typeQuestionsDisponibles = shuffle(typeQuestionsDisponibles)

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    for (
      let i = 0,
        num1,
        num2,
        den1,
        kden1,
        den2,
        k,
        k2,
        alea,
        texte,
        texteCorr,
        num,
        den,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Boucle principale où i+1 correspond au numéro de la question
      // les numérateurs
      num1 = randint(1, 7)
      num2 = randint(3, 9)
      // les dénominateurs
      den1 = randint(2, 9, [num2, num1])
      k = randint(1, 4)
      k2 = randint(2, 5)
      kden1 = k * den1
      den2 = randint(2, 9, [num2, num1])
      alea = choice([1, 2])
      texte = ''
      texteCorr = ''
      const lettre = lettreDepuisChiffre(i + 1)
      switch (
        listeTypeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'sommeMult': // Somme de fractions de dénominateurs égaux ou multiples
          if (alea === 1) {
            texte += `$${lettre} = ${texFractionFromString(num1, den1)}+${texFractionFromString(num2, kden1)}$ `
            texteCorr += `$${lettre} = ${texFractionFromString(num1, den1)}+${texFractionFromString(num2, kden1)}$<br>`
            if (k > 1) {
              if (this.correctionDetaillee) {
                texteCorr += `$${lettre} = ${texFractionFromString(num1 + miseEnEvidence('\\times' + k, bleuMathalea), den1 + miseEnEvidence('\\times' + k, bleuMathalea))}+${texFractionFromString(num2, kden1)}$<br>`
              }
              texteCorr += `$${lettre} = ${texFractionFromString(num1 * k, kden1)}+${texFractionFromString(num2, kden1)}$<br>`
            }

            texteCorr += `$${lettre} = ${texFractionFromString(num1 * k + num2, kden1)}$ `
            num = num1 * k + num2
            den = kden1
          } else {
            texte += `$${lettre} = ${texFractionFromString(num1, kden1)}+${texFractionFromString(num2, den1)}$ `
            texteCorr += `$${lettre} = ${texFractionFromString(num1, kden1)}+${texFractionFromString(num2, den1)}$<br>`
            if (k > 1) {
              if (this.correctionDetaillee) {
                texteCorr += `$${lettre} = ${texFractionFromString(num1, kden1)}+${texFractionFromString(num2 + miseEnEvidence('\\times' + k, bleuMathalea), den1 + miseEnEvidence('\\times' + k, bleuMathalea))}$<br>`
              }
              texteCorr += `$${lettre} = ${texFractionFromString(num1, kden1)}+${texFractionFromString(num2 * k, kden1)}$<br>`
            }

            texteCorr += `$${lettre} = ${texFractionFromString(num1 + num2 * k, kden1)}$ `
            num = num1 + num2 * k
            den = kden1
          }

          break

        case 'sommeAvecEntier': // Somme d'une fraction et d'un entier'
          if (alea === 1) {
            texte += `$${lettre} = ${k} + ${texFractionFromString(num1, den1)} $ `
            texteCorr += `$${lettre} = ${k} + ${texFractionFromString(num1, den1)} $<br>`
            texteCorr += `$${lettre} = ${texFractionFromString(k * den1, den1)} + ${texFractionFromString(num1, den1)}$<br>`

            texteCorr += `$${lettre} = ${texFractionFromString(num1 + k * den1, den1)}$`
          } else {
            texte += `$${lettre} = ${texFractionFromString(num1, den1)} + ${k} $`
            texteCorr += `$${lettre} = ${texFractionFromString(num1, den1)}+${k}$<br>`
            texteCorr += `$${lettre} = ${texFractionFromString(num1, den1)}+${texFractionFromString(k * den1, den1)}$<br>`

            texteCorr += `$${lettre} = ${texFractionFromString(num1 + k * den1, den1)}$`
          }
          num = num1 + k * den1
          den = den1
          break

        case 'diffMult': // Différence de fractions de dénominateurs égaux ou multiples
          if (alea === 1) {
            texte += `$${lettre} = ${texFractionFromString(num1, den1)}-${texFractionFromString(num2, kden1)}$`
            texteCorr += `$${lettre} = ${texFractionFromString(num1, den1)}-${texFractionFromString(num2, kden1)}$<br>`
            if (k > 1) {
              if (this.correctionDetaillee) {
                texteCorr += `$${lettre} = ${texFractionFromString(num1 + miseEnEvidence('\\times' + k, bleuMathalea), den1 + miseEnEvidence('\\times' + k, bleuMathalea))} - ${texFractionFromString(num2, kden1)}$<br>`
              }
              texteCorr += `$${lettre} = ${texFractionFromString(num1 * k, den1 * k)}-${texFractionFromString(num2, kden1)}$<br>`
            }

            texteCorr += `$${lettre} = ${texFractionFromString(num1 * k - num2, kden1)}$ `
            num = num1 * k - num2
            den = kden1
          } else {
            texte += `$${lettre} = ${texFractionFromString(num1, kden1)}-${texFractionFromString(num2, den1)}$`
            texteCorr += `$${lettre} = ${texFractionFromString(num1, kden1)}-${texFractionFromString(num2, den1)}$<br>`
            if (k > 1) {
              if (this.correctionDetaillee) {
                texteCorr += `$${lettre} = ${texFractionFromString(num1, kden1)}-${texFractionFromString(num2 + miseEnEvidence('\\times' + k, bleuMathalea), den1 + miseEnEvidence('\\times' + k, bleuMathalea))}$<br>`
              }
              texteCorr += `$${lettre} = ${texFractionFromString(num1, kden1)}-${texFractionFromString(num2 * k, kden1)}$<br>`
            }

            texteCorr += `$${lettre} = ${texFractionFromString(num1 - num2 * k, kden1)}$`
            num = num1 - num2 * k
            den = kden1
          }

          break

        case 'diffAvecEntier': // Différence d'une fraction et d'un entier
          if (alea === 1) {
            texte += `$${lettre} = ${k} - ${texFractionFromString(num1, den1)} $`
            texteCorr += `$${lettre} = ${k} - ${texFractionFromString(num1, den1)}$<br>`
            texteCorr += `$${lettre} = ${texFractionFromString(k * den1, den1)} - ${texFractionFromString(num1, den1)}$<br>`

            texteCorr += `$${lettre} = ${texFractionFromString(k * den1 - num1, den1)}$`
            num = k * den1 - num1
            den = den1
          } else {
            texte += `$${lettre} = ${texFractionFromString(num1, den1)}-${k}$`
            texteCorr += `$${lettre} = ${texFractionFromString(num1, den1)}-${k}$<br>`
            if (k > 1) {
              texteCorr += `$${lettre} = ${texFractionFromString(num1, den1)}-${texFractionFromString(k * den1, den1)}$<br>`
            }

            texteCorr += `$${lettre} = ${texFractionFromString(num1 - k * den1, den1)}$ `
            num = num1 - k * den1
            den = den1
          }

          break

        case 'prod': // Produit de fractions
          texte += `$${lettre} = ${texFractionFromString(num1, den1)} \\times ${texFractionFromString(num2, den2)}$`
          texteCorr += `$${lettre} = ${texFractionFromString(num1, den1)} \\times ${texFractionFromString(num2, den2)}$<br>`
          texteCorr += `$${lettre} = ${texFractionFromString(num1 * num2, den1 * den2)}$`
          num = num1 * num2
          den = den1 * den2
          break

        case 'prodAvecEntier': // Produit d'une fraction par un entier
          if (alea === 1) {
            texte += `$${lettre} = ${texFractionFromString(num1, den1)} \\times ${k2}$`
            texteCorr += `$${lettre} = ${texFractionFromString(num1, den1)} \\times ${k2}$<br>`
            texteCorr += `$${lettre} = ${texFractionFromString(num1, den1)} \\times ${texFractionFromString(k2, '1')}$<br>`

            texteCorr += `$${lettre} = ${texFractionFromString(num1 * k2, den1)}$`
          } else {
            texte += `$${lettre} = ${k2} \\times ${texFractionFromString(num1, den1)} $`
            texteCorr += `$${lettre} = ${k2} \\times ${texFractionFromString(num1, den1)}$<br>`
            texteCorr += `$${lettre} = ${texFractionFromString(k2, '1')} \\times  ${texFractionFromString(num1, den1)}$<br>`

            texteCorr += `$${lettre} = ${texFractionFromString(num1 * k2, den1)}$`
          }
          num = num1 * k2
          den = den1

          break

        case 'sommePuisProd': // Avec priorité opératoire : a +/- bc
          if (alea === 1) {
            texte += `$${lettre} = ${texFractionFromString(num1, den1)} + ${texFractionFromString(num2, den1)} \\times ${texFractionFromString(k2, den2)}$ `
            texteCorr += `$${lettre} = ${texFractionFromString(num1, den1)} + ${texFractionFromString(num2, den1)} \\times ${texFractionFromString(k2, den2)}$<br>`
            texteCorr += `$${lettre} = ${texFractionFromString(num1, den1)} + ${texFractionFromString(num2 * k2, den1 * den2)}$<br>`
            texteCorr += `$${lettre} = ${texFractionFromString(num1 * den2, den1 * den2)} + ${texFractionFromString(num2 * k2, den1 * den2)}$<br>`

            texteCorr += `$${lettre} = ${texFractionFromString(num1 * den2 + num2 * k2, den1 * den2)}$`
            num = num1 * den2 + num2 * k2
            den = den1 * den2
          } else {
            texte += `$${lettre} = ${texFractionFromString(num1, den1)} - ${texFractionFromString(num2, den1)} \\times ${texFractionFromString(k2, den2)}$`
            texteCorr += `$${lettre} = ${texFractionFromString(num1, den1)} - ${texFractionFromString(num2, den1)} \\times ${texFractionFromString(k2, den2)}$<br>`
            texteCorr += `$${lettre} = ${texFractionFromString(num1, den1)} - ${texFractionFromString(num2 * k2, den1 * den2)}$<br>`
            texteCorr += `$${lettre} = ${texFractionFromString(num1 * den2, den1 * den2)} - ${texFractionFromString(num2 * k2, den1 * den2)}$<br>`

            texteCorr += `$${lettre} = ${texFractionFromString(num1 * den2 - num2 * k2, den1 * den2)}$`
            num = num1 * den2 - num2 * k2
            den = den1 * den2
          }

          break

        case 'prodPuisSomme': // Avec priorité opératoire : ab +/- c
          if (alea === 1) {
            texte += `$${lettre} = ${texFractionFromString(num2, den1)} \\times ${texFractionFromString(k2, den2)} + ${texFractionFromString(num1, den1)}$`
            texteCorr += `$${lettre} = ${texFractionFromString(num2, den1)} \\times ${texFractionFromString(k2, den2)} + ${texFractionFromString(num1, den1)}$<br>`
            texteCorr += `$${lettre} = ${texFractionFromString(num2 * k2, den1 * den2)} + ${texFractionFromString(num1, den1)}$<br>`
            texteCorr += `$${lettre} = ${texFractionFromString(num2 * k2, den1 * den2)} + ${texFractionFromString(num1 * den2, den1 * den2)}$<br>`

            texteCorr += `$${lettre} = ${texFractionFromString(num2 * k2 + num1 * den2, den1 * den2)}$`
            num = num2 * k2 + num1 * den2
            den = den1 * den2
          } else {
            texte += `$${lettre} = ${texFractionFromString(num2, den1)} \\times ${texFractionFromString(k2, den2)} - ${texFractionFromString(num1, den1)}$`
            texteCorr += `$${lettre} = ${texFractionFromString(num2, den1)} \\times ${texFractionFromString(k2, den2)} - ${texFractionFromString(num1, den1)}$<br>`
            texteCorr += `$${lettre} = ${texFractionFromString(num2 * k2, den1 * den2)} - ${texFractionFromString(num1, den1)}$<br>`
            texteCorr += `$${lettre} = ${texFractionFromString(num2 * k2, den1 * den2)} - ${texFractionFromString(num1 * den2, den1 * den2)}$<br>`

            texteCorr += `$${lettre} = ${texFractionFromString(num2 * k2 - num1 * den2, den1 * den2)}$`
            num = num2 * k2 - num1 * den2
            den = den1 * den2
          }
          break

        case 'div': // Quotient de deux fractions
          texte += `$${lettre} = ${texFractionFromString(num1, den1)} \\div  ${texFractionFromString(num2, den2)} $ `
          texteCorr += `$${lettre} = ${texFractionFromString(num1, den1)} \\div  ${texFractionFromString(num2, den2)} $<br>`
          texteCorr += `$${lettre} = ${texFractionFromString(num1, den1)} \\times ${texFractionFromString(den2, num2)}$<br>`
          texteCorr += `$${lettre} = ${texFractionFromString(num1 * den2, den1 * num2)}$`

          num = num1 * den2
          den = den1 * num2
          break

        case 'entierPuisDiv': // Quotient d'un entier par une fraction
        default:
          texte += `$${lettre} = ${texNombre(num1)} \\div  ${texFractionFromString(num2, den2)} $ `
          texteCorr += `$${lettre} = ${texNombre(num1)} \\div  ${texFractionFromString(num2, den2)} $<br>`
          texteCorr += `$${lettre} = ${texFractionFromString(num1, 1)} \\times ${texFractionFromString(den2, num2)}$<br>`
          texteCorr += `$${lettre} = ${texFractionFromString(num1 * den2, num2)}$`

          num = num1 * den2
          den = num2
          break
      }

      if (pgcd(num, den) === 1) {
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
      } else {
        if (this.sup2) {
          texteCorr += `<br>$${lettre}  ${simplificationDeFractionAvecEtapes(num, den, { couleur1: bleuMathalea, couleur2: orangeMathalea })}$`
        }
      }
      texteCorr += '<br>'
      handleAnswers(this, i, {
        reponse: {
          value: new FractionEtendue(num, den).texFraction,
          options: { fractionEgale: true },
        },
      })
      texte += addPossibleMultiLinesAnswer(this, i, {
        prefix: `${lettre} =`,
        style: KeyboardType.clavierDeBaseAvecFraction,
        bareme: baremeMultiLignes(this.sup3),
      })

      // Si la question n'a jamais été posée, on l'enregistre
      if (this.questionJamaisPosee(i, num, den)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }

      cpt++
    }

    listeQuestionsToContenuSansNumero(this, false) // On envoie l'exercice à la fonction de mise en page
  }
}
