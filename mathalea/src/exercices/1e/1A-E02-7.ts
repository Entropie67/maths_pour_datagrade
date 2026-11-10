import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import ExerciceSimple from '../ExerciceSimple'

export const titre =
  'Retrouver une valeur initiale après une hausse ou une baisse en pourcentage'
export const dateDePublication = '21/10/2026'
export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCNum'

export const uuid = '2b751'

export const refs = {
  'fr-fr': ['1A-E02-7'],
  'fr-ch': ['10CTFA1E-10', '10LCFA1E-10', '10LSFA1E-10'],
}

/**
 * Valeur initiale à retrouver après une évolution en pourcentage.
 * Les taux ont des coefficients multiplicateurs « simples » (fraction p/q à petits termes)
 * et la valeur initiale est un nombre rond multiple de q : tout se calcule de tête.
 * @author Arnaud Meistermann
 */

type Sens = 'hausse' | 'baisse'

// Coefficient multiplicateur écrit sous forme de fraction irréductible p/q
const coefficients: Record<Sens, Record<number, [number, number]>> = {
  hausse: { 20: [6, 5], 25: [5, 4], 50: [3, 2] },
  baisse: { 20: [4, 5], 25: [3, 4], 50: [1, 2], 60: [2, 5] },
}

interface Situation {
  taux: Partial<Record<Sens, number[]>>
  min: number
  max: number
  unite: string
  /** Phrase(s) décrivant l'évolution et la valeur finale. */
  enonce: (sens: Sens, taux: string, valeurFinale: string) => string
  demande: string
  /** Groupe nominal désignant la valeur initiale, pour la correction. */
  valeurInitiale: string
  /** Phrase finale de la correction, avec la valeur initiale. */
  conclusion: (valeur: string) => string
}

const participe = (sens: Sens) => (sens === 'hausse' ? 'augmenté' : 'diminué')

const situations: Situation[] = [
  {
    taux: { baisse: [20, 25, 50, 60] },
    min: 40,
    max: 120,
    unite: 'euros',
    enonce: (_sens, taux, valeurFinale) =>
      `Pendant les soldes, le prix d'une paire de baskets baisse de $${taux}\\,\\%$. Elle coûte alors $${valeurFinale}$ euros.`,
    demande:
      'Déterminer le prix de cette paire de baskets avant les soldes, en euros.',
    valeurInitiale: 'le prix avant les soldes',
    conclusion: (v) =>
      `Avant les soldes, la paire de baskets coûtait $${v}$ euros.`,
  },
  {
    taux: { hausse: [20, 25, 50] },
    min: 400,
    max: 3000,
    unite: 'abonnés',
    enonce: (_sens, taux, valeurFinale) =>
      `En un an, le nombre d'abonnés d'une chaîne vidéo a augmenté de $${taux}\\,\\%$. La chaîne compte maintenant $${valeurFinale}$ abonnés.`,
    demande: "Déterminer le nombre d'abonnés de la chaîne il y a un an.",
    valeurInitiale: "le nombre d'abonnés il y a un an",
    conclusion: (v) => `Il y a un an, il y avait $${v}$ abonnés.`,
  },
  {
    taux: { hausse: [20, 25], baisse: [20, 25] },
    min: 400,
    max: 3000,
    unite: 'habitants',
    enonce: (sens, taux, valeurFinale) =>
      `Entre 2015 et 2025, la population d'un village a ${participe(sens)} de $${taux}\\,\\%$. En 2025, le village compte $${valeurFinale}$ habitants.`,
    demande: "Déterminer le nombre d'habitants de ce village en 2015.",
    valeurInitiale: "le nombre d'habitants en 2015",
    conclusion: (v) => `En 2015, il y avait $${v}$ habitants dans le village.`,
  },
  {
    taux: { hausse: [20, 25] },
    min: 400,
    max: 900,
    unite: 'euros',
    enonce: (_sens, taux, valeurFinale) =>
      `En cinq ans, le loyer mensuel d'un appartement a augmenté de $${taux}\\,\\%$. Il s'élève aujourd'hui à $${valeurFinale}$ euros.`,
    demande: 'Déterminer le loyer mensuel il y a cinq ans, en euros.',
    valeurInitiale: 'le loyer il y a cinq ans',
    conclusion: (v) =>
      `Il y a cinq ans, le loyer mensuel était de $${v}$ euros.`,
  },
  {
    taux: { baisse: [20, 25] },
    min: 2000,
    max: 6000,
    unite: 'kWh',
    enonce: (_sens, taux, valeurFinale) =>
      `Après des travaux d'isolation, la consommation annuelle d'électricité d'une maison a baissé de $${taux}\\,\\%$. Elle est maintenant de $${valeurFinale}$ kWh.`,
    demande:
      "Déterminer la consommation annuelle d'électricité de cette maison avant les travaux, en kWh.",
    valeurInitiale: 'la consommation avant les travaux',
    conclusion: (v) =>
      `Avant les travaux, la consommation annuelle était de $${v}$ kWh.`,
  },
  {
    taux: { hausse: [20, 25, 50], baisse: [20, 25, 50] },
    min: 1000,
    max: 9000,
    unite: 'visiteurs',
    enonce: (sens, taux, valeurFinale) =>
      `Le nombre de visiteurs d'un musée a ${participe(sens)} de $${taux}\\,\\%$ entre 2024 et 2025. En 2025, le musée a accueilli $${valeurFinale}$ visiteurs.`,
    demande: 'Déterminer le nombre de visiteurs de ce musée en 2024.',
    valeurInitiale: 'le nombre de visiteurs en 2024',
    conclusion: (v) => `En 2024, le musée avait accueilli $${v}$ visiteurs.`,
  },
  {
    taux: { hausse: [20, 25, 50], baisse: [20, 25, 50] },
    min: 40,
    max: 200,
    unite: 'licenciés',
    enonce: (sens, taux, valeurFinale) =>
      `En un an, le nombre de licenciés d'un club de handball a ${participe(sens)} de $${taux}\\,\\%$. Le club compte maintenant $${valeurFinale}$ licenciés.`,
    demande: 'Déterminer le nombre de licenciés de ce club il y a un an.',
    valeurInitiale: 'le nombre de licenciés il y a un an',
    conclusion: (v) => `Il y a un an, il y avait $${v}$ licenciés.`,
  },
  {
    taux: { hausse: [20, 25] },
    min: 800,
    max: 2000,
    unite: 'euros',
    enonce: (_sens, taux, valeurFinale) =>
      `Le prix d'un vélo électrique a augmenté de $${taux}\\,\\%$. Il coûte maintenant $${valeurFinale}$ euros.`,
    demande: "Déterminer le prix de ce vélo avant l'augmentation, en euros.",
    valeurInitiale: "le prix avant l'augmentation",
    conclusion: (v) => `Avant l'augmentation, le vélo coûtait $${v}$ euros.`,
  },
]

