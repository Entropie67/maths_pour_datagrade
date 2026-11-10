import { miseEnEvidence } from '../../lib/outils/embellissements'
/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/interactivity/mathLive.intervalleStrict.test.ts ⚠️
 */

import { amcConvert } from '../../lib/amc/amcBuilders'
import { infoMessage } from '../../lib/format/message'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Intercaler un nombre décimal entre deux nombres décimaux'
export const amcReady = true
export const amcType = 'AMCOpen'
export const interactifReady = true

export const dateDeModifImportante = '29/10/2021'

/**
 * Intercaler un nombre décimal entre deux décimaux
 * @author Rémi Angot

 * Ajout AMC : Janvier 2022 par EE
 */
export const uuid = 'b86b9'

export const refs = {
  'fr-fr': ['6N1M-1'],
  'fr-2016': ['6N31-4'],
  'fr-ch': ['PR-41', '9R1NO2D-8', '9R2NO2D-8', '9R3NO2D-8', 'PRQNO04A-3', 'PRQNO05A-6'],
}
export default class IntercalerDecimalEntre2Decimaux extends Exercice {
  constructor() {
    super()
    this.consigne = 'Compléter avec un nombre décimal.'
    this.nbQuestions = 6
    this.nbCols = 2 // Nombre de colonnes pour la sortie LaTeX
    this.nbColsCorr = 2 // Nombre de colonnes dans la correction pour la sortie LaTeX
    this.besoinFormulaireTexte = [
      'Type de question',
      [
        'Nombres séparés par des tirets  :',
        '1 : b-a > 0,1',
        '2 : b-a = 0,1',
        '3 : b-a = 0,1, b entier',
        '4 : b-a = 0,01',
        '5 : b-a = 0,01, a avec 9 centièmes',
        '6 : b-a = 0,01, a avec 99 centièmes',
        '7 : a avec 3 chiffres après la virgule et b un seul',
        '8 : b-a = 0,1, a entier',
        '9 : b-a = 0,01, a entier',
        '10 : b-a = 1, a et b entiers',
        '11 : Mélange',
      ].join('\n'),
    ]
    this.sup = '11'
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 10,
      melange: 11,
      defaut: 11,
      nbQuestions: this.nbQuestions,
      listeOfCase: [
        'a,b1',
        'a,b2',
        'a,9',
        'a,bc',
        'a,b9',
        'a,99',
        'a,b0c',
        'a,1',
        'a,01',
        'a',
      ],
    })
    for (
      let i = 0, texte, texteCorr, a, b, r, u, d1, c1, c2, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (listeTypeDeQuestions[i]) {
        case 'a,b1': // 1 : b-a > 0,1
          d1 = randint(1, 6)
          u = randint(1, 39)
          a = u + d1 / 10
          b = u + randint(d1 + 2, 9) / 10
          r = a + 1 / 10
          break
        case 'a,b2': // 2 : b-a = 0,1
          d1 = randint(1, 8)
          u = randint(1, 39)
          a = u + d1 / 10
          b = u + (d1 + 1) / 10
          r = a + 5 / 100
          break
        case 'a,9': // 3 : b-a = 0,1, b entier
          a = randint(1, 39) + 9 / 10
          b = a + 1 / 10
          r = a + 5 / 100
          break
        case 'a,bc': // 4 : b-a = 0,01
          u = randint(1, 39)
          d1 = randint(1, 9)
          c1 = randint(1, 8)
          c2 = c1 + 1
          a = u + d1 / 10 + c1 / 100
          b = u + d1 / 10 + c2 / 100
          r = a + 5 / 1000
          break
        case 'a,b9': // 5 : b-a = 0,01, a avec 9 centièmes
          u = randint(1, 39)
          d1 = randint(1, 9)
          c1 = 9
          a = u + d1 / 10 + c1 / 100
          b = u + (d1 + 1) / 10
          r = a + 5 / 1000
          break
        case 'a,99': // 6 : b-a = 0,01, a avec 99 centièmes
          u = randint(1, 39)
          a = u + 99 / 100
          b = u + 1
          r = a + 5 / 1000
          break
        case 'a,b0c': // 7 : a avec 3 chiffres après la virgule et b un seul
          u = randint(1, 39)
          d1 = randint(1, 6)
          c1 = randint(1, 8)
          c2 = c1 + 1
          a = u + d1 / 10 + c1 / 1000
          b = u + randint(d1 + 1, 9) / 10
          if (b - a > 0.1) {
            r = u + (d1 + 1) / 10
          } else {
            r = u + d1 / 10 + 1 / 100
          }
          break
        case 'a,1':
          u = randint(1, 39)
          d1 = 1
          a = u
          b = u + d1 / 10
          r = u + 5 / 100
          break

        case 'a,01':
          u = randint(1, 39)
          c1 = 1
          a = u
          b = u + c1 / 100
          r = u + 5 / 1000
          break

        case 'a':
        default:
          a = randint(1, 39)
          b = a + 1
          r = a + 1 / 10
          break
      }
      if (this.interactif) {
        texte =
          `$${texNombre(a)}<$` +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers) +
          `$\\quad<${texNombre(b)}$`
        handleAnswers(this, i, {
          reponse: {
            value: `]${a};${b}[`,
            options: { estDansIntervalle: true },
          },
        })
      } else {
        texte = `$${texNombre(a)}<${sp(3)}\\ldots\\ldots\\ldots\\ldots\\ldots${sp(3)}<${texNombre(b)}$`
      }
      texteCorr = `$${texNombre(a)}<${miseEnEvidence(texNombre(r))}<${texNombre(b)}$`

      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: texte,
          propositions: [
            { texte: texteCorr, statut: 3, feedback: '', sanscadre: true },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }
      if (this.questionJamaisPosee(i, a, b)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
    if (context.isHtml) {
      this.contenuCorrection =
        infoMessage({
          titre: 'Remarque',
          texte:
            "Il y a une infinité de solutions. La correction ne montre qu'une possibilité.",
          couleur: 'black',
        }) + this.contenuCorrection
    }
  }
}
