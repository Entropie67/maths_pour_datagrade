import { bleuMathalea } from '../../lib/colors'
import { propositionsQcm } from '../../lib/interactif/qcm'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import operation from '../../modules/operations'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Résoudre des problèmes utilisant la division euclidienne ($1$)'

// Gestion de la date de publication initiale
export const dateDePublication = '11/12/2023'
export const dateDeModifImportante = '09/01/2025'
export const interactifReady = true

/**
 * Résolution de problèmes utilisant la division Euclidienne
 * @author Mickael Guironnet
 */

export const uuid = 'z802x'

export const refs = {
  'fr-fr': ['6N2K'],
  'fr-2016': [''],
  'fr-ch': ['9R1NO1E-12', '9R2NO1E-12', '9R3NO1E-12'],
}
export default class QuestionsDivisionsEuclidiennes extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Résoudre les problèmes suivants.'
        : 'Résoudre le problème suivant.'

    const questionsDisponibles = [4]
    let indiceInteractif = 0
    let indiceInteractifAvant = 0
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      indiceInteractifAvant = indiceInteractif
      let diviseur, quotient, reste, dividende
      switch (questionsDisponibles[i]) {
        case 4:
        default: {
          // problème sur le jour de semaine
          diviseur = 7
          quotient = randint(11, 19)
          reste = randint(2, diviseur - 1)
          dividende = diviseur * quotient + reste
          const table = [
            'lundi',
            'mardi',
            'mercredi',
            'jeudi',
            'vendredi',
            'samedi',
            'dimanche',
          ]
          const jour = randint(0, 6)
          texte = `Aujourd'hui, nous sommes ${table[jour]}. Dans $${dividende}$ jours, quel jour de la semaine serons-nous ?`
          this.autoCorrection[indiceInteractif] = {}
          const autoCorr = this.autoCorrection[indiceInteractif]
          autoCorr.propositions = []
          for (let ee = 0; ee < 7; ee++) {
            autoCorr.propositions[ee] = {
              texte: table[ee],
              statut: (jour + reste) % diviseur === ee,
            }
          }
          this.autoCorrection[indiceInteractif].options = {
            ordered: true,
          }
          texte += '<br>' + propositionsQcm(this, indiceInteractif).texte

          texteCorr = `Posons la division euclidienne de $${dividende}$ par $${diviseur}$. <br>`
          texteCorr +=
            operation({
              operande1: dividende,
              operande2: diviseur,
              type: 'divisionE',
              options: { solution: true, colore: bleuMathalea },
            }) +
            `$${miseEnEvidence(`${texNombre(dividende)}=(${diviseur}\\times${texNombre(quotient)})+ ${texNombre(reste)}`, bleuMathalea)}$`
          texteCorr += `<br>Il se sera écoulé ${texteEnCouleurEtGras(`$\\mathbf{${quotient}}$`, bleuMathalea)} semaines complètes et ${texteEnCouleurEtGras(`$\\mathbf{${reste}}$`, bleuMathalea)} jours.`
          texteCorr += `<br>Donc nous serons $${reste}$ jours de plus que ${table[jour]}, soit ${texteEnCouleurEtGras(table[(jour + reste) % diviseur])}.`
          indiceInteractif++
          break
        }
      }
      if (this.questionJamaisPosee(i, dividende, diviseur)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      } else indiceInteractif = indiceInteractifAvant
      cpt++
    } // fin du for

    listeQuestionsToContenu(this)
  }
}
