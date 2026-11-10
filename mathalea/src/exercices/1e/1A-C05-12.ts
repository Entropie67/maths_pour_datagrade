import Decimal from 'decimal.js'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  puissanceDeDix,
  tireNombreOdg,
  touchesPuissanceDeDix,
} from '../../lib/outils/ordreDeGrandeur'
import { prenomF, prenomM } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
import { deDevant, queDevant } from '../../lib/outils/outilString'

export const dateDePublication = '26/10/2026'
export const uuid = 'b6cdf'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': ['1A-C05-12', '2A-N5-12'],
  'fr-ch': [],
}
export const interactifReady = true
export const titre = 'Déterminer un ordre de grandeur d’un rapport'

/** Prénom précédé de « de » ou « d' » */
const de = (prenom: string) => deDevant(prenom)

/** Prénom précédé de « que » ou « qu' » */
const que = (prenom: string) => queDevant(prenom)

type Contexte = {
  /** Énoncé ; `grand` et `petit` sont les deux valeurs écrites en notation scientifique */
  enonce: (a: string, b: string, grand: string, petit: string) => string
  /** Fin de la phrase « Déterminer un ordre de grandeur … du nombre de fois où … » */
  question: (a: string, b: string) => string
  /** Énoncé avec les valeurs remplacées par leurs ordres de grandeur (puissances de 10) */
  approximation: (a: string, b: string, grand: string, petit: string) => string
  /** Conclusion de la correction ; `n` est la puissance de 10 trouvée */
  conclusion: (a: string, b: string, n: string) => string
  /** Exposants possibles (notation scientifique) du grand et du petit nombre */
  exposantsGrand: [number, number]
  exposantsPetit: [number, number]
  /** Le petit nombre est écrit en notation décimale s'il est inférieur à cette valeur */
  petitDecimalSous?: number
}

const contextes: Contexte[] = [
  {
    enonce: (a, b, grand, petit) =>
      `${a} a $${grand}$ abonnés sur un réseau social et ${b} en a $${petit}$.`,
    question: (a, b) => `où ${a} a plus d'abonnés ${que(b)}`,
    approximation: (a, b, grand, petit) =>
      `${a} a environ $${grand}$ abonnés et ${b} en a environ $${petit}$.`,
    conclusion: (a, b, n) =>
      `${a} a environ $${n}$ fois plus d'abonnés ${que(b)}.`,
    exposantsGrand: [4, 5],
    exposantsPetit: [1, 3],
  },
  {
    enonce: (a, b, grand, petit) =>
      `La chanson ${de(a)} a été écoutée $${grand}$ fois et celle ${de(b)} $${petit}$ fois.`,
    question: (a, b) =>
      `où la chanson ${de(a)} a été plus écoutée que celle ${de(b)}`,
    approximation: (a, b, grand, petit) =>
      `La chanson ${de(a)} a été écoutée environ $${grand}$ fois et celle ${de(b)} environ $${petit}$ fois.`,
    conclusion: (a, b, n) =>
      `La chanson ${de(a)} a été environ $${n}$ fois plus écoutée que celle ${de(b)}.`,
    exposantsGrand: [6, 8],
    exposantsPetit: [2, 4],
  },
  {
    enonce: (a, b, grand, petit) =>
      `Le fichier ${de(a)} pèse $${grand}$ octets et celui ${de(b)} pèse $${petit}$ octets.`,
    question: (a, b) =>
      `où le fichier ${de(a)} est plus lourd que celui ${de(b)}`,
    approximation: (a, b, grand, petit) =>
      `Le fichier ${de(a)} pèse environ $${grand}$ octets et celui ${de(b)} environ $${petit}$ octets.`,
    conclusion: (a, b, n) =>
      `Le fichier ${de(a)} est environ $${n}$ fois plus lourd que celui ${de(b)}.`,
    exposantsGrand: [8, 10],
    exposantsPetit: [4, 6],
  },
  {
    enonce: (a, b, grand, petit) =>
      `${a} a économisé $${grand}$ € et ${b} a économisé $${petit}$ €.`,
    question: (a, b) => `où ${a} a économisé plus d'euros ${que(b)}`,
    approximation: (a, b, grand, petit) =>
      `${a} a économisé environ $${grand}$ € et ${b} environ $${petit}$ €.`,
    conclusion: (a, b, n) =>
      `${a} a économisé environ $${n}$ fois plus d'euros ${que(b)}.`,
    exposantsGrand: [4, 4],
    exposantsPetit: [1, 2],
    petitDecimalSous: 300,
  },
]

