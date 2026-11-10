import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceSimple from '../ExerciceSimple'

export const titre = "Calculer la proportion d'une partie restante"
export const dateDePublication = '15/07/2026'
export const dateDeModifImportante = '06/10/2026'

export const uuid = '665eb'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': ['1A-R01-9', '2A-R1-9'],
  'fr-ch': ['10CTFA1D-12', '10LCFA1D-12', '10LSFA1D-12'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

type Contexte = {
  introduction: (total: number) => string
  categories: [string, string, string]
  ensemble: string
}

type Donnees = {
  total: number
  contexte: Contexte
  indiceEffectif: number
  indiceFraction: number
  indiceDemande: number
  proportionEffectif: FractionEtendue
  proportionDonnee: FractionEtendue
}

function ajouteFractionUnique(
  propositions: string[],
  fraction: FractionEtendue,
): void {
  if (fraction.valeurDecimale <= 0 || fraction.valeurDecimale >= 1) return
  const proposition = `$${fraction.texFractionSimplifiee}$`
  if (!propositions.includes(proposition)) propositions.push(proposition)
}

function deCategorie(categorie: string): string {
  return categorie === 'employés' ? "d'employés" : `de ${categorie}`
}

export default class ProportionPartieRestante extends ExerciceSimple {
  private appliquerLesValeurs({
    total,
    contexte,
    indiceEffectif,
    indiceFraction,
    indiceDemande,
    proportionEffectif,
    proportionDonnee,
  }: Donnees): void {
    const categorieEffectif = contexte.categories[indiceEffectif]
    const categorieFraction = contexte.categories[indiceFraction]
    const categorieDemandee = contexte.categories[indiceDemande]
    const effectif = (total * proportionEffectif.num) / proportionEffectif.den
    const proportionDemandee = new FractionEtendue(1, 1)
      .differenceFraction(proportionEffectif)
      .differenceFraction(proportionDonnee)

    const propositions: string[] = []
    ajouteFractionUnique(propositions, proportionDemandee)
    ajouteFractionUnique(propositions, proportionEffectif)
    ajouteFractionUnique(propositions, proportionDonnee)
    ajouteFractionUnique(
      propositions,
      new FractionEtendue(1, 1).differenceFraction(proportionEffectif),
    )
    ajouteFractionUnique(
      propositions,
      new FractionEtendue(1, 1).differenceFraction(proportionDonnee),
    )
    for (const ecart of [1, -1, 2, -2, 3, -3]) {
      ajouteFractionUnique(
        propositions,
        new FractionEtendue(
          proportionDemandee.num + ecart,
          proportionDemandee.den,
        ),
      )
      if (propositions.length >= 4) break
    }

    this.question = `${contexte.introduction(total)}<br>
    On compte $${effectif}$ ${categorieEffectif}.<br>
    La proportion ${deCategorie(categorieFraction)} est égale à $${proportionDonnee.texFractionSimplifiee}$.<br>`
    this.question += this.versionQcm
      ? `La proportion ${deCategorie(categorieDemandee)} dans ${contexte.ensemble} est égale à :`
      : `Quelle est la proportion ${deCategorie(categorieDemandee)} dans ${contexte.ensemble} ?`

    this.correction = `La proportion ${deCategorie(categorieEffectif)} est :
    $\\dfrac{${effectif}}{${total}}=${proportionEffectif.texFractionSimplifiee}$.<br>
    Les trois catégories forment ${contexte.ensemble}. La somme de leurs proportions est donc égale à $1$.<br>
    La proportion ${deCategorie(categorieDemandee)} est alors :
    $1-${proportionEffectif.texFractionSimplifiee}-${proportionDonnee.texFractionSimplifiee}=${miseEnEvidence(proportionDemandee.texFractionSimplifiee)}$.`

    this.reponse = this.versionQcm
      ? `$${proportionDemandee.texFractionSimplifiee}$`
      : proportionDemandee.texFractionSimplifiee
    this.distracteurs = propositions.slice(1, 4)
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.canEnonce = this.question
    this.canReponseACompleter = '$\\ldots$'
  }

  nouvelleVersion(): void {
    const contexte = choice<Contexte>([
      {
        introduction: (total) =>
          `Une entreprise de $${total}$ salariés est composée d'employés, de techniciens et de cadres.`,
        categories: ['employés', 'techniciens', 'cadres'],
        ensemble: "l'entreprise",
      },
      {
        introduction: (total) =>
          `Un club de padel compte $${total}$ joueurs, répartis en trois groupes selon leur niveau.`,
        categories: [
          'joueurs de niveau $3$ ou moins',
          'joueurs de niveau $4$ ou $5$',
          'joueurs de niveau $6$ ou plus',
        ],
        ensemble: 'le club',
      },
      {
        introduction: (total) =>
          `Lors d'un examen noté sur $20$, les $${total}$ candidats sont répartis en trois groupes selon leur note.`,
        categories: [
          'candidats ayant obtenu une note strictement inférieure à $8$',
          'candidats ayant obtenu une note comprise entre $8$ et $12$',
          'candidats ayant obtenu une note strictement supérieure à $12$',
        ],
        ensemble: "l'ensemble des candidats",
      },
    ])
    const [indiceEffectif, indiceFraction, indiceDemande] = choice([
      [0, 1, 2],
      [0, 2, 1],
      [1, 0, 2],
      [1, 2, 0],
      [2, 0, 1],
      [2, 1, 0],
    ])
    const total = choice([100, 120, 160, 200, 240, 300, 400])
    const numerateurEffectif = choice([2, 3, 4, 5, 6, 7])
    const numerateurDonne = choice(
      [4, 5, 6, 8, 10, 12].filter(
        (numerateur) => numerateur + numerateurEffectif <= 17,
      ),
    )

    this.appliquerLesValeurs({
      total,
      contexte,
      indiceEffectif,
      indiceFraction,
      indiceDemande,
      proportionEffectif: new FractionEtendue(numerateurEffectif, 20),
      proportionDonnee: new FractionEtendue(numerateurDonne, 20),
    })
  }

  constructor() {
    super()
    this.optionsDeComparaison = {
      fractionEgale: true,
      nombreDecimalSeulement: true,
    }
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.versionQcmDisponible = true
    this.versionQcm = false
  }
}
