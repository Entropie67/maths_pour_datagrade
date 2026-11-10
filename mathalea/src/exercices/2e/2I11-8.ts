import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer et exprimer des proportions'
export const dateDePublication = '08/07/2026'
export const dateDeModifImportante = '10/10/2026'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const uuid = 'e9a72'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': ['2I11-8'],
  'fr-ch': [],
}

type Contexte = {
  organisation: string
  totalLabel: string
  categorie1: string
  categorie2: string
  categorie3: string
}

function formatPourcentage(pourcentage: number): string {
  return `${texNombre(pourcentage, 0)}\\,\\%`
}

function de(groupe: string): string {
  return /^[aeiouyéèêàâ]/i.test(groupe) ? `d'${groupe}` : `de ${groupe}`
}

function ajoutePropositionUnique(
  propositions: { texte: string; statut: boolean }[],
  texte: string,
  statut: boolean,
): void {
  if (!propositions.some((proposition) => proposition.texte === texte)) {
    propositions.push({ texte, statut })
  }
}

export default class ProportionsEntreprise extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.sup = false
    this.besoinFormulaireCaseACocher = ['Version QCM', false]
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    const contextes: Contexte[] = [
      {
        organisation: 'Une entreprise',
        totalLabel: 'salariés',
        categorie1: 'cadres',
        categorie2: 'techniciens',
        categorie3: 'employés',
      },
      {
        organisation: 'Une association',
        totalLabel: 'adhérents',
        categorie1: 'membres du bureau',
        categorie2: 'bénévoles réguliers',
        categorie3: 'autres adhérents',
      },
      {
        organisation: 'Un club sportif',
        totalLabel: 'licenciés',
        categorie1: 'entraineurs',
        categorie2: 'joueurs seniors',
        categorie3: 'jeunes licenciés',
      },
      {
        organisation: 'Un établissement',
        totalLabel: 'élèves',
        categorie1: 'élèves internes',
        categorie2: 'élèves demi-pensionnaires',
        categorie3: 'élèves externes',
      },
    ]

    const contexte = choice(contextes)
    const total = choice([200, 300, 400, 500, 600, 800])
    const pourcentageCategorie1 = choice([4, 5, 6, 7, 8, 9, 10, 12])
    const effectifCategorie1 = (total * pourcentageCategorie1) / 100
    const proportionCategorie2 = choice([
      new FractionEtendue(1, 2),
      new FractionEtendue(3, 5),
      new FractionEtendue(3, 4),
      new FractionEtendue(4, 5),
    ])
    const pourcentageCategorie2 =
      (100 * proportionCategorie2.num) / proportionCategorie2.den
    const pourcentageCategorie3 =
      100 - pourcentageCategorie1 - pourcentageCategorie2

    const compose = contexte.organisation.startsWith('Une ')
      ? 'composée'
      : 'composé'
    const introduction = `${contexte.organisation} de $${total}$ ${contexte.totalLabel} est ${compose} ${de(contexte.categorie1)}, ${de(contexte.categorie2)} et ${de(contexte.categorie3)}.`
    const enonceQuestion1 = `On compte $${effectifCategorie1}$ ${contexte.categorie1}.<br>Calculer la proportion des ${contexte.categorie1} parmi les ${contexte.totalLabel}, sous forme d'un pourcentage.`
    const enonceQuestion2 = `La proportion des ${contexte.categorie2} parmi les ${contexte.totalLabel} est égale à $${proportionCategorie2.texFraction}$.<br>Calculer la proportion des ${contexte.categorie3} parmi les ${contexte.totalLabel}, sous forme d'un pourcentage.`
    this.consigne = ''
    let texte = `${introduction}<br>
    ${numAlpha(0)}${enonceQuestion1}<br>
    ${numAlpha(1)}${enonceQuestion2}`

    const correctionQuestion1 = `On note $E$ l'ensemble des ${contexte.totalLabel}. Son effectif est $n_E=${total}$.<br>
    On note $A$ l'ensemble des ${contexte.categorie1}. Son effectif est $n_A=${effectifCategorie1}$.<br>
    La proportion des ${contexte.categorie1} parmi les ${contexte.totalLabel} est donc :
    $p_A=\\dfrac{${effectifCategorie1}}{${total}}=\\dfrac{${pourcentageCategorie1}}{100}=${miseEnEvidence(texNombre(pourcentageCategorie1, 0))}\\,\\%$.`
    const correctionQuestion2 = `La proportion des ${contexte.categorie1} est égale à $${formatPourcentage(pourcentageCategorie1)}$ et la proportion des ${contexte.categorie2} est égale à $${proportionCategorie2.texFraction}$, c'est-à-dire $${formatPourcentage(pourcentageCategorie2)}$.<br>
    La proportion des ${contexte.categorie3} est donc égale à :
    $100\\,\\%-${formatPourcentage(pourcentageCategorie1)}-${formatPourcentage(pourcentageCategorie2)}=${formatPourcentage(pourcentageCategorie3)}$.<br>
    La proportion des ${contexte.categorie3} est donc $${miseEnEvidence(texNombre(pourcentageCategorie3, 0))}\\,\\%$.`
    const correction = `${numAlpha(0)}${correctionQuestion1}<br>${numAlpha(1)}${correctionQuestion2}`

    if (this.sup || context.isAmc) {
      this.nbQuestions = 2
      this.consigne = introduction
      const propositionsQuestion1: { texte: string; statut: boolean }[] = []
      ajoutePropositionUnique(
        propositionsQuestion1,
        `$${formatPourcentage(pourcentageCategorie1)}$`,
        true,
      )
      ajoutePropositionUnique(
        propositionsQuestion1,
        `$${formatPourcentage(effectifCategorie1)}$`,
        false,
      )
      ajoutePropositionUnique(
        propositionsQuestion1,
        `$${formatPourcentage(pourcentageCategorie2)}$`,
        false,
      )
      ajoutePropositionUnique(
        propositionsQuestion1,
        `$${formatPourcentage(100 - pourcentageCategorie1)}$`,
        false,
      )
      ajoutePropositionUnique(
        propositionsQuestion1,
        `$${formatPourcentage(pourcentageCategorie1 + 10)}$`,
        false,
      )
      this.autoCorrection[0] = {
        enonce: enonceQuestion1,
        options: { radio: true },
        propositions: propositionsQuestion1.slice(0, 4),
      }
      let texteQuestion1 = `${this.autoCorrection[0].enonce}`
      const qcmQuestion1 = propositionsQcm(this, 0)
      texteQuestion1 += qcmQuestion1.texte

      const propositionsQuestion2: { texte: string; statut: boolean }[] = []
      ajoutePropositionUnique(
        propositionsQuestion2,
        `$${formatPourcentage(pourcentageCategorie3)}$`,
        true,
      )
      ajoutePropositionUnique(
        propositionsQuestion2,
        `$${formatPourcentage(100 - pourcentageCategorie1)}$`,
        false,
      )
      ajoutePropositionUnique(
        propositionsQuestion2,
        `$${formatPourcentage(100 - pourcentageCategorie2)}$`,
        false,
      )
      ajoutePropositionUnique(
        propositionsQuestion2,
        `$${formatPourcentage(pourcentageCategorie3 + 10)}$`,
        false,
      )
      ajoutePropositionUnique(
        propositionsQuestion2,
        `$${formatPourcentage(Math.max(0, pourcentageCategorie3 - 10))}$`,
        false,
      )
      this.autoCorrection[1] = {
        enonce: enonceQuestion2,
        options: { radio: true },
        propositions: propositionsQuestion2.slice(0, 4),
      }
      let texteQuestion2 = `${this.autoCorrection[1].enonce}`
      const qcmQuestion2 = propositionsQcm(this, 1)
      texteQuestion2 += qcmQuestion2.texte

      this.listeQuestions[0] = texteQuestion1
      this.listeQuestions[1] = texteQuestion2
      this.listeCorrections[0] = correctionQuestion1
      this.listeCorrections[1] = correctionQuestion2
    } else if (this.interactif) {
      this.nbQuestions = 1
      texte = `${introduction}<br>${addMultiMathfield(this, 0, {
        dataTemplate: `${numAlpha(0)}${enonceQuestion1}<br>%{champ1}<br>
        ${numAlpha(1)}${enonceQuestion2}<br>%{champ2}`,
        dataOptions: {
          champ1: {
            keyboard: KeyboardType.clavierDeBase,
            texteApres: '$\\,\\%$',
          },
          champ2: {
            keyboard: KeyboardType.clavierDeBase,
            texteApres: '$\\,\\%$',
          },
        },
      })}`
      handleAnswers(
        this,
        0,
        {
          champ1: { value: pourcentageCategorie1 },
          champ2: { value: pourcentageCategorie3 },
        },
        { formatInteractif: 'multi-mathfield' },
      )
      this.listeQuestions[0] = texte
      this.listeCorrections[0] = correction
    } else {
      this.nbQuestions = 1
      this.listeQuestions[0] = texte
      this.listeCorrections[0] = correction
    }

    listeQuestionsToContenu(this)
  }
}