type NombreOdg = ReturnType<typeof tireNombreOdg>

/**
 * Tire deux nombres (en notation scientifique) dont le rapport exact s'arrondit, sans ambiguïté,
 * à la même puissance de 10 que le quotient de leurs puissances de 10 les plus proches.
 */
function tireCouple(
  exposantsGrand: [number, number],
  exposantsPetit: [number, number],
): { grand: NombreOdg; petit: NombreOdg; exposantRapport: number } {
  let grand = tireNombreOdg(0, 0)
  let petit = grand
  let exposantRapport = 0
  for (let essais = 0; essais < 1000; essais++) {
    grand = tireNombreOdg(randint(...exposantsGrand), 0, true)
    petit = tireNombreOdg(randint(...exposantsPetit), 0, true)
    const rapport = grand.valeur.div(petit.valeur)
    const mantisseRapport = rapport.div(Decimal.pow(10, rapport.e))
    exposantRapport = mantisseRapport.gte(5) ? rapport.e + 1 : rapport.e
    if (
      (mantisseRapport.lt(3) || mantisseRapport.gte(8)) &&
      exposantRapport === grand.exposantOdg - petit.exposantOdg &&
      exposantRapport >= 2
    ) {
      break
    }
  }
  return { grand, petit, exposantRapport }
}

/** Moyens de transport, du plus rapide au plus lent, avec l'exposant (en km) de la distance parcourue */
const transports: { nom: string; exposant: number; metres: boolean }[] = [
  { nom: 'en avion', exposant: 3, metres: false },
  { nom: 'en voiture', exposant: 2, metres: false },
  { nom: 'à vélo', exposant: 1, metres: true },
  { nom: 'à pied', exposant: 0, metres: true },
]

const champ = {
  dataKeys: touchesPuissanceDeDix,
  texteAvant: '<br>Un ordre de grandeur de ce nombre de fois est ',
  texteApres: '.',
}

/** Écriture scientifique `m×10^e` (le facteur 10^0 est omis) */
const ecrit = (nb: NombreOdg, exposant: number) =>
  exposant === 0
    ? texNombre(nb.mantisse)
    : `${texNombre(nb.mantisse)}\\times10^{${exposant}}`

const consigne = (fin: string) =>
  `En n'utilisant que des ordres de grandeur, donner, sous la forme d'une puissance de $10$, une estimation du nombre de fois ${fin}.`

/** Ligne de correction qui remplace un nombre par la puissance de 10 la plus proche */
const arrondi = (nb: NombreOdg, ecriture: string) => {
  const scientifique = ecrit(nb, nb.exposant)
  // un nombre écrit en notation décimale est d'abord écrit en notation scientifique
  const debut =
    ecriture === scientifique ? ecriture : `${ecriture}=${scientifique}`
  return `$${debut}\\approx${nb.exposantOdg > nb.exposant ? '10' : '1'}\\times10^{${nb.exposant}}=${puissanceDeDix(nb.exposantOdg)}$`
}

const quotientDesPuissances = (o1: number, o2: number, attendu: string) =>
  `Le rapport est donc environ $\\dfrac{${puissanceDeDix(o1)}}{${puissanceDeDix(o2)}}=10^{${o1}-${o2 < 0 ? `(${o2})` : o2}}=${miseEnEvidence(attendu)}$.`

/**
 * Rapport de deux grandeurs écrites en notation scientifique, exprimé par une puissance de 10 :
 * on remplace chaque valeur par la puissance de 10 la plus proche, puis on soustrait les exposants.
 * Les nombres sont choisis pour que le rapport exact s'arrondisse à la même puissance de 10,
 * sans ambiguïté (sa mantisse ne commence ni par 3, 4, 5, 6 ou 7). Les valeurs commencent par 1 ou 9,
 * pour inciter à choisir une puissance de 10.
 */
