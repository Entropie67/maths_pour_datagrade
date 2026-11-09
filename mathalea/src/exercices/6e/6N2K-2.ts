import { bleuMathalea } from '../../lib/colors'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import operation from '../../modules/operations'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Résoudre des problèmes utilisant la division euclidienne ($3$)'

// Gestion de la date de publication initiale
export const dateDePublication = '11/12/2023'
export const dateDeModifImportante = '09/01/2025'
export const interactifReady = true

/**
 * Résolution de problèmes utilisant la division Euclidienne
 * @author Mickael Guironnet
 */

export const uuid = '6a95e'

export const refs = {
  'fr-fr': ['6N2K-2'],
  'fr-2016': [''],
  'fr-ch': ['9R1NO1E-14', '9R2NO1E-14', '9R3NO1E-14'],
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

    const questionsDisponibles = [7]
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let diviseur, dividende
      switch (questionsDisponibles[i]) {
        case 7:
        default: {
          // problème sur perle d'un collier
          const nbPerlesJaune = randint(4, 9)
          const nbPerlesRouge = randint(4, 9, [nbPerlesJaune])
          const nbColliers = randint(22, 38)
          const plus = choice([false, true])
            ? [0, randint(10, 25)]
            : [randint(10, 25), 0]
          const nbPerlesJauneTotal = nbPerlesJaune * nbColliers + plus[0]
          const nbPerlesRougeTotal = nbPerlesRouge * nbColliers + plus[1]
          const nbColliersRouge = Math.floor(nbPerlesRougeTotal / nbPerlesRouge)
          const nbColliersJaune = Math.floor(nbPerlesJauneTotal / nbPerlesJaune)
          diviseur = nbColliers
          dividende = nbPerlesJauneTotal
          texte = `Un bijoutier fabrique des colliers avec des perles. Il décide de mettre $${nbPerlesJaune}$ perles jaunes et $${nbPerlesRouge}$ perles rouges par collier. Il possède $${nbPerlesRougeTotal}$ perles rouges et $${nbPerlesJauneTotal}$ perles jaunes.<br>`
          const tailleClavier = 50
          let texteQuestions = ` a) Combien pourra-t-il fabriquer de colliers ? %{champ1} \n `
          texteQuestions += ` b) Combien lui restera-t-il de perles jaunes ? %{champ2} \n `
          texteQuestions += ` c) Combien lui restera-t-il de perles rouges ? %{champ3}`
          texte += addMultiMathfield(this, i, {
            dataTemplate: texteQuestions,
            dataOptions: {
              champ1: {
                keyboard: KeyboardType.clavierNumbers,
                minWidth: tailleClavier,
              },
              champ2: {
                keyboard: KeyboardType.clavierNumbers,
                minWidth: tailleClavier,
              },
              champ3: {
                keyboard: KeyboardType.clavierNumbers,
                minWidth: tailleClavier,
              },
            },
          })
          texteCorr = `${texteEnCouleurEtGras('a)', bleuMathalea)} Posons la division euclidienne de $${texNombre(nbPerlesJauneTotal)}$ par $${nbPerlesJaune}$. <br>`
          texteCorr +=
            operation({
              operande1: nbPerlesJauneTotal,
              operande2: nbPerlesJaune,
              type: 'divisionE',
              options: { solution: true, colore: bleuMathalea },
            }) +
            `$${miseEnEvidence(`${texNombre(nbPerlesJauneTotal)}=${nbPerlesJauneTotal - nbPerlesJaune * nbColliersJaune === 0 ? `${nbPerlesJaune}\\times${texNombre(nbColliersJaune)}` : `(${nbPerlesJaune}\\times${texNombre(nbColliersJaune)})+ ${nbPerlesJauneTotal - nbPerlesJaune * nbColliersJaune}`}`, bleuMathalea)}$`
          texteCorr += `<br>Il peut faire $${miseEnEvidence(texNombre(nbColliersJaune), bleuMathalea)}$ colliers avec les perles jaunes.`
          texteCorr += `<br>Posons la division euclidienne de $${texNombre(nbPerlesRougeTotal)}$ par $${nbPerlesRouge}$. <br>`
          texteCorr +=
            operation({
              operande1: nbPerlesRougeTotal,
              operande2: nbPerlesRouge,
              type: 'divisionE',
              options: { solution: true, colore: bleuMathalea },
            }) +
            `$${miseEnEvidence(`${texNombre(nbPerlesRougeTotal)}=${nbPerlesRougeTotal - nbPerlesRouge * nbColliersRouge === 0 ? `${nbPerlesRouge}\\times${texNombre(nbColliersRouge)}` : `(${nbPerlesRouge}\\times${texNombre(nbColliersRouge)})+ ${nbPerlesRougeTotal - nbPerlesRouge * nbColliersRouge}`}`, bleuMathalea)}$`
          texteCorr += `<br>Il peut faire $${miseEnEvidence(texNombre(nbColliersRouge), bleuMathalea)}$ colliers avec les perles rouges.`
          texteCorr += `<br>Finalement, en prenant en compte les deux couleurs, et puisque $${texNombre(Math.min(nbColliersRouge, nbColliersJaune))}$ < $${texNombre(Math.max(nbColliersRouge, nbColliersJaune))}$, le bijoutier ne pourra faire que $${miseEnEvidence(texNombre(Math.min(nbColliersRouge, nbColliersJaune)))}$ colliers.`
          texteCorr += `<br>${texteEnCouleurEtGras('b)', bleuMathalea)} $${nbPerlesJauneTotal} - (${nbPerlesJaune} \\times ${Math.min(nbColliersRouge, nbColliersJaune)})=${miseEnEvidence(String(nbPerlesJauneTotal - nbPerlesJaune * Math.min(nbColliersRouge, nbColliersJaune)))}$`
          texteCorr +=
            nbPerlesJauneTotal -
              nbPerlesJaune * Math.min(nbColliersRouge, nbColliersJaune) ===
            0
              ? '<br>Il ne restera aucune perle jaune.'
              : `<br>Il restera $${miseEnEvidence(String(nbPerlesJauneTotal - nbPerlesJaune * Math.min(nbColliersRouge, nbColliersJaune)))}$  perles jaunes.`
          texteCorr += `<br>${texteEnCouleurEtGras('c)', bleuMathalea)} $${nbPerlesRougeTotal} - (${nbPerlesRouge} \\times ${Math.min(nbColliersRouge, nbColliersJaune)})=${miseEnEvidence(String(nbPerlesRougeTotal - nbPerlesRouge * Math.min(nbColliersRouge, nbColliersJaune)))}$`
          texteCorr +=
            nbPerlesRougeTotal -
              nbPerlesRouge * Math.min(nbColliersRouge, nbColliersJaune) ===
            0
              ? '<br>Il ne restera aucune perle rouge.'
              : `<br>Il restera $${miseEnEvidence(String(nbPerlesRougeTotal - nbPerlesRouge * Math.min(nbColliersRouge, nbColliersJaune)))}$  perles rouges.`
          handleAnswers(
            this,
            i,
            {
              bareme: toutAUnPoint,
              champ1: { value: Math.min(nbColliersRouge, nbColliersJaune) },
              champ2: {
                value:
                  nbPerlesJauneTotal -
                  nbPerlesJaune * Math.min(nbColliersRouge, nbColliersJaune),
              },
              champ3: {
                value:
                  nbPerlesRougeTotal -
                  nbPerlesRouge * Math.min(nbColliersRouge, nbColliersJaune),
              },
            },
            { formatInteractif: 'multi-mathfield' },
          )
          // indiceInteractif += 3
          break
        }
      }
      if (this.questionJamaisPosee(i, dividende, diviseur)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    } // fin du for

    listeQuestionsToContenu(this)
  }
}
