// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 7b84f continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
// Version publiée jusqu'au 06/10/2026 (commit 4fd5a93fe).
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import ExerciceQcmA from '../ExerciceQcmA'

export const titre = "Calculer le pourcentage d'une partie restante"
export const dateDePublication = '09/07/2026'
export const uuid = '7b84f'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

type Categorie = 'cadres' | 'techniciens' | 'employés'

type Donnees = {
  total: number
  categorieEffectif: Categorie
  categorieFraction: Categorie
  categorieDemandee: Categorie
  pourcentageEffectif: number
  fraction: FractionEtendue
  pourcentageFraction: number
}

function formatPourcentage(pourcentage: number): string {
  return `${texNombre(pourcentage, 0)}\\,\\%`
}

function ajoutePourcentageUnique(
  propositions: string[],
  pourcentage: number,
): void {
  const proposition = `$${formatPourcentage(pourcentage)}$`
  if (
    pourcentage >= 0 &&
    pourcentage <= 100 &&
    !propositions.includes(proposition)
  ) {
    propositions.push(proposition)
  }
}

function completePropositions(
  propositions: string[],
  bonneReponse: number,
): string[] {
  const complements = [
    bonneReponse + 5,
    bonneReponse - 5,
    bonneReponse + 10,
    bonneReponse - 10,
    50,
    25,
    75,
    20,
    80,
  ]
  for (const pourcentage of complements) {
    ajoutePourcentageUnique(propositions, pourcentage)
    if (propositions.length >= 4) break
  }
  return propositions.slice(0, 4)
}

export default class PourcentagePartieRestanteOld extends ExerciceQcmA {
  private appliquerLesValeurs({
    total,
    categorieEffectif,
    categorieFraction,
    categorieDemandee,
    pourcentageEffectif,
    fraction,
    pourcentageFraction,
  }: Donnees): void {
    const effectif = (total * pourcentageEffectif) / 100
    const pourcentageDemande = 100 - pourcentageEffectif - pourcentageFraction
    const effectifDemandee = (total * pourcentageDemande) / 100

    const propositions: string[] = []
    ajoutePourcentageUnique(propositions, pourcentageDemande)
    ajoutePourcentageUnique(propositions, pourcentageEffectif)
    ajoutePourcentageUnique(propositions, pourcentageFraction)
    ajoutePourcentageUnique(propositions, 100 - pourcentageEffectif)
    ajoutePourcentageUnique(propositions, 100 - pourcentageFraction)
    ajoutePourcentageUnique(propositions, effectif)

    this.enonce = `Une entreprise de $${total}$ salariés est composée de cadres, de techniciens et d'employés.<br>
    On compte $${effectif}$ ${categorieEffectif}.<br>
    La proportion ${categorieFraction[0] === 'e' ? `d'${categorieFraction}` : `de ${categorieFraction}`} est égale à $${fraction.texFraction}$.<br><br>
    Le pourcentage ${categorieDemandee[0] === 'e' ? `d'${categorieDemandee}` : `de ${categorieDemandee}`} parmi les salariés de l'entreprise est égal à :`

    this.correction = `La proportion ${categorieEffectif[0] === 'e' ? `d'${categorieEffectif}` : `de ${categorieEffectif}`} est égale à :
    $\\dfrac{${effectif}}{${total}}=\\dfrac{${pourcentageEffectif}}{100}=${formatPourcentage(pourcentageEffectif)}$.<br>
    La proportion ${categorieFraction[0] === 'e' ? `d'${categorieFraction}` : `de ${categorieFraction}`} est égale à $${fraction.texFraction}$, c'est-à-dire $${formatPourcentage(pourcentageFraction)}$.<br>
    Les trois catégories forment l'ensemble des salariés, donc la proportion de ${categorieDemandee} est :
    $100\\,\\%-${formatPourcentage(pourcentageEffectif)}-${formatPourcentage(pourcentageFraction)}=${formatPourcentage(pourcentageDemande)}$.<br>
    Donc $${miseEnEvidence(formatPourcentage(pourcentageDemande))}$ des salariés sont des ${categorieDemandee}.`

    this.reponses = completePropositions(propositions, pourcentageDemande)
  }

  versionAleatoire = (): void => {
    const categories: Categorie[] = ['cadres', 'techniciens', 'employés']
    const [categorieEffectif, categorieFraction, categorieDemandee] = choice([
      categories,
      [categories[0], categories[2], categories[1]],
      [categories[1], categories[0], categories[2]],
      [categories[1], categories[2], categories[0]],
      [categories[2], categories[0], categories[1]],
      [categories[2], categories[1], categories[0]],
    ])

    const total = choice([200, 300, 400, 500, 600, 800, 1000])
    const fractions = [
      { fraction: new FractionEtendue(1, 4), pourcentage: 25 },
      { fraction: new FractionEtendue(2, 5), pourcentage: 40 },
      { fraction: new FractionEtendue(1, 2), pourcentage: 50 },
      { fraction: new FractionEtendue(3, 5), pourcentage: 60 },
      { fraction: new FractionEtendue(3, 4), pourcentage: 75 },
      { fraction: new FractionEtendue(4, 5), pourcentage: 80 },
    ]
    const pourcentageEffectif = choice([5, 10, 15, 20, 25, 30])
    const fractionsPossibles = fractions.filter(
      ({ pourcentage }) => pourcentage + pourcentageEffectif <= 90,
    )
    const { fraction, pourcentage: pourcentageFraction } =
      choice(fractionsPossibles)

    this.appliquerLesValeurs({
      total,
      categorieEffectif,
      categorieFraction,
      categorieDemandee,
      pourcentageEffectif,
      fraction,
      pourcentageFraction,
    })
  }

  constructor() {
    super()
    this.besoinFormulaireCaseACocher = false
    this.versionAleatoire()
  }
}
