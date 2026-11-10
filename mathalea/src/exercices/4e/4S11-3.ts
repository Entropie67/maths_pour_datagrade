import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { entreprise } from '../../lib/outils/entreprises'
import { numAlpha } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Différencier moyenne et médiane sur les salaires d'une entreprise"

export const interactifReady = true

export const dateDePublication = '15/05/2026'

export const uuid = '0f388'
export const refs = {
  'fr-fr': ['4S11-3'],
  'fr-ch': [''],
}
/**
 * Différencier moyenne et médiane sur les salaires d'une entreprise :
 * L'une a beaucoup de petits salaires et un gros, l'autre a des salaires homogènes.
 * @author Mireille Gain
 * 12/10/2026 : Olivier Mimeau : Détailler la consigne + Factorisation
 */
export default class MedianeMoyenneSalaires extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['détailler la consigne']
    this.sup = true
    this.nbQuestions = 2
  }

  nouvelleVersion() {
    const consigneDetaillee = this.sup
    const typeQuestionsDisponibles = ['EntreprisePDG', 'EntrepriseCoop']
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    this.consigne = consigneDetaillee
      ? ''
      : this.nbQuestions > 1
        ? 'Calculer la moyenne et la médiane des salaires dans chacune de ces entreprises, et cocher la bonne interprétation.'
        : 'Calculer la moyenne et la médiane des salaires dans cette entreprise, et cocher la bonne interprétation.'

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const indiceSalaireBase = randint(17, 22)
      const S1 = indiceSalaireBase * 100
      const S2 = S1 + choice([0, 2]) * 50
      const S3 = S2 + choice([1, 3]) * 50
      const S4 = S3 + choice([0, 3]) * 50
      const S5pdg = indiceSalaireBase * 1000
      const S5coop = S4 + choice([1, 3]) * 50

      let texte = ''
      let texteCorr = ''
      const entreprisePdg = entreprise(1)
      const entrepriseCoop = entreprise(1)
      let moyenne = 0
      this.autoCorrection[2 * i + 1] = {}
      this.autoCorrection[2 * i + 1].options = {
        ordered: true,
        radio: true,
        vertical: true,
      }
      let salairesTexte = ''
      let reponseInterpretation = ''
      const InterpretationPdg =
        'Dans cette entreprise, la moyenne des salaires est très supérieure à la médiane, ce qui signifie que le plus haut salaire augmente fortement la moyenne.'
      const InterpretationCoop =
        'Dans cette entreprise, la moyenne et la médiane des salaires sont proches, ce qui peut signifier que les salaires sont proches les uns des autres.'
      const estEntrepriseCoop = listeTypeQuestions[i] === 'EntrepriseCoop'
      switch (listeTypeQuestions[i]) {
        case 'EntreprisePDG':
          {
            moyenne = (S1 + S2 + S3 + S4 + S5pdg) / 5
            reponseInterpretation += `Dans ${entreprisePdg}, la moyenne ($${texNombre(moyenne)}$ €) est très supérieure à la médiane ($${texNombre(S3)}$ €).<br>`
            reponseInterpretation += `Cela signifie que le plus haut salaire augmente fortement la moyenne des salaires, et que les salaires sont majoritairement très inférieurs à cette moyenne.<br><br>`
            reponseInterpretation += `La bonne interprétation était donc :<br> ${texteEnCouleurEtGras(InterpretationPdg)} `
          }
          break
        default:
          {
            // 'EntrepriseCoop':
            moyenne = (S1 + S2 + S3 + S4 + S5coop) / 5
            reponseInterpretation += `Dans ${entrepriseCoop}, la moyenne ($${texNombre(moyenne)}$ €) et la médiane ($${texNombre(S3)}$ €) sont proches.<br>`
            reponseInterpretation += `Cela signifie que les salaires sont proches les uns des autres.<br><br>`
            reponseInterpretation += `La bonne interprétation était donc : <br> ${texteEnCouleurEtGras(InterpretationCoop)} `
          }
          break
      }
      const S5 = estEntrepriseCoop ? S5coop : S5pdg
      const salaires = [
        texNombre(S1),
        texNombre(S2),
        texNombre(S3),
        texNombre(S4),
        texNombre(S5),
      ]
      const salairesMelanges = shuffle([...salaires])
      salairesTexte = salairesMelanges
        .map((s) => `$${s}\\,\\text{€}$`)
        .join(', ')
      texte += `Dans ${estEntrepriseCoop ? entrepriseCoop : entreprisePdg}, les salaires sont les suivants : <br>`
      texte += `${salairesTexte}.<br><br>`

      texteCorr += consigneDetaillee ? `${numAlpha(0)} ` : ``
      texteCorr += `Le salaire moyen dans ${estEntrepriseCoop ? entrepriseCoop : entreprisePdg} est : <br>`
      texteCorr += `$(${texNombre(S1)}\\,\\text{€} + ${texNombre(S2)}\\,\\text{€} + ${texNombre(S3)}\\,\\text{€} + ${texNombre(S4)}\\,\\text{€} + ${texNombre(S5)}\\,\\text{€}) \\div 5 = ${miseEnEvidence(texNombre(moyenne))}~\\text{€}.$<br>`
      texteCorr += consigneDetaillee ? `${numAlpha(1)} ` : ``
      texteCorr += `Les salaires ordonnés du plus petit au plus grand sont : `
      texteCorr += `$ ${texNombre(S1)}\\,\\text{€} , ${texNombre(S2)}\\,\\text{€} , ${texNombre(S3)}\\,\\text{€} , ${texNombre(S4)}\\,\\text{€} , ${texNombre(S5)}\\,\\text{€}. $<br>`
      texteCorr += `La médiane des salaires est donc égale au troisième salaire par ordre croissant : `
      texteCorr += `$${miseEnEvidence(texNombre(S3))}~\\text{€} $<br><br>`
      texteCorr += consigneDetaillee ? `${numAlpha(2)} ` : ``
      texteCorr += reponseInterpretation
      this.autoCorrection[2 * i + 1].propositions = [
        {
          texte: InterpretationCoop,
          statut: estEntrepriseCoop,
        },
        {
          texte: InterpretationPdg,
          statut: !estEntrepriseCoop,
        },
      ]
      if (this.interactif) {
        const textDataTemplate = `
              ${consigneDetaillee ? `${numAlpha(0)}` : ''}Moyenne des salaires dans ${estEntrepriseCoop ? entrepriseCoop : entreprisePdg} : %{champ1} €
              ${consigneDetaillee ? `${numAlpha(1)}` : ' '}Médiane des salaires dans ${estEntrepriseCoop ? entrepriseCoop : entreprisePdg} : %{champ2} €
              ${consigneDetaillee ? `${numAlpha(2)}Cocher la bonne interprétation :` : ''}`
        texte += addMultiMathfield(this, 2 * i, {
          dataTemplate: textDataTemplate,
          dataOptions: {
            champ1: {
              keyboard: KeyboardType.clavierDeBase,
            },
            champ2: {
              keyboard: KeyboardType.clavierDeBase,
            },
          },
        })
      } else {
        texte += consigneDetaillee
          ? `${numAlpha(0)} Calculer la moyenne des salaires dans cette entreprise.<br>${numAlpha(1)} Calculer la médiane des salaires dans cette entreprise.<br>${numAlpha(2)} Cocher la bonne interprétation.`
          : ''
      }
      handleAnswers(
        this,
        2 * i,
        {
          champ1: { value: moyenne },
          champ2: { value: S3 },
        },
        { formatInteractif: 'multi-mathfield' },
      )

      const props = propositionsQcm(this, 2 * i + 1)
      texte += props.texte

      // Ajouter la question à la liste
      this.listeQuestions[i] = texte

      if (this.questionJamaisPosee(i, S1, S2, S3, S4, S5pdg, S5coop)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
