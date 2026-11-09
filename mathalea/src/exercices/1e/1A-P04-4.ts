import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
import { sp } from '../../lib/outils/outilString'

export const titre =
  'Calculer des probabilités conditionnelles et des intersections'
export const dateDePublication = '07/08/2026'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

export const uuid = '330cd'
export const refs = {
  'fr-fr': ['1A-P04-4'],
  'fr-ch': [],
}

type Situation = {
  tirage: string
  population: string
  evenementE: string
  evenementF: string
  eAffirmatif: string
  eNegatif: string
  fAffirmatif: string
  fNegatif: string
}

/**
 * Exploiter des probabilités conditionnelles pour calculer des intersections.
 * @author Stéphane Guyon
 */
export default class ProbabilitesConditionnellesEtIntersections extends ExerciceQcmA {
  private appliqueLesValeurs(
    situation: Situation,
    pourcentageE: number,
    pourcentageFsachantE: number,
    pourcentageFsachantNonE: number,
    donneComplementSachantE: boolean,
    donneComplementSachantNonE: boolean,
  ) {
    const pourcentageNonE = 100 - pourcentageE
    const pourcentageIntersectionEF =
      (pourcentageE * pourcentageFsachantE) / 100
    const pourcentageIntersectionENonF =
      (pourcentageE * (100 - pourcentageFsachantE)) / 100
    const pourcentageIntersectionNonEF =
      (pourcentageNonE * pourcentageFsachantNonE) / 100
    const pourcentageF =
      pourcentageIntersectionEF + pourcentageIntersectionNonEF
    const proba = (pourcentage: number) => texNombre(pourcentage / 100, 3)

    const typesAffirmations = [
      {
        type: 'intersectionEF',
        vraie: `P(E\\cap F)=${proba(pourcentageIntersectionEF)}`,
        fausse: `P(E\\cap F)=${proba(pourcentageFsachantE)}`,
      },
      {
        type: 'intersectionENonF',
        vraie: `P(E\\cap \\overline{F})=${proba(pourcentageIntersectionENonF)}`,
        fausse: `P(E\\cap \\overline{F})=${proba(100 - pourcentageIntersectionENonF)}`,
      },
      {
        type: 'conditionnelleSachantE',
        vraie: `P_E(F)=${proba(pourcentageFsachantE)}`,
        fausse: `P_E(F)=${proba(pourcentageIntersectionEF)}`,
      },
      {
        type: 'conditionnelleSachantNonE',
        vraie: `P_{\\overline{E}}(F)=${proba(pourcentageFsachantNonE)}`,
        fausse: `P_{\\overline{E}}(F)=${proba(pourcentageIntersectionNonEF)}`,
      },
      {
        type: 'probabiliteF',
        vraie: `P(F)=${proba(pourcentageF)}`,
        fausse: `P(F)=${proba(pourcentageIntersectionEF + pourcentageFsachantNonE)}`,
      },
    ]
    const typeBonneAffirmation = choice(typesAffirmations)
    const bonneAffirmation = typeBonneAffirmation.vraie
    const affirmationsFausses = shuffle(
      typesAffirmations.filter(
        (affirmation) => affirmation.type !== typeBonneAffirmation.type,
      ),
    )
      .slice(0, 3)
      .map((affirmation) => affirmation.fausse)
    this.reponses = [
      `$${bonneAffirmation}$`,
      ...affirmationsFausses.map((affirmation) => `$${affirmation}$`),
    ]

    const donneeSachantE = donneComplementSachantE
      ? `$${100 - pourcentageFsachantE}\\,\\%$ ${situation.fNegatif}`
      : `$${pourcentageFsachantE}\\,\\%$ ${situation.fAffirmatif}`
    const donneeSachantNonE = donneComplementSachantNonE
      ? `$${100 - pourcentageFsachantNonE}\\,\\%$ ${situation.fNegatif}`
      : `$${pourcentageFsachantNonE}\\,\\%$ ${situation.fAffirmatif}`

    this.enonce = `${situation.tirage}<br>
    On note $E$ l'événement «${sp()}${situation.evenementE}${sp()}» et $F$ l'événement «${sp()}${situation.evenementF}${sp()}».<br><br>
    $${pourcentageE}\\,\\%$ des ${situation.population} ${situation.eAffirmatif}.<br>
    Parmi ceux qui ${situation.eAffirmatif}, ${donneeSachantE}.<br>
    Parmi ceux qui ${situation.eNegatif}, ${donneeSachantNonE}.<br><br>
    Parmi les affirmations suivantes, laquelle est vraie ?`

    const traductionSachantE = donneComplementSachantE
      ? `La deuxième donnée donne la probabilité de ne pas réaliser $F$ sachant que $E$ est réalisé. C'est donc une probabilité conditionnelle :
      $P_E(\\overline{F})=${proba(100 - pourcentageFsachantE)}$.<br>
      On en déduit $P_E(F)=1-P_E(\\overline{F})=1-${proba(100 - pourcentageFsachantE)}=${proba(pourcentageFsachantE)}$.`
      : `La deuxième donnée donne la probabilité de réaliser $F$ sachant que $E$ est réalisé. C'est donc une probabilité conditionnelle :
      $P_E(F)=${proba(pourcentageFsachantE)}$.`
    const traductionSachantNonE = donneComplementSachantNonE
      ? `La troisième donnée donne la probabilité de ne pas réaliser $F$ sachant que $E$ n'est pas réalisé. C'est donc une probabilité conditionnelle :
      $P_{\\overline{E}}(\\overline{F})=${proba(100 - pourcentageFsachantNonE)}$.<br>
      On en déduit $P_{\\overline{E}}(F)=1-P_{\\overline{E}}(\\overline{F})=1-${proba(100 - pourcentageFsachantNonE)}=${proba(pourcentageFsachantNonE)}$.`
      : `La troisième donnée donne la probabilité de réaliser $F$ sachant que $E$ n'est pas réalisé. C'est donc une probabilité conditionnelle :
      $P_{\\overline{E}}(F)=${proba(pourcentageFsachantNonE)}$.`

    this.correction = `Traduisons séparément chacune des données de l'énoncé.<br>
    La première donnée indique que $${pourcentageE}\\,\\%$ des individus réalisent $E$. Ainsi :
    $P(E)=${proba(pourcentageE)}$.<br>
    Par conséquent, $P(\\overline{E})=1-P(E)=1-${proba(pourcentageE)}=${proba(pourcentageNonE)}$.<br>
    ${traductionSachantE}<br>
    ${traductionSachantNonE}<br>
    On calcule les probabilités des intersections :<br>
    $P(E\\cap F)=P(E)\\times P_E(F)
    =${proba(pourcentageE)}\\times ${proba(pourcentageFsachantE)}
    =${proba(pourcentageIntersectionEF)}$.<br>
    $P(E\\cap \\overline{F})=P(E)\\times P_E(\\overline{F})
    =${proba(pourcentageE)}\\times ${proba(100 - pourcentageFsachantE)}
    =${proba(pourcentageIntersectionENonF)}$.<br>
    $P(\\overline{E}\\cap F)=P(\\overline{E})\\times P_{\\overline{E}}(F)
    =${proba(pourcentageNonE)}\\times ${proba(pourcentageFsachantNonE)}
    =${proba(pourcentageIntersectionNonEF)}$.<br>
    Comme $E$ et $\\overline{E}$ forment une partition de l'univers, la formule des probabilités totales donne :<br>
    $P(F)=P(E\\cap F)+P(\\overline{E}\\cap F)
    =${proba(pourcentageIntersectionEF)}+${proba(pourcentageIntersectionNonEF)}
    =${proba(pourcentageF)}$.<br>
    La seule affirmation vraie est $${miseEnEvidence(bonneAffirmation)}$.`
  }

