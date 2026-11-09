import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { all, isEqual, isPrimeFactorization } from '../../lib/interactif/checks'
import {
  addPossibleMultiLinesAnswer,
  baremeMultiLignes,
  besoinFormulaireVerificationMultiLignes,
  commentaireMultiLignes,
} from '../../lib/customElements/PossibleMultiLinesAnswerElement'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { compareNombres } from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { texFactorisation } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const titre = 'Décomposer en facteurs premiers'
export const dateDeModifImportante = '23/10/2026'

/**
 * Décomposer en produit de facteurs premiers un nombre (la décomposition aura 3, 4 ou 5 facteurs premiers)
 * @author Rémi Angot
 */
export const uuid = '7f50c'

export const refs = {
  'fr-fr': ['5N1L-4'],
  'fr-2016': ['5A13'],
  'fr-ch': ['NR'],
}
export default class ExerciceDecomposerEnFacteursPremiers extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      '1 : 3 facteurs\n2 : 4 facteurs\n3 : 5 facteurs',
    ]
    this.besoinFormulaire2CaseACocher = ['Grands nombres (une fois sur quatre)']

    this.spacing = 2
    this.nbQuestions = 6
    this.sup = 2 // 4 facteurs par défaut
    this.sup2 = false // pas de multiplication par 100
    this.sup3 = false // Que pour les 2ndes
    this.sup4 = false // Decomposition avec des puissances
    this.besoinFormulaire5Numerique = besoinFormulaireVerificationMultiLignes
    this.sup5 = 2
    this.comment = commentaireMultiLignes
    this.correctionDetailleeDisponible = true // booléen qui indique si une correction détaillée est disponible.
    this.correctionDetaillee = true // booléen indiquant si la correction détaillée doit être affiché par défaut (récupéré dans l'url avec le paramètre `,cd=`).
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? "Écrire les nombres suivants sous la forme d'un produit de facteurs premiers."
        : "Écrire le nombre suivant sous la forme d'un produit de facteurs premiers."
    let grandNombres
    let listeFacteurs1, listeFacteurs2
    if (this.sup3) {
      listeFacteurs1 = [2, 3, 5, 7, 11]
      listeFacteurs2 = [2, 3, 7, 13, 17]
    } else {
      listeFacteurs1 = [2, 3, 5]
      listeFacteurs2 = [2, 5, 7, 11]
    }
    if (this.sup2 && this.sup3) {
      grandNombres = combinaisonListes(
        [true, true, false, true],
        this.nbQuestions,
      )
    } else if (this.sup2) {
      switch (this.nbQuestions) {
        case 1:
          grandNombres = [true]
          break
        case 2:
          grandNombres = combinaisonListes([true, false], this.nbQuestions)
          break
        case 3:
          grandNombres = combinaisonListes(
            [true, false, false],
            this.nbQuestions,
          )
          break
        default:
          grandNombres = combinaisonListes(
            [true, false, false, false],
            this.nbQuestions,
          )
      }
    } else {
      grandNombres = combinaisonListes(
        [false, false, false, false],
        this.nbQuestions,
      )
    }
    for (
      let i = 0, n, facteurs = [], nbFacteurs, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // On limite le nombre d'essais pour chercher des valeurs nouvelles
      facteurs = []
      nbFacteurs = this.sup + 2
      for (let k = 0; k < nbFacteurs; k++) {
        if (k < nbFacteurs - 1) {
          if (nbFacteurs > 3 && k === 0) {
            if (this.sup3) facteurs.push(choice([2, 3]))
            else facteurs.push(2)
          } else if (nbFacteurs > 4 && k === 1) {
            if (this.sup3) facteurs.push(choice([2, 3]))
            else facteurs.push(2)
          } else {
            if (this.sup3) facteurs.push(choice(listeFacteurs1.concat(7)))
            else facteurs.push(choice(listeFacteurs1))
          }
        } else {
          if (this.sup3) facteurs.push(choice(listeFacteurs2.concat([3, 13])))
          else facteurs.push(choice(listeFacteurs2))
        }
      }
      if (this.sup2 && grandNombres[i]) {
        // Une fois sur 4 on multilie le nombre par 100 (par 60 pour le niveau 2nde)
        if (this.sup3) facteurs.push(2, 2, 3, 5)
        else facteurs.push(2, 2, 5, 5)
      }
      n = 1
      for (let k = 0; k < facteurs.length; k++) {
        n = n * facteurs[k]
      }
      texte = '$ ' + texNombre(n) + '$'
      texteCorr = ''
      if (!this.correctionDetaillee)
        texteCorr += '$ ' + texNombre(n) + ' = $' + sp()

      facteurs.sort(compareNombres) // classe les facteurs dans l'ordre croissant
      let produitRestant = 1
      let debutDecomposition = ''
      let decompositionFinale = ''
      for (let k = 0; k < facteurs.length - 1; k++) {
        if (!this.sup3 && !this.sup4) {
          if (!this.correctionDetaillee) {
            texteCorr += `$${miseEnEvidence(texNombre(facteurs[k]) + ' \\times ')}$`
          }
        }
        if (this.correctionDetaillee) {
          debutDecomposition += texNombre(facteurs[k]) + ' \\times  '
          for (let j = k + 1; j < facteurs.length; j++) {
            produitRestant = produitRestant * facteurs[j]
          }
          // Avec des puissances, seule la dernière ligne est un produit de facteurs premiers
          const ligneInutile =
            (this.sup3 || this.sup4) && k === facteurs.length - 2
          if (!ligneInutile) {
            texteCorr +=
              '$' +
              texNombre(n) +
              ' = ' +
              debutDecomposition +
              texNombre(produitRestant) +
              '$<br>'
          }
          decompositionFinale =
            sp() + debutDecomposition + texNombre(produitRestant)
          produitRestant = 1
        }
      }

      if (!this.sup3 && !this.sup4) {
        if (!this.correctionDetaillee) {
          texteCorr += `$${miseEnEvidence(texNombre(facteurs[facteurs.length - 1]))}$`
        }
      } else {
        if (this.correctionDetaillee)
          texteCorr += '$ ' + texNombre(n) + ' =' + sp() + ' $'
        decompositionFinale = sp() + texFactorisation(n, true)
        texteCorr += `$${miseEnEvidence(decompositionFinale)}$`
        if (this.correctionDetaillee) texteCorr += '<br>'
      }
      if (this.correctionDetaillee) {
        texteCorr += `<br>Donc la décomposition en produit de facteurs premiers de $${miseEnEvidence(texNombre(n), 'black')}$ est $${miseEnEvidence(decompositionFinale)}$.`
      }

      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: texte + '\n',
          propositions: [
            {
              texte: texteCorr,
              statut: 5,
              sanscadre: false,
              pointilles: true,
              feedback: '',
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }
      handleAnswers(this, i, {
        reponse: {
          value: texFactorisation(n),
          compare: all([isEqual(), isPrimeFactorization()]),
        },
      })
      // En interactif, le nombre est écrit sur la même ligne que le « = » et le champ
      const champ = addPossibleMultiLinesAnswer(this, i, {
        prefix: `${texNombre(n)} =`,
        // Les chiffres et le signe × suffisent, sauf si la correction attend des puissances
        style:
          this.sup3 || this.sup4
            ? KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets
            : KeyboardType.clavierChiffresEtMultiplication,
        bareme: baremeMultiLignes(this.sup5),
        produitSeulement: true,
        valeurDeDepart: texNombre(n),
        enLigne: true,
      })
      if (champ !== '') texte = champ

      if (this.questionJamaisPosee(i, ...facteurs)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        if (!context.isHtml) {
          this.canEnonce = `Décomposer $${texNombre(n)}$ en produit de facteurs premiers. `
          this.correction = this.listeCorrections[0]
          this.canReponseACompleter = `$${texNombre(n)}=\\ldots$`
          this.listeCanEnonces.push(this.canEnonce)
          this.listeCanReponsesACompleter.push(this.canReponseACompleter)
        }
        i++
      }

      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
