import Decimal from 'decimal.js'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import ExerciceSimple from '../ExerciceSimple'
export const dateDePublication = '20/02/2026'
export const dateDeModifImportante = '30/09/2026'
export const uuid = '8b391'

export const refs = {
  'fr-fr': ['1A-C07-5', '2A-N7-5'],
  'fr-ch': ['9R1GM4C-5', '9R2GM4C-5', '9R3GM4C-5'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre = "Calculer l'aire d'un carré avec une conversion d'unité"

type Couple = {
  uniteCote: string
  uniteAire: string
  facteur: number
  cotes: number[]
}

const de1a9 = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const de1a5 = [1, 2, 3, 4, 5]
const dizaines = [10, 20, 30, 40, 50, 60, 70, 80, 90]
const centaines = [100, 200, 300, 400, 500]

const couplesUnites: Couple[] = [
  // Vers une unité plus petite (facteur > 1) — résultats entiers
  { uniteCote: 'km', uniteAire: 'm', facteur: 1000, cotes: de1a5 },
  { uniteCote: 'm', uniteAire: 'dm', facteur: 10, cotes: de1a9 },
  { uniteCote: 'm', uniteAire: 'cm', facteur: 100, cotes: de1a5 },
  { uniteCote: 'dm', uniteAire: 'cm', facteur: 10, cotes: de1a9 },
  { uniteCote: 'dm', uniteAire: 'mm', facteur: 100, cotes: de1a5 },
  { uniteCote: 'cm', uniteAire: 'mm', facteur: 10, cotes: de1a9 },

  // Vers une unité plus grande avec résultats entiers (multiples du facteur inverse)
  { uniteCote: 'm', uniteAire: 'dam', facteur: 0.1, cotes: dizaines },
  { uniteCote: 'm', uniteAire: 'hm', facteur: 0.01, cotes: centaines },
  {
    uniteCote: 'm',
    uniteAire: 'km',
    facteur: 0.001,
    cotes: [1000, 2000, 3000, 4000, 5000],
  },
  { uniteCote: 'cm', uniteAire: 'dm', facteur: 0.1, cotes: dizaines },
  { uniteCote: 'cm', uniteAire: 'm', facteur: 0.01, cotes: centaines },
  { uniteCote: 'mm', uniteAire: 'cm', facteur: 0.1, cotes: dizaines },
  { uniteCote: 'mm', uniteAire: 'dm', facteur: 0.01, cotes: centaines },
  { uniteCote: 'dm', uniteAire: 'm', facteur: 0.1, cotes: dizaines },

  // Vers une unité plus grande avec résultats décimaux (côtés NON multiples)
  // On limite à 4 décimales max pour l'aire → facteur ≥ 0.01 avec côtés ≤ 9
  { uniteCote: 'cm', uniteAire: 'm', facteur: 0.01, cotes: de1a9 }, // ex : 3 cm = 0,03 m → aire = 0,0009 m² (4 déc)
  { uniteCote: 'cm', uniteAire: 'dm', facteur: 0.1, cotes: de1a9 }, // ex : 3 cm = 0,3 dm → aire = 0,09 dm² (2 déc)
  { uniteCote: 'mm', uniteAire: 'cm', facteur: 0.1, cotes: de1a9 }, // ex : 5 mm = 0,5 cm → aire = 0,25 cm² (2 déc)
  { uniteCote: 'dm', uniteAire: 'm', facteur: 0.1, cotes: de1a9 }, // ex : 7 dm = 0,7 m → aire = 0,49 m² (2 déc)
  { uniteCote: 'm', uniteAire: 'dam', facteur: 0.1, cotes: de1a9 }, // ex : 3 m = 0,3 dam → aire = 0,09 dam² (2 déc)
  { uniteCote: 'm', uniteAire: 'hm', facteur: 0.01, cotes: de1a9 }, // ex : 5 m = 0,05 hm → aire = 0,0025 hm² (4 déc)
]

export default class auto1AC7e extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcmDisponible = true
    this.versionQcm = false
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = true

    const { uniteCote, uniteAire, facteur, cotes } = this.quotaChoice(
      'couple',
      couplesUnites,
    )
    const cote = new Decimal(choice(cotes))
    const coteConverti = cote.mul(facteur)
    const aire = coteConverti.mul(coteConverti)

    this.correction = `$${texNombre(cote)}\\text{ ${uniteCote}} = ${texNombre(coteConverti)}\\text{ ${uniteAire}}$<br>
L'aire du carré est : $${texNombre(coteConverti)} \\text{ ${uniteAire}}\\times ${texNombre(coteConverti)} \\text{ ${uniteAire}} = `
    this.correction += this.versionQcm
      ? `${miseEnEvidence(texNombre(aire))}$ ${texteEnCouleurEtGras(`${uniteAire}$^2$`)}.`
      : `${miseEnEvidence(texNombre(aire))}\\text{ ${uniteAire}}^2$.`

    const enonce = `l'aire en $\\text{${uniteAire}}^2$ d'un carré de côté $${texNombre(cote)}$ $\\text{${uniteCote}}$`
    if (this.versionQcm) {
      this.question = `${enonce.charAt(0).toUpperCase()}${enonce.slice(1)} est égale à :`
      const avecUnite = (valeur: Decimal) =>
        `$${texNombre(valeur)}$ $\\text{${uniteAire}}^2$`
      this.reponse = avecUnite(aire)
      this.distracteurs = [
        cote.mul(cote), // Oubli de convertir : côté² dans l'unité d'origine
        cote.mul(cote).mul(facteur), // Convertir l'aire comme une longueur (× facteur au lieu de × facteur²)
        coteConverti, // Côté converti sans élever au carré
        coteConverti.mul(4), // Périmètre converti au lieu de l'aire
        cote.mul(facteur).mul(facteur), // côté × facteur² sans élever le côté au carré
        cote.mul(cote).div(facteur), // Division au lieu de multiplication
      ].map(avecUnite)
    } else {
      this.question = `Calculer l'aire, en $\\text{${uniteAire}}^2$, d'un carré de côté $${texNombre(cote)}$ $\\text{${uniteCote}}$.`
      this.optionsChampTexte = {
        texteAvant: "<br>L'aire du carré est ",
        texteApres: `$\\text{${uniteAire}}^2$.`,
      }
      this.reponse = aire
    }
  }
}
