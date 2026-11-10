import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const titre = 'Traduire une phrase par une probabilité'
export const dateDePublication = '07/08/2026'
export const amcReady = true
export const interactifReady = true

export const dateDeModifImportante = '23/10/2026'

export const uuid = '289ab'
export const refs = {
  'fr-fr': ['1A-P06-1'],
  'fr-ch': [],
}

type TypeProbabilite = 'conditionnelle' | 'intersection' | 'totale'

type Situation = {
  introduction: string
  individu: string
  population: string
  evenementE: string
  evenementF: string
  ePluriel: string
  fPluriel: string
}

/**
 * Identifier une probabilité conditionnelle, une intersection ou une probabilité totale à partir d'une phrase.
 * @author Stéphane Guyon
 */
export default class TraduirePhraseParProbabilite extends ExerciceQcmACourt {
  private bonneReponse = ''
  private enonceOuvert = ''
  private valeurProbabilite = ''

  private appliqueLesValeurs(
    situation: Situation,
    typeProbabilite: TypeProbabilite,
    pourcentage: number,
  ) {
    const valeur = texNombre(pourcentage / 100, 2)
    let donnee: string
    let bonneReponse: string
    let explication: string
    let distracteurs: string[]

    if (typeProbabilite === 'conditionnelle') {
      donnee = `$${pourcentage} \\,\\%$ des ${situation.population} qui ${situation.ePluriel} ${situation.fPluriel}.`
      bonneReponse = 'P_E(F)'
      distracteurs = ['P(E\\cap F)', 'P(F)', 'P_F(E)']
      explication = `La phrase «\u00a0$${pourcentage} \\,\\%$ des ${situation.population} qui ${situation.ePluriel} ${situation.fPluriel}\u00a0» indique que l'on se place parmi les ${situation.population} qui ${situation.ePluriel}, c'est-à-dire parmi ceux qui réalisent $E$. On cherche, dans cette population de référence, la proportion de ceux qui réalisent $F$.<br>
      Il s'agit donc de la probabilité conditionnelle $${miseEnEvidence('P_E(F)')}$.`
    } else if (typeProbabilite === 'intersection') {
      donnee = `$${pourcentage} \\,\\%$ des ${situation.population} ${situation.ePluriel} et ${situation.fPluriel}.`
      bonneReponse = 'P(E\\cap F)'
      distracteurs = ['P_E(F)', 'P(F)', 'P(E\\cup F)']
      explication = `Les individus considérés réalisent à la fois $E$ et $F$. Cela correspond à l'intersection $E\\cap F$.<br>
      Il s'agit donc de la probabilité $${miseEnEvidence('P(E\\cap F)')}$.`
    } else {
      donnee = `$${pourcentage} \\,\\%$ de l'ensemble des ${situation.population} ${situation.fPluriel}.`
      bonneReponse = 'P(F)'
      distracteurs = ['P_E(F)', 'P(E\\cap F)', 'P(\\overline{E}\\cap F)']
      explication = `La proportion est donnée parmi l'ensemble des ${situation.population}, sans condition supplémentaire. Elle correspond donc à une probabilité totale.`
    }

    this.bonneReponse = bonneReponse
    this.enonceOuvert = `${situation.introduction}<br>
    On note :<br>
    $\\bullet$ $E$ : «\u00a0${situation.evenementE}\u00a0» ;<br>
    $\\bullet$ $F$ : «\u00a0${situation.evenementF}\u00a0».<br><br>
    ${donnee}<br><br>
    À l'aide des événements $E$ et $F$, compléter :`
    this.valeurProbabilite = valeur
    this.texteApresReponseCourte = `$=${valeur}$.`

    this.reponses = [
      `$${bonneReponse}$`,
      ...distracteurs.map((reponse) => `$${reponse}$`),
    ]
    this.enonce = `${situation.introduction}<br>
    On note :<br>
    $\\bullet$ $E$ : «\u00a0${situation.evenementE}\u00a0» ;<br>
    $\\bullet$ $F$ : «\u00a0${situation.evenementF}\u00a0».<br><br>
    ${donnee}<br><br>
    En utilisant les événements $E$ et $F$, quelle probabilité est égale à $${valeur}$ ?`

    this.correction = `${explication}<br>
    On a donc : $${miseEnEvidence(bonneReponse)}=${valeur}$.`
  }

  versionAleatoire = () => {
    const situations: Situation[] = [
      {
        introduction: 'Dans un lycée, on choisit au hasard un élève.',
        individu: 'élève',
        population: 'élèves',
        evenementE: 'l’élève est en classe de terminale',
        evenementF: 'l’élève est demi-pensionnaire',
        ePluriel: 'sont en classe de terminale',
        fPluriel: 'sont demi-pensionnaires',
      },
      {
        introduction: 'Dans une médiathèque, on choisit au hasard un abonné.',
        individu: 'abonné',
        population: 'abonnés',
        evenementE: 'l’abonné utilise le service numérique',
        evenementF: 'l’abonné a emprunté un roman ce mois-ci',
        ePluriel: 'utilisent le service numérique',
        fPluriel: 'ont emprunté un roman ce mois-ci',
      },
      {
        introduction: 'Dans un club sportif, on choisit au hasard un adhérent.',
        individu: 'adhérent',
        population: 'adhérents',
        evenementE: 'l’adhérent possède une licence de compétition',
        evenementF: 'l’adhérent participe à l’entraînement hebdomadaire',
        ePluriel: 'possèdent une licence de compétition',
        fPluriel: 'participent à l’entraînement hebdomadaire',
      },
    ]
    const typesProbabilites: TypeProbabilite[] = [
      'conditionnelle',
      'intersection',
      'totale',
    ]
    this.appliqueLesValeurs(
      choice(situations),
      choice(typesProbabilites),
      randint(20, 85),
    )
  }

  constructor() {
    super()
    this.options.ordered = context.isTypst
    this.reponseCourte = () => this.bonneReponse
    this.enonceCourt = () =>
      this.interactif
        ? this.enonceOuvert
        : `${this.enonceOuvert} $\\ldots=${this.valeurProbabilite}$.`
    this.champReponseCourteEnLigne = true
    this.clavierReponseCourte = KeyboardType.clavierEntierementPersonnalisable
    this.optionsChampReponseCourte = {
      dataKeys: [
        ['P', 'E', 'F'],
        ['INDICE', '(', ')'],
        ['\\cap', '\\cup'],
      ],
    }
    this.compareReponseCourte = (brut, reponse) => {
      // La touche d'indice produit `P_{E}(F)` : les accolades d'un indice d'une lettre sont superflues.
      const saisie = brut.replace(/_\{([A-Za-z])\}/g, '_$1')
      const resultat = fonctionComparaison(saisie, reponse, {
        texteAvecCasse: true,
      })
      if (resultat.isOk || reponse !== 'P(E\\cap F)') return resultat
      return fonctionComparaison(saisie, 'P(F\\cap E)', {
        texteAvecCasse: true,
      })
    }
    this.versionAleatoire()
  }
}
