import Decimal from 'decimal.js'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, creerCouples } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const amcReady = true
export const interactifReady = true

export const amcType = 'qcmMono'

export const titre =
  'Utiliser tables de multiplication pour effectuer produits avec décimaux'

/**
 * Multiplier deux nombres décimaux
 * @author Rémi Angot
 */

export const dateDeModifImportante = '12/09/2026'

export const uuid = '5d146'

export const refs = {
  'fr-fr': ['6N2B-5, 5N1autoD', '5N2autoA-2'],
  'fr-2016': ['6C10-3'],
  'fr-ch': ['9R1NO6C-10', '9R2NO6C-10', '9R3NO6C-10'],
}
export default class ExerciceTablesMultiplicationsEtDecimaux extends Exercice {
  constructor(tablesParDefaut = '2-3-4-5-6-7-8-9') {
    super()
    // Multiplier deux nombres
    this.sup = tablesParDefaut
    this.sup2 = 2
    this.besoinFormulaireTexte = [
      'Choix des tables (entre 2 et 9)',
      'Nombres séparés par des tirets  :',
    ] // Texte, tooltip
    if (context.isHtml) {
      this.besoinFormulaire2Numerique = [
        'Type de question',
        2,
        '1 : QCM\n2 : Numérique',
      ]
    }
    this.consigne = 'Calculer.'
    this.spacing = 2
  }

  nouvelleVersion() {
    if (context.isHtml)
      this.besoinFormulaire2Numerique = [
        'Exercice interactif',
        2,
        '1 : QCM\n2 : Numérique',
      ]
    // Texte, tooltip
    else this.besoinFormulaire2Numerique = false

    const tables = gestionnaireFormulaireTexte({
      min: 2,
      max: 9,
      defaut: randint(2, 9),
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
      melange: 11,
    })

    const couples = creerCouples(
      tables.map(Number),
      [2, 3, 4, 5, 6, 7, 8, 9, 10],
      this.nbQuestions,
    ) // Liste tous les couples possibles (2,3)≠(3,2)
    for (
      let i = 0, a, b, k1, k2, couple, texte, texteCorr;
      i < this.nbQuestions;
      i++
    ) {
      this.autoCorrection[i] = {}
      a = new Decimal(couples[i][0])
      b = new Decimal(couples[i][1])
      couple = choice([
        [1, 10],
        [1, 100],
        [1, 1000],
        [10, 100],
        [10, 1000],
        [100, 100],
        [100, 1000],
      ])
      k1 = couple[0]
      k2 = couple[1]
      a = a.div(k1)
      b = b.div(k2)
      if (a.equals(1)) {
        a = new Decimal(1).div(100)
      }
      if (b.equals(1)) {
        b = new Decimal(1).div(10)
      }
      texte = '$ ' + texNombre(a) + ' \\times ' + texNombre(b) + ' =  $'
      texteCorr =
        '$ ' +
        texNombre(a) +
        ' \\times ' +
        texNombre(b) +
        ' = ' +
        miseEnEvidence(texNombre(a.times(b))) +
        ' $'
      /**********************************/
      // QCM
      /**********************************/
      this.autoCorrection[i].enonce = `${texte}\n`
      this.autoCorrection[i].propositions = [
        {
          texte: `$${texNombre(a.times(b))}$`,
          statut: true,
          feedback: 'Correct !',
        },
        {
          texte: `$${texNombre(a.times(b).div(10))}$`,
          statut: false,
          feedback: 'Compte le nombre de zéros dans chaque facteur',
        },
        {
          texte: `$${texNombre(a.times(b).times(10))}$`,
          statut: false,
          feedback: 'Compte le nombre de zéros dans chaque facteur',
        },
        {
          texte: `$${texNombre(a.times(b).div(100))}$`,
          statut: false,
          feedback: 'Compte le nombre de zéros dans chaque facteur',
        },
        {
          texte: `$${texNombre(a.times(b).times(100))}$`,
          statut: false,
          feedback: 'Compte le nombre de zéros dans chaque facteur',
        },
      ]
      this.autoCorrection[i].options = {
        ordered: false,
      }
      const props = propositionsQcm(this, i)
      if (this.sup2 !== 2) {
        texte += props.texte
      } else {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
        // `propositionsQcm()` a positionné `formatInteractif` à 'mathalea-qcm' ;
        // en mode numérique interactif il faut le forcer à 'mathlive' sinon la
        // saisie de l'élève n'est pas vérifiée (réponse considérée manquante).
        handleAnswers(
          this,
          i,
          { reponse: { value: a.times(b) } },
          this.interactif ? { formatInteractif: 'mathlive' } : {},
        )
      }
      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
    }
    listeQuestionsToContenu(this)
  }
}