export default class OrdreDeGrandeurRapport extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierEntierementPersonnalisable
    this.optionsDeComparaison = { puissance: true }
  }

  nouvelleVersion() {
    const [a, b] = choice([
      [String(prenomF()), String(prenomM())],
      [String(prenomM()), String(prenomF())],
    ])
    const contexte = choice<Contexte | 'distance'>([...contextes, 'distance'])
    if (contexte === 'distance') {
      this.versionDistance(a, b)
      return
    }
    const { grand, petit, exposantRapport } = tireCouple(
      contexte.exposantsGrand,
      contexte.exposantsPetit,
    )
    const ecritureGrand = `${texNombre(grand.mantisse)}\\times10^{${grand.exposant}}`
    const ecriturePetit = petit.valeur.lt(contexte.petitDecimalSous ?? 0)
      ? texNombre(petit.valeur)
      : `${texNombre(petit.mantisse)}\\times10^{${petit.exposant}}`
    const attendu = puissanceDeDix(exposantRapport)
    this.question = `${contexte.enonce(a, b, ecritureGrand, ecriturePetit)}<br>${consigne(contexte.question(a, b))}`
    this.optionsChampTexte = champ
    this.reponse = attendu
    const o1 = grand.exposantOdg
    const o2 = petit.exposantOdg
    this.correction = `${contexte.enonce(a, b, ecritureGrand, ecriturePetit)}<br>
  Comme on veut un ordre de grandeur sous la forme d'une puissance de $10$, on remplace chaque valeur par la puissance de $10$ la plus proche :<br>
  ${arrondi(grand, ecritureGrand)}<br>
  ${arrondi(petit, ecriturePetit)}<br>
  ${contexte.approximation(a, b, puissanceDeDix(o1), puissanceDeDix(o2))}<br>
  ${quotientDesPuissances(o1, o2, attendu)}<br>
  ${contexte.conclusion(a, b, miseEnEvidence(attendu))}`
  }

  /**
   * Distances parcourues avec deux moyens de transport, écrites en km ou en m : il faut convertir
   * avant de comparer.
   */
  private versionDistance(a: string, b: string) {
    const [i, j] = choice([
      [0, 2],
      [0, 3],
      [1, 3],
    ])
    const [rapide, lent] = [transports[i], transports[j]]
    const { grand, petit, exposantRapport } = tireCouple(
      [rapide.exposant, rapide.exposant],
      [lent.exposant, lent.exposant],
    )
    const enMetres = lent.metres && choice([true, true, false])
    const ecritureGrand = ecrit(grand, grand.exposant)
    const ecritureKm = ecrit(petit, petit.exposant)
    const ecritureM = ecrit(petit, petit.exposant + 3)
    const enonce = `${a} a parcouru $${ecritureGrand}$ km ${rapide.nom} et ${b} a parcouru $${enMetres ? ecritureM : ecritureKm}$ ${enMetres ? 'm' : 'km'} ${lent.nom}.`
    const attendu = puissanceDeDix(exposantRapport)
    const o1 = grand.exposantOdg
    const o2 = petit.exposantOdg
    this.question = `${enonce}<br>${consigne(`où la distance parcourue par ${a} est plus grande que celle parcourue par ${b}`)}`
    this.optionsChampTexte = champ
    this.reponse = attendu
    this.correction = `${enonce}<br>
  ${enMetres ? `On convertit en kilomètres : $${ecritureM}\\text{ m}=${ecritureKm}\\text{ km}$.<br>` : ''}
  Comme on veut un ordre de grandeur sous la forme d'une puissance de $10$, on remplace chaque distance par la puissance de $10$ la plus proche :<br>
  ${arrondi(grand, ecritureGrand)}<br>
  ${arrondi(petit, ecritureKm)}<br>
  ${a} a parcouru environ $${puissanceDeDix(o1)}$ km et ${b} environ $${puissanceDeDix(o2)}$ km.<br>
  ${quotientDesPuissances(o1, o2, attendu)}<br>
  ${a} a parcouru une distance environ $${miseEnEvidence(attendu)}$ fois plus grande ${que(b)}.`
  }
}