  versionAleatoire = () => {
    const situations: Situation[] = [
      {
        tirage: 'On choisit au hasard un adhérent dans un club sportif.',
        population: 'adhérents',
        evenementE: 'l’adhérent possède un abonnement annuel',
        evenementF: 'l’adhérent participe à une compétition',
        eAffirmatif: 'possèdent un abonnement annuel',
        eNegatif: 'ne possèdent pas d’abonnement annuel',
        fAffirmatif: 'participent à une compétition',
        fNegatif: 'ne participent pas à une compétition',
      },
      {
        tirage: 'On choisit au hasard un salarié dans une entreprise.',
        population: 'salariés',
        evenementE: 'le salarié travaille à distance',
        evenementF: 'le salarié suit une formation cette année',
        eAffirmatif: 'travaillent à distance',
        eNegatif: 'ne travaillent pas à distance',
        fAffirmatif: 'suivent une formation cette année',
        fNegatif: 'ne suivent pas de formation cette année',
      },
      {
        tirage: 'On choisit au hasard un abonné d’une médiathèque.',
        population: 'abonnés',
        evenementE: 'l’abonné utilise le service numérique',
        evenementF: 'l’abonné a emprunté un roman ce mois-ci',
        eAffirmatif: 'utilisent le service numérique',
        eNegatif: 'n’utilisent pas le service numérique',
        fAffirmatif: 'ont emprunté un roman ce mois-ci',
        fNegatif: 'n’ont pas emprunté de roman ce mois-ci',
      },
      {
        tirage: 'On choisit au hasard un client d’un magasin.',
        population: 'clients',
        evenementE: 'le client possède une carte de fidélité',
        evenementF: 'le client a utilisé une réduction',
        eAffirmatif: 'possèdent une carte de fidélité',
        eNegatif: 'ne possèdent pas de carte de fidélité',
        fAffirmatif: 'ont utilisé une réduction',
        fNegatif: 'n’ont pas utilisé de réduction',
      },
    ]
    const valeursPossibles = [20, 30, 40, 60, 70, 80]
    const pourcentageE = choice([40, 50, 60, 70])
    const pourcentageFsachantE = choice(valeursPossibles)
    const pourcentageFsachantNonE = choice(
      valeursPossibles.filter((valeur) => valeur !== pourcentageFsachantE),
    )
    this.appliqueLesValeurs(
      choice(situations),
      pourcentageE,
      pourcentageFsachantE,
      pourcentageFsachantNonE,
      randint(0, 1) === 1,
      randint(0, 1) === 1,
    )
  }

  constructor() {
    super()
    this.options.ordered = context.isTypst
    this.versionAleatoire()
  }
}
