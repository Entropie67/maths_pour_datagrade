import { orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Effectuer des calculs simples avec un nombre entier et une fraction'

export const interactifReady = true
export const dateDePublication = '11/02/2026'
export const uuid = 'c2e0a'

export const refs = {
  'fr-fr': ['4C23-0'],
  'fr-ch': ['10LSNO3C-2', '11CTNO2B-2', '11LCNO2B-2', 'PRQNO13C-4'],
}

/**
 * @author Rémi Angot
 */

export default class CalculsSimplesEntiersFractions extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de questions',
      'Nombres séparés par des tirets :\n1 : k × a/b\n2 : k + a/b\n3 : k - a/b\n4 : a/b ÷ k\n5 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = [
      "Avec l'écriture simplifiée de la fraction résultat",
    ]
    this.sup = '5'
    this.sup2 = false
    this.spacing = 3
    this.spacingCorr = 3
    this.nbQuestions = 8
    this.nbCols = 4
    this.nbColsCorr = 4
    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? "Effectuer les calculs suivants en donnant le résultat sous forme d'une fraction."
        : "Effectuer le calcul suivant en donnant le résultat sous forme d'une fraction."

    const typeQuestionsPossibles = [
      'prodEntierFraction',
      'sommeEntierFraction',
      'diffEntierFraction',
      'divFractionEntier',
    ]

    const listeTypeQuestions = combinaisonListes(
      gestionnaireFormulaireTexte({
        melange: 5,
        max: 4,
        defaut: 5,
        nbQuestions: this.nbQuestions,
        shuffle: true,
        saisie: this.sup,
      }).map((n) => typeQuestionsPossibles[Number(n) - 1]),
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const fractionsDisponibles = [
        [1, 3],
        [2, 3],
        [1, 4],
        [3, 4],
        [1, 5],
        [2, 5],
        [3, 5],
        [4, 5],
        [1, 10],
        [3, 10],
        [7, 10],
      ]
      const [a, b] = choice(fractionsDisponibles)
      const typeQuestion = listeTypeQuestions[i]
      const lettre = lettreDepuisChiffre(i + 1)
      const fractionAB = new FractionEtendue(a, b)
      const k = randint(2, 5)
      const entierK = new FractionEtendue(k, 1)

      let texte = ''
      let texteCorr = ''
      let resultat = new FractionEtendue(0, 1)

      switch (typeQuestion) {
        case 'prodEntierFraction':
          resultat = entierK.produitFraction(fractionAB)
          texte = `$${lettre} = ${k}\\times ${fractionAB.texFraction}$`
          texteCorr += `$${lettre} = \\dfrac{${k}\\times ${a}}{${b}}$<br>`
          break

        case 'sommeEntierFraction':
          resultat = entierK.sommeFraction(fractionAB)
          texte = `$${lettre} = ${k} + ${fractionAB.texFraction}$`
          texteCorr += `$${lettre} = ${new FractionEtendue(k * b, b).texFraction} + ${fractionAB.texFraction}$<br>`
          break

        case 'diffEntierFraction':
          resultat = entierK.differenceFraction(fractionAB)
          texte = `$${lettre} = ${k} - ${fractionAB.texFraction}$`
          texteCorr += `$${lettre} = ${new FractionEtendue(k * b, b).texFraction} - ${fractionAB.texFraction}$<br>`
          break

        case 'divFractionEntier':
        default:
          resultat = fractionAB.diviseFraction(entierK)
          texte = `$${lettre} = ${fractionAB.texFraction}\\div ${k}$`
          texteCorr += `$${lettre} = ${fractionAB.texFraction}\\times ${entierK.inverse().texFraction}$<br>`
          break
      }

      if (this.sup2 && !resultat.estIrreductible) {
        const etapes = resultat
          .texSimplificationAvecEtapes(false, orangeMathalea)
          .split('=')
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
        for (const etape of etapes) {
          texteCorr += `$${lettre} = ${etape}$<br>`
        }
      } else {
        texteCorr += `$${lettre} = ${miseEnEvidence(resultat.texFraction)}$<br>`
      }
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierDeBaseAvecFraction,
        {
          texteAvant: `<br>$${lettre}=$`,
        },
      )

      handleAnswers(this, i, {
        reponse: {
          value: resultat.texFraction,
          options: { fractionEgale: true },
        },
      })

      if (this.questionJamaisPosee(i, typeQuestion, a, b, k)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }

    listeQuestionsToContenuSansNumero(this, false)
  }
}