const chiffresRonds = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8]

/** Nombre entier « rond » : 1 ; 1,5 ; 2 ; 2,5 ; 3 ; 4 ; 5 ; 6 ou 8 fois une puissance de 10. */
const estRond = (x: number) => {
  for (let puissance = 1; puissance <= x; puissance *= 10) {
    if (chiffresRonds.some((chiffre) => chiffre * puissance === x)) return true
  }
  return false
}

/** Entier privé de ses zéros de fin : 360 → 36, 6 000 → 6. */
const sansZerosDeFin = (x: number) => {
  let n = x
  while (n % 10 === 0) n /= 10
  return n
}

/**
 * Le coefficient réciproque q/p est un décimal simple (0,8 ; 1,25 ; 2 ; 2,5)
 * quand p ne contient que des facteurs 2 et 5.
 */
const reciproqueDecimal = (p: number) => [1, 2, 4, 5].includes(p)

/**
 * Valeurs initiales de l'intervalle pour lesquelles le calcul se fait de tête :
 * - coefficient réciproque décimal : valeurs initiale et finale rondes (500 × 0,8 = 400) ;
 * - sinon on divise par le coefficient : la valeur initiale n'a qu'un chiffre significatif
 *   et la valeur finale, sans ses zéros, ne dépasse pas 60 (360 ÷ 1,2 = 300, mais pas 1 080 ÷ 1,2).
 */
const valeursInitialesPossibles = (
  min: number,
  max: number,
  [p, q]: [number, number],
) => {
  const valeurs: number[] = []
  for (let valeur = min; valeur <= max; valeur++) {
    if (valeur % q !== 0) continue
    const facile = reciproqueDecimal(p)
      ? estRond(valeur) && estRond((valeur / q) * p)
      : sansZerosDeFin(valeur) <= 9 && sansZerosDeFin((valeur / q) * p) <= 60
    if (facile) valeurs.push(valeur)
  }
  return valeurs
}

/** Arrondi au centième, pour comparer et afficher les distracteurs sans erreur de flottant. */
const arrondi = (x: number) => Math.round(x * 100) / 100

/** Vrai si x s'écrit avec au plus deux décimales. */
const auPlusDeuxDecimales = (x: number) =>
  Math.abs(x * 100 - Math.round(x * 100)) < 1e-9

/**
 * Détail de la division par le coefficient, sans calculatrice : on rend le dénominateur
 * entier puis on le fait apparaître au numérateur.
 * 480 ÷ 1,2 = 4 800/12 = (12 × 400)/12 = 400.
 */
const detailDivision = (valeurFinale: number, coefficient: number) => {
  // On multiplie numérateur et dénominateur par 10 ou 100 pour rendre le coefficient entier
  const facteur = Number.isInteger(Math.round(coefficient * 1000) / 100)
    ? 10
    : 100
  const numerateur = Math.round(valeurFinale * facteur)
  const denominateur = Math.round(coefficient * facteur)
  const resultat = texNombre(numerateur / denominateur, 0)
  return `\\dfrac{${texNombre(numerateur)}}{${denominateur}} = \\dfrac{${denominateur} \\times ${resultat}}{${denominateur}}`
}

export default class ValeurInitialeApresEvolution extends ExerciceSimple {
  private appliquerLesValeurs(
    situation: Situation,
    sens: Sens,
    taux: number,
    valeurInitiale: number,
  ): void {
    const [p, q] = coefficients[sens][taux]
    const signe = sens === 'hausse' ? 1 : -1
    const coefficient = 1 + (signe * taux) / 100
    const valeurFinale = (valeurInitiale / q) * p
    const unite = situation.unite

    this.question = `${situation.enonce(sens, String(taux), texNombre(valeurFinale))}<br>${situation.demande}`

    // Erreurs classiques : appliquer l'évolution contraire, réappliquer l'évolution,
    // diviser par le mauvais coefficient (ou, à défaut, ajouter/retirer le taux tel quel)
    const evolutionContraire = arrondi(
      valeurFinale * (1 - (signe * taux) / 100),
    )
    const evolutionReappliquee = arrondi(valeurFinale * coefficient)
    const divisionParLeMauvaisCoefficient =
      valeurFinale / (1 - (signe * taux) / 100)
    const troisiemeErreur = auPlusDeuxDecimales(divisionParLeMauvaisCoefficient)
      ? arrondi(divisionParLeMauvaisCoefficient)
      : valeurFinale - signe * taux
    const formate = (x: number) => `$${texNombre(x, 2)}$ ${unite}`
    // Un nombre de personnes non entier se repérerait tout de suite comme faux
    const denombrement = unite !== 'euros' && unite !== 'kWh'
    this.distracteurs = [
      ...new Set(
        [evolutionContraire, evolutionReappliquee, troisiemeErreur]
          .map((x) => (denombrement ? Math.round(x) : x))
          .filter((x) => x > 0 && x !== valeurInitiale),
      ),
    ].map(formate)

    const tauxTex = `${taux}\\,\\%`
    const coefficientTex = texNombre(coefficient, 2)
    const valeurFinaleTex = texNombre(valeurFinale)
    // Même rédaction que 1A-E05-1. On ne calcule pas l'inverse du coefficient (1/1,25 = 0,8
    // n'est pas évident pour les élèves) : on divise par le coefficient, en détaillant.
    this.correction = `Le coefficient multiplicateur associé à une ${sens === 'hausse' ? 'augmentation' : 'baisse'} de $${tauxTex}$ est $1${sens === 'hausse' ? '+' : '-'}${texNombre(taux / 100, 2)}=${coefficientTex}$.<br>
On note $V_I$ ${situation.valeurInitiale}. On cherche $V_I$ tel que : $V_I \\times ${coefficientTex} = ${valeurFinaleTex}$, soit :<br>
$V_I = \\dfrac{${valeurFinaleTex}}{${coefficientTex}} = ${detailDivision(valeurFinale, coefficient)} = ${miseEnEvidence(texNombre(valeurInitiale))}$.<br>
${situation.conclusion(texNombre(valeurInitiale))}`

    this.reponse = this.versionQcm ? formate(valeurInitiale) : valeurInitiale
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.canEnonce = this.question
    this.canReponseACompleter = `$\\ldots$ ${unite}`
  }

  versionAleatoire = () => {
    for (let compteur = 0; compteur < 50; compteur++) {
      const situation = choice(situations)
      // Seuls les taux qui admettent au moins une valeur ronde dans l'intervalle sont retenus
      const tirages = (Object.keys(situation.taux) as Sens[]).flatMap((sens) =>
        (situation.taux[sens] ?? []).flatMap((taux) => {
          const valeurs = valeursInitialesPossibles(
            situation.min,
            situation.max,
            coefficients[sens][taux],
          )
          return valeurs.length > 0 ? [{ sens, taux, valeurs }] : []
        }),
      )
      const { sens, taux, valeurs } = choice(tirages)
      this.appliquerLesValeurs(situation, sens, taux, choice(valeurs))
      // En QCM, il faut trois distracteurs distincts
      if (this.distracteurs.length === 3) return
    }
  }

  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    // Les fractions de la dernière ligne de la correction sont hautes
    this.spacingCorr = 2
    this.formatChampTexte = KeyboardType.clavierDeBase
    // On attend le résultat, pas le calcul (« 480/1,2 » est refusé pour 400)
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcmDisponible = true
    this.versionQcm = false
    this.versionQcmOptions = { radio: true, compact: true }
  }

  nouvelleVersion(): void {
    this.versionAleatoire()
  }
}
